/* ============================================
   /apply — chunk preloader

   Deliberately separate from index.js: that file
   statically re-exports the page component, so
   importing the helper *from there* pulls the whole
   Apply page into the importer's chunk and undoes
   the route's code split (the hero is eager, so it
   would land in main.js).

   CTAs import from this module; index.js re-exports
   it, so the page's public surface is unchanged.
   ============================================ */

/**
 * Warm the /apply chunk. Safe to call repeatedly — webpack caches the module
 * promise, so extra calls cost nothing.
 * @returns {Promise} The chunk import promise
 */
export const preloadApply = () => import('./Apply');
