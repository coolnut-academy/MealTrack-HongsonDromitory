/**
 * Meal Modal Controller & Dynamic Ingredients Table
 */
const MealModal = {
    selectedDateStr: "",
    selectedMealType: "มื้อกลางวัน",
    activeRecord: null,

    openForDate(dateStr) {
        this.selectedDateStr = dateStr;
        const parts = dateStr.split('-');
        const yearThai = parseInt(parts[0]) + 543;
        const monthThai = CONFIG.THAI_MONTHS[parseInt(parts[1]) - 1];
        const dayNum = parseInt(parts[2]);

        const titleEl = document.getElementById('modalDateTitle');
        if (titleEl) {
            titleEl.innerText = `รายการอาหารประจำวันที่ ${dayNum} ${monthThai} ${yearThai}`;
        }

        this.switchMealTab("มื้อกลางวัน");
        UI.openModal('mealModal');
    },

    close() {
        UI.closeModal('mealModal');
    },

    switchMealTab(mealType) {
        this.selectedMealType = mealType;

        // Highlight Tab Buttons
        document.querySelectorAll('.meal-tab').forEach(btn => {
            btn.classList.remove('border-emerald-850', 'text-emerald-850', 'bg-white', 'shadow-xs');
            btn.classList.add('border-transparent', 'text-slate-500');
        });

        const activeTab = document.getElementById(`tab-${mealType}`);
        if (activeTab) {
            activeTab.classList.remove('border-transparent', 'text-slate-500');
            activeTab.classList.add('border-emerald-850', 'text-emerald-850', 'bg-white', 'shadow-xs');
        }

        // Load record from monthData cache or create initial template
        const dayEntries = monthData[this.selectedDateStr] || {};
        this.activeRecord = dayEntries[mealType] ? JSON.parse(JSON.stringify(dayEntries[mealType])) : {
            date: this.selectedDateStr,
            meal_type: mealType,
            menu_name: "",
            items: [
                { item: "ข้าวสาร", qty: 12, price: 35, total: 420 },
                { item: "", qty: 1, price: 0, total: 0 }
            ],
            total_cost: 420,
            status: "DRAFT"
        };

        // If items are not an array, convert safely
        if (!Array.isArray(this.activeRecord.items)) {
            this.activeRecord.items = [];
        }

        const menuInput = document.getElementById('menuNameInput');
        if (menuInput) menuInput.value = this.activeRecord.menu_name || "";

        this.renderIngredientsRows();
    },

    renderIngredientsRows() {
        const tbody = document.getElementById('ingredientsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const items = this.activeRecord.items || [];

        items.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50/80 transition group';
            tr.innerHTML = `
                <td class="py-2.5 px-3 text-center text-slate-400 font-medium text-xs">${idx + 1}</td>
                <td class="py-2 px-2">
                    <input type="text" value="${escapeHtml(row.item || '')}" onchange="MealModal.updateItemRow(${idx}, 'item', this.value)" placeholder="ชื่อวัตถุดิบ (เช่น เนื้อหมู, ผัก)" class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none transition">
                </td>
                <td class="py-2 px-2">
                    <input type="number" step="any" min="0" value="${row.qty !== undefined ? row.qty : 1}" onchange="MealModal.updateItemRow(${idx}, 'qty', this.value)" class="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center focus:ring-2 focus:ring-emerald-700 focus:outline-none transition">
                </td>
                <td class="py-2 px-2">
                    <input type="number" step="any" min="0" value="${row.price !== undefined ? row.price : 0}" onchange="MealModal.updateItemRow(${idx}, 'price', this.value)" class="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center focus:ring-2 focus:ring-emerald-700 focus:outline-none transition">
                </td>
                <td class="py-2 px-3 text-right font-bold text-slate-700 text-xs">
                    ${(Number(row.total) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td class="py-2 px-2 text-center">
                    <button type="button" onclick="MealModal.removeIngredientRow(${idx})" class="text-slate-300 hover:text-red-600 transition p-1.5" title="ลบรายการนี้">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        this.calculateMealGrandTotal();
    },

    updateItemRow(index, field, value) {
        if (!this.activeRecord.items) this.activeRecord.items = [];
        
        if (field === 'qty' || field === 'price') {
            this.activeRecord.items[index][field] = parseFloat(value) || 0;
        } else {
            this.activeRecord.items[index][field] = value;
        }

        const q = this.activeRecord.items[index].qty || 0;
        const p = this.activeRecord.items[index].price || 0;
        this.activeRecord.items[index].total = q * p;

        this.renderIngredientsRows();
    },

    addIngredientRow() {
        if (!this.activeRecord.items) this.activeRecord.items = [];
        this.activeRecord.items.push({ item: "", qty: 1, price: 0, total: 0 });
        this.renderIngredientsRows();
    },

    removeIngredientRow(index) {
        if (this.activeRecord.items && this.activeRecord.items.length > index) {
            this.activeRecord.items.splice(index, 1);
            this.renderIngredientsRows();
        }
    },

    calculateMealGrandTotal() {
        let grandTotal = 0;
        if (this.activeRecord && this.activeRecord.items) {
            grandTotal = this.activeRecord.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        }
        if (this.activeRecord) this.activeRecord.total_cost = grandTotal;

        const display = document.getElementById('mealTotalCostDisplay');
        if (display) {
            display.innerText = grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    },

    async saveRecord() {
        if (!this.activeRecord) return;

        const menuInput = document.getElementById('menuNameInput');
        this.activeRecord.menu_name = menuInput ? menuInput.value.trim() : "";
        this.activeRecord.status = "COMPLETE";

        // Save to Local Cache immediately for fast UI feedback
        if (!monthData[this.selectedDateStr]) monthData[this.selectedDateStr] = {};
        monthData[this.selectedDateStr][this.selectedMealType] = JSON.parse(JSON.stringify(this.activeRecord));
        _saveToLocalCache();

        renderCalendarGrid();
        renderMobileAgendaView();
        this.close();

        UI.showToast(`บันทึกข้อมูล ${this.selectedMealType} เรียบร้อยแล้ว`, 'success');

        // Sync with Google Sheets
        try {
            const res = await API.saveMealRecord(this.activeRecord);
            if (res && res.success) {
                console.log("Google Sheets Sync successful");
            }
        } catch (err) {
            UI.showToast("บันทึกในเครื่องเรียบร้อยแล้ว (ไม่สามารถส่งไป Google Sheets ได้)", "warning");
        }
    },

    async deleteRecord() {
        if (!monthData[this.selectedDateStr] || !monthData[this.selectedDateStr][this.selectedMealType]) {
            this.close();
            return;
        }

        if (!confirm(`คุณต้องการลบข้อมูล ${this.selectedMealType} ของวันที่ ${this.selectedDateStr} ใช่หรือไม่?`)) {
            return;
        }

        delete monthData[this.selectedDateStr][this.selectedMealType];
        _saveToLocalCache();

        renderCalendarGrid();
        renderMobileAgendaView();
        this.close();

        UI.showToast(`ลบข้อมูล ${this.selectedMealType} เรียบร้อยแล้ว`, 'info');

        try {
            await API.deleteMealRecord(this.selectedDateStr, this.selectedMealType);
        } catch (err) {
            console.warn("Deleted locally, Google Sheets delete failed:", err);
        }
    }
};
