# Bookora

A quiet digital reading room for public-domain books. Bookora is an editorial, browser-only catalogue built with HTML5, CSS3, and vanilla JavaScript. Stage 5a expands the measured in-browser reader with three further public-domain texts, and the reader now opens its first page before the rest of the book finishes loading. No frameworks, build step, backend, accounts, or runtime APIs are used.

## Stage 5a status

Implemented:

- **Live in-browser reader** at `reader.html?book=id`, linked from edition pages and the Home reading preview.
- **Twelve complete bundled texts:**
  - *Alice's Adventures in Wonderland* — Lewis Carroll — 12 chapters, 26,268 words.
  - *The Yellow Wallpaper* — Charlotte Perkins Gilman — one short story, 6,078 words.
  - *The Time Machine* — H. G. Wells — 17 sections (including the Epilogue), 32,310 words.
  - *The Great Gatsby* — F. Scott Fitzgerald — 9 chapters, 48,118 words.
  - *The Adventures of Sherlock Holmes* — Arthur Conan Doyle — 12 stories, 104,346 words.
  - *The Montessori Method* — Maria Montessori — 23 sections (introduction and 22 chapters), 115,126 words.
  - *Pride and Prejudice* — Jane Austen — 61 chapters, 121,571 words.
  - *Meditations* — Marcus Aurelius — 12 books, 57,307 words.
  - *The Art of War* — Sun Tzu — 14 sections (introduction and 13 chapters), 53,069 words.
  - *On the Origin of Species* — Charles Darwin — 15 sections (introduction and 14 chapters), 148,760 words.
  - *The Chemical History of a Candle* — Michael Faraday; edited by William Crookes — 8 sections (preface, six lectures, and lecture on platinum), 40,126 words.
  - *The Education of Henry Adams* — Henry Adams — 37 sections (two prefaces and 35 chapters), 175,606 words.
- **Progressive opening:** each book paints its first page from a small first-section file (2–75 KB) while the full text downloads and measures in the background. The opening page is readable at once; page turning and the Contents unlock when the complete pagination is ready.
- **Measured two-page spread** on viewports ≥900 ×700 px; a single page below that. Pages are measured from the actual visible page box after fonts load, so chapters start on new pages and type changes repaginate without losing your place.
- **Chapter navigation:** Contents dialog with chapter jumps, page numbers, current-chapter highlighting, and a remembered reading place.
- **Controls:** Keyboard arrows/space, page turns, tap and swipe, Contents, Display settings, Home/End.
- **Display settings:** type size and line height only, stored in `localStorage` with no account.
- **Progress:** Your place is restored on revisit, stored per book in `localStorage`; `?start=1` opens a book at its beginning.
- **Catalogue cards:** Edition pages for the twelve reader books show live reader status (Available, In progress, Finished) with percentage and progress, plus links into the reader.
- **Responsive reader chrome** from 320 px to 1440 px with no horizontal overflow.

Not part of Stage 5a:

- The other two catalogue editions do not have reader texts yet; they remain catalogue-only with their source and rights records.
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

Each reader book also has a small first-section file in `assets/texts/openings/`. The reader paints that page first, then downloads the full text and measures the remaining pages. Opening files are generated from the bundled texts and are served from the same local directory.

## Reader performance

The reader opens progressively. The opening file contains only the first chapter or section, so the first page does not wait for a large JSON parse or a full pagination pass. After that page is on screen, the full text downloads and the rest of the book is measured. The loading bar stays through the opening paint, and the full request starts only after it, so a large download cannot hold back the first page or join its paint timing.

Pagination measures words with a `Range` over text nodes instead of building a span per word. The measuring loop yields to the browser every 8 ms through a `MessageChannel` task, which avoids the nested-timer clamp and keeps each main-thread task short. Page counts are exact and unchanged from the measured edition.

Mobile Lighthouse (Lighthouse 13.6, default mobile preset with simulated throttling) on all twelve reader URLs, final pass:

- **Performance score:** 99–100 — ten titles at 100 and two at 99. Repeat runs of the two 99s reached 100.
- **Largest Contentful Paint:** 1.06–1.12 s.
- **Total Blocking Time:** 0–53 ms.
- **Cumulative Layout Shift:** 0.

Local timings on the same machine: the first page is visible in under 0.2 s; the complete text is ready in about 0.7 s for *Alice's Adventures in Wonderland*, 1.7 s for *The Chemical History of a Candle*, and 3.5–3.9 s for the two longest texts, *On the Origin of Species* and *The Education of Henry Adams*.

Supported book IDs in the reader:

```text
alice-wonderland
yellow-wallpaper
time-machine
great-gatsby
sherlock-holmes
montessori-method
pride-prejudice
meditations
art-of-war
origin-species
chemical-history-candle
education-henry-adams
```

Edition URLs use the catalogue IDs. Reader URLs use the same IDs:

```text
reader.html?book=alice-wonderland
reader.html?book=yellow-wallpaper
reader.html?book=time-machine
reader.html?book=great-gatsby
reader.html?book=sherlock-holmes
reader.html?book=montessori-method
reader.html?book=pride-prejudice
reader.html?book=meditations
reader.html?book=art-of-war
reader.html?book=origin-species
reader.html?book=chemical-history-candle
reader.html?book=education-henry-adams
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
├── reader.html             Stage 5 reader shell
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
│   │   ├── openings/       First-section files for the immediate opening page
│   │   ├── alice-wonderland.json
│   │   ├── the-time-machine.json
│   │   ├── the-yellow-wallpaper.json
│   │   ├── great-gatsby.json
│   │   ├── sherlock-holmes.json
│   │   ├── montessori-method.json
│   │   ├── pride-prejudice.json
│   │   ├── meditations.json
│   │   ├── art-of-war.json
│   │   ├── origin-species.json
│   │   ├── chemical-history-candle.json
│   │   └── education-henry-adams.json
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
| The Great Gatsby | F. Scott Fitzgerald | [Project Gutenberg #64317](https://www.gutenberg.org/ebooks/64317) | Yes |
| Habis Gelap Terbitlah Terang | R.A. Kartini; translated by Empat Saudara | [Indonesian Wikisource](https://id.wikisource.org/wiki/Habis_Gelap_Terbitlah_Terang) | — |
| Alice's Adventures in Wonderland | Lewis Carroll | [Project Gutenberg #11](https://www.gutenberg.org/ebooks/11) | Yes |
| The Adventures of Sherlock Holmes | Arthur Conan Doyle | [Project Gutenberg #1661](https://www.gutenberg.org/ebooks/1661) | Yes |
| Pride and Prejudice | Jane Austen | [Project Gutenberg #1342](https://www.gutenberg.org/ebooks/1342) | Yes |
| The Montessori Method | Maria Montessori; translated by Anne E. George | [Project Gutenberg #39863](https://www.gutenberg.org/ebooks/39863) | Yes |
| Meditations | Marcus Aurelius; translated by George Long | [Project Gutenberg #2680](https://www.gutenberg.org/ebooks/2680) | Yes |
| The Art of War | Sun Tzu; translated by Lionel Giles (1910) | [Project Gutenberg #132](https://www.gutenberg.org/ebooks/132) | Yes |
| On the Origin of Species | Charles Darwin | [Project Gutenberg #1228](https://www.gutenberg.org/ebooks/1228) | Yes |
| The Yellow Wallpaper | Charlotte Perkins Gilman | [Project Gutenberg #1952](https://www.gutenberg.org/ebooks/1952) | Yes |
| The Time Machine | H. G. Wells | [Project Gutenberg #35](https://www.gutenberg.org/ebooks/35) | Yes |
| The Chemical History of a Candle | Michael Faraday; edited by William Crookes | [Project Gutenberg #14474](https://www.gutenberg.org/ebooks/14474) | Yes |
| The Education of Henry Adams | Henry Adams | [Project Gutenberg #2044](https://www.gutenberg.org/ebooks/2044) | Yes |
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

Stage 3, Stage 4, and Stage 5a were checked with Chrome DevTools Protocol harnesses and Playwright-free browser tests:

- **Static audit:** local links, fragments, CSS and JavaScript assets, SVG sprite references, ARIA references, label targets, duplicate IDs, catalogue wiring, featured IDs, collection membership, and book-detail query targets.
- **Reader smoke:** all twelve reader books at 1440×900, plus Alice at 320, 390, 768, and 1280×640; unavailable and missing book states; edition cards; Home; About; and Explore. Browser cache disabled and a fresh Chrome profile. Result: 0 console errors, 0 failed requests, no horizontal overflow, no clipped leaves, and 0 broken images.
- **Interaction suite:** 46 checks across desktop and mobile — page turning, keyboard navigation, swipe, progress restore on reload, Contents dialog focus/lock/current state, Display settings and reset, typography repagination with the reader anchored, single-layout at 800×900, opening closing times, text integrity at Alice’s opening and closing, Wallpaper word count, and Time Machine sections. Result: 0 failures.
- **Stage 4c reader check:** 67 checks across the six added titles — table-of-contents counts (9, 12, 23, 61, 12, 14), unit labels, opening headings, final passages, word counts, absence of source artifacts, no horizontal overflow, no console errors, and edition-card metadata. Result: 67 / 67.
- **Stage 5a reader check:** 48 checks across the three added titles — table-of-contents counts (15, 8, 37), section labels, opening headings, final passages, word counts, contributor metadata, absence of source artifacts, no horizontal overflow, no console errors, and edition-card metadata. Result: 48 / 48.
- **Stage 5a smoke:** 147 checks across all twelve reader titles and their edition cards, plus Home, About, and Explore. Result: 147 / 147.
- **Stage 5a responsive:** the three added titles at 390×844 and 768×1024, single-page layout and Contents dialog at 390, and edition cards at 390. Result: 48 / 48.
- **Reader performance:** Lighthouse 13.6 mobile (default simulated throttling) on all twelve reader URLs. Final pass: performance 99–100 (ten titles at 100 and two at 99), LCP 1.06–1.12 s, TBT 0–53 ms, CLS 0. Repeat runs of the two 99s reached 100. Local timings: first page under 0.2 s; full pagination about 0.7 s for Alice, 1.7 s for Candle, and 3.5–3.9 s for the two longest texts.
- **Text integrity:** the complete Alice opening and closing lines, Wallpaper length, and Time Machine section/Epilogue records were checked against the bundled JSON and rendered pages. The six Stage 4c and three Stage 5a texts were rebuilt from UTF-8 Project Gutenberg sources with their real chapter, story, book, and lecture divisions.
- **Responsive:** Reader at 320, 390, 768, 800×900, 1024, and 1440 px; edition pages at 1440 px; Home, About, and Explore at multiple widths. Result: 0 horizontal overflow and no broken images.

These checks cover Chromium on the local build only. They are not a substitute for screen-reader testing on physical devices or cross-browser testing beyond Chromium.

## Attribution

- **Literata** — Copyright 2017 The Literata Project Authors. Licensed under the SIL Open Font License 1.1. See `licenses/OFL-Literata.txt`.
- **DM Sans** — Copyright 2014 The DM Sans Project Authors. Licensed under the SIL Open Font License 1.1. See `licenses/OFL-DM-Sans.txt`.
- **Lucide icons** — ISC License, Copyright (c) 2026 Lucide Icons and Contributors. The site inlines a small subset of Lucide-derived paths as an SVG sprite. See `licenses/Lucide-ISC.txt`.
- **Book covers** — Original illustrations created for Bookora.
- **Book texts** — Public-domain editions; source and credit links are recorded per book in `js/books.js` and summarised above.

## Contact

Bookora is in its fifth stage. No public contact channel is open; source and licensing notes are available on `about.html#sources`.
