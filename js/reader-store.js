/* ==========================================================================
   Bookora — reader storage
   A small, defensive wrapper around localStorage for reading position and
   typography preferences. Nothing leaves the browser.
   ========================================================================== */

(function () {
  "use strict";

  const PROGRESS_PREFIX = "bookora.reader.progress.v1.";
  const PREFS_KEY = "bookora.reader.prefs.v1";
  const DEFAULT_PREFS = { size: 1, leading: 1 };
  const SIZE_COUNT = 4;
  const LEADING_COUNT = 3;

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* Storage may be unavailable; the reader still works without it. */
    }
  }

  function isInteger(value) {
    return typeof value === "number" && Number.isFinite(value) && Math.floor(value) === value;
  }

  function normalizeProgress(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const chapter = raw.chapter;
    const block = raw.block;
    const unit = raw.unit;
    const page = raw.page;
    const percent = raw.percent;

    if (!isInteger(chapter) || chapter < 0) {
      return null;
    }

    if (!isInteger(block) || block < 0) {
      return null;
    }

    if (!isInteger(unit) || unit < 0) {
      return null;
    }

    if (!isInteger(page) || page < 1) {
      return null;
    }

    if (typeof percent !== "number" || !Number.isFinite(percent) || percent < 0 || percent > 100) {
      return null;
    }

    return {
      chapter: chapter,
      block: block,
      unit: unit,
      page: page,
      percent: Math.round(percent),
      updated: typeof raw.updated === "string" ? raw.updated : ""
    };
  }

  function getProgress(bookId) {
    if (!bookId) {
      return null;
    }

    const stored = read(PROGRESS_PREFIX + bookId);
    if (!stored) {
      return null;
    }

    try {
      return normalizeProgress(JSON.parse(stored));
    } catch (error) {
      return null;
    }
  }

  function saveProgress(bookId, progress) {
    if (!bookId || !progress) {
      return false;
    }

    const normalized = normalizeProgress(progress);
    if (!normalized) {
      return false;
    }

    normalized.updated = new Date().toISOString();
    return write(PROGRESS_PREFIX + bookId, JSON.stringify(normalized));
  }

  function clearProgress(bookId) {
    if (bookId) {
      remove(PROGRESS_PREFIX + bookId);
    }
  }

  function getPrefs() {
    const stored = read(PREFS_KEY);
    if (!stored) {
      return Object.assign({}, DEFAULT_PREFS);
    }

    try {
      const parsed = JSON.parse(stored);
      return {
        size: isInteger(parsed.size) && parsed.size >= 0 && parsed.size < SIZE_COUNT ? parsed.size : DEFAULT_PREFS.size,
        leading: isInteger(parsed.leading) && parsed.leading >= 0 && parsed.leading < LEADING_COUNT ? parsed.leading : DEFAULT_PREFS.leading
      };
    } catch (error) {
      return Object.assign({}, DEFAULT_PREFS);
    }
  }

  function savePrefs(prefs) {
    if (!prefs) {
      return false;
    }

    const size = isInteger(prefs.size) && prefs.size >= 0 && prefs.size < SIZE_COUNT ? prefs.size : DEFAULT_PREFS.size;
    const leading = isInteger(prefs.leading) && prefs.leading >= 0 && prefs.leading < LEADING_COUNT ? prefs.leading : DEFAULT_PREFS.leading;

    return write(PREFS_KEY, JSON.stringify({ size: size, leading: leading }));
  }

  window.BookoraReaderStore = {
    getProgress: getProgress,
    saveProgress: saveProgress,
    clearProgress: clearProgress,
    getPrefs: getPrefs,
    savePrefs: savePrefs,
    defaults: Object.assign({}, DEFAULT_PREFS)
  };
})();
