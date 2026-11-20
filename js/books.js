/* ==========================================================================
   Bookora — local sample catalogue
   Stage 1 uses local metadata only. The records refer to verified public-
   domain editions and will be extended by the API layer in a later stage.
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

  function findBook(id) {
    return books.find(function (book) {
      return book.id === id;
    });
  }

  function getFeaturedBooks() {
    return featuredBookIds.map(findBook).filter(Boolean);
  }

  function getCollectionBooks(collection) {
    return collection.bookIds.map(findBook).filter(Boolean);
  }

  window.Bookora = Object.assign(window.Bookora || {}, {
    books: books,
    collections: collections,
    featuredBookIds: featuredBookIds,
    getBook: findBook,
    getFeaturedBooks: getFeaturedBooks,
    getCollectionBooks: getCollectionBooks
  });
})();
