/**
 * Daily Export Controller (Official Daily Meal Summary PDF Report)
 * ระบบส่งออกรายงานสรุปรายการอาหารและควบคุมการใช้วัตถุดิบประจำวันฉบับทางการ
 * โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาแม่ฮ่องสอน
 */

const DailyExport = {
    selectedDate: "",

    /**
     * แปลงจำนวนเงินเป็นตัวอักษรภาษาไทย (Thai Baht Text)
     * เช่น 5925.00 -> "ห้าพันเก้าร้อยยี่สิบห้าบาทถ้วน"
     */
    bahtText(num) {
        if (isNaN(num) || num === null || num === undefined) return "ศูนย์บาทถ้วน";
        const n = Number(num).toFixed(2);
        if (n === "0.00") return "ศูนย์บาทถ้วน";

        const numbers = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
        const units = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

        const [baht, satang] = n.split(".");
        let result = "";

        function convertGroup(digits) {
            let text = "";
            const len = digits.length;
            for (let i = 0; i < len; i++) {
                const digit = parseInt(digits[i], 10);
                const pos = len - 1 - i;
                if (digit !== 0) {
                    if (pos === 1 && digit === 1) {
                        text += "สิบ";
                    } else if (pos === 1 && digit === 2) {
                        text += "ยี่สิบ";
                    } else if (pos === 0 && digit === 1 && len > 1 && digits[len - 2] !== '0') {
                        text += "เอ็ด";
                    } else {
                        text += numbers[digit] + units[pos];
                    }
                }
            }
            return text;
        }

        if (baht && baht !== "0") {
            if (baht.length > 6) {
                const mil = baht.slice(0, -6);
                const rest = baht.slice(-6);
                result += convertGroup(mil) + "ล้าน" + convertGroup(rest) + "บาท";
            } else {
                result += convertGroup(baht) + "บาท";
            }
        }

        if (satang && satang !== "00") {
            const s = parseInt(satang, 10);
            if (s > 0) {
                result += convertGroup(satang) + "สตางค์";
            } else {
                result += "ถ้วน";
            }
        } else {
            result += "ถ้วน";
        }

        return result;
    },

    /**
     * แปลงวันที่ YYYY-MM-DD เป็นข้อความภาษาไทยเต็มรูปแบบ
     * เช่น 2026-08-27 -> "วันพฤหัสบดีที่ 27 สิงหาคม พ.ศ. 2569"
     */
    formatFullThaiDate(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;

        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);

        const dateObj = new Date(y, m - 1, d);
        const dayNames = [
            "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ",
            "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"
        ];
        const dayName = dayNames[dateObj.getDay()] || "";
        const thaiMonth = (typeof CONFIG !== 'undefined' && CONFIG.THAI_MONTHS)
            ? CONFIG.THAI_MONTHS[m - 1]
            : ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"][m - 1];
        const thaiYear = y + 543;

        return `${dayName}ที่ ${d} ${thaiMonth} พ.ศ. ${thaiYear}`;
    },

    /**
     * ดึงข้อมูลรายการอาหารทั้ง 3 มื้อของวันที่ระบุ
     */
    getDayData(dateStr) {
        const mData = (typeof monthData !== 'undefined' && monthData) ? monthData : {};
        const dayEntries = mData[dateStr] || {};

        const bRec = dayEntries['มื้อเช้า'] || null;
        const lRec = dayEntries['มื้อเที่ยง'] || dayEntries['มื้อกลางวัน'] || null;
        const dRec = dayEntries['มื้อเย็น'] || null;

        const getCost = (rec) => {
            if (!rec) return 0;
            if (rec.total_cost !== undefined && rec.total_cost !== null && !isNaN(Number(rec.total_cost))) {
                return Number(rec.total_cost);
            }
            if (Array.isArray(rec.items)) {
                return rec.items.reduce((s, it) => s + (Number(it.total) || (Number(it.qty || 0) * Number(it.price || 0))), 0);
            }
            return 0;
        };

        const bCost = getCost(bRec);
        const lCost = getCost(lRec);
        const dCost = getCost(dRec);
        const totalSpent = bCost + lCost + dCost;

        const allocatedBudget = (typeof CONFIG !== 'undefined' && CONFIG.DAILY_BUDGET_RATE)
            ? CONFIG.DAILY_BUDGET_RATE
            : 5780;
        const diffBudget = allocatedBudget - totalSpent;

        return {
            dateStr,
            breakfast: bRec,
            lunch: lRec,
            dinner: dRec,
            bCost,
            lCost,
            dCost,
            totalSpent,
            allocatedBudget,
            diffBudget,
            hasData: Boolean(bRec || lRec || dRec)
        };
    },

    /**
     * เปิด Modal เลือกวันที่และส่งออกรายงานด่วน (จากหน้าปฏิทิน หรือจากหน้า MealModal)
     */
    openSelector(defaultDate = "") {
        // หากเปิดจากหน้า MealModal ให้บันทึกการแก้ไขชั่วคราวลง memory เพื่อให้สรุปแสดงผลทันที
        if (typeof MealModal !== 'undefined' && MealModal.selectedDateStr && MealModal.activeRecord && MealModal.selectedMealType) {
            const activeDate = MealModal.selectedDateStr;
            if (typeof monthData !== 'undefined') {
                if (!monthData[activeDate]) monthData[activeDate] = {};
                monthData[activeDate][MealModal.selectedMealType] = JSON.parse(JSON.stringify(MealModal.activeRecord));
            }
        }

        let targetDate = defaultDate;
        if (!targetDate) {
            const today = new Date();
            const y = today.getFullYear();
            const m = (today.getMonth() + 1).toString().padStart(2, '0');
            const d = today.getDate().toString().padStart(2, '0');
            const todayStr = `${y}-${m}-${d}`;

            if (typeof currentYear !== 'undefined' && typeof currentMonth !== 'undefined') {
                const monthStr = currentMonth.toString().padStart(2, '0');
                if (currentYear === y && currentMonth === (today.getMonth() + 1)) {
                    targetDate = todayStr;
                } else {
                    targetDate = `${currentYear}-${monthStr}-01`;
                }
            } else {
                targetDate = todayStr;
            }
        }

        this.selectedDate = targetDate;

        const inputEl = document.getElementById('dailyExportDateInput');
        if (inputEl) {
            inputEl.value = targetDate;
        }

        this.updateSelectorPreview();
        UI.openModal('dailyExportModal');
    },

    /**
     * ปิด Modal เลือกวันที่
     */
    closeSelector() {
        UI.closeModal('dailyExportModal');
    },

    /**
     * เปลี่ยนวันที่ใน Selector (+1, -1, หรือจาก input)
     */
    changeDateByDays(delta) {
        if (!this.selectedDate) return;
        const parts = this.selectedDate.split('-').map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        d.setDate(d.getDate() + delta);

        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        this.selectedDate = `${y}-${m}-${day}`;

        const inputEl = document.getElementById('dailyExportDateInput');
        if (inputEl) inputEl.value = this.selectedDate;

        this.updateSelectorPreview();
    },

    /**
     * ตั้งวันที่เป็นวันนี้
     */
    setDateToToday() {
        const today = new Date();
        const y = today.getFullYear();
        const m = (today.getMonth() + 1).toString().padStart(2, '0');
        const d = today.getDate().toString().padStart(2, '0');
        this.selectedDate = `${y}-${m}-${day}`;

        const inputEl = document.getElementById('dailyExportDateInput');
        if (inputEl) inputEl.value = this.selectedDate;

        this.updateSelectorPreview();
    },

    /**
     * อัปเดตการแสดงผลข้อมูลย่อใน Modal Selector
     */
    updateSelectorPreview() {
        const dateInput = document.getElementById('dailyExportDateInput');
        if (dateInput && dateInput.value) {
            this.selectedDate = dateInput.value;
        }

        const info = this.getDayData(this.selectedDate);
        const dateTitleEl = document.getElementById('dailyExportDateTitle');
        if (dateTitleEl) {
            dateTitleEl.innerText = this.formatFullThaiDate(this.selectedDate);
        }

        const previewContainer = document.getElementById('dailyExportPreviewCards');
        if (!previewContainer) return;

        const parseItems = (rec) => {
            if (!rec) return [];
            if (Array.isArray(rec.items)) return rec.items;
            if (typeof rec.items === 'string') {
                try { return JSON.parse(rec.items); } catch (_) { return []; }
            }
            return [];
        };

        const bItems = parseItems(info.breakfast);
        const lItems = parseItems(info.lunch);
        const dItems = parseItems(info.dinner);

        let html = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <!-- มื้อเช้า Card -->
                <div class="p-3.5 rounded-xl border ${info.breakfast ? 'border-orange-200 bg-orange-50/60' : 'border-slate-200 bg-slate-50/60'} text-xs">
                    <div class="flex items-center justify-between font-bold text-orange-900 mb-1.5 pb-1 border-b border-orange-200/60">
                        <span class="flex items-center gap-1.5"><span class="text-sm">🌅</span> มื้อเช้า</span>
                        <span class="font-mono text-orange-700 font-bold">${info.bCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                    </div>
                    <p class="font-bold text-slate-800 truncate mb-1">
                        ${info.breakfast ? escapeHtml(info.breakfast.menu_name || 'ไม่ได้ระบุชื่อเมนู') : '<span class="text-slate-400 font-normal italic">ยังไม่มีข้อมูล</span>'}
                    </p>
                    <p class="text-[11px] text-slate-500">
                        ${bItems.length > 0 ? `วัตถุดิบ ${bItems.length} รายการ` : '-'}
                    </p>
                </div>

                <!-- มื้อเที่ยง Card -->
                <div class="p-3.5 rounded-xl border ${info.lunch ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50/60'} text-xs">
                    <div class="flex items-center justify-between font-bold text-emerald-900 mb-1.5 pb-1 border-b border-emerald-200/60">
                        <span class="flex items-center gap-1.5"><span class="text-sm">☀️</span> มื้อกลางวัน</span>
                        <span class="font-mono text-emerald-700 font-bold">${info.lCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                    </div>
                    <p class="font-bold text-slate-800 truncate mb-1">
                        ${info.lunch ? escapeHtml(info.lunch.menu_name || 'ไม่ได้ระบุชื่อเมนู') : '<span class="text-slate-400 font-normal italic">ยังไม่มีข้อมูล</span>'}
                    </p>
                    <p class="text-[11px] text-slate-500">
                        ${lItems.length > 0 ? `วัตถุดิบ ${lItems.length} รายการ` : '-'}
                    </p>
                </div>

                <!-- มื้อเย็น Card -->
                <div class="p-3.5 rounded-xl border ${info.dinner ? 'border-indigo-200 bg-indigo-50/60' : 'border-slate-200 bg-slate-50/60'} text-xs">
                    <div class="flex items-center justify-between font-bold text-indigo-900 mb-1.5 pb-1 border-b border-indigo-200/60">
                        <span class="flex items-center gap-1.5"><span class="text-sm">🌙</span> มื้อเย็น</span>
                        <span class="font-mono text-indigo-700 font-bold">${info.dCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                    </div>
                    <p class="font-bold text-slate-800 truncate mb-1">
                        ${info.dinner ? escapeHtml(info.dinner.menu_name || 'ไม่ได้ระบุชื่อเมนู') : '<span class="text-slate-400 font-normal italic">ยังไม่มีข้อมูล</span>'}
                    </p>
                    <p class="text-[11px] text-slate-500">
                        ${dItems.length > 0 ? `วัตถุดิบ ${dItems.length} รายการ` : '-'}
                    </p>
                </div>
            </div>

            <!-- สรุปงบประมาณรวมประจำวัน -->
            <div class="mt-3.5 p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-emerald-850 text-gold-400 flex items-center justify-center font-bold">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <div>
                        <p class="font-bold text-slate-800">รวมค่าใช้จ่ายจริง 3 มื้อ: <span class="text-emerald-850 font-black text-sm">${info.totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> บาท</p>
                        <p class="text-[11px] text-slate-500">งบประมาณจัดสรรประจำวัน: ${info.allocatedBudget.toLocaleString('th-TH')} บาท (ม.ต้น 40 บ. + ม.ปลาย 60 บ.)</p>
                    </div>
                </div>
            </div>
        `;

        previewContainer.innerHTML = html;
    },

    /**
     * ค้นหาหน่วยนับของวัตถุดิบจากระบบราคากลางอย่างปลอดภัย
     */
    findItemUnit(itemName, dateStr) {
        if (!itemName) return "หน่วย";
        try {
            if (typeof StandardPrices !== 'undefined' && StandardPrices.searchItems && dateStr) {
                const parts = dateStr.split('-').map(Number);
                if (parts.length >= 2) {
                    const results = StandardPrices.searchItems(itemName.trim(), parts[0], parts[1]);
                    if (results && results.length > 0) {
                        const exact = results.find(r => r.name && r.name.trim() === itemName.trim()) || results[0];
                        if (exact && exact.unit) return exact.unit;
                    }
                }
            }
        } catch (_) {}

        const clean = itemName.trim();
        if (clean.includes('ข้าวสาร') || clean.includes('หมู') || clean.includes('ไก่') || clean.includes('ผัก') || clean.includes('เนื้อ') || clean.includes('น้ำตาล') || clean.includes('เกลือ')) return "กก.";
        if (clean.includes('ไข่')) return "แผง";
        if (clean.includes('น้ำมัน') || clean.includes('ซีอิ๊ว') || clean.includes('น้ำปลา') || clean.includes('ซอส')) return "ขวด";
        if (clean.includes('กะทิ') || clean.includes('ปลากระป๋อง')) return "กระป๋อง";
        if (clean.includes('แก๊ส')) return "ถัง";
        if (clean.includes('มัด') || clean.includes('กะเพรา') || clean.includes('โหระพา')) return "มัด";
        return "หน่วย";
    },

    /**
     * สร้าง HTML เอกสารรายงานราชการฉบับทางการ 100% (Official Government Document)
     */
    generateOfficialReportHTML(dateStr) {
        const info = this.getDayData(dateStr);
        const thaiFullDate = this.formatFullThaiDate(dateStr);
        const bahtTextStr = this.bahtText(info.totalSpent);

        const parseItems = (rec) => {
            if (!rec) return [];
            if (Array.isArray(rec.items)) return rec.items;
            if (typeof rec.items === 'string') {
                try { return JSON.parse(rec.items); } catch (_) { return []; }
            }
            return [];
        };

        let rowCounter = 0;

        const renderMealSectionRows = (mealTitle, rec, cost) => {
            const items = parseItems(rec);
            const menuName = rec ? (rec.menu_name || 'ไม่ได้ระบุชื่อเมนู') : '- ไม่มีรายการจัดทำ -';

            let rows = `
                <tr style="background-color: #f1f5f9; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000;">
                    <td colspan="4" style="padding: 4px 6px; text-align: left;">
                        <span style="font-size: 10pt; font-weight: bold; color: #000;">• ${mealTitle}: ${escapeHtml(menuName)}</span>
                    </td>
                    <td colspan="2" style="padding: 4px 6px; text-align: right; font-weight: bold; font-size: 9.5pt; color: #000;">
                        รวมมื้อนี้: ${cost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                    </td>
                </tr>
            `;

            if (items.length === 0) {
                rows += `
                    <tr>
                        <td style="text-align: center; color: #64748b; font-style: italic; padding: 3px 6px;">-</td>
                        <td colspan="5" style="color: #64748b; font-style: italic; padding: 3px 6px;">ไม่มีรายการวัตถุดิบที่บันทึก</td>
                    </tr>
                `;
            } else {
                items.forEach((it) => {
                    rowCounter++;
                    const itemName = (it.item || it.name || '').trim() || '-';
                    const qty = Number(it.qty) || 0;
                    const price = Number(it.price) || 0;
                    const total = (it.total !== undefined && it.total !== null && !isNaN(Number(it.total)))
                        ? Number(it.total)
                        : (qty * price);
                    const unit = it.unit || this.findItemUnit(itemName, dateStr);

                    rows += `
                        <tr style="border-bottom: 1px solid #cbd5e1;">
                            <td style="text-align: center; width: 35px; padding: 2px 4px; font-size: 9pt;">${rowCounter}</td>
                            <td style="padding: 2px 8px; text-align: left; font-size: 9.5pt;">${escapeHtml(itemName)}</td>
                            <td style="text-align: center; width: 55px; padding: 2px 4px; font-size: 9pt;">${qty > 0 ? qty.toLocaleString('th-TH', { maximumFractionDigits: 2 }) : '-'}</td>
                            <td style="text-align: center; width: 55px; padding: 2px 4px; font-size: 9pt;">${escapeHtml(unit)}</td>
                            <td style="text-align: right; width: 85px; padding: 2px 6px; font-size: 9pt;">${price > 0 ? price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                            <td style="text-align: right; width: 95px; padding: 2px 6px; font-weight: 600; font-size: 9pt;">${total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                    `;
                });
            }

            return rows;
        };

        return `
            <div class="official-daily-report" style="font-family: 'Sarabun', 'TH Sarabun PSK', sans-serif; color: #000; background: #fff; width: 100%; max-width: 780px; margin: 0 auto; padding: 8px 12px; line-height: 1.25;">
                
                <!-- 1. ส่วนหัวหนังสือราชการ (Official Header) -->
                <div style="text-align: center; margin-bottom: 8px; border-bottom: 2px solid #000; padding-bottom: 6px;">
                    <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 2px;">
                        <tr style="border: none;">
                            <td style="width: 60px; text-align: center; vertical-align: middle; border: none; padding: 0;">
                                <img src="Hs_logo_mid.png" alt="ตราโรงเรียนห้องสอนศึกษา" style="width: 48px; height: 48px; object-fit: contain;">
                            </td>
                            <td style="text-align: center; vertical-align: middle; border: none; padding: 0;">
                                <div style="font-size: 12pt; font-weight: bold; line-height: 1.2; color: #000;">โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ</div>
                                <div style="font-size: 9pt; color: #1e293b; line-height: 1.2;">สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาแม่ฮ่องสอน</div>
                                <div style="font-size: 11pt; font-weight: bold; margin-top: 2px; color: #000;">
                                    แบบรายงานสรุปรายการอาหารและควบคุมการใช้วัตถุดิบประจำวัน (นักเรียนพักนอน)
                                </div>
                            </td>
                            <td style="width: 60px; border: none; padding: 0;"></td>
                        </tr>
                    </table>
                </div>

                <!-- 2. ตารางข้อมูลสรุปกรอบบน (Compact Info Box) -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9.5pt; border: 1px solid #000;">
                    <tr>
                        <td style="padding: 3px 6px; width: 55%; border: 1px solid #000; background-color: #fafafa;">
                            <strong>ประจำวัน:</strong> ${thaiFullDate}
                        </td>
                        <td style="padding: 3px 6px; width: 45%; border: 1px solid #000; background-color: #fafafa;">
                            <strong>กลุ่มเป้าหมาย:</strong> นักเรียนพักนอน ม.ต้น 86 คน, ม.ปลาย 39 คน (รวม 125 คน)
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 3px 6px; border: 1px solid #000;">
                            <strong>งบประมาณจัดสรรประจำวัน:</strong> 5,780.00 บาท (ม.ต้น 40 บ. + ม.ปลาย 60 บ.)
                        </td>
                        <td style="padding: 3px 6px; border: 1px solid #000;">
                            <strong>รวมค่าใช้จ่ายจริง 3 มื้อ:</strong> <strong>${info.totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> บาท
                        </td>
                    </tr>
                </table>

                <!-- 3. ตารางแจกแจงรายการ 3 มื้อ (Unified Official Table) -->
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 9pt; margin-bottom: 8px;">
                    <thead>
                        <tr style="background-color: #e2e8f0; font-weight: bold; border-bottom: 1px solid #000; text-align: center;">
                            <th style="border: 1px solid #000; padding: 4px 2px; width: 35px;">ที่</th>
                            <th style="border: 1px solid #000; padding: 4px 6px; text-align: center;">มื้ออาหาร / รายการวัตถุดิบและเครื่องปรุง</th>
                            <th style="border: 1px solid #000; padding: 4px 2px; width: 55px;">จำนวน</th>
                            <th style="border: 1px solid #000; padding: 4px 2px; width: 55px;">หน่วยนับ</th>
                            <th style="border: 1px solid #000; padding: 4px 4px; width: 85px;">ราคา/หน่วย</th>
                            <th style="border: 1px solid #000; padding: 4px 4px; width: 95px;">จำนวนเงิน (บาท)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderMealSectionRows("มื้อเช้า (อาหารเช้า)", info.breakfast, info.bCost)}
                        ${renderMealSectionRows("มื้อกลางวัน (อาหารกลางวัน)", info.lunch, info.lCost)}
                        ${renderMealSectionRows("มื้อเย็น (อาหารเย็น)", info.dinner, info.dCost)}
                    </tbody>
                    <tfoot>
                        <tr style="background-color: #f8fafc; font-weight: bold; border-top: 2px solid #000; border-bottom: 2px double #000;">
                            <td colspan="4" style="border: 1px solid #000; padding: 5px 8px; text-align: right; font-size: 9.5pt;">
                                <strong>รวมเป็นเงินค่าวัตถุดิบประกอบอาหารทั้งสิ้น 3 มื้อ:</strong>
                                <div style="font-size: 8.5pt; font-weight: normal; color: #1e293b;">(${bahtTextStr})</div>
                            </td>
                            <td colspan="2" style="border: 1px solid #000; padding: 5px 8px; text-align: right; font-size: 11pt; font-weight: bold;">
                                ${info.totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <!-- 4. ส่วนลงนาม 3 ฝ่าย แนวนอน 3 คอลัมน์ (Official Signatures 3 Columns) -->
                <div class="official-signatures" style="margin-top: 14px; page-break-inside: avoid; break-inside: avoid;">
                    <table style="width: 100%; border-collapse: collapse; border: none; text-align: center; font-size: 8.5pt;">
                        <tr style="border: none;">
                            <!-- ผู้ประกอบอาหาร -->
                            <td style="width: 33.33%; vertical-align: top; border: none; padding: 0 4px;">
                                <div style="font-weight: bold; margin-bottom: 24px;">ผู้จัดทำรายการ / ผู้ประกอบอาหาร</div>
                                <div style="margin-bottom: 4px;">(ลงชื่อ)............................................................</div>
                                <div style="margin-bottom: 2px;">(............................................................)</div>
                                <div style="color: #475569; font-size: 8pt;">ผู้ประกอบอาหาร / ผู้บันทึก</div>
                                <div style="color: #475569; font-size: 8pt; margin-top: 2px;">วันที่ ......./......./.......</div>
                            </td>

                            <!-- ครูเวรประจำวัน -->
                            <td style="width: 33.33%; vertical-align: top; border: none; padding: 0 4px;">
                                <div style="font-weight: bold; margin-bottom: 24px;">ผู้ตรวจรับและควบคุมคุณภาพ</div>
                                <div style="margin-bottom: 4px;">(ลงชื่อ)............................................................</div>
                                <div style="margin-bottom: 2px;">(............................................................)</div>
                                <div style="color: #475569; font-size: 8pt;">ครูเวรประจำวัน / ผู้ตรวจรับ</div>
                                <div style="color: #475569; font-size: 8pt; margin-top: 2px;">วันที่ ......./......./.......</div>
                            </td>

                            <!-- หัวหน้างานโภชนาการ -->
                            <td style="width: 33.33%; vertical-align: top; border: none; padding: 0 4px;">
                                <div style="font-weight: bold; margin-bottom: 24px;">ผู้ตรวจสอบและรับรอง</div>
                                <div style="margin-bottom: 4px;">(ลงชื่อ)............................................................</div>
                                <div style="margin-bottom: 2px;">(............................................................)</div>
                                <div style="color: #475569; font-size: 8pt;">หัวหน้างานโภชนาการและหอพักนักเรียน</div>
                                <div style="color: #475569; font-size: 8pt; margin-top: 2px;">วันที่ ......./......./.......</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Footer รายงาน -->
                <div style="margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 3px; display: flex; justify-content: space-between; font-size: 7.5pt; color: #64748b;">
                    <span>ระบบจัดเก็บข้อมูลเมนูอาหารหอพักนักเรียน (MealTrack) โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ</span>
                    <span>พิมพ์รายงาน: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.</span>
                </div>
            </div>
        `;
    },

    /**
     * สั่งพิมพ์ / ส่งออกเป็น PDF ทันทีสำหรับวันที่ระบุ (1-Page A4 Isolated Output)
     */
    exportPDF(dateStr = "") {
        try {
            let targetDate = dateStr;
            if (!targetDate) {
                const inputEl = document.getElementById('dailyExportDateInput');
                if (inputEl && inputEl.value) targetDate = inputEl.value;
            }
            if (!targetDate) targetDate = this.selectedDate;
            if (!targetDate) {
                const today = new Date();
                const y = today.getFullYear();
                const m = (today.getMonth() + 1).toString().padStart(2, '0');
                const d = today.getDate().toString().padStart(2, '0');
                targetDate = `${y}-${m}-${d}`;
            }

            const reportHTML = this.generateOfficialReportHTML(targetDate);

            // 1. อัปเดตเนื้อหาลงใน Container สำหรับ fallback
            const printArea = document.getElementById('dailyOfficialPrintArea');
            if (printArea) {
                printArea.innerHTML = reportHTML;
            }

            // 2. ปิด Modal ทั้งหมดเพื่อไม่ให้ค้างบนหน้าจอ
            this.closeSelector();
            this.closePreviewModal();

            // 3. ใช้วิธี Isolated Hidden Iframe Printing (วิธีมาตรฐานที่ป้องกันหน้าเว็บแม่ติดเข้าไป 100%)
            let printIframe = document.getElementById('dailyPrintIsolatedIframe');
            if (printIframe) {
                printIframe.remove();
            }

            printIframe = document.createElement('iframe');
            printIframe.id = 'dailyPrintIsolatedIframe';
            printIframe.style.position = 'fixed';
            printIframe.style.right = '0';
            printIframe.style.bottom = '0';
            printIframe.style.width = '0';
            printIframe.style.height = '0';
            printIframe.style.border = '0';
            printIframe.style.opacity = '0';
            printIframe.style.pointerEvents = 'none';
            document.body.appendChild(printIframe);

            const iframeDoc = printIframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(`
                <!DOCTYPE html>
                <html lang="th">
                <head>
                    <meta charset="UTF-8">
                    <title>แบบรายงานสรุปรายการอาหารประจำวัน - โรงเรียนห้องสอนศึกษา</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 5mm 8mm 5mm 8mm;
                        }
                        * {
                            box-sizing: border-box;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            background: #ffffff;
                            color: #000000;
                            font-family: 'Sarabun', 'TH Sarabun PSK', sans-serif;
                            font-size: 9pt;
                            line-height: 1.2;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border-color: #000000;
                        }
                        .official-daily-report {
                            width: 100%;
                            max-width: 100%;
                            margin: 0 auto;
                            padding: 0;
                        }
                        tr {
                            page-break-inside: avoid;
                        }
                        .official-signatures {
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                    </style>
                </head>
                <body>
                    ${reportHTML}
                </body>
                </html>
            `);
            iframeDoc.close();

            // รอโหลดภาพและฟอนต์เล็กน้อยแล้วสั่งพิมพ์เฉพาะ Iframe
            setTimeout(() => {
                try {
                    printIframe.contentWindow.focus();
                    printIframe.contentWindow.print();
                } catch (e) {
                    console.warn("Iframe print fallback to window.print:", e);
                    document.body.classList.remove('printing-stats');
                    document.body.classList.add('printing-daily');
                    window.print();
                    setTimeout(() => document.body.classList.remove('printing-daily'), 2000);
                }
            }, 250);

        } catch (err) {
            console.error("Error in exportPDF:", err);
            UI.showToast("เกิดข้อผิดพลาดในการพิมพ์เอกสาร: " + err.message, "error");
        }
    },

    /**
     * แสดงตัวอย่างเอกสารราชการฉบับทางการของวันที่กำลังเปิดอยู่ใน MealModal ทันทีโดยไม่ต้องเลือกวันซ้ำ
     */
    previewCurrentDatePDF() {
        try {
            let activeDate = "";
            if (typeof MealModal !== 'undefined' && MealModal.selectedDateStr) {
                activeDate = MealModal.selectedDateStr;

                // ซิงค์ชื่อเมนูและรายการที่กำลังพิมพ์อยู่ในฟอร์มเข้าหน่วยความจำทันทีก่อนแสดงตัวอย่าง
                const menuInput = document.getElementById('menuNameInput');
                if (menuInput && MealModal.activeRecord) {
                    MealModal.activeRecord.menu_name = menuInput.value.trim();
                }

                if (MealModal.activeRecord && MealModal.selectedMealType) {
                    if (typeof monthData !== 'undefined') {
                        if (!monthData[activeDate]) monthData[activeDate] = {};
                        monthData[activeDate][MealModal.selectedMealType] = JSON.parse(JSON.stringify(MealModal.activeRecord));
                    }
                }
            }

            if (!activeDate) {
                const today = new Date();
                const y = today.getFullYear();
                const m = (today.getMonth() + 1).toString().padStart(2, '0');
                const d = today.getDate().toString().padStart(2, '0');
                activeDate = `${y}-${m}-${d}`;
            }

            this.selectedDate = activeDate;
            this.previewPDF(activeDate);
        } catch (err) {
            console.error("Error in previewCurrentDatePDF:", err);
            UI.showToast("เกิดข้อผิดพลาดในการเปิดตัวอย่างรายงาน: " + err.message, "error");
        }
    },

    /**
     * ส่งออก PDF ทันทีของวันที่เปิดอยู่ใน MealModal
     */
    exportCurrentDatePDF() {
        try {
            let activeDate = "";
            if (typeof MealModal !== 'undefined' && MealModal.selectedDateStr) {
                activeDate = MealModal.selectedDateStr;

                // บันทึกความเปลี่ยนแปลงใน activeRecord ลง memory ก่อนส่งออก
                const menuInput = document.getElementById('menuNameInput');
                if (menuInput && MealModal.activeRecord) {
                    MealModal.activeRecord.menu_name = menuInput.value.trim();
                }

                if (MealModal.activeRecord && MealModal.selectedMealType) {
                    if (typeof monthData !== 'undefined') {
                        if (!monthData[activeDate]) monthData[activeDate] = {};
                        monthData[activeDate][MealModal.selectedMealType] = JSON.parse(JSON.stringify(MealModal.activeRecord));
                    }
                }
            }

            if (!activeDate) {
                const today = new Date();
                const y = today.getFullYear();
                const m = (today.getMonth() + 1).toString().padStart(2, '0');
                const d = today.getDate().toString().padStart(2, '0');
                activeDate = `${y}-${m}-${d}`;
            }

            this.exportPDF(activeDate);
        } catch (err) {
            console.error("Error in exportCurrentDatePDF:", err);
            UI.showToast("เกิดข้อผิดพลาดในการส่งออก PDF: " + err.message, "error");
        }
    },

    /**
     * แสดงตัวอย่างเอกสารฉบับทางการบนหน้าจอก่อนพิมพ์
     */
    previewPDF(dateStr = "") {
        try {
            let targetDate = dateStr;
            if (!targetDate) {
                const inputEl = document.getElementById('dailyExportDateInput');
                if (inputEl && inputEl.value) targetDate = inputEl.value;
            }
            if (!targetDate) targetDate = this.selectedDate;
            if (!targetDate) {
                const today = new Date();
                const y = today.getFullYear();
                const m = (today.getMonth() + 1).toString().padStart(2, '0');
                const d = today.getDate().toString().padStart(2, '0');
                targetDate = `${y}-${m}-${d}`;
            }

            const container = document.getElementById('dailyPreviewModalBody');
            if (container) {
                container.innerHTML = this.generateOfficialReportHTML(targetDate);
            }

            this.closeSelector();
            UI.openModal('dailyPreviewModal');
        } catch (err) {
            console.error("Error in previewPDF:", err);
            UI.showToast("เกิดข้อผิดพลาดในการแสดงตัวอย่าง: " + err.message, "error");
        }
    },

    /**
     * ปิด Preview Modal
     */
    closePreviewModal() {
        UI.closeModal('dailyPreviewModal');
    }
};
