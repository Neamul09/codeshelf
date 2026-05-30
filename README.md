# 📚 CodeShelf

CodeShelf is a premium, state-of-the-art Single Page Application (SPA) designed to convert the static, extensive markdown lists of the `free-programming-books` repository into a visually stunning, highly interactive open-source digital library. 

Featuring custom HSL dark/light modes, dynamic in-memory search, scrollable resource selectors, procedurally generated graphic book covers, and a synced favorites drawer, CodeShelf delivers a premium digital reading and discovery experience.

---

## ✨ Features

- **Dynamic Zero-CORS Architecture**: Scans, parses, and compiles over **10,650+ educational resources** across **53 global languages** directly into a flat offline JS database. You can double-click `index.html` and search everything instantly with **zero network latency and zero browser CORS errors**!
- **Dynamic 3D Book Covers**: Automatically generates beautifully stylized gradient covers for books, cheatsheets, and podcasts based on their category tag. Includes an animated spin effect and high-DPI Vector format tags.
- **Multidimensional Filters**:
  - **Dynamic Language Selector**: Populates all 53 compiled global languages dynamically on select.
  - **Pinterest-Style Genre Bar**: Toggle instantly between **Books, Courses, Cheat Sheets, Interactive Tutorials, Playgrounds, Podcasts, and Problem Sets**.
  - **Fuzzy Search & Dynamic Sidebar**: In-memory indexes update sidebar category counters in real-time as you filter.
- **"My Shelf" Favorites Drawer**: Syncs your custom bookmarks directly to `localStorage` for permanent offline access. Includes a neon confetti-blast interaction upon book addition!
- **Buttery-Smooth Performance**: Infinite scroll rendering processes 40 items at a time, keeping browser reflow lightweight and responsive at 60fps.
- **Glowing SVG Favicon**: Responsive, offline-first vector favicon built directly as a data URI in the HTML header.

---

## 🛠️ Technology Stack

- **Markup & Layout**: Semantic HTML5 (Header, Main, Section, Aside, Footer)
- **Styling & Themes**: Vanilla CSS3, custom HSL variable design tokens, responsive grids, transitions, keyframes.
- **Logic & Engine**: Modern ES6+ JavaScript, modular in-memory queries, dynamic DOM render engines, browser-side LocalStorage synchronizers.
- **Iconography**: [Lucide Icons Library](https://lucide.dev) (loaded securely via CDN).

---

## 🚀 Getting Started

### Method 1: Instant Double-Click (Offline Fallback)
Simply open **[index.html](index.html)** in any modern web browser. CodeShelf is fully self-contained and precompiled with all 10,600+ resources, meaning it operates instantaneously with zero CORS blocks directly from your file system.

### Method 2: One-Click Local Web Server (For Developers)
Double-click **[start-library.bat](start-library.bat)** inside the root folder. The script automatically detects Node.js or Python, spins up a secure local web server on port **8000**, and launches CodeShelf in your browser.

---

## 👨‍💻 Developed By

- **Md. Neamul Morshed Neon**
  - *CS Undergrad, Bangladesh <3*
  - **GitHub**: [github.com/Neamul09](https://github.com/Neamul09)
  - **Instagram**: [instagram.com/neamul.morshed](https://instagram.com/neamul.morshed)

---

## ⚖️ License & Attribution

The compiled educational catalog database parsed in this project is sourced from the famous open-source repository **[EbookFoundation/free-programming-books](https://github.com/EbookFoundation/free-programming-books)**. 

The catalog data is licensed under the **[Creative Commons Attribution 4.0 International (CC BY 4.0) License](https://creativecommons.org/licenses/by/4.0/)**. CodeShelf is an independent presentation-layer modification built in compliance with all attribution and sharing policies.
