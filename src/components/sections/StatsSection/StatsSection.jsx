/* ============================================
   StatsSection Component (Placements & Recruiters)
   Placement-proof headline stats + recruiter logo wall
   ============================================ */

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Container, Typography, Grid, useMediaQuery, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import AnimatedCounter from '../../common/AnimatedCounter/AnimatedCounter';
import { useModal } from '../../../context/ModalContext';
import { trackCTAClick } from '../../../utils/gtm';
import { statsData } from '../../../data/statsData';
import styles from './StatsSection.module.css';

const HEADLINE_STAT_IDS = [2, 3, 4];

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
];

const recruiterLogoUrl = (name) =>
  `https://placehold.co/160x80/FFFFFF/0C2D48?text=${encodeURIComponent(name)}`;

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
  const { openLeadDrawer } = useModal();

  const headlineStats = statsData.filter((s) => HEADLINE_STAT_IDS.includes(s.id));

  const handleApplyNow = () => {
    trackCTAClick('placements_apply_now', 'placements', 'Apply for 2026 Admission');
    openLeadDrawer('apply-now');
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
            <Typography className={styles.overline}>Placements</Typography>
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
              Strong Placements,{' '}
              <span className={styles.accentText}>Bright Futures</span>
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

            <div className={styles.logoGrid}>
              {RECRUITERS.map((name, index) => (
                <motion.div
                  key={name}
                  className={styles.logoCard}
                  custom={index}
                  variants={logoVariants}
                >
                  <img
                    src={recruiterLogoUrl(name)}
                    alt={`${name} recruiter logo`}
                    loading="lazy"
                    width="160"
                    height="80"
                    className={styles.logoImage}
                  />
                </motion.div>
              ))}
            </div>

            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.ctaButton}
                onClick={handleApplyNow}
              >
                <Icon
                  icon="mdi:rocket-launch-outline"
                  className={styles.ctaButtonIcon}
                />
                <span>Apply for 2026 Admission</span>
              </button>
              <span className={styles.ctaHint}>
                Limited 2026 seats · Free admission guidance
              </span>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default StatsSection;
