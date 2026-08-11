/* ============================================
   First-visit admission notice — trigger + permanence
   ============================================
   Two contracts live in this component and neither is visible by reading the
   rendered output:

   1. The 10 seconds are *visible* seconds. A plain setTimeout would fire for a
      page sitting in a background tab, which has not been "stayed on" — the
      countdown must pause on document.hidden and resume where it left off.
   2. A skip is permanent, in localStorage, so it survives the tab. Using
      sessionStorage here would silently re-nag the same student on their next
      visit, and nothing on screen would look wrong.

   Both are easy to break while "just tidying the effect", so they are pinned
   here. Uses CRA's built-in jest + jsdom and react-dom directly — no new
   dependency.

   Run with: npm test
   ============================================ */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import AdmissionNoticeModal, { NOTICE_DISMISSED_KEY } from '../AdmissionNoticeModal';

// The CTA's own behaviour (GTM + navigate to /apply) is not what this file
// covers, and mocking it keeps the test off the router.
const mockOnClick = jest.fn();
jest.mock('../../../../hooks/useApplyCTA', () => ({
  __esModule: true,
  default: () => ({ onClick: mockOnClick, onPointerDown: jest.fn() }),
}));

const TITLE_ID = 'admission-notice-title';

let container;
let root;
let hidden;

/** Is the notice on screen? */
const isOpen = () => Boolean(document.getElementById(TITLE_ID));

/** Advance the visible-time clock by `ms`, driving both timers and Date.now(). */
const advance = (ms) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

/** Flip the tab to hidden/visible and fire the event the component listens on. */
const setHidden = (next) => {
  hidden = next;
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

const render = () => {
  act(() => {
    root.render(<AdmissionNoticeModal />);
  });
};

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers();
  // Date.now() is what the accrual maths reads; keep it in step with the timers.
  jest.setSystemTime(new Date('2026-08-11T10:00:00Z'));

  hidden = false;
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });

  localStorage.clear();
  sessionStorage.clear();
  mockOnClick.mockClear();

  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.useRealTimers();
});

describe('trigger — 10 seconds of visible dwell', () => {
  test('stays hidden before the 10 seconds are up', () => {
    render();
    advance(9000);
    expect(isOpen()).toBe(false);
  });

  test('appears once 10 seconds of visible time have passed', () => {
    render();
    advance(10000);
    expect(isOpen()).toBe(true);
  });

  test('a backgrounded tab does not burn the countdown', () => {
    render();
    advance(4000); // 4s of real dwell
    setHidden(true);
    advance(60000); // a minute in another app — must not count
    expect(isOpen()).toBe(false);

    setHidden(false);
    advance(5000); // 9s of visible time in total
    expect(isOpen()).toBe(false);

    advance(1000); // …and now the 10th second
    expect(isOpen()).toBe(true);
  });

  test('a page opened straight into a background tab never starts the clock', () => {
    hidden = true;
    render();
    advance(60000);
    expect(isOpen()).toBe(false);

    setHidden(false);
    advance(10000);
    expect(isOpen()).toBe(true);
  });

  test('returning to a tab after the notice was skipped does not reopen it', () => {
    render();
    advance(10000);
    expect(isOpen()).toBe(true);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(isOpen()).toBe(false);

    setHidden(true);
    setHidden(false);
    advance(30000);
    expect(isOpen()).toBe(false);
  });
});

describe('permanence — a skip is final', () => {
  test('dismissing writes the flag to localStorage, not sessionStorage', () => {
    render();
    advance(10000);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(localStorage.getItem(NOTICE_DISMISSED_KEY)).toBe('1');
    expect(sessionStorage.getItem(NOTICE_DISMISSED_KEY)).toBeNull();
  });

  test('a student who already skipped it never sees it again', () => {
    localStorage.setItem(NOTICE_DISMISSED_KEY, '1');
    render();
    advance(60000);
    expect(isOpen()).toBe(false);
  });

  test('taking the CTA retires the notice too', () => {
    render();
    advance(10000);

    act(() => {
      document
        .querySelector('[aria-labelledby="admission-notice-title"] button:not([aria-label])')
        .click();
    });

    expect(mockOnClick).toHaveBeenCalled();
    expect(localStorage.getItem(NOTICE_DISMISSED_KEY)).toBe('1');
    expect(isOpen()).toBe(false);
  });

  test('an applicant who already applied this session is never interrupted', () => {
    sessionStorage.setItem('lead_login_key', 'CIT26-A2B34');
    render();
    advance(60000);
    expect(isOpen()).toBe(false);
  });
});

describe('scroll lock', () => {
  test('restores the previous body overflow rather than blanking it', () => {
    // The mobile drawer sets this too — closing the notice must not unlock a
    // body the notice did not lock.
    document.body.style.overflow = 'hidden';
    render();
    advance(10000);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(document.body.style.overflow).toBe('hidden');
  });
});
