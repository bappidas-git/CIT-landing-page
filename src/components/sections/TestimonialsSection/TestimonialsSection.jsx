/* ============================================
   TestimonialsSection Component
   Students from across India who are already at
   CIT — the strongest proof a wavering parent can
   be given.

   Gated on `testimonialsData.isLive`: while the
   data file still holds sample structure the whole
   section returns null, so placeholder copy can
   never reach a visitor. See the launch-blocker
   note in src/data/testimonialsData.js.

   No framer-motion here — the section is lazy
   loaded and CSS handles the only transition.
   ============================================ */

import React from "react";
import { Container } from "@mui/material";
import { testimonialsData } from "../../../data/testimonialsData";
import styles from "./TestimonialsSection.module.css";

/**
 * Initials for the avatar slot — used until a consented photograph exists for
 * a student. Deliberately not a placeholder image service: a generated
 * stand-in photo of a person who does not exist is a lie, an initials disc is
 * a design choice.
 * @param {string} name - Student's name
 * @returns {string} One or two uppercase initials
 */
const getInitials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "•";

const QuoteMark = () => (
  <svg
    className={styles.quoteMark}
    width="28"
    height="28"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M10 7L8 11H11V17H5V11L7 7H10M18 7L16 11H19V17H13V11L15 7H18Z"
    />
  </svg>
);

const TestimonialsSection = () => {
  const { isLive, testimonials } = testimonialsData;

  // Sample content stays off the page until real, consented testimonials land.
  if (!isLive || !Array.isArray(testimonials) || testimonials.length === 0) {
    return null;
  }

  return (
    <section
      id="student-stories"
      className={styles.section}
      aria-labelledby="student-stories-title"
    >
      <div className={styles.bgDecor} aria-hidden="true" />

      <Container maxWidth="xl">
        <div className={styles.header}>
          <span className={styles.badge}>Student Stories</span>
          <h2 id="student-stories-title" className={styles.title}>
            Students From Across India,{" "}
            <span className={styles.titleAccent}>Now at CIT</span>
          </h2>
          <p className={styles.subtitle}>
            The journey from home to Tumkur, in their own words.
          </p>
        </div>

        <ul className={styles.grid}>
          {testimonials.map((student) => (
            <li key={student.id || student.name} className={styles.card}>
              <QuoteMark />

              <blockquote className={styles.quote}>
                {student.quote}
              </blockquote>

              <div className={styles.student}>
                <div className={styles.avatar}>
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className={styles.avatarPhoto}
                      loading="lazy"
                      width="56"
                      height="56"
                    />
                  ) : (
                    <span className={styles.avatarInitials} aria-hidden="true">
                      {getInitials(student.name)}
                    </span>
                  )}
                </div>

                <div className={styles.studentMeta}>
                  <p className={styles.studentName}>{student.name}</p>
                  <p className={styles.studentHome}>
                    {[student.hometown, student.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className={styles.studentBranch}>
                    {[student.branch, student.year].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
