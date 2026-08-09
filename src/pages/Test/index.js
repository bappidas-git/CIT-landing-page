/* ============================================
   /test — Page entry point
   Also exports the chunk preloader, so the CTA
   that hands an applicant off to the test can warm
   the route on pointerdown.
   ============================================ */

export { default } from './Test';

/**
 * Warm the /test chunk. Safe to call repeatedly — webpack caches the module
 * promise, so extra calls cost nothing.
 *
 * Defined in ./preload so CTA components can import it without this module's
 * static re-export above dragging the whole page into their chunk.
 * @returns {Promise} The chunk import promise
 */
export { preloadTest } from './preload';
