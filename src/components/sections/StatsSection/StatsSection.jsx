/* ============================================
   StatsSection Component
   Trust & achievement metrics with animated counters
   ============================================ */

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Container, Typography, Grid, useMediaQuery, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import AnimatedCounter from '../../common/AnimatedCounter/AnimatedCounter';
import { statsData } from '../../../data/statsData';
import styles from './StatsSection.module.css';

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

// Parse stat value for AnimatedCounter
const parseStatValue = (stat) => {
  // Handle "0.6mm" -> { value: 0.6, suffix: "mm", decimals: 1 }
  // Handle "5K+" -> { value: 5, suffix: "K+", decimals: 0 }
  // Handle "98%" -> { value: 98, suffix: "%", decimals: 0 }
  // Handle "25+" -> { value: 25, suffix: "+", decimals: 0 }
  const match = String(stat).match(/^([\d.]+)(.*)$/);
  if (!match) return { value: 0, suffix: '', decimals: 0 };

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
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className={styles.statsSection} id="highlights" ref={ref}>
      {/* Background Pattern */}
      <div className={styles.patternBg} />

      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <Typography className={styles.overline}>
              Our Track Record
            </Typography>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                color: '#1A5276',
                marginBottom: { xs: '0.75rem', md: '1rem' },
              }}
            >
              Trusted by Thousands{' '}
              <span className={styles.accentText}>Across the Globe</span>
            </Typography>
            <Typography
              className={styles.sectionSubtitle}
              sx={{
                fontSize: { xs: '0.9375rem', md: '1.0625rem' },
                color: '#6B7280',
                maxWidth: '680px',
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Numbers that reflect our commitment to excellence in hair restoration and cosmetic surgery
            </Typography>
          </motion.div>

          {/* Stats Grid */}
          <Grid container spacing={isMobile ? 2 : 3} className={styles.statsGrid}>
            {statsData.map((stat, index) => {
              const parsed = parseStatValue(stat.stat);
              return (
                <Grid item xs={6} sm={4} md={3} key={stat.id}>
                  <motion.div
                    className={styles.statCard}
                    custom={index}
                    variants={cardVariants}
                    whileHover={{
                      y: -4,
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                      transition: { duration: 0.25 },
                    }}
                  >
                    <div className={styles.statIconWrapper}>
                      <Icon
                        icon={stat.icon}
                        className={styles.statIcon}
                      />
                    </div>
                    <div className={styles.statValue}>
                      <AnimatedCounter
                        value={parsed.value}
                        suffix={parsed.suffix}
                        decimals={parsed.decimals}
                        duration={1.5}
                        delay={0.2 + index * 0.1}
                        color="dark"
                      />
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
        </motion.div>
      </Container>
    </section>
  );
};

export default StatsSection;
