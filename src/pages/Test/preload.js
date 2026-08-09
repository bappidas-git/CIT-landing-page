/* ============================================
   /test — chunk preloader

   Deliberately separate from index.js: that file
   statically re-exports the page component, so
   importing the helper *from there* pulls the whole
   Test page into the importer's chunk and undoes
   the route's code split.

   The handoff into the test is /thank-you's
   "Start Your Test" CTA, which fires this on
   pointerdown so the route is already downloaded
   by the time the tap lands.
   ============================================ */

/**
 * Warm the /test chunk. Safe to call repeatedly — webpack caches the module
 * promise, so extra calls cost nothing.
 * @returns {Promise} The chunk import promise
 */
export const preloadTest = () => import('./Test');
