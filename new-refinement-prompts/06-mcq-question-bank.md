# 06 — Author the MCQ Question Bank (120 Original Class-12 Physics & Maths Questions)

> **Series:** CIT Landing Page Repositioning (prompt 6 of 10). **Depends on:** nothing (pure content + one new server file). Prompts 07–08 consume it.
> **You are:** Claude Code in a fresh session with full repo access. This prompt is mostly **authoring work** — budget your effort accordingly and do not stop until the bank is complete and validated.

## What to build

A server-side question bank of **120 original MCQs** — **60 Mathematics + 60 Physics**, Class-12 standard at engineering-entrance difficulty (JEE-Main/KCET style) — for the **30-Minute Online Merit Assessment Test**. Each test attempt will draw 15 random Maths + 15 random Physics questions (prompt 08), so the bank must be uniformly answerable in ≤ 60 seconds per question.

## Storage format — a guarded PHP data file, NOT a public JSON

**File: `public/api/question-bank.php`** (new). Correct answers must never be retrievable by a browser. A `.json` under `api/data/` relies on `.htaccess`, which Apache honors but a Cloudways nginx static-file layer may bypass — a `.php` file is executed, never served as source, on every PHP host. Structure:

```php
<?php
/* CIT Merit-Based Selection Program 2026 — question bank.
   Server-side only. Direct HTTP hits get a 404; test.php
   defines CIT_TEST_INTERNAL before requiring this file. */
if (!defined('CIT_TEST_INTERNAL')) {
    http_response_code(404);
    exit;
}

return [
    ['id' => 'M001', 'subject' => 'maths', 'topic' => 'matrices', 'difficulty' => 'easy',
     'q' => 'If A = [[2, 0], [0, 3]], what is det(A)?',
     'options' => ['5', '6', '0', '1'],
     'answer' => 1],
    // … 119 more …
];
```

Schema per question: `id` (`M001`–`M060`, `P001`–`P060`, unique), `subject` (`maths` | `physics`), `topic` (lowercase slug), `difficulty` (`easy` | `medium` | `hard`), `q` (question text), `options` (exactly 4 non-empty distinct strings), `answer` (int 0–3, index into `options`). The API layer (prompt 08) strips `answer` (and may strip `topic`/`difficulty`) before anything reaches the browser — nothing for you to do here beyond the guard.

## Mathematical notation rules (must render with the existing stack — plain text, no LaTeX, no KaTeX, no HTML in strings)

- Unicode only: superscripts `x²`, `x³`, `10⁻³`, `eˣ` (spell awkward powers as `x^5` only when no Unicode form exists — prefer designing questions that avoid them); `√`, `π`, `θ`, `α`, `ω`, `Ω`, `μ`, `°`, `×`, `·`, `≤`, `≥`, `≠`, `∞`, `∫`, `Δ`, `→`.
- Fractions inline: `3/4`, `(x + 1)/(x − 1)` with explicit parentheses — never stacked fractions.
- Matrices/determinants row-listed: `[[a, b], [c, d]]` (introduce the notation inside the question the first time: "the matrix [[2, 0], [0, 3]] (rows shown)"— or simply keep matrix questions 2×2 and self-evident).
- Vectors as `vector a`, unit vectors as `î, ĵ, k̂`. SI units spelled with proper symbols (`m/s²`, `μF`, `Ω`, `N·m`, `Wb`).
- Physics constants given in the question when needed (`take g = 10 m/s²`, `c = 3 × 10⁸ m/s`) — a student must never need a constant you didn't supply.
- Numeric options formatted consistently; no option should be distinguishable by formatting alone.

## Content specification

**Maths (60):** distribute across — relations & functions (4), inverse trigonometry (3), matrices (5), determinants (5), continuity & differentiability (6), applications of derivatives (6: tangents/normals, maxima-minima, rates), integrals (7: standard forms, substitution, definite), applications of integrals (2: simple areas), differential equations (4: order/degree, variable-separable), vectors (5: dot/cross, projections), 3-D geometry (4: direction cosines, lines/planes), linear programming (2: corner-point reading), probability (7: conditional, Bayes-lite, distributions).

**Physics (60):** electrostatics (7: Coulomb, field, potential, capacitors), current electricity (7: Ohm, resistors, Kirchhoff, cells), moving charges & magnetism (6), magnetism & matter (3), electromagnetic induction (5), alternating current (5: reactance, resonance, RMS), electromagnetic waves (2), ray optics (6: mirrors, lenses, prisms, instruments), wave optics (4: interference, diffraction, YDSE), dual nature of matter (4: photoelectric, de Broglie), atoms & nuclei (6: Bohr, decay, binding energy), semiconductors (5: diodes, logic gates).

**Quality bar (every question):**
- Original — written fresh by you; do not reproduce known textbook/JEE/KCET items verbatim.
- Difficulty mix per subject ≈ 40% easy / 40% medium / 20% hard; every question solvable mentally or with 2–3 lines of rough work in ≤ 60 s (numbers chosen to compute cleanly).
- Exactly one defensibly correct option; 3 plausible distractors (built from common sign/formula errors), no "all/none of the above", no "both A and B".
- Correct-answer positions distributed ≈ evenly: each of indices 0–3 correct 13–17 times per subject.
- Language: simple, direct English; self-contained; no multi-part questions.

**Author it in full.** Write all 120 questions in this session. Solve each one yourself as you write it and make sure your computed answer matches the stored `answer` index — an error here silently mis-scores real students.

## Validation (must run before you finish)

Write a throwaway validator at `scratch/validate-bank.php` (or run inline) — do **not** commit it into `public/`:

```php
<?php
define('CIT_TEST_INTERNAL', true);
$bank = require __DIR__ . '/../public/api/question-bank.php';
// assert: count === 120; 60/60 subject split; ids unique & well-formed;
// 4 distinct non-empty options each; answer in 0..3; per-subject
// answer-position counts within 13–17; topics/difficulty from the allowed sets;
// no 'answer' key misspellings; every q non-empty and < 400 chars.
```

Run `php scratch/validate-bank.php` until clean, then delete the scratch file. Also verify the guard: `php -S localhost:8080 -t public` → `curl -i localhost:8080/api/question-bank.php` must return **404 with an empty body** (no bank contents).

## Ground rules

- This prompt creates exactly one production file (`public/api/question-bank.php`) plus doc touches; **no React changes, no leads.php changes**.
- Nothing about the bank may reach any client bundle — do not import/require it anywhere in `src/`.
- Docs: add a `CHANGELOG.md` `[Unreleased]` entry; append a short "Question bank" note to `CLAUDE.md` (location, guard constant, 120 = 60+60, schema, "answers never leave the server").
- `npm run build` must still pass (it will — untouched — but run it).

## Acceptance criteria

- [ ] `public/api/question-bank.php` exists with exactly 120 questions (60 maths / 60 physics) matching the schema, topic coverage, difficulty mix, and answer-position balance above.
- [ ] Validator passes clean; guard verified (direct HTTP hit → 404, empty).
- [ ] Spot-solve 10 random questions (5 per subject) end-to-end and confirm the stored `answer` index is right; fix and re-validate if any mismatch.
- [ ] All notation is plain-text/Unicode per the rules — grep the file for `<`, `\\frac`, `$$` to confirm no HTML/LaTeX leaked (PHP's own `<?php` aside).
- [ ] CLAUDE.md + CHANGELOG updated; `npm run build` passes; no `src/` file references the bank.
