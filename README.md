<div align="center">

  <img src="Hs_logo_mid.png" alt="ตราโรงเรียนห้องสอนศึกษา" width="120" height="120">

  # 🍱 ระบบจัดเก็บข้อมูลเมนูอาหารหอพักนักเรียน
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

**ระบบจัดเก็บข้อมูลเมนูอาหารหอพักนักเรียน** พัฒนาขึ้นเพื่อช่วยบริหารจัดการ บันทึก รายการเมนูอาหาร วัตถุดิบ คำนวณปริมาณวัตถุดิบและเครื่องปรุงสะสมรายเดือน และคำนวณงบประมาณค่าใช้จ่ายประจำวันของนักเรียนหอพักนอนและนักเรียนรับประทานอาหารกลางวัน โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ โดยเชื่อมต่อฐานข้อมูล Google Sheets ผ่าน Google Apps Script (GAS) ทำให้สามารถบันทึกข้อมูลได้อย่างรวดเร็ว แม่นยำ และเรียกดูรายงานสถิติตลอดจนสรุปปริมาณวัตถุดิบประกอบอาหารย้อนหลังได้สะดวกทุกที่ทุกเวลา

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 🏷️ 1. ระบบจัดการราคากลางวัตถุดิบรายเดือน (Monthly Standard Pricing & Cloud Sync)
- **จัดการราคากลางแยกตามเดือน+ปี พ.ศ.**: ฝังราคากลางวัตถุดิบเริ่มต้น 72 รายการจากไฟล์ Excel (`ราคากลาง-ผัก-ผลไม้-เครื่องปรุง-2569.xlsx`) แยกตาม 4 หมวดหมู่ (แก๊สหุงต้ม, อาหารสด, ผักสดและผลไม้, อาหารแห้ง/เครื่องปรุง)
- **Auto Clone & Recovery**: เมื่อสร้างเดือนใหม่ ระบบจะคัดลอกราคากลางจากเดือนก่อนหน้าให้อัตโนมัติ พร้อมระบบ `mergeWithDefaults()` ป้องกันข้อมูลสูญหาย
- **Autocomplete & Search Relevance**: พิมพ์ค้นหาวัตถุดิบ (เช่น "ไก่", "หมู", "มะ") ระบบจะแนะนำรายการพร้อมราคากลางต่อหน่วย และจัดอันดับตามความตรงของคำค้นหา
- **Auto Price Propagation**: ปรับเปลี่ยนราคากลางเดือนใด รายการอาหารที่เคยบันทึกไว้ในเดือนนั้นจะอัปเดตราคาต่อหน่วยและคำนวณยอดเงินรวมใหม่ให้อัตโนมัติ
- **Item Metadata Helper**: ดึงข้อมูลหน่วยนับมาตรฐาน (กก., ขวด, ถัง, ซอง ฯลฯ) หมวดหมู่ และไอคอนมาใช้อ้างอิงในระบบให้อัตโนมัติ
- **Multi-Device Cloud Sync**: ซิงค์ข้อมูลราคากลางรายเดือนกับ Google Sheets แบบเรียลไทม์ รองรับการทำงานจากหลายอุปกรณ์พร้อมกัน

### 🔒 2. ระบบยืนยันตัวตนและความปลอดภัย (Passcode Protection)
- **ระบบรักษาความปลอดภัยแบบ Passcode**: ป้องกันบุคคลภายนอกเข้าถึงหรือแก้ไขข้อมูล
- **Toggle Password Visibility**: ปุ่มเปิด/ปิดการแสดงรหัสผ่านขณะพิมพ์
- **Offline Auth Fallback**: ระบบรองรับการตรวจสอบรหัสผ่านสำรองในกรณีฉุกเฉินหรือสัญญาณเครือข่ายขัดข้อง

### 📅 3. ปฏิทินแสดงผลมื้ออาหาร (Interactive Meal Calendar & Direct Badges)
- **แสดงชื่อเมนูทุกมื้อลงบนปฏิทินทันที**: แสดงป้ายชื่อเมนูแยกตามมื้อบนช่องวันที่ (🌅 **เช้า**, ☀️ **เที่ยง**, 🌙 **เย็น**) สามารถดูเมนูได้ทันทีโดยไม่ต้องคลิกเข้าไปดู
- **Grid & Agenda List View**: มุมมองปฏิทินแบบตาราง และมุมมองแบบรายการ (Mobile Optimized)
- **Detail Hover Popup**: เมื่อเลื่อนเมาส์ชี้บนช่องวันที่ ระบบจะแสดง Popup การ์ดสีเข้ม สรุปเมนูอาหารและยอดเงินรวมของทั้ง 3 มื้อ
- **Month Navigation**: ระบบสลับเดือนและปุ่มลัดย้อนกลับมา "เดือนปัจจุบัน" ได้รวดเร็ว

### 🍲 4. ระบบบันทึกเมนูและคำนวณวัตถุดิบ (Meal & Ingredient Management)
- **กำหนดมื้อเริ่มต้นเป็นมื้อเช้า**: เมื่อกดเปิดฟอร์มบันทึกอาหาร ระบบจะเริ่มต้นที่แท็บ **🌅 มื้อเช้า** ให้อัตโนมัติ
- **ย่อชื่อมื้ออาหาร**: ใช้คำว่า **มื้อเช้า**, **มื้อเที่ยง** และ **มื้อเย็น** เพื่อความกระชับและอ่านง่าย
- **คำนวณราคาทันที (Real-time Calculation)**: คำนวณยอดเงินรวมวัตถุดิบและยอดรวมประจำมื้ออัตโนมัติ
- **CRUD Operations**: เพิ่ม, แก้ไข และลบรายการอาหารได้อย่างรวดเร็ว

### 📊 5. สรุปสถิติและรายงานวัตถุดิบและเครื่องปรุงรายเดือน (Analytics & Ingredient Summary)
- **Tab Switcher สลับมุมมองรายงาน**:
  - 📊 **สรุปงบประมาณค่าใช้จ่าย**: สรุปยอดเงินรวมค่าใช้จ่ายจริงเทียบงบประมาณจัดสรร และสัดส่วนแยกตามมื้ออาหาร (เช้า, เที่ยง, เย็น)
  - 📦 **สรุปปริมาณวัตถุดิบ & เครื่องปรุง**: สรุปปริมาณและมูลค่าวัตถุดิบที่ใช้จริงสะสมรายรายการ
- **การ์ดสรุปวัตถุดิบหลัก (Key Highlight Cards)**:
  - 🌾 **รวมข้าวสารทั้งหมด (กก.)**: สรุปยอดกิโลกรัมข้าวสารที่ใช้จริง พร้อมคำนวณจำนวนกระสอบโดยสังเขป
  - 🐖 **กลุ่มเนื้อหมูรวม (กก.)**: รวบรวมผลรวมวัตถุดิบกลุ่มหมูทั้งหมด (หมูบด, หมูสับ, หมูสด, กระดูกหมู) มารวมกิโลกรัมและมูลค่ารวมในการ์ดเดียว
  - 🐓 **กลุ่มเนื้อไก่รวม (กก.)**: รวบรวมผลรวมวัตถุดิบกลุ่มไก่ทั้งหมด (ไก่บด, ไก่สับ, ไก่ชิ้น) มารวมกิโลกรัมและมูลค่ารวมในการ์ดเดียว
  - 🧂 **รวมเครื่องปรุงและอาหารแห้ง**: สรุปยอดรวมจำนวนชนิดเครื่องปรุงที่ใช้ และมูลค่ารวมเครื่องปรุงทั้งหมด
- **ตารางสรุปรายละเอียดวัตถุดิบสะสม (Detailed Consumption Table)**:
  - แสดงตารางรวมรายการวัตถุดิบทุกชนิด พร้อมระบุชื่อรายการ, หมวดหมู่, ปริมาณรวม, หน่วยนับมาตรฐาน, มูลค่ารวม (บาท), และ % สัดส่วนงบวัตถุดิบ
  - **การจัดกลุ่มโปร่งใส**: แสดงแยกบรรทัดตามชื่อวัตถุดิบจริง (เช่น "หมูบด", "หมูสับ", "เนื้อหมูสด")
- **ระบบกรองข้อมูลและค้นหา (Filter & Search Bar)**:
  - กรองตามหมวดหมู่: `[ทั้งหมด]`, `[🌾 ข้าวสาร & เนื้อสัตว์]`, `[🧂 เครื่องปรุง & อาหารแห้ง]`, `[🥬 ผัก & ผลไม้]`, `[🔥 แก๊สหุงต้ม]`
  - ค้นหาชื่อวัตถุดิบแบบ Real-time
- **ปุ่มทางลัดบน Header Navbar**: ปุ่ม "สรุปวัตถุดิบ" สำหรับเปิดดูรายงานวัตถุดิบได้ทันทีใน 1 คลิก

### 📥 6. การส่งออกข้อมูลและการพิมพ์รายงาน (Data Export & Report Printing)
- **Export to CSV (Excel Ready)**: ดาวน์โหลดสรุปข้อมูลมื้ออาหาร และ **ตารางสรุปปริมาณวัตถุดิบสะสมรายรายการ** เป็นไฟล์ CSV เข้ารหัส **UTF-8 with BOM (`\uFEFF`)** รองรับการเปิดด้วย Microsoft Excel ภาษาไทย 100% ภาษาไม่เป็นตัวต่างดาว
- **Print PDF (A4 Print Ready)**: จัดวางเลย์เอาต์ Print CSS (`@media print`) สำหรับพิมพ์รายงาน A4 พร้อมตราโรงเรียน หัวข้อรายงาน และช่องสรุปผลสำหรับยื่นฝ่ายจัดซื้อและผู้บริหาร

---

## 💰 สูตรคำนวณงบประมาณประจำวัน (Daily Budget Rate)

งบประมาณอาหารกลางวันและนักเรียนพักนอน คำนวณจากอัตราค่าอาหารนักเรียน 2 กลุ่ม ดังนี้:

$$ \text{งบประมาณรวมต่อวัน} = (86 \text{ คน} \times 40 \text{ บาท}) + (39 \text{ คน} \times 60 \text{ บาท}) = 3,440 + 2,340 = 5,780 \text{ บาท/วัน} $$

*หมายเหตุ: สามารถปรับเปลี่ยนอัตราค่าอาหารได้ที่ [js/config.js](file:///d:/MealTrack-HongsonDromitory/js/config.js)*

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนประกอบ (Component) | เทคโนโลยี (Technology) | รายละเอียด (Description) |
| :--- | :--- | :--- |
| **Frontend** | HTML5 / JavaScript (ES6+) | สถาปัตยกรรมแบบ Modular JavaScript (`StandardPrices`, `MealModal`, `Calendar`, `Stats`, `API`, `UI`, `App`) |
| **Styling Framework** | Tailwind CSS | ตกแต่งหน้าจอด้วย utility-first CSS Framework |
| **Custom Styling** | CSS3 Glassmorphism & Print CSS | [styles.css](file:///d:/MealTrack-HongsonDromitory/css/styles.css) เอฟเฟกต์กระจกใส Autocomplete, Toast, Highlight Cards และ @media print สำหรับรายงาน A4 |
| **Icons & Fonts** | FontAwesome 6 & Sarabun Font | แสดงผลไอคอนทันสมัย และฟอนต์ภาษาไทยอ่านง่ายจาก Google Fonts |
| **Backend & DB** | Google Apps Script (GAS) | พัฒนาเป็น Web App API รับ-ส่งข้อมูลแบบ JSON กับ Google Sheets |

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory)

```struct
MealTrack-HongsonDromitory/
├── 📄 index.html            # หน้าหลักของระบบ (Navbar Shortcuts, Tabbed Stats Modal & Tables)
├── 🖼️ Hs_logo_mid.png       # โลโก้ประจำโรงเรียนห้องสอนศึกษาฯ
├── 📄 README.md             # เอกสารอธิบายโปรเจกต์และวิธีใช้งาน
├── 📂 css/
│   └── 🎨 styles.css        # CSS ตกแต่งเพิ่มเติม, Glassmorphism, Autocomplete, Toast & Print A4 CSS
└── 📂 js/
    ├── ⚙️ config.js         # ค่าคอนฟิกกลาง (API URL, อัตรงบประมาณ, ชื่อเดือนภาษาไทย)
    ├── 🔌 api.js            # โมดูลเชื่อมต่อ Google Apps Script API (Meal Records & Standard Prices)
    ├── 🏷️ standardPrices.js # โมดูลจัดการราคากลางวัตถุดิบรายเดือน, Autocomplete, Item Metadata & Auto-Recovery
    ├── 🚀 app.js            # คอนโทรลเลอร์หลักของระบบ (Init & Authentication)
    ├── 📅 calendar.js       # ระบบประมวลผลและวาดตารางปฏิทิน (Direct Badges & Detail Tooltip)
    ├── 🍱 mealModal.js      # ระบบจัดการฟอร์มลงรายการอาหารและคำนวณวัตถุดิบ
    ├── 📊 stats.js          # ระบบประมวลผลสถิติ, สรุปปริมาณวัตถุดิบรายเดือน, ตัวกรองหมวดหมู่ & Export CSV
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
2. เขียนโค้ด Google Apps Script (GAS) เพื่อรองรับ `doGet` และ `doPost` ตาม Action:
   - `verify_passcode`
   - `get_month_data`
   - `save_meal_record`
   - `delete_meal_record`
   - `get_standard_prices`
   - `save_standard_prices`
3. ตั้งค่าสิทธิ์ Deploy: **Execute as: `Me`**, **Who has access: `Anyone`**
4. นำ URL ที่ได้มาวางที่ `API_URL` ในไฟล์ [js/config.js](file:///d:/MealTrack-HongsonDromitory/js/config.js)

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
