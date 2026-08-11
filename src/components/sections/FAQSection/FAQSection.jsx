/* ============================================
   FAQSection Component
   The eight questions a family asks
   before they trust a Karnataka college with
   their child — answered on the page instead of
   held back for the call.

   Built on native <details>/<summary>: keyboard
   and screen-reader accessible with no JavaScript,
   no MUI Accordion and no framer-motion, so the
   section costs almost nothing on a budget
   Android.

   Questions and answers come from
   src/data/faqData.js — the same array the
   FAQPage JSON-LD is generated from.
   ============================================ */

import React from "react";
import { Container } from "@mui/material";
import { faqData } from "../../../data/faqData";
import { trackContactClick } from "../../../utils/contactTracking";
import styles from "./FAQSection.module.css";

const SUPPORT_PHONE_DISPLAY = "+91 84536 23233";
const SUPPORT_PHONE_HREF = "tel:+918453623233";

const ChevronIcon = () => (
  <svg
    className={styles.chevron}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
  </svg>
);

const FAQSection = () => (
  <section id="faq" className={styles.section} aria-labelledby="faq-title">
    <div className={styles.bgDecor} aria-hidden="true" />

    <Container maxWidth="md">
      <div className={styles.header}>
        <span className={styles.badge}>Questions &amp; Answers</span>
        <h2 id="faq-title" className={styles.title}>
          Before You Apply — <span className={styles.titleAccent}>Answered</span>
        </h2>
        <p className={styles.subtitle}>
          Eligibility, documents, fees, hostel and placements — the things
          families ask us most often.
        </p>
      </div>

      <div className={styles.list}>
        {faqData.map((item, index) => (
          <details key={item.question} className={styles.item}>
            <summary className={styles.question}>
              <span className={styles.questionNumber} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.questionText}>{item.question}</span>
              <ChevronIcon />
            </summary>
            <div className={styles.answer}>
              <p className={styles.answerText}>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <p className={styles.footNote}>
        Something we haven&apos;t answered? Call{" "}
        <a
          href={SUPPORT_PHONE_HREF}
          className={styles.footLink}
          onClick={() => trackContactClick("phone", "faq")}
        >
          {SUPPORT_PHONE_DISPLAY}
        </a>{" "}
        — our admission team responds within 24 hours, Monday–Saturday.
      </p>
    </Container>
  </section>
);

export default FAQSection;
