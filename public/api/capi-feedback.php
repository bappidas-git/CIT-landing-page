<?php
/* ============================================
   Meta CAPI — Lead-Quality Feedback Sender
   ============================================
   The loop that fixes junk leads structurally.

   Meta optimises on whatever conversion signal it
   receives. Until now it only ever received the
   zero-friction `Lead` event, so it learned to find
   people who fill forms — not people who take
   admission. This file closes the loop: when a
   telecaller marks a lead Hot or Seat Booked in the
   admin panel, that verdict is pushed back to Meta
   as a server-side conversion so the algorithm can
   learn what a GOOD lead looks like.

   Events sent from here (both server-only):
     QualifiedLead — telecaller marked the lead Hot
                     (leads.php `contacted`,
                      telecalls.php `hot`)
     Purchase      — seat booked / admitted, carries
                     `value` + `currency: INR`
                     (leads.php `completed`,
                      telecalls.php `seat_booked`)

   Design rules (non-negotiable):
   1. NEVER fail or block an admin save. Every call
      is best-effort; failures are logged, swallowed
      and forgotten.
   2. NEVER send the admin's own browser identifiers.
      This event is about the APPLICANT, so
      `user_data` is built exclusively from the
      stored record — no $_SERVER cookies, no
      REMOTE_ADDR, no HTTP_USER_AGENT. Sending the
      telecaller's IP would teach Meta that every
      good lead lives at the call centre.
   3. Silently no-op when Meta credentials are not
      configured, so a deployment without config.php
      behaves exactly as before.

   This file posts DIRECTLY to the Meta Graph API
   using the same config.php credentials as
   meta-capi.php — it does NOT route through that
   endpoint, so its event names need no entry in
   meta-capi.php's browser-event whitelist.

   Included (never requested) by leads.php and
   telecalls.php:
     require_once __DIR__ . '/capi-feedback.php';
     send_capi_feedback($lead, 'QualifiedLead');
     send_capi_feedback($lead, 'Purchase', 50000);
   ============================================ */

// This is a function library, not an endpoint. A direct HTTP request gets
// nothing — only leads.php / telecalls.php ever include it.
if (isset($_SERVER['SCRIPT_FILENAME'])
    && @realpath($_SERVER['SCRIPT_FILENAME']) === @realpath(__FILE__)) {
    http_response_code(404);
    exit;
}

// Credentials live in the same config.php meta-capi.php reads. require_once
// keeps this safe even though the including store already loaded the file.
$capiFeedbackConfig = __DIR__ . '/config.php';
if (file_exists($capiFeedbackConfig)) {
    require_once $capiFeedbackConfig;
}
unset($capiFeedbackConfig);

if (!function_exists('capi_feedback_log')) {
    /**
     * Append a line to api/data/capi-feedback.log. Best-effort: a failed write
     * is itself ignored, because logging must never be able to break a save.
     */
    function capi_feedback_log($message) {
        $dir = __DIR__ . '/data';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
            @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
        }
        @file_put_contents(
            $dir . '/capi-feedback.log',
            gmdate('Y-m-d\TH:i:s\Z') . ' ' . $message . "\n",
            FILE_APPEND | LOCK_EX
        );
    }
}

if (!function_exists('capi_feedback_hash')) {
    /**
     * SHA-256 a PII value the way Meta expects it: trimmed + lowercased.
     * Returns '' for empty input so callers can skip the key entirely.
     */
    function capi_feedback_hash($value) {
        if (!is_string($value) && !is_numeric($value)) return '';
        $normalized = strtolower(trim((string) $value));
        if ($normalized === '') return '';
        return hash('sha256', $normalized);
    }
}

if (!function_exists('capi_feedback_normalize_mobile')) {
    /**
     * Reduce a loosely-typed phone number to the 10 Indian subscriber digits.
     * Tele-calling records are typed by hand, so "+91 84536 23233",
     * "0918453623233" and "8453623233" must all resolve to the same number.
     *
     * @param  mixed  $raw Stored mobile value
     * @return string 10 digits starting 6-9, or '' when the number is unusable
     */
    function capi_feedback_normalize_mobile($raw) {
        if (is_array($raw) || $raw === null) return '';
        $digits = preg_replace('/[^0-9]/', '', (string) $raw);
        if ($digits === '' || $digits === null) return '';
        // Drop a trunk prefix ("0…"), then an Indian country code ("91…") —
        // in that order, so "0918453623233" reduces the same as "918453623233".
        // The length guard keeps a genuine 10-digit number beginning 91 intact.
        $digits = ltrim($digits, '0');
        if (strlen($digits) > 10 && substr($digits, 0, 2) === '91') {
            $digits = substr($digits, 2);
        }
        if (!preg_match('/^[6-9][0-9]{9}$/', $digits)) return '';
        return $digits;
    }
}

if (!function_exists('capi_feedback_user_data')) {
    /**
     * Build Meta `user_data` from the STORED record only.
     *
     * Hashing happens here, server-side, from the fields the applicant gave us
     * — never from anything on the current (admin) request. `fbp`/`fbc` are
     * the applicant's own Meta browser identifiers, captured at submit time by
     * src/utils/attribution.js and stored on the lead, so they are passed raw
     * (Meta requires those two unhashed).
     *
     * @param  array  $lead     Stored lead / telecall record
     * @param  string $recordId lead_id, or telecall_id for tele-calling records
     * @return array  Meta user_data payload
     */
    function capi_feedback_user_data($lead, $recordId) {
        $userData = [];

        $mobile = capi_feedback_normalize_mobile($lead['mobile'] ?? '');
        if ($mobile !== '') {
            // E.164 without the '+' — Meta wants country code + number, digits only.
            $userData['ph'] = [capi_feedback_hash('91' . $mobile)];
        }

        $email = isset($lead['email']) && is_string($lead['email']) ? trim($lead['email']) : '';
        if ($email !== '') {
            $hashedEmail = capi_feedback_hash($email);
            if ($hashedEmail !== '') $userData['em'] = [$hashedEmail];
        }

        $name = isset($lead['name']) && is_string($lead['name']) ? trim($lead['name']) : '';
        if ($name !== '') {
            $parts = preg_split('/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY);
            if (is_array($parts) && count($parts) > 0) {
                $first = capi_feedback_hash($parts[0]);
                if ($first !== '') $userData['fn'] = [$first];
                if (count($parts) > 1) {
                    $last = capi_feedback_hash($parts[count($parts) - 1]);
                    if ($last !== '') $userData['ln'] = [$last];
                }
            }
        }

        if ($recordId !== '') {
            $userData['external_id'] = [capi_feedback_hash($recordId)];
        }

        // Applicant's own browser identifiers, captured at submit time.
        foreach (['fbp', 'fbc'] as $key) {
            if (!empty($lead[$key]) && is_string($lead[$key])) {
                $userData[$key] = trim($lead[$key]);
            }
        }

        return $userData;
    }
}

if (!function_exists('send_capi_feedback')) {
    /**
     * Push a telecaller quality verdict to the Meta Conversions API.
     *
     * Fire-and-forget by contract: the return value exists for logging and
     * tests only — no caller may branch on it in a way that changes what the
     * admin sees. Callers should flush their HTTP response first (see
     * fastcgi_finish_request in leads.php) so the 3-second Meta timeout can
     * never be felt in the admin panel.
     *
     * @param  array      $lead      Stored lead (leads.json) or telecall record
     * @param  string     $eventName 'QualifiedLead' | 'Purchase'
     * @param  float|null $value     Conversion value; adds currency INR when set
     * @return bool       True when Meta accepted the event
     */
    function send_capi_feedback($lead, $eventName, $value = null) {
        try {
            if (!is_array($lead) || !is_string($eventName) || $eventName === '') {
                return false;
            }

            // --- Unconfigured deployments no-op silently (not an error) ---
            if (!defined('META_PIXEL_ID') || !defined('META_ACCESS_TOKEN')) return false;
            $pixelId = trim((string) META_PIXEL_ID);
            $token   = trim((string) META_ACCESS_TOKEN);
            if ($pixelId === '' || $pixelId === 'YOUR_PIXEL_ID') return false;
            if ($token === '' || $token === 'YOUR_ACCESS_TOKEN') return false;

            // --- Record id: leads carry lead_id, telecalls carry telecall_id ---
            $recordId = '';
            foreach (['lead_id', 'telecall_id'] as $idKey) {
                if (!empty($lead[$idKey]) && !is_array($lead[$idKey])) {
                    $recordId = trim((string) $lead[$idKey]);
                    if ($recordId !== '') break;
                }
            }
            if ($recordId === '') return false;

            $userData = capi_feedback_user_data($lead, $recordId);
            // Meta rejects an event with no way to match a person. A record
            // with neither a usable mobile nor an email is simply skipped.
            if (empty($userData['ph']) && empty($userData['em'])) return false;

            $event = [
                'event_name'    => $eventName,
                'event_time'    => time(),
                // Not a website action — this is our own system reporting an
                // offline outcome, so no page and no browser context.
                'action_source' => 'system_generated',
                // Deterministic: a re-sent verdict for the same record dedupes
                // against the first one instead of double-counting.
                'event_id'      => $eventName . '_' . $recordId,
                'user_data'     => $userData,
            ];

            $pageUrl = isset($lead['page_url']) && is_string($lead['page_url'])
                ? trim($lead['page_url'])
                : '';
            if ($pageUrl !== '') {
                $event['event_source_url'] = $pageUrl;
            }

            if ($value !== null && is_numeric($value)) {
                $event['custom_data'] = [
                    'currency' => 'INR',
                    'value'    => (float) $value,
                ];
            }

            $apiVersion = defined('META_API_VERSION') ? META_API_VERSION : 'v19.0';
            $url = "https://graph.facebook.com/{$apiVersion}/{$pixelId}/events";

            $postData = [
                'data'         => json_encode([$event]),
                'access_token' => $token,
            ];
            if (defined('META_TEST_EVENT_CODE') && META_TEST_EVENT_CODE !== '') {
                $postData['test_event_code'] = META_TEST_EVENT_CODE;
            }

            if (!function_exists('curl_init')) {
                capi_feedback_log("SKIP {$eventName} {$recordId} — cURL unavailable");
                return false;
            }

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL            => $url,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => http_build_query($postData),
                CURLOPT_RETURNTRANSFER => true,
                // Short on purpose: a slow Meta must never hold a save open.
                CURLOPT_CONNECTTIMEOUT => 2,
                CURLOPT_TIMEOUT        => 3,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            $response  = curl_exec($ch);
            $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError !== '') {
                capi_feedback_log("FAIL {$eventName} {$recordId} — cURL: {$curlError}");
                return false;
            }
            if ((int) $httpCode !== 200) {
                $body = is_string($response) ? substr($response, 0, 500) : '';
                capi_feedback_log("FAIL {$eventName} {$recordId} — HTTP {$httpCode}: {$body}");
                return false;
            }

            capi_feedback_log("OK {$eventName} {$recordId}");
            return true;
        } catch (\Throwable $e) {
            // Absolutely nothing in here may surface to the admin.
            capi_feedback_log('ERROR ' . $e->getMessage());
            return false;
        }
    }
}

if (!function_exists('capi_feedback_admission_value')) {
    /**
     * The conversion value reported with Purchase.
     *
     * OPERATOR ACTION: set CONVERSION_VALUE_ADMISSION in config.php to the real
     * first-year revenue of one admission, so Meta's value optimisation can
     * rank campaigns by money rather than by lead count. This number is
     * internal — it is never rendered on the public page.
     *
     * @return float Configured admission value, or the 50000 placeholder
     */
    function capi_feedback_admission_value() {
        if (defined('CONVERSION_VALUE_ADMISSION') && is_numeric(CONVERSION_VALUE_ADMISSION)) {
            return (float) CONVERSION_VALUE_ADMISSION;
        }
        return 50000.0;
    }
}
