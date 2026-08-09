/* ============================================
   UniversityResultsSection — VTU Results Showcase
   Gold medalists, the VTU rank-holder wall and the
   institutional awards timeline. Text only, no
   student photographs; every figure comes from
   src/data/vtuResultsData.js (transcribed from the
   posters in resources/).
   ============================================ */

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Container, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import {
  GOLD_MEDALISTS,
  TOP_RANKERS,
  RANK_HOLDERS,
  AWARDS_TIMELINE,
} from '../../../data/vtuResultsData';
import styles from './UniversityResultsSection.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const UniversityResultsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      className={styles.resultsSection}
      id="university-results"
      ref={ref}
    >
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>UNIVERSITY RESULTS</span>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
                color: '#0C2D48',
                marginTop: '0.75rem',
                textAlign: 'center',
                lineHeight: 1.25,
              }}
            >
              University Results That{' '}
              <span className={styles.highlightText}>
                Ordinary Colleges Don&apos;t Have
              </span>
            </Typography>
            <div className={styles.titleUnderline}>
              <span className={styles.underlineBar} />
            </div>
            <Typography className={styles.sectionSubtitle}>
              Consistent VTU rank holders year after year — the same
              Visvesvaraya Technological University degree, earned at the top of
              the university list.
            </Typography>
          </motion.div>

          {/* Gold Medalist & Topper Highlight Cards */}
          <motion.div variants={itemVariants} className={styles.honoursGrid}>
            {GOLD_MEDALISTS.map((student) => (
              <div
                key={student.usn}
                className={`${styles.honourCard} ${styles.honourCardGold}`}
              >
                <div className={styles.honourIconWrap}>
                  <Icon
                    icon="mdi:medal-outline"
                    className={styles.honourIcon}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.honourBody}>
                  <span className={styles.honourEyebrow}>VTU Gold Medalist</span>
                  <Typography className={styles.honourName}>
                    {student.name}
                  </Typography>
                  <Typography className={styles.honourDetail}>
                    {student.award}
                  </Typography>
                  <span className={styles.honourMeta}>
                    {student.usn} · {student.awardedBy}
                  </span>
                </div>
              </div>
            ))}

            {TOP_RANKERS.map((student) => (
              <div key={student.usn} className={styles.honourCard}>
                <div className={styles.honourIconWrap}>
                  <Icon
                    icon="mdi:trophy-award"
                    className={styles.honourIcon}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.honourBody}>
                  <span className={styles.honourEyebrow}>
                    {student.achievement}
                  </span>
                  <Typography className={styles.honourName}>
                    {student.name}
                  </Typography>
                  <Typography className={styles.honourDetail}>
                    {student.detail}
                  </Typography>
                  <span className={styles.honourMeta}>{student.usn}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* VTU Rank Holder Wall */}
          <motion.div variants={itemVariants} className={styles.wallBlock}>
            <Typography variant="h3" className={styles.blockTitle}>
              VTU Rank Holders
            </Typography>
            <ul className={styles.rankGrid}>
              {RANK_HOLDERS.map((holder) => (
                <li
                  key={`${holder.name}-${holder.year}`}
                  className={styles.rankCard}
                >
                  <span className={styles.rankBadge}>{holder.rank}</span>
                  <Typography className={styles.rankName}>
                    {holder.name}
                  </Typography>
                  <Typography className={styles.rankProgram}>
                    {holder.program}
                  </Typography>
                  <span className={styles.rankYear}>
                    {holder.year}
                    {holder.note ? ` · ${holder.note}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Institutional Awards Timeline */}
          <motion.div variants={itemVariants} className={styles.awardsBlock}>
            <Typography variant="h3" className={styles.blockTitle}>
              Recognised Year After Year
            </Typography>
            <ul className={styles.awardsStrip}>
              {AWARDS_TIMELINE.map((award) => (
                <li key={award.year} className={styles.awardCard}>
                  <span className={styles.awardYear}>{award.year}</span>
                  <Typography className={styles.awardTitle}>
                    {award.title}
                  </Typography>
                  <span className={styles.awardBy}>{award.by}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default UniversityResultsSection;
