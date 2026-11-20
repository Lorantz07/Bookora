/* ==========================================================================
   Bookora — edition detail
   Renders one catalogue record from ?book=id, with a clear not-found state.
   ========================================================================== */

(function () {
  "use strict";

  const catalogue = window.Bookora;
  const readingStore = window.BookoraReaderStore;
  const mount = document.querySelector("[data-edition]");
  const breadcrumb = document.querySelector("[data-breadcrumb-current]");
  const descriptionMeta = document.querySelector('meta[name="description"]');

  if (!catalogue || !mount) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const requestedId = (params.get("book") || "").trim();
  const book = requestedId ? catalogue.getBook(requestedId) : null;

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setMeta(title, description) {
    document.title = title;

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", description);
    }
  }

  function setNoIndex() {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
  }

  function externalLink(url, label, className, withIcon) {
    return (
      '<a class="' + className + '" href="' + escapeHTML(url) + '" target="_blank" rel="noopener noreferrer">' +
        escapeHTML(label) +
        '<span class="sr-only"> (opens in a new tab)</span>' +
        (withIcon ? '<svg class="icon" aria-hidden="true"><use href="#icon-external-link"></use></svg>' : "") +
      '</a>'
    );
  }

  function attachCoverFallbacks(scope) {
    scope.querySelectorAll("[data-cover]").forEach(function (cover) {
      const image = cover.querySelector("img");

      if (!image) {
        return;
      }

      function markFallback() {
        cover.classList.add("is-fallback");
      }

      image.addEventListener("error", markFallback, { once: true });

      if (image.complete && image.naturalWidth === 0) {
        markFallback();
      }
    });
  }

  function pluralUnit(unit, count) {
    if (unit === "story") {
      return count === 1 ? "story" : "stories";
    }
    return count === 1 ? unit : unit + "s";
  }

  function titleCase(value) {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  function readerCard(record) {
    const readable = catalogue.hasReaderText(record);
    const reader = record.reader || {};
    const unit = reader.unit || "chapter";
    const chapters = reader.chapters || 0;
    const progress = readable && readingStore ? readingStore.getProgress(record.id) : null;
    const percent = progress ? Math.min(Math.max(progress.percent, 0), 100) : 0;
    const finished = Boolean(progress && percent >= 99);

    if (!readable) {
      const readableBooks = catalogue.getReadableBooks();
      const count = readableBooks.length;
      const titles = readableBooks.map(function (readableBook) {
        return readableBook.title;
      });
      const titleLine = titles.length
        ? " In the reader now: " + titles.slice(0, -1).join(", ") + (titles.length > 1 ? ", and " : "") + titles[titles.length - 1] + "."
        : "";

      return (
        '<aside class="edition-reader" aria-labelledby="reader-status-title">' +
          '<div class="edition-reader__head">' +
            '<span>Read in Bookora</span>' +
            '<span>Not yet</span>' +
          '</div>' +
          '<h2 id="reader-status-title">This text is <em>not in the reader yet.</em></h2>' +
          '<p>The reader currently opens ' + count + ' complete ' + (count === 1 ? "text" : "texts") + '. This edition stays in the catalogue with its source, rights note, and edition record.</p>' +
          '<a class="text-link" href="explore.html">Explore the catalogue' +
            '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
          '</a>' +
          '<p class="edition-reader__note">' + escapeHTML(titleLine.trim()) + '</p>' +
        '</aside>'
      );
    }

    const readerHref = catalogue.readerUrl(record);
    const restartHref = catalogue.readerUrl(record, { start: true });
    const words = reader.wordCount ? Number(reader.wordCount).toLocaleString("en-US") + " words" : "the complete text";
    const sections = chapters
      ? chapters + " " + pluralUnit(unit, chapters)
      : "the complete text";
    const place = chapters > 1
      ? titleCase(unit) + " " + Math.min(progress ? progress.chapter + 1 : 1, chapters) + " of " + chapters
      : titleCase(unit);

    let status = "Available now";
    let heading = "Read it <em>here.</em>";
    let copy =
      "The complete text — " + words + " across " + sections + " — opens in measured pages. Your place and display settings stay on this device.";
    let primaryLabel = "Start reading";
    let primaryHref = readerHref;
    let secondary = "";

    if (progress && finished) {
      status = "Finished";
      heading = "Read it <em>again.</em>";
      copy = "You reached the end of " + escapeHTML(record.title) + ". Begin again from the first page, or reopen the place you saved.";
      primaryLabel = "Read again";
      primaryHref = restartHref;
      secondary =
        '<a class="text-link" href="' + escapeHTML(readerHref) + '">Open saved place</a>';
    } else if (progress) {
      status = "In progress";
      heading = "Continue <em>reading.</em>";
      copy = "Your place is saved on this device. Return to " + escapeHTML(place.toLowerCase()) + ", or begin again from the first page.";
      primaryLabel = "Continue reading";
      secondary =
        '<a class="text-link" href="' + escapeHTML(restartHref) + '">Start over</a>';
    }

    return (
      '<aside class="edition-reader" aria-labelledby="reader-status-title">' +
        '<div class="edition-reader__head">' +
          '<span>Read in Bookora</span>' +
          '<span>' + escapeHTML(status) + '</span>' +
        '</div>' +
        '<h2 id="reader-status-title">' + heading + '</h2>' +
        '<p>' + copy + '</p>' +
        (progress
          ? '<div class="edition-reader__progress">' +
              '<div class="edition-reader__bar" role="img" aria-label="' + percent + '% read"><span style="width: ' + percent + '%"></span></div>' +
              '<div class="edition-reader__progress-row">' +
                '<span>' + percent + '% read</span>' +
                '<span>' + escapeHTML(place) + '</span>' +
              '</div>' +
            '</div>'
          : "") +
        '<div class="edition-reader__actions">' +
          '<a class="button button--light" href="' + escapeHTML(primaryHref) + '">' +
            primaryLabel +
            '<svg class="icon icon--forward" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
          '</a>' +
          secondary +
        '</div>' +
        '<p class="edition-reader__note">Progress, type size, and line height stay in this browser. No account is created.</p>' +
      '</aside>'
    );
  }

  function pathsHTML(bookCollections) {
    if (!bookCollections.length) {
      return "";
    }

    return (
      '<div class="edition__paths">' +
        '<p class="eyebrow">Reading paths</p>' +
        '<ul>' +
          bookCollections.map(function (collection) {
            return (
              '<li>' +
                '<a href="explore.html?collection=' + encodeURIComponent(collection.id) + '">' +
                  '<span class="edition__path-index">' + escapeHTML(collection.index) + '</span>' +
                  '<span>' + escapeHTML(collection.title) + '</span>' +
                  '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
                '</a>' +
              '</li>'
            );
          }).join("") +
        '</ul>' +
      '</div>'
    );
  }

  function relatedTemplate(relatedBook) {
    const category = catalogue.getCategoryForBook(relatedBook);

    return (
      '<li>' +
        '<a class="related-card" href="' + escapeHTML(catalogue.bookUrl(relatedBook)) + '">' +
          '<span class="related-card__cover" data-cover>' +
            '<span class="related-card__fallback" aria-hidden="true">' + escapeHTML(relatedBook.title) + '</span>' +
            '<img src="' + escapeHTML(relatedBook.cover) + '" width="600" height="900" alt="" loading="lazy" decoding="async">' +
          '</span>' +
          '<span class="related-card__body">' +
            '<span class="related-card__kicker">' + escapeHTML(relatedBook.language) + ' · ' + escapeHTML(category ? category.name : relatedBook.category) + '</span>' +
            '<span class="related-card__title">' + escapeHTML(relatedBook.title) + '</span>' +
            '<span class="related-card__author">' + escapeHTML(relatedBook.author) + '</span>' +
          '</span>' +
          '<span class="related-card__arrow" aria-hidden="true">' +
            '<svg class="icon"><use href="#icon-arrow-up-right"></use></svg>' +
          '</span>' +
        '</a>' +
      '</li>'
    );
  }

  function renderBook(record) {
    const category = catalogue.getCategoryForBook(record) || { id: "", name: record.category };
    const language = catalogue.getLanguageForBook(record) || { id: "", name: record.language };
    const bookCollections = catalogue.getCollectionsForBook(record);
    const related = catalogue.getRelatedBooks(record, 3);
    const readable = catalogue.hasReaderText(record);
    const readerHref = readable ? catalogue.readerUrl(record) : "";
    const readerAction = readable
      ? '<a class="button button--primary" href="' + escapeHTML(readerHref) + '">' +
          'Read in Bookora' +
          '<svg class="icon icon--forward" aria-hidden="true"><use href="#icon-book-open"></use></svg>' +
        '</a>'
      : externalLink(record.sourceUrl, "View source edition", "button button--primary", true);
    const categoryHref = category.id
      ? "explore.html?category=" + encodeURIComponent(category.id)
      : "explore.html";
    const languageHref = language.id
      ? "explore.html?language=" + encodeURIComponent(language.id)
      : "explore.html";
    const collectionLine = bookCollections.length
      ? " It also appears in the " + bookCollections.map(function (collection) {
          return "“" + collection.title + "”";
        }).join(" and ") + " reading " + (bookCollections.length === 1 ? "path" : "paths") + "."
      : "";

    setMeta(
      record.title + " — Bookora",
      "Edition details for " + record.title + " by " + record.author + ", including " +
        (readable ? "the in-browser reader, " : "") + "language, source, and rights notes."
    );

    if (breadcrumb) {
      breadcrumb.textContent = record.title;
    }

    mount.innerHTML =
      '<article class="edition">' +
        '<header class="edition__hero">' +
          '<div class="edition__visual">' +
            '<figure class="edition__cover" data-cover>' +
              '<span class="edition__cover-fallback" aria-hidden="true">' +
                '<span class="edition__cover-fallback-title">' + escapeHTML(record.title) + '</span>' +
                '<span class="edition__cover-fallback-author">' + escapeHTML(record.author) + '</span>' +
              '</span>' +
              '<img src="' + escapeHTML(record.cover) + '" width="600" height="900" alt="Cover of ' + escapeHTML(record.title) + '" fetchpriority="high" decoding="async">' +
              '<figcaption>Bookora open edition · Original cover artwork</figcaption>' +
            '</figure>' +
            pathsHTML(bookCollections) +
          '</div>' +

          '<div class="edition__intro">' +
            '<p class="eyebrow">' + escapeHTML(category.name) + ' / The edition</p>' +
            '<h1 class="edition__title">' + escapeHTML(record.title) + '</h1>' +
            '<p class="edition__author">By ' + escapeHTML(record.author) + '</p>' +
            '<p class="edition__description">' + escapeHTML(record.description) + '</p>' +

            '<dl class="edition__facts">' +
              '<div>' +
                '<dt>Language</dt>' +
                '<dd><a href="' + escapeHTML(languageHref) + '">' + escapeHTML(language.name) + '</a></dd>' +
              '</div>' +
              '<div>' +
                '<dt>Published / edition</dt>' +
                '<dd>' + escapeHTML(record.published) + '</dd>' +
              '</div>' +
              '<div>' +
                '<dt>Subject</dt>' +
                '<dd><a href="' + escapeHTML(categoryHref) + '">' + escapeHTML(category.name) + '</a></dd>' +
              '</div>' +
              '<div>' +
                '<dt>Source</dt>' +
                '<dd>' + externalLink(record.sourceUrl, record.source, "edition__source-link", true) + '</dd>' +
              '</div>' +
              (record.contributor
                ? '<div class="edition__fact--wide"><dt>Contributor</dt><dd>' + escapeHTML(record.contributor) + '</dd></div>'
                : "") +
            '</dl>' +

            '<div class="edition__actions">' +
              readerAction +
              externalLink(
                record.sourceUrl,
                readable ? "Source edition" : "View source edition",
                "text-link",
                true
              ) +
              '<a class="text-link" href="explore.html">' +
                '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-left"></use></svg>' +
                'Back to the catalogue' +
              '</a>' +
            '</div>' +

            readerCard(record) +
          '</div>' +
        '</header>' +

        '<section class="edition-notes" aria-labelledby="edition-notes-title">' +
          '<div class="edition-notes__head">' +
            '<div>' +
              '<p class="eyebrow">Edition notes</p>' +
              '<h2 id="edition-notes-title">What you are <em>looking at.</em></h2>' +
            '</div>' +
            '<p>Bookora keeps the source, rights note, and catalogue context beside every edition. ' +
              (readable
                ? "This text is bundled with the site for in-browser reading, and the source edition remains with the archive that holds it."
                : "The full text currently remains with the archive that holds it.") +
            '</p>' +
          '</div>' +

          '<div class="edition-notes__grid">' +
            '<section class="edition-note">' +
              '<p class="edition-note__index" aria-hidden="true">01</p>' +
              '<h3>About the text</h3>' +
              '<p>' + escapeHTML(record.description) + '</p>' +
              '<p>This record sits on the ' + escapeHTML(category.name) + ' shelf.' + escapeHTML(collectionLine) + ' It is one of ' + catalogue.books.length + ' editions in the current catalogue.</p>' +
            '</section>' +

            '<section class="edition-note">' +
              '<p class="edition-note__index" aria-hidden="true">02</p>' +
              '<h3>This edition</h3>' +
              '<dl>' +
                (record.contributor
                  ? '<div><dt>Contributor</dt><dd>' + escapeHTML(record.contributor) + '</dd></div>'
                  : "") +
                '<div><dt>Published / edition</dt><dd>' + escapeHTML(record.published) + '</dd></div>' +
                '<div><dt>Language</dt><dd>' + escapeHTML(language.name) + '</dd></div>' +
                '<div><dt>Source</dt><dd>' + externalLink(record.sourceUrl, record.source, "edition__source-link", false) + '</dd></div>' +
                '<div><dt>Rights note</dt><dd>' + escapeHTML(record.license) + '</dd></div>' +
              '</dl>' +
            '</section>' +

            '<section class="edition-note">' +
              '<p class="edition-note__index" aria-hidden="true">03</p>' +
              '<h3>Source &amp; provenance</h3>' +
              '<p>This record points to ' + escapeHTML(record.source) + '. ' +
                (readable
                  ? "The complete text is bundled with Bookora for in-browser reading; the source edition remains at the archive."
                  : "The full text currently stays with the source archive.") +
              '</p>' +
              '<p>' + escapeHTML(record.license) + '. Public-domain status can differ by jurisdiction, so consult the source record before reuse.</p>' +
              '<a class="text-link" href="about.html#sources">How sourcing works' +
                '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
              '</a>' +
            '</section>' +
          '</div>' +
        '</section>' +

        '<section class="edition-related" aria-labelledby="related-title">' +
          '<div class="edition-related__head">' +
            '<div>' +
              '<p class="eyebrow">Keep browsing</p>' +
              '<h2 id="related-title">Nearby on <em>the shelf.</em></h2>' +
            '</div>' +
            '<a class="text-link" href="explore.html">All editions' +
              '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
            '</a>' +
          '</div>' +
          '<ul class="related-list">' + related.map(relatedTemplate).join("") + '</ul>' +
        '</section>' +
      '</article>';

    attachCoverFallbacks(mount);
  }

  function renderNotFound() {
    const featured = catalogue.getFeaturedBooks().slice(0, 3);
    const reason = requestedId
      ? "The book reference in this link is not in the catalogue. It may be incomplete, or the edition may have left the shelf."
      : "This link is missing a book reference. Choose an edition from the catalogue to see its notes, source, and rights record.";

    setMeta(
      "Edition not found — Bookora",
      "The requested Bookora edition could not be found. Browse the catalogue to choose another public-domain book."
    );
    setNoIndex();

    if (breadcrumb) {
      breadcrumb.textContent = "Not found";
    }

    mount.innerHTML =
      '<section class="edition-missing">' +
        '<p class="eyebrow">The edition / Not found</p>' +
        '<h1>That edition <em>isn\'t on the shelf.</em></h1>' +
        '<p>' + escapeHTML(reason) + '</p>' +
        '<div class="edition-missing__actions">' +
          '<a class="button button--primary" href="explore.html">Browse the catalogue' +
            '<svg class="icon icon--forward" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
          '</a>' +
          '<a class="text-link" href="index.html">Return home</a>' +
        '</div>' +
        '<div class="edition-missing__shelf">' +
          '<p class="eyebrow">Start with these</p>' +
          '<ul>' +
            featured.map(function (featuredBook) {
              return (
                '<li>' +
                  '<a href="' + escapeHTML(catalogue.bookUrl(featuredBook)) + '">' +
                    '<span>' +
                      '<span class="edition-missing__title">' + escapeHTML(featuredBook.title) + '</span>' +
                      '<span class="edition-missing__author">' + escapeHTML(featuredBook.author) + '</span>' +
                    '</span>' +
                    '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-up-right"></use></svg>' +
                  '</a>' +
                '</li>'
              );
            }).join("") +
          '</ul>' +
        '</div>' +
      '</section>';
  }

  window.addEventListener("pageshow", function (event) {
    if (event.persisted && book) {
      renderBook(book);
    }
  });

  if (book) {
    renderBook(book);
  } else {
    renderNotFound();
  }
})();
