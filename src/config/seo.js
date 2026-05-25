/* ============================================
   SEO Configuration
   Central configuration for all SEO-related
   settings, schemas, and page metadata.
   ============================================ */

export const seoConfig = {
  // =========================================
  // Site-level Settings
  // =========================================
  siteName: "CIT Admissions",
  siteUrl: "https://www.cittumkur.org",
  defaultTitle:
    "CIT Tumakuru | Direct B.E. Engineering Admission 2026 — North East India",
  titleTemplate: "%s | CIT Tumakuru",
  defaultDescription:
    "Direct B.E. Engineering Admission 2026 at Channabasaveshwara Institute of Technology (CIT), Tumakuru — NAAC, AICTE, VTU-affiliated. Guided pathway, hostel & strong placements for North East students.",
  defaultImage:
    "https://placehold.co/1200x630/0C2D48/FFFFFF?text=CIT+Admissions+2026",
  locale: "en_IN",
  language: "en",

  // =========================================
  // Organization Details (Educational)
  // =========================================
  organization: {
    name: "Channabasaveshwara Institute of Technology",
    alternateName: "CIT Tumakuru",
    url: "https://www.cittumkur.org",
    logo: "https://res.cloudinary.com/dn9gyaiik/image/upload/v1779669113/logo-cit_ykpxvd.png",
    phone: "+91 8069645014",
    description:
      "Channabasaveshwara Institute of Technology (CIT), Tumakuru is a NAAC-accredited, AICTE-approved engineering college affiliated to VTU, Belagavi. Celebrating 25 years of academic excellence with strong placements and guided direct B.E. admissions for the 2026 intake.",
    address: {
      streetAddress: "NH 206, B.H. Road, Gubbi",
      addressLocality: "Tumakuru",
      addressRegion: "Karnataka",
      postalCode: "572216",
      addressCountry: "IN",
    },
    sameAs: [],
    foundingDate: "2001",
    // 7 B.E. programs offered (used for hasOfferingCatalog)
    courses: [
      {
        name: "B.E. — Artificial Intelligence & Data Science",
        description:
          "Four-year B.E. program in Artificial Intelligence & Data Science, affiliated to VTU.",
      },
      {
        name: "B.E. — Computer Science & Engineering",
        description:
          "Four-year B.E. program in Computer Science & Engineering, affiliated to VTU.",
      },
      {
        name: "B.E. — Information Science & Engineering",
        description:
          "Four-year B.E. program in Information Science & Engineering, affiliated to VTU.",
      },
      {
        name: "B.E. — Electronics & Communication Engineering",
        description:
          "Four-year B.E. program in Electronics & Communication Engineering, affiliated to VTU.",
      },
      {
        name: "B.E. — Electrical & Electronics Engineering",
        description:
          "Four-year B.E. program in Electrical & Electronics Engineering, affiliated to VTU.",
      },
      {
        name: "B.E. — Mechanical Engineering",
        description:
          "Four-year B.E. program in Mechanical Engineering, affiliated to VTU.",
      },
      {
        name: "B.E. — Civil Engineering",
        description:
          "Four-year B.E. program in Civil Engineering, affiliated to VTU.",
      },
    ],
  },

  // =========================================
  // Page-specific SEO Settings
  // =========================================
  pages: {
    home: {
      title:
        "CIT Tumakuru | Direct B.E. Engineering Admission 2026 — North East India",
      description:
        "Apply for Direct B.E. Engineering Admission 2026 at CIT Tumakuru. NAAC-accredited, AICTE-approved, VTU-affiliated. Hostel, scholarships & 85%+ placements. Guidance for NE students.",
      keywords:
        "cit tumakuru, direct be admission 2026, engineering admission karnataka, b.e. admission northeast india, vtu engineering college, naac engineering college, cit channabasaveshwara, engineering college tumakuru, hostel engineering karnataka, direct admission b.e.",
    },
    thankYou: {
      title: "Thank You | CIT Tumakuru B.E. Admissions 2026",
      description:
        "Thanks for your interest in CIT Tumakuru's Direct B.E. Admissions 2026. Our admission team will call you shortly to guide you through the process.",
      robots: "noindex, nofollow",
    },
    admin: {
      title: "Admin Panel | CIT Admissions",
      robots: "noindex, nofollow",
    },
  },

  // =========================================
  // FAQ Schema Data (Admissions)
  // =========================================
  faqs: [
    {
      question:
        "Who is eligible for direct B.E. admission at CIT Tumakuru for 2026?",
      answer:
        "Students who have passed 10+2 (Class 12) with Physics and Mathematics as compulsory subjects, plus one of Chemistry, Biology, Computer Science, Biotechnology or Electronics, are eligible to apply for Direct B.E. admission for the 2026 intake. North East students can apply through the guided admission pathway — contact our admission team for branch-specific eligibility.",
    },
    {
      question: "How do I apply for direct B.E. admission at CIT?",
      answer:
        "Submit the enquiry form on this page with your name, mobile, preferred B.E. branch and state. Our admission team will call you, explain the documents needed, share the application form and guide you end-to-end — no confusing counselling trips required.",
    },
    {
      question: "Which B.E. courses are offered at CIT Tumakuru?",
      answer:
        "CIT offers seven B.E. branches: Artificial Intelligence & Data Science, Computer Science & Engineering, Information Science & Engineering, Electronics & Communication Engineering, Electrical & Electronics Engineering, Mechanical Engineering and Civil Engineering — all affiliated to VTU, Belagavi.",
    },
    {
      question: "What about fees and scholarships?",
      answer:
        "Fee structure varies by B.E. branch and is set as per VTU/AICTE norms. Merit-based fee assistance may be available for eligible students. Please contact our admission team for the latest 2026 fee details and scholarship guidance.",
    },
    {
      question: "Is hostel accommodation available for North East students?",
      answer:
        "Yes. CIT offers safe, supervised hostel and mess facilities for outstation students, including those from North East India. The hostel is on campus with full boarding, study spaces and round-the-clock security.",
    },
    {
      question: "How strong are CIT's placements?",
      answer:
        "Over 90+ reputed companies visit CIT every year with 85%+ overall placement for eligible students, sustained over the last 8 years. Recruiters include Accenture, Infosys, Deloitte, HCLTech, TCS, Tech Mahindra, Wipro and more. Highest CTC is 15 LPA with a median of 5 LPA.",
    },
    {
      question: "Is CIT recognised and accredited?",
      answer:
        "Yes. CIT is NAAC accredited, ISO 9001:2015 certified, approved by AICTE, New Delhi, and affiliated to Visvesvaraya Technological University (VTU), Belagavi. CET Code: E101 · COMED-K Code: E035.",
    },
    {
      question: "What is the last date to apply for 2026 B.E. admission?",
      answer:
        "Seats for the 2026 B.E. intake are limited and filled on a first-come, first-served basis. We recommend applying early. For the exact closing date, please contact our admission team.",
    },
  ],

  // =========================================
  // CollegeOrUniversity Schema Settings
  // =========================================
  localBusiness: {
    type: "CollegeOrUniversity",
    priceRange: "$$",
    openingHours: {
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "17:00",
    },
    geo: {
      latitude: "13.3133",
      longitude: "76.9971",
    },
    hasMap:
      "https://www.google.com/maps/search/?api=1&query=Channabasaveshwara+Institute+of+Technology+Tumakuru",
  },
};
