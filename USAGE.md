# Contributor Usage Guide

This document explains the website's structure and how to maintain or extend it without AI assistance.

---

## Table of Contents

1. [How the Site Works](#how-the-site-works)
2. [File Map](#file-map)
3. [Running Locally](#running-locally)
4. [Data Source — `data.xlsx`](#data-source--dataxlsx)
5. [Editing Content](#editing-content)
   - [Profile](#profile)
   - [Experience](#experience)
   - [Education](#education)
   - [Certifications](#certifications)
   - [Awards](#awards)
   - [Skills](#skills)
   - [Projects](#projects)
6. [Adding Project Images](#adding-project-images)
7. [Adding Thai Translations for Projects](#adding-thai-translations-for-projects)
8. [Categorizing Projects](#categorizing-projects)
9. [Controlling Which Pages Are Visible](#controlling-which-pages-are-visible)
10. [Language & Theme](#language--theme)
11. [Contact & Join Forms](#contact--join-forms)
12. [Deploying the Site](#deploying-the-site)
13. [Troubleshooting](#troubleshooting)

---

## How the Site Works

This is a **static website** — no server, no database, no build step. Everything runs in the browser using plain HTML, CSS, and JavaScript.

```
Browser loads index.html
  → loads style.css (all visual styles)
  → loads config.js (which pages to show)
  → loads data.js (fallback mock data)
  → loads script.js (all logic)
  → script.js fetches data.xlsx over HTTP
  → script.js reads each sheet and renders content into the page
```

All your real data lives in `data.xlsx`. The site reads it on every page load using the [SheetJS](https://sheetjs.com/) library. If `data.xlsx` fails to load (e.g. you opened the file directly without a server), the site falls back to the dummy data in `data.js`.

The site is a **Single-Page Application (SPA)**. Clicking nav links does not load a new page — it hides the current section and shows the target section, then updates the URL hash (e.g. `#projects`).

---

## File Map

```
monwork/
├── index.html              ← Page structure (sections, nav, forms). Edit sparingly.
├── style.css               ← All visual styles. Edit here to change colours, layout, fonts.
├── script.js               ← All behaviour: navigation, rendering, search, gallery, i18n, theme.
├── config.js               ← Toggle which sections are visible and their nav order.
├── data.js                 ← Fallback mock data shown when data.xlsx cannot load.
├── data.xlsx               ← PRIMARY data source. Edit this for all content changes.
│
├── images/
│   ├── manifest.json       ← Auto-generated index of all image files. Do not edit by hand.
│   └── <FolderName>/       ← One folder per project. Name must match Image_Folder in data.xlsx.
│       ├── logo.png        ← Special: shown as the project logo (separate from the gallery).
│       └── screenshot1.png ← Any other images appear in the project gallery.
│
├── generate-manifest.js    ← Node.js script: regenerates images/manifest.json.
├── categorize-projects.js  ← Node.js script: writes Project_Category into data.xlsx.
└── translate-projects.js   ← Node.js script: writes Thai translations into data.xlsx.
```

**Key rule:** The three `*.js` Node scripts are utilities that modify `data.xlsx`. They are not part of the website itself. You run them from the terminal when you need them.

---

## Running Locally

You **must** use a local HTTP server. Opening `index.html` directly in a browser will fail because browsers block `fetch()` requests from `file://` URLs.

**Option A — Python (no install needed on macOS/Linux):**
```bash
cd /path/to/monwork
python -m http.server 8080
```

**Option B — Node.js:**
```bash
npx serve .
```

Then open `http://localhost:8080` in your browser. Refresh the browser after editing `data.xlsx` to see changes.

---

## Data Source — `data.xlsx`

Open `data.xlsx` in Excel, LibreOffice Calc, or Google Sheets. Each tab (sheet) corresponds to one section of the site.

| Sheet | Controls |
|---|---|
| `Profile` | Hero photo, name, title, intro text, bio, location |
| `Experience` | Work history timeline |
| `Education` | School / degree list |
| `Certifications` | Certification badges |
| `Awards` | Awards list |
| `Skills` | Skill tags grouped by level |
| `Project` | All project cards |

**Bilingual columns:** Fields that support Thai translation use a `_TH` suffix. For example, the `Project name` column has a matching `Project name_TH` column. If the user's browser language is Thai, the `_TH` value is shown. If the `_TH` column is empty, the English value is used as a fallback.

**Line breaks inside a cell:** Press **Alt + Enter** (Windows) or **Ctrl + Option + Enter** (Mac) to add a line break within a single cell. This works for Overview, Roles and Responsibility, and Tools fields.

---

## Editing Content

### Profile

Sheet: **`Profile`**

| Column | What it does |
|---|---|
| `Name` | Your full name. Shown in the nav brand, hero heading, and browser tab title. |
| `Title` | Your job title shown under your name. Add `Title_TH` column for Thai. |
| `Intro` | Short text shown on the home hero. Add `Intro_TH` for Thai. |
| `Bio` | Longer text shown on the About page. Add `Bio_TH` for Thai. |
| `Location` | Shown under bio with a 📍 icon. Add `Location_TH` for Thai. |
| `Photo_URL` | URL or base64 data URI for your profile photo. |

There should be exactly one row. Only the first row is read.

---

### Experience

Sheet: **`Experience`**

Each row is one job entry displayed in the timeline on the About page.

| Column | Example |
|---|---|
| `Role` | QA Engineer |
| `Company` | Acme Corp |
| `Period` | 2022 – Present |
| `Description` | Short summary of your responsibilities. |

Rows appear in the order they are listed in the sheet (top = first shown).

---

### Education

Sheet: **`Education`**

| Column | Example |
|---|---|
| `Degree` | B.Sc. Computer Science |
| `Institution` | Chulalongkorn University |
| `Period` | 2016 – 2020 |

---

### Certifications

Sheet: **`Certifications`**

| Column | Example |
|---|---|
| `Name` | ISTQB Foundation Level |
| `Issuer` | ISTQB |
| `Year` | 2023 |

---

### Awards

Sheet: **`Awards`**

| Column | Example |
|---|---|
| `Title` | Best QA Award |
| `Project` | Hotel Life |
| `Place` | 1st Place |
| `Year` | 2022 |

---

### Skills

Sheet: **`Skills`**

| Column | What it does |
|---|---|
| `Skill_Name` | The skill label. Add `Skill_Name_TH` for Thai. |
| `Level` | A number 1–5. Controls which group the skill appears in. |
| `Category` | Optional grouping label (not currently displayed but kept for future use). |

Level scale:

| Level | Label |
|---|---|
| 5 | Expert |
| 4 | Advanced |
| 3 | Intermediate |
| 1–2 | Beginner |

---

### Projects

Sheet: **`Project`**

Each row is one project card. Order in the sheet controls the display order. The top 3 rows also appear as "Recent Projects" on the home page.

| Column | Required | What it does |
|---|---|---|
| `Project name` | Yes | The card heading. |
| `Project name_TH` | No | Thai version of the name. |
| `Duration` | No | e.g. `2021 – 2022`. Shown below the name. |
| `Project URL` | No | A link shown as "View Project ↗". |
| `Project overview` | No | Summary paragraph. |
| `Project overview_TH` | No | Thai version. |
| `Roles and Responsibility` | No | Bullet points of what you did. |
| `Roles and Responsibility_TH` | No | Thai version. |
| `Skills and Tools` | No | Comma-separated tools, e.g. `JIRA, TestRail, Selenium`. |
| `Image_Folder` | No | Folder name inside `images/`. Must match exactly. |
| `YouTube` | No | One or more YouTube URLs, comma-separated. Videos appear first in the gallery. |
| `Project_Category` | No | `Software`, `Game`, or `etc.` — controls tab filtering. |

**Adding a new project:**
1. Add a new row to the `Project` sheet.
2. Fill in `Project name` at minimum.
3. If you have images, create a folder in `images/` and set `Image_Folder` to match the folder name exactly (case-sensitive).
4. Run `node generate-manifest.js` after adding images.
5. Set `Project_Category` either directly in the cell or by updating and running `categorize-projects.js`.

---

## Adding Project Images

**Step 1 — Create a folder**

Inside `images/`, create a folder. The name is up to you but must match the `Image_Folder` value in the Project sheet exactly (case-sensitive).

```
images/
└── MyProject/
    ├── logo.png
    ├── screenshot1.png
    └── screenshot2.jpg
```

**Step 2 — Name your logo correctly**

A file is treated as the project logo if its name (without extension) is exactly `logo`, or starts with `logo_`, or ends with `_logo`. Example: `logo.png`, `logo_v2.png`, `myproject_logo.png`. The logo is shown on the left side of the project card, separate from the gallery. Clicking it opens a lightbox.

All other images in the folder go into the gallery and can be browsed with the arrow buttons.

**Step 3 — Regenerate the manifest**

The browser cannot list folder contents on its own, so there is a generated index file. After adding or removing images, run:

```bash
node generate-manifest.js
```

This rewrites `images/manifest.json`. You must do this every time you add, rename, or delete images. Without it, new images will not appear on the site.

**Supported image formats:** JPG, JPEG, PNG, GIF, WEBP.

---

## Adding Thai Translations for Projects

You have two options:

**Option A — Edit the Excel file directly**

Open `data.xlsx`, go to the `Project` sheet, and type the Thai text into the `Project name_TH`, `Project overview_TH`, and `Roles and Responsibility_TH` columns for the relevant row. This is the simplest approach.

**Option B — Use the translation script**

Open `translate-projects.js`. Add an entry to the `translations` object:

```js
const translations = {
    'Your Project Name': {             // Must match "Project name" in the sheet exactly
        'Project name_TH': 'ชื่อโปรเจค',
        'Project overview_TH': 'คำอธิบายโปรเจค',
        'Roles and Responsibility_TH': '• หน้าที่ 1\n• หน้าที่ 2',
    },
    // Add more projects below...
};
```

Then run:

```bash
node translate-projects.js
```

This reads `data.xlsx`, fills in the `_TH` columns, and saves the file. Use this approach when translating many projects at once.

---

## Categorizing Projects

Each project should have a `Project_Category` value of `Software`, `Game`, or `etc.`. This controls the tab filter on the Projects page.

**Option A — Type it directly in Excel**

Open `data.xlsx`, find the `Project_Category` column in the `Project` sheet, and type the category for each row.

**Option B — Use the script**

Open `categorize-projects.js`. Add each project name to the correct list:

```js
const categories = {
    Software: [
        'Your Software Project',
        // ...
    ],
    Game: [
        'Your Game Project',
        // ...
    ],
    'etc.': [
        'Some Other Project',
    ],
};
```

The project name must match the `Project name` column in the sheet exactly (case-sensitive). Any project not listed defaults to `etc.`.

Then run:

```bash
node categorize-projects.js
```

This rewrites the `Project_Category` column in `data.xlsx` for all rows.

---

## Controlling Which Pages Are Visible

Open `config.js`:

```js
const siteConfig = {
    pages: {
        about:    true,   // Show the About section
        projects: true,   // Show the Projects section
        join:     true,   // Show the Join QA Team section
        contact:  true,   // Show the Contact nav link
    }
};
```

Set any value to `false` to hide that section:

- The nav link disappears.
- Navigating to the URL hash directly (e.g. `#about`) redirects to home.
- `projects: false` also hides the Recent Projects block on the home page.
- `contact: false` hides the nav link but the contact form at the bottom of the home page remains visible.

**Nav order:** The order of keys in `pages` controls the order of nav links. `home` is always pinned first regardless. To reorder, change the key order in the object.

---

## Language & Theme

**Language (EN / TH)**

The site detects the user's browser language automatically on first visit. If the browser reports Thai (`th`), the site switches to Thai. Otherwise it defaults to English. The user can also click the EN / TH buttons in the nav to override, and their choice is saved in `localStorage`.

To add or edit UI strings (buttons, labels, headings), open `script.js` and find the `i18n` object near the top. It has two keys: `en` and `th`. Each key is an object of translation strings. Edit the values directly.

```js
const i18n = {
    en: {
        nav_home: 'Home',
        // ...
    },
    th: {
        nav_home: 'หน้าแรก',
        // ...
    }
};
```

For data-driven fields (profile text, project descriptions, skill names), add a `_TH` column in the corresponding Excel sheet.

**Dark mode**

The site detects `prefers-color-scheme` from the OS on first visit. The user can toggle with the Dark / Light button in the nav. The choice is saved in `localStorage`. No changes are needed unless you want to adjust the colour palette — all dark mode colours are in `style.css` under the `[data-theme="dark"]` selector.

---

## Contact & Join Forms

Both forms use [Formspree](https://formspree.io/) to send submissions to an email inbox without any backend code.

| Form | Formspree ID | Element |
|---|---|---|
| Contact | `xykloarz` | `#contact-form` |
| Join QA Team | `xlgavrqr` | `#join-form` |

The form IDs are set at the bottom of `index.html`:

```html
<script>
    formspree('initForm', { formElement: '#contact-form', formId: 'xykloarz' });
    formspree('initForm', { formElement: '#join-form',    formId: 'xlgavrqr' });
</script>
```

To change where submissions are sent, log in to your Formspree account and update the email address on the form settings page. Do not change the form IDs in the HTML unless you are replacing the forms entirely.

To add a new field to a form, add the input inside the relevant `<form>` tag in `index.html`. Formspree will automatically include it in submissions. If the label needs translation, add a `data-i18n` attribute pointing to a key in the `i18n` object in `script.js`.

---

## Deploying the Site

This is a static site with no build step. Upload all files to any static hosting service.

**GitHub Pages (free):**
1. Push the repo to GitHub.
2. Go to the repo Settings → Pages.
3. Set source to the `main` branch, root folder.
4. The site is live at `https://<username>.github.io/<repo>`.

**Netlify or Vercel (free tier):**
1. Connect your GitHub repo.
2. Set the publish directory to `.` (root).
3. No build command needed.

**Important:** After deploying, make sure `data.xlsx` and `images/manifest.json` are included in the deployment. These are binary/JSON files tracked in git and must be present for the site to load correctly.

---

## Troubleshooting

**Site shows "Loading…" and never populates:**
You opened `index.html` directly in a browser (`file://` URL). Use a local server — see [Running Locally](#running-locally).

**New images do not appear:**
You forgot to run `node generate-manifest.js` after adding images, or the `Image_Folder` value in the Project sheet does not exactly match the folder name (check capitalisation and spaces).

**Thai text does not show:**
The `_TH` column in the Excel sheet is empty, or the project is not listed in `translate-projects.js` and you have not manually filled in the cell.

**A project does not appear under the correct tab:**
The `Project_Category` cell in the `Project` sheet is empty or has a typo. Valid values are `Software`, `Game`, and `etc.` (with the period). Fix the cell directly in Excel, or update `categorize-projects.js` and re-run it.

**The nav link for a section is missing:**
Check `config.js` — the section's value is likely set to `false`. Change it to `true`.

**Form submissions are not arriving:**
Log in to Formspree and check whether the form is active and the email address is verified. Formspree has a monthly submission limit on the free plan.

**Changes to `data.xlsx` are not reflected after refreshing:**
Some browsers aggressively cache files. Do a hard refresh: `Cmd + Shift + R` on Mac, `Ctrl + Shift + R` on Windows.
