# Bookora

A quiet digital reading room for public-domain books. Bookora is an editorial, browser-only reading experience built with HTML5, CSS3, and vanilla JavaScript. Stage 1 establishes the design system, navigation, Home page, and a local sample catalogue; no frameworks, build step, backend, accounts, or runtime APIs are used.

## Stage 1 status

Implemented:

- Responsive editorial shell with desktop header, native `<dialog>` search, and mobile navigation dialog.
- Complete Home page: hero and book composition, search entry point, principles strip, featured shelf, category index, curated collections, and a two-page reading preview.
- Local catalogue of 10 public-domain books, 5 featured titles, and 3 collections.
- Ten original SVG cover illustrations and a self-hosted icon sprite derived from Lucide.
- About page with working source, privacy, and copyright notes.
- Clearly labelled route shells for Explore, book detail, and reader. These prevent dead navigation while later stages are unbuilt.
- Desktop, tablet, and mobile layouts from 320 px upward, with a single-page reader composition below 520 px.
- Accessible interaction basics: skip link, landmarks, focus-visible styles, native dialog focus handling, Escape/backdrop dismissal, `aria-expanded`, `aria-current`, and reduced-motion support.

Not part of Stage 1:

- Search results and filtering.
- Book detail and reader functionality.
- Accounts, reading progress, storage, or a backend.
- A live contact channel.

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
├── explore.html            Explore route shell (in preparation)
├── about.html              About, sources, privacy, copyright
├── book-detail.html        Book detail route shell (in preparation)
├── reader.html             Reader route shell (in preparation)
├── favicon.svg
├── css/
│   ├── style.css           Tokens, reset, header, dialogs, footer, notes
│   └── home.css            Home sections, reader preview, responsive rules
├── js/
│   ├── app.js              Dialogs, scroll lock, focus restore, year
│   ├── books.js            Local catalogue, featured IDs, collections
│   └── home.js             Featured shelf and collection rendering
├── assets/
│   ├── fonts/              Self-hosted Literata and DM Sans WOFF2 files
│   └── images/
│       ├── covers/         Ten original SVG book covers
│       ├── logo-mark.svg
│       └── paper-grain.svg
└── licenses/
    ├── OFL-Literata.txt
    ├── OFL-DM-Sans.txt
    └── Lucide-ISC.txt
```

## Design system

- **Type:** Literata for reading and display; DM Sans for labels, navigation, and interface text.
- **Palette:** ivory `#F5F2EA`, surface `#FFFEFA`, forest `#315846`, charcoal `#242923`, sage `#626A60`, border `#DDD8CD`, terracotta `#A4533B`.
- **Layout:** max-width containers, fluid gutters, editorial rules and labels, restrained radii, no decorative gradients, glass, or glow.
- **Responsive breakpoints:** 1180, 1080, 1000, 900, 760, 520, and 350 px. The two-page reader preview becomes a single page at 520 px.
- **Motion:** short opacity/transform transitions only; disabled under `prefers-reduced-motion`.

## Catalogue and sources

All records live in `js/books.js`. Text is not bundled at this stage; the records point to public-domain editions and their source pages. Metadata and source links were checked against the source projects.

| Title | Author / credit | Source |
| --- | --- | --- |
| The Great Gatsby | F. Scott Fitzgerald | [Project Gutenberg #64317](https://www.gutenberg.org/ebooks/64317) |
| Habis Gelap Terbitlah Terang | R.A. Kartini; translated by Empat Saudara | [Indonesian Wikisource](https://id.wikisource.org/wiki/Habis_Gelap_Terbitlah_Terang) |
| Alice's Adventures in Wonderland | Lewis Carroll | [Project Gutenberg #11](https://www.gutenberg.org/ebooks/11) |
| The Adventures of Sherlock Holmes | Arthur Conan Doyle | [Project Gutenberg #1661](https://www.gutenberg.org/ebooks/1661) |
| Pride and Prejudice | Jane Austen | [Project Gutenberg #1342](https://www.gutenberg.org/ebooks/1342) |
| Meditations | Marcus Aurelius; translated by George Long | [Project Gutenberg #2680](https://www.gutenberg.org/ebooks/2680) |
| The Art of War | Sun Tzu; translated by Lionel Giles (1910) | [Project Gutenberg #132](https://www.gutenberg.org/ebooks/132) |
| The Yellow Wallpaper | Charlotte Perkins Gilman | [Project Gutenberg #1952](https://www.gutenberg.org/ebooks/1952) |
| The Time Machine | H. G. Wells | [Project Gutenberg #35](https://www.gutenberg.org/ebooks/35) |
| Sejarah Melayu / Sulalatus Salatin | Attributed to Tun Sri Lanang; Or. 1703 manuscript | [Malay Wikisource](https://ms.wikisource.org/wiki/Sulalatus_Salatin_(Or._1703)) |

`The Great Gatsby` is recorded as public domain in the United States. Public-domain status can differ by jurisdiction; the source link and licence note are kept with each record.

The opening of *Alice's Adventures in Wonderland* is quoted in the Home page reading preview. All covers are original Bookora illustrations, not reproductions of publisher artwork.

## Verification

Stage 1 was checked with a static audit and a Chrome DevTools Protocol harness:

- Static audit: 466 checks covering local links, fragments, CSS and JavaScript assets, SVG sprite references, ARIA references, label targets, duplicate IDs, and catalogue wiring. Result: 0 errors.
- Browser checks at desktop, tablet, and mobile widths: no console errors, no failed network requests, and no horizontal document overflow.
- Mobile reader preview measured at 320, 340, 360, 390, 430, and 520 px: no clipped page content; the page number and last paragraph remain separated.
- Dialogs tested with keyboard and pointer input, including Escape and backdrop dismissal.

These checks cover the local Stage 1 build only. They are not a substitute for screen-reader testing on physical devices or cross-browser testing beyond Chromium.

## Attribution

- **Literata** — Copyright 2017 The Literata Project Authors. Licensed under the SIL Open Font License 1.1. See `licenses/OFL-Literata.txt`.
- **DM Sans** — Copyright 2014 The DM Sans Project Authors. Licensed under the SIL Open Font License 1.1. See `licenses/OFL-DM-Sans.txt`.
- **Lucide icons** — ISC License, Copyright (c) 2026 Lucide Icons and Contributors. The site inlines a small subset of Lucide-derived paths as an SVG sprite. See `licenses/Lucide-ISC.txt`.
- **Book covers** — Original illustrations created for Bookora.
- **Book texts** — Public-domain editions; source and credit links are recorded per book in `js/books.js` and summarised above.

## Contact

Bookora is in its first stage. No public contact channel is open yet; source and licensing notes are available on `about.html#sources`.
