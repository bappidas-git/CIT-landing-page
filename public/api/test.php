<?php
/* ============================================
   Merit Test API
   Server side of the 30-Minute Online Merit
   Assessment Test that lives at /test.

   THE LOGIN KEY IS THE CREDENTIAL. There is no
   admin key on any student-facing action here, and
   a lead_id is NEVER accepted from the browser:
   every request resolves the applicant through the
   server-assigned CIT26-XXXXX key that leads.php
   issued when they applied. A client that could
   name its own lead_id could sit someone else's
   test.

   Endpoints (all on this single file):
     POST /api/test.php?action=login
       Body: { "key": "CIT26-XXXXX" }
       Public. Answers the attempt state for the key
       so /test knows which screen to show, plus the
       test parameters it renders in the rules list.
       NEVER returns questions, answers or scores.
       A malformed key, an unknown key and an
       over-the-rate-limit request all answer the
       SAME generic error, so neither the lead store
       nor the limit itself is enumerable.

   Storage:
     data/test_attempts.json   this endpoint's own store
     data/test_ratelimit.json  per-IP login attempts
     data/leads.json           read here; written only
                               through patch_lead(),
                               which is a targeted
                               server-side write — the
                               file itself stays owned
                               by leads.php.
   The data/ folder is created on first use and
   protected with a .htaccess "Deny from all".

   Attempt record shape (written by prompt 08, read
   here so login can resume an interrupted attempt):
     {
       "key":          "CIT26-XXXXX",   // the store is keyed on this
       "lead_id":      "...",           // resolved from the key, server-side
       "started_at":   "2026-08-10T09:00:00.000Z",
       "completed_at": null,            // ISO once submitted
       "questions": [                   // the drawn paper, in order
         { "id": "M001", "subject": "maths",
           "selected": null,            // null until answered, else 0-3
           "answered_at": null }
       ],
       "slot_booked":  false            // prompt 09
     }
   ============================================ */

header('Content-Type: application/json');
// An attempt state is per-applicant and never public: no proxy, CDN or browser
// may keep a copy, or one student's login response could be served to the next.
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----- Storage paths -----
$dataDir      = __DIR__ . '/data';
$attemptsFile = $dataDir . '/test_attempts.json';
$rateFile     = $dataDir . '/test_ratelimit.json';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . '/.htaccess', "Require all denied\nDeny from all\n");
    @file_put_contents($dataDir . '/index.html', '');
}

// ----- Anti-abuse tuning (optional config.php overrides, sane defaults) -----
// The key is a 5-char secret out of ~33.5M, so brute force is hopeless anyway;
// this is here to stop anyone grinding through the space at HTTP speed, and it
// is generous enough that a student re-typing a mis-read key never notices.
//
// OPERATOR NOTE: the budget is per IP, and every attempt counts — successful
// ones included. Jio and Airtel put many subscribers behind one CGNAT address,
// so a district where dozens of applicants sit the test in the same hour can
// share an IP and collectively exhaust 30 attempts, at which point a real
// applicant is told their key is wrong. If that shows up in the field, raise
// TEST_LOGIN_RATE_MAX in config.php — no code change needed.
$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
    require_once $configFile;
}
$loginRateMax    = defined('TEST_LOGIN_RATE_MAX') ? max(1, (int) TEST_LOGIN_RATE_MAX) : 30;      // attempts per IP per window
$loginRateWindow = defined('TEST_LOGIN_RATE_WINDOW') ? max(60, (int) TEST_LOGIN_RATE_WINDOW) : 3600; // window in seconds

// ----- Helpers -----
// Small, duplicated-per-endpoint helpers are the house convention here (see
// leads.php / telecalls.php): each API file stands alone, so a change to one
// endpoint can never break another.

function load_json($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function save_json_locked($file, $data) {
    $fp = @fopen($file, 'c+');
    if (!$fp) return false;
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// ISO-8601 UTC timestamp in the same shape the client writes
// (JS Date.toISOString()), so string-sorted activity stays chronological.
function now_iso() {
    return gmdate('Y-m-d\TH:i:s') . '.000Z';
}

// Union-merge two append-only arrays (notes or activity), de-duping by a stable
// key and sorting chronologically — the same helper leads.php uses, so an
// activity entry appended here survives an admin device mirroring a stale copy.
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

// Sliding-window per-IP rate limit backed by data/test_ratelimit.json, using
// the same exclusive-lock pattern as save_json_locked. Fails OPEN on I/O
// trouble: an applicant who has waited for this test must never be locked out
// by a disk hiccup.
function check_rate_limit($file, $ip, $max, $window) {
    if ($ip === '') return true;
    $fp = @fopen($file, 'c+');
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

/* ----- Lead lookup by login key -----
   leads.json is the authoritative record of who holds which key (login_keys.json
   is only a ledger), so this is the one place a key becomes an applicant. */

// Where the lead store lives. Resolved in a helper rather than passed around so
// patch_lead() below keeps the exact arity prompt 08 expects.
function test_leads_file() {
    return __DIR__ . '/data/leads.json';
}

// Normalise, shape-check, then scan. The shape check comes first so a junk
// payload never costs a file read, and it is the same alphabet leads.php issues
// from — 0/O and 1/I are excluded, so anything containing them is a mis-read.
function find_lead_by_key($key) {
    if (!is_string($key)) return null;
    $key = strtoupper(trim($key));
    if (!preg_match('/^CIT26-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}$/', $key)) {
        return null;
    }
    foreach (load_json(test_leads_file()) as $lead) {
        if (!is_array($lead)) continue;
        $stored = isset($lead['login_key']) && is_string($lead['login_key'])
            ? strtoupper(trim($lead['login_key']))
            : '';
        if ($stored !== '' && $stored === $key) {
            return $lead;
        }
    }
    return null;
}

/**
 * Stamp a lead with test progress (started / completed / slot booked).
 *
 * This is an INTERNAL server-side write, not the admin `action=update` path, so
 * it needs no admin key — the caller has already proved possession of the lead's
 * login key. Scalar patch keys are last-write-wins; `activity` is appended to
 * via merge_lead_array so the telecaller's timeline accumulates. `notes` is
 * deliberately untouchable here: notes are the humans' column.
 *
 * @param string      $leadId         lead_id resolved from the login key
 * @param array       $patch          Scalar fields to set on the lead
 * @param string|null $activityAction Timeline entry to append, or null for none
 * @return bool True when the lead was found and the store was written
 */
function patch_lead($leadId, array $patch, $activityAction = null) {
    $leadId = (string) $leadId;
    if ($leadId === '') return false;

    $file  = test_leads_file();
    $leads = load_json($file);
    $found = false;

    foreach ($leads as &$lead) {
        if (!is_array($lead) || ($lead['lead_id'] ?? null) !== $leadId) continue;
        foreach ($patch as $k => $v) {
            // notes stay the humans' column; activity has its own merge below.
            if ($k === 'notes' || $k === 'activity') continue;
            // Identity and the login key are written once, by leads.php, and
            // are not this endpoint's to rewrite — one lead keeps one key for
            // life, and re-stamping lead_id would orphan the record.
            if ($k === 'lead_id' || $k === 'submitted_at' || $k === 'login_key') continue;
            $lead[$k] = $v;
        }
        $now = now_iso();
        if ($activityAction !== null && $activityAction !== '') {
            $lead['activity'] = merge_lead_array($lead['activity'] ?? [], [[
                'action'    => $activityAction,
                'status'    => $lead['status'] ?? 'new',
                'timestamp' => $now,
            ]], 'activity');
        }
        $lead['updated_at'] = $now;
        $found = true;
        break;
    }
    unset($lead);

    if (!$found) return false;
    return save_json_locked($file, $leads);
}

/* ----- Attempt store ----- */

// One attempt per key, for life — the store is keyed on the login key rather
// than the lead so a re-issued lead record can never hand out a second attempt.
function find_attempt_by_key($file, $key) {
    foreach (load_json($file) as $attempt) {
        if (!is_array($attempt)) continue;
        if (isset($attempt['key']) && $attempt['key'] === $key) {
            return $attempt;
        }
    }
    return null;
}

// Index of the first unanswered question — where a resumed attempt picks up.
// An attempt with every question answered but no completed_at (the connection
// dropped between the last answer and the submit) resumes at the end, which is
// exactly where the engine should put it.
function attempt_question_index($attempt) {
    $questions = isset($attempt['questions']) && is_array($attempt['questions'])
        ? $attempt['questions']
        : [];
    foreach ($questions as $i => $question) {
        if (!is_array($question)) return (int) $i;
        if (!isset($question['selected']) || $question['selected'] === null) {
            return (int) $i;
        }
    }
    return count($questions);
}

/* ----- Responses ----- */

// The test's shape, sent to the browser so the instructions screen and the
// engine render one set of numbers instead of hard-coding their own.
function test_parameters() {
    return [
        'total'                => 30,
        'maths'                => 15,
        'physics'              => 15,
        'seconds_per_question' => 60,
        'marks_correct'        => 4,
    ];
}

// ONE generic failure for a malformed key, an unknown key and a rate-limited
// request alike. Anything more specific would turn this endpoint into an oracle
// for which keys exist. HTTP 200 on purpose — the request was well-formed.
function respond_invalid_key() {
    echo json_encode(['success' => false, 'error' => 'invalid_key']);
    exit;
}

// ----- Parse request -----
$method = $_SERVER['REQUEST_METHOD'];
$raw    = file_get_contents('php://input');
$input  = json_decode($raw, true);
if (!is_array($input)) $input = [];
$action = $_GET['action'] ?? ($input['action'] ?? '');

// ----- Routes -----

/* action=start / answer / state — implemented by the test-engine prompt (08);
   action=book_slot by prompt (09). Extend THIS file: the login action, the
   attempt store and the key-is-the-credential rule below are what they build
   on, and a second endpoint would have to duplicate all three. */

if ($method === 'POST' && $action === 'login') {
    // (1) Rate limit. Over budget the request answers exactly like a bad key,
    // so a script grinding the key space learns nothing from being throttled.
    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
    if (!check_rate_limit($rateFile, $ip, $loginRateMax, $loginRateWindow)) {
        respond_invalid_key();
    }

    // (2) Resolve the applicant from the key alone. Malformed and unknown keys
    // are the same answer.
    $key  = isset($input['key']) ? $input['key'] : '';
    $lead = find_lead_by_key($key);
    if ($lead === null) {
        respond_invalid_key();
    }
    $key = strtoupper(trim((string) $key));

    // (3) Attempt state. This is reconnaissance, not a state change: login
    // writes nothing to the lead or the attempt store, so refreshing the login
    // screen is free and leaves no trace on the applicant's timeline. The
    // timeline entry for starting belongs to action=start (prompt 08).
    $response = [
        'success'      => true,
        'state'        => 'not_started',
        'student_name' => isset($lead['name']) ? (string) $lead['name'] : '',
        'test'         => test_parameters(),
    ];

    $attempt = find_attempt_by_key($attemptsFile, $key);
    if (is_array($attempt)) {
        $completedAt = isset($attempt['completed_at']) && is_string($attempt['completed_at'])
            ? $attempt['completed_at']
            : '';
        if ($completedAt !== '') {
            $response['state']        = 'completed';
            $response['completed_at'] = $completedAt;
            $response['slot_booked']  = !empty($attempt['slot_booked']);
        } else {
            $response['state']          = 'in_progress';
            $response['question_index'] = attempt_question_index($attempt);
        }
    }

    // Scores and answers are deliberately absent from every branch above: a
    // student who has finished must not be able to read their marks out of a
    // login response before the admission team has released them.
    echo json_encode($response);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
