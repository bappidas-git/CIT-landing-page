/* ============================================
   LocationSection Component
   CIT — Tumkur campus location + travel reassurance for students across India
   ============================================ */

import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import SectionTitle from "../../common/SectionTitle/SectionTitle";
import Button from "../../common/Button/Button";
import { locationData } from "../../../data/locationData";
import useApplyCTA from "../../../hooks/useApplyCTA";
import { trackContactClick } from "../../../utils/contactTracking";
import styles from "./LocationSection.module.css";

const LocationSection = () => {
  const applyCTA = useApplyCTA("apply-now", {
    location: "location",
    label: "Apply for the Merit Assessment Test",
  });

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
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 15px 40px rgba(12, 45, 72, 0.18)",
      transition: {
        duration: 0.3,
      },
    },
  };

  const mapsQuery = encodeURIComponent(
    `${locationData.name}, ${locationData.address}`,
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const handleGetDirections = () => {
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  const travelHighlights = [
    {
      icon: "mdi:train",
      title: "Well-connected via Bengaluru",
      text: "~70 km from Bengaluru. Daily trains, buses & flights from every corner of India via Kempegowda International Airport.",
      color: "#0C2D48",
    },
    {
      icon: "mdi:home-heart",
      title: "Hostel from day one",
      text: "Safe, supervised on-campus hostel & mess from arrival — no scrambling for accommodation after admission.",
      color: "#1E8E5A",
    },
    {
      icon: "mdi:account-tie",
      title: "CIT admission desk",
      text: "Our team helps with travel planning, documents, hostel allocation and settling in — in your language.",
      color: "#D82618",
    },
    {
      icon: "mdi:account-group",
      title: "Familiar faces on campus",
      text: "Students from every region of India on one campus — seniors who've made the same journey, ready to help juniors.",
      color: "#E0301E",
    },
  ];

  return (
    <section id="location" className={styles.section}>
      <Container maxWidth="xl">
        <SectionTitle
          badge="LOCATION"
          title="Find Us in"
          highlight="Tumkur, Karnataka"
          subtitle="CIT's campus sits on NH-206, just ~70 km from Bengaluru — reachable by train, bus or flight from across India."
          align="center"
          variant="light"
          badgeVariant="gold"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Grid container spacing={4} className={styles.mainContent}>
            {/* Campus Info Card */}
            <Grid item xs={12} md={5}>
              <motion.div
                variants={itemVariants}
                className={styles.centreInfoCard}
              >
                <div className={styles.centreHeader}>
                  <div className={styles.centreIconWrapper}>
                    <Icon icon="mdi:school" />
                  </div>
                  <div>
                    <Typography variant="h5" className={styles.centreName}>
                      {locationData.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      className={styles.centreAddress}
                    >
                      {locationData.address}
                    </Typography>
                  </div>
                </div>

                <div className={styles.contactList}>
                  <a
                    href={`tel:${locationData.phone}`}
                    className={styles.contactItem}
                    onClick={() =>
                      trackContactClick(
                        "phone",
                        "location_helpline",
                        locationData.phone,
                      )
                    }
                  >
                    <div className={styles.contactIcon}>
                      <Icon icon="mdi:phone" />
                    </div>
                    <div>
                      <Typography
                        variant="caption"
                        className={styles.contactLabel}
                      >
                        Admission helpline
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.contactValue}
                      >
                        {locationData.phoneDisplay}
                      </Typography>
                    </div>
                  </a>

                  <a
                    href={`https://wa.me/${locationData.whatsapp}?text=${encodeURIComponent(
                      "Hi CIT Admissions, I want to apply for the CIT Merit-Based Selection Program 2026. Please share the details.",
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactItem}
                    onClick={() =>
                      trackContactClick("whatsapp", "location_whatsapp")
                    }
                  >
                    <div
                      className={`${styles.contactIcon} ${styles.contactIconWhatsapp}`}
                    >
                      <Icon icon="mdi:whatsapp" />
                    </div>
                    <div>
                      <Typography
                        variant="caption"
                        className={styles.contactLabel}
                      >
                        WhatsApp
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.contactValue}
                      >
                        Chat with admission team
                      </Typography>
                    </div>
                  </a>
                </div>
              </motion.div>
            </Grid>

            {/* Map */}
            <Grid item xs={12} md={7}>
              <motion.div variants={itemVariants} className={styles.mapWrapper}>
                <div className={styles.mapContainer}>
                  <div className={styles.mapPlaceholder}>
                    <img
                      src={locationData.mapUrl}
                      alt={`Map showing ${locationData.name} campus in ${locationData.city}, ${locationData.state}`}
                      className={styles.mapImage}
                      loading="lazy"
                    />
                    <div className={styles.mapOverlay}>
                      <Icon
                        icon="mdi:map-marker"
                        className={styles.mapPinIcon}
                      />
                      <Typography
                        variant="h6"
                        className={styles.mapTitle}
                        sx={{ color: '#FFFFFF' }}
                      >
                        CIT Campus, Gubbi
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.mapAddress}
                        sx={{ color: '#E6E8EA' }}
                      >
                        NH-206, B.H. Road, Tumkur — Karnataka
                      </Typography>
                      <Button
                        variant="primary"
                        size="small"
                        startIcon="mdi:map-marker"
                        onClick={handleGetDirections}
                        className={styles.mapButton}
                      >
                        View on Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>

        {/* "Coming from outside Karnataka?" helper block */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={styles.neBlock}
        >
          <motion.div variants={itemVariants} className={styles.neBlockHead}>
            <span className={styles.neBlockEyebrow}>
              FOR STUDENTS FROM ACROSS INDIA
            </span>
            <Typography variant="h4" className={styles.neBlockTitle}>
              Coming from another state? We've got you covered.
            </Typography>
            <Typography variant="body1" className={styles.neBlockSubtitle}>
              From the moment you decide to apply, our team walks you through
              every step — travel, hostel and arrival in Tumkur. Local students
              from Tumkur and around Karnataka get the same guidance on
              documents and day-scholar options.
            </Typography>
          </motion.div>

          <Grid container spacing={3} className={styles.neGrid}>
            {travelHighlights.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className={styles.connectivityCard}
                >
                  <div
                    className={styles.connectivityIcon}
                    style={{
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    <Icon icon={item.icon} />
                  </div>
                  <div className={styles.connectivityBody}>
                    <Typography
                      variant="subtitle1"
                      className={styles.connectivityTitle}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      className={styles.connectivityText}
                    >
                      {item.text}
                    </Typography>
                  </div>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Audience strip */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={styles.statesBand}
        >
          {/* The gap lives on the wrapper, not the Typography: MUI's own
              `margin: 0` is injected after this stylesheet and wins the tie. */}
          <motion.div variants={itemVariants} className={styles.statesTitleWrap}>
            <Typography variant="h6" className={styles.statesTitle}>
              {locationData.audienceNote}
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.statesPills}>
            {locationData.servingRegions.map((region) => (
              <span key={region} className={styles.statePill}>
                <Icon icon="mdi:map-marker-radius" />
                {region}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={styles.bottomCta}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              className={styles.ctaTitle}
              sx={{ color: '#FFFFFF', textAlign: 'center' }}
            >
              Need help planning your journey to CIT?
            </Typography>
            <Typography
              variant="body1"
              className={styles.ctaSubtitle}
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                maxWidth: '640px',
                mx: 'auto',
                textAlign: 'center',
              }}
            >
              Qualify in the merit test and CIT&rsquo;s Counselling Officer walks
              you through travel, documents, hostel and everything else.
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.ctaButtons}>
            <Button
              variant="primary"
              size="large"
              startIcon="mdi:rocket-launch-outline"
              {...applyCTA}
            >
              Apply for the Merit Assessment Test
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      <div className={styles.bgDecoration1} />
      <div className={styles.bgDecoration2} />
    </section>
  );
};

export default LocationSection;
