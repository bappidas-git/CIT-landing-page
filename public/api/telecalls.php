<?php
/* ============================================
   Tele-Calling Storage API
   Server-side shared storage for tele-calling
   leads so every telecaller's admin panel sees
   the same records across browsers/devices
   (mirrors leads.php exactly, but with its own
   data file).

   Unlike leads.php (whose `create` is public so
   the website form can post), tele-calling records
   are only ever entered from inside the admin panel,
   so EVERY action here — including create — requires
   the X-Admin-Key handshake.

   Endpoints (all on this single file):
     GET  /api/telecalls.php?action=list
       Header: X-Admin-Key
       Returns all stored tele-calling records.

     POST /api/telecalls.php?action=create
       Header: X-Admin-Key
       Body: { "telecall": {...} }
       Adds a new tele-calling record.

     POST /api/telecalls.php?action=update
       Header: X-Admin-Key
       Body: { "telecall_id": "...", "patch": {...} }
       Merges patch into the record (notes/activity
       are union-merged; scalars are last-write-wins).

     POST /api/telecalls.php?action=delete
       Header: X-Admin-Key
       Body: { "telecall_ids": ["..."] }
       Removes records by id.

   Storage: a JSON file at api/data/telecalls.json.
   The data/ folder is created on first use and
   protected with a .htaccess "Deny from all".
   ============================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----- Storage paths -----
$dataDir  = __DIR__ . '/data';
$dataFile = $dataDir . '/telecalls.json';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . '/.htaccess', "Require all denied\nDeny from all\n");
    @file_put_contents($dataDir . '/index.html', '');
}

// ----- Resolve the admin key used to gate every action -----
//
// SECURITY — OPERATOR ACTION REQUIRED:
// The same handshake key used by leads.php (REACT_APP_LEADS_ADMIN_KEY in the
// client bundle) authenticates the tele-calling endpoints too, so no extra
// server-side configuration is needed. As in leads.php there is intentionally
// NO committed fallback key — a default that ships in the repository is public
// knowledge and cannot gate anything. Until a key is configured, every action
// here answers 503 (see require_admin_auth). If this deployment ever ran with
// the previously committed default key, treat that value as compromised and
// rotate both sides now.
//
// Resolution order (first non-empty wins):
//   1. ADMIN_API_KEY defined in config.php.
//   2. LEADS_ADMIN_KEY / ADMIN_API_KEY environment variable.
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
// Telecaller verdicts entered here are the same quality signal the lead store
// sends: `hot` and `seat_booked` are pushed back to Meta as server-side
// conversions. No-ops silently without Meta credentials — see capi-feedback.php.
require_once __DIR__ . '/capi-feedback.php';

// ----- Helpers -----
function load_records($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function save_records($file, $records) {
    $fp = fopen($file, 'c+');
    if (!$fp) return false;
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($records, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// Union-merge two append-only arrays (notes or activity) coming from different
// devices, de-duping by a stable key and sorting chronologically — identical to
// the merge in leads.php so concurrent telecaller edits never drop entries.
function merge_record_array($existing, $incoming, $type) {
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

// ----- Parse request -----
$method = $_SERVER['REQUEST_METHOD'];
$raw    = file_get_contents('php://input');
$input  = json_decode($raw, true);
if (!is_array($input)) $input = [];
$action = $_GET['action'] ?? ($input['action'] ?? '');

// ----- Routes -----
if ($method === 'GET' && ($action === '' || $action === 'list')) {
    require_admin_auth($adminKey);
    echo json_encode(['success' => true, 'telecalls' => load_records($dataFile)]);
    exit;
}

if ($method === 'POST' && $action === 'create') {
    require_admin_auth($adminKey);
    $record = $input['telecall'] ?? null;
    if (!is_array($record) || empty($record['telecall_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid telecall payload']);
        exit;
    }
    $records = load_records($dataFile);
    // Idempotent re-submits: dedupe by telecall_id only. (A telecaller may
    // legitimately log the same mobile number more than once, so mobile is
    // NOT used as a duplicate key here, unlike leads.php.)
    foreach ($records as $existing) {
        if (($existing['telecall_id'] ?? null) === $record['telecall_id']) {
            echo json_encode(['success' => true, 'duplicate' => true]);
            exit;
        }
    }
    $records[] = $record;
    if (!save_records($dataFile, $records)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save telecall']);
        exit;
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'POST' && $action === 'update') {
    require_admin_auth($adminKey);
    $id    = $input['telecall_id'] ?? '';
    $patch = $input['patch'] ?? null;
    if (!$id || !is_array($patch)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing telecall_id or patch']);
        exit;
    }
    $records = load_records($dataFile);
    $found = false;
    // Captured for the Meta quality-feedback hook below.
    $oldStatus     = '';
    $mergedRecord  = null;
    foreach ($records as &$record) {
        if (($record['telecall_id'] ?? null) === $id) {
            $oldStatus = isset($record['status']) && is_string($record['status']) ? $record['status'] : '';
            foreach ($patch as $k => $v) {
                if (($k === 'notes' || $k === 'activity') && is_array($v)) {
                    $record[$k] = merge_record_array($record[$k] ?? [], $v, $k);
                } else {
                    $record[$k] = $v;
                }
            }
            $found        = true;
            $mergedRecord = $record;
            break;
        }
    }
    unset($record);
    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Telecall not found']);
        exit;
    }
    save_records($dataFile, $records);
    echo json_encode(['success' => true]);

    // ----- Meta lead-quality feedback (after the response, never before) -----
    // Same contract as leads.php: answer the telecaller first, then spend up to
    // 3s talking to Meta. Mapped from src/admin/utils/telecallStatus.js keys —
    // `hot` is the Hot verdict, `seat_booked` is the booked seat.
    if (function_exists('fastcgi_finish_request')) {
        @fastcgi_finish_request();
    }
    $newStatus = (isset($patch['status']) && is_string($patch['status'])) ? $patch['status'] : null;
    if ($newStatus !== null && $newStatus !== $oldStatus && is_array($mergedRecord)) {
        // Tele-calling numbers are typed by hand and allow loose formats, so a
        // record without a usable 10-digit Indian mobile is skipped silently —
        // there would be nothing for Meta to match the person on.
        $hasMobile = capi_feedback_normalize_mobile($mergedRecord['mobile'] ?? '') !== '';
        if ($hasMobile) {
            if ($newStatus === 'hot') {
                send_capi_feedback($mergedRecord, 'QualifiedLead');
            } elseif ($newStatus === 'seat_booked') {
                send_capi_feedback($mergedRecord, 'Purchase', capi_feedback_admission_value());
            }
        }
    }
    exit;
}

if ($method === 'POST' && $action === 'delete') {
    require_admin_auth($adminKey);
    $ids = $input['telecall_ids'] ?? [];
    if (!is_array($ids) || count($ids) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing telecall_ids']);
        exit;
    }
    $idSet = array_flip($ids);
    $records = load_records($dataFile);
    $remaining = [];
    foreach ($records as $record) {
        $rid = $record['telecall_id'] ?? '';
        if (!isset($idSet[$rid])) {
            $remaining[] = $record;
        }
    }
    save_records($dataFile, $remaining);
    echo json_encode([
        'success' => true,
        'removed' => count($records) - count($remaining),
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
