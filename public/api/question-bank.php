<?php
/* ============================================================
   CIT Merit-Based Selection Program 2026 — MCQ Question Bank
   30-Minute Online Merit Assessment Test

   120 original questions: 60 Mathematics (M001-M060) +
   60 Physics (P001-P060), Class-12 / engineering-entrance
   standard. Each attempt draws 15 Maths + 15 Physics at random.

   SERVER-SIDE ONLY. The `answer` index must never reach a
   browser — the API layer strips it before serialising. A direct
   HTTP hit on this file gets a bare 404; test.php defines
   CIT_TEST_INTERNAL before requiring it.

   Schema per row:
     id         'M001'-'M060' | 'P001'-'P060'  (unique)
     subject    'maths' | 'physics'
     topic      lowercase slug
     difficulty 'easy' | 'medium' | 'hard'
     q          question text (plain text + Unicode, no HTML/LaTeX)
     options    exactly 4 distinct non-empty strings
     answer     int 0-3, index into options

   Notation: Unicode only (x², √, π, θ, Ω, μ, °, ×, ·, −, ≤, →).
   Fractions inline with explicit parentheses. Matrices row-listed
   as [[a, b], [c, d]]. Every constant a student needs is supplied
   inside the question itself.
   ============================================================ */

if (!defined('CIT_TEST_INTERNAL')) {
    http_response_code(404);
    exit;
}

return [

    /* ---------- MATHEMATICS ---------- */

    /* Relations & functions */
    ['id' => 'M001', 'subject' => 'maths', 'topic' => 'relations-functions', 'difficulty' => 'easy',
     'q' => 'A relation R on the set {1, 2, 3} is R = {(1, 1), (2, 2), (3, 3), (1, 2)}. Which statement about R is true?',
     'options' => ['R is symmetric but not reflexive', 'R is an equivalence relation', 'R is reflexive but not symmetric', 'R is neither reflexive nor transitive'],
     'answer' => 2],

    ['id' => 'M002', 'subject' => 'maths', 'topic' => 'relations-functions', 'difficulty' => 'easy',
     'q' => 'The function f : R → R defined by f(x) = 5x − 4 is',
     'options' => ['one-one and onto', 'one-one but not onto', 'onto but not one-one', 'neither one-one nor onto'],
     'answer' => 0],

    ['id' => 'M003', 'subject' => 'maths', 'topic' => 'relations-functions', 'difficulty' => 'medium',
     'q' => 'If f(x) = 2x + 3 and g(x) = x², then the value of (f ∘ g)(3) is',
     'options' => ['81', '18', '39', '21'],
     'answer' => 3],

    ['id' => 'M004', 'subject' => 'maths', 'topic' => 'relations-functions', 'difficulty' => 'easy',
     'q' => 'Let f : R → R be given by f(x) = x². How many real values of x satisfy f(x) = 9?',
     'options' => ['1', '2', '0', '3'],
     'answer' => 1],

    /* Inverse trigonometry */
    ['id' => 'M005', 'subject' => 'maths', 'topic' => 'inverse-trigonometry', 'difficulty' => 'easy',
     'q' => 'The principal value of sin⁻¹(1/2) is',
     'options' => ['π/3', 'π/6', 'π/4', '5π/6'],
     'answer' => 1],

    ['id' => 'M006', 'subject' => 'maths', 'topic' => 'inverse-trigonometry', 'difficulty' => 'easy',
     'q' => 'The principal value of cos⁻¹(−1/2) is',
     'options' => ['π/3', '−π/3', '5π/6', '2π/3'],
     'answer' => 3],

    ['id' => 'M007', 'subject' => 'maths', 'topic' => 'inverse-trigonometry', 'difficulty' => 'medium',
     'q' => 'The value of tan⁻¹(1) + tan⁻¹(2) + tan⁻¹(3) is',
     'options' => ['π', 'π/2', '3π/4', '5π/4'],
     'answer' => 0],

    /* Matrices */
    ['id' => 'M008', 'subject' => 'maths', 'topic' => 'matrices', 'difficulty' => 'easy',
     'q' => 'For the matrix A = [[2, 0], [0, 3]] (rows shown in order), the entry of A² in row 1, column 1 is',
     'options' => ['2', '6', '4', '9'],
     'answer' => 2],

    ['id' => 'M009', 'subject' => 'maths', 'topic' => 'matrices', 'difficulty' => 'easy',
     'q' => 'If A is a 3 × 4 matrix and B is a 4 × 2 matrix, then the order of the product AB is',
     'options' => ['3 × 2', '4 × 4', '2 × 3', '4 × 2'],
     'answer' => 0],

    ['id' => 'M010', 'subject' => 'maths', 'topic' => 'matrices', 'difficulty' => 'medium',
     'q' => 'If A = [[1, 2], [3, 4]] and B = [[0, 1], [1, 0]] (rows shown in order), then AB equals',
     'options' => ['[[1, 2], [3, 4]]', '[[3, 4], [1, 2]]', '[[2, 1], [4, 3]]', '[[0, 2], [3, 0]]'],
     'answer' => 2],

    ['id' => 'M011', 'subject' => 'maths', 'topic' => 'matrices', 'difficulty' => 'medium',
     'q' => 'If the matrix [[0, k], [5, 0]] (rows shown in order) is symmetric, then k equals',
     'options' => ['−5', '5', '0', '1/5'],
     'answer' => 1],

    ['id' => 'M012', 'subject' => 'maths', 'topic' => 'matrices', 'difficulty' => 'hard',
     'q' => 'If A = [[1, 1], [0, 1]] (rows shown in order), then A⁵ equals',
     'options' => ['[[1, 1], [0, 1]]', '[[5, 5], [0, 5]]', '[[1, 25], [0, 1]]', '[[1, 5], [0, 1]]'],
     'answer' => 3],

    /* Determinants */
    ['id' => 'M013', 'subject' => 'maths', 'topic' => 'determinants', 'difficulty' => 'easy',
     'q' => 'The determinant of the matrix [[3, 4], [2, 5]] (rows shown in order) is',
     'options' => ['23', '−7', '22', '7'],
     'answer' => 3],

    ['id' => 'M014', 'subject' => 'maths', 'topic' => 'determinants', 'difficulty' => 'easy',
     'q' => 'If A is a 3 × 3 matrix with det(A) = 4, then det(2A) is',
     'options' => ['8', '32', '16', '64'],
     'answer' => 1],

    ['id' => 'M015', 'subject' => 'maths', 'topic' => 'determinants', 'difficulty' => 'medium',
     'q' => 'If A is a 3 × 3 matrix with det(A) = 5, then det(adj A) is',
     'options' => ['5', '125', '25', '15'],
     'answer' => 2],

    ['id' => 'M016', 'subject' => 'maths', 'topic' => 'determinants', 'difficulty' => 'medium',
     'q' => 'The system of equations 2x + 3y = 7 and 4x + 6y = 14 has',
     'options' => ['infinitely many solutions', 'a unique solution', 'no solution', 'exactly two solutions'],
     'answer' => 0],

    ['id' => 'M017', 'subject' => 'maths', 'topic' => 'determinants', 'difficulty' => 'hard',
     'q' => 'The area of the triangle whose vertices are (1, 0), (0, 4) and (5, 2) is',
     'options' => ['18 square units', '9 square units', '4.5 square units', '12 square units'],
     'answer' => 1],

    /* Continuity & differentiability */
    ['id' => 'M018', 'subject' => 'maths', 'topic' => 'continuity-differentiability', 'difficulty' => 'easy',
     'q' => 'The function f(x) = |x| is',
     'options' => ['continuous everywhere but not differentiable at x = 0', 'differentiable everywhere', 'discontinuous at x = 0', 'continuous only for x > 0'],
     'answer' => 0],

    ['id' => 'M019', 'subject' => 'maths', 'topic' => 'continuity-differentiability', 'difficulty' => 'easy',
     'q' => 'If y = sin(3x), then dy/dx is',
     'options' => ['cos(3x)', '−3cos(3x)', '3cos(3x)', '3sin(3x)'],
     'answer' => 2],

    ['id' => 'M020', 'subject' => 'maths', 'topic' => 'continuity-differentiability', 'difficulty' => 'medium',
     'q' => 'If y = x²eˣ, then dy/dx is',
     'options' => ['2xeˣ', 'eˣ(x² − 2x)', '2xeˣ + x²', 'eˣ(x² + 2x)'],
     'answer' => 3],

    ['id' => 'M021', 'subject' => 'maths', 'topic' => 'continuity-differentiability', 'difficulty' => 'medium',
     'q' => 'The function f is defined by f(x) = kx² for x ≤ 2 and f(x) = 12 for x > 2. The value of k that makes f continuous at x = 2 is',
     'options' => ['6', '4', '3', '12'],
     'answer' => 2],

    ['id' => 'M022', 'subject' => 'maths', 'topic' => 'continuity-differentiability', 'difficulty' => 'easy',
     'q' => 'If y = log(sin x), then dy/dx is',
     'options' => ['tan x', '1/(sin x)', '−cot x', 'cot x'],
     'answer' => 3],

    ['id' => 'M023', 'subject' => 'maths', 'topic' => 'continuity-differentiability', 'difficulty' => 'hard',
     'q' => 'If x = t² and y = t³, then the value of dy/dx at t = 2 is',
     'options' => ['6', '3', '3/2', '12'],
     'answer' => 1],

    /* Applications of derivatives */
    ['id' => 'M024', 'subject' => 'maths', 'topic' => 'applications-of-derivatives', 'difficulty' => 'easy',
     'q' => 'The slope of the tangent to the curve y = x² + 3x at the point (1, 4) is',
     'options' => ['5', '2', '4', '3'],
     'answer' => 0],

    ['id' => 'M025', 'subject' => 'maths', 'topic' => 'applications-of-derivatives', 'difficulty' => 'easy',
     'q' => 'The function f(x) = x³ − 3x has a local maximum at',
     'options' => ['x = −1', 'x = 1', 'x = 0', 'x = 3'],
     'answer' => 0],

    ['id' => 'M026', 'subject' => 'maths', 'topic' => 'applications-of-derivatives', 'difficulty' => 'medium',
     'q' => 'The radius of a circle is increasing at 2 cm/s. The rate at which its area increases when the radius is 5 cm is',
     'options' => ['10π cm²/s', '20π cm²/s', '25π cm²/s', '4π cm²/s'],
     'answer' => 1],

    ['id' => 'M027', 'subject' => 'maths', 'topic' => 'applications-of-derivatives', 'difficulty' => 'medium',
     'q' => 'The function f(x) = x² − 4x + 7 is strictly increasing on the interval',
     'options' => ['(−∞, 2)', '(−∞, ∞)', '(0, ∞)', '(2, ∞)'],
     'answer' => 3],

    ['id' => 'M028', 'subject' => 'maths', 'topic' => 'applications-of-derivatives', 'difficulty' => 'hard',
     'q' => 'The maximum value of f(x) = 2x³ − 15x² + 36x + 1 on the closed interval [0, 5] is',
     'options' => ['29', '28', '56', '1'],
     'answer' => 2],

    ['id' => 'M029', 'subject' => 'maths', 'topic' => 'applications-of-derivatives', 'difficulty' => 'hard',
     'q' => 'A rectangle has a perimeter of 40 cm. Its greatest possible area is',
     'options' => ['400 cm²', '200 cm²', '80 cm²', '100 cm²'],
     'answer' => 3],

    /* Integrals */
    ['id' => 'M030', 'subject' => 'maths', 'topic' => 'integrals', 'difficulty' => 'easy',
     'q' => 'The value of ∫ (3x² + 2) dx is',
     'options' => ['6x + C', 'x³ + 2 + C', 'x³ + 2x + C', '3x³ + 2x + C'],
     'answer' => 2],

    ['id' => 'M031', 'subject' => 'maths', 'topic' => 'integrals', 'difficulty' => 'easy',
     'q' => 'The value of the definite integral of x³ from x = 0 to x = 1 is',
     'options' => ['1/4', '1/3', '1', '3'],
     'answer' => 0],

    ['id' => 'M032', 'subject' => 'maths', 'topic' => 'integrals', 'difficulty' => 'easy',
     'q' => 'For x > 0, the value of ∫ (1/x) dx is',
     'options' => ['−1/x² + C', 'log x + C', 'x log x + C', '1/(2x²) + C'],
     'answer' => 1],

    ['id' => 'M033', 'subject' => 'maths', 'topic' => 'integrals', 'difficulty' => 'medium',
     'q' => 'The value of ∫ 2x·cos(x²) dx is',
     'options' => ['cos(x²) + C', 'sin(x²) + C', '−sin(x²) + C', 'x²sin(x²) + C'],
     'answer' => 1],

    ['id' => 'M034', 'subject' => 'maths', 'topic' => 'integrals', 'difficulty' => 'medium',
     'q' => 'The value of the definite integral of sin x from x = 0 to x = π/2 is',
     'options' => ['0', 'π/2', '1', '−1'],
     'answer' => 2],

    ['id' => 'M035', 'subject' => 'maths', 'topic' => 'integrals', 'difficulty' => 'medium',
     'q' => 'The value of ∫ x·eˣ dx is',
     'options' => ['eˣ(x − 1) + C', 'eˣ(x + 1) + C', 'x²eˣ/2 + C', 'xeˣ + C'],
     'answer' => 0],

    ['id' => 'M036', 'subject' => 'maths', 'topic' => 'integrals', 'difficulty' => 'hard',
     'q' => 'The value of the definite integral of (sin x)/(sin x + cos x) from x = 0 to x = π/2 is',
     'options' => ['π/2', '1', 'π', 'π/4'],
     'answer' => 3],

    /* Applications of integrals */
    ['id' => 'M037', 'subject' => 'maths', 'topic' => 'applications-of-integrals', 'difficulty' => 'medium',
     'q' => 'The area bounded by the curve y = x², the x-axis and the lines x = 0 and x = 3 is',
     'options' => ['9 square units', '27 square units', '3 square units', '18 square units'],
     'answer' => 0],

    ['id' => 'M038', 'subject' => 'maths', 'topic' => 'applications-of-integrals', 'difficulty' => 'medium',
     'q' => 'The area enclosed by the line y = 2x, the x-axis and the line x = 4 is',
     'options' => ['8 square units', '32 square units', '4 square units', '16 square units'],
     'answer' => 3],

    /* Differential equations */
    ['id' => 'M039', 'subject' => 'maths', 'topic' => 'differential-equations', 'difficulty' => 'easy',
     'q' => 'The order and the degree of the differential equation (d²y/dx²)³ + (dy/dx)⁵ = 0 are respectively',
     'options' => ['2 and 5', '3 and 2', '2 and 3', '5 and 3'],
     'answer' => 2],

    ['id' => 'M040', 'subject' => 'maths', 'topic' => 'differential-equations', 'difficulty' => 'easy',
     'q' => 'The general solution of the differential equation dy/dx = 3x² is',
     'options' => ['y = 6x + C', 'y = x³ + C', 'y = 3x³ + C', 'y = x³/3 + C'],
     'answer' => 1],

    ['id' => 'M041', 'subject' => 'maths', 'topic' => 'differential-equations', 'difficulty' => 'medium',
     'q' => 'The general solution of the differential equation dy/dx = y is',
     'options' => ['y = x + C', 'y = Ce⁻ˣ', 'y = Ceˣ', 'y = C log x'],
     'answer' => 2],

    ['id' => 'M042', 'subject' => 'maths', 'topic' => 'differential-equations', 'difficulty' => 'medium',
     'q' => 'The integrating factor of the differential equation dy/dx + 2y = eˣ is',
     'options' => ['e⁻²ˣ', 'e²ˣ', 'eˣ', '2eˣ'],
     'answer' => 1],

    /* Vectors */
    ['id' => 'M043', 'subject' => 'maths', 'topic' => 'vectors', 'difficulty' => 'easy',
     'q' => 'The magnitude of the vector a = 2î + 3ĵ + 6k̂ is',
     'options' => ['11', '√11', '49', '7'],
     'answer' => 3],

    ['id' => 'M044', 'subject' => 'maths', 'topic' => 'vectors', 'difficulty' => 'easy',
     'q' => 'The dot product of the vectors a = î + 2ĵ + 3k̂ and b = 4î − ĵ + 2k̂ is',
     'options' => ['8', '12', '−8', '4'],
     'answer' => 0],

    ['id' => 'M045', 'subject' => 'maths', 'topic' => 'vectors', 'difficulty' => 'medium',
     'q' => 'If the vector a = î + ĵ and the vector b = ĵ + k̂, then the cross product a × b is',
     'options' => ['î + ĵ + k̂', '−î + ĵ − k̂', 'î + ĵ − k̂', 'î − ĵ + k̂'],
     'answer' => 3],

    ['id' => 'M046', 'subject' => 'maths', 'topic' => 'vectors', 'difficulty' => 'medium',
     'q' => 'Two vectors of magnitudes 3 and 4 have a dot product equal to 6. The angle between them is',
     'options' => ['60°', '30°', '45°', '90°'],
     'answer' => 0],

    ['id' => 'M047', 'subject' => 'maths', 'topic' => 'vectors', 'difficulty' => 'hard',
     'q' => 'The projection of the vector a = 2î + 3ĵ + 6k̂ on the vector b = î + 2ĵ + 2k̂ is',
     'options' => ['20/7', '20/3', '20/9', '3/20'],
     'answer' => 1],

    /* Three-dimensional geometry */
    ['id' => 'M048', 'subject' => 'maths', 'topic' => 'three-dimensional-geometry', 'difficulty' => 'easy',
     'q' => 'The direction ratios of the line joining the points (1, 2, 3) and (4, 6, 3) are',
     'options' => ['5, 8, 6', '3, 4, 3', '3, 4, 0', '−3, −4, 6'],
     'answer' => 2],

    ['id' => 'M049', 'subject' => 'maths', 'topic' => 'three-dimensional-geometry', 'difficulty' => 'easy',
     'q' => 'The distance of the point (1, 2, 2) from the origin is',
     'options' => ['3 units', '5 units', '9 units', '√5 units'],
     'answer' => 0],

    ['id' => 'M050', 'subject' => 'maths', 'topic' => 'three-dimensional-geometry', 'difficulty' => 'medium',
     'q' => 'A line makes an angle of 60° with the x-axis and 45° with the y-axis. The angle it makes with the z-axis is',
     'options' => ['30°', '45°', '60°', '90°'],
     'answer' => 2],

    ['id' => 'M051', 'subject' => 'maths', 'topic' => 'three-dimensional-geometry', 'difficulty' => 'hard',
     'q' => 'The distance of the point (2, 3, −1) from the plane 2x − y + 2z + 3 = 0 is',
     'options' => ['2 units', '6 units', '1/3 units', '2/3 units'],
     'answer' => 3],

    /* Linear programming */
    ['id' => 'M052', 'subject' => 'maths', 'topic' => 'linear-programming', 'difficulty' => 'medium',
     'q' => 'The corner points of a feasible region are (0, 0), (4, 0), (3, 2) and (0, 3). The maximum value of Z = 5x + 3y is',
     'options' => ['20', '21', '15', '9'],
     'answer' => 1],

    ['id' => 'M053', 'subject' => 'maths', 'topic' => 'linear-programming', 'difficulty' => 'hard',
     'q' => 'The corner points of a feasible region are (0, 2), (3, 0), (6, 0) and (6, 8). For Z = 4x + 6y, the minimum value of Z is',
     'options' => ['12, and it occurs only at (0, 2)', '12, and it occurs at more than one point', '12, and it occurs only at (3, 0)', '24, and it occurs only at (6, 0)'],
     'answer' => 1],

    /* Probability */
    ['id' => 'M054', 'subject' => 'maths', 'topic' => 'probability', 'difficulty' => 'easy',
     'q' => 'A fair die is rolled once. The probability of getting a number greater than 4 is',
     'options' => ['1/6', '1/2', '2/3', '1/3'],
     'answer' => 3],

    ['id' => 'M055', 'subject' => 'maths', 'topic' => 'probability', 'difficulty' => 'medium',
     'q' => 'If P(A) = 0.6, P(B) = 0.5 and the events A and B are independent, then P(A ∩ B) is',
     'options' => ['1.1', '0.1', '0.3', '0.8'],
     'answer' => 2],

    ['id' => 'M056', 'subject' => 'maths', 'topic' => 'probability', 'difficulty' => 'medium',
     'q' => 'Two cards are drawn one after the other, without replacement, from a well-shuffled deck of 52 cards. The probability that both are aces is',
     'options' => ['1/221', '1/169', '1/13', '4/663'],
     'answer' => 0],

    ['id' => 'M057', 'subject' => 'maths', 'topic' => 'probability', 'difficulty' => 'medium',
     'q' => 'If P(A) = 1/2, P(B) = 1/3 and P(A ∩ B) = 1/6, then P(A | B) is',
     'options' => ['1/3', '1/6', '1/2', '2/3'],
     'answer' => 2],

    ['id' => 'M058', 'subject' => 'maths', 'topic' => 'probability', 'difficulty' => 'hard',
     'q' => 'A bag contains 3 red and 5 black balls. Two balls are drawn together at random. The probability that both are red is',
     'options' => ['3/28', '9/64', '3/8', '1/28'],
     'answer' => 0],

    ['id' => 'M059', 'subject' => 'maths', 'topic' => 'probability', 'difficulty' => 'hard',
     'q' => 'Box A holds 2 white and 3 black balls; box B holds 4 white and 1 black ball. A box is chosen at random and one ball is drawn from it. Given that the ball drawn is white, the probability that it came from box B is',
     'options' => ['1/3', '2/3', '1/2', '4/5'],
     'answer' => 1],

    ['id' => 'M060', 'subject' => 'maths', 'topic' => 'probability', 'difficulty' => 'hard',
     'q' => 'A biased coin shows heads with probability 1/3. It is tossed 3 times. The probability of getting exactly two heads is',
     'options' => ['1/9', '4/27', '1/3', '2/9'],
     'answer' => 3],

    /* ---------- PHYSICS ---------- */

    /* Electrostatics */
    ['id' => 'P001', 'subject' => 'physics', 'topic' => 'electrostatics', 'difficulty' => 'easy',
     'q' => 'Two point charges of +2 μC and +3 μC are 3 m apart in air. Taking 1/(4πε₀) = 9 × 10⁹ N·m²/C², the force between them is',
     'options' => ['6 × 10⁻² N', '6 × 10⁻³ N', '2 × 10⁻³ N', '5.4 × 10⁻² N'],
     'answer' => 1],

    ['id' => 'P002', 'subject' => 'physics', 'topic' => 'electrostatics', 'difficulty' => 'easy',
     'q' => 'The electric field at a point inside the cavity of a hollow charged conductor, away from its surface, is',
     'options' => ['maximum at the centre', 'equal to the field just outside the surface', 'inversely proportional to the distance squared', 'zero everywhere inside'],
     'answer' => 3],

    ['id' => 'P003', 'subject' => 'physics', 'topic' => 'electrostatics', 'difficulty' => 'medium',
     'q' => 'Three capacitors of 2 μF, 3 μF and 6 μF are joined in series. The equivalent capacitance of the combination is',
     'options' => ['11 μF', '36 μF', '1 μF', '0.5 μF'],
     'answer' => 2],

    ['id' => 'P004', 'subject' => 'physics', 'topic' => 'electrostatics', 'difficulty' => 'easy',
     'q' => 'The work done in moving a charge of 2 C through a potential difference of 5 V is',
     'options' => ['10 J', '2.5 J', '0.4 J', '7 J'],
     'answer' => 0],

    ['id' => 'P005', 'subject' => 'physics', 'topic' => 'electrostatics', 'difficulty' => 'medium',
     'q' => 'A capacitor of capacitance 4 μF is charged to a potential difference of 100 V. The energy stored in it is',
     'options' => ['0.02 J', '0.04 J', '0.2 J', '2 × 10⁻⁴ J'],
     'answer' => 0],

    ['id' => 'P006', 'subject' => 'physics', 'topic' => 'electrostatics', 'difficulty' => 'medium',
     'q' => 'An electric dipole of dipole moment 4 × 10⁻⁶ C·m is placed at 30° to a uniform electric field of 5 × 10⁴ N/C. The torque acting on the dipole is',
     'options' => ['0.2 N·m', '0.05 N·m', '0.1 N·m', '0.4 N·m'],
     'answer' => 2],

    ['id' => 'P007', 'subject' => 'physics', 'topic' => 'electrostatics', 'difficulty' => 'hard',
     'q' => 'A parallel-plate capacitor is charged and then disconnected from the battery. A dielectric slab of dielectric constant 2 is now inserted between its plates. The energy stored in the capacitor becomes',
     'options' => ['twice the original value', 'unchanged', 'four times the original value', 'half the original value'],
     'answer' => 3],

    /* Current electricity */
    ['id' => 'P008', 'subject' => 'physics', 'topic' => 'current-electricity', 'difficulty' => 'easy',
     'q' => 'A resistor of 5 Ω carries a steady current of 2 A. The potential difference across it is',
     'options' => ['2.5 V', '10 V', '0.4 V', '7 V'],
     'answer' => 1],

    ['id' => 'P009', 'subject' => 'physics', 'topic' => 'current-electricity', 'difficulty' => 'easy',
     'q' => 'Two resistors of 6 Ω and 3 Ω are connected in parallel. The equivalent resistance of the combination is',
     'options' => ['9 Ω', '4.5 Ω', '18 Ω', '2 Ω'],
     'answer' => 3],

    ['id' => 'P010', 'subject' => 'physics', 'topic' => 'current-electricity', 'difficulty' => 'easy',
     'q' => 'An electric bulb rated 100 W is used for 5 hours. The electrical energy consumed is',
     'options' => ['5 kWh', '0.5 kWh', '500 kWh', '0.05 kWh'],
     'answer' => 1],

    ['id' => 'P011', 'subject' => 'physics', 'topic' => 'current-electricity', 'difficulty' => 'easy',
     'q' => 'A cell of emf 6 V and internal resistance 1 Ω is connected across an external resistance of 5 Ω. The current in the circuit is',
     'options' => ['1 A', '1.2 A', '6 A', '0.5 A'],
     'answer' => 0],

    ['id' => 'P012', 'subject' => 'physics', 'topic' => 'current-electricity', 'difficulty' => 'medium',
     'q' => 'A wire of resistance 10 Ω is stretched uniformly until its length is doubled. Its new resistance is',
     'options' => ['20 Ω', '5 Ω', '40 Ω', '2.5 Ω'],
     'answer' => 2],

    ['id' => 'P013', 'subject' => 'physics', 'topic' => 'current-electricity', 'difficulty' => 'medium',
     'q' => 'In a metre bridge the balance point is at 40 cm from the left end when a known resistance of 6 Ω is in the right gap. The unknown resistance in the left gap is',
     'options' => ['9 Ω', '6 Ω', '4 Ω', '2.4 Ω'],
     'answer' => 2],

    ['id' => 'P014', 'subject' => 'physics', 'topic' => 'current-electricity', 'difficulty' => 'hard',
     'q' => 'Three resistors, each of 6 Ω, are joined to form a closed triangle. The resistance measured between any two corners of the triangle is',
     'options' => ['4 Ω', '2 Ω', '9 Ω', '18 Ω'],
     'answer' => 0],

    /* Moving charges & magnetism */
    ['id' => 'P015', 'subject' => 'physics', 'topic' => 'moving-charges-magnetism', 'difficulty' => 'easy',
     'q' => 'A charged particle moves parallel to a uniform magnetic field. The magnetic force acting on it is',
     'options' => ['maximum', 'zero', 'equal to qvB', 'equal to qvB/2'],
     'answer' => 1],

    ['id' => 'P016', 'subject' => 'physics', 'topic' => 'moving-charges-magnetism', 'difficulty' => 'easy',
     'q' => 'A straight wire of length 0.5 m carrying a current of 4 A is placed perpendicular to a uniform magnetic field of 0.2 T. The force on the wire is',
     'options' => ['0.1 N', '1.6 N', '0.04 N', '0.4 N'],
     'answer' => 3],

    ['id' => 'P017', 'subject' => 'physics', 'topic' => 'moving-charges-magnetism', 'difficulty' => 'medium',
     'q' => 'Taking μ₀/(4π) = 10⁻⁷ T·m/A, the magnetic field at a perpendicular distance of 0.2 m from a long straight wire carrying 10 A is',
     'options' => ['1 × 10⁻⁵ T', '2 × 10⁻⁵ T', '5 × 10⁻⁶ T', '1 × 10⁻⁶ T'],
     'answer' => 0],

    ['id' => 'P018', 'subject' => 'physics', 'topic' => 'moving-charges-magnetism', 'difficulty' => 'medium',
     'q' => 'A circular coil of 100 turns and radius 0.1 m carries a current of 2 A. Taking μ₀ = 4π × 10⁻⁷ T·m/A, the magnetic field at the centre of the coil is',
     'options' => ['2π × 10⁻⁴ T', '4π × 10⁻⁵ T', 'π × 10⁻⁴ T', '4π × 10⁻⁴ T'],
     'answer' => 3],

    ['id' => 'P019', 'subject' => 'physics', 'topic' => 'moving-charges-magnetism', 'difficulty' => 'medium',
     'q' => 'A proton and an alpha particle enter the same uniform magnetic field at right angles to it with equal momentum. The ratio of the radius of the proton path to that of the alpha particle path is',
     'options' => ['1 : 2', '2 : 1', '1 : 4', '4 : 1'],
     'answer' => 1],

    ['id' => 'P020', 'subject' => 'physics', 'topic' => 'moving-charges-magnetism', 'difficulty' => 'hard',
     'q' => 'A galvanometer of resistance 90 Ω shows full-scale deflection for a current of 10 mA. The resistance that must be joined in series with it to convert it into a voltmeter reading up to 10 V is',
     'options' => ['1000 Ω', '100 Ω', '910 Ω', '90 Ω'],
     'answer' => 2],

    /* Magnetism & matter */
    ['id' => 'P021', 'subject' => 'physics', 'topic' => 'magnetism-and-matter', 'difficulty' => 'easy',
     'q' => 'A substance that is weakly repelled by an external magnetic field is called',
     'options' => ['paramagnetic', 'diamagnetic', 'ferromagnetic', 'ferrimagnetic'],
     'answer' => 1],

    ['id' => 'P022', 'subject' => 'physics', 'topic' => 'magnetism-and-matter', 'difficulty' => 'medium',
     'q' => 'A bar magnet of magnetic moment 2 A·m² is placed at 30° to a uniform magnetic field of 0.5 T. The torque acting on the magnet is',
     'options' => ['1 N·m', '0.25 N·m', '0.5 N·m', '0.87 N·m'],
     'answer' => 2],

    ['id' => 'P023', 'subject' => 'physics', 'topic' => 'magnetism-and-matter', 'difficulty' => 'medium',
     'q' => 'At a certain place the angle of dip is 60° and the horizontal component of the earth\'s magnetic field is 0.3 G. The total intensity of the field there is',
     'options' => ['0.15 G', '0.52 G', '0.30 G', '0.60 G'],
     'answer' => 3],

    /* Electromagnetic induction */
    ['id' => 'P024', 'subject' => 'physics', 'topic' => 'electromagnetic-induction', 'difficulty' => 'easy',
     'q' => 'The magnetic flux linked with a coil changes from 5 Wb to 1 Wb in 2 s. The magnitude of the average induced emf is',
     'options' => ['2 V', '4 V', '8 V', '3 V'],
     'answer' => 0],

    ['id' => 'P025', 'subject' => 'physics', 'topic' => 'electromagnetic-induction', 'difficulty' => 'easy',
     'q' => 'Lenz\'s law is a direct consequence of the conservation of',
     'options' => ['charge', 'momentum', 'magnetic flux', 'energy'],
     'answer' => 3],

    ['id' => 'P026', 'subject' => 'physics', 'topic' => 'electromagnetic-induction', 'difficulty' => 'medium',
     'q' => 'The current in a coil of self-inductance 0.4 H falls steadily from 5 A to 1 A in 0.2 s. The magnitude of the induced emf is',
     'options' => ['8 V', '2 V', '10 V', '0.8 V'],
     'answer' => 0],

    ['id' => 'P027', 'subject' => 'physics', 'topic' => 'electromagnetic-induction', 'difficulty' => 'easy',
     'q' => 'A rod of length 0.5 m moves at 4 m/s perpendicular to a uniform magnetic field of 0.2 T. The emf induced across its ends is',
     'options' => ['0.1 V', '4 V', '0.4 V', '1.6 V'],
     'answer' => 2],

    ['id' => 'P028', 'subject' => 'physics', 'topic' => 'electromagnetic-induction', 'difficulty' => 'hard',
     'q' => 'A square loop of side 10 cm lies in a uniform magnetic field of 0.5 T directed perpendicular to its plane. The loop is pulled completely out of the field at a steady 2 m/s. The emf induced while it is leaving the field is',
     'options' => ['0.01 V', '0.1 V', '1 V', '0.05 V'],
     'answer' => 1],

    /* Alternating current */
    ['id' => 'P029', 'subject' => 'physics', 'topic' => 'alternating-current', 'difficulty' => 'easy',
     'q' => 'The peak value of an alternating voltage is 220√2 V. Its root-mean-square value is',
     'options' => ['110 V', '440 V', '220 V', '311 V'],
     'answer' => 2],

    ['id' => 'P030', 'subject' => 'physics', 'topic' => 'alternating-current', 'difficulty' => 'easy',
     'q' => 'In a purely resistive AC circuit, the phase difference between the applied voltage and the current is',
     'options' => ['π/2', 'zero', 'π', 'π/4'],
     'answer' => 1],

    ['id' => 'P031', 'subject' => 'physics', 'topic' => 'alternating-current', 'difficulty' => 'medium',
     'q' => 'The reactance of a 2 μF capacitor at an angular frequency of 500 rad/s is',
     'options' => ['1000 Ω', '100 Ω', '4000 Ω', '250 Ω'],
     'answer' => 0],

    ['id' => 'P032', 'subject' => 'physics', 'topic' => 'alternating-current', 'difficulty' => 'medium',
     'q' => 'A series LCR circuit has L = 2 H and C = 0.5 μF. Its resonant angular frequency is',
     'options' => ['500 rad/s', '10⁶ rad/s', '100 rad/s', '1000 rad/s'],
     'answer' => 3],

    ['id' => 'P033', 'subject' => 'physics', 'topic' => 'alternating-current', 'difficulty' => 'hard',
     'q' => 'A series LCR circuit at resonance has R = 10 Ω and an applied rms voltage of 20 V. The average power dissipated in the circuit is',
     'options' => ['40 W', '20 W', '200 W', '4 W'],
     'answer' => 0],

    /* Electromagnetic waves */
    ['id' => 'P034', 'subject' => 'physics', 'topic' => 'electromagnetic-waves', 'difficulty' => 'easy',
     'q' => 'Which of these electromagnetic radiations has the shortest wavelength?',
     'options' => ['X-rays', 'gamma rays', 'ultraviolet rays', 'microwaves'],
     'answer' => 1],

    ['id' => 'P035', 'subject' => 'physics', 'topic' => 'electromagnetic-waves', 'difficulty' => 'medium',
     'q' => 'An electromagnetic wave in vacuum has a frequency of 6 × 10¹⁴ Hz. Taking c = 3 × 10⁸ m/s, its wavelength is',
     'options' => ['200 nm', '600 nm', '500 nm', '50 nm'],
     'answer' => 2],

    /* Ray optics */
    ['id' => 'P036', 'subject' => 'physics', 'topic' => 'ray-optics', 'difficulty' => 'easy',
     'q' => 'The focal length of a concave mirror whose radius of curvature is 20 cm is',
     'options' => ['20 cm', '40 cm', '5 cm', '10 cm'],
     'answer' => 3],

    ['id' => 'P037', 'subject' => 'physics', 'topic' => 'ray-optics', 'difficulty' => 'easy',
     'q' => 'The power of a convex lens of focal length 25 cm is',
     'options' => ['0.25 D', '25 D', '2.5 D', '4 D'],
     'answer' => 3],

    ['id' => 'P038', 'subject' => 'physics', 'topic' => 'ray-optics', 'difficulty' => 'medium',
     'q' => 'An object is placed 30 cm in front of a convex lens of focal length 20 cm. The distance of the image from the lens is',
     'options' => ['12 cm', '50 cm', '60 cm', '20 cm'],
     'answer' => 2],

    ['id' => 'P039', 'subject' => 'physics', 'topic' => 'ray-optics', 'difficulty' => 'easy',
     'q' => 'The refractive index of a transparent medium is 1.5. Taking c = 3 × 10⁸ m/s, the speed of light in that medium is',
     'options' => ['1.5 × 10⁸ m/s', '2 × 10⁸ m/s', '4.5 × 10⁸ m/s', '3 × 10⁸ m/s'],
     'answer' => 1],

    ['id' => 'P040', 'subject' => 'physics', 'topic' => 'ray-optics', 'difficulty' => 'medium',
     'q' => 'The critical angle for a medium of refractive index √2 with respect to air is',
     'options' => ['45°', '30°', '60°', '90°'],
     'answer' => 0],

    ['id' => 'P041', 'subject' => 'physics', 'topic' => 'ray-optics', 'difficulty' => 'hard',
     'q' => 'A prism of refracting angle 60° produces a minimum deviation of 30°. The refractive index of its material is',
     'options' => ['1.5', '√2', '√3', '1.33'],
     'answer' => 1],

    /* Wave optics */
    ['id' => 'P042', 'subject' => 'physics', 'topic' => 'wave-optics', 'difficulty' => 'easy',
     'q' => 'In a double-slit interference experiment, the fringe width is directly proportional to',
     'options' => ['the wavelength of the light used', 'the separation between the slits', 'the square of the slit separation', 'the intensity of the source'],
     'answer' => 0],

    ['id' => 'P043', 'subject' => 'physics', 'topic' => 'wave-optics', 'difficulty' => 'medium',
     'q' => 'In a double-slit experiment the slits are 1 mm apart and the screen is 1 m away. With light of wavelength 600 nm, the fringe width is',
     'options' => ['6 mm', '0.06 mm', '1.2 mm', '0.6 mm'],
     'answer' => 3],

    ['id' => 'P044', 'subject' => 'physics', 'topic' => 'wave-optics', 'difficulty' => 'medium',
     'q' => 'Two coherent sources, each of intensity I, interfere. The resultant intensity at a point of constructive interference is',
     'options' => ['2I', 'I', '4I', 'zero'],
     'answer' => 2],

    ['id' => 'P045', 'subject' => 'physics', 'topic' => 'wave-optics', 'difficulty' => 'hard',
     'q' => 'In a single-slit diffraction pattern the slit width is doubled, everything else remaining the same. The width of the central maximum becomes',
     'options' => ['twice as large', 'unchanged', 'half as large', 'four times as large'],
     'answer' => 2],

    /* Dual nature of matter */
    ['id' => 'P046', 'subject' => 'physics', 'topic' => 'dual-nature-of-matter', 'difficulty' => 'easy',
     'q' => 'In the photoelectric effect, raising the intensity of the incident light while keeping its frequency fixed increases',
     'options' => ['the maximum kinetic energy of the photoelectrons', 'the work function of the metal', 'the threshold frequency of the metal', 'the number of photoelectrons emitted per second'],
     'answer' => 3],

    ['id' => 'P047', 'subject' => 'physics', 'topic' => 'dual-nature-of-matter', 'difficulty' => 'easy',
     'q' => 'The work function of a metal is 2 eV. Light whose photons carry 5 eV of energy falls on it. The maximum kinetic energy of the emitted electrons is',
     'options' => ['3 eV', '7 eV', '2 eV', '2.5 eV'],
     'answer' => 0],

    ['id' => 'P048', 'subject' => 'physics', 'topic' => 'dual-nature-of-matter', 'difficulty' => 'medium',
     'q' => 'The work function of a metal is 3.1 eV. Taking hc = 1240 eV·nm, its threshold wavelength is',
     'options' => ['620 nm', '400 nm', '310 nm', '124 nm'],
     'answer' => 1],

    ['id' => 'P049', 'subject' => 'physics', 'topic' => 'dual-nature-of-matter', 'difficulty' => 'hard',
     'q' => 'An electron is accelerated from rest through a potential difference V. Its de Broglie wavelength is proportional to',
     'options' => ['V', '√V', '1/V', '1/√V'],
     'answer' => 3],

    /* Atoms & nuclei */
    ['id' => 'P050', 'subject' => 'physics', 'topic' => 'atoms-and-nuclei', 'difficulty' => 'easy',
     'q' => 'In the Bohr model of the hydrogen atom, the magnitude of the total energy of the electron in the n-th orbit is proportional to',
     'options' => ['n²', '1/n²', '1/n', 'n'],
     'answer' => 1],

    ['id' => 'P051', 'subject' => 'physics', 'topic' => 'atoms-and-nuclei', 'difficulty' => 'medium',
     'q' => 'The half-life of a radioactive sample is 20 days. The fraction of the sample still undecayed after 60 days is',
     'options' => ['1/2', '1/3', '1/8', '1/6'],
     'answer' => 2],

    ['id' => 'P052', 'subject' => 'physics', 'topic' => 'atoms-and-nuclei', 'difficulty' => 'easy',
     'q' => 'When a nucleus emits a beta-minus particle,',
     'options' => ['its atomic number rises by 1 and its mass number is unchanged', 'its atomic number falls by 1 and its mass number is unchanged', 'its atomic number falls by 2 and its mass number falls by 4', 'both its atomic number and its mass number rise by 1'],
     'answer' => 0],

    ['id' => 'P053', 'subject' => 'physics', 'topic' => 'atoms-and-nuclei', 'difficulty' => 'medium',
     'q' => 'A nucleus of mass number 20 has a total binding energy of 160 MeV. Its binding energy per nucleon is',
     'options' => ['8 MeV', '160 MeV', '12.5 MeV', '3200 MeV'],
     'answer' => 0],

    ['id' => 'P054', 'subject' => 'physics', 'topic' => 'atoms-and-nuclei', 'difficulty' => 'medium',
     'q' => 'The energy of the electron in the ground state of the hydrogen atom is −13.6 eV. The energy needed to raise it from the ground state to the n = 2 state is',
     'options' => ['3.4 eV', '13.6 eV', '10.2 eV', '17.0 eV'],
     'answer' => 2],

    ['id' => 'P055', 'subject' => 'physics', 'topic' => 'atoms-and-nuclei', 'difficulty' => 'hard',
     'q' => 'The activity of a radioactive sample falls from 8000 disintegrations per second to 1000 disintegrations per second in 30 minutes. Its half-life is',
     'options' => ['15 minutes', '10 minutes', '5 minutes', '20 minutes'],
     'answer' => 1],

    /* Semiconductors */
    ['id' => 'P056', 'subject' => 'physics', 'topic' => 'semiconductors', 'difficulty' => 'medium',
     'q' => 'A p-type semiconductor is produced by doping pure silicon with',
     'options' => ['a pentavalent impurity such as phosphorus', 'a tetravalent impurity such as germanium', 'an inert element such as argon', 'a trivalent impurity such as boron'],
     'answer' => 3],

    ['id' => 'P057', 'subject' => 'physics', 'topic' => 'semiconductors', 'difficulty' => 'medium',
     'q' => 'When a p-n junction diode is forward biased, the width of its depletion region',
     'options' => ['increases', 'decreases', 'stays exactly the same', 'first increases and then vanishes'],
     'answer' => 1],

    ['id' => 'P058', 'subject' => 'physics', 'topic' => 'semiconductors', 'difficulty' => 'hard',
     'q' => 'The output of a two-input NAND gate is 0 only when',
     'options' => ['both inputs are 0', 'exactly one input is 1', 'at least one input is 0', 'both inputs are 1'],
     'answer' => 3],

    ['id' => 'P059', 'subject' => 'physics', 'topic' => 'semiconductors', 'difficulty' => 'hard',
     'q' => 'A half-wave rectifier is fed from a 50 Hz AC supply. The ripple frequency of its output is',
     'options' => ['50 Hz', '100 Hz', '25 Hz', '150 Hz'],
     'answer' => 0],

    ['id' => 'P060', 'subject' => 'physics', 'topic' => 'semiconductors', 'difficulty' => 'hard',
     'q' => 'A silicon diode with a forward voltage drop of 0.7 V is in series with a 130 Ω resistor across a 3.3 V supply. The current in the circuit is',
     'options' => ['25 mA', '30 mA', '20 mA', '2.6 mA'],
     'answer' => 2],

];
