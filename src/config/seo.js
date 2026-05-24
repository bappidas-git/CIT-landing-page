/* ============================================
   SEO Configuration
   Central configuration for all SEO-related
   settings, schemas, and page metadata.
   ============================================ */

export const seoConfig = {
  // =========================================
  // Site-level Settings
  // =========================================
  siteName: "Monjoven",
  siteUrl: "https://www.monjoven.com",
  defaultTitle: "Monjoven | Hair Transplant & Cosmetic Surgery in Guwahati",
  titleTemplate: "%s | Monjoven",
  defaultDescription:
    "Monjoven is the first dedicated hair transplant clinic in Northeast India, led by Dr. Porag Neog with 25+ years of experience in plastic surgery and 15+ years in hair transplant. Expert FUE & FUT hair transplant, cosmetic surgery, and aesthetic treatments in Guwahati, Assam. Consult Dr. Porag Neog today.",
  defaultImage: "https://www.monjoven.com/og-image.jpg",
  locale: "en_IN",
  language: "en",

  // =========================================
  // Organization Details
  // =========================================
  organization: {
    name: "Monjoven Hair Transplant & Cosmetic Surgery",
    alternateName: "Monjoven",
    url: "https://www.monjoven.com",
    logo: "https://www.monjoven.com/assets/img/logo.png",
    email: "dr@monjoven.com",
    phone: "+91 9181956562",
    description:
      "Monjoven is Northeast India's first dedicated hair transplant clinic, offering advanced FUE & FUT hair restoration, cosmetic surgery, and aesthetic treatments in Guwahati, Assam. Founded by Dr. Porag Neog with over 25 years of experience in plastic surgery and 15+ years in hair transplant.",
    address: {
      streetAddress: "VIP Road, Borbari, Six Mile, Near Pratiksha Hospital",
      addressLocality: "Guwahati",
      addressRegion: "Assam",
      postalCode: "",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.facebook.com/MONJOVEN/",
      "https://www.instagram.com/monjoven_",
    ],
    founder: {
      name: "Dr. Porag Neog",
      jobTitle: "Cosmetic Surgeon & Founder",
    },
    foundingDate: "2012",
  },

  // =========================================
  // Page-specific SEO Settings
  // =========================================
  pages: {
    home: {
      title: "Monjoven | Hair Transplant & Cosmetic Surgery in Guwahati, Assam",
      description:
        "Northeast India's first dedicated hair transplant clinic. Led by Dr. Porag Neog (MBBS, MS) with 25+ years of experience in plastic surgery and 15+ years in hair transplant. Advanced Micro-FUE technology, free post operative care. Book your consultation today.",
      keywords:
        "hair transplant guwahati, fue hair transplant assam, hair transplant northeast india, cosmetic surgery guwahati, dr porag neog, monjoven, beard transplant, rhinoplasty assam, prp therapy guwahati",
    },
    thankYou: {
      title: "Thank You | Monjoven Hair Transplant & Cosmetic Surgery",
      description:
        "Thank you for your consultation request. Dr. Neog's team will contact you within 24 hours.",
      robots: "noindex, nofollow",
    },
    admin: {
      title: "Admin Panel | Monjoven",
      robots: "noindex, nofollow",
    },
  },

  // =========================================
  // FAQ Schema Data
  // =========================================
  faqs: [
    {
      question: "What is a hair transplant and how does it work?",
      answer:
        "A hair transplant is a surgical procedure that moves hair follicles from a donor area (usually the back of the head) to balding or thinning areas. At Monjoven, we use both FUE (Follicular Unit Extraction) and FUT (Follicular Unit Transplantation) methods. FUE uses micro punches (0.6-1.25mm) to extract individual follicles, while FUT involves removing a strip for graft separation. Both methods produce permanent, natural-looking results.",
    },
    {
      question: "What is the difference between FUE and FUT hair transplant?",
      answer:
        "FUE (Follicular Unit Extraction) extracts individual follicles using tiny punches, leaving minimal scarring with faster recovery. FUT (Follicular Unit Transplantation) removes a strip of scalp for graft harvesting, allowing more grafts in a single session. Dr. Porag Neog at Monjoven recommends the best method based on your hair loss pattern, donor area, and desired results.",
    },
    {
      question: "How long does a hair transplant procedure take?",
      answer:
        "A typical hair transplant at Monjoven takes 6-8 hours, performed in a single session under local anesthesia. The duration depends on the number of grafts needed. You remain comfortable throughout with our luxury clinic amenities including healthy & hygienic meals and snacks.",
    },
    {
      question: "Is the hair transplant procedure painful?",
      answer:
        "The procedure is performed under local anesthesia, so you feel minimal discomfort. Most patients report the experience as painless. After the procedure, any mild soreness is easily managed with prescribed medication. Dr. Neog ensures patient comfort throughout the process.",
    },
    {
      question: "What is the recovery time after a hair transplant?",
      answer:
        "Most patients return to normal activities within 2-3 days. FUE has faster recovery than FUT as there are no sutures. Monjoven provides free 2-week follow-up care and 4 months of complimentary laser therapy to accelerate healing and hair growth.",
    },
    {
      question: "When will I see results after my hair transplant?",
      answer:
        "Initial growth begins at 3-4 months, with significant improvement visible at 6-8 months. Full results are typically seen at 12-18 months. The transplanted hair is permanent and grows naturally for a lifetime.",
    },
    {
      question: "How much does a hair transplant cost at Monjoven?",
      answer:
        "The cost depends on the number of grafts required, technique used (FUE or FUT), and the extent of hair loss. We offer transparent pricing with no hidden costs. Book a consultation with Dr. Porag Neog for a personalized assessment and detailed cost estimate.",
    },
    {
      question: "Who is a good candidate for hair transplant?",
      answer:
        "Good candidates include individuals with male/female pattern baldness, adequate donor hair, and realistic expectations. Age, hair type, and medical history are considered. Dr. Neog evaluates each case personally to determine the best treatment approach.",
    },
    {
      question: "Does Monjoven offer non-surgical hair loss treatments?",
      answer:
        "Yes, Monjoven offers PRP (Platelet-Rich Plasma) therapy and laser therapy as non-surgical options for hair loss. These can be standalone treatments or complement surgical procedures for enhanced results.",
    },
    {
      question: "Why should I choose Monjoven for my hair transplant?",
      answer:
        "Monjoven is Northeast India's first dedicated hair transplant clinic, led by Dr. Porag Neog (MBBS, MS) with 25+ years of experience in plastic surgery and 15+ years in hair transplant. We use the smallest FUE punch technology, offer free post-operative laser therapy, 24/7 support, and have served patients from 10+ countries with results at par with international standards.",
    },
  ],

  // =========================================
  // LocalBusiness Schema Settings
  // =========================================
  localBusiness: {
    type: "MedicalBusiness",
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
      closes: "18:00",
    },
    geo: {
      latitude: "26.1445",
      longitude: "91.7862",
    },
    medicalSpecialty: "Cosmetic Surgery, Hair Transplant",
    isAcceptingNewPatients: true,
    hasMap: "https://maps.google.com/?cid=monjoven-guwahati",
    availableService: [
      {
        name: "FUE Hair Transplant",
        description: "Follicular Unit Extraction hair restoration",
      },
      {
        name: "FUT Hair Transplant",
        description: "Follicular Unit Transplantation hair restoration",
      },
      {
        name: "Beard Transplant",
        description: "Facial hair restoration surgery",
      },
      {
        name: "PRP Therapy",
        description: "Platelet-Rich Plasma therapy for hair loss",
      },
      { name: "Rhinoplasty", description: "Cosmetic nose surgery" },
      {
        name: "Cosmetic Surgery",
        description: "Aesthetic and cosmetic surgical procedures",
      },
    ],
  },
};
