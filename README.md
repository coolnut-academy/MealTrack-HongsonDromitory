<div align="center">

  <img src="Hs_logo_mid.png" alt="ตราโรงเรียนห้องสอนศึกษา" width="120" height="120">

  # 🍱 ระบบจัดเก็บเมนูอาหารกลางวันและนักเรียนพักนอน
  ### Meal Track System - Hongson Dormitory
  **โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์สมเด็จพระเจ้าภคินีเธอ เจ้าฟ้าเพชรรัตนราชสุดา สิริโสภาพัณณวดี**

  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-sheets&logoColor=white)](https://developers.google.com/apps-script)
  [![Status](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)]()

</div>

---

## 📖 เกี่ยวกับโปรเจกต์ (About Project)

**ระบบจัดเก็บเมนูอาหารกลางวันและนักเรียนพักนอน** พัฒนาขึ้นเพื่อช่วยบริหารจัดการ บันทึก รายการเมนูอาหาร วัตถุดิบ และคำนวณงบประมาณค่าใช้จ่ายประจำวันของนักเรียนหอพักนอนและนักเรียนรับประทานอาหารกลางวัน โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ โดยเชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Google Apps Script (GAS) ทำให้สามารถบันทึกข้อมูลได้อย่างรวดเร็ว แม่นยำ และเรียกดูรายงานสถิติย้อนหลังได้สะดวกทุกที่ทุกเวลา

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 🔒 1. ระบบยืนยันตัวตนและความปลอดภัย (Passcode Protection)
- **ระบบรักษาความปลอดภัยแบบ Passcode**: ป้องกันบุคคลภายนอกเข้าถึงหรือแก้ไขข้อมูล
- **Toggle Password Visibility**: ปุ่มเปิด/ปิดการแสดงรหัสผ่านขณะพิมพ์
- **Offline Auth Fallback**: ระบบรองรับการตรวจสอบรหัสผ่านสำรองในกรณีฉุกเฉินหรือสัญญาณเครือข่ายขัดข้อง

### 📅 2. ปฏิทินแสดงผลมื้ออาหาร (Interactive Meal Calendar)
- **Grid Calendar View**: มุมมองปฏิทินรายเดือน แสดงสถานะการบันทึกอาหารครบทั้ง 3 มื้อ (เช้า, กลางวัน, เย็น)
- **Agenda List View (Mobile Optimized)**: มุมมองรายการการกินอาหาร ปรับเปลี่ยนรูปแบบอัตโนมัติบนสมาร์ทโฟน
- **Status Badges**: ระบบแสดงสัญลักษณ์สถานะความสมบูรณ์ของการบันทึกข้อมูลในแต่ละวัน (สมบูรณ์ / ยังไม่ครบ / ยังไม่มีข้อมูล)
- **Month Navigation**: ระบบสลับเดือนและปุ่มลัดย้อนกลับมา "เดือนปัจจุบัน" ได้รวดเร็ว

### 🍲 3. ระบบบันทึกเมนูและคำนวณวัตถุดิบ (Meal & Ingredient Management)
- **แยกมื้ออาหารชัดเจน**: มื้อเช้า, มื้อกลางวัน และมื้อเย็น
- **รายละเอียดเมนู**: กำหนดชื่อเมนูอาหารหลัก และเพิ่มรายการวัตถุดิบย่อย (Dynamic Ingredients List)
- **คำนวณราคาทันที (Real-time Calculation)**: ระบุปริมาณ, หน่วยนับ และราคาต่อหน่วย ระบบจะคำนวณยอดเงินรวมให้อัตโนมัติ
- **CRUD Operations**: เพิ่ม, แก้ไข และลบรายการอาหารได้สะดวก

### 📊 4. สรุปสถิติและรายงานงบประมาณ (Analytics & Reports)
- **ช่วงเวลารายงานยืดหยุ่น**: สามารถเลือกดูสถิติตาม **วันนี้, สัปดาห์นี้, เดือนนี้, ปีนี้** หรือกำหนดช่วงวันที่ (Custom Date Range)
- **คำนวณงบประมาณที่ได้รับจัดสรรอัตโนมัติ**: เปรียบเทียบค่าใช้จ่ายจริงกับงบประมาณรวมตามจำนวนวันที่ลงบันทึก
- **แจกแจงค่าใช้จ่ายตามมื้อ**: แสดงยอดเงินรวมแยกตามมื้อเช้า, มื้อกลางวัน และมื้อเย็น พร้อมสัดส่วนค่าใช้จ่าย

### 📥 5. การส่งออกข้อมูล (Data Export)
- **Export to CSV**: รองรับการดาวน์โหลดสรุปข้อมูลมื้ออาหารและค่าใช้จ่ายออกมาเป็นไฟล์ CSV (UTF-8 BOM) เพื่อนำไปใช้งานต่อใน Microsoft Excel หรือ Google Sheets โดยภาษาไทยไม่ต่าง

---

## 💰 สูตรคำนวณงบประมาณประจำวัน (Daily Budget Rate)

งบประมาณอาหารกลางวันและนักเรียนพักนอน คำนวณจากอัตราค่าอาหารนักเรียน 2 กลุ่ม ดังนี้:

$$ \text{งบประมาณรวมต่อวัน} = (86 \text{ คน} \times 40 \text{ บาท}) + (39 \text{ คน} \times 60 \text{ บาท}) = 3,440 + 2,340 = 5,780 \text{ บาท/วัน} $$

*หมายเหตุ: สามารถปรับเปลี่ยนอัตราค่าอาหารได้ที่ [js/config.js](file:///d:/MealTrack-HongsonDromitory/js/config.js)*

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนประกอบ (Component) | เทคโนโลยี (Technology) | รายละเอียด (Description) |
| :--- | :--- | :--- |
| **Frontend** | HTML5 / JavaScript (ES6+) | สถาปัตยกรรมแบบ Modular JavaScript (`API`, `App`, `Calendar`, `Stats`, `UI`) |
| **Styling Framework** | Tailwind CSS | ตกแต่งหน้าจอด้วย utility-first CSS Framework (ผ่าน CDN) |
| **Custom Styling** | CSS3 Glassmorphism | [styles.css](file:///d:/MealTrack-HongsonDromitory/css/styles.css) เอฟเฟกต์กระจกใส การเคลื่อนไหว (Animations) และ Responsive Layout |
| **Icons & Fonts** | FontAwesome 6 & Sarabun Font | แสดงผลไอคอนทันสมัย และฟอนต์ภาษาไทยอ่านง่ายจาก Google Fonts |
| **Backend & DB** | Google Apps Script (GAS) | พัฒนาเป็น Web App API รับ-ส่งข้อมูลแบบ JSON กับ Google Sheets |

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory)

```struct
MealTrack-HongsonDromitory/
├── 📄 index.html            # หน้าหลักของระบบ (HTML Structure & Modals)
├── 🖼️ Hs_logo_mid.png       # โลโก้ประจำโรงเรียนห้องสอนศึกษาฯ
├── 📄 README.md             # เอกสารอธิบายโปรเจกต์และวิธีใช้งาน
├── 📂 css/
│   └── 🎨 styles.css        # CSS ตกแต่งเพิ่มเติม, เอฟเฟกต์ Glassmorphism และ Toast
└── 📂 js/
    ├── ⚙️ config.js         # ค่าคอนฟิกกลาง (API URL, อัตรงบประมาณ, ชื่อเดือนภาษาไทย)
    ├── 🔌 api.js            # โมดูลเชื่อมต่อ Google Apps Script API & Fallback Auth
    ├── 🚀 app.js            # คอนโทรลเลอร์หลักของระบบ (Init & Authentication)
    ├── 📅 calendar.js       # ระบบประมวลผลและวาดตารางปฏิทิน (Grid & Agenda View)
    ├── 🍱 mealModal.js      # ระบบจัดการฟอร์มลงรายการอาหารและคำนวณวัตถุดิบ
    ├── 📊 stats.js          # ระบบคำนวณรายงานสถิติ และการส่งออก CSV
    └── 🛠️ ui.js             # ตัวช่วยจัดการ UI (Toast Alert, Modal Management)
```

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. การใช้งานบนเครื่อง Local / Web Server
1. Clone หรือ Download โปรเจกต์นี้ลงในเครื่องของคุณ:
   ```bash
   git clone https://github.com/coolnut-academy/MealTrack-HongsonDromitory.git
   ```
2. เปิดโฟลเดอร์โปรเจกต์ด้วย Code Editor เช่น VS Code
3. เปิดใช้งานผ่าน Web Server (เช่น **Live Server** ใน VS Code) หรือเปิดไฟล์ `index.html` ผ่าน Web Browser ที่รองรับ HTML5

### 2. การเชื่อมต่อ Backend (Google Apps Script)
1. สร้าง Google Sheets สำหรับเก็บข้อมูลรายการอาหาร
2. เขียนโค้ด Google Apps Script (GAS) เพื่อรองรับ `doPost` ตาม Action:
   - `verify_passcode`
   - `get_month_data`
   - `save_meal_record`
   - `delete_meal_record`
3. ทำการ Deploy เป็น Web App แล้วนำ URL มาวางที่ `API_URL` ในไฟล์ [js/config.js](file:///d:/MealTrack-HongsonDromitory/js/config.js)

---

## ⚙️ การตั้งค่าระบบ (Configuration Options)

สามารถตั้งค่าเบื้องต้นได้ที่ไฟล์ [js/config.js](file:///d:/MealTrack-HongsonDromitory/js/config.js):

```javascript
const CONFIG = {
    // URL ของ Google Apps Script Web App
    API_URL: "https://script.google.com/macros/s/.../exec",

    // อัตราการคำนวณงบประมาณประจำวัน (บาท/วัน)
    DAILY_BUDGET_RATE: 5780,

    // คีย์สำหรับเก็บบันทึกสถานะการเข้าสู่ระบบใน LocalStorage
    STORAGE_AUTH_KEY: "meal_tracker_auth"
};
```

---

## 👨‍💻 ผู้พัฒนา (Developer Information)

<div align="center">

  <img src="Hs_logo_mid.png" width="80" alt="Logo">

  ### **นายสาธิต ศิริวัชน์ (COOLNUT)**
  **ตำแหน่ง:** ผู้พัฒนาระบบเทคโนโลยีสารสนเทศ  
  **หน่วยงาน:** โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ จังหวัดแม่ฮ่องสอน  
  *สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาแม่ฮ่องสอน*

</div>

---

## 📄 ลิขสิทธิ์และสิทธิ์การใช้งาน (License)

สงวนลิขสิทธิ์ © 2026 **โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์สมเด็จพระเจ้าภคินีเธอ เจ้าฟ้าเพชรรัตนราชสุดา สิริโสภาพัณณวดี**  
พัฒนาขึ้นเพื่อใช้งานภายในสถานศึกษาและส่งเสริมการบริหารจัดการโภชนาการนักเรียนอย่างมีประสิทธิภาพ
