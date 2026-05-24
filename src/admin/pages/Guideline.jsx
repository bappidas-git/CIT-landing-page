/* ============================================
   Admin Guideline Page
   Password-protected with 8-tab navigation
   ============================================ */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import styles from "./Guideline.module.css";
import PabblySetupGuide from "./guidelineContent/PabblySetupGuide";
import GoogleAdsGuide from "./guidelineContent/GoogleAdsGuide";
import MetaAdsGuide from "./guidelineContent/MetaAdsGuide";
import GTMSetupGuide from "./guidelineContent/GTMSetupGuide";
import ConversionTrackingGuide from "./guidelineContent/ConversionTrackingGuide";
import SEOSetupGuide from "./guidelineContent/SEOSetupGuide";
import DeploymentGuide from "./guidelineContent/DeploymentGuide";
import DeveloperGuide from "./guidelineContent/DeveloperGuide";

const GUIDELINE_PASSWORD = "ad@9707112233";
const SESSION_KEY = "guideline_unlocked";

const TABS = [
  { id: 0, label: "Pabbly Setup", icon: "mdi:webhook" },
  { id: 1, label: "Google Ads", icon: "mdi:google-ads" },
  { id: 2, label: "Meta Ads", icon: "mdi:facebook" },
  { id: 3, label: "GTM Setup", icon: "mdi:tag-outline" },
  {
    id: 4,
    label: "Conversion Tracking",
    icon: "mdi:chart-timeline-variant-shimmer",
  },
  { id: 5, label: "SEO Setup", icon: "mdi:search-web" },
  { id: 6, label: "Deployment", icon: "mdi:rocket-launch-outline" },
  { id: 7, label: "For Developers", icon: "mdi:code-braces" },
];

const TabPlaceholder = ({ title, icon }) => (
  <div className={styles.tabPlaceholder}>
    <Icon
      icon={icon}
      width={48}
      style={{ color: "var(--admin-accent)", opacity: 0.5 }}
    />
    <h3>{title}</h3>
    <p>Content for this section will be added.</p>
  </div>
);

const Guideline = () => {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const unlocked = sessionStorage.getItem(SESSION_KEY);
    if (unlocked === "true") {
      setIsUnlocked(true);
    } else {
      setShowPasswordModal(true);
    }
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === GUIDELINE_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsUnlocked(true);
      setShowPasswordModal(false);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowPasswordModal(false);
    navigate("/admin/dashboard");
  };

  /* Password Modal */
  if (showPasswordModal) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalCard}>
          <img
            src="https://assamdigital.com/wp-content/uploads/2022/04/logo.png"
            alt="Monjoven"
            className={styles.modalLogo}
          />
          <h2 className={styles.modalTitle}>Restricted Access</h2>
          <p className={styles.modalSubtitle}>
            Enter the access password to view setup guidelines.
          </p>
          <form className={styles.modalForm} onSubmit={handlePasswordSubmit}>
            <div className={styles.modalInputWrap}>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                size="small"
                autoFocus
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      <Icon
                        icon={
                          showPassword
                            ? "mdi:eye-off-outline"
                            : "mdi:eye-outline"
                        }
                        width={20}
                      />
                    </IconButton>
                  ),
                }}
              />
            </div>
            {error && <p className={styles.modalError}>{error}</p>}
            <button type="submit" className={styles.modalButton}>
              Unlock
            </button>
          </form>
          <button className={styles.modalCancel} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  /* Locked — not yet authenticated and modal dismissed */
  if (!isUnlocked) {
    return null;
  }

  /* Unlocked — show guideline page */
  const currentTab = TABS[activeTab];

  return (
    <div className={styles.guidelinePage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Setup Guidelines</h1>
        <p className={styles.pageSubtitle}>
          Step-by-step guides for configuring and deploying your landing page.
        </p>
      </div>

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>
              <Icon icon={tab.icon} width={18} />
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 0 && <PabblySetupGuide styles={styles} />}
        {activeTab === 1 && <GoogleAdsGuide styles={styles} />}
        {activeTab === 2 && <MetaAdsGuide styles={styles} />}
        {activeTab === 3 && <GTMSetupGuide styles={styles} />}
        {activeTab === 4 && <ConversionTrackingGuide styles={styles} />}
        {activeTab === 5 && <SEOSetupGuide styles={styles} />}
        {activeTab === 6 && <DeploymentGuide styles={styles} />}
        {activeTab === 7 && <DeveloperGuide styles={styles} />}
        {activeTab > 7 && (
          <TabPlaceholder title={currentTab.label} icon={currentTab.icon} />
        )}
      </div>
    </div>
  );
};

export default Guideline;
