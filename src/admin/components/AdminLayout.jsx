/* ============================================
   Admin Layout Component
   ============================================ */

import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AdminTopbar from './AdminTopbar';
import { syncLeadsFromServer } from '../utils/leadService';
import { syncTelecallsFromServer } from '../utils/telecallService';
import styles from './AdminLayout.module.css';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const LeadManagement = lazy(() => import('../pages/LeadManagement'));
const LeadDetail = lazy(() => import('../pages/LeadDetail'));
const TeleCalling = lazy(() => import('../pages/TeleCalling'));
const TeleCallDetail = lazy(() => import('../pages/TeleCallDetail'));
const Guideline = lazy(() => import('../pages/Guideline'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
    <CircularProgress sx={{ color: 'var(--admin-accent)' }} />
  </Box>
);

const AdminLayout = () => {
  useEffect(() => {
    // Warm the in-memory cache from the shared server store (the single source
    // of truth) as soon as the admin loads, so the LMS renders every
    // submission from any browser/device. Pages refresh their own data via
    // their useEffects/poll once the cache is hydrated.
    syncLeadsFromServer().then((result) => {
      if (result.error) {
        console.warn('[Admin] Lead sync skipped:', result.error);
      } else if (result.added > 0) {
        console.log(`[Admin] Synced ${result.added} lead(s) from server`);
      }
    });
    // Warm the tele-calling cache too so its module renders every record
    // entered from any browser/device the moment the admin loads.
    syncTelecallsFromServer().then((result) => {
      if (result.error) {
        console.warn('[Admin] Tele-calling sync skipped:', result.error);
      } else if (result.added > 0) {
        console.log(`[Admin] Synced ${result.added} tele-calling record(s) from server`);
      }
    });
  }, []);

  return (
    <div className={styles.layout}>
      <AdminTopbar />
      <div className={styles.mainArea}>
        <main className={styles.content}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="lms" element={<LeadManagement />} />
              <Route path="lms/lead/:leadId" element={<LeadDetail />} />
              <Route path="tele-calling" element={<TeleCalling />} />
              <Route path="tele-calling/lead/:telecallId" element={<TeleCallDetail />} />
              <Route path="guideline" element={<Guideline />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
