/* ==========================================================================
   Bookora — home page rendering
   Builds the featured shelf and curated collections from the local catalogue.
   ========================================================================== */

(function () {
  "use strict";

  const catalogue = window.Bookora;

  if (!catalogue) {
    return;
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function bookHref(book) {
    return "book-detail.html?book=" + encodeURIComponent(book.id);
  }

  function coverHTML(book, className, eager) {
    return (
      '<img class="' + className + '" ' +
      'src="' + escapeHTML(book.cover) + '" ' +
      'width="600" height="900" ' +
      'alt="Cover of ' + escapeHTML(book.title) + '" ' +
      (eager ? 'loading="eager"' : 'loading="lazy"') + ' decoding="async">'
    );
  }

  function featuredBookTemplate(book, index) {
    const number = String(index + 1).padStart(2, "0");

    return (
      '<article class="book-card">' +
        '<a class="book-card__link" href="' + bookHref(book) + '">' +
          '<span class="book-card__kicker">' +
            '<span class="book-card__index" aria-hidden="true">' + number + '</span>' +
            '<span class="book-card__tags">' + escapeHTML(book.language) + ' · ' + escapeHTML(book.category) + '</span>' +
          '</span>' +
          '<span class="book-card__cover">' +
            '<span class="book-card__fallback" aria-hidden="true">' + escapeHTML(book.title) + '</span>' +
            coverHTML(book, "", index < 2) +
            '<span class="book-card__hover" aria-hidden="true">' +
              '<svg class="icon"><use href="#icon-arrow-up-right"></use></svg>' +
            '</span>' +
          '</span>' +
          '<h3 class="book-card__title">' + escapeHTML(book.title) + '</h3>' +
          '<span class="book-card__author">' + escapeHTML(book.author) + '</span>' +
        '</a>' +
      '</article>'
    );
  }

  function collectionTemplate(collection, index) {
    const books = catalogue.getCollectionBooks(collection);
    const isLead = index === 0;
    const volumeLabel = books.length + (books.length === 1 ? " volume" : " volumes");
    const collectionHref = "explore.html?collection=" + encodeURIComponent(collection.id);
    const heading = escapeHTML(collection.title) +
      (collection.accent ? '<em>' + escapeHTML(collection.accent) + '</em>' : "");

    const covers = books.map(function (book) {
      return (
        '<span class="collection-card__book">' +
          '<img src="' + escapeHTML(book.cover) + '" ' +
            'width="600" height="900" ' +
            'alt="" loading="lazy" decoding="async">' +
        '</span>'
      );
    }).join("");

    return (
      '<a class="collection-card collection-card--' + escapeHTML(collection.tone) +
        (isLead ? ' collection-card--lead' : '') + '" ' +
        'href="' + collectionHref + '" ' +
        'aria-label="Explore the ' + escapeHTML(collection.title) + ' collection">' +
        '<span class="collection-card__head">' +
          '<span>Collection ' + escapeHTML(collection.index) + '</span>' +
          '<span>' + escapeHTML(volumeLabel) + '</span>' +
        '</span>' +
        '<span class="collection-card__art" aria-hidden="true">' + covers + '</span>' +
        '<span class="collection-card__body">' +
          '<h3>' + heading + '</h3>' +
          '<span class="collection-card__description">' + escapeHTML(collection.description) + '</span>' +
          '<span class="collection-card__cta">' +
            'Explore collection' +
            '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
          '</span>' +
        '</span>' +
      '</a>'
    );
  }

  function attachFallbacks(container) {
    container.querySelectorAll(".book-card__cover img").forEach(function (image) {
      function markFallback() {
        const cover = image.closest(".book-card__cover");
        if (cover) {
          cover.classList.add("is-fallback");
        }
      }

      image.addEventListener("error", markFallback, { once: true });

      if (image.complete && image.naturalWidth === 0) {
        markFallback();
      }
    });
  }

  const featuredMount = document.querySelector("[data-featured-books]");
  if (featuredMount) {
    const featuredBooks = catalogue.getFeaturedBooks();

    if (featuredBooks.length) {
      featuredMount.innerHTML = featuredBooks.map(featuredBookTemplate).join("");
      attachFallbacks(featuredMount);
    } else {
      featuredMount.innerHTML = "<p class=\"featured__noscript\">The featured shelf is being prepared.</p>";
    }
  }

  const collectionMount = document.querySelector("[data-collections]");
  if (collectionMount) {
    const collections = catalogue.collections || [];

    if (collections.length) {
      collectionMount.innerHTML = collections.map(collectionTemplate).join("");
    } else {
      collectionMount.innerHTML = "<p class=\"collections__noscript\">Collections are being prepared.</p>";
    }
  }
})();
