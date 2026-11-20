/* ==========================================================================
   Bookora — Explore catalogue
   Reads and writes query state for search, subject, language, and collection.
   The URL is the source of truth, so filtered views can be shared or revisited.
   ========================================================================== */

(function () {
  "use strict";

  const catalogue = window.Bookora;

  if (!catalogue) {
    return;
  }

  const books = catalogue.books;
  const categories = catalogue.categories;
  const languages = catalogue.languages;
  const collections = catalogue.collections;

  const search = document.querySelector("[data-catalogue-search]");
  const searchInput = document.querySelector("#catalogue-search-input");
  const hiddenInputs = document.querySelector("[data-search-filter-inputs]");
  const list = document.querySelector("[data-book-list]");
  const empty = document.querySelector("[data-empty]");
  const count = document.querySelector("[data-result-count]");
  const activeFilters = document.querySelector("[data-active-filters]");
  const filterRail = document.querySelector("[data-filter-rail]");
  const activeCount = document.querySelector("[data-active-count]");
  const collectionNote = document.querySelector("[data-collection-note]");
  const notice = document.querySelector("[data-filter-notice]");
  const results = document.querySelector(".catalogue-results");
  const disclosure = document.querySelector("[data-filter-disclosure]");
  const staticClearLinks = Array.from(document.querySelectorAll("[data-clear-all]"));

  if (!search || !searchInput || !list || !empty || !count || !activeFilters || !filterRail) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 959px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const facets = ["category", "language", "collection"];
  let state = readState();
  let firstRender = true;
  let searchTimer = null;
  let forceSearchSync = false;

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function singular(countValue, singularWord, pluralWord) {
    return countValue + " " + (countValue === 1 ? singularWord : (pluralWord || singularWord + "s"));
  }

  function readState() {
    const params = new URLSearchParams(window.location.search);
    const next = {
      q: (params.get("q") || "").trim(),
      category: "",
      language: "",
      collection: "",
      ignored: []
    };

    facets.forEach(function (facet) {
      const raw = params.get(facet);
      if (!raw) {
        return;
      }

      const item = facet === "category"
        ? catalogue.getCategory(raw)
        : facet === "language"
          ? catalogue.getLanguage(raw)
          : catalogue.getCollection(raw);

      if (item) {
        next[facet] = item.id;
      } else {
        next.ignored.push(facet);
      }
    });

    return next;
  }

  function hasFilters(value) {
    return Boolean(value.q || value.category || value.language || value.collection);
  }

  function buildUrl(value, overrides) {
    const next = Object.assign({}, value, overrides || {});
    const params = new URLSearchParams();

    if (next.q) {
      params.set("q", next.q);
    }

    facets.forEach(function (facet) {
      if (next[facet]) {
        params.set(facet, next[facet]);
      }
    });

    const query = params.toString();
    return "explore.html" + (query ? "?" + query : "");
  }

  function categoryIdFor(book) {
    const category = catalogue.getCategoryForBook(book);
    return category ? category.id : "";
  }

  function languageIdFor(book) {
    const language = catalogue.getLanguageForBook(book);
    return language ? language.id : "";
  }

  function collectionIdsFor(book) {
    return catalogue.getCollectionsForBook(book).map(function (collection) {
      return collection.id;
    });
  }

  function facetValuesFor(book, facet) {
    if (facet === "category") {
      const id = categoryIdFor(book);
      return id ? [id] : [];
    }

    if (facet === "language") {
      const id = languageIdFor(book);
      return id ? [id] : [];
    }

    return collectionIdsFor(book);
  }

  function matchesFacets(book, value, skipFacet) {
    return facets.every(function (facet) {
      if (facet === skipFacet || !value[facet]) {
        return true;
      }

      return facetValuesFor(book, facet).indexOf(value[facet]) !== -1;
    });
  }

  function querySetFor(value) {
    return new Set(catalogue.searchBooks(value.q).map(function (book) {
      return book.id;
    }));
  }

  function filteredBooks(value, skipFacet, querySet) {
    return books.filter(function (book) {
      return querySet.has(book.id) && matchesFacets(book, value, skipFacet);
    });
  }

  function countFor(facet, id, value, querySet) {
    return filteredBooks(value, facet, querySet).filter(function (book) {
      return facetValuesFor(book, facet).indexOf(id) !== -1;
    }).length;
  }

  function optionTemplate(options) {
    const classes = ["filter-option"];

    if (options.active) {
      classes.push("is-active");
    }

    if (options.count === 0) {
      classes.push("is-empty");
    }

    return (
      '<li>' +
        '<a class="' + classes.join(" ") + '" href="' + escapeHTML(options.href) + '" ' +
          'data-filter="' + options.facet + '" data-value="' + escapeHTML(options.value) + '"' +
          (options.active ? ' aria-current="true"' : "") + '>' +
          '<span class="filter-option__label">' + escapeHTML(options.label) + '</span>' +
          '<span class="filter-option__count">' + options.count + '</span>' +
        '</a>' +
      '</li>'
    );
  }

  function groupTemplate(group) {
    return (
      '<div class="filter-group">' +
        '<div class="filter-group__head"><h3>' + escapeHTML(group.title) + '</h3></div>' +
        '<ul class="filter-list">' +
          optionTemplate({
            facet: group.facet,
            value: "",
            label: group.allLabel,
            href: buildUrl(state, { [group.facet]: "" }),
            active: !state[group.facet],
            count: group.total
          }) +
          group.items.map(function (item) {
            return optionTemplate({
              facet: group.facet,
              value: item.id,
              label: item.label,
              href: buildUrl(state, { [group.facet]: item.id }),
              active: state[group.facet] === item.id,
              count: item.count
            });
          }).join("") +
        '</ul>' +
      '</div>'
    );
  }

  function renderFilters(querySet) {
    const groups = [
      {
        facet: "category",
        title: "Subject",
        allLabel: "All subjects",
        total: filteredBooks(state, "category", querySet).length,
        items: categories.map(function (category) {
          return {
            id: category.id,
            label: category.name,
            count: countFor("category", category.id, state, querySet)
          };
        })
      },
      {
        facet: "language",
        title: "Language",
        allLabel: "All languages",
        total: filteredBooks(state, "language", querySet).length,
        items: languages.map(function (language) {
          return {
            id: language.id,
            label: language.name,
            count: countFor("language", language.id, state, querySet)
          };
        })
      },
      {
        facet: "collection",
        title: "Reading path",
        allLabel: "All reading paths",
        total: filteredBooks(state, "collection", querySet).length,
        items: collections.map(function (collection) {
          return {
            id: collection.id,
            label: collection.title,
            count: countFor("collection", collection.id, state, querySet)
          };
        })
      }
    ];

    filterRail.innerHTML = groups.map(groupTemplate).join("");

    const totalActive = [state.q, state.category, state.language, state.collection].filter(Boolean).length;
    activeCount.textContent = String(totalActive);
    activeCount.setAttribute("aria-label", totalActive === 1 ? "1 active filter" : totalActive + " active filters");
    activeCount.hidden = totalActive === 0;

    staticClearLinks.forEach(function (link) {
      link.hidden = !hasFilters(state);
    });
  }

  function chipTemplate(key, label, accessibleLabel) {
    return (
      '<a class="filter-chip" href="' + escapeHTML(buildUrl(state, { [key]: "" })) + '" ' +
        'data-remove-filter="' + key + '" ' +
        'aria-label="Remove filter: ' + escapeHTML(accessibleLabel) + '">' +
        '<span>' + escapeHTML(label) + '</span>' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>' +
      '</a>'
    );
  }

  function renderActiveFilters() {
    const chips = [];

    if (state.q) {
      chips.push(chipTemplate("q", "Search: “" + state.q + "”", "search for " + state.q));
    }

    if (state.category) {
      const category = catalogue.getCategory(state.category);
      chips.push(chipTemplate("category", "Subject: " + category.name, "subject " + category.name));
    }

    if (state.language) {
      const language = catalogue.getLanguage(state.language);
      chips.push(chipTemplate("language", "Language: " + language.name, "language " + language.name));
    }

    if (state.collection) {
      const collection = catalogue.getCollection(state.collection);
      chips.push(chipTemplate("collection", "Path: " + collection.title, "reading path " + collection.title));
    }

    activeFilters.innerHTML = chips.join("");
    activeFilters.hidden = chips.length === 0;
  }

  function renderCollectionNote() {
    if (!state.collection) {
      collectionNote.innerHTML = "";
      return;
    }

    const collection = catalogue.getCollection(state.collection);

    collectionNote.innerHTML =
      '<aside class="catalogue-collection catalogue-collection--' + escapeHTML(collection.tone) + '">' +
        '<div>' +
          '<p class="eyebrow">Reading path ' + escapeHTML(collection.index) + '</p>' +
          '<h2>' + escapeHTML(collection.title) + ' <em>' + escapeHTML(collection.accent) + '</em></h2>' +
          '<p>' + escapeHTML(collection.description) + '</p>' +
        '</div>' +
        '<a class="text-link" href="' + escapeHTML(buildUrl(state, { collection: "" })) + '" data-filter="collection" data-value="">' +
          'All editions' +
          '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
        '</a>' +
      '</aside>';
  }

  function rowTemplate(book, index) {
    const category = catalogue.getCategoryForBook(book);
    const categoryName = category ? category.name : book.category;
    const number = String(index + 1).padStart(2, "0");

    return (
      '<li class="catalogue-item">' +
        '<article class="catalogue-item__inner">' +
          '<span class="catalogue-item__index" aria-hidden="true">' + number + '</span>' +
          '<span class="catalogue-item__cover" data-cover>' +
            '<span class="catalogue-item__fallback" aria-hidden="true">' +
              '<span>' + escapeHTML(book.title) + '</span>' +
              '<span>' + escapeHTML(book.author) + '</span>' +
            '</span>' +
            '<img src="' + escapeHTML(book.cover) + '" width="600" height="900" alt="" ' +
              (index < 3 ? 'loading="eager"' : 'loading="lazy"') + ' decoding="async">' +
          '</span>' +
          '<div class="catalogue-item__body">' +
            '<p class="catalogue-item__kicker">' + escapeHTML(book.language) + ' · ' + escapeHTML(categoryName) + '</p>' +
            '<h3 class="catalogue-item__title"><a href="' + escapeHTML(catalogue.bookUrl(book)) + '">' + escapeHTML(book.title) + '</a></h3>' +
            '<p class="catalogue-item__author">' + escapeHTML(book.author) + '</p>' +
            '<p class="catalogue-item__description">' + escapeHTML(book.description) + '</p>' +
          '</div>' +
          '<p class="catalogue-item__meta">' +
            '<span>' + escapeHTML(book.published) + '</span>' +
            '<span>' + escapeHTML(book.source) + '</span>' +
          '</p>' +
          '<span class="catalogue-item__arrow" aria-hidden="true">' +
            '<svg class="icon"><use href="#icon-arrow-up-right"></use></svg>' +
          '</span>' +
        '</article>' +
      '</li>'
    );
  }

  function attachCoverFallbacks(container) {
    container.querySelectorAll("[data-cover]").forEach(function (cover) {
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

  function emptySuggestions() {
    const suggestions = categories.filter(function (category) {
      return books.some(function (book) {
        return categoryIdFor(book) === category.id;
      });
    }).slice(0, 4);

    return suggestions.map(function (category) {
      return '<a class="filter-chip" href="' + escapeHTML(buildUrl(state, { q: "", category: category.id, language: "", collection: "" })) + '">' + escapeHTML(category.name) + '</a>';
    }).join("");
  }

  function renderEmpty() {
    if (!hasFilters(state)) {
      empty.innerHTML =
        '<div class="catalogue-empty__mark" aria-hidden="true">' +
          '<svg class="icon"><use href="#icon-book-open"></use></svg>' +
        '</div>' +
        '<p class="eyebrow">The shelf is quiet</p>' +
        '<h2>The catalogue is being prepared.</h2>' +
        '<p>No editions are listed yet. Return to the Home page to see what is on the reading table.</p>' +
        '<div class="catalogue-empty__actions">' +
          '<a class="button button--primary" href="index.html">Return home' +
            '<svg class="icon icon--forward" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
          '</a>' +
        '</div>';
      return;
    }

    const queryLine = state.q ? " for “" + escapeHTML(state.q) + "”" : "";

    empty.innerHTML =
      '<div class="catalogue-empty__mark" aria-hidden="true">' +
        '<svg class="icon"><use href="#icon-book-open"></use></svg>' +
      '</div>' +
      '<p class="eyebrow">Nothing on this shelf</p>' +
      '<h2>No editions match' + queryLine + '.</h2>' +
      '<p>Try a shorter search, check the spelling, or clear a filter. The whole catalogue is only a click away.</p>' +
      '<div class="catalogue-empty__actions">' +
        '<a class="button button--primary" href="explore.html" data-clear-all>Clear all filters' +
          '<svg class="icon icon--forward" aria-hidden="true"><use href="#icon-rotate-ccw"></use></svg>' +
        '</a>' +
        '<a class="text-link" href="' + escapeHTML(buildUrl(state, { q: "" })) + '" data-filter="q" data-value="">' +
          'Keep the filters, clear the search' +
          '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>' +
        '</a>' +
      '</div>' +
      '<div class="catalogue-empty__suggestions">' +
        '<span>Try a shelf:</span>' + emptySuggestions() +
      '</div>';
  }

  function orderForPath(matches) {
    if (!state.collection) {
      return matches;
    }

    const path = catalogue.getCollection(state.collection);
    const order = path ? path.bookIds : [];

    return matches.slice().sort(function (a, b) {
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
  }

  function renderResults(querySet) {
    const matches = orderForPath(filteredBooks(state, null, querySet));
    const filtered = hasFilters(state);

    if (!matches.length) {
      count.textContent = filtered ? "No editions match" : "No editions in the catalogue";
    } else if (filtered) {
      count.textContent = matches.length + " of " + singular(books.length, "edition");
    } else {
      count.textContent = singular(matches.length, "edition") + " in the catalogue";
    }

    list.innerHTML = matches.map(rowTemplate).join("");
    list.hidden = matches.length === 0;
    empty.hidden = matches.length !== 0;

    if (matches.length) {
      empty.innerHTML = "";
      attachCoverFallbacks(list);
    } else {
      renderEmpty();
    }
  }

  function renderNotice() {
    if (!state.ignored.length) {
      notice.hidden = true;
      notice.innerHTML = "";
      return;
    }

    const labels = state.ignored.map(function (facet) {
      return facet === "collection" ? "reading path" : facet;
    });
    const uniqueLabels = labels.filter(function (label, index) {
      return labels.indexOf(label) === index;
    });
    const message = uniqueLabels.length === 1
      ? "The " + uniqueLabels[0] + " filter in this link is not available, so it has been left out."
      : "Some filters in this link are not available, so they have been left out.";

    notice.hidden = false;
    notice.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#icon-filter"></use></svg>' +
      '<p>' + escapeHTML(message) + '</p>' +
      '<a href="' + escapeHTML(buildUrl(state)) + '" data-resolve-filters>Use the current filters</a>';
  }

  function renderFacts() {
    const editionFact = document.querySelector("[data-fact-editions]");
    const languageFact = document.querySelector("[data-fact-languages]");
    const collectionFact = document.querySelector("[data-fact-collections]");
    const categoryFact = document.querySelector("[data-fact-categories]");

    if (editionFact) {
      editionFact.textContent = String(books.length);
    }

    if (languageFact) {
      languageFact.textContent = String(languages.length);
    }

    if (collectionFact) {
      collectionFact.textContent = String(collections.length);
    }

    if (categoryFact) {
      categoryFact.textContent = String(categories.length);
    }
  }

  function updateHiddenInputs() {
    if (!hiddenInputs) {
      return;
    }

    hiddenInputs.innerHTML = facets.filter(function (facet) {
      return Boolean(state[facet]);
    }).map(function (facet) {
      return '<input type="hidden" name="' + facet + '" value="' + escapeHTML(state[facet]) + '">';
    }).join("");
  }

  function updateTitle() {
    const parts = [];

    if (state.collection) {
      parts.push(catalogue.getCollection(state.collection).title);
    }

    if (state.category) {
      parts.push(catalogue.getCategory(state.category).name);
    }

    if (state.language) {
      parts.push(catalogue.getLanguage(state.language).name);
    }

    if (state.q) {
      parts.push("Search “" + state.q + "”");
    }

    document.title = parts.length ? parts.join(" · ") + " — Bookora" : "Explore — Bookora";
  }

  function syncSearchInput() {
    if ((forceSearchSync || document.activeElement !== searchInput) && searchInput.value !== state.q) {
      searchInput.value = state.q;
    }

    forceSearchSync = false;
  }

  function openDisclosureForDeepLink() {
    if (firstRender && disclosure) {
      disclosure.open = !(mobileQuery.matches && !hasFilters(state));
    }

    firstRender = false;
  }

  function focusAfterChange(key) {
    window.requestAnimationFrame(function () {
      if (mobileQuery.matches) {
        if (disclosure) {
          disclosure.open = false;
        }

        count.focus({ preventScroll: true });

        if (results) {
          results.scrollIntoView({
            behavior: reduceMotion.matches ? "auto" : "smooth",
            block: "start"
          });
        }

        return;
      }

      if (key && key !== "q") {
        const option = document.querySelector('[data-filter="' + key + '"][data-value=""]');
        if (option) {
          option.focus({ preventScroll: true });
          return;
        }
      }

      searchInput.focus({ preventScroll: true });
    });
  }

  function render(options) {
    const settings = options || {};
    state = readState();

    const querySet = querySetFor(state);
    renderFilters(querySet);
    renderNotice();
    renderActiveFilters();
    renderCollectionNote();
    renderResults(querySet);
    renderFacts();
    updateHiddenInputs();
    updateTitle();
    syncSearchInput();
    openDisclosureForDeepLink();

    if (settings.focusKey !== undefined) {
      focusAfterChange(settings.focusKey);
    }
  }

  function cancelSearchTimer() {
    if (searchTimer) {
      window.clearTimeout(searchTimer);
      searchTimer = null;
    }
  }

  function navigate(overrides, focusKey) {
    const next = Object.assign({}, state, overrides);
    cancelSearchTimer();
    forceSearchSync = true;
    window.history.pushState({}, "", buildUrl(next));
    render({ focusKey: focusKey });
  }

  function clearAll() {
    cancelSearchTimer();
    forceSearchSync = true;
    window.history.pushState({}, "", "explore.html");
    render({ focusKey: "" });
  }

  search.addEventListener("submit", function (event) {
    event.preventDefault();
    cancelSearchTimer();
    navigate({ q: searchInput.value.trim() });
  });

  searchInput.addEventListener("input", function () {
    if (searchTimer) {
      window.clearTimeout(searchTimer);
    }

    const value = searchInput.value.trim();

    if (value === state.q) {
      return;
    }

    searchTimer = window.setTimeout(function () {
      const next = Object.assign({}, state, { q: value });
      window.history.replaceState({}, "", buildUrl(next));
      render();
    }, 260);
  });

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const clearLink = event.target.closest("[data-clear-all]");
    if (clearLink) {
      event.preventDefault();
      clearAll();
      return;
    }

    const resolveLink = event.target.closest("[data-resolve-filters]");
    if (resolveLink) {
      event.preventDefault();
      window.history.replaceState({}, "", buildUrl(state));
      render({ focusKey: "" });
      return;
    }

    const removeLink = event.target.closest("[data-remove-filter]");
    if (removeLink) {
      event.preventDefault();
      const key = removeLink.dataset.removeFilter;
      navigate({ [key]: "" }, key);
      return;
    }

    const filterLink = event.target.closest("[data-filter]");
    if (filterLink) {
      event.preventDefault();
      const key = filterLink.dataset.filter;
      const value = filterLink.dataset.value || "";
      navigate({ [key]: value }, key);
    }
  });

  window.addEventListener("popstate", function () {
    cancelSearchTimer();
    forceSearchSync = true;
    render();
  });

  render();
})();
