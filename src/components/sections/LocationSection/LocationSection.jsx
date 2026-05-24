/* ============================================
   LocationSection Component
   Our Locations section showing business location info
   ============================================ */

import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import SectionTitle from "../../common/SectionTitle/SectionTitle";
import Button from "../../common/Button/Button";
import { locationData } from "../../../data/locationData";
import styles from "./LocationSection.module.css";

const LocationSection = () => {
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
      boxShadow: "0 15px 40px rgba(26, 82, 118, 0.15)",
      transition: {
        duration: 0.3,
      },
    },
  };

  const handleGetDirections = () => {
    window.open(
      "https://www.google.com/maps/search/Monjoven+Clinic+Six+Mile+Guwahati",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const connectivityHighlights = [
    {
      icon: "mdi:airplane",
      title: "Well-connected by air — Guwahati LGBI Airport nearby",
      color: "#FF9800",
    },
    {
      icon: "mdi:train",
      title: "Accessible by rail from all Northeast states",
      color: "#2196F3",
    },
    {
      icon: "mdi:hospital-building",
      title: "Located near Pratiksha Hospital, Six Mile, Guwahati",
      color: "#9C27B0",
    },
    {
      icon: "mdi:account-group",
      title: "Patients visiting from all 8 Northeastern states",
      color: "#4CAF50",
    },
  ];

  return (
    <section id="stores" className={styles.section}>
      <Container maxWidth="xl">
        {/* Section Title */}
        <SectionTitle
          badge="LOCATIONS"
          title="Serving All of"
          highlight="Northeast India"
          subtitle="Conveniently located in Guwahati with patients visiting from across the Northeast and beyond"
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
            {/* Centre Info Card */}
            <Grid item xs={12} md={5}>
              <motion.div
                variants={itemVariants}
                className={styles.centreInfoCard}
              >
                <div className={styles.centreHeader}>
                  <div className={styles.centreIconWrapper}>
                    <Icon icon="mdi:hospital-building" />
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
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <Icon icon="mdi:phone" />
                    </div>
                    <div>
                      <Typography
                        variant="caption"
                        className={styles.contactLabel}
                      >
                        Phone
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.contactValue}
                      >
                        <a href={`tel:${locationData.phone}`}>{locationData.phoneDisplay}</a>
                      </Typography>
                    </div>
                  </div>

                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <Icon icon="mdi:email-outline" />
                    </div>
                    <div>
                      <Typography
                        variant="caption"
                        className={styles.contactLabel}
                      >
                        Email
                      </Typography>
                      <Typography
                        variant="body2"
                        className={styles.contactValue}
                      >
                        <a href={`mailto:${locationData.email}`}>
                          {locationData.email}
                        </a>
                      </Typography>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Grid>

            {/* Map Section */}
            <Grid item xs={12} md={7}>
              <motion.div variants={itemVariants} className={styles.mapWrapper}>
                <div className={styles.mapContainer}>
                  <div className={styles.mapPlaceholder}>
                    <img
                      src="https://res.cloudinary.com/dn9gyaiik/image/upload/v1775885388/Map_Image_tezkg3.png"
                      alt="Monjoven Clinic Location Map - Six Mile, Guwahati"
                      className={styles.mapImage}
                    />
                    <div className={styles.mapOverlay}>
                      <Icon
                        icon="mdi:map-marker"
                        className={styles.mapPinIcon}
                      />
                      <Typography variant="h6" className={styles.mapTitle}>
                        Monjoven Clinic
                      </Typography>
                      <Typography variant="body2" className={styles.mapAddress}>
                        Six Mile, Guwahati, Assam
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

        {/* Connectivity Highlights - 2x2 Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={styles.connectivitySection}
        >
          <Grid container spacing={3}>
            {connectivityHighlights.map((item, index) => (
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
                  <Typography
                    variant="body1"
                    className={styles.connectivityText}
                  >
                    {item.title}
                  </Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>
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
              sx={{ color: "#fff", marginBottom: "2rem" }}
            >
              Ready to Transform Your Look? Visit Us Today
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants} className={styles.ctaButtons}>
            <Button
              variant="primary"
              size="large"
              startIcon="mdi:directions"
              onClick={handleGetDirections}
            >
              Get Directions
            </Button>
            <Button
              variant="outline"
              size="large"
              startIcon="mdi:phone"
              href="tel:+919181956562"
              className={styles.callUsBtn}
            >
              Call Us
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      {/* Background Decorations */}
      <div className={styles.bgDecoration1} />
      <div className={styles.bgDecoration2} />
    </section>
  );
};

export default LocationSection;
