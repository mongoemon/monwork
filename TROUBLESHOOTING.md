# Troubleshooting — ปัญหาที่พบบ่อย

แก้ปัญหาที่พบบ่อยตอนรันและใช้งานเว็บ portfolio (กลับไปที่ [README](README.md))

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

`images/manifest.json` อาจจะยังไม่ถูกสร้าง หรือไม่อัพเดทหลังจากเพิ่มรูป หรือ **ไม่มี entry ใหม่ที่เพิ่มเข้ามา**

**วิธีแก้:**

1. **ถ้าเพิ่มโปรเจคใหม่:**
   ```bash
   node generate-manifest.js
   ```

2. **ถ้าเพิ่มรูปใน folder ที่มีอยู่แล้ว:**
   - ตรวจสอบว่า `images/manifest.json` มี entry ของ folder นั้นหรือไม่
   - ถ้าไม่มี → เพิ่มเข้าไป:
   ```json
   {
     "project-folder": ["001.png", "002.png", "logo.png"]
   }
   ```
   - รีเฟรช browser

3. **ถ้าไม่มี Node.js** → สร้างไฟล์ `images/manifest.json` เองตาม format ด้านบน

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

### ❌ ภาพโปรเจคเฉพาะที่ไม่แสดง (เช่น Asia Cement)

โปรเจคนั้นมีรูปใน folder `images/<folder>/` แต่ไม่แสดงบนเว็บ

**วิธีแก้:**
1. เปิดไฟล์ `images/manifest.json`
2. ตรวจสอบว่ามี entry ของ folder นั้นหรือไม่
   ```json
   {
     "asiacement": ["logo.jpg"],  // ← ต้องมี entry แบบนี้
     "another-project": [...]
   }
   ```
3. ถ้าไม่มี → เพิ่มเข้าไป:
   ```json
   "asiacement": ["logo.jpg", "001.png", "002.png"],
   ```
4. เซฟและรีเฟรช browser

---

### ❌ Microsoft Clarity ไม่ทำงาน / ไม่มีข้อมูล

**วิธีแก้:**
- เช็คว่า `clarityId` ใน `config.js` ไม่ใช่ `null` หรือค่าว่าง
- ข้อมูลใช้เวลา 1–2 ชั่วโมงหลัง deploy กว่าจะแสดงบน dashboard
- ถ้าใช้ ad blocker (เช่น uBlock Origin) → อาจบล็อก Clarity script ลองปิด ad blocker ทดสอบ
- เช็ค browser console ว่ามี error `clarity is not defined` หรือไม่
