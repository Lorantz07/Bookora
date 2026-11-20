# Bookora

A quiet digital reading room for public-domain books. Bookora is an editorial, browser-only catalogue built with HTML5, CSS3, and vanilla JavaScript. Stage 2 opens the catalogue: fourteen editions, shareable search and filters, and a page for every book. No frameworks, build step, backend, accounts, or runtime APIs are used.

## Stage 2 status

Implemented:

- **Explore catalogue** with 14 public-domain editions across 8 subjects and 3 languages.
- **Search** across title, author, contributor, subject, and language, with a 260 ms debounce and URL state that can be shared or revisited.
- **URL-driven filters** for `q`, `category`, `language`, and `collection`. Single-select facets combine with each other, counts follow the current query, and filter links preserve the other active parameters.
- **Reading paths** — three curated collections whose catalogue order follows the path order.
- **Active filter chips**, clear-all controls, an empty state with useful next steps, and a notice when a shared link contains an unknown facet.
- **Edition pages** at `book-detail.html?book=id`, with cover, author and contributor credits, language, publication note, source link, rights note, provenance copy, and three related editions.
- **Honest reader placeholder** on each edition: the in-browser reader is labelled as Stage 3 work rather than presented as a working control.
- **Not-found fallback** for missing or invalid book references.
- **Responsive catalogue UI** from 320 px to 1440 px, including a collapsible filter disclosure below 960 px and stacked hero search between 960 and 1199 px.
- **Home page integration**: category links open filtered catalogue views, the featured shelf comes from the local catalogue, and collections show their real volume counts.
- **Stage-aware copy** on Home, About, Explore, edition pages, and the Reader shell. No popularity rankings, fabricated statistics, fake reading controls, or unimplemented claims are used.

Not part of Stage 2:

- The in-browser reader itself (planned for Stage 3).
- Full book texts, reading progress, bookmarks, typography controls, or local storage.
- Accounts, a backend, a database, or runtime APIs.
- A live contact channel.

## Catalogue behaviour

The URL is the source of truth:

```text
explore.html
explore.html?q=gatsby
explore.html?category=education&language=english
explore.html?collection=archipelago
book-detail.html?book=great-gatsby
```

- Search and filters are combined with AND.
- Each facet is single-select; choosing another value replaces the current one.
- Search input updates the URL with `replaceState` while typing, so the back button is not flooded with keystrokes.
- Filter, chip, and clear-all actions use `pushState`; browser back and forward restore the previous catalogue state.
- Unknown or incomplete book references render the “Edition not found” page instead of failing silently.
- Metadata, filter counts, collection membership, and related titles are all derived from `js/books.js`; nothing is hard-coded into the rendered rows.

## Preview locally

The site is static and has no dependencies or build command. Serve the project root so that fonts and relative asset paths behave consistently:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4173/>.

Any other static file server works. Opening `index.html` directly may work in some browsers, but a local server is recommended.

## Project structure

```text
Bookora/
├── index.html              Home page and shared shell
├── explore.html            Catalogue, search, filters, and results
├── about.html              About, sources, privacy, copyright
├── book-detail.html        Dynamic edition page
├── reader.html             Reader shell for Stage 3
├── favicon.svg
├── css/
│   ├── style.css           Tokens, reset, header, search, dialogs, footer
│   ├── home.css            Home sections, reader preview, responsive rules
│   └── catalogue.css       Explore, filters, edition page, responsive rules
├── js/
│   ├── app.js              Dialogs, scroll lock, focus restore, year
│   ├── books.js            Catalogue metadata, search, collections, related books
│   ├── home.js             Featured shelf and collection rendering
│   ├── explore.js          URL state, filter rendering, search, empty states
│   └── book-detail.js      Edition rendering, metadata, related shelf, fallback
├── assets/
│   ├── fonts/              Self-hosted Literata and DM Sans WOFF2 files
│   └── images/
│       ├── covers/         Fourteen original SVG book covers
│       ├── logo-mark.svg
│       └── paper-grain.svg
└── licenses/
    ├── OFL-Literata.txt
    ├── OFL-DM-Sans.txt
    └── Lucide-ISC.txt
```

## Catalogue and sources

All records live in `js/books.js`. Full texts are not bundled; each record points to a public-domain edition and its source page. Metadata and source links were checked against the source projects.

| Title | Author / credit | Source |
| --- | --- | --- |
| The Great Gatsby | F. Scott Fitzgerald | [Project Gutenberg #64317](https://www.gutenberg.org/ebooks/64317) |
| Habis Gelap Terbitlah Terang | R.A. Kartini; translated by Empat Saudara | [Indonesian Wikisource](https://id.wikisource.org/wiki/Habis_Gelap_Terbitlah_Terang) |
| Alice's Adventures in Wonderland | Lewis Carroll | [Project Gutenberg #11](https://www.gutenberg.org/ebooks/11) |
| The Adventures of Sherlock Holmes | Arthur Conan Doyle | [Project Gutenberg #1661](https://www.gutenberg.org/ebooks/1661) |
| Pride and Prejudice | Jane Austen | [Project Gutenberg #1342](https://www.gutenberg.org/ebooks/1342) |
| The Montessori Method | Maria Montessori; translated by Anne E. George | [Project Gutenberg #35619](https://www.gutenberg.org/ebooks/35619) |
| Meditations | Marcus Aurelius; translated by George Long | [Project Gutenberg #2680](https://www.gutenberg.org/ebooks/2680) |
| The Art of War | Sun Tzu; translated by Lionel Giles (1910) | [Project Gutenberg #132](https://www.gutenberg.org/ebooks/132) |
| On the Origin of Species | Charles Darwin | [Project Gutenberg #1228](https://www.gutenberg.org/ebooks/1228) |
| The Yellow Wallpaper | Charlotte Perkins Gilman | [Project Gutenberg #1952](https://www.gutenberg.org/ebooks/1952) |
| The Time Machine | H. G. Wells | [Project Gutenberg #35](https://www.gutenberg.org/ebooks/35) |
| The Chemical History of a Candle | Michael Faraday | [Project Gutenberg #14474](https://www.gutenberg.org/ebooks/14474) |
| The Education of Henry Adams | Henry Adams | [Project Gutenberg #2044](https://www.gutenberg.org/ebooks/2044) |
| Sejarah Melayu / Sulalatus Salatin | Attributed to Tun Sri Lanang; Or. 1703 manuscript | [Malay Wikisource](https://ms.wikisource.org/wiki/Sulalatus_Salatin_(Or._1703)) |

`The Great Gatsby` is recorded as public domain in the United States. Public-domain status can differ by jurisdiction; the source link and licence note are kept with each record.

Curated reading paths:

- **Small hours** — The Yellow Wallpaper, The Time Machine, The Adventures of Sherlock Holmes.
- **The archipelago** — Habis Gelap Terbitlah Terang, Sejarah Melayu.
- **The examined life** — Meditations, The Art of War.

The opening of *Alice's Adventures in Wonderland* is quoted in the Home page reading preview. All covers are original Bookora illustrations, not reproductions of publisher artwork.

## Design system

- **Type:** Literata for reading and display; DM Sans for labels, navigation, and interface text.
- **Palette:** ivory `#F5F2EA`, surface `#FFFEFA`, forest `#315846`, charcoal `#242923`, sage `#626A60`, border `#DDD8CD`, terracotta `#A4533B`.
- **Layout:** max-width containers, fluid gutters, editorial rules and labels, restrained radii, no decorative gradients, glass, or glow.
- **Catalogue layout:** a two-column filter rail and index list at 960 px and above; a single column with a native `<details>` filter disclosure below 960 px.
- **Responsive review widths:** 320, 390, 768, 960, 1024, 1100, 1280, and 1440 px.
- **Motion:** short opacity/transform transitions only; disabled under `prefers-reduced-motion`.

## Verification

Stage 2 was checked with a static audit and Chrome DevTools Protocol harnesses, with browser cache disabled and a fresh Chrome profile:

- **Static audit:** 495 checks covering local links, fragments, CSS and JavaScript assets, SVG sprite references, ARIA references, label targets, duplicate IDs, catalogue wiring, featured IDs, collection membership, and book-detail query targets. Result: 0 errors.
- **Interaction suite:** 87 checks across desktop and mobile — filter clicks, facet combination, active-filter badge labels, chip removal, search debounce, submit, clear-all, pending-search cancellation, browser back/forward, invalid facets, mobile disclosure, focus handling, scrolling, catalogue-to-detail navigation, related-card navigation, curated path order, and hostile/missing book IDs. Result: 0 failures.
- **Browser smoke test:** 14 URL states covering default, category, language, collection, search, combined filters, no results, conflicting facets, invalid facets, three edition pages, and two not-found cases. Result: 0 console errors, 0 failed requests, no horizontal overflow, and all covers loaded.
- **Responsive checks:** Explore at eight widths from 320 to 1440 px; edition pages at 320, 390, 768, and 1440 px; Home at 320, 390, 768, 1024, and 1440 px; About and Reader at 320 and 1440 px. Result: 0 horizontal overflow and no broken images.
- **Lazy-cover verification:** list and related covers were forced to load before checking, so unloaded lazy images were not misreported as broken.

These checks cover Chromium on the local Stage 2 build only. They are not a substitute for screen-reader testing on physical devices or cross-browser testing beyond Chromium.

## Attribution

- **Literata** — Copyright 2017 The Literata Project Authors. Licensed under the SIL Open Font License 1.1. See `licenses/OFL-Literata.txt`.
- **DM Sans** — Copyright 2014 The DM Sans Project Authors. Licensed under the SIL Open Font License 1.1. See `licenses/OFL-DM-Sans.txt`.
- **Lucide icons** — ISC License, Copyright (c) 2026 Lucide Icons and Contributors. The site inlines a small subset of Lucide-derived paths as an SVG sprite. See `licenses/Lucide-ISC.txt`.
- **Book covers** — Original illustrations created for Bookora.
- **Book texts** — Public-domain editions; source and credit links are recorded per book in `js/books.js` and summarised above.

## Contact

Bookora is in its second stage. No public contact channel is open yet; source and licensing notes are available on `about.html#sources`. The reading room is still in preparation and follows in Stage 3.
