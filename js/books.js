/* ==========================================================================
   Bookora — local sample catalogue
   Stage 2 keeps every record local. The books below point to verified public-
   domain editions; metadata, search, and related-book notes are derived here.
   ========================================================================== */

(function () {
  "use strict";

  const books = [
    {
      id: "great-gatsby",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      language: "English",
      category: "Fiction",
      published: "1925",
      cover: "assets/images/covers/great-gatsby.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/64317",
      license: "Public domain in the United States",
      description: "A mysterious millionaire, a green light across the bay, and a summer that refuses to stay in the past."
    },
    {
      id: "habis-gelap",
      title: "Habis Gelap Terbitlah Terang",
      author: "R.A. Kartini",
      contributor: "Translated by Empat Saudara",
      language: "Indonesian",
      category: "Biography",
      published: "1922",
      cover: "assets/images/covers/habis-gelap.svg",
      source: "Wikisource",
      sourceUrl: "https://id.wikisource.org/wiki/Habis_Gelap_Terbitlah_Terang",
      license: "Public-domain text; transcription by Wikisource",
      description: "Kartini's letters on education, freedom, and the inner life of a young woman in colonial Java."
    },
    {
      id: "alice-wonderland",
      title: "Alice's Adventures in Wonderland",
      author: "Lewis Carroll",
      language: "English",
      category: "Fiction",
      published: "1865",
      cover: "assets/images/covers/alice-wonderland.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/11",
      license: "Public domain",
      description: "A restless afternoon, a waistcoat-wearing rabbit, and a world where nothing behaves as it should."
    },
    {
      id: "sherlock-holmes",
      title: "The Adventures of Sherlock Holmes",
      author: "Arthur Conan Doyle",
      language: "English",
      category: "Short Stories",
      published: "1892",
      cover: "assets/images/covers/sherlock-holmes.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/1661",
      license: "Public domain",
      description: "Twelve cases, one unmistakable mind, and the fog-bound streets of Victorian London."
    },
    {
      id: "pride-prejudice",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      language: "English",
      category: "Literature",
      published: "1813",
      cover: "assets/images/covers/pride-prejudice.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/1342",
      license: "Public domain",
      description: "Wit, pride, and the slow education of two very stubborn hearts."
    },
    {
      id: "montessori-method",
      title: "The Montessori Method",
      author: "Maria Montessori",
      contributor: "Translated by Anne E. George",
      language: "English",
      category: "Education",
      published: "1912 translation",
      cover: "assets/images/covers/montessori-method.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/35619",
      license: "Public domain",
      description: "A practical account of the child as an active learner, written from close observation of the classroom."
    },
    {
      id: "meditations",
      title: "Meditations",
      author: "Marcus Aurelius",
      contributor: "Translated by George Long",
      language: "English",
      category: "Others",
      published: "1862 edition",
      cover: "assets/images/covers/meditations.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/2680",
      license: "Public domain",
      description: "Private notes on duty, mortality, and the quiet work of remaining steady."
    },
    {
      id: "art-of-war",
      title: "The Art of War",
      author: "Sun Tzu",
      contributor: "Translated by Lionel Giles",
      language: "English",
      category: "History",
      published: "1910 translation",
      cover: "assets/images/covers/art-of-war.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/132",
      license: "Public domain",
      description: "A compact classic on strategy, restraint, and knowing the ground beneath your feet."
    },
    {
      id: "origin-species",
      title: "On the Origin of Species",
      author: "Charles Darwin",
      language: "English",
      category: "Science",
      published: "1859",
      cover: "assets/images/covers/origin-species.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/1228",
      license: "Public domain",
      description: "Darwin's argument for natural selection, built from patient observation and written for the general reader."
    },
    {
      id: "yellow-wallpaper",
      title: "The Yellow Wallpaper",
      author: "Charlotte Perkins Gilman",
      language: "English",
      category: "Short Stories",
      published: "1892",
      cover: "assets/images/covers/yellow-wallpaper.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/1952",
      license: "Public domain",
      description: "A woman, a room, and a pattern that will not sit still. A landmark of short fiction."
    },
    {
      id: "time-machine",
      title: "The Time Machine",
      author: "H. G. Wells",
      language: "English",
      category: "Fiction",
      published: "1895",
      cover: "assets/images/covers/time-machine.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/35",
      license: "Public domain",
      description: "A Victorian inventor travels to the year 802,701 and finds a future stranger than any machine."
    },
    {
      id: "chemical-history-candle",
      title: "The Chemical History of a Candle",
      author: "Michael Faraday",
      language: "English",
      category: "Science",
      published: "1861",
      cover: "assets/images/covers/chemical-history-candle.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/14474",
      license: "Public domain",
      description: "Six lectures that turn a burning candle into a lesson on combustion, air, and the habits of careful observation."
    },
    {
      id: "education-henry-adams",
      title: "The Education of Henry Adams",
      author: "Henry Adams",
      language: "English",
      category: "Education",
      published: "1918 edition",
      cover: "assets/images/covers/education-henry-adams.svg",
      source: "Project Gutenberg",
      sourceUrl: "https://www.gutenberg.org/ebooks/2044",
      license: "Public domain",
      description: "An autobiography that treats education as a lifelong, unsettled question rather than a finished curriculum."
    },
    {
      id: "sejarah-melayu",
      title: "Sejarah Melayu",
      author: "Tun Sri Lanang (attributed)",
      language: "Malay",
      category: "History",
      published: "Or. 1703 manuscript",
      cover: "assets/images/covers/sejarah-melayu.svg",
      source: "Malay Wikisource",
      sourceUrl: "https://ms.wikisource.org/wiki/Sulalatus_Salatin_(Or._1703)",
      license: "Public-domain manuscript; transcription by Malay Wikisource",
      description: "A foundational Malay chronicle of rulers, voyages, and the world around the Strait."
    }
  ];

  const categories = [
    {
      id: "fiction",
      name: "Fiction",
      description: "Novels and imagined lives."
    },
    {
      id: "education",
      name: "Education",
      description: "Learning, teaching, and the examined mind."
    },
    {
      id: "history",
      name: "History",
      description: "Chronicles, conflicts, and turning points."
    },
    {
      id: "science",
      name: "Science",
      description: "The natural world, carefully observed."
    },
    {
      id: "biography",
      name: "Biography",
      description: "Lives told through letters and memory."
    },
    {
      id: "literature",
      name: "Literature",
      description: "Lasting prose, poetry, and essays."
    },
    {
      id: "short-stories",
      name: "Short Stories",
      description: "Whole worlds in a few pages."
    },
    {
      id: "others",
      name: "Others",
      description: "Philosophy, reference, and everything between."
    }
  ];

  const languages = [
    { id: "english", name: "English" },
    { id: "indonesian", name: "Indonesian" },
    { id: "malay", name: "Malay" }
  ];

  const featuredBookIds = [
    "great-gatsby",
    "habis-gelap",
    "alice-wonderland",
    "sherlock-holmes",
    "pride-prejudice"
  ];

  const collections = [
    {
      id: "small-hours",
      index: "01",
      title: "Small hours",
      accent: "single sittings.",
      description: "Short stories and compact classics for the space between one thing and the next.",
      bookIds: ["yellow-wallpaper", "time-machine", "sherlock-holmes"],
      tone: "sage"
    },
    {
      id: "archipelago",
      index: "02",
      title: "The archipelago",
      accent: "in print.",
      description: "Letters and chronicles from the Indonesian and Malay world, preserved in the public domain.",
      bookIds: ["habis-gelap", "sejarah-melayu"],
      tone: "clay"
    },
    {
      id: "examined-life",
      index: "03",
      title: "The examined life",
      accent: "old questions, still useful.",
      description: "On discipline, mortality, and the work of living deliberately.",
      bookIds: ["meditations", "art-of-war"],
      tone: "sand"
    }
  ];

  function normalize(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function findBook(id) {
    return books.find(function (book) {
      return book.id === id;
    });
  }

  function findCategory(value) {
    const needle = normalize(value);
    return categories.find(function (category) {
      return category.id === value || category.id === needle || normalize(category.name) === needle;
    });
  }

  function findLanguage(value) {
    const needle = normalize(value);
    return languages.find(function (language) {
      return language.id === value || language.id === needle || normalize(language.name) === needle;
    });
  }

  function findCollection(value) {
    const needle = normalize(value);
    return collections.find(function (collection) {
      return collection.id === value || collection.id === needle || normalize(collection.title) === needle;
    });
  }

  function getCategoryForBook(book) {
    return book ? findCategory(book.category) : undefined;
  }

  function getLanguageForBook(book) {
    return book ? findLanguage(book.language) : undefined;
  }

  function getFeaturedBooks() {
    return featuredBookIds.map(findBook).filter(Boolean);
  }

  function getCollectionBooks(collection) {
    return collection.bookIds.map(findBook).filter(Boolean);
  }

  function getCollectionsForBook(book) {
    if (!book) {
      return [];
    }

    return collections.filter(function (collection) {
      return collection.bookIds.indexOf(book.id) !== -1;
    });
  }

  function searchableText(book) {
    return normalize([book.title, book.author, book.contributor, book.category, book.language].join(" "));
  }

  function searchBooks(query) {
    const tokens = normalize(query).split(" ").filter(Boolean);

    if (!tokens.length) {
      return books.slice();
    }

    return books.filter(function (book) {
      const haystack = searchableText(book);
      return tokens.every(function (token) {
        return haystack.indexOf(token) !== -1;
      });
    });
  }

  function getRelatedBooks(book, limit) {
    if (!book) {
      return [];
    }

    const bookCollections = getCollectionsForBook(book).map(function (collection) {
      return collection.id;
    });

    const scored = books
      .filter(function (candidate) {
        return candidate.id !== book.id;
      })
      .map(function (candidate, index) {
        let score = 0;

        if (candidate.category === book.category) {
          score += 4;
        }

        if (candidate.language === book.language) {
          score += 2;
        }

        getCollectionsForBook(candidate).forEach(function (collection) {
          if (bookCollections.indexOf(collection.id) !== -1) {
            score += 3;
          }
        });

        return { book: candidate, score: score, index: index };
      });

    scored.sort(function (a, b) {
      return b.score - a.score || a.index - b.index;
    });

    return scored.slice(0, limit || 3).map(function (entry) {
      return entry.book;
    });
  }

  function bookUrl(book) {
    return "book-detail.html?book=" + encodeURIComponent(book.id);
  }

  window.Bookora = Object.assign(window.Bookora || {}, {
    books: books,
    categories: categories,
    languages: languages,
    collections: collections,
    featuredBookIds: featuredBookIds,
    normalize: normalize,
    getBook: findBook,
    getCategory: findCategory,
    getLanguage: findLanguage,
    getCollection: findCollection,
    getCategoryForBook: getCategoryForBook,
    getLanguageForBook: getLanguageForBook,
    getFeaturedBooks: getFeaturedBooks,
    getCollectionBooks: getCollectionBooks,
    getCollectionsForBook: getCollectionsForBook,
    getRelatedBooks: getRelatedBooks,
    searchBooks: searchBooks,
    bookUrl: bookUrl
  });
})();
