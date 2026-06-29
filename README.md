# e-Reader Dotcode Encoder

A web-based tool for generating printable Nintendo e-Reader dotcode strips from event card data.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![Built with React](https://img.shields.io/badge/built%20with-React%20%2B%20TypeScript-61dafb.svg)
![Open Source](https://img.shields.io/badge/open%20source-yes-brightgreen.svg)

---

## What It Is

The Nintendo e-Reader (Game Boy Advance, 2002–2004) used printed dotcode strips on physical cards to load mini-games, Pokémon events, and game data into GBA titles. Each strip is a precision-encoded pattern of dots that the e-Reader peripheral scans through its slot.

This tool lets you generate those dotcode strips from known event card data and print them for use with a real e-Reader peripheral. Select a card from the gallery, render the strip at print resolution, and download a correctly-formatted page ready to feed into your GBA.

Many of the original event cards — Eon Ticket, Celebi, Deoxys, and others — were distributed at limited in-store events that are no longer accessible. This project exists to preserve that content and make it usable on original hardware by the community.

No ROM files, no game modifications — just the dotcode strip images the e-Reader was designed to scan.

---

## Features

- **Visual card gallery** — browse 10 English Pokémon Ruby/Sapphire event cards with full card artwork
- **Accurate dotcode rendering** — outputs strips at 600 or 1200 DPI using the documented 8/10 modulation format
- **Download Strip** — raw dotcode PNG for archival or emulator use
- **Download Print Sheet** — US Letter-size page with the strip anchored to the bottom edge, ready to print and scan with a real GBA e-Reader
- **Custom .raw upload** — upload any `.raw` file from the broader community collection (Animal Crossing-e, Pokémon-e TCG, Battle-e, and more)

---

## Live Demo

**[e-reader-decode.vercel.app](https://e-reader-decode.vercel.app)** — no installation required

---

## Running Locally

```bash
git clone https://github.com/DarkwingTori/e-cardCreation.git
cd e-cardCreation
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Printing Tips

- Use semi-glossy or glossy cardstock
- Print at **100% scale** — disable "fit to page" or "scale to fit"
- Feed the paper **bottom-edge-first** into the GBA e-Reader slot
- 1200 DPI gives the best scan reliability; 600 DPI is the minimum

---

## Roadmap

- **Expanded event database** — additional event cards across regions and game titles, with a browsable catalog and metadata
- **Custom Pokémon events** — build your own event card from scratch: choose Pokémon, moves, held item, and OT, then generate a valid dotcode strip
- **Full card set support** — expanded upload and preview support for Animal Crossing-e, Pokémon-e TCG, Battle-e, and beyond

---

## Tech Stack

React 19 · TypeScript · Vite · HTML5 Canvas

---

## Open Source

Source code is released under the **MIT License** — see [`LICENSE`](./LICENSE).

Card artwork and event `.raw` data files are the intellectual property of Nintendo Co., Ltd. and are included here solely for fan preservation purposes. This project does not charge for access to these assets.

---

## Legal Disclaimer

This project is an independent fan preservation effort and is **not affiliated with, endorsed by, or sponsored by Nintendo Co., Ltd.**

Pokémon, Game Boy Advance, Nintendo e-Reader, and all associated names and characters are trademarks of Nintendo Co., Ltd. and/or its subsidiaries. All rights reserved.

No game ROM files are distributed by this project. The dotcode format implemented here is based on publicly available community documentation.

---

## Credits

| Contributor | Contribution |
|-------------|-------------|
| **CaitSith2** | `nedcenc`, `nedclib`, `nedcmake`, `raw2bmp` — the original open-source Nintendo e-Reader encoder/decoder tooling (GPL), which documented the dotcode format and served as the primary technical reference for this implementation |
| **Martin Korth** | [GBATEK](https://problemkaputt.de/gbatek.htm) — the definitive GBA hardware reference, including e-Reader dotcode block geometry and Reed-Solomon parameters; also located the Reed-Solomon source code used in nedclib |
| **Simon Rockcliff, Robert Morelos-Zaragoza & Hari Thirumoorthy** | Reed-Solomon error correction implementation incorporated into nedclib |
| **RUBYSAPPHIREDLC project** | Community-compiled English Ruby/Sapphire event card `.raw` files and card artwork used in this tool |
| **Nintendo Co., Ltd.** | Created the Nintendo e-Reader, the Game Boy Advance, and the Pokémon franchise |
