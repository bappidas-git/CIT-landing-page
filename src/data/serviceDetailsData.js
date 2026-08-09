/* ============================================
   Service (B.E. branch) detail copy.

   Seat counts are never written by hand here —
   they are derived from src/data/meritProgram.js,
   the single source of truth for the
   CIT Merit-Based Selection Program 2026.
   ============================================ */

import { MERIT_BRANCHES, SESSION_LABEL } from "./meritProgram";

// Landing-page branch id -> the `short` code used in meritProgram.js.
const MERIT_SHORT_BY_ID = {
  "ai-data-science": "AI & DS",
  "computer-science": "CSE",
  "information-science": "ISE",
  "electronics-communication": "ECE",
  "electrical-electronics": "EEE",
  mechanical: "Mech",
  civil: "Civil",
};

/** Seats still open for a branch, straight from the program constants. */
export const seatsLeftFor = (id) =>
  MERIT_BRANCHES.find((b) => b.short === MERIT_SHORT_BY_ID[id])?.seats ?? 0;

/** "Only 2 seats left for Session 2026 — filled strictly on merit" */
export const seatsLine = (id) =>
  `Only ${seatsLeftFor(id)} seats left for ${SESSION_LABEL} — filled strictly on merit`;

const COMMENCEMENT = `${SESSION_LABEL} — Final Closure · Merit-Based Selection`;

export const serviceDetailsData = [
  {
    id: "ai-data-science",
    title: "B.E. Artificial Intelligence & Data Science",
    image: "https://placehold.co/600x400/0C2D48/FFFFFF?text=AI+%26+DS+Lab",
    commencement: COMMENCEMENT,
    frequency: "4-Year VTU Degree | NAAC Accredited | AICTE Approved",
    highlights: [
      "Future-ready careers in AI, ML and analytics",
      "Hands-on Python, deep learning & data science labs",
      "Project-based learning with industry mentors",
      "High-demand roles: Data Scientist, ML Engineer, AI Developer",
    ],
  },
  {
    id: "computer-science",
    title: "B.E. Computer Science & Engineering",
    image: "https://placehold.co/600x400/0C2D48/FFFFFF?text=CSE+Lab",
    commencement: COMMENCEMENT,
    frequency: "4-Year VTU Degree | NAAC Accredited | AICTE Approved",
    highlights: [
      "Strong placements with Accenture, Infosys, TCS, Wipro and more",
      "Full-stack, cloud, DevOps & cyber security labs",
      "DSA + system design + internship training",
      seatsLine("computer-science"),
    ],
  },
  {
    id: "information-science",
    title: "B.E. Information Science & Engineering",
    image: "https://placehold.co/600x400/0C2D48/FFFFFF?text=ISE+Lab",
    commencement: COMMENCEMENT,
    frequency: "4-Year VTU Degree | NAAC Accredited | AICTE Approved",
    highlights: [
      "Career scope across enterprise IT, software & data engineering",
      "Modern database, web & cloud computing labs",
      "Consistent recruitment by leading IT services companies",
      "Roles: System Analyst, Backend Developer, DBA",
    ],
  },
  {
    id: "electronics-communication",
    title: "B.E. Electronics & Communication Engineering",
    image: "https://placehold.co/600x400/0C2D48/FFFFFF?text=ECE+Lab",
    commencement: COMMENCEMENT,
    frequency: "4-Year VTU Degree | NAAC Accredited | AICTE Approved",
    highlights: [
      "VLSI, embedded systems & IoT R&D labs on campus",
      "Exposure to IOS-MCN R&D Centre with Bharat 6G Labs",
      "Strong demand in semiconductor, telecom & IT sectors",
      "Roles: Embedded Engineer, VLSI Engineer, RF Engineer",
    ],
  },
  {
    id: "electrical-electronics",
    title: "B.E. Electrical & Electronics Engineering",
    image: "https://placehold.co/600x400/0C2D48/FFFFFF?text=EEE+Lab",
    commencement: COMMENCEMENT,
    frequency: "4-Year VTU Degree | NAAC Accredited | AICTE Approved",
    highlights: [
      "Power systems, electric machines & smart grid labs",
      "Growing demand in renewable energy and EV sectors",
      "Recruitment through PSUs, manufacturing & private industry",
      "Roles: Electrical Engineer, Power Engineer, EV Engineer",
    ],
  },
  {
    id: "mechanical",
    title: "B.E. Mechanical Engineering",
    image: "https://placehold.co/600x400/0C2D48/FFFFFF?text=Mechanical+Lab",
    commencement: COMMENCEMENT,
    frequency: "4-Year VTU Degree | NAAC Accredited | AICTE Approved",
    highlights: [
      "CAD/CAM, CNC, thermal & manufacturing labs",
      "Aero-vision Drone Lab — AICTE-sponsored Centre of Excellence",
      "Recruitment by Bosch, Park Controls and core industry leaders",
      "Roles: Design Engineer, Production Engineer, Automotive Engineer",
    ],
  },
  {
    id: "civil",
    title: "B.E. Civil Engineering",
    image: "https://placehold.co/600x400/0C2D48/FFFFFF?text=Civil+Lab",
    commencement: COMMENCEMENT,
    frequency: "4-Year VTU Degree | NAAC Accredited | AICTE Approved",
    highlights: [
      "Structural, geotechnical, transportation & surveying labs",
      "Training in AutoCAD, STAAD.Pro & BIM tools",
      "Strong demand across govt. infrastructure & private construction",
      "Roles: Structural Engineer, Site Engineer, Govt. Engineer",
    ],
  },
];
