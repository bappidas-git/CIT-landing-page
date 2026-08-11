<?php
/* ============================================
   Lead Storage API
   Server-side shared storage for leads so the
   admin panel can see leads submitted from any
   browser/device (localStorage is per-device).

   Endpoints (all on this single file):
     POST /api/leads.php?action=create
       Body: { "lead": {...} }
       Public — no auth required. Called by
       webhookSubmit.js. Hardened with a field
       whitelist, server-side validation, honeypot,
       time-trap, suspicious-number flagging and
       per-IP rate limiting. Requests carrying a
       valid X-Admin-Key header (admin CSV import)
       are trusted and skip the anti-bot checks.
       Re-submissions MERGE into the stored lead
       (upsert by lead_id; silent duplicate merge
       by mobile) instead of being rejected.
       Answers {"success":true,"login_key":"..."} —
       apply-funnel leads get a real, server-assigned
       test key (see "Test login keys" below); every
       other path gets an unpersisted decoy so the
       response shape reveals nothing.

     GET  /api/leads.php?action=list
       Header: X-Admin-Key: <ADMIN_API_KEY>
       Returns all stored leads. Used by the admin
       panel to populate/refresh its LMS.

     POST /api/leads.php?action=update
       Header: X-Admin-Key
       Body: { "lead_id": "...", "patch": {...} }
       Merges patch into the lead. Used for status /
       note / activity updates from the admin panel.

     POST /api/leads.php?action=delete
       Header: X-Admin-Key
       Body: { "lead_ids": ["..."] }
       Removes leads by id.

   Storage: a JSON file at api/data/leads.json,
   plus api/data/login_keys.json (the test-key
   ledger). The data/ folder is created on first
   use and protected with a .htaccess "Deny from
   all".
   ============================================ */

header('Content-Type: application/json');
// Lead data is per-request and never public: no proxy, CDN or browser may keep
// a copy. Without this a Varnish layer in front of the app can serve one
// admin's list response to the next caller.
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----- Storage paths -----
$dataDir     = __DIR__ . '/data';
$dataFile    = $dataDir . '/leads.json';
$rateFile    = $dataDir . '/ratelimit.json';
$keyPoolFile = $dataDir . '/login_keys.json';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . '/.htaccess', "Require all denied\nDeny from all\n");
    @file_put_contents($dataDir . '/index.html', '');
}

// ----- Resolve the admin key used to gate list/update/delete -----
//
// SECURITY — OPERATOR ACTION REQUIRED:
// There is intentionally NO committed fallback key. A default key that ships
// in the repository is public knowledge, so it cannot gate anything. Until a
// key is configured, list/update/delete answer 503 (see require_admin_auth)
// and create requests are all treated as untrusted public traffic.
//
// Set a fresh key in BOTH places together, then redeploy:
//   1. api/config.php — define('ADMIN_API_KEY', '<long random string>');
//      (copy config.example.php; generate with e.g. `openssl rand -hex 32`)
//   2. .env — REACT_APP_LEADS_ADMIN_KEY=<same value>, then rebuild the React
//      app so the admin panel sends the matching X-Admin-Key header.
// If this deployment ever ran with the previously committed default key,
// treat that value as compromised and rotate both sides to a new key now.
//
// Resolution order (first non-empty wins):
//   1. ADMIN_API_KEY defined in config.php.
//   2. LEADS_ADMIN_KEY / ADMIN_API_KEY environment variable (e.g. set in the
//      Cloudways application settings).
$adminKey   = '';
$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
    require_once $configFile;
    if (defined('ADMIN_API_KEY')) {
        $adminKey = ADMIN_API_KEY;
    }
}
if ($adminKey === '') {
    $envKey = getenv('LEADS_ADMIN_KEY');
    if (!$envKey) {
        $envKey = getenv('ADMIN_API_KEY');
    }
    if ($envKey) {
        $adminKey = $envKey;
    }
}

// ----- Meta lead-quality feedback -----
// send_capi_feedback() pushes telecaller verdicts (status changes) back to
// Meta as server-side conversions. It no-ops silently when Meta credentials
// are absent and can never fail a save — see capi-feedback.php.
require_once __DIR__ . '/capi-feedback.php';

// ----- Anti-bot tuning (optional config.php overrides, sane defaults) -----
$rateLimitMax    = defined('LEADS_RATE_LIMIT_MAX') ? max(1, (int) LEADS_RATE_LIMIT_MAX) : 5;        // creates per IP per window
$rateLimitWindow = defined('LEADS_RATE_LIMIT_WINDOW') ? max(60, (int) LEADS_RATE_LIMIT_WINDOW) : 3600; // window in seconds
$minFormSeconds  = defined('LEADS_MIN_FORM_SECONDS') ? max(0, (int) LEADS_MIN_FORM_SECONDS) : 15;   // time-trap threshold

// ----- Helpers -----
function load_leads($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function save_leads($file, $leads) {
    $fp = fopen($file, 'c+');
    if (!$fp) return false;
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($leads, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// Union-merge two append-only arrays (notes or activity) coming from different
// devices, de-duping by a stable key and sorting chronologically. This is what
// keeps notes and the activity timeline in sync: each admin device mirrors its
// own (possibly stale) full array, so a plain overwrite would let one device
// drop entries another device added. Merging instead accumulates every entry.
function merge_lead_array($existing, $incoming, $type) {
    $existing = is_array($existing) ? $existing : [];
    $incoming = is_array($incoming) ? $incoming : [];
    $byKey = [];
    foreach (array_merge($existing, $incoming) as $item) {
        if (!is_array($item)) continue;
        if ($type === 'notes') {
            $key = (isset($item['id']) && $item['id'] !== '')
                ? 'id:' . $item['id']
                : 't:' . ($item['timestamp'] ?? '') . '|' . ($item['text'] ?? '');
        } else {
            $key = ($item['timestamp'] ?? '') . '|' . ($item['action'] ?? '');
        }
        if (!isset($byKey[$key])) {
            $byKey[$key] = $item;
        }
    }
    $result = array_values($byKey);
    // ISO 8601 timestamps sort correctly as plain strings.
    usort($result, function ($a, $b) {
        return strcmp($a['timestamp'] ?? '', $b['timestamp'] ?? '');
    });
    return $result;
}

function require_admin_auth($expected) {
    if (empty($expected)) {
        http_response_code(503);
        echo json_encode(['error' => 'Admin API key not configured on server']);
        exit;
    }
    $provided = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
    if (!is_string($provided) || !hash_equals($expected, $provided)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

// ISO-8601 UTC timestamp in the same shape the client writes
// (JS Date.toISOString()), so string-sorted activity stays chronological.
function now_iso() {
    return gmdate('Y-m-d\TH:i:s') . '.000Z';
}

/* ----- Test login keys -----
   Every /apply-funnel lead earns one unique key (CIT26-XXXXX). It is the sole
   credential for the online merit test, so it is authored HERE and never
   accepted from the client: `login_key` is deliberately absent from
   lead_field_whitelist(), which silently drops any value an attacker injects.

   The key lives in two places on purpose. The lead record is authoritative —
   that is what the test platform looks a key up in — while login_keys.json is
   a ledger that guarantees uniqueness and lets us see what has been handed
   out. Nothing here may ever fail a lead capture: if the ledger cannot be
   read or written, the applicant still gets a working key. */

// 5 chars from a 32-char alphabet ≈ 33.5M combinations. 0/O and 1/I are
// excluded so a telecaller can read a key out over a bad line without it being
// mis-typed at the other end.
function generate_login_key() {
    $charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    $max     = strlen($charset) - 1;
    $key     = '';
    for ($i = 0; $i < 5; $i++) {
        $key .= $charset[random_int(0, $max)];
    }
    return 'CIT26-' . $key;
}

function load_key_pool($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function save_key_pool($file, $pool) {
    // Same exclusive-lock + truncate/rewrite pattern as save_leads().
    $fp = @fopen($file, 'c+');
    if (!$fp) return false;
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($pool), JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// Build $count fresh unassigned entries whose keys collide neither with each
// other nor with anything already in $pool.
function build_key_pool_entries($count, $pool) {
    $taken = [];
    foreach ($pool as $entry) {
        if (is_array($entry) && isset($entry['key'])) {
            $taken[(string) $entry['key']] = true;
        }
    }
    $entries  = [];
    $attempts = 0;
    // Collisions against a few hundred keys out of 33.5M are vanishingly rare,
    // but the attempt cap means a degenerate RNG can never spin here forever
    // while an applicant waits on the submit.
    $maxAttempts = $count * 50;
    while (count($entries) < $count && $attempts < $maxAttempts) {
        $attempts++;
        $key = generate_login_key();
        if (isset($taken[$key])) continue;
        $taken[$key] = true;
        $entries[]   = ['key' => $key, 'lead_id' => null, 'assigned_at' => null];
    }
    return $entries;
}

// Bootstrap the ledger with 100 unassigned keys on first use. The name is
// claimed with fopen 'x', which fails if the file already exists, so two
// simultaneous first-ever creates cannot both seed; the content then goes in
// through save_key_pool() so every write to this file is lock-protected.
function seed_key_pool_if_missing($file) {
    if (file_exists($file)) return load_key_pool($file);
    $fp = @fopen($file, 'x');
    if (!$fp) return load_key_pool($file); // lost the race — read what won
    fclose($fp);
    $pool = build_key_pool_entries(100, []);
    save_key_pool($file, $pool);
    return $pool;
}

// Claim the next free key for $leadId and return it. The read-modify-write
// runs under one exclusive lock so two concurrent applicants can never be
// handed the same key.
function assign_login_key($file, $leadId) {
    seed_key_pool_if_missing($file);

    $fp = @fopen($file, 'c+');
    if (!$fp) return generate_login_key();
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        // Ledger unavailable. The key still gets written onto the lead record,
        // which is what the test platform authenticates against, so the
        // applicant is unaffected — only the ledger misses this entry.
        return generate_login_key();
    }

    $raw  = stream_get_contents($fp);
    $pool = json_decode($raw ?: '[]', true);
    if (!is_array($pool)) $pool = [];

    // Seeding is repeated in-memory here rather than by calling
    // seed_key_pool_if_missing() again: a second flock on the file we already
    // hold would deadlock against ourselves. This covers a torn or truncated
    // ledger as well as one the seed above could not create.
    if (count($pool) === 0) {
        $pool = build_key_pool_entries(100, []);
    }

    $assigned = '';
    foreach ($pool as $i => $entry) {
        if (!is_array($entry) || !isset($entry['key'])) continue;
        if (isset($entry['lead_id']) && $entry['lead_id'] !== null) continue;
        $pool[$i]['lead_id']     = $leadId;
        $pool[$i]['assigned_at'] = now_iso();
        $assigned = (string) $entry['key'];
        break;
    }

    // Pool exhausted — extend instead of failing. A campaign that outruns the
    // seeded keys is a good problem, and it must never cost us an applicant.
    if ($assigned === '') {
        $fresh = build_key_pool_entries(50, $pool);
        if (count($fresh) > 0) {
            $fresh[0]['lead_id']     = $leadId;
            $fresh[0]['assigned_at'] = now_iso();
            $assigned = (string) $fresh[0]['key'];
            $pool     = array_merge($pool, $fresh);
        }
    }

    if ($assigned === '') {
        flock($fp, LOCK_UN);
        fclose($fp);
        return generate_login_key();
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($pool), JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $assigned;
}

// A throwaway key for the paths that must answer like a stored lead without
// being one (rate-limited, spam-tiered, non-funnel). Never written to the
// ledger or to a lead, so it opens nothing — a bot learns only that keys exist.
function decoy_login_key() {
    return generate_login_key();
}

// Only the /apply funnel sits the merit test. Drawer enquiries, admin CSV
// imports and legacy creates must not consume a key.
function is_key_eligible_lead($lead) {
    $tier = (isset($lead['lead_tier']) && is_string($lead['lead_tier'])) ? $lead['lead_tier'] : '';
    return $tier === 'partial' || $tier === 'application';
}

// Return the key already on a lead, or claim one for it when it qualifies and
// has none yet. Takes the lead by reference so the caller's array is stamped
// with both the key and the activity entry the telecaller sees. Returns '' for
// a lead that is not part of the test funnel.
function ensure_login_key(&$lead, $file, $eligible) {
    $existingKey = (isset($lead['login_key']) && is_string($lead['login_key'])) ? trim($lead['login_key']) : '';
    if ($existingKey !== '') return $existingKey;
    if (!$eligible) return '';

    $key = assign_login_key($file, (string) ($lead['lead_id'] ?? ''));
    $lead['login_key'] = $key;
    $lead['activity']  = merge_lead_array($lead['activity'] ?? [], [[
        'action'    => 'Test login key assigned',
        'status'    => $lead['status'] ?? 'new',
        'timestamp' => now_iso(),
    ]], 'activity');
    return $key;
}

// Every create answers with the same shape, so nothing about the response
// tells a bot whether its payload was stored, merged or silently discarded.
function respond_created($loginKey) {
    echo json_encode([
        'success'   => true,
        'login_key' => ($loginKey !== '' ? $loginKey : decoy_login_key()),
    ]);
    exit;
}

// Known lead keys: the existing enquiry/admin keys (which also cover every
// column of previously exported CSVs) plus the canonical new-field schema
// from update-prompts/README.md. Anything else POSTed to create is dropped.
function lead_field_whitelist() {
    return [
        // Existing enquiry-form + admin keys (incl. exported-CSV columns)
        'lead_id', 'name', 'mobile', 'email', 'service_interest', 'state',
        'message', 'source', 'status', 'submitted_at', 'updated_at',
        'page_url', 'user_agent', 'utm_source', 'utm_medium', 'utm_campaign',
        'utm_term', 'utm_content', 'gclid', 'notes', 'activity',
        'conversion_value', 'conversion_type', 'converted_at',
        // Canonical new-field schema (application funnel)
        'lead_tier', 'intake_year', 'whatsapp_confirmed', 'twelfth_status',
        'twelfth_board', 'twelfth_school', 'twelfth_subjects', 'expected_band',
        'eligibility_percent', 'eligibility_met', 'tenth_school', 'tenth_year',
        'tenth_percent', 'filled_by', 'parent_name', 'parent_mobile',
        'funding_plan', 'country', 'district', 'counselling_mode', 'admission_timeline',
        'best_time', 'fbclid', 'fbp', 'fbc', 'form_started_at',
        'application_completed_at',
        // Merit-program fields (prompt series new-refinement-prompts)
        'fee_affordability', 'branch_pref_1', 'branch_pref_2',
    ];
}

// Cap every string at 500 chars and recurse into arrays so nested values
// (notes/activity/twelfth_subjects entries) obey the same limits.
function sanitize_lead_value($value, $depth = 0) {
    if (is_string($value)) {
        return function_exists('mb_substr') ? mb_substr($value, 0, 500) : substr($value, 0, 500);
    }
    if (is_array($value)) {
        if ($depth >= 3) return [];
        $out = [];
        $count = 0;
        foreach ($value as $k => $v) {
            if (++$count > 100) break; // hard cap on any array payload
            $out[$k] = sanitize_lead_value($v, $depth + 1);
        }
        return $out;
    }
    // int / float / bool / null pass through untouched
    return $value;
}

// Keep only whitelisted keys with sane shapes/lengths. `website` (the
// honeypot) is deliberately absent from the whitelist so it is never stored.
function whitelist_lead($lead) {
    $allowed = array_flip(lead_field_whitelist());
    $clean = [];
    foreach ($lead as $k => $v) {
        if (!is_string($k) || !isset($allowed[$k])) continue; // drop unknown keys
        if (($k === 'notes' || $k === 'activity' || $k === 'twelfth_subjects') && !is_array($v)) {
            continue; // array-shaped fields must be arrays
        }
        $clean[$k] = sanitize_lead_value($v);
    }
    // twelfth_subjects: at most 8 entries shaped { subject, marks }
    if (isset($clean['twelfth_subjects'])) {
        $subjects = [];
        foreach ($clean['twelfth_subjects'] as $entry) {
            if (!is_array($entry)) continue;
            $subjects[] = [
                'subject' => isset($entry['subject']) ? (string) $entry['subject'] : '',
                'marks'   => (isset($entry['marks']) && is_numeric($entry['marks'])) ? $entry['marks'] + 0 : null,
            ];
            if (count($subjects) >= 8) break;
        }
        $clean['twelfth_subjects'] = $subjects;
    }
    return $clean;
}

// Same fake-number patterns as isSuspiciousMobile() on the client:
// all-one-digit (9999999999) and straight ascending/descending sequences
// wrapping through 0 (9876543210, 6789012345).
function is_suspicious_mobile($mobile) {
    if (!preg_match('/^[0-9]{10}$/', $mobile)) return false;
    if (preg_match('/^([0-9])\1{9}$/', $mobile)) return true;
    $asc  = true;
    $desc = true;
    for ($i = 1; $i < 10; $i++) {
        $prev = (int) $mobile[$i - 1];
        $cur  = (int) $mobile[$i];
        if ($cur !== ($prev + 1) % 10) $asc = false;
        if ($cur !== ($prev + 9) % 10) $desc = false;
    }
    return $asc || $desc;
}

// Sliding-window per-IP rate limit backed by api/data/ratelimit.json, using
// the same exclusive-lock pattern as save_leads. Fails OPEN (allows the
// create) on I/O trouble so infrastructure hiccups never drop real leads.
function check_rate_limit($file, $ip, $max, $window) {
    if ($ip === '') return true;
    $fp = fopen($file, 'c+');
    if (!$fp) return true;
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return true;
    }
    $raw  = stream_get_contents($fp);
    $data = json_decode($raw ?: '[]', true);
    if (!is_array($data)) $data = [];
    $now = time();
    // Prune expired timestamps for every IP so the file cannot grow unbounded.
    foreach (array_keys($data) as $key) {
        $times = [];
        foreach ((array) $data[$key] as $t) {
            if (is_numeric($t) && ($now - (int) $t) < $window) $times[] = (int) $t;
        }
        if (count($times) === 0) {
            unset($data[$key]);
        } else {
            $data[$key] = $times;
        }
    }
    $times   = isset($data[$ip]) ? $data[$ip] : [];
    $allowed = count($times) < $max;
    if ($allowed) {
        $times[]   = $now;
        $data[$ip] = $times;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $allowed;
}

// Merge an incoming create payload into an existing stored lead (upsert by
// lead_id / silent duplicate merge by mobile). Non-empty scalars are
// last-write-wins, but an empty incoming value never blanks out an existing
// non-empty one. lead_id and submitted_at keep their original (first-touch)
// values; notes/activity union-merge via merge_lead_array(); updated_at bumps
// and the given activity entry is appended.
function merge_into_lead(&$existing, $incoming, $activityAction) {
    foreach ($incoming as $k => $v) {
        if ($k === 'lead_id' || $k === 'submitted_at') continue;
        if ($k === 'notes' || $k === 'activity') {
            $existing[$k] = merge_lead_array($existing[$k] ?? [], is_array($v) ? $v : [], $k);
            continue;
        }
        $incomingEmpty  = ($v === '' || $v === null || (is_array($v) && count($v) === 0));
        $existingFilled = isset($existing[$k])
            && $existing[$k] !== ''
            && $existing[$k] !== null
            && !(is_array($existing[$k]) && count($existing[$k]) === 0);
        if ($incomingEmpty && $existingFilled) continue;
        $existing[$k] = $v;
    }
    $now = now_iso();
    $existing['updated_at'] = $now;
    $existing['activity']   = merge_lead_array($existing['activity'] ?? [], [[
        'action'    => $activityAction,
        'status'    => $existing['status'] ?? 'new',
        'timestamp' => $now,
    ]], 'activity');
}

// ----- Parse request -----
$method = $_SERVER['REQUEST_METHOD'];
$raw    = file_get_contents('php://input');
$input  = json_decode($raw, true);
if (!is_array($input)) $input = [];
$action = $_GET['action'] ?? ($input['action'] ?? '');

// ----- Routes -----
if ($method === 'GET' && ($action === '' || $action === 'list')) {
    require_admin_auth($adminKey);
    echo json_encode(['success' => true, 'leads' => load_leads($dataFile)]);
    exit;
}

if ($method === 'POST' && $action === 'create') {
    $lead = $input['lead'] ?? null;
    if (!is_array($lead) || empty($lead['lead_id']) || is_array($lead['lead_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid lead payload']);
        exit;
    }

    // Requests bearing the valid admin key (admin CSV import, internal tools)
    // are trusted: the field whitelist below still applies, but the anti-bot
    // checks (honeypot / validation / time-trap / suspicious number / rate
    // limit) are skipped so legacy/loose data imports cleanly.
    $providedKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
    $isTrusted = $adminKey !== ''
        && is_string($providedKey)
        && $providedKey !== ''
        && hash_equals($adminKey, $providedKey);

    $forceSpam = false;

    // (1) Honeypot — read BEFORE the whitelist strips it. `website` is a
    // hidden input the real form never fills; only bots submit it. Respond
    // success but tier the lead as spam. The field itself is never stored.
    if (!$isTrusted) {
        $honeypot = $lead['website'] ?? '';
        if ((is_string($honeypot) && trim($honeypot) !== '')
            || (!is_string($honeypot) && !empty($honeypot))) {
            $forceSpam = true;
        }
    }

    // (2) Field whitelist + max lengths (applies to trusted requests too).
    $lead = whitelist_lead($lead);

    $mobile = isset($lead['mobile']) ? trim((string) $lead['mobile']) : '';

    if (!$isTrusted) {
        // (3) Validation. Honeypot-flagged payloads skip it — their contract
        // is a plain success response, never a 400 tell.
        if (!$forceSpam) {
            $name = isset($lead['name']) ? trim((string) $lead['name']) : '';
            if ($name === '' || !preg_match('/^[6-9][0-9]{9}$/', $mobile)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid lead payload']);
                exit;
            }
        }

        // (4) Time-trap — a real person cannot finish the form this fast.
        $startedAt   = isset($lead['form_started_at']) ? strtotime((string) $lead['form_started_at']) : false;
        $submittedAt = isset($lead['submitted_at']) ? strtotime((string) $lead['submitted_at']) : false;
        if ($submittedAt === false) $submittedAt = time();
        if ($startedAt !== false && ($submittedAt - $startedAt) < $minFormSeconds) {
            $forceSpam = true;
        }

        // (5) Suspicious-number flag (same patterns as isSuspiciousMobile()).
        if ($mobile !== '' && is_suspicious_mobile($mobile)) {
            $forceSpam = true;
        }

        // (6) Rate limit — over the per-IP budget the request is silently
        // discarded with a success response, so the limit is never revealed.
        $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
        if (!check_rate_limit($rateFile, $ip, $rateLimitMax, $rateLimitWindow)) {
            respond_created(decoy_login_key());
        }
    }

    if ($forceSpam) {
        $lead['lead_tier'] = 'spam';
    }

    // Test-key eligibility, decided once from the payload as it now stands: a
    // spam-flagged lead has already been re-tiered above, and a trusted
    // request is an admin import rather than an applicant sitting the test.
    $keyEligible = !$isTrusted && is_key_eligible_lead($lead);

    $leads = load_leads($dataFile);

    // (7) Upsert by lead_id — a later application step completing an earlier
    // partial submission merges into the stored lead instead of bouncing.
    foreach ($leads as $i => $existing) {
        if (($existing['lead_id'] ?? null) === $lead['lead_id']) {
            if ($forceSpam) {
                // Never let a spam-flagged payload poison an existing lead.
                respond_created(decoy_login_key());
            }
            merge_into_lead($leads[$i], $lead, 'Application step completed');
            // The Step-1 partial already earned this lead its key, so the full
            // submit re-reads it instead of burning a second one. One lead
            // keeps one key for life.
            $loginKey = ensure_login_key($leads[$i], $keyPoolFile, $keyEligible);
            if (!save_leads($dataFile, $leads)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to save lead']);
                exit;
            }
            respond_created($loginKey);
        }
    }

    // (8) Silent duplicate merge by mobile — a repeat submitter is a hot
    // lead, not an error: fold the new details into the existing lead and
    // answer a plain success. (No `duplicate` flag any more — that response
    // was a public enumeration vector for stored phone numbers.)
    if ($mobile !== '') {
        foreach ($leads as $i => $existing) {
            if (trim((string) ($existing['mobile'] ?? '')) === $mobile) {
                if ($forceSpam) {
                    respond_created(decoy_login_key());
                }
                merge_into_lead($leads[$i], $lead, 'Re-enquiry / re-submission received');
                // A legacy enquiry lead that now applies gets its first key
                // here; one that already has a key keeps it.
                $loginKey = ensure_login_key($leads[$i], $keyPoolFile, $keyEligible);
                if (!save_leads($dataFile, $leads)) {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to save lead']);
                    exit;
                }
                respond_created($loginKey);
            }
        }
    }

    // (9) Fresh insert — a first-touch application lead earns its key here.
    $loginKey = ensure_login_key($lead, $keyPoolFile, $keyEligible);
    $leads[]  = $lead;
    if (!save_leads($dataFile, $leads)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save lead']);
        exit;
    }
    respond_created($loginKey);
}

if ($method === 'POST' && $action === 'update') {
    require_admin_auth($adminKey);
    $id    = $input['lead_id'] ?? '';
    $patch = $input['patch'] ?? null;
    if (!$id || !is_array($patch)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing lead_id or patch']);
        exit;
    }
    $leads = load_leads($dataFile);
    $found = false;
    // Captured for the Meta quality-feedback hook below: the status BEFORE the
    // patch, and the merged lead the applicant's identifiers are read from.
    $oldStatus   = '';
    $mergedLead  = null;
    foreach ($leads as &$lead) {
        if (($lead['lead_id'] ?? null) === $id) {
            $oldStatus = isset($lead['status']) && is_string($lead['status']) ? $lead['status'] : '';
            foreach ($patch as $k => $v) {
                if (($k === 'notes' || $k === 'activity') && is_array($v)) {
                    // Append-only arrays: union with what we already have so a
                    // stale array from one device can't erase another device's
                    // entries.
                    $lead[$k] = merge_lead_array($lead[$k] ?? [], $v, $k);
                } else {
                    // Scalar fields (status, conversion tracking, updated_at):
                    // last-write-wins straight replace.
                    $lead[$k] = $v;
                }
            }
            $found      = true;
            $mergedLead = $lead;
            break;
        }
    }
    unset($lead);
    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Lead not found']);
        exit;
    }
    save_leads($dataFile, $leads);
    echo json_encode(['success' => true]);

    // ----- Meta lead-quality feedback (after the response, never before) -----
    // Answer the admin panel first, then spend up to 3s talking to Meta, so a
    // slow or unreachable Graph API is invisible to the telecaller saving a
    // status. Under FPM the response is already on the wire by this point.
    if (function_exists('fastcgi_finish_request')) {
        @fastcgi_finish_request();
    }
    // Fire only on a GENUINE transition — re-saving a lead that is already
    // "Hot" must not re-send the verdict. (The deterministic event_id in
    // capi-feedback.php is the second guard, so a retry still dedupes.)
    $newStatus = (isset($patch['status']) && is_string($patch['status'])) ? $patch['status'] : null;
    if ($newStatus !== null && $newStatus !== $oldStatus && is_array($mergedLead)) {
        if ($newStatus === 'contacted') {
            // "Hot" — the telecaller reached a real, interested applicant.
            send_capi_feedback($mergedLead, 'QualifiedLead');
        } elseif ($newStatus === 'completed') {
            // "Seat Booked" — the outcome the whole campaign is paying for.
            send_capi_feedback($mergedLead, 'Purchase', capi_feedback_admission_value());
        }
    }
    exit;
}

if ($method === 'POST' && $action === 'delete') {
    require_admin_auth($adminKey);
    $ids = $input['lead_ids'] ?? [];
    if (!is_array($ids) || count($ids) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing lead_ids']);
        exit;
    }
    $idSet = array_flip($ids);
    $leads = load_leads($dataFile);
    $remaining = [];
    foreach ($leads as $lead) {
        $lid = $lead['lead_id'] ?? '';
        if (!isset($idSet[$lid])) {
            $remaining[] = $lead;
        }
    }
    save_leads($dataFile, $remaining);
    echo json_encode([
        'success' => true,
        'removed' => count($leads) - count($remaining),
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
