/* ============================================
   /apply — Page entry point
   Also exports the chunk preloader that CTAs fire
   on pointerdown/touchstart, so the form is
   already downloaded by the time the tap lands.
   ============================================ */

export { default } from './Apply';

/**
 * Warm the /apply chunk. Safe to call repeatedly — webpack caches the module
 * promise, so extra calls cost nothing.
 *
 * Defined in ./preload so CTA components can import it without this module's
 * static re-export above dragging the whole page into their chunk.
 * @returns {Promise} The chunk import promise
 */
export { preloadApply } from './preload';
