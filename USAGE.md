# Contributor Usage Guide

This document explains the website's structure and how to maintain or extend it without AI assistance.

---

## Table of Contents

1. [How the Site Works](#how-the-site-works)
2. [File Map](#file-map)
3. [Utility Scripts Reference](#utility-scripts-reference)
4. [Running Locally](#running-locally)
5. [Data Source — `data.xlsx`](#data-source--dataxlsx)
6. [Editing Content](#editing-content)
   - [Profile](#profile)
   - [Experience](#experience)
   - [Education](#education)
   - [Certifications](#certifications)
   - [Awards](#awards)
   - [Skills](#skills)
   - [Projects](#projects)
7. [Adding Project Images](#adding-project-images)
8. [Adding Thai Translations for Projects](#adding-thai-translations-for-projects)
9. [Categorizing Projects](#categorizing-projects)
10. [Controlling Which Pages Are Visible](#controlling-which-pages-are-visible)
11. [Language & Theme](#language--theme)
12. [Contact & Join Forms](#contact--join-forms)
13. [Deploying the Site](#deploying-the-site)
14. [Troubleshooting](#troubleshooting)
15. [Git Commands](#git-commands)

---

## How the Site Works

This is a **static website** — no server, no database, no build step. Everything runs in the browser using plain HTML, CSS, and JavaScript.

```
Browser loads index.html
  → loads style.css      (all visual styles)
  → loads config.js      (page visibility, sub-sections, custom pages, categories)
  → loads data.js        (fallback mock data)
  → loads xlsx.full.min  (SheetJS from CDN — parses data.xlsx)
  → loads js/main.js     (ES module entry point — imports all other modules)
      ├─ js/nav.js        hash routing, page/sub-section visibility
      ├─ js/about.js      profile, timeline, education, skills
      ├─ js/projects.js   project cards, search, category tabs, pagination
      ├─ js/playground.js playground cards
      ├─ js/skills.js     skill and tool tags
      ├─ js/media.js      gallery, lightbox, YouTube
      ├─ js/i18n.js       EN/TH strings and language detection
      ├─ js/theme.js      dark / light mode
      ├─ js/data-loader.js fetches data.xlsx, falls back to data.js
      └─ js/custom-pages.js injects and renders custom pages from config
```

All your real data lives in `data.xlsx`. The site reads it on every page load using the [SheetJS](https://sheetjs.com/) library. If `data.xlsx` fails to load (e.g. you opened the file directly without a server), the site falls back to the dummy data in `data.js`.

The site is a **Single-Page Application (SPA)**. Clicking nav links does not load a new page — it hides the current section and shows the target section, then updates the URL hash (e.g. `#projects`).

---

## File Map

```
portfolio4/
├── index.html                ← Page structure (sections, nav, forms). Edit sparingly.
├── style.css                 ← All visual styles. Edit here to change colours, layout, fonts.
├── config.js                 ← Site configuration: pages, sub-sections, categories, custom pages.
├── data.js                   ← Fallback mock data used when data.xlsx fails to load.
├── data.xlsx                 ← PRIMARY data source. Edit this for all content changes.
│
├── js/                       ← ES module source (loaded by index.html as type="module")
│   ├── main.js               ← Entry point — initialises everything.
│   ├── state.js              ← Shared mutable state object.
│   ├── i18n.js               ← EN/TH UI strings. Edit here to change button labels etc.
│   ├── utils.js              ← escapeHtml, normalizeLines, debounce.
│   ├── theme.js              ← Dark / light mode toggle.
│   ├── nav.js                ← Hash routing, page & sub-section visibility, page ordering.
│   ├── media.js              ← Gallery, lightbox, YouTube embedding.
│   ├── about.js              ← Profile, timeline, education, certs, awards rendering.
│   ├── projects.js           ← Project cards, search, category tabs, pagination.
│   ├── playground.js         ← Playground cards (reuses project card builder).
│   ├── skills.js             ← Skill and tool tag rendering.
│   ├── data-loader.js        ← Fetches data.xlsx, falls back to data.js mock data.
│   └── custom-pages.js       ← Injects and renders custom pages defined in config.js.
│
├── images/
│   ├── manifest.json         ← Auto-generated image index. Do not edit by hand.
│   └── <FolderName>/         ← One folder per project. Name must match Image_Folder in data.xlsx.
│       ├── logo.png          ← Shown as the project logo card thumbnail.
│       └── screenshot1.png   ← All other images appear in the project gallery.
│
│   ── Utility scripts (run from terminal, not part of the website) ──
│
├── generate-manifest.js      ← Regenerates images/manifest.json after adding or removing images.
├── style-xlsx.js             ← Applies header styling, column widths, and wrapText to data.xlsx.
├── format-xlsx.js            ← Normalises line breaks in data.xlsx (legacy — style-xlsx.js covers this).
├── repair-data.js            ← One-time fix: adds missing Domain column to Skills and Tools sheets,
│                                and seeds Software Development mockup data.
├── add-bilingual.js          ← Writes Thai translations into the Profile and Skills sheets.
├── translate-projects.js     ← Writes Thai translations into the Project sheet.
├── categorize-projects.js    ← Writes Project_Category values into the Project sheet.
└── update-playground.js      ← Appends new projects to the Playground sheet.
```

**Key rule:** All `*.js` files other than those in `js/`, `config.js`, and `data.js` are Node.js utility scripts. They modify `data.xlsx` from the terminal and are never loaded by the browser. Run them when you need them; they do nothing automatically.

---

## Utility Scripts Reference

All scripts below live in the project root and are run with `node <script>`. None of them affect the website directly — they only read and write `data.xlsx` or `images/manifest.json`.

### Website files (loaded by the browser)

| File | Purpose |
|---|---|
| `index.html` | Page shell — all sections, nav, and forms. Rarely needs editing. |
| `style.css` | Every visual style rule. Edit here for colours, layout, and typography. |
| `js/main.js` | ES module entry point — imports and wires up all other modules. |
| `config.js` | Site config: page visibility, sub-section visibility, nav order, custom pages, category tabs. |
| `data.js` | Fallback mock data rendered when `data.xlsx` fails to load (e.g. no local server). |
| `data.xlsx` | **Primary data source.** Contains all real content across ten sheets. |

### Data file

| File | Sheets | Notes |
|---|---|---|
| `data.xlsx` | Profile, Experience, Education, Certifications, Awards, Skills, Tools, Project, Playground, Contact | Fetched by the browser on every page load via SheetJS. Editing and saving this file is all that is needed to update site content. |

### Utility scripts (terminal only)

| Script | What it does | When to run |
|---|---|---|
| `generate-manifest.js` | Scans every subfolder inside `images/` and writes `images/manifest.json`. | After adding, renaming, or deleting any image file. |
| `style-xlsx.js` | Applies dark-blue header styling, sets column widths, freezes the header row, enables auto-filter, and normalises line breaks across all sheets. | After editing `data.xlsx` to keep formatting consistent. |
| `format-xlsx.js` | Normalises line-break characters (`\r\n`, `\r`, literal `\n` text) in all text cells. | Covered by `style-xlsx.js`; use this only if you need the fix without re-styling. |
| `repair-data.js` | One-time setup script. Adds the missing `Domain` column to the Skills and Tools sheets, tags existing rows (`qa` or `software development`), and seeds Software Development mockup skills, tools, and projects. | Run once on a fresh clone, or if the Skills / Tools sections appear empty on the site. |
| `add-bilingual.js` | Writes Thai translations directly into the `Profile` and `Skills` sheets without disturbing existing cell content. | When adding or updating Thai text for profile fields or skill names. |
| `translate-projects.js` | Reads a translation map defined inside the script and writes `_TH` column values into the `Project` sheet. | When translating many projects at once instead of editing cells manually. |
| `categorize-projects.js` | Reads a category map defined inside the script and writes `Project_Category` values into the `Project` sheet. | When assigning or bulk-updating project categories. |
| `update-playground.js` | Appends new project rows to the `Playground` sheet. | When adding new playground projects without opening Excel. |

### Typical workflow after editing `data.xlsx`

```bash
# 1. Edit data.xlsx in Excel (or run a utility script above)

# 2. Re-apply formatting (always safe to re-run)
node style-xlsx.js

# 3. If you added or removed images
node generate-manifest.js

# 4. Stage and commit
git add data.xlsx images/manifest.json
git commit -m "Update content"
git push
```

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
| `Skills` | Skill tags grouped by level, split into QA and Software Development sections |
| `Tools` | Tool tags grouped by category, split into QA and Software Development sections |
| `Project` | All project cards on the Projects page |
| `Playground` | Personal / side-project cards on the Playground page |
| `Contact` | Email, phone, LinkedIn URL, GitHub URL |

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
| `Domain` | **Required.** Either `qa` or `software development` (lowercase). Determines which section the skill appears under on the About page. |
| `Category` | Optional grouping label (not currently displayed, kept for reference). |

Level scale:

| Level | Label |
|---|---|
| 5 | Expert |
| 4 | Advanced |
| 3 | Intermediate |
| 1–2 | Beginner |

> **Important:** If `Domain` is missing or misspelled, the skill will not appear on the site. Valid values are exactly `qa` and `software development`.

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
| `Project_Category` | No | See valid values below. Controls which tab the project appears under. |

**`Project_Category` valid values — type exactly as shown, including the period:**

| Value | Tab it appears under |
|---|---|
| `Software` | Software |
| `Game` | Game |
| `etc.` | etc. |

> If the cell is empty or has a typo, the project will not show under any tab (it still appears under "All").

**Adding a new project:**
1. Add a new row to the `Project` sheet.
2. Fill in `Project name` at minimum.
3. If you have images, create a folder in `images/` and set `Image_Folder` to match the folder name exactly (case-sensitive).
4. Run `node generate-manifest.js` after adding images.
5. Set `Project_Category` to `Software`, `Game`, or `etc.` (exact match, case-sensitive, including the period for `etc.`).

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

Each project must have a `Project_Category` value that matches one of the categories defined in `config.js`. This controls the tab filter on the Projects page.

### Adding a new category

Open `config.js` and add an entry to `projectCategories`:

```js
projectCategories: [
    { value: 'Software', en: 'Software', th: 'ซอฟต์แวร์' },
    { value: 'Game',     en: 'Game',     th: 'เกม'       },
    { value: 'etc.',     en: 'etc.',     th: 'อื่นๆ'     },
    { value: 'Design',   en: 'Design',   th: 'ดีไซน์'    }, // ← new
],
```

- `value` — the exact string to put in the `Project_Category` column (case-sensitive).
- `en` / `th` — the tab label shown in each language.

The tab will appear automatically — no changes to `index.html` or `script.js` needed.

### Setting a project's category

**Option A — Type it directly in Excel**

Open `data.xlsx`, find the `Project_Category` column in the `Project` sheet, and type the category value exactly as it appears in `config.js`.

**Option B — Use the script**

Open `categorize-projects.js`. Add each project name to the correct list, and add any new categories you created:

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
    // Add new category here to match config.js
};
```

The project name must match the `Project name` column exactly (case-sensitive). Any project not listed defaults to `etc.`.

Then run:

```bash
node categorize-projects.js
```

This rewrites the `Project_Category` column in `data.xlsx` for all rows.

---

## Controlling Which Pages Are Visible

Edit `config.js` directly:

```js
var siteConfig = {
    pages: {
        home:       false,  // false = hide the "Home" nav link (the section itself stays)
        about:      true,
        projects:   true,
        playground: true,
        join:       true,
        contact:    false,
    },
    pageOrder: ['home', 'about', 'projects', 'playground', 'join', 'contact'],
};
```

Set any value to `false` to hide that section:

- The nav link disappears.
- Navigating to the URL hash directly (e.g. `#about`) redirects to home.
- `projects: false` also hides the Recent Projects block on the home page.
- `contact: false` hides the nav link but the contact form at the bottom of the home page remains visible.

**Nav order:** `pageOrder` sets the exact sequence of nav links. `home` is always rendered first regardless of its position in the array.

### Controlling sub-sections within a page

`subSections` lets you hide individual blocks inside a page without disabling the whole page.

```js
var siteConfig = {
    pages: { about: true, /* ... */ },

    subSections: {
        about: {
            experience:    true,
            education:     true,
            certifications: false,  // hides the Certifications block
            awards:        false,   // hides the Awards block
            skills:        true,
            tools:         true,
        },
        home: {
            hero:           true,
            recentProjects: true,
            contactForm:    false,  // hides the contact form inside the Home section
        },
    },
};
```

Any sub-section key set to `false` is hidden with `display:none` — its data is still loaded, it just doesn't render.

---

## Custom Pages

Custom pages let you add a new section to the site backed by a new sheet in `data.xlsx`. No changes to `index.html` or the `js/` modules are needed.

### Step 1 — Add the custom page in `config.js`

Add an entry to the `customPages` array in `config.js`:

```js
customPages: [
    {
        id:        'blog',
        label:     { en: 'Blog', th: 'บล็อก' },
        xlsxSheet: 'Blog',
        fields: {
            title:       'Title',
            date:        'Date',
            description: 'Summary',
            link:        'URL',
        },
    },
],
```

| Field | What it does |
|---|---|
| `id` | Used as the URL hash and the `id` attribute of the injected `<section>`. No spaces; lowercase recommended. |
| `label.en` / `label.th` | Text shown in the nav bar in each language. |
| `xlsxSheet` | The name of the sheet to load from `data.xlsx`. Case-sensitive. |
| `fields.title` | Column whose value becomes the card heading. |
| `fields.description` | Column shown as the card body text. Optional. |
| `fields.date` | Column shown below the heading. Optional. |
| `fields.link` | Column rendered as a "View →" link. Optional. |

### Step 2 — Add the sheet to data.xlsx

Open `data.xlsx` and add a new sheet tab whose name matches the `xlsxSheet` value you set in `config.js` exactly (case-sensitive). Add column headers in row 1. The column names must match the `fields` mapping you configured.

Example for a `Blog` sheet:

| Title | Content | Date | URL |
|---|---|---|---|
| My first post | Hello world… | 2025-01 | https://… |

### Step 3 — Reload

Reload `index.html`. The new section appears in the nav and renders cards from the sheet automatically.

> **Note:** Custom pages currently render a simple card layout (title, description, date, link). For a fully custom layout, add a new rendering function in `js/` and call it from `custom-pages.js`.

---

## Language & Theme

**Language (EN / TH)**

The site detects the user's browser language automatically on first visit. If the browser reports Thai (`th`), the site switches to Thai. Otherwise it defaults to English. The user can also click the EN / TH buttons in the nav to override, and their choice is saved in `localStorage`.

To add or edit UI strings (buttons, labels, headings), open `js/i18n.js` and find the `i18n` object near the top. It has two keys: `en` and `th`. Each key is an object of translation strings. Edit the values directly.

```js
export const i18n = {
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

---

## Git Commands

Git saves a history of every change you make. Think of it as checkpoints — you create one whenever you want to record your current state and share it to the web.

All commands below are run in a terminal from the project folder (`d:\work\practice\portfolio4`).

---

### Check what has changed

```bash
git status
```

Shows three groups:
- **Changes to be committed** — staged, will be in the next checkpoint.
- **Changes not staged for commit** — modified files not yet included.
- **Untracked files** — brand new files git has never seen.

---

### Stage files (mark them for the next checkpoint)

Stage a specific file:
```bash
git add data.xlsx
```

Stage everything in a folder (new files + changes + deletions):
```bash
git add -A images/
```

Stage multiple specific files at once:
```bash
git add data.xlsx images/manifest.json script.js
```

> **Tip:** Never use `git add .` or `git add -A` at the root — it may pick up temp files like `~$data.xlsx` (Excel lock file) by accident.

---

### Commit (save a checkpoint)

```bash
git commit -m "Your message here"
```

The message should briefly describe what changed, e.g.:

```bash
git commit -m "Add new project images for cog and mxg"
git commit -m "Update bio and experience in data.xlsx"
git commit -m "Fix typo in project description"
```

---

### Push (send the checkpoint to GitHub / update the live site)

```bash
git push
```

GitHub Pages will rebuild the site automatically within ~1 minute.

---

### Pull (get the latest changes from GitHub)

If you work on multiple computers, always pull before you start editing:

```bash
git pull
```

This downloads any commits that are on GitHub but not on your local machine.

---

### Typical workflow for updating the portfolio

```bash
# 1. Get the latest version (if working across machines)
git pull

# 2. Edit data.xlsx, add/remove images, etc.
#    Run helper scripts if needed:
node format-xlsx.js          # fix line breaks in data.xlsx
node generate-manifest.js    # update images/manifest.json after adding/removing images

# 3. Stage your changes
git add data.xlsx images/manifest.json

# 4. Stage any new or deleted images
git add -A images/

# 5. Commit with a short description
git commit -m "Update project data and images"

# 6. Push to GitHub (site goes live ~1 minute later)
git push
```

---

### View recent commit history

```bash
git log --oneline
```

Shows a compact list of recent checkpoints with their short IDs and messages.

---

### Undo staged changes (before committing)

If you staged a file by mistake and want to un-stage it (the file itself is not changed):

```bash
git restore --staged data.xlsx
```

---

### Undo local changes to a file (revert to last commit)

> **Warning:** This permanently discards your unsaved edits to that file.

```bash
git restore data.xlsx
```

---

### See what changed in a file

```bash
git diff data.xlsx
```

For already-staged changes:

```bash
git diff --staged data.xlsx
```
