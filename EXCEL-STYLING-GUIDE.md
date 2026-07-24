# Excel Styling & Column Width Management

ระบบการบันทึกและคืนค่า styling ของ Excel files อัตโนมัติ

## 🎯 วิธีการทำงาน

เมื่อแก้ไข `data.xlsx` ผ่าน Claude:
1. ✅ Styling information จะถูกบันทึกไว้ในไฟล์ `.excel-styling.json`
2. ✅ ทุกครั้งที่แก้ไข Excel จะ restore styling อัตโนมัติ
3. ✅ Column widths และ header formatting จะรักษาไว้ได้

## 📋 Scripts ที่ใช้

### `preserve-excel-styling.py`
บันทึก styling ของ Excel ปัจจุบัน
```bash
python3 preserve-excel-styling.py data.xlsx
```

### `restore-excel-styling.py`
คืนค่า styling จากไฟล์ JSON
```bash
python3 restore-excel-styling.py data.xlsx
```

## ⚙️ การตั้งค่า

ระบบนี้ทำงานอัตโนมัติผ่าน Claude hook ใน `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "if [[ \"$FILE_PATH\" == *\"data.xlsx\" ]]; then python3 restore-excel-styling.py \"$FILE_PATH\" 2>/dev/null || true; fi",
        "description": "Auto-restore Excel styling after data.xlsx edits"
      }
    ]
  }
}
```

## 📝 ขั้นตอนเมื่อเปลี่ยน Schema ของ Excel

ถ้าเพิ่มหรือลบ columns:

1. **ปรับ Excel structure** (add/delete columns)
2. **อัปเดต styling info**:
   ```bash
   python3 preserve-excel-styling.py data.xlsx
   ```
3. **Commit files**:
   ```bash
   git add data.xlsx .excel-styling.json
   git commit -m "Update data.xlsx structure and styling"
   ```

## 🔍 เนื้อหา `.excel-styling.json`

```json
{
  "Project": {
    "column_widths": {
      "A": 12.66,
      "B": 12.16,
      ...
    },
    "row_heights": {},
    "header_styles": {
      "A1": {
        "fill": "FFFFC000",
        "font_bold": true,
        "font_size": 11,
        ...
      }
    }
  }
}
```

## ✨ Styling ที่จะรักษาไว้

- ✅ Column widths
- ✅ Row heights
- ✅ Header fill colors
- ✅ Font (name, size, bold, italic, color)
- ✅ Text alignment
- ✅ Borders
- ✅ Number formatting

## ⚠️ ข้อจำกัด

- Styling จะคืนค่าให้ **header row (row 1)** เท่านั้น
- อื่นๆ cells ที่ไม่ใช่ header จะคงไว้ตามที่ Excel นั้นมีอยู่
- ถ้าต้องการเพิ่ม styling ให้ cells อื่น ให้เพิ่มใน `preserve-excel-styling.py`

## 🚀 เมื่อต้องการจัดการ Styling โดยตรง

1. ปรับแต่ง Excel ด้วย Excel/Sheets
2. บันทึกด้วย:
   ```bash
   python3 preserve-excel-styling.py data.xlsx
   ```
3. ทำให้ commit files
