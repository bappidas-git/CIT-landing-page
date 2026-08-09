/* ============================================
   SEO Configuration
   Central configuration for all SEO-related
   settings, schemas, and page metadata.
   ============================================ */

import { faqData } from "../data/faqData";

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
  // The FAQPage JSON-LD and the on-page FAQ accordion read the SAME array —
  // edit the questions in src/data/faqData.js and both stay in sync. Google
  // penalises schema that does not match visible page content, so never
  // hand-write FAQ entries here.
  // =========================================
  faqs: faqData,

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
