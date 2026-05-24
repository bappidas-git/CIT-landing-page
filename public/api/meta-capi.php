<?php
/* ============================================
   Meta Conversions API (CAPI) Proxy Endpoint
   Receives events from the frontend and
   forwards them to Meta's Conversions API
   with server-side enrichment.

   Supports: Lead, Purchase, PageView events
   Implements: Event deduplication via event_id
   Hashes PII with SHA256 before sending
   ============================================ */

// CORS headers for frontend requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Load configuration
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration missing. Copy config.example.php to config.php']);
    exit;
}
require_once $configFile;

// Validate configuration
if (!defined('META_PIXEL_ID') || META_PIXEL_ID === 'YOUR_PIXEL_ID') {
    http_response_code(500);
    echo json_encode(['error' => 'Meta Pixel ID not configured']);
    exit;
}

if (!defined('META_ACCESS_TOKEN') || META_ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN') {
    http_response_code(500);
    echo json_encode(['error' => 'Meta Access Token not configured']);
    exit;
}

// Parse request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['event_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request: event_name is required']);
    exit;
}

// Supported events
$supportedEvents = ['Lead', 'Purchase', 'PageView', 'ViewContent', 'Contact', 'LeadConverted'];
if (!in_array($data['event_name'], $supportedEvents)) {
    http_response_code(400);
    echo json_encode(['error' => 'Unsupported event: ' . $data['event_name']]);
    exit;
}

/**
 * Hash a value with SHA256 (for PII that isn't already hashed)
 * Meta requires lowercase, trimmed, SHA256-hashed PII
 */
function hashForMeta($value) {
    if (empty($value)) return '';
    // Check if already hashed (64 hex chars)
    if (preg_match('/^[a-f0-9]{64}$/', $value)) {
        return $value;
    }
    return hash('sha256', strtolower(trim($value)));
}

/**
 * Get the client IP address
 */
function getClientIp() {
    $headers = [
        'HTTP_CF_CONNECTING_IP',     // Cloudflare
        'HTTP_X_FORWARDED_FOR',      // Standard proxy
        'HTTP_X_REAL_IP',            // Nginx
        'REMOTE_ADDR',               // Direct connection
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            // X-Forwarded-For may contain multiple IPs; take the first
            $ip = explode(',', $_SERVER[$header])[0];
            $ip = trim($ip);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? '';
}

// Build user_data with server-side enrichment
$userData = [];

if (isset($data['user_data']) && is_array($data['user_data'])) {
    $ud = $data['user_data'];

    // Hash PII fields (accept pre-hashed from frontend)
    if (!empty($ud['em'])) $userData['em'] = [hashForMeta($ud['em'])];
    if (!empty($ud['ph'])) $userData['ph'] = [hashForMeta($ud['ph'])];
    if (!empty($ud['fn'])) $userData['fn'] = [hashForMeta($ud['fn'])];
    if (!empty($ud['ln'])) $userData['ln'] = [hashForMeta($ud['ln'])];

    // Browser-provided data (pass through)
    if (!empty($ud['client_user_agent'])) {
        $userData['client_user_agent'] = $ud['client_user_agent'];
    }
    if (!empty($ud['fbc'])) $userData['fbc'] = $ud['fbc'];
    if (!empty($ud['fbp'])) $userData['fbp'] = $ud['fbp'];
    if (!empty($ud['external_id'])) {
        $userData['external_id'] = [hashForMeta($ud['external_id'])];
    }
}

// Server-side enrichment: IP address
$clientIp = getClientIp();
if ($clientIp) {
    $userData['client_ip_address'] = $clientIp;
}

// Server-side enrichment: User agent fallback
if (empty($userData['client_user_agent']) && !empty($_SERVER['HTTP_USER_AGENT'])) {
    $userData['client_user_agent'] = $_SERVER['HTTP_USER_AGENT'];
}

// Build the event payload
$event = [
    'event_name' => $data['event_name'],
    'event_time' => isset($data['event_time']) ? (int)$data['event_time'] : time(),
    'action_source' => 'website',
    'user_data' => $userData,
];

// Event ID for deduplication
if (!empty($data['event_id'])) {
    $event['event_id'] = $data['event_id'];
}

// Event source URL
if (!empty($data['event_source_url'])) {
    $event['event_source_url'] = $data['event_source_url'];
}

// Custom data (non-PII event parameters)
if (isset($data['custom_data']) && is_array($data['custom_data'])) {
    $event['custom_data'] = $data['custom_data'];
}

// Build API request
$apiVersion = defined('META_API_VERSION') ? META_API_VERSION : 'v19.0';
$url = "https://graph.facebook.com/{$apiVersion}/" . META_PIXEL_ID . "/events";

$postData = [
    'data' => json_encode([$event]),
    'access_token' => META_ACCESS_TOKEN,
];

// Add test event code if configured
if (defined('META_TEST_EVENT_CODE') && META_TEST_EVENT_CODE !== '') {
    $postData['test_event_code'] = META_TEST_EVENT_CODE;
}

// Send to Meta Conversions API
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($postData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle response
if ($curlError) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to reach Meta API',
        'details' => $curlError,
    ]);
    exit;
}

$responseData = json_decode($response, true);

if ($httpCode === 200) {
    echo json_encode([
        'success' => true,
        'events_received' => $responseData['events_received'] ?? 1,
        'event_id' => $data['event_id'] ?? null,
    ]);
} else {
    http_response_code($httpCode);
    echo json_encode([
        'success' => false,
        'error' => 'Meta API error',
        'http_code' => $httpCode,
        'details' => $responseData,
    ]);
}
