/* ==========================================================================
   Bookora — in-browser reader
   Loads a bundled text, measures it into fixed pages, and keeps the reader's
   place and display preferences in localStorage. No account, no network APIs.
   ========================================================================== */

(function () {
  "use strict";

  const catalogue = window.Bookora;
  const store = window.BookoraReaderStore;
  const params = new URLSearchParams(window.location.search);
  const requestedId = (params.get("book") || "").trim();
  const startFresh = params.get("start") === "1";
  const book = catalogue && requestedId ? catalogue.getBook(requestedId) : null;

  const SIZE_VALUES = [0.98, 1.08, 1.2, 1.34];
  const LEADING_VALUES = [1.55, 1.68, 1.82];
  const SIZE_NAMES = ["Small", "Standard", "Large", "Largest"];
  const LEADING_NAMES = ["Tight", "Standard", "Airy"];
  const DEFAULT_PREFS = { size: 1, leading: 1 };

  const els = {
    loading: document.querySelector("[data-reader-loading]"),
    loadingNote: document.querySelector("[data-loading-note]"),
    state: document.querySelector("[data-reader-state]"),
    stateEyebrow: document.querySelector("[data-state-eyebrow]"),
    stateTitle: document.querySelector("[data-state-title]"),
    stateCopy: document.querySelector("[data-state-copy]"),
    stateActions: document.querySelector("[data-state-actions]"),
    stateShelf: document.querySelector("[data-state-shelf]"),
    shelfGrid: document.querySelector("[data-state-shelf-grid]"),
    view: document.querySelector("[data-reader-view]"),
    readerHeading: document.querySelector("[data-reader-heading]"),
    stage: document.querySelector("[data-reader-stage]"),
    bookEl: document.querySelector("[data-reader-book]"),
    measure: document.querySelector("[data-reader-measure]"),
    leaves: Array.from(document.querySelectorAll("[data-reader-leaf]")),
    bodies: Array.from(document.querySelectorAll("[data-page-body]")),
    prev: document.querySelector("[data-reader-prev]"),
    next: document.querySelector("[data-reader-next]"),
    pageLabel: document.querySelector("[data-page-label]"),
    percentLabel: document.querySelector("[data-percent-label]"),
    progressBar: document.querySelector("[data-progress-bar]"),
    chromeTitle: document.querySelector("[data-chrome-title]"),
    chromeAuthor: document.querySelector("[data-chrome-author]"),
    exit: document.querySelector("[data-reader-exit]"),
    exitLabel: document.querySelector("[data-reader-exit-label]"),
    contentsTrigger: document.querySelector("[data-reader-contents-trigger]"),
    displayTrigger: document.querySelector("[data-reader-display-trigger]"),
    contentsDialog: document.getElementById("reader-contents-dialog"),
    displayDialog: document.getElementById("reader-display-dialog"),
    contentsIntro: document.querySelector("[data-contents-intro]"),
    toc: document.querySelector("[data-reader-toc]"),
    sizeOptions: document.querySelector("[data-size-options]"),
    leadingOptions: document.querySelector("[data-leading-options]"),
    sizeName: document.querySelector("[data-size-name]"),
    leadingName: document.querySelector("[data-leading-name]"),
    preview: document.querySelector("[data-preview]"),
    reset: document.querySelector("[data-pref-reset]"),
    sources: Array.from(document.querySelectorAll("[data-reader-source]")),
    sourceLinks: Array.from(document.querySelectorAll("[data-reader-source-link]"))
  };

  if (!els.view || !els.bookEl) {
    return;
  }

  let prefs = store ? store.getPrefs() : Object.assign({}, DEFAULT_PREFS);
  let text = null;
  let pages = [];
  let chapterPages = [];
  let contentsButtons = [];
  let contentsPageEls = [];
  let current = 0;
  let layout = getLayout();
  let initialAnchor = null;
  let lastMetrics = null;
  let paginationJob = null;
  let pendingAnchor = null;
  let prefsTimer = 0;
  let resizeTimer = 0;
  let touchStart = null;

  const sizeButtons = [];
  const leadingButtons = [];

  /* Helpers ----------------------------------------------------------------- */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function nextFrame() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        resolve();
      });
    });
  }

  function nextTick() {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, 0);
    });
  }

  function getLayout() {
    return window.innerWidth >= 900 && window.innerHeight >= 700 ? "spread" : "single";
  }

  function currentChapterIndex() {
    return pages[current] ? pages[current].chapter : 0;
  }

  /* Chrome and state -------------------------------------------------------- */

  function setChrome(options) {
    els.chromeTitle.textContent = options.title;
    els.chromeAuthor.textContent = options.author;
    els.exit.href = options.exitHref;
    els.exitLabel.textContent = options.exitLabel;
    els.exit.setAttribute("aria-label", options.exitAria);
    els.contentsTrigger.hidden = !options.actions;
    els.displayTrigger.hidden = !options.actions;
    document.title = options.pageTitle;
  }

  function showState(options) {
    document.querySelectorAll("dialog[open]").forEach(function (dialog) {
      dialog.close();
    });

    els.loading.hidden = true;
    els.view.hidden = true;
    els.view.inert = true;
    els.state.hidden = false;
    els.stateEyebrow.textContent = options.eyebrow;
    els.stateTitle.innerHTML = options.title;

    els.stateCopy.replaceChildren();
    (options.copy || []).forEach(function (html) {
      const paragraph = document.createElement("p");
      paragraph.innerHTML = html;
      els.stateCopy.append(paragraph);
    });

    els.stateActions.replaceChildren();
    (options.actions || []).forEach(function (action) {
      let element;

      if (action.retry) {
        element = document.createElement("button");
        element.type = "button";
        element.addEventListener("click", loadBook);
      } else {
        element = document.createElement("a");
        element.href = action.href;
      }

      element.className = action.primary ? "button button--primary" : "text-link";
      element.textContent = action.label;
      els.stateActions.append(element);
    });

    els.stateShelf.hidden = !options.shelf;
    els.shelfGrid.replaceChildren();

    if (options.shelf && catalogue) {
      catalogue.getReadableBooks().forEach(function (readable) {
        const link = document.createElement("a");
        link.className = "reader-shelf__link";
        link.href = catalogue.readerUrl(readable);

        const cover = document.createElement("img");
        cover.className = "reader-shelf__cover";
        cover.src = readable.cover;
        cover.width = 34;
        cover.height = 51;
        cover.alt = "";
        cover.loading = "lazy";

        const copy = document.createElement("span");
        const title = document.createElement("span");
        title.className = "reader-shelf__title";
        title.textContent = readable.title;
        const meta = document.createElement("span");
        meta.className = "reader-shelf__meta";
        meta.textContent =
          readable.author + (readable.reader && readable.reader.wordCount ? " · " + formatNumber(readable.reader.wordCount) + " words" : "");
        copy.append(title, meta);

        const arrow = document.createElement("span");
        arrow.className = "reader-shelf__arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";

        link.append(cover, copy, arrow);
        els.shelfGrid.append(link);
      });
    }

    els.state.scrollTop = 0;
  }

  function showLoading(note) {
    els.state.hidden = true;
    els.loading.hidden = false;
    els.view.hidden = false;
    els.view.inert = true;
    els.view.setAttribute("aria-busy", "true");
    els.loadingNote.textContent = note;
  }

  function hideLoading() {
    els.loading.hidden = true;
    els.view.inert = false;
    els.view.removeAttribute("aria-busy");
  }

  function setupMissing() {
    setChrome({
      title: "The reading room",
      author: "Bookora",
      exitHref: "explore.html",
      exitLabel: "Catalogue",
      exitAria: "Back to the catalogue",
      actions: false,
      pageTitle: "Reader — Bookora"
    });

    showState({
      eyebrow: "The reading room / Not found",
      title: "We couldn’t find <em>that edition.</em>",
      copy: [
        requestedId
          ? "The book reference in this link is not in the catalogue. It may be incomplete, or the edition may have left the shelf."
          : "This link is missing a book reference. Choose an edition from the catalogue to open its reader."
      ],
      actions: [
        { label: "Browse the catalogue", href: "explore.html", primary: true },
        { label: "Return home", href: "index.html" }
      ],
      shelf: true
    });
  }

  function setupUnavailable() {
    setChrome({
      title: book.title,
      author: book.author,
      exitHref: catalogue.bookUrl(book),
      exitLabel: "Edition",
      exitAria: "Back to the edition of " + book.title,
      actions: false,
      pageTitle: book.title + " — Reader — Bookora"
    });

    showState({
      eyebrow: "The reading room / Not yet",
      title: "This edition is <em>not in the reader yet.</em>",
      copy: [
        "Bookora currently opens " + catalogue.getReadableBooks().length + " complete texts in the reader. " +
          escapeHTML(book.title) +
          " remains in the catalogue with its edition notes, source link, and rights record.",
        "The edition page is the best place to read about this copy and follow its source."
      ],
      actions: [
        { label: "Back to the edition", href: catalogue.bookUrl(book), primary: true },
        { label: "Browse the catalogue", href: "explore.html" }
      ],
      shelf: true
    });
  }

  function setupCatalogueFailure() {
    setChrome({
      title: "The reading room",
      author: "Bookora",
      exitHref: "index.html",
      exitLabel: "Home",
      exitAria: "Return to the Bookora home page",
      actions: false,
      pageTitle: "Reader — Bookora"
    });

    showState({
      eyebrow: "The reading room / Unavailable",
      title: "The catalogue could not be <em>loaded.</em>",
      copy: ["Books metadata is unavailable in this copy of Bookora. Return home, then try again."],
      actions: [
        { label: "Return home", href: "index.html", primary: true },
        { label: "Browse the catalogue", href: "explore.html" }
      ],
      shelf: false
    });
  }

  function setupLoadFailure() {
    setChrome({
      title: book.title,
      author: book.author,
      exitHref: catalogue.bookUrl(book),
      exitLabel: "Edition",
      exitAria: "Back to the edition of " + book.title,
      actions: false,
      pageTitle: book.title + " — Reader — Bookora"
    });

    showState({
      eyebrow: "The reading room / Unavailable",
      title: "The text could not be <em>opened.</em>",
      copy: [
        "The browser could not load or lay out the bundled text for " +
          escapeHTML(book.title) +
          ". The file may be missing from this copy of Bookora, or the window may be too small for a measured page.",
        "Try again, or open the edition page for its source and notes."
      ],
      actions: [
        { label: "Try again", retry: true, primary: true },
        { label: "Back to the edition", href: catalogue.bookUrl(book) }
      ],
      shelf: true
    });
  }

  /* Preferences ------------------------------------------------------------- */

  function applyPrefs() {
    els.bookEl.dataset.size = String(prefs.size);
    els.bookEl.dataset.leading = String(prefs.leading);
  }

  function syncPrefsUI() {
    sizeButtons.forEach(function (button, index) {
      button.setAttribute("aria-pressed", String(index === prefs.size));
    });
    leadingButtons.forEach(function (button, index) {
      button.setAttribute("aria-pressed", String(index === prefs.leading));
    });

    if (els.sizeName) {
      els.sizeName.textContent = SIZE_NAMES[prefs.size];
    }
    if (els.leadingName) {
      els.leadingName.textContent = LEADING_NAMES[prefs.leading];
    }
    if (els.preview) {
      els.preview.style.fontSize = SIZE_VALUES[prefs.size].toFixed(2) + "rem";
      els.preview.style.lineHeight = String(LEADING_VALUES[prefs.leading]);
    }
  }

  function buildPrefControls() {
    if (!els.sizeOptions || !els.leadingOptions) {
      return;
    }

    SIZE_NAMES.forEach(function (name, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "reader-segment";
      button.textContent = name;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        setPrefs({ size: index, leading: prefs.leading });
      });
      sizeButtons.push(button);
      els.sizeOptions.append(button);
    });

    LEADING_NAMES.forEach(function (name, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "reader-segment";
      button.textContent = name;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () {
        setPrefs({ size: prefs.size, leading: index });
      });
      leadingButtons.push(button);
      els.leadingOptions.append(button);
    });

    if (els.reset) {
      els.reset.addEventListener("click", function () {
        setPrefs(Object.assign({}, DEFAULT_PREFS));
      });
    }

    syncPrefsUI();
  }

  function setPrefs(next) {
    const size = Number.isInteger(next.size) && next.size >= 0 && next.size < SIZE_VALUES.length ? next.size : DEFAULT_PREFS.size;
    const leading =
      Number.isInteger(next.leading) && next.leading >= 0 && next.leading < LEADING_VALUES.length ? next.leading : DEFAULT_PREFS.leading;

    if (size === prefs.size && leading === prefs.leading) {
      return;
    }

    prefs = { size: size, leading: leading };
    if (store) {
      store.savePrefs(prefs);
    }
    applyPrefs();
    syncPrefsUI();
    scheduleRepaginate();
  }

  function scheduleRepaginate() {
    if (!text || !pages.length) {
      return;
    }

    const anchor = currentAnchor();
    window.clearTimeout(prefsTimer);
    prefsTimer = window.setTimeout(function () {
      requestRepaginate(anchor);
    }, 160);
  }

  /* Text and inline runs ---------------------------------------------------- */

  function textToWords(value) {
    const words = [];
    const segments = String(value).split("_");

    segments.forEach(function (segment, index) {
      const italic = index % 2 === 1;
      const matches = segment.match(/\S+/g) || [];
      matches.forEach(function (word) {
        words.push({ text: word, italic: italic });
      });
    });

    return words;
  }

  function appendInline(container, words) {
    let index = 0;

    while (index < words.length) {
      if (words[index].italic) {
        const group = [];
        while (index < words.length && words[index].italic) {
          group.push(words[index].text);
          index += 1;
        }
        const emphasis = document.createElement("em");
        emphasis.textContent = group.join(" ");
        container.append(emphasis);
      } else {
        container.append(document.createTextNode(words[index].text));
        index += 1;
      }

      if (index < words.length) {
        container.append(document.createTextNode(" "));
      }
    }
  }

  function buildParagraph(words, continued) {
    const paragraph = document.createElement("p");
    paragraph.className = "reader-paragraph" + (continued ? " reader-paragraph--continued" : "");
    appendInline(paragraph, words);
    return paragraph;
  }

  function buildChapterHeading(chapter) {
    const heading = document.createElement("header");
    heading.className = "reader-chapter";

    if (chapter.title) {
      const label = document.createElement("p");
      label.className = "reader-chapter__label";
      label.textContent = chapter.label;
      heading.append(label);
    }

    const title = document.createElement("h2");
    title.className = "reader-chapter__title";
    title.textContent = chapter.title || chapter.label;
    heading.append(title);

    const rule = document.createElement("span");
    rule.className = "reader-chapter__rule";
    rule.setAttribute("aria-hidden", "true");
    heading.append(rule);

    return heading;
  }

  function buildVerseLine(line) {
    const item = document.createElement("p");
    item.className = "reader-verse__line";
    item.style.setProperty("--verse-indent", String(line.indent || 0));
    appendInline(item, textToWords(line.text));
    return item;
  }

  function buildVerse(lines) {
    const verse = document.createElement("div");
    verse.className = "reader-verse";
    lines.forEach(function (line) {
      verse.append(buildVerseLine(line));
    });
    return verse;
  }

  function renderLeaf(leaf, page, pageNumber, side) {
    const body = leaf.querySelector("[data-page-body]");
    const running = leaf.querySelector("[data-running]");
    const number = leaf.querySelector("[data-page-number]");

    body.replaceChildren();

    if (!page) {
      leaf.classList.add("reader-leaf--blank");
      leaf.setAttribute("aria-hidden", "true");
      running.textContent = "";
      number.textContent = "";
      return;
    }

    leaf.classList.remove("reader-leaf--blank");
    leaf.removeAttribute("aria-hidden");
    leaf.setAttribute("aria-label", "Page " + pageNumber);

    const chapter = text.chapters[page.chapter];
    const runningTitle = chapter.title || chapter.label;
    running.textContent = side === "left" ? book.title : runningTitle;

    page.items.forEach(function (item) {
      if (item.type === "heading") {
        body.append(buildChapterHeading(chapter));
      } else if (item.type === "p") {
        body.append(buildParagraph(item.words, item.continued));
      } else if (item.type === "verse") {
        body.append(buildVerse(item.lines));
      }
    });

    number.textContent = String(pageNumber);
  }

  /* Pagination -------------------------------------------------------------- */

  function pageItemElement(item, chapter) {
    if (item.type === "heading") {
      return buildChapterHeading(chapter);
    }
    if (item.type === "verse") {
      return buildVerse(item.lines);
    }
    return buildParagraph(item.words, item.continued);
  }

  function pageItemsFit(page) {
    const measure = els.measure;
    const body = els.bodies[0];
    measure.style.height = body.clientHeight + "px";
    measure.replaceChildren();
    page.items.forEach(function (item) {
      measure.append(pageItemElement(item, text.chapters[page.chapter]));
    });
    return measure.scrollHeight <= measure.clientHeight + 1;
  }

  function normalizePages() {
    let index = 0;
    let moves = 0;
    const maxMoves = pages.length * 2 + 50;

    while (index < pages.length && moves < maxMoves) {
      while (pages[index].items.length && !pageItemsFit(pages[index])) {
        const moved = pages[index].items.pop();
        moves += 1;
        if (index + 1 >= pages.length) {
          pages.push({ chapter: pages[index].chapter, chapterFirst: false, items: [], anchor: null });
        }
        pages[index + 1].items.unshift(moved);
      }
      index += 1;
    }

    pages.forEach(function (page) {
      page.anchor = pageAnchor(page);
    });
  }

  function pageAnchor(page) {
    if (!page.items.length) {
      return { chapter: page.chapter, block: 0, unit: 0 };
    }

    const first = page.items[0];
    if (first.type === "heading") {
      return { chapter: page.chapter, block: 0, unit: 0 };
    }

    return { chapter: page.chapter, block: first.block || 0, unit: first.unit || 0 };
  }

  function maxParagraphWords(words, continued) {
    const measure = els.measure;
    const overflow = measure.scrollHeight > measure.clientHeight + 1;
    let low = 1;
    let high = words.length;
    let best = 0;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const trial = buildParagraph(words.slice(0, middle), continued);
      measure.append(trial);
      const fits = !overflow;
      measure.removeChild(trial);

      if (fits) {
        best = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    return best;
  }

  async function paginateText(onProgress) {
    const measure = els.measure;
    const reference = els.bodies[0];
    const width = reference.clientWidth;
    const height = reference.clientHeight;

    if (width < 40 || height < 40) {
      throw new Error("No measurable page box");
    }

    measure.style.width = width + "px";
    measure.style.height = height + "px";
    measure.replaceChildren();

    const result = [];
    let page = null;

    function overflows() {
      return measure.scrollHeight > measure.clientHeight + 1;
    }

    function beginPage(chapterIndex, withHeading) {
      page = {
        chapter: chapterIndex,
        chapterFirst: Boolean(withHeading),
        items: [],
        anchor: null
      };
      result.push(page);
      measure.replaceChildren();

      if (withHeading) {
        measure.append(buildChapterHeading(text.chapters[chapterIndex]));
        page.items.push({ type: "heading", chapter: chapterIndex });
      }
    }

    for (let chapterIndex = 0; chapterIndex < text.chapters.length; chapterIndex += 1) {
      const chapter = text.chapters[chapterIndex];
      beginPage(chapterIndex, true);

      for (let blockIndex = 0; blockIndex < chapter.blocks.length; blockIndex += 1) {
        const block = chapter.blocks[blockIndex];

        if (block.type === "p") {
          const words = textToWords(block.text);
          if (!words.length) {
            continue;
          }

          let offset = 0;
          let continued = false;

          while (offset < words.length) {
            const remaining = words.slice(offset);
            const trial = buildParagraph(remaining, continued);
            measure.append(trial);

            if (!overflows()) {
              page.items.push({
                type: "p",
                block: blockIndex,
                unit: offset,
                words: remaining,
                continued: continued
              });
              offset = words.length;
              break;
            }

            measure.removeChild(trial);

            let fit = maxParagraphWords(remaining, continued);

            if (fit === 0) {
              if (measure.childElementCount === 0) {
                fit = 1;
              } else {
                beginPage(chapterIndex, false);
                continue;
              }
            }

            const fittedWords = remaining.slice(0, fit);
            measure.append(buildParagraph(fittedWords, continued));
            page.items.push({
              type: "p",
              block: blockIndex,
              unit: offset,
              words: fittedWords,
              continued: continued
            });
            offset += fit;
            continued = true;

            if (offset < words.length) {
              beginPage(chapterIndex, false);
            }
          }
        } else if (block.type === "verse") {
          const lines = block.lines.filter(function (line) {
            return line && line.text && line.text.trim();
          });
          if (!lines.length) {
            continue;
          }

          let offset = 0;

          while (offset < lines.length) {
            const remaining = lines.slice(offset);
            const trial = buildVerse(remaining);
            measure.append(trial);

            if (!overflows()) {
              page.items.push({
                type: "verse",
                block: blockIndex,
                unit: offset,
                lines: remaining
              });
              offset = lines.length;
              break;
            }

            measure.removeChild(trial);

            const container = buildVerse([]);
            measure.append(container);
            let fitted = 0;

            for (let lineIndex = offset; lineIndex < lines.length; lineIndex += 1) {
              const line = buildVerseLine(lines[lineIndex]);
              container.append(line);
              if (overflows()) {
                container.removeChild(line);
                break;
              }
              fitted += 1;
            }

            if (fitted === 0) {
              measure.removeChild(container);

              if (measure.childElementCount === 0) {
                const forced = buildVerse([lines[offset]]);
                measure.append(forced);
                page.items.push({
                  type: "verse",
                  block: blockIndex,
                  unit: offset,
                  lines: [lines[offset]]
                });
                offset += 1;
                if (offset < lines.length) {
                  beginPage(chapterIndex, false);
                }
                continue;
              }

              beginPage(chapterIndex, false);
              continue;
            }

            page.items.push({
              type: "verse",
              block: blockIndex,
              unit: offset,
              lines: lines.slice(offset, offset + fitted)
            });
            offset += fitted;

            if (offset < lines.length) {
              beginPage(chapterIndex, false);
            }
          }
        }
      }

      if (onProgress) {
        onProgress(chapterIndex + 1, text.chapters.length);
      }

      if (chapterIndex % 3 === 2) {
        await nextTick();
      }
    }

    result.forEach(function (item) {
      item.anchor = pageAnchor(item);
    });

    return result;
  }

  function computeChapterPages() {
    const map = [];
    pages.forEach(function (page, index) {
      if (page.chapterFirst) {
        map[page.chapter] = index;
      }
    });
    return map;
  }

  function indexFromAnchor(anchor) {
    if (!anchor || !pages.length) {
      return 0;
    }

    let candidate = 0;

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];

      if (page.chapter < anchor.chapter) {
        candidate = index;
        continue;
      }

      if (page.chapter > anchor.chapter) {
        break;
      }

      const start = page.anchor || { block: 0, unit: 0 };
      if (start.block < anchor.block || (start.block === anchor.block && start.unit <= anchor.unit)) {
        candidate = index;
      } else {
        break;
      }
    }

    return candidate;
  }

  function currentAnchor() {
    if (!pages.length) {
      return initialAnchor;
    }

    const page = pages[current];
    return page && page.anchor ? Object.assign({}, page.anchor) : null;
  }

  function alignToSpread() {
    if (layout === "spread") {
      current -= current % 2;
    }
  }

  function recordMetrics() {
    const reference = els.bodies[0];
    lastMetrics = {
      width: reference.clientWidth,
      height: reference.clientHeight,
      layout: layout
    };
  }

  /* Rendering --------------------------------------------------------------- */

  function render() {
    const spread = layout === "spread";
    current = clamp(current, 0, pages.length - 1);

    if (spread) {
      current -= current % 2;
    }

    const leftPage = pages[current];
    const rightPage = spread ? pages[current + 1] : null;

    els.leaves[0].hidden = false;
    renderLeaf(els.leaves[0], leftPage, current + 1, spread ? "left" : "single");

    if (spread) {
      els.leaves[1].hidden = false;
      renderLeaf(els.leaves[1], rightPage, current + 2, "right");
    } else {
      els.leaves[1].hidden = true;
    }

    updateControls();
    updateContentsState();
  }

  function updateControls() {
    const total = pages.length;
    const spread = layout === "spread";
    const visibleEnd = spread ? Math.min(current + 1, total - 1) : current;
    const twoPages = spread && current + 1 < total;
    const percent = clamp(Math.round(((visibleEnd + 1) / total) * 100), 1, 100);

    els.pageLabel.textContent = twoPages
      ? "Pages " + (current + 1) + "–" + (current + 2) + " of " + total
      : "Page " + (current + 1) + " of " + total;
    els.percentLabel.textContent = percent + "%";
    els.progressBar.style.width = percent + "%";

    els.prev.disabled = current <= 0;
    els.next.disabled = spread ? current + 2 >= total : current + 1 >= total;
  }

  function setWorking(working) {
    els.bookEl.setAttribute("aria-busy", working ? "true" : "false");

    if (working) {
      els.pageLabel.textContent = "Laying out the pages…";
      els.prev.disabled = true;
      els.next.disabled = true;
    }
  }

  function goTo(index) {
    if (!pages.length) {
      return;
    }

    let target = clamp(index, 0, pages.length - 1);
    if (layout === "spread") {
      target -= target % 2;
    }

    if (target === current) {
      return;
    }

    current = target;
    render();
    saveProgress();
  }

  function nextPage() {
    if (!pages.length || els.bookEl.getAttribute("aria-busy") === "true") {
      return;
    }

    const step = layout === "spread" ? 2 : 1;
    if (current + step < pages.length) {
      goTo(current + step);
    }
  }

  function previousPage() {
    if (!pages.length || els.bookEl.getAttribute("aria-busy") === "true") {
      return;
    }

    const step = layout === "spread" ? 2 : 1;
    if (current - step >= 0) {
      goTo(current - step);
    }
  }

  function jumpToChapter(chapterIndex) {
    if (chapterPages[chapterIndex] === undefined) {
      return;
    }

    goTo(chapterPages[chapterIndex]);

    if (els.contentsDialog && els.contentsDialog.open) {
      els.contentsDialog.close();
    }
  }

  /* Progress ---------------------------------------------------------------- */

  function saveProgress() {
    if (!store || !book || !pages.length || !pages[current]) {
      return;
    }

    const page = pages[current];
    const spread = layout === "spread";
    const visibleEnd = spread ? Math.min(current + 1, pages.length - 1) : current;
    const percent = clamp(Math.round(((visibleEnd + 1) / pages.length) * 100), 1, 100);

    store.saveProgress(book.id, {
      chapter: page.chapter,
      block: page.anchor ? page.anchor.block : 0,
      unit: page.anchor ? page.anchor.unit : 0,
      page: current + 1,
      percent: percent
    });
  }

  /* Contents ---------------------------------------------------------------- */

  function buildContents() {
    if (!els.toc) {
      return;
    }

    els.toc.replaceChildren();
    contentsButtons = [];
    contentsPageEls = [];

    if (els.contentsIntro) {
      const count = text.chapters.length;
      const unit = (book.reader && book.reader.unit) || "chapter";
      const units = unit === "story" ? "stories" : unit + "s";
      const sections = count === 1 ? "one " + unit : count + " " + units;
      const words = text.wordCount ? formatNumber(text.wordCount) + " words" : "the complete text";
      els.contentsIntro.textContent =
        book.title + " by " + book.author + ". " + words + " across " + sections + ". Page numbers follow the current display settings.";
    }

    text.chapters.forEach(function (chapter, index) {
      const item = document.createElement("li");
      item.className = "reader-toc__item";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "reader-toc__button";

      const number = document.createElement("span");
      number.className = "reader-toc__index";
      number.textContent = chapter.number || String(index + 1).padStart(2, "0");

      const title = document.createElement("span");
      title.className = "reader-toc__title";
      title.textContent = chapter.title || chapter.label;

      const page = document.createElement("span");
      page.className = "reader-toc__page";
      page.textContent = "p. " + (chapterPages[index] !== undefined ? chapterPages[index] + 1 : "—");
      contentsPageEls.push(page);

      button.append(number, title, page);
      button.addEventListener("click", function () {
        jumpToChapter(index);
      });

      item.append(button);
      els.toc.append(item);
      contentsButtons.push(button);
    });

    updateContentsState();
  }

  function updateContentsPages() {
    contentsPageEls.forEach(function (element, index) {
      element.textContent = "p. " + (chapterPages[index] !== undefined ? chapterPages[index] + 1 : "—");
    });
  }

  function updateContentsState() {
    const activeChapter = currentChapterIndex();
    contentsButtons.forEach(function (button, index) {
      if (index === activeChapter) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function setupSource() {
    const edition = text.edition || (book.reader && book.reader.edition) || "";
    const rights = text.rights || book.license || "";
    const note = [edition, rights].filter(Boolean).join(" · ");

    els.sources.forEach(function (element) {
      element.textContent = note;
    });

    els.sourceLinks.forEach(function (link) {
      link.href = book.sourceUrl;
      link.setAttribute("aria-label", "View the source edition of " + book.title + " at " + book.source);
    });
  }

  /* Pagination runs --------------------------------------------------------- */

  async function loadBook() {
    if (!book) {
      setupMissing();
      return;
    }

    document.title = book.title + " — Reader — Bookora";

    if (!catalogue.hasReaderText(book)) {
      setupUnavailable();
      return;
    }

    setChrome({
      title: book.title,
      author: book.author,
      exitHref: catalogue.bookUrl(book),
      exitLabel: "Edition",
      exitAria: "Back to the edition of " + book.title,
      actions: true,
      pageTitle: book.title + " — Reader — Bookora"
    });

    if (els.readerHeading) {
      els.readerHeading.textContent = "Reading " + book.title + " by " + book.author;
    }

    pages = [];
    chapterPages = [];
    text = null;
    current = 0;
    initialAnchor = null;

    layout = getLayout();
    els.bookEl.dataset.layout = layout;
    applyPrefs();

    showLoading("Fetching the text from this copy of Bookora…");

    try {
      const response = await fetch(book.reader.file, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const loaded = await response.json();
      if (!loaded || !Array.isArray(loaded.chapters) || !loaded.chapters.length) {
        throw new Error("Invalid text");
      }

      text = loaded;

      try {
        await document.fonts.ready;
      } catch (error) {
        /* The stored fallbacks are still measurable. */
      }

      await nextFrame();
      await nextFrame();

      els.loadingNote.textContent = "Measuring the pages — this can take a moment.";
      pages = await paginateText(function (done, total) {
        els.loadingNote.textContent = "Measuring the pages · " + done + " of " + total + " chapters.";
      });

      if (!pages.length) {
        throw new Error("No pages");
      }

      normalizePages();

      chapterPages = computeChapterPages();
      buildContents();
      setupSource();

      const saved = !startFresh && store ? store.getProgress(book.id) : null;
      if (saved && saved.chapter < text.chapters.length) {
        initialAnchor = { chapter: saved.chapter, block: saved.block, unit: saved.unit };
      }

      current = initialAnchor ? indexFromAnchor(initialAnchor) : 0;
      if (saved && !initialAnchor && saved.page) {
        current = clamp(saved.page - 1, 0, pages.length - 1);
      }
      alignToSpread();

      render();
      recordMetrics();
      hideLoading();
      saveProgress();

      if (startFresh) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("start");
          window.history.replaceState(null, "", url.toString());
        } catch (error) {
          /* The reset link still opens the first page if history is restricted. */
        }
      }
    } catch (error) {
      setupLoadFailure();
    }
  }

  function requestRepaginate(anchor) {
    if (!text) {
      return;
    }

    if (paginationJob) {
      pendingAnchor = anchor || currentAnchor();
      return;
    }

    paginationJob = (async function () {
      setWorking(true);
      await nextFrame();
      await nextFrame();

      try {
        const result = await paginateText();
        pages = result;
        normalizePages();
        chapterPages = computeChapterPages();
        updateContentsPages();
        current = clamp(anchor ? indexFromAnchor(anchor) : current, 0, pages.length - 1);
        alignToSpread();
        render();
        recordMetrics();
        saveProgress();
      } catch (error) {
        setupLoadFailure();
      } finally {
        setWorking(false);
        paginationJob = null;

        if (pendingAnchor) {
          const next = pendingAnchor;
          pendingAnchor = null;
          requestRepaginate(next);
        }
      }
    })();
  }

  /* Resize and layout changes ---------------------------------------------- */

  function handleResize() {
    if (!text || !pages.length) {
      return;
    }

    const nextLayout = getLayout();
    const reference = els.bodies[0];
    const width = reference.clientWidth;
    const height = reference.clientHeight;

    if (
      nextLayout === layout &&
      lastMetrics &&
      Math.abs(width - lastMetrics.width) < 2 &&
      Math.abs(height - lastMetrics.height) < 2
    ) {
      return;
    }

    const anchor = currentAnchor();
    layout = nextLayout;
    els.bookEl.dataset.layout = layout;
    els.leaves[1].hidden = layout === "single";

    window.clearTimeout(prefsTimer);
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      requestRepaginate(anchor);
    }, 140);
  }

  /* Events ------------------------------------------------------------------ */

  els.prev.addEventListener("click", previousPage);
  els.next.addEventListener("click", nextPage);

  document.addEventListener("keydown", function (event) {
    if (els.view.hidden || !pages.length || els.bookEl.getAttribute("aria-busy") === "true") {
      return;
    }

    if (document.querySelector("dialog[open]")) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const target = event.target;
    const interactive =
      target && target.closest && target.closest("input, textarea, select, button, a, [contenteditable='true']");

    if (interactive && (event.key === " " || event.key === "Enter")) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "PageDown" || (event.key === " " && !event.shiftKey)) {
      event.preventDefault();
      nextPage();
    } else if (event.key === "ArrowLeft" || event.key === "PageUp" || (event.key === " " && event.shiftKey)) {
      event.preventDefault();
      previousPage();
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(pages.length - 1);
    }
  });

  els.stage.addEventListener(
    "touchstart",
    function (event) {
      if (event.touches.length !== 1) {
        touchStart = null;
        return;
      }

      const touch = event.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    },
    { passive: true }
  );

  els.stage.addEventListener(
    "touchend",
    function (event) {
      if (!touchStart || !event.changedTouches.length) {
        touchStart = null;
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const elapsed = Date.now() - touchStart.time;
      touchStart = null;

      if (document.querySelector("dialog[open]")) {
        return;
      }

      if (Math.abs(deltaX) > 52 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35 && elapsed < 900) {
        if (deltaX < 0) {
          nextPage();
        } else {
          previousPage();
        }
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(handleResize, 180);
  });

  window.addEventListener("pagehide", saveProgress);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      saveProgress();
    }
  });

  if (els.contentsTrigger) {
    els.contentsTrigger.addEventListener("click", function () {
      window.setTimeout(function () {
        const active = contentsButtons[currentChapterIndex()];
        if (active && active.scrollIntoView) {
          active.scrollIntoView({ block: "center" });
        }
      }, 80);
    });
  }

  if (els.displayTrigger) {
    els.displayTrigger.addEventListener("click", syncPrefsUI);
  }

  /* Start ------------------------------------------------------------------- */

  buildPrefControls();
  applyPrefs();
  els.bookEl.dataset.layout = layout;
  els.leaves[1].hidden = layout === "single";

  if (!catalogue) {
    setupCatalogueFailure();
  } else if (!book) {
    setupMissing();
  } else {
    loadBook();
  }
})();
