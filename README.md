# Noppon Mongkonnimit — Portfolio

เว็บ portfolio ส่วนตัว สร้างด้วย HTML/CSS/JS ล้วน ข้อมูลทั้งหมดเก็บใน `data.xlsx`

## โครงสร้างไฟล์

```
portfolio4/
├── index.html              # โครงสร้างหน้าเว็บ
├── wizard.html             # UI สำหรับตั้งค่าเว็บ (เปิดใน browser, export config.js)
├── style.css               # สไตล์ทั้งหมด (ใช้ CSS custom properties สำหรับ dark mode)
├── config.js               # ตั้งค่า page visibility, sub-sections, nav order, custom pages
├── data.js                 # mock data สำรอง (ใช้ถ้า data.xlsx โหลดไม่ได้)
├── data.xlsx               # แหล่งข้อมูลหลัก (ดูรายละเอียด sheet ด้านล่าง)
├── js/                     # ES modules (entry point: js/main.js)
│   ├── main.js             # entry point — init ทุกอย่าง, จัดการ applyLang
│   ├── state.js            # shared state object แทนการใช้ global variables
│   ├── i18n.js             # ข้อความ EN/TH, t(), pickLang(), detectLang()
│   ├── utils.js            # escapeHtml, normalizeLines, debounce
│   ├── theme.js            # dark/light mode toggle
│   ├── nav.js              # hash routing, page config, navigate()
│   ├── media.js            # gallery, lightbox, YouTube embedding
│   ├── about.js            # render profile, timeline, education, certs, awards
│   ├── projects.js         # project list, search, category tabs, pagination
│   ├── playground.js       # playground list (reuse buildProjectCard จาก projects.js)
│   ├── skills.js           # render skills และ tools
│   ├── custom-pages.js     # inject และ render custom pages จาก config
│   └── data-loader.js      # โหลด data.xlsx และ fallback mock data
├── images/
│   ├── manifest.json       # รายชื่อไฟล์รูปในแต่ละ folder (generate จาก script)
│   └── <ProjectFolder>/    # รูปภาพแต่ละโปรเจค (logo.png + ภาพอื่นๆ)
├── generate-manifest.js    # สร้าง images/manifest.json ใหม่
├── add-bilingual.js        # เพิ่มคอลัมน์ภาษาไทยใน Profile และ Skills sheet
├── translate-projects.js   # เพิ่ม/แก้คำแปลโปรเจคใน Project sheet
└── categorize-projects.js  # กำหนด Project_Category ให้โปรเจคทั้งหมด
```

## Config Wizard — ตั้งค่าเว็บแบบ UI

วิธีง่ายที่สุดในการตั้งค่าคือใช้ Wizard:

1. รัน local server แล้วเปิด `http://localhost:8080/wizard.html`
2. ตั้งค่าตามขั้นตอน 6 ขั้น (ดูรายละเอียดด้านล่าง)
3. คลิก **Download config.js**
4. นำไฟล์ที่ได้ไปแทน `config.js` เดิมในโฟลเดอร์ portfolio4

| ขั้น | หัวข้อ | รายละเอียด |
|------|--------|------------|
| 1 | Pages | เปิด/ปิด page แต่ละหน้า + ลาก reorder ลำดับใน nav |
| 2 | Sub-sections | เลือก sub-section ที่ต้องการแสดงในแต่ละ page |
| 3 | Xlsx Mapping | กำหนดว่าแต่ละ sub-section อ่านข้อมูลจาก sheet ชื่ออะไร |
| 4 | Categories | เพิ่ม/ลบ/แก้ไข project category (EN + TH) |
| 5 | Custom Pages | เพิ่มหน้าใหม่ที่ดึงข้อมูลจาก xlsx sheet ที่กำหนดเอง |
| 6 | Export | ดาวน์โหลด `config.js` ที่พร้อมใช้งาน |

---

## config.js — ตั้งค่าด้วยมือ

แก้ไขโดยตรงได้ถ้าไม่ต้องการใช้ wizard

```js
var siteConfig = {
    clarityId: 'YOUR_CLARITY_ID',    // Microsoft Clarity project ID (ใส่ '' เพื่อปิด)
    staleWarningMonths: 6,           // เดือนที่ไม่มี push ก่อนจะแสดงคำเตือน (0 = ปิด)

    pages: {
        home:       true,   // true = เปิด, false = ซ่อน
        about:      true,
        projects:   true,
        playground: true,
        join:       true,
        contact:    false,
    },

    // ลำดับ page ใน nav bar (ถ้าไม่กำหนดจะใช้ลำดับจาก pages object)
    pageOrder: ['home', 'about', 'projects', 'playground', 'join', 'contact'],

    // ควบคุม sub-section แต่ละ page (ถ้าไม่กำหนด = เปิดทั้งหมด)
    subSections: {
        about: {
            experience:     true,
            education:      true,
            certifications: true,
            awards:         true,
            skills:         true,
            tools:          true,
        },
        home: {
            hero:           true,
            recentProjects: true,
            contactForm:    true,
        },
    },

    // หน้าใหม่ที่สร้างจาก xlsx sheet (ดูหัวข้อ Custom Pages ด้านล่าง)
    customPages: [],
};
```

เมื่อตั้ง page เป็น `false`:
- ลิงก์ใน nav หายไป
- เข้า URL hash โดยตรง (เช่น `#about`) → redirect กลับ home อัตโนมัติ
- `projects: false` → ซ่อน Recent Projects ในหน้าแรกด้วย

## Sheets ใน data.xlsx

| Sheet | คอลัมน์หลัก |
|---|---|
| Profile | Name, Title, Intro, Bio, Location, Photo_URL (รองรับ `_TH` suffix) |
| Experience | Company, Role, Period, Description (รองรับ `_TH` suffix สำหรับ Role, Company, Description) |
| Education | School, Degree, Year |
| Certifications | Name, Issuer, Year |
| Awards | Name, Description, Year |
| Skills | Skill_Name, Level (1–5), Category (รองรับ `_TH` suffix) |
| Project | Project name, Duration, Project URL, Project overview, Roles and Responsibility, Skills and Tools, Image_Folder, YouTube, Project_Category (รองรับ `_TH` suffix) |

## Custom Pages — เพิ่มหน้าใหม่จาก xlsx

เพิ่มหน้าใหม่ที่ดึงข้อมูลจาก sheet ใน `data.xlsx` ได้โดยไม่ต้องแก้ HTML:

**ขั้นตอน:**
1. เพิ่ม sheet ใหม่ใน `data.xlsx` (เช่น `Blog` มีคอลัมน์ `Title`, `Date`, `Summary`, `URL`)
2. เพิ่ม entry ใน `customPages` ใน `config.js`:
   ```js
   customPages: [
       {
           id:        'blog',           // ใช้เป็น #hash URL และ id ของ section
           label:     { en: 'Blog', th: 'บล็อก' },
           xlsxSheet: 'Blog',           // ชื่อ sheet ใน data.xlsx
           fields: {
               title:       'Title',    // คอลัมน์ที่ใช้เป็นหัวข้อ card
               date:        'Date',     // คอลัมน์วันที่ (optional)
               description: 'Summary',  // คอลัมน์เนื้อหา (optional)
               link:        'URL',      // คอลัมน์ลิงก์ (optional)
           },
       },
   ],
   ```
3. เปิดเว็บใหม่ — หน้า Blog จะปรากฏใน nav และแสดง card จากข้อมูลใน sheet

## ฟีเจอร์

- **SPA navigation** — สลับ section ด้วย hash routing ไม่โหลดหน้าใหม่
- **Dark mode** — toggle ปุ่ม Dark/Light ในนาฟ ตรวจ system preference อัตโนมัติ บันทึกใน `localStorage`
- **Bilingual (EN/TH)** — ตรวจ `navigator.language` อัตโนมัติ สลับด้วยปุ่ม EN/TH บันทึกใน `localStorage` รองรับ Experience, Skills, Tools, Projects, Profile
- **Config Wizard** — UI สำหรับตั้งค่าเว็บ เปิด/ปิด page, จัดลำดับ nav, ควบคุม sub-section, เพิ่ม custom page ไม่ต้องแก้ code
- **Page config** — เปิด/ปิด section, จัดลำดับ nav, ซ่อน sub-section เฉพาะส่วน ได้จาก `config.js` ไฟล์เดียว
- **Custom Pages** — เพิ่มหน้าใหม่จาก xlsx sheet ใดก็ได้ แสดงเป็น card list อัตโนมัติ
- **Join QA Team** — หน้าสมัครร่วมทีม มี form เก็บชื่อ, ชื่อเล่น, วันเกิด, เบอร์โทร, ลิงค์, และความสนใจ
- **Project categories** — แบ่งเป็น Software / Game / etc. มี tab filter และแสดงจำนวน
- **Category badge** — แสดง badge สีใต้ชื่อโปรเจคเมื่ออยู่ tab "All"
- **Gallery** — รูปภาพ + YouTube video (video แสดงก่อน) มีลูกศร prev/next และ dot indicator
- **Lightbox** — คลิกรูปเพื่อขยาย ปิดด้วย Esc หรือคลิกนอกรูป
- **Contact form** — ใช้ Formspree (`@formspree/ajax`) ส่งอีเมลโดยไม่ต้องมี backend
- **Pagination** — Projects แสดง 6 รายการต่อหน้า
- **Search** — ค้นหาได้จากชื่อ, tools, overview
- **Last updated** — แสดงวันที่ push ล่าสุดจาก GitHub ท้ายหน้าแรก พร้อมข้อความแจ้งเตือนถ้าไม่มีการอัพเดทเกินกำหนด (ตั้งค่าได้ใน `config.js`)

## Microsoft Clarity

เว็บนี้ใช้ [Microsoft Clarity](https://clarity.microsoft.com/) สำหรับวิเคราะห์ visitor (heatmaps, session recordings) — ฟรี ไม่มีค่าใช้จ่าย

### การตั้งค่า

1. สร้าง project ที่ [clarity.microsoft.com](https://clarity.microsoft.com/) (ใช้ Microsoft/GitHub/Google account login)
2. ได้ Project ID มา (เป็น alphanumeric string)
3. แก้ `clarityId` ใน `config.js`:
   ```js
   clarityId: 'YOUR_CLARITY_PROJECT_ID',  // ← ใส่ ID จริงตรงนี้
   ```
4. (Optional) ตั้งเป็น `null` หรือ `''` เพื่อปิด Clarity

ตัว tracking script อยู่ใน `index.html` ใน `<head>` เรียบร้อยแล้ว เปลี่ยนแค่ `clarityId` ใน `config.js` ก็พอ

### สิ่งที่ Clarity เก็บ

- Heatmaps (click/tap, scroll)
- Session recordings (anonymous — ไม่เก็บข้อมูลส่วนตัว)
- Browser, device, country, OS metrics
- ไม่เก็บ password, credit card, หรือข้อมูลใน input fields

### Privacy

Clarity จะ mask ข้อมูล sensitive (input fields) โดยอัตโนมัติ และเป็นไปตาม [Microsoft Privacy Statement](https://privacy.microsoft.com/)

### การดู Dashboard

1. ไปที่ [clarity.microsoft.com](https://clarity.microsoft.com/) แล้ว sign in
2. เลือก project **Noppon Portfolio** จาก dashboard
3. หรือเข้าลิงก์ตรง: `https://clarity.microsoft.com/projects/view/wtfvkk0n07/`

**Dashboard หลัก** แสดง:
- **Overview** — จำนวน session, unique users, bounce rate, avg session time
- **Heatmaps** — จุดที่คน click/tap และ scroll มากที่สุดในแต่ละหน้า
- **Recordings** — session recordings (เล่นซ้ำการใช้งานจริงของ visitor)
- **Insights** — สรุปสถิติที่ Clarity วิเคราะห์ให้อัตโนมัติ เช่น rage clicks, dead clicks
- **Settings** → **IP blocking** — กันไม่ให้เก็บ session ของตัวเอง (แนะนำให้ block IP ของคุณ)

> **Tip:** ข้อมูลใช้เวลา 1–2 ชั่วโมงหลัง deploy กว่าจะเริ่มแสดงบน dashboard

## Line break ใน Excel

กด **Alt + Enter** ภายใน cell เดียวกันได้เลย ฟิลด์ที่รองรับ: Overview, Roles and Responsibility, Tools

## การรันในเครื่อง

ต้องใช้ local server (ไม่สามารถเปิด `file://` โดยตรงได้เพราะ `fetch` จะถูกบล็อก):

```bash
# Python
python -m http.server 8080

# Node.js (ถ้ามี npx)
npx serve .
```

แล้วเปิด `http://localhost:8080`

## Troubleshooting — ปัญหาที่พบบ่อยตอนรัน

### ❌ `python` ไม่ใช่คำสั่งที่รู้จัก / command not found

ยังไม่ได้ลง Python หรือ Python ไม่อยู่ใน PATH

**วิธีแก้:**
- **Windows**: โหลดจาก [python.org](https://www.python.org/downloads/) แล้วติ๊ก "Add Python to PATH" ตอนติดตั้ง
- **macOS**: ลงผ่าน Homebrew `brew install python` หรือโหลดจาก python.org
- ลองใช้ `python3` แทน `python`:
  ```bash
  python3 -m http.server 8080
  ```

---

### ❌ `Error: [Errno 10048]` (Windows) / `Address already in use` (macOS/Linux)

Port `8080` ถูกโปรแกรมอื่นใช้อยู่แล้ว

**วิธีแก้:**
- เปลี่ยนไปใช้ port อื่น เช่น `8000`, `3000`, `5500`:
  ```bash
  python -m http.server 5500
  ```
- หรือหา process ที่ใช้ port อยู่แล้วปิด:
  - **Windows (PowerShell):**
    ```powershell
    netstat -ano | findstr :8080
    taskkill /PID <PID> /F
    ```
  - **macOS/Linux:**
    ```bash
    lsof -i :8080
    kill -9 <PID>
    ```

---

### ❌ หน้าเว็บโหลดแต่ข้อมูลไม่แสดง / `data.xlsx` อ่านไม่เจอ

สาเหตุส่วนใหญ่เกิดจาก `xlsx` library ไม่ได้ถูกติดตั้ง เพราะ `data.xlsx` ต้องใช้ `xlsx` (CDN) ในการ parse — ตัว CDN โหลดจาก `cdn.sheetjs.com` โดยอัตโนมัติอยู่แล้ว

**วิธีแก้:**
- เช็ค browser console (F12 → Console) ว่ามี error อะไร
- ถ้า CDN ของ SheetJS โดนบล็อก (เช่น firewall บริษัท) ให้รัน `npm install` เพื่อลง package ในเครื่อง แล้วแก้ script ให้ import จาก `node_modules` แทน
- ถ้า `data.xlsx` พังหรือเปิดไม่ได้ → ระบบจะ fallback ไปใช้ `data.js` โดยอัตโนมัติ ตรวจสอบว่า `data.js` มีข้อมูลครบ
- ลอง regenerate ไฟล์ `data.xlsx` ใหม่ถ้าไฟล์เสียหาย

---

### ❌ `npx` / Node.js ไม่ติดตั้ง

ต้องใช้ Node.js สำหรับรัน `npx serve .` หรือ `node generate-manifest.js` เป็นต้น

**วิธีแก้:**
- โหลด Node.js LTS จาก [nodejs.org](https://nodejs.org/)
- หรือใช้ Python server แทน (ไม่ต้องลง Node.js):
  ```bash
  python -m http.server 8080
  ```

---

### ❌ รูปภาพไม่โหลด / manifest.json โหลดไม่เจอ

`images/manifest.json` อาจจะยังไม่ถูกสร้าง หรือไม่อัพเดทหลังจากเพิ่มรูป

**วิธีแก้:**
```bash
node generate-manifest.js
```
ถ้าไม่มี Node.js → สร้างไฟล์ `images/manifest.json` เองตาม format:
```json
{
  "project-folder": ["001.png", "002.png", "logo.png"]
}
```

---

### ❌ Contact form / Join form ส่งไม่ได้

Formspree อาจมี limit (ฟรี 50 ส่ง/เดือน) หรือ Form ID เปลี่ยน

**วิธีแก้:**
- เช็ค quota ที่ [formspree.io](https://formspree.io/) → dashboard
- เช็ค Form ID ใน source code ว่าตรงกับใน [Formspree dashboard](https://formspree.io/)
- ดู browser console (F12) ว่ามี network error ตอน submit หรือไม่

---

### ❌ หน้าไม่เปลี่ยนภาษา (EN/TH)

ภาษาเริ่มต้นเช็คจาก `navigator.language` ของ browser

**วิธีแก้:**
- ลองคลิกปุ่ม EN/TH ใน nav bar เพื่อสลับภาษาเอง
- เคลียร์ `localStorage` — browser อาจจำค่าภาษาเดิมไว้ (F12 → Application → Local Storage → ลบ key `lang`)
- เช็คว่าเบราว์เซอร์ตั้งค่าภาษาไว้ที่อะไร (Chrome: Settings → Languages)

---

### ❌ Microsoft Clarity ไม่ทำงาน / ไม่มีข้อมูล

**วิธีแก้:**
- เช็คว่า `clarityId` ใน `config.js` ไม่ใช่ `null` หรือค่าว่าง
- ข้อมูลใช้เวลา 1–2 ชั่วโมงหลัง deploy กว่าจะแสดงบน dashboard
- ถ้าใช้ ad blocker (เช่น uBlock Origin) → อาจบล็อก Clarity script ลองปิด ad blocker ทดสอบ
- เช็ค browser console ว่ามี error `clarity is not defined` หรือไม่

## อัพเดทข้อมูล

### เพิ่ม/แก้ข้อมูลทั่วไป
แก้ใน `data.xlsx` โดยตรง แล้ว refresh browser

### เพิ่มรูปโปรเจค
1. สร้าง folder ใน `images/<ชื่อ folder>/`
2. วางรูปลงไป (ชื่อ `logo.png` จะถูกแยกไปแสดงเป็น logo)
3. รัน `node generate-manifest.js` เพื่ออัพเดท manifest

### เพิ่มคำแปลภาษาไทยให้โปรเจค
แก้ไข `translations` object ใน `translate-projects.js` แล้วรัน:
```bash
node translate-projects.js
```

### กำหนด category โปรเจค
แก้ไข `categories` object ใน `categorize-projects.js` แล้วรัน:
```bash
node categorize-projects.js
```

## Formspree Forms

| Form | ID | ใช้สำหรับ |
|---|---|---|
| Contact | `xykloarz` | ฟอร์มติดต่อในหน้าแรก |
| Join QA Team | `xlgavrqr` | ฟอร์มสมัครร่วมทีม |

## Deploy

Static site — deploy ได้กับทุก platform เช่น GitHub Pages, Netlify, Vercel, Render
