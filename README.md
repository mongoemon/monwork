# Noppon Mongkonnimit — Portfolio

เว็บ portfolio ส่วนตัว สร้างด้วย HTML/CSS/JS ล้วน ข้อมูลทั้งหมดเก็บใน `data.xlsx`

## โครงสร้างไฟล์

```
portfolio4/
├── index.html              # โครงสร้างหน้าเว็บ
├── style.css               # สไตล์ทั้งหมด
├── script.js               # logic หลัก (navigation, render, i18n, gallery)
├── config.js               # ตั้งค่า page visibility และ nav order
├── data.js                 # mock data สำรอง (ใช้ถ้า data.xlsx โหลดไม่ได้)
├── data.xlsx               # แหล่งข้อมูลหลัก (ดูรายละเอียด sheet ด้านล่าง)
├── images/
│   ├── manifest.json       # รายชื่อไฟล์รูปในแต่ละ folder (generate จาก script)
│   └── <ProjectFolder>/    # รูปภาพแต่ละโปรเจค (logo.png + ภาพอื่นๆ)
├── generate-manifest.js    # สร้าง images/manifest.json ใหม่
├── add-bilingual.js        # เพิ่มคอลัมน์ภาษาไทยใน Profile และ Skills sheet
├── translate-projects.js   # เพิ่ม/แก้คำแปลโปรเจคใน Project sheet
└── categorize-projects.js  # กำหนด Project_Category ให้โปรเจคทั้งหมด
```

## config.js — จัดการ Pages

ไฟล์หลักสำหรับควบคุมว่าจะเปิด/ปิด section ไหน และลำดับที่แสดงใน nav bar

```js
const siteConfig = {
    pages: {
        about:    true,   // true = เปิด, false = ซ่อน
        projects: true,
        join:     true,
        contact:  true,
    }
};
```

**ลำดับของ key = ลำดับใน nav bar** — `home` ถูก pin ไว้หน้าสุดเสมอ ส่วน key ที่เหลือเรียงตามที่กำหนดในไฟล์

เมื่อตั้งเป็น `false`:
- ลิงก์ใน nav หายไป
- เข้า URL hash โดยตรง (เช่น `#about`) → redirect กลับ home อัตโนมัติ
- `projects: false` → ซ่อน Recent Projects ในหน้าแรกด้วย
- `contact: false` → ซ่อน nav link แต่ form ในหน้าแรกยังอยู่

## Sheets ใน data.xlsx

| Sheet | คอลัมน์หลัก |
|---|---|
| Profile | Name, Title, Intro, Bio, Location, Photo_URL (รองรับ `_TH` suffix) |
| Experience | Company, Role, Duration, Description |
| Education | School, Degree, Year |
| Certifications | Name, Issuer, Year |
| Awards | Name, Description, Year |
| Skills | Skill_Name, Level (1–5), Category (รองรับ `_TH` suffix) |
| Project | Project name, Duration, Project URL, Project overview, Roles and Responsibility, Skills and Tools, Image_Folder, YouTube, Project_Category (รองรับ `_TH` suffix) |

## ฟีเจอร์

- **SPA navigation** — สลับ section ด้วย hash routing ไม่โหลดหน้าใหม่
- **Dark mode** — toggle ปุ่ม Dark/Light ในนาฟ ตรวจ system preference อัตโนมัติ บันทึกใน `localStorage`
- **Bilingual (EN/TH)** — ตรวจ `navigator.language` อัตโนมัติ สลับด้วยปุ่ม EN/TH บันทึกใน `localStorage`
- **Page config** — เปิด/ปิด section และจัดลำดับ nav ได้จาก `config.js` ไฟล์เดียว
- **Join QA Team** — หน้าสมัครร่วมทีม มี form เก็บชื่อ, ชื่อเล่น, วันเกิด, เบอร์โทร, ลิงค์, และความสนใจ
- **Project categories** — แบ่งเป็น Software / Game / etc. มี tab filter และแสดงจำนวน
- **Category badge** — แสดง badge สีใต้ชื่อโปรเจคเมื่ออยู่ tab "All"
- **Gallery** — รูปภาพ + YouTube video (video แสดงก่อน) มีลูกศร prev/next และ dot indicator
- **Lightbox** — คลิกรูปเพื่อขยาย ปิดด้วย Esc หรือคลิกนอกรูป
- **Contact form** — ใช้ Formspree (`@formspree/ajax`) ส่งอีเมลโดยไม่ต้องมี backend
- **Pagination** — Projects แสดง 6 รายการต่อหน้า
- **Search** — ค้นหาได้จากชื่อ, tools, overview

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
