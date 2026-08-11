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

     POST /api/test.php?action=start
       Body: { "key": "...", "tnc_accepted": true }
       Draws the paper (15 random Maths + 15 random
       Physics, order shuffled) and serves question 1.
       ONE ATTEMPT PER KEY: if an attempt already
       exists this resumes it instead of drawing a
       second paper.

     POST /api/test.php?action=state
       Body: { "key": "..." }
       The resume path. Finalises anything that ran
       out of time while the applicant was away, then
       serves the current question with its TRUE
       remaining seconds.

     POST /api/test.php?action=answer
       Body: { "key": "...", "index": n,
               "selected": 0-3 | null }
       Records the choice (null = the client's timer
       hit zero) and serves the next question, or
       scores the paper on the 30th finalisation.
       A stale `index` answers `out_of_sync` and the
       current question — which is also what makes
       going back impossible: an old index can never
       overwrite an answer.

     POST /api/test.php?action=book_slot
       Body: { "key": "...", "slot": "<ISO UTC>" }
       Books the hour in which CIT's Counselling
       Officer will call: inside the 24 hours after
       the applicant finished AND inside the office's
       own day, 10:00–19:00 IST, every day of the week.
       A paper finished at midnight therefore books
       into the morning, not into the small hours.
       WRITE-ONCE from the student side: a second call
       answers the slot that is already stored rather
       than moving it — a changed appointment goes
       through the telecaller, who can see the whole
       picture. The window is re-derived and re-checked
       here; the list of chips the browser drew is
       convenience, never the authority.

   THE TIMING MODEL IS THE SERVER'S. A question's
   60-second clock starts when it is FIRST served and
   never restarts — closing the tab does not pause it.
   Answers land inside 60 s + a 15 s grace for slow
   networks; later than that the question is finalised
   blank. Auto-advance is therefore server-authoritative
   and the browser countdown is only UX.

   ANSWERS AND SCORES NEVER TRAVEL TO THE BROWSER.
   No response from any action here carries a correct
   option index, a qid, or a score — a student who has
   finished sees the same "submitted" state as everyone
   else, and the marks are read by the admission team
   off the lead record.

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

   Attempt record shape:
     {
       "key":          "CIT26-XXXXX",   // the store is keyed on this
       "lead_id":      "...",           // resolved from the key, server-side
       "started_at":   "2026-08-10T09:00:00.000Z",
       "completed_at": null,            // ISO once scored
       "questions": [                   // the drawn paper, in order
         { "qid": "M017", "subject": "maths",
           "first_served_at": null,     // when THIS question's clock started
           "selected": null,            // null until answered, else 0-3
           "answered_at": null,
           "timed_out": false }         // finalised without an answer
       ],
       "current":        0,             // index of the live question
       "score":          null,          // 0-120, set at scoring time
       "maths_score":    null,
       "physics_score":  null,
       "correct_count":  null,
       "wrong_count":    null,
       "blank_count":    null,
       "counselling_slot": null,        // ISO hour, once booked
       "slot_booked":    false          // mirrors the line above
     }

   Only `selected` is stored — correctness is derived
   at scoring time from the bank, so the attempts file
   is not itself an answer key.
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

// ----- The paper, and the clock (fixed — NOT config-tunable) -----
// These are the contract prompt 09, the admin panel and the instructions screen
// all read the test's shape from. A deployment that quietly changed them would
// hand different papers to different applicants in the same selection round.
define('CIT_TEST_MATHS_COUNT', 15);
define('CIT_TEST_PHYSICS_COUNT', 15);
define('CIT_TEST_TOTAL_QUESTIONS', CIT_TEST_MATHS_COUNT + CIT_TEST_PHYSICS_COUNT);
define('CIT_TEST_SECONDS_PER_QUESTION', 60);
define('CIT_TEST_MARKS_CORRECT', 4);

// Slack on top of the 60 s, so a slow 2G round-trip never costs an applicant an
// answer they really did choose in time. It is deliberately invisible to the
// client: the countdown still shows 60, and remaining_seconds still clamps at 0.
define('CIT_TEST_GRACE_SECONDS', 15);
define('CIT_TEST_ANSWER_WINDOW', CIT_TEST_SECONDS_PER_QUESTION + CIT_TEST_GRACE_SECONDS);

// ----- Tele-counselling slot booking (also fixed) -----
// The promise made on the post-test screen is "within the next 24 hours", so
// the bookable window is exactly that: from the moment the paper was submitted
// to 24 hours later. Changing it here would let the page promise one thing and
// the server accept another.
define('CIT_TEST_SLOT_WINDOW_SECONDS', 24 * 3600);

// A slot that has already passed cannot be called, but a student tapping
// Confirm at 3:59:58 for the 4:00 slot has done nothing wrong — and a cheap
// phone's clock can sit a couple of minutes ahead of ours. Five minutes of
// slack covers both without letting a genuinely stale chip through.
define('CIT_TEST_SLOT_PAST_GRACE_SECONDS', 300);

// ----- Office hours -----
// CIT's Counselling Officers work 10:00–19:00, EVERY day — Saturday and Sunday
// included, so there is no weekday check here and there must not be one.
//
// The paper can be sat at any hour: campaign traffic peaks late, and an
// applicant finishing at 11 PM was previously offered midnight and 1 AM chips
// for a call nobody was ever going to make. The window below is therefore
// intersected with the office's day, which is why a late finisher's first
// bookable hour is 10 AM the following morning.
//
// THE OFFICER'S CLOCK, NOT THE APPLICANT'S DEVICE. The hours are IST because
// that is when the Tumkur desk is staffed; a phone set to another zone must
// not be able to book 10 AM local. Slots are stored in UTC, so the offset is
// applied here rather than trusting anything the browser computed.
//
// MIRRORED IN src/pages/Test/PostTestScreen.jsx — the picker draws its chips
// from the same three numbers. Changing one file alone either hides hours the
// office does work, or shows chips this endpoint will refuse. Change both.
define('CIT_TEST_SLOT_TZ_OFFSET_SECONDS', 5 * 3600 + 30 * 60); // IST, UTC+05:30
define('CIT_TEST_SLOT_FIRST_HOUR', 10); // earliest hour a call may start in
define('CIT_TEST_SLOT_LAST_HOUR', 18);  // latest hour a call may START in — it runs to 19:00

// Marks at or above which an attempt is stamped `test_qualified` on the lead.
// null — the default, and what ships — means no automatic verdict: the
// admission team decides in the admin panel. Nothing student-visible branches
// on this either way; every applicant sees the same "if you qualify" wording.
$qualifyCutoff = defined('TEST_QUALIFY_CUTOFF') ? (int) TEST_QUALIFY_CUTOFF : null;

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

// Position of an attempt inside the store, for the read-modify-write paths that
// need to mutate it in place rather than work on a copy.
function attempt_index_by_key($attempts, $key) {
    foreach ($attempts as $i => $attempt) {
        if (!is_array($attempt)) continue;
        if (isset($attempt['key']) && $attempt['key'] === $key) {
            return (int) $i;
        }
    }
    return null;
}

// A scored attempt. `completed_at` is stamped in the same locked write as the
// score, so this is never true of a half-scored record.
function attempt_is_complete($attempt) {
    return is_array($attempt)
        && isset($attempt['completed_at'])
        && is_string($attempt['completed_at'])
        && $attempt['completed_at'] !== '';
}

// A question nobody can change any more: it was answered, or its clock ran out.
// `selected` alone is not the test — 0 is a legitimate answer and a timed-out
// question keeps `selected: null` forever.
function question_is_final($question) {
    if (!is_array($question)) return true; // corrupt row: skip rather than trap
    if (!empty($question['timed_out'])) return true;
    return isset($question['selected']) && $question['selected'] !== null;
}

// Index of the first question still in play — where a resumed attempt picks up,
// and what login reports. An attempt with all 30 finalised but no completed_at
// (the connection dropped between the last answer and scoring) resumes at the
// end, which is exactly where the engine should put it: the next `state` scores.
function attempt_question_index($attempt) {
    $questions = isset($attempt['questions']) && is_array($attempt['questions'])
        ? $attempt['questions']
        : [];
    foreach ($questions as $i => $question) {
        if (!question_is_final($question)) return (int) $i;
    }
    return count($questions);
}

/* ----- The clock -----
   Every deadline here is measured server-side against first_served_at, so a
   device with a wrong clock, a backgrounded tab and a closed browser all behave
   identically. */

// Epoch seconds for one of our own ISO stamps, or null if it is unreadable.
// The fractional part is dropped before parsing: it carries no information we
// use, and not every PHP build parses it.
function iso_to_epoch($iso) {
    if (!is_string($iso) || $iso === '') return null;
    $ts = strtotime(preg_replace('/\.\d+/', '', $iso));
    return $ts === false ? null : $ts;
}

/**
 * Epoch seconds for a client-supplied UTC timestamp, or null.
 *
 * The shape check is NOT decoration and must run before strtotime(): that
 * function cheerfully parses "tomorrow", "+3 hours" and "midnight", so a lax
 * parse would let a client name any instant it liked by sending a relative
 * expression where a timestamp belongs. Only the exact shape JavaScript's
 * Date.toISOString() produces is accepted — UTC, with the trailing Z.
 *
 * @param string $iso Candidate timestamp from the browser
 * @return int|null Epoch seconds, or null if it is not a UTC ISO timestamp
 */
function parse_client_iso($iso) {
    if (!is_string($iso)) return null;
    $iso = trim($iso);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/', $iso)) {
        return null;
    }
    return iso_to_epoch($iso);
}

/**
 * Is this instant the start of an hour the counselling desk actually works in?
 *
 * Both halves are measured in IST, since that is the clock the officers keep:
 * an hour boundary in Tumkur is at :30 past the hour in UTC (UTC+05:30), so
 * a naive "minutes must be 00" test on the stored UTC timestamp would reject
 * every slot this page can legitimately produce.
 *
 * @param int $epoch Slot start, epoch seconds
 * @return bool
 */
function slot_is_office_hour($epoch) {
    $ist = $epoch + CIT_TEST_SLOT_TZ_OFFSET_SECONDS;

    // On the hour, in IST. This is deliberately stricter than "some timezone's
    // hour boundary" — the appointment goes into an IST diary, and an offset
    // the office does not keep is not a time anyone here can call at.
    if ($ist % 3600 !== 0) return false;

    $hour = (int) (($ist % 86400) / 3600);
    return $hour >= CIT_TEST_SLOT_FIRST_HOUR && $hour <= CIT_TEST_SLOT_LAST_HOUR;
}

/**
 * Check a requested counselling slot against the attempt, and return it in our
 * own canonical ISO shape — so what lands on the lead is always the same
 * format the rest of the store uses, whatever the browser sent.
 *
 * THE WINDOW IS RE-DERIVED HERE. The client draws its chips from completed_at
 * too, but that list is convenience: a stale tab, a hand-rolled request or a
 * device with a wrong clock all get measured against the stored completion
 * time and the server's own now.
 *
 * @param string $iso         The requested slot, as sent by the client
 * @param string $completedAt The attempt's stored completed_at
 * @return string|null Canonical ISO slot, or null if it is not bookable
 */
function validate_counselling_slot($iso, $completedAt) {
    $slot = parse_client_iso($iso);
    if ($slot === null) return null;

    // Inside the hours the desk is staffed — 10:00 to 19:00 IST, every day.
    if (!slot_is_office_hour($slot)) return null;

    $completedEpoch = iso_to_epoch($completedAt);
    if ($completedEpoch === null) return null;

    // Inside the 24 hours we promised, and not before the paper was submitted.
    if ($slot < $completedEpoch) return null;
    if ($slot > $completedEpoch + CIT_TEST_SLOT_WINDOW_SECONDS) return null;

    // An hour that has already gone is not a call anyone can take — this is
    // what catches a tab left open past the slot it was showing.
    if ($slot < time() - CIT_TEST_SLOT_PAST_GRACE_SECONDS) return null;

    return gmdate('Y-m-d\TH:i:s', $slot) . '.000Z';
}

// The slot an attempt has already booked, or '' — the one place the stored
// value is read, so "booked" means exactly one thing everywhere.
function attempt_slot($attempt) {
    if (!is_array($attempt)) return '';
    $slot = isset($attempt['counselling_slot']) ? $attempt['counselling_slot'] : null;
    return (is_string($slot) && $slot !== '') ? $slot : '';
}

/* ----- Question bank -----
   SERVER-SIDE ONLY. question-bank.php is a plain `return [...]` data file behind
   a CIT_TEST_INTERNAL guard, so a direct HTTP hit on it 404s and nothing in
   src/ can ever import it. The `answer` index read here is stripped from
   everything that gets serialised to a browser. */

// qid → row, built once per request.
function question_bank_index() {
    static $index = null;
    if ($index !== null) return $index;

    if (!defined('CIT_TEST_INTERNAL')) {
        define('CIT_TEST_INTERNAL', true);
    }
    $bank = require __DIR__ . '/question-bank.php';

    $index = [];
    if (is_array($bank)) {
        foreach ($bank as $row) {
            if (!is_array($row) || !isset($row['id'])) continue;
            $index[(string) $row['id']] = $row;
        }
    }
    return $index;
}

// Draw one paper: 15 random Maths + 15 random Physics, then shuffle the 30 so
// the two subjects interleave unpredictably. Two attempts drawn a second apart
// get different questions in a different order.
function draw_question_ids($bankIndex) {
    $maths   = [];
    $physics = [];
    foreach ($bankIndex as $qid => $row) {
        $subject = isset($row['subject']) ? $row['subject'] : '';
        if ($subject === 'maths') {
            $maths[] = $qid;
        } elseif ($subject === 'physics') {
            $physics[] = $qid;
        }
    }
    shuffle($maths);
    shuffle($physics);
    $drawn = array_merge(
        array_slice($maths, 0, CIT_TEST_MATHS_COUNT),
        array_slice($physics, 0, CIT_TEST_PHYSICS_COUNT)
    );
    shuffle($drawn);
    return $drawn;
}

// A fresh attempt record. Stores qids and (later) chosen indices only — never
// the question text and never the correct answer.
function new_attempt($key, $leadId, $qids, $bankIndex) {
    $questions = [];
    foreach ($qids as $qid) {
        $questions[] = [
            'qid'             => $qid,
            'subject'         => isset($bankIndex[$qid]['subject']) ? $bankIndex[$qid]['subject'] : '',
            'first_served_at' => null,
            'selected'        => null,
            'answered_at'     => null,
            'timed_out'       => false,
        ];
    }
    return [
        'key'              => $key,
        'lead_id'          => $leadId,
        'started_at'       => now_iso(),
        'completed_at'     => null,
        'questions'        => $questions,
        'current'          => 0,
        'score'            => null,
        'maths_score'      => null,
        'physics_score'    => null,
        'correct_count'    => null,
        'wrong_count'      => null,
        'blank_count'      => null,
        'counselling_slot' => null,
        'slot_booked'      => false,
    ];
}

/**
 * Run one read-modify-write of the attempts store inside a single exclusive
 * lock, so two tabs racing the same key can never interleave.
 *
 * The callback receives the decoded store BY REFERENCE and returns whatever the
 * caller wants back; the mutated store is always written before the lock is
 * released. Call it directly (not via call_user_func) or the reference is lost.
 *
 * Keep the body tight: no patch_lead() and no bank scoring I/O inside it beyond
 * what the mutation itself needs.
 *
 * @param string   $file Path to data/test_attempts.json
 * @param callable $fn   function (array &$attempts) { … }
 * @return mixed The callback's return value, or null if the lock was unavailable
 */
function with_attempts_locked($file, $fn) {
    $fp = @fopen($file, 'c+');
    if (!$fp) return null;
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return null;
    }

    $raw      = stream_get_contents($fp);
    $attempts = json_decode($raw ?: '[]', true);
    if (!is_array($attempts)) $attempts = [];

    $result = $fn($attempts);

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($attempts, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return $result;
}

/**
 * Walk `current` forward past everything that can no longer be answered,
 * finalising any question whose window closed while the applicant was away.
 *
 * This is what makes auto-advance server-authoritative: a student who shut the
 * laptop on question 7 and came back an hour later does not find question 7
 * waiting with a fresh minute — every question they missed is already blank.
 *
 * @param array $attempt Mutated in place
 */
function advance_attempt(&$attempt) {
    $questions = isset($attempt['questions']) && is_array($attempt['questions'])
        ? $attempt['questions']
        : [];
    $total   = count($questions);
    $current = isset($attempt['current']) ? (int) $attempt['current'] : 0;
    if ($current < 0) $current = 0;
    $now  = time();
    $bank = question_bank_index();

    while ($current < $total) {
        $question = $attempt['questions'][$current];

        if (question_is_final($question)) {
            $current++;
            continue;
        }

        // A qid the bank no longer carries cannot be asked or scored. Never
        // reachable with the shipped bank; skipped rather than shown blank.
        if (!isset($question['qid']) || !isset($bank[$question['qid']])) {
            $attempt['questions'][$current]['selected']  = null;
            $attempt['questions'][$current]['timed_out'] = true;
            $current++;
            continue;
        }

        // Never served ⇒ its clock has not started ⇒ it cannot be overdue.
        if (!isset($question['first_served_at']) || $question['first_served_at'] === null) {
            break;
        }

        $servedAt = iso_to_epoch($question['first_served_at']);
        if ($servedAt === null) break; // unreadable stamp: serve it, don't punish

        if (($now - $servedAt) > CIT_TEST_ANSWER_WINDOW) {
            $attempt['questions'][$current]['selected']  = null;
            $attempt['questions'][$current]['timed_out'] = true;
            $current++;
            continue;
        }

        break; // in time — this is the live question
    }

    $attempt['current'] = $current;
}

/**
 * Render the live question, stamping its clock the first time it is served.
 *
 * The payload carries the option TEXT and nothing else: no qid (which would leak
 * the paper across attempts), no topic or difficulty, and above all no answer.
 *
 * @param array $attempt Mutated in place (first_served_at)
 * @return array The `question` block of a serving payload
 */
function serve_current_question(&$attempt) {
    $i        = (int) $attempt['current'];
    $question = $attempt['questions'][$i];

    if (!isset($question['first_served_at']) || $question['first_served_at'] === null) {
        $attempt['questions'][$i]['first_served_at'] = now_iso();
        $elapsed = 0;
    } else {
        $servedAt = iso_to_epoch($question['first_served_at']);
        $elapsed  = $servedAt === null ? 0 : max(0, time() - $servedAt);
    }

    // Clamped, so a resumed question shows what is really left rather than a
    // fresh minute — and the grace seconds never surface as a 7th visible one.
    $remaining = CIT_TEST_SECONDS_PER_QUESTION - $elapsed;
    if ($remaining < 0) $remaining = 0;
    if ($remaining > CIT_TEST_SECONDS_PER_QUESTION) $remaining = CIT_TEST_SECONDS_PER_QUESTION;

    $bank = question_bank_index();
    $row  = $bank[$question['qid']];

    $options = [];
    foreach ((array) $row['options'] as $option) {
        $options[] = (string) $option;
    }

    return [
        'index'             => $i,
        'total'             => count($attempt['questions']),
        'subject'           => isset($row['subject']) ? (string) $row['subject'] : '',
        'q'                 => isset($row['q']) ? (string) $row['q'] : '',
        'options'           => $options,
        'remaining_seconds' => $remaining,
    ];
}

/**
 * Mark the paper. +4 for a correct answer, 0 for a wrong one and 0 for a blank —
 * there is no negative marking, so a guess never costs an applicant anything.
 *
 * Correctness is derived here, from the bank, against the stored `selected`
 * index; the attempt record never held the right answer to begin with.
 *
 * @param array $attempt Mutated in place (scores + completed_at)
 */
function score_attempt(&$attempt) {
    $bank         = question_bank_index();
    $mathsScore   = 0;
    $physicsScore = 0;
    $correct      = 0;
    $wrong        = 0;
    $blank        = 0;

    foreach ($attempt['questions'] as $question) {
        $selected = (is_array($question) && isset($question['selected']))
            ? $question['selected']
            : null;
        $row = (is_array($question) && isset($question['qid']) && isset($bank[$question['qid']]))
            ? $bank[$question['qid']]
            : null;

        if ($selected === null || !is_numeric($selected) || $row === null || !isset($row['answer'])) {
            $blank++;
            continue;
        }

        if ((int) $row['answer'] === (int) $selected) {
            $correct++;
            if (($row['subject'] ?? '') === 'physics') {
                $physicsScore += CIT_TEST_MARKS_CORRECT;
            } else {
                $mathsScore += CIT_TEST_MARKS_CORRECT;
            }
        } else {
            $wrong++;
        }
    }

    $attempt['maths_score']   = $mathsScore;
    $attempt['physics_score'] = $physicsScore;
    $attempt['score']         = $mathsScore + $physicsScore;
    $attempt['correct_count'] = $correct;
    $attempt['wrong_count']   = $wrong;
    $attempt['blank_count']   = $blank;
    $attempt['completed_at']  = now_iso();
}

/* ----- Responses ----- */

// The test's shape, sent to the browser so the instructions screen and the
// engine render one set of numbers instead of hard-coding their own.
function test_parameters() {
    return [
        'total'                => CIT_TEST_TOTAL_QUESTIONS,
        'maths'                => CIT_TEST_MATHS_COUNT,
        'physics'              => CIT_TEST_PHYSICS_COUNT,
        'seconds_per_question' => CIT_TEST_SECONDS_PER_QUESTION,
        'marks_correct'        => CIT_TEST_MARKS_CORRECT,
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
            // completed_at is what the post-test screen derives its 24-hour
            // booking window from, so it travels on every completed response.
            // It is a timestamp, not a result: nothing here says how they did.
            $response['state']        = 'completed';
            $response['completed_at'] = $completedAt;
            $slot                     = attempt_slot($attempt);
            $response['slot_booked']  = ($slot !== '');
            if ($slot !== '') {
                // Already booked ⇒ the screen shows the confirmed appointment
                // instead of a picker that could only overwrite it.
                $response['slot'] = $slot;
            }
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

/* ============================================
   The engine: start · state · answer

   All three resolve the applicant the same way login does — from the key alone,
   never from a client-supplied lead_id — and all three answer the same generic
   `invalid_key` when that fails.

   Rate limiting differs from login on purpose. A running test makes ~30 answer
   calls per applicant, and CGNAT puts a whole district behind one address, so
   spending budget on every call would lock real students out mid-paper. Budget
   is charged only when a key FAILS to resolve, which is exactly the traffic a
   key-guessing script generates.
   ============================================ */

if ($method === 'POST' && ($action === 'start' || $action === 'state' || $action === 'answer')) {
    $key  = isset($input['key']) ? $input['key'] : '';
    $lead = find_lead_by_key($key);
    if ($lead === null) {
        $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
        // Called for its side effect: record the failure against this IP so a
        // grinder still runs into the same wall the login screen puts up.
        check_rate_limit($rateFile, $ip, $loginRateMax, $loginRateWindow);
        respond_invalid_key();
    }
    $key    = strtoupper(trim((string) $key));
    $leadId = isset($lead['lead_id']) ? (string) $lead['lead_id'] : '';

    // `start` is the only action that may create an attempt, and only after the
    // terms were accepted on this device.
    $isStart      = ($action === 'start');
    $tncAccepted  = isset($input['tnc_accepted']) && $input['tnc_accepted'] === true;

    // An answer for a question the server is no longer on is refused rather than
    // applied — that is the whole of the no-going-back rule.
    $answerIndex = null;
    $selected    = null;
    if ($action === 'answer') {
        $answerIndex = (isset($input['index']) && is_numeric($input['index']))
            ? (int) $input['index']
            : -1;
        // Anything that is not a real option — including the client's explicit
        // timeout `null` — is a blank. There is no partial credit to protect.
        if (isset($input['selected']) && is_numeric($input['selected'])) {
            $candidate = (int) $input['selected'];
            if ($candidate >= 0 && $candidate <= 3) $selected = $candidate;
        }
    }

    $outcome = with_attempts_locked(
        $attemptsFile,
        function (&$attempts) use ($key, $leadId, $action, $isStart, $tncAccepted, $answerIndex, $selected) {
            $i       = attempt_index_by_key($attempts, $key);
            $created = false;

            if ($i === null) {
                if (!$isStart) {
                    // Nothing to resume or answer. The client sends the
                    // applicant back through the instructions screen.
                    return ['state' => 'not_started'];
                }
                if (!$tncAccepted) {
                    return ['error' => 'tnc_required'];
                }
                $bankIndex  = question_bank_index();
                $attempts[] = new_attempt($key, $leadId, draw_question_ids($bankIndex), $bankIndex);
                $i          = count($attempts) - 1;
                $created    = true;
            }

            // ONE ATTEMPT PER KEY, FOR LIFE. A second `start` lands here and
            // resumes — it never draws a second paper.
            if (attempt_is_complete($attempts[$i])) {
                return [
                    'state'        => 'completed',
                    'completed_at' => $attempts[$i]['completed_at'],
                    'slot'         => attempt_slot($attempts[$i]),
                ];
            }

            // Finalise anything that ran out of time while the applicant was
            // away, BEFORE looking at what they just sent.
            advance_attempt($attempts[$i]);
            $total = count($attempts[$i]['questions']);

            if ($action === 'answer' && $attempts[$i]['current'] < $total) {
                if ($answerIndex !== (int) $attempts[$i]['current']) {
                    // Stale index: a late answer for a question that has already
                    // timed out, a double-tap, or a second tab. Re-serve rather
                    // than overwrite.
                    return [
                        'error'    => 'out_of_sync',
                        'state'    => 'in_progress',
                        'question' => serve_current_question($attempts[$i]),
                    ];
                }

                // advance_attempt() has already finalised anything past the
                // window, so reaching here means the answer arrived in time —
                // a late one lost its index above and was refused as stale.
                $cur = (int) $attempts[$i]['current'];
                if ($selected === null) {
                    $attempts[$i]['questions'][$cur]['selected']  = null;
                    $attempts[$i]['questions'][$cur]['timed_out'] = true;
                } else {
                    $attempts[$i]['questions'][$cur]['selected']    = $selected;
                    $attempts[$i]['questions'][$cur]['answered_at'] = now_iso();
                    $attempts[$i]['questions'][$cur]['timed_out']   = false;
                }
                $attempts[$i]['current'] = $cur + 1;
                advance_attempt($attempts[$i]);
            }

            if ((int) $attempts[$i]['current'] >= $total) {
                score_attempt($attempts[$i]);
                return [
                    'state'          => 'completed',
                    'completed_at'   => $attempts[$i]['completed_at'],
                    'slot'           => attempt_slot($attempts[$i]),
                    'just_completed' => true,
                    'lead_patch'     => [
                        'test_status'         => 'completed',
                        'test_score'          => $attempts[$i]['score'],
                        'test_maths_score'    => $attempts[$i]['maths_score'],
                        'test_physics_score'  => $attempts[$i]['physics_score'],
                        'test_correct_count'  => $attempts[$i]['correct_count'],
                        'test_wrong_count'    => $attempts[$i]['wrong_count'],
                        'test_blank_count'    => $attempts[$i]['blank_count'],
                        'test_completed_at'   => $attempts[$i]['completed_at'],
                    ],
                ];
            }

            return [
                'state'    => 'in_progress',
                'question' => serve_current_question($attempts[$i]),
                'created'  => $created,
            ];
        }
    );

    // The store could not be opened or locked. Said plainly so the engine shows
    // its retry banner instead of a student staring at a dead screen.
    if (!is_array($outcome)) {
        echo json_encode(['success' => false, 'error' => 'unavailable']);
        exit;
    }

    /* Lead writes happen AFTER the attempts lock is released — two files, one
       lock at a time, so a slow leads.json write never holds up another
       applicant's answer. */
    if (!empty($outcome['created'])) {
        patch_lead($leadId, [
            'test_status'     => 'in_progress',
            'test_started_at' => now_iso(),
        ], 'Merit test started');
    }

    if (!empty($outcome['just_completed'])) {
        $patch = $outcome['lead_patch'];
        // Only when an operator has set a cutoff. Left unset (the default), the
        // admission team makes the call in the admin panel and no verdict is
        // written at all — an absent field reads as "not decided", where a
        // stored `false` would read as "rejected".
        if ($qualifyCutoff !== null) {
            $patch['test_qualified'] = ((int) $patch['test_score'] >= $qualifyCutoff);
        }
        // The activity line carries no marks: the timeline is read out to
        // applicants over the phone, the score is not.
        patch_lead($leadId, $patch, 'Merit test completed — scored');
    }

    if (isset($outcome['error'])) {
        $response = ['success' => false, 'error' => $outcome['error']];
        // out_of_sync ships the current question so the client re-syncs in the
        // same round-trip rather than costing the applicant another one.
        if (isset($outcome['question'])) {
            $response['state']    = $outcome['state'];
            $response['question'] = $outcome['question'];
        }
        echo json_encode($response);
        exit;
    }

    $response = ['success' => true, 'state' => $outcome['state']];
    if ($outcome['state'] === 'in_progress') {
        $response['question'] = $outcome['question'];
    } elseif ($outcome['state'] === 'completed') {
        // No score, no answers, not even a pass/fail — the cutoff is not a
        // student-facing number, and the result reaches them through the
        // admission team. What does travel is the paperwork the next screen
        // needs: when they finished (the 24-hour booking window is measured
        // from it) and, if they have already chosen one, their call slot.
        $slot                    = isset($outcome['slot']) ? (string) $outcome['slot'] : '';
        $response['slot_booked'] = ($slot !== '');
        if (!empty($outcome['completed_at'])) {
            $response['completed_at'] = $outcome['completed_at'];
        }
        if ($slot !== '') {
            $response['slot'] = $slot;
        }
    }
    echo json_encode($response);
    exit;
}

/* ============================================
   action=book_slot — the tele-counselling appointment

   The last thing an applicant does on this route: pick the hour in which CIT's
   Counselling Officer will call them — inside the 24 hours after they
   submitted, and inside the hours the desk is staffed (10:00–19:00 IST, all
   seven days). The two together are the whole rule: a paper finished at 11 PM
   has its next bookable hour at 10 AM, not at midnight.

   WRITE-ONCE FROM THE STUDENT SIDE. A second booking answers the slot that is
   already stored rather than moving it — the officer has the appointment in
   their day by then, so a change is a conversation, not a form. The admin panel
   can still edit `counselling_slot` on the lead directly.
   ============================================ */

if ($method === 'POST' && $action === 'book_slot') {
    // Same credential rule as every other student-facing action: the key, and
    // only the key. Same generic failure, and the same "charge the rate limit
    // only when the key does not resolve" policy the engine uses.
    $key  = isset($input['key']) ? $input['key'] : '';
    $lead = find_lead_by_key($key);
    if ($lead === null) {
        $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
        check_rate_limit($rateFile, $ip, $loginRateMax, $loginRateWindow);
        respond_invalid_key();
    }
    $key       = strtoupper(trim((string) $key));
    $leadId    = isset($lead['lead_id']) ? (string) $lead['lead_id'] : '';
    $slotInput = isset($input['slot']) ? $input['slot'] : '';

    $outcome = with_attempts_locked(
        $attemptsFile,
        function (&$attempts) use ($key, $slotInput) {
            $i = attempt_index_by_key($attempts, $key);

            // Nothing to book against. A key that never sat the test, or one
            // still mid-paper, has no completion time to measure 24 hours from.
            if ($i === null || !attempt_is_complete($attempts[$i])) {
                return ['error' => 'not_completed'];
            }

            $existing = attempt_slot($attempts[$i]);
            if ($existing !== '') {
                return ['already_booked' => true, 'slot' => $existing];
            }

            $slot = validate_counselling_slot($slotInput, $attempts[$i]['completed_at']);
            if ($slot === null) {
                return ['error' => 'invalid_slot'];
            }

            $attempts[$i]['counselling_slot'] = $slot;
            $attempts[$i]['slot_booked']      = true;
            return ['slot' => $slot, 'booked' => true];
        }
    );

    if (!is_array($outcome)) {
        echo json_encode(['success' => false, 'error' => 'unavailable']);
        exit;
    }

    if (isset($outcome['error'])) {
        echo json_encode(['success' => false, 'error' => $outcome['error']]);
        exit;
    }

    // Outside the attempts lock, as everywhere here: two files, one lock at a
    // time. The activity string is fixed — the admin timeline renders on it.
    if (!empty($outcome['booked'])) {
        patch_lead($leadId, [
            'counselling_slot' => $outcome['slot'],
        ], 'Counselling slot booked');
    }

    $response = ['success' => true, 'slot' => $outcome['slot']];
    if (!empty($outcome['already_booked'])) {
        // Said plainly so the client can tell "your booking went through" from
        // "you already had one" — it fires its analytics event only on the
        // former, and shows the stored time either way.
        $response['already_booked'] = true;
    }
    echo json_encode($response);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
