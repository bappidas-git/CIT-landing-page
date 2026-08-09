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
  defaultTitle: "CIT Tumakuru, Karnataka | Merit-Based B.E. Admissions 2026",
  titleTemplate: "%s | CIT Tumakuru",
  defaultDescription:
    "CIT Tumakuru, Karnataka — 70 km from Bengaluru. NAAC, AICTE, VTU. Only 15 B.E. seats left for Session 2026, filled by a 30-minute online merit test.",
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
      "Channabasaveshwara Institute of Technology (CIT), Tumakuru is a NAAC-accredited, AICTE-approved engineering college in Karnataka — about 70 km from Bengaluru on NH-206 — affiliated to VTU, Belagavi. Celebrating 25 years of academic excellence with strong placements. The final 15 B.E. seats for Session 2026 are filled on merit through the CIT Merit-Based Selection Program 2026.",
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
      title: "CIT Tumakuru, Karnataka | Merit-Based B.E. Admissions 2026",
      description:
        "CIT Tumakuru, Karnataka — 70 km from Bengaluru. NAAC, AICTE, VTU. Only 15 B.E. seats left for Session 2026, filled by a 30-minute online merit test.",
      keywords:
        "cit tumakuru karnataka, cit engineering college near bengaluru, merit based engineering admission 2026, b.e. admission karnataka merit test, top engineering colleges karnataka, cit tumakuru, engineering admission karnataka, b.e. admission northeast india, vtu engineering college, naac engineering college, cit channabasaveshwara, engineering college tumakuru, hostel engineering karnataka",
    },
    thankYou: {
      title: "Thank You | CIT Tumakuru B.E. Admissions 2026",
      description:
        "Your application for the CIT Merit-Based Selection Program 2026 is in. Next step: take the 30-Minute Online Merit Assessment Test using your Test Login Key.",
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
