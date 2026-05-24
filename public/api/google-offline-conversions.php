<?php
/**
 * ============================================
 * Google Ads Offline Conversion API Upload
 * (Option B - Advanced API-based Upload)
 * ============================================
 *
 * This endpoint receives conversion data from the admin panel
 * and uploads it to Google Ads via the Google Ads API.
 *
 * REQUIREMENTS:
 * 1. Google Ads API credentials (OAuth2)
 * 2. Google Ads PHP client library (google/google-ads-php)
 * 3. Composer autoloader
 *
 * SETUP:
 * 1. Install dependencies: composer require googleads/google-ads-php
 * 2. Create OAuth2 credentials in Google Cloud Console
 * 3. Configure the variables below with your credentials
 * 4. Set your Google Ads customer ID
 *
 * API DOCUMENTATION:
 * https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
 */

// =============================================
// CONFIGURATION - UPDATE THESE VALUES
// =============================================
$config = [
    'developer_token'    => 'YOUR_DEVELOPER_TOKEN',
    'client_id'          => 'YOUR_OAUTH2_CLIENT_ID',
    'client_secret'      => 'YOUR_OAUTH2_CLIENT_SECRET',
    'refresh_token'      => 'YOUR_OAUTH2_REFRESH_TOKEN',
    'customer_id'        => 'YOUR_CUSTOMER_ID', // Without dashes, e.g., '1234567890'
    'conversion_action'  => 'YOUR_CONVERSION_ACTION_RESOURCE_NAME',
    // e.g., 'customers/1234567890/conversionActions/123456789'
];

// =============================================
// CORS & HEADERS
// =============================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// =============================================
// PARSE REQUEST
// =============================================
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['conversions']) || !is_array($input['conversions'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request. Expected { conversions: [...] }']);
    exit;
}

// =============================================
// VALIDATE CONVERSIONS
// =============================================
$conversions = [];
$errors = [];

foreach ($input['conversions'] as $i => $conv) {
    if (empty($conv['gclid'])) {
        $errors[] = "Conversion $i: Missing gclid";
        continue;
    }
    if (empty($conv['conversion_time'])) {
        $errors[] = "Conversion $i: Missing conversion_time";
        continue;
    }

    $conversions[] = [
        'gclid'           => $conv['gclid'],
        'conversion_time' => $conv['conversion_time'],
        'value'           => floatval($conv['value'] ?? 0),
        'currency'        => $conv['currency'] ?? 'INR',
    ];
}

if (empty($conversions)) {
    http_response_code(400);
    echo json_encode([
        'error'   => 'No valid conversions to upload',
        'details' => $errors,
    ]);
    exit;
}

// =============================================
// GOOGLE ADS API UPLOAD (PLACEHOLDER)
// =============================================
// TODO: Uncomment and implement when Google Ads PHP client is installed
//
// require_once __DIR__ . '/../../vendor/autoload.php';
//
// use Google\Ads\GoogleAds\Lib\V17\GoogleAdsClientBuilder;
// use Google\Ads\GoogleAds\V17\Services\ClickConversion;
// use Google\Ads\GoogleAds\V17\Services\UploadClickConversionsRequest;
//
// try {
//     $client = (new GoogleAdsClientBuilder())
//         ->withDeveloperToken($config['developer_token'])
//         ->withOAuth2Credential(/* OAuth2 credential */)
//         ->build();
//
//     $conversionUploadService = $client->getConversionUploadServiceClient();
//
//     $clickConversions = [];
//     foreach ($conversions as $conv) {
//         $clickConversion = new ClickConversion();
//         $clickConversion->setGclid($conv['gclid']);
//         $clickConversion->setConversionAction($config['conversion_action']);
//         $clickConversion->setConversionDateTime($conv['conversion_time']);
//         $clickConversion->setConversionValue($conv['value']);
//         $clickConversion->setCurrencyCode($conv['currency']);
//         $clickConversions[] = $clickConversion;
//     }
//
//     $request = new UploadClickConversionsRequest();
//     $request->setCustomerId($config['customer_id']);
//     $request->setConversions($clickConversions);
//     $request->setPartialFailure(true);
//
//     $response = $conversionUploadService->uploadClickConversions($request);
//
//     $results = [];
//     foreach ($response->getResults() as $result) {
//         $results[] = [
//             'gclid' => $result->getGclid(),
//             'status' => 'uploaded',
//         ];
//     }
//
//     echo json_encode([
//         'success' => true,
//         'uploaded' => count($results),
//         'results' => $results,
//     ]);
// } catch (Exception $e) {
//     http_response_code(500);
//     echo json_encode([
//         'error' => 'Google Ads API error: ' . $e->getMessage(),
//     ]);
// }

// =============================================
// PLACEHOLDER RESPONSE
// (Remove this when API integration is active)
// =============================================
echo json_encode([
    'success'  => false,
    'message'  => 'Google Ads API integration not yet configured. Use the CSV export option instead.',
    'received' => count($conversions),
    'errors'   => $errors,
    'note'     => 'To enable API uploads, install google-ads-php and configure OAuth2 credentials in this file.',
]);
