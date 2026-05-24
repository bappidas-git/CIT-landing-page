<?php
/* ============================================
   Lead Storage API
   Server-side shared storage for leads so the
   admin panel can see leads submitted from any
   browser/device (localStorage is per-device).

   Endpoints (all on this single file):
     POST /api/leads.php?action=create
       Body: { "lead": {...} }
       Public — no auth. Called by webhookSubmit.js
       after the Pabbly POST.

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

   Storage: a JSON file at api/data/leads.json.
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
$dataFile = $dataDir . '/leads.json';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . '/.htaccess', "Require all denied\nDeny from all\n");
    @file_put_contents($dataDir . '/index.html', '');
}

// ----- Load optional config for admin key -----
$adminKey  = '';
$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
    require_once $configFile;
    if (defined('ADMIN_API_KEY')) {
        $adminKey = ADMIN_API_KEY;
    }
}

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
    echo json_encode(['success' => true, 'leads' => load_leads($dataFile)]);
    exit;
}

if ($method === 'POST' && $action === 'create') {
    $lead = $input['lead'] ?? null;
    if (!is_array($lead) || empty($lead['lead_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid lead payload']);
        exit;
    }
    $leads = load_leads($dataFile);
    // Dedup by lead_id
    foreach ($leads as $existing) {
        if (($existing['lead_id'] ?? null) === $lead['lead_id']) {
            echo json_encode(['success' => true, 'duplicate' => true]);
            exit;
        }
    }
    $leads[] = $lead;
    if (!save_leads($dataFile, $leads)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save lead']);
        exit;
    }
    echo json_encode(['success' => true]);
    exit;
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
    foreach ($leads as &$lead) {
        if (($lead['lead_id'] ?? null) === $id) {
            foreach ($patch as $k => $v) {
                $lead[$k] = $v;
            }
            $found = true;
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
