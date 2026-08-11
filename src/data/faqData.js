/* ============================================
   FAQ Data — CIT Merit-Based Selection Program 2026

   Single source of truth for BOTH the on-page FAQ
   accordion (FAQSection) and the FAQPage JSON-LD
   (src/config/seo.js re-exports this array), so
   the page and the schema can never drift apart.

   The first six entries are mirrored verbatim in
   the static JSON-LD fallback in public/index.html
   — edit both together.

   House rules for every answer here:
   - factual, ≤ 60 words
   - the 15 remaining seats are a true figure; never
     invent scarcity beyond it, and no countdowns
   - no fee amounts (the complete year-wise fee
     structure is shown inside the application form)
   ============================================ */

export const faqData = [
  {
    question: 'What is the CIT Merit-Based Selection Program 2026?',
    answer:
      'Session 2026 is closing, and only 15 seats remain across CIT’s seven B.E. branches. Instead of giving them away on a first-come enquiry basis, CIT is filling them strictly on merit — through a 30-Minute Online Merit Assessment Test. You earn your seat by qualifying.',
  },
  {
    question: 'Who should apply?',
    answer:
      'Talented students who could not clear JEE, KCET or COMEDK this year, for any reason. You need 45% aggregate in Physics, Mathematics and one more science subject in your 12th — 40% for reserved categories, as per VTU rules. Students appearing for their 2026 board exams can apply now.',
  },
  {
    question: 'How does the 30-Minute Online Merit Assessment Test work?',
    answer:
      '30 multiple-choice questions — 15 Maths and 15 Physics, at Class-12 standard. You get 60 seconds per question and +4 marks for every correct answer; wrong and unanswered questions score zero. You cannot go back to a previous question, and you get one attempt with your Login Key.',
  },
  {
    question: 'What happens after the test?',
    answer:
      'If you qualify, CIT’s Counselling Officer tele-counsels you within 24 hours, at the time slot you picked in your application. Keep your 10th and 12th marksheets ready and have your parents with you — the call takes about 15 minutes and covers branch, fees, hostel and next steps.',
  },
  {
    question: 'Why not drop a year and re-attempt the entrance exams?',
    answer:
      'A drop year costs you a full academic year plus coaching expenses, and still guarantees nothing. Qualifying in CIT’s merit test lets you start your B.E. now, on the same VTU degree, at a NAAC-accredited and AICTE-approved campus with an 85%+ placement record.',
  },
  {
    question: 'How will I know the fees?',
    answer:
      'The complete year-wise fee structure for every branch — tuition, admission fee, extra fees and hostel — is shown inside the application form itself, before you submit. There is no capitation fee and no consultancy or agent charge. You pay the college directly.',
  },
  {
    question: 'Can my family get an education loan?',
    answer:
      'Yes. For qualified students, CIT’s team explains how an education loan in the student’s own name can cover about 80% of the total study cost, including hostel, repaid after placement. The details are worked out on your tele-counselling call, along with any scholarships you are eligible for.',
  },
  {
    question: 'Is hostel and food arranged for outstation students?',
    answer:
      'Yes. Separate supervised hostels for boys and girls are on campus, with mess facilities and round-the-clock security. Rooms are allotted before you arrive, so nobody lands in Tumkur searching for accommodation. CIT has students from every region of India — and seniors who made the same journey. Students from Tumkur and nearby towns can also join as day scholars.',
  },
];

export default faqData;
