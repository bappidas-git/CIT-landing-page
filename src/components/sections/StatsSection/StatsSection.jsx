/* ============================================
   StatsSection Component (Placements & Recruiters)
   Placement-proof headline stats + recruiter logo wall
   ============================================ */

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Container, Typography, Grid, useMediaQuery, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import AnimatedCounter from '../../common/AnimatedCounter/AnimatedCounter';
import useApplyCTA from '../../../hooks/useApplyCTA';
import { trackCTAClick } from '../../../utils/gtm';
import { statsData } from '../../../data/statsData';
import {
  PLACEMENT_YEARS,
  BRANCH_PLACEMENTS,
  PLACEMENT_SOURCE_NOTE,
} from '../../../data/placementsData';
import styles from './StatsSection.module.css';

const HEADLINE_STAT_IDS = [2, 3, 4];

/**
 * Every name here is on a CIT recruiter wall (`resources/Info-1/3/4.jpeg`)
 * or was already verified site content (TCS, Bosch). Ordered most- to
 * least-recognisable: the first RECRUITERS_VISIBLE render on load, the
 * rest sit behind the "+N more" toggle so the wall stays readable at 360px.
 */
const RECRUITERS = [
  'Accenture',
  'Infosys',
  'Deloitte',
  'HCLTech',
  'TCS',
  'Tech Mahindra',
  'Cognizant',
  'Wipro',
  'Mphasis',
  'IDFC First Bank',
  'Zscaler',
  'UST',
  'NTT Data',
  'Bosch',
  'Park Controls',
  'Boomi',
  'HashedIn by Deloitte',
  'Indo-MIM',
  'Travancore Analytics',
  'Ivoyant',
  'Aarbee',
  'RGSM Power',
  'Deduce Technologies',
  'NASH',
  'CGS',
  'Khyath',
  'Acmegrade',
  'Corizo',
  'MCoreta',
  'RCCL',
  'DNR',
  'Nag Interiors',
  'Eleation',
];

const RECRUITERS_VISIBLE = 20;

/**
 * Real recruiter logos, once CIT supplies licensed artwork: add
 * `'Infosys': 'https://…/infosys.svg'` here and that chip renders as an <img>
 * instead of a text pill. Everything without an entry stays a name chip.
 *
 * Deliberately the ONLY way an image reaches this wall. It used to render
 * machine-generated placeholder images from a third-party service, which read
 * as a broken page to a parent deciding where to send their child — that is
 * now impossible to ship by accident.
 * @type {Object<string, string>}
 */
const RECRUITER_LOGOS = {};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const logoVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * i,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// Parse stat value for AnimatedCounter
const parseStatValue = (stat) => {
  const raw = String(stat).trim();
  // "15 LPA" -> { value: 15, suffix: " LPA" }
  // "85%+" -> { value: 85, suffix: "%+" }
  // "90+" -> { value: 90, suffix: "+" }
  const match = raw.match(/^([\d.]+)(.*)$/);
  if (!match) return { value: 0, suffix: '', decimals: 0, text: raw };

  const numStr = match[1];
  const suffix = match[2] || '';
  const value = parseFloat(numStr);
  const decimals = numStr.includes('.') ? (numStr.split('.')[1] || '').length : 0;

  return { value, suffix, decimals };
};

const StatsSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const applyCTA = useApplyCTA('apply-now', { location: 'placements' });
  const [showAllRecruiters, setShowAllRecruiters] = useState(false);

  const headlineStats = statsData.filter((s) => HEADLINE_STAT_IDS.includes(s.id));
  const visibleRecruiters = showAllRecruiters
    ? RECRUITERS
    : RECRUITERS.slice(0, RECRUITERS_VISIBLE);
  const hiddenRecruiterCount = RECRUITERS.length - RECRUITERS_VISIBLE;

  const handleApplyNow = (event) => {
    trackCTAClick('placements_apply_now', 'placements', 'Start My Application');
    applyCTA.onClick(event);
  };

  return (
    <section className={styles.statsSection} id="placements" ref={ref}>
      {/* Background Pattern */}
      <div className={styles.patternBg} />

      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <Typography className={styles.overline}>Proof, Not Promises</Typography>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                color: '#0C2D48',
                marginBottom: { xs: '0.75rem', md: '1rem' },
              }}
            >
              The placement record behind{' '}
              <span className={styles.accentText}>the 15 seats</span>
            </Typography>
            <Typography
              className={styles.sectionSubtitle}
              sx={{
                fontSize: { xs: '0.9375rem', md: '1.0625rem' },
                color: '#475569',
                maxWidth: '720px',
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Consistent placement outcomes, a median CTC of around 5 LPA, and 90+
              recruiters on campus every year — proof that a CIT B.E. degree opens
              real doors.
            </Typography>
          </motion.div>

          {/* Headline Stats Grid */}
          <Grid container spacing={isMobile ? 2 : 3} className={styles.statsGrid} justifyContent="center">
            {headlineStats.map((stat, index) => {
              const parsed = parseStatValue(stat.stat);
              return (
                <Grid item xs={12} sm={6} md={4} key={stat.id}>
                  <motion.div
                    className={styles.statCard}
                    custom={index}
                    variants={cardVariants}
                    whileHover={{
                      y: -4,
                      boxShadow: '0 14px 28px rgba(12, 45, 72, 0.12)',
                      transition: { duration: 0.25 },
                    }}
                  >
                    <div className={styles.statIconWrapper}>
                      <Icon icon={stat.icon} className={styles.statIcon} />
                    </div>
                    <div className={styles.statValue}>
                      {parsed.text ? (
                        <span>{parsed.text}</span>
                      ) : (
                        <AnimatedCounter
                          value={parsed.value}
                          suffix={parsed.suffix}
                          decimals={parsed.decimals}
                          duration={1.6}
                          delay={0.2 + index * 0.1}
                          color="dark"
                        />
                      )}
                    </div>
                    <Typography className={styles.statLabel}>
                      {stat.statLabel}
                    </Typography>
                    <Typography className={styles.statTitle}>
                      {stat.title}
                    </Typography>
                    <Typography className={styles.statDescription}>
                      {stat.description}
                    </Typography>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* Last 3 Years — Placement Record
              One semantic <table>. At <768px the CSS collapses it into one
              card per year (each cell labelled from its data-label), so the
              page never scrolls sideways on a 360px phone. */}
          <motion.div variants={itemVariants} className={styles.recordBlock}>
            <div className={styles.recordHeader}>
              <Typography className={styles.recordEyebrow}>
                Verified Record
              </Typography>
              <Typography variant="h3" className={styles.recordTitle}>
                Last 3 Years — Placement Record
              </Typography>
            </div>

            <table className={styles.recordTable}>
              <thead>
                <tr>
                  <th scope="col">Academic Year</th>
                  <th scope="col">Students Placed</th>
                  <th scope="col">Eligible Students Placed</th>
                  <th scope="col">Highest CTC</th>
                  <th scope="col">Companies Visited</th>
                </tr>
              </thead>
              <tbody>
                {PLACEMENT_YEARS.map((row) => {
                  const mark = row.provisional ? '*' : '';
                  return (
                    <tr key={row.year}>
                      <th scope="row" className={styles.recordYear}>
                        {row.year}
                      </th>
                      <td data-label="Students Placed">
                        <span className={styles.recordValue}>
                          {row.placements}
                          {mark}
                        </span>
                      </td>
                      <td data-label="Eligible Students Placed">
                        <span className={styles.recordValue}>
                          {row.percentPlaced}%{mark}
                        </span>
                      </td>
                      <td data-label="Highest CTC">
                        <span className={styles.recordValue}>
                          {row.highestCTC.toFixed(1)} LPA
                        </span>
                      </td>
                      <td data-label="Companies Visited">
                        <span className={styles.recordValue}>{row.companies}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Branch-wise strip — native disclosure, no JS, no bundle cost */}
            <details className={styles.branchDetails}>
              <summary className={styles.branchSummary}>
                <Icon
                  icon="mdi:chevron-down"
                  className={styles.branchChevron}
                  aria-hidden="true"
                />
                <span>Branch-wise offers &amp; companies</span>
              </summary>
              <ul className={styles.branchList}>
                {BRANCH_PLACEMENTS.map((branch) => (
                  <li key={branch.branch} className={styles.branchRow}>
                    <span className={styles.branchName}>{branch.branch}</span>
                    <span className={styles.branchStat}>
                      <strong>{branch.offers}</strong> offers
                    </span>
                    <span className={styles.branchStat}>
                      <strong>{branch.companies}</strong> companies
                    </span>
                    <span className={styles.branchStat}>
                      Highest <strong>{branch.highestCTC.toFixed(1)} LPA</strong>
                    </span>
                  </li>
                ))}
              </ul>
            </details>

            <p className={styles.recordNote}>{PLACEMENT_SOURCE_NOTE}</p>
          </motion.div>

          {/* Recruiter Logo Wall */}
          <motion.div variants={itemVariants} className={styles.recruiterBlock}>
            <div className={styles.recruiterHeader}>
              <Typography className={styles.recruiterEyebrow}>
                Recruiter Network
              </Typography>
              <Typography variant="h3" className={styles.recruiterTitle}>
                Our students are hired by{' '}
                <span className={styles.recruiterTitleAccent}>
                  90+ leading companies
                </span>
              </Typography>
              <Typography
                className={styles.recruiterCaption}
                sx={{
                  maxWidth: '640px',
                  mx: 'auto',
                  textAlign: 'center',
                  color: '#475569',
                }}
              >
                From global IT majors to product engineering, banking, and core
                manufacturing — top recruiters trust CIT talent.
              </Typography>
            </div>

            <ul className={styles.logoGrid}>
              {visibleRecruiters.map((name, index) => (
                <motion.li
                  key={name}
                  className={styles.logoCard}
                  /* Chips revealed by the toggle restart the stagger from 0
                     instead of inheriting a second-long delay. */
                  custom={index % RECRUITERS_VISIBLE}
                  variants={logoVariants}
                >
                  {RECRUITER_LOGOS[name] ? (
                    <img
                      src={RECRUITER_LOGOS[name]}
                      alt={`${name} recruiter logo`}
                      loading="lazy"
                      width="160"
                      height="80"
                      className={styles.logoImage}
                    />
                  ) : (
                    <span className={styles.logoName}>{name}</span>
                  )}
                </motion.li>
              ))}
            </ul>

            {hiddenRecruiterCount > 0 && (
              <div className={styles.recruiterToggleRow}>
                <button
                  type="button"
                  className={styles.recruiterToggle}
                  onClick={() => setShowAllRecruiters((open) => !open)}
                  aria-expanded={showAllRecruiters}
                >
                  {showAllRecruiters
                    ? 'Show fewer recruiters'
                    : `+${hiddenRecruiterCount} more recruiters`}
                </button>
              </div>
            )}

            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.ctaButton}
                onClick={handleApplyNow}
                onPointerDown={applyCTA.onPointerDown}
              >
                <Icon
                  icon="mdi:rocket-launch-outline"
                  className={styles.ctaButtonIcon}
                />
                <span>Start My Application</span>
              </button>
              <span className={styles.ctaHint}>
                Direct college admission · No consultancy or agent fees
              </span>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default StatsSection;
