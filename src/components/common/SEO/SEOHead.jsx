/* ============================================
   SEOHead Component
   Manages document head SEO tags dynamically
   per route. Uses direct DOM manipulation since
   this is a CRA-based SPA without react-helmet.
   ============================================ */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { seoConfig } from '../../../config/seo';
import {
  updatePageSEO,
  injectDefaultSchemas,
  removeSchema,
} from '../../../utils/seo';

const SEOHead = () => {
  const location = useLocation();

  // Inject default schemas on mount
  useEffect(() => {
    injectDefaultSchemas();
  }, []);

  // Update page SEO based on current route
  useEffect(() => {
    const { pathname } = location;

    if (pathname === '/') {
      // Home page
      updatePageSEO({
        title: seoConfig.pages.home.title,
        description: seoConfig.pages.home.description,
        url: seoConfig.siteUrl + '/',
      });
    } else if (pathname === '/thank-you') {
      // Thank You page — noindex
      updatePageSEO({
        title: seoConfig.pages.thankYou.title,
        description: seoConfig.pages.thankYou.description,
        url: seoConfig.siteUrl + '/thank-you',
        robots: 'noindex, nofollow',
      });
    } else if (pathname.startsWith('/admin')) {
      // Admin pages — noindex
      updatePageSEO({
        title: seoConfig.pages.admin.title,
        robots: 'noindex, nofollow',
      });
      // Remove public schemas from admin pages
      removeSchema('schema-organization');
      removeSchema('schema-faq');
      removeSchema('schema-localbusiness');
      removeSchema('schema-breadcrumb');
      removeSchema('schema-webpage');
    }
  }, [location]);

  // This component does not render anything visible
  return null;
};

export default SEOHead;
