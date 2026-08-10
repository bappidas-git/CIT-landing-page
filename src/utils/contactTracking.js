/* ============================================
   Contact-Click Tracking
   ============================================
   Phone and WhatsApp taps are a side door out of
   the funnel: the visitor converts on a channel the
   page never sees, so without this the ad platforms
   only ever learn about form fills.

   One helper fires all three legs from a single
   call site, which is the point — the GTM leg used
   to be wired at six places while the Meta and
   Google legs were dead code with zero call sites.

   Legs:
     1. GTM        — `phone_click` / `whatsapp_click`
                     dataLayer events (unchanged
                     names, so existing GTM triggers
                     and variables stay valid).
     2. Meta Pixel — the standard `Contact` event.
                     Needs REACT_APP_META_PIXEL_ID;
                     a GTM-only pixel will NOT fire it.
     3. Google Ads — `trackPhoneConversion`, which
                     needs its own call-conversion
                     action configured in Google Ads
                     (see the Meta Ads guide → the
                     equivalent Google setup). Without
                     REACT_APP_GOOGLE_ADS_ID it is a
                     silent no-op.

   Every leg is individually no-op-safe, so an
   unconfigured deployment loses nothing but the
   event itself.
   ============================================ */

import { trackPhoneClick, trackWhatsAppClick } from './gtm';
import { trackContact } from './metaPixel';
import { trackPhoneConversion } from './googleAds';
import { generateEventId } from './eventDedup';

/** Primary CIT admissions number, in the form Google Ads expects. */
export const CONTACT_PHONE = '+918453623233';

/**
 * Fire every contact-conversion signal for a phone or WhatsApp click.
 *
 * Call this INSTEAD of `trackPhoneClick` / `trackWhatsAppClick` — never
 * alongside them, or the GTM event fires twice for one tap.
 *
 * @param {'phone'|'whatsapp'} channel - Which contact channel was used
 * @param {string} [source] - Where the click happened (e.g. 'header_desktop')
 * @param {string} [phoneNumber] - Override for the number that was dialled
 */
export const trackContactClick = (channel, source = '', phoneNumber = CONTACT_PHONE) => {
  const isWhatsApp = channel === 'whatsapp';

  // 1. GTM — keep the two distinct event names the container already triggers on.
  if (isWhatsApp) {
    trackWhatsAppClick(source);
  } else {
    trackPhoneClick(phoneNumber, source);
  }

  // 2. Meta Pixel `Contact`. A fresh event_id is stored for dedup so a future
  // server-side Contact event can be matched to this browser one.
  trackContact({ event_id: generateEventId() });

  // 3. Google Ads. Both channels report the same off-site contact conversion —
  // a WhatsApp tap is the same lost-to-the-page outcome as a call.
  trackPhoneConversion(phoneNumber);
};

export default trackContactClick;
