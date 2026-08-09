/* ============================================
   FAQ Data — CIT Direct B.E. Admission 2026

   Single source of truth for BOTH the on-page FAQ
   accordion (FAQSection) and the FAQPage JSON-LD
   (src/config/seo.js re-exports this array), so
   the page and the schema can never drift apart.

   House rules for every answer here:
   - factual, ≤ 60 words
   - no scarcity, no countdowns, no urgency prompts
   - no fee amounts (the fee structure is shared on
     the counselling call, in writing)
   ============================================ */

export const faqData = [
  {
    question: 'What does “direct B.E. admission” at CIT actually mean?',
    answer:
      'It is admission through the management quota every VTU-affiliated college in Karnataka is allotted, handled by CIT’s own admission office. You apply to the college directly — no agent, no consultancy. The degree is the same VTU B.E. degree, from the same NAAC-accredited, AICTE-approved campus.',
  },
  {
    question: 'Who is eligible for the 2026 B.E. intake?',
    answer:
      'You need 45% aggregate in Physics, Mathematics and one more science subject in your 12th — 40% for reserved categories. Students appearing for their 2026 board exams can apply now. Diploma holders join the second year through lateral entry. The application checks your eligibility as you enter your marks.',
  },
  {
    question: 'Which documents will I need?',
    answer:
      'Nothing for the counselling call — we start from the details in your application. To confirm a seat you will need your 10th and 12th marksheets, transfer certificate, migration certificate, category certificate if applicable, Aadhaar and passport photographs. The admission desk shares the full checklist in writing.',
  },
  {
    question: 'How will I know the fees?',
    answer:
      'CIT’s admission team shares the complete fee structure — tuition, hostel and mess — in writing on your first counselling call, once your eligibility and branch are confirmed. There is no capitation fee and no consultancy or agent charge. You pay the college directly.',
  },
  {
    question: 'Can you help with an education loan?',
    answer:
      'Yes. The admission desk helps your family prepare education-loan paperwork for nationalised and private banks, including the documents banks ask the college to provide. Funding is normally arranged before you travel. Tell us your funding plan in the application and the counsellor will raise it on the call.',
  },
  {
    question: 'Is hostel and food arranged for North East students?',
    answer:
      'Yes. Separate supervised hostels for boys and girls are on campus, with mess facilities and round-the-clock security. Rooms are allotted before you arrive, so nobody lands in Tumakuru searching for accommodation. CIT has an active North East student community and seniors who made the same journey.',
  },
  {
    question: 'What are placements really like?',
    answer:
      'Over the last eight years CIT has sustained 85%+ placement for eligible students, with 90+ recruiters visiting campus each year — among them Accenture, Infosys, Deloitte, HCLTech, TCS, Tech Mahindra and Wipro. Eligibility depends on academic performance and backlogs, which the placement cell explains from first year.',
  },
  {
    question: 'Can my parents be part of the counselling?',
    answer:
      'Yes — we prefer it. The application asks for a parent or guardian’s mobile number, and our counsellor speaks to them about fees, hostel, safety and travel. Counselling can be a WhatsApp video call, a phone call or a campus visit, whichever suits your family.',
  },
];

export default faqData;
