# Bookora

A quiet digital reading room for public-domain books. Bookora is an editorial, browser-only catalogue built with HTML5, CSS3, and vanilla JavaScript. Stage 3 opens the catalogue and adds a measured in-browser reader for three complete public-domain texts. No frameworks, build step, backend, accounts, or runtime APIs are used.

## Stage 3 status

Implemented:

- **Live in-browser reader** at `reader.html?book=id`, linked from edition pages and the Home reading preview.
- **Three complete bundled texts:**
  - *Alice's Adventures in Wonderland* — Lewis Carroll — 12 chapters, 26,268 words.
  - *The Yellow Wallpaper* — Charlotte Perkins Gilman — one short story, 6,078 words.
  - *The Time Machine* — H. G. Wells — 17 sections (including the Epilogue), 32,310 words.
- **Measured two-page spread** on viewports ≥900 ×700 px; a single page below that. Pages are measured from the actual visible page box after fonts load, so chapters start on new pages and type changes repaginate without losing your place.
- **Chapter navigation:** Contents dialog with chapter jumps, page numbers, current-chapter highlighting, and a remembered reading place.
- **Controls:** Keyboard arrows/space, page turns, tap and swipe, Contents, Display settings, Home/End.
- **Display settings:** type size and line height only, stored in `localStorage` with no account.
- **Progress:** Your place is restored on revisit, stored per book in `localStorage`; `?start=1` opens a book at its beginning.
- **Catalogue cards:** Edition pages for the three reader books show live reader status (Available, In progress, Finished) with percentage and progress, plus links into the reader.
- **Responsive reader chrome** from 320 px to 1440 px with no horizontal overflow.

Not part of Stage 3:

- The other eleven catalogue editions do not have reader texts yet; they remain catalogue-only with their source and rights records.
- Accounts, a backend, a database, runtime APIs, or a live contact channel.
- Printed or PDF export.

## Catalogue behaviour

The URL is the source of truth:

```text
index.html
index.html#reading-experience
explore.html
explore.html?q=gatsby
explore.html?category=education&language=english
explore.html?collection=archipelago
book-detail.html?book=alice-wonderland
reader.html?book=alice-wonderland
```

- Search and filters are combined with AND.
- Each facet is single-select; choosing another value replaces the current one.
- Search input updates the URL with `replaceState` while typing, so the back button is not flooded with keystrokes.
- Filter, chip, and clear-all actions use `pushState`; browser back and forward restore the previous catalogue state.
- Unknown or incomplete book references render the “Edition not found” page instead of failing silently.
- Reader-unavailable books show an honest “Not in the reader yet” card on their edition page, not a fake control.
- Metadata, filter counts, collection membership, and related titles are all derived from `js/books.js`; nothing is hard-coded into the rendered rows.

## Reader details

The reader stores:

- Progress at `localStorage["bookora.reader.progress.v1.<bookId>"]`, with the last chapter, block, unit, page, and percent.
- Display preferences at `localStorage["bookora.reader.prefs.v1"]`, with type size index 0–3 and line-height index 0–2.

Texts are bundled as local JSON files and fetched locally on first open. The reader never calls Project Gutenberg, Wikisource, or another network source at runtime.

Supported book IDs in the reader:

```text
alice-wonderland
yellow-wallpaper
time-machine
```

Edition URLs use the catalogue IDs. Reader URLs use the same IDs:

```text
reader.html?book=alice-wonderland
reader.html?book=yellow-wallpaper
reader.html?book=time-machine
```

`?start=1` opens a book from its first page. `Bookora.hasReaderText(book)`, `Bookora.getReadableBooks()`, and `Bookora.readerUrl(book)` expose the reader metadata to the catalogue pages.

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
├── reader.html             Stage 3 reader shell
├── favicon.svg
├── css/
│   ├── style.css           Tokens, reset, header, search, dialogs, footer
│   ├── home.css            Home sections, reader preview, responsive rules
│   ├── catalogue.css       Explore, filters, edition page, reader cards, responsive rules
│   └── reader.css          Reader chrome, leaves, dialogs, display settings
├── js/
│   ├── app.js              Dialogs, scroll lock, focus restore, year
│   ├── books.js            Catalogue metadata, reader helpers, search, collections, related books
│   ├── home.js             Featured shelf and collection rendering
│   ├── explore.js          URL state, filter rendering, search, empty states
│   ├── book-detail.js      Edition rendering, reader card, metadata, related shelf
│   ├── reader-store.js     Reader progress and display-preference storage
│   └── reader.js           In-browser reader engine and pagination
├── assets/
│   ├── texts/              Bundled public-domain reader texts
│   │   ├── alice-wonderland.json
│   │   ├── the-time-machine.json
│   │   └── the-yellow-wallpaper.json
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

Reader-enabled records live in `js/books.js`; the `reader` block includes the local text file, word count, chapter/section count, unit label, and source-edition edition line. Full texts for the other catalogue records remain with their public-domain source archives.

| Title | Author / credit | Source | Reader |
| --- | --- | --- | --- |
| The Great Gatsby | F. Scott Fitzgerald | [Project Gutenberg #64317](https://www.gutenberg.org/ebooks/64317) | — |
| Habis Gelap Terbitlah Terang | R.A. Kartini; translated by Empat Saudara | [Indonesian Wikisource](https://id.wikisource.org/wiki/Habis_Gelap_Terbitlah_Terang) | — |
| Alice's Adventures in Wonderland | Lewis Carroll | [Project Gutenberg #11](https://www.gutenberg.org/ebooks/11) | Yes |
| The Adventures of Sherlock Holmes | Arthur Conan Doyle | [Project Gutenberg #1661](https://www.gutenberg.org/ebooks/1661) | — |
| Pride and Prejudice | Jane Austen | [Project Gutenberg #1342](https://www.gutenberg.org/ebooks/1342) | — |
| The Montessori Method | Maria Montessori; translated by Anne E. George | [Project Gutenberg #35619](https://www.gutenberg.org/ebooks/35619) | — |
| Meditations | Marcus Aurelius; translated by George Long | [Project Gutenberg #2680](https://www.gutenberg.org/ebooks/2680) | — |
| The Art of War | Sun Tzu; translated by Lionel Giles (1910) | [Project Gutenberg #132](https://www.gutenberg.org/ebooks/132) | — |
| On the Origin of Species | Charles Darwin | [Project Gutenberg #1228](https://www.gutenberg.org/ebooks/1228) | — |
| The Yellow Wallpaper | Charlotte Perkins Gilman | [Project Gutenberg #1952](https://www.gutenberg.org/ebooks/1952) | Yes |
| The Time Machine | H. G. Wells | [Project Gutenberg #35](https://www.gutenberg.org/ebooks/35) | Yes |
| The Chemical History of a Candle | Michael Faraday | [Project Gutenberg #14474](https://www.gutenberg.org/ebooks/14474) | — |
| The Education of Henry Adams | Henry Adams | [Project Gutenberg #2044](https://www.gutenberg.org/ebooks/2044) | — |
| Sejarah Melayu / Sulalatus Salatin | Attributed to Tun Sri Lanang; Or. 1703 manuscript | [Malay Wikisource](https://ms.wikisource.org/wiki/Sulalatus_Salatin_(Or._1703)) | — |

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
- **Reader:** compact chrome, two-page spread at wide viewports, measured leaves, native dialogs, and display settings kept on the device.
- **Responsive review widths:** 320, 390, 768, 960, 1024, 1100, 1280, and 1440 px.
- **Motion:** short opacity/transform transitions only; disabled under `prefers-reduced-motion`.

## Verification

Stage 3 was checked with Chrome DevTools Protocol harnesses and Playwright-free browser tests:

- **Static audit:** local links, fragments, CSS and JavaScript assets, SVG sprite references, ARIA references, label targets, duplicate IDs, catalogue wiring, featured IDs, collection membership, and book-detail query targets.
- **Reader smoke:** all three reader books at 320, 390, 768, 1024, 1280×640, 1440×900, and 1280; unavailable and missing book states; edition cards; Home; About; and Explore. Browser cache disabled and a fresh Chrome profile. Result: 0 console errors, 0 failed requests, no horizontal overflow, no clipped leaves, and 0 broken images.
- **Interaction suite:** 46 checks across desktop and mobile — page turning, keyboard navigation, swipe, progress restore on reload, Contents dialog focus/lock/current state, Display settings and reset, typography repagination with the reader anchored, single-layout at 800×900, opening closing times, text integrity at Alice’s opening and closing, Wallpaper word count, and Time Machine sections. Result: 0 failures.
- **Text integrity:** the complete Alice opening and closing lines, Wallpaper length, and Time Machine section/Epilogue records were checked against the bundled JSON and rendered pages.
- **Responsive:** Reader at 320, 390, 768, 800×900, 1024, and 1440 px; edition pages at 1440 px; Home, About, and Explore at multiple widths. Result: 0 horizontal overflow and no broken images.

These checks cover Chromium on the local Stage 3 build only. They are not a substitute for screen-reader testing on physical devices or cross-browser testing beyond Chromium.

## Attribution

- **Literata** — Copyright 2017 The Literata Project Authors. Licensed under the SIL Open Font License 1.1. See `licenses/OFL-Literata.txt`.
- **DM Sans** — Copyright 2014 The DM Sans Project Authors. Licensed under the SIL Open Font License 1.1. See `licenses/OFL-DM-Sans.txt`.
- **Lucide icons** — ISC License, Copyright (c) 2026 Lucide Icons and Contributors. The site inlines a small subset of Lucide-derived paths as an SVG sprite. See `licenses/Lucide-ISC.txt`.
- **Book covers** — Original illustrations created for Bookora.
- **Book texts** — Public-domain editions; source and credit links are recorded per book in `js/books.js` and summarised above.

## Contact

Bookora is in its third stage. No public contact channel is open; source and licensing notes are available on `about.html#sources`.
