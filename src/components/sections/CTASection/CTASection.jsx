/* ============================================
   CTASection Component
   Patient Testimonials & Social Proof
   with CTA for booking consultations
   ============================================ */

import React, { useState } from "react";
import { Container, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Button from "../../common/Button/Button";
import { useModal } from "../../../context/ModalContext";
import styles from "./CTASection.module.css";

const testimonials = [
  {
    name: "Kausar Shofi Ahmed",
    location: "Guwahati, Assam",
    rating: 5,
    text: "I am very satisfied with the results of my hair transplant at Monjoven. Dr. Neog and his team are highly skilled and excellent. The entire process was smooth and comfortable.",
    procedure: "Hair Transplant",
  },
  {
    name: "Medini Saharia",
    location: "Assam",
    rating: 5,
    text: "Amazing experience at Monjoven. The staff is very professional and caring. Dr. Porag Neog explained everything clearly and the results exceeded my expectations.",
    procedure: "Hair Transplant",
  },
  {
    name: "Irfan Khan",
    location: "International Patient",
    rating: 5,
    text: "I've had three transplant sessions at Monjoven across 2017-2021. Every time the results were outstanding. Dr. Neog is truly one of the best in this field.",
    procedure: "Hair Transplant (3 sessions)",
  },
  {
    name: "Biki Patowary",
    location: "Assam",
    rating: 5,
    text: "The clinic environment is top-notch and the team is well-mannered and always smiling. My hair transplant results look completely natural. Highly recommend Monjoven!",
    procedure: "Hair Transplant",
  },
  {
    name: "Dipankar Borah",
    location: "Northeast India",
    rating: 5,
    text: "Best hair transplant clinic in Northeast India. The procedure was painless and the results are incredible. Dr. Neog and his team made me feel comfortable throughout.",
    procedure: "Hair Transplant",
  },
  {
    name: "Manash Baishya",
    location: "Assam",
    rating: 5,
    text: "Monjoven gave me back my confidence. The micro-FUE technique they use ensures minimal scarring and the most natural-looking results. Worth every penny!",
    procedure: "Micro-FUE Hair Transplant",
  },
];

const trustBadges = [
  { value: "5,000+", label: "Happy Patients", icon: "mdi:account-group" },
  { value: "4.9/5", label: "Average Rating", icon: "mdi:star-circle" },
  { value: "25+", label: "Yrs Plastic Surgery", icon: "mdi:shield-check" },
];

const CARDS_PER_VIEW = 3;

const CTASection = () => {
  const { openLeadDrawer } = useModal();
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPages = Math.ceil(testimonials.length / CARDS_PER_VIEW);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex * CARDS_PER_VIEW,
    currentIndex * CARDS_PER_VIEW + CARDS_PER_VIEW
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const handleBookConsultation = () => {
    openLeadDrawer("book-consultation");
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        icon={i < rating ? "mdi:star" : "mdi:star-outline"}
        className={i < rating ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section id="testimonials" className={styles.section}>
      {/* Background */}
      <div className={styles.bgOverlay} />
      <div className={styles.bgPattern} />

      <Container maxWidth="xl">
        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <Typography variant="overline" className={styles.overline}>
              Patient Testimonials
            </Typography>
            <Typography variant="h3" className={styles.title}>
              What Our <span className={styles.highlight}>Patients Say</span>
            </Typography>
            <Typography variant="body1" className={styles.subtitle}>
              Real experiences from patients who trusted Monjoven for their
              transformation
            </Typography>
          </motion.div>

          {/* Testimonial Cards */}
          <motion.div variants={itemVariants} className={styles.testimonialGrid}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className={styles.cardsWrapper}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                  exit: {},
                }}
              >
                {visibleTestimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.name}
                    className={styles.testimonialCard}
                    variants={cardVariants}
                  >
                    <div className={styles.quoteIcon}>
                      <Icon icon="mdi:format-quote-open" />
                    </div>

                    <div className={styles.cardHeader}>
                      <div className={styles.avatar}>
                        {getInitials(testimonial.name)}
                      </div>
                      <div className={styles.cardHeaderInfo}>
                        <span className={styles.patientName}>
                          {testimonial.name}
                        </span>
                        <span className={styles.patientLocation}>
                          <Icon icon="mdi:map-marker-outline" />
                          {testimonial.location}
                        </span>
                      </div>
                    </div>

                    <div className={styles.stars}>
                      {renderStars(testimonial.rating)}
                    </div>

                    <p className={styles.testimonialText}>
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    <div className={styles.procedureBadge}>
                      <Icon icon="mdi:medical-bag" />
                      {testimonial.procedure}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Carousel Navigation */}
            {totalPages > 1 && (
              <div className={styles.carouselNav}>
                <button
                  className={styles.navBtn}
                  onClick={handlePrev}
                  aria-label="Previous testimonials"
                >
                  <Icon icon="mdi:chevron-left" />
                </button>
                <div className={styles.dots}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`${styles.dot} ${
                        i === currentIndex ? styles.dotActive : ""
                      }`}
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  className={styles.navBtn}
                  onClick={handleNext}
                  aria-label="Next testimonials"
                >
                  <Icon icon="mdi:chevron-right" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Trust Badges */}
          <motion.div variants={itemVariants} className={styles.trustBadges}>
            {trustBadges.map((badge, index) => (
              <React.Fragment key={badge.label}>
                {index > 0 && <div className={styles.badgeDivider} />}
                <div className={styles.badgeItem}>
                  <Icon icon={badge.icon} className={styles.badgeIcon} />
                  <span className={styles.badgeValue}>{badge.value}</span>
                  <span className={styles.badgeLabel}>{badge.label}</span>
                </div>
              </React.Fragment>
            ))}
          </motion.div>

          {/* CTA Area */}
          <motion.div variants={itemVariants} className={styles.ctaArea}>
            <Typography variant="h4" className={styles.ctaTitle}>
              Ready to Start Your Transformation?
            </Typography>
            <Typography variant="body1" className={styles.ctaSubtext}>
              Book a consultation with Dr. Porag Neog and discover the best
              treatment plan for you
            </Typography>

            <div className={styles.ctaButtons}>
              <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="animate"
              >
                <Button
                  variant="primary"
                  size="large"
                  endIcon="mdi:arrow-right"
                  onClick={handleBookConsultation}
                  className={styles.primaryBtn}
                >
                  Book Consultation
                </Button>
              </motion.div>

              <Button
                variant="outline"
                size="large"
                startIcon="mdi:phone-outline"
                href="tel:+919181956562"
                className={styles.secondaryBtn}
              >
                Call +91 9181956562
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Corner Decorations */}
      <div className={styles.cornerDecoration1} />
      <div className={styles.cornerDecoration2} />
    </section>
  );
};

export default CTASection;
