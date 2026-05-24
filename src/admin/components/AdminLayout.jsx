/* ============================================
   Admin Layout Component
   ============================================ */

import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AdminTopbar from './AdminTopbar';
import { initAdminConfig } from '../utils/adminConfig';
import { syncLeadsFromServer } from '../utils/leadService';
import styles from './AdminLayout.module.css';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const LeadManagement = lazy(() => import('../pages/LeadManagement'));
const LeadDetail = lazy(() => import('../pages/LeadDetail'));
const Guideline = lazy(() => import('../pages/Guideline'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
    <CircularProgress sx={{ color: '#148F77' }} />
  </Box>
);

const AdminLayout = () => {
  useEffect(() => {
    initAdminConfig();
    // Pull leads submitted from any browser/device into this admin's
    // localStorage so the LMS renders every submission, not just leads
    // captured on this device. Fire-and-forget; pages refresh their
    // own data via their useEffects once sync completes (storage is
    // the shared state between this sync and the page reads).
    syncLeadsFromServer().then((result) => {
      if (result.error) {
        console.warn('[Admin] Lead sync skipped:', result.error);
      } else if (result.added > 0) {
        console.log(`[Admin] Synced ${result.added} new lead(s) from server`);
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
              <Route path="guideline" element={<Guideline />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
