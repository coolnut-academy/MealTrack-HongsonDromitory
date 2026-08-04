/**
 * Meal Modal Controller & Dynamic Ingredients Table with Autocomplete
 */
const MealModal = {
    selectedDateStr: "",
    selectedMealType: "มื้อเช้า",
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

        this.switchMealTab("มื้อเช้า");
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
        let recKey = mealType;
        if (mealType === 'มื้อเที่ยง' && !dayEntries['มื้อเที่ยง'] && dayEntries['มื้อกลางวัน']) {
            recKey = 'มื้อกลางวัน';
        }

        this.activeRecord = dayEntries[recKey] ? JSON.parse(JSON.stringify(dayEntries[recKey])) : {
            date: this.selectedDateStr,
            meal_type: mealType,
            menu_name: "",
            items: [
                { item: "ข้าวสาร", qty: 12, price: 40, total: 480 },
                { item: "", qty: 1, price: 0, total: 0 }
            ],
            total_cost: 480,
            status: "DRAFT"
        };

        // Ensure default items use active month's standard price if available
        const [year, month] = this.selectedDateStr.split('-').map(Number);
        const stdPrices = StandardPrices.getForMonth(year, month);
        const priceMap = {};
        stdPrices.categories.forEach(cat => {
            cat.items.forEach(it => {
                priceMap[it.name.trim()] = Number(it.price) || 0;
            });
        });

        if (Array.isArray(this.activeRecord.items)) {
            this.activeRecord.items.forEach(row => {
                const itemName = (row.item || "").trim();
                if (priceMap.hasOwnProperty(itemName)) {
                    row.price = priceMap[itemName];
                }
                const q = Number(row.qty) || 0;
                const p = Number(row.price) || 0;
                row.total = q * p;
            });
        } else {
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
                <td class="py-2 px-2 relative">
                    <input type="text" value="${escapeHtml(row.item || '')}" 
                        oninput="MealModal.handleItemInput(${idx}, this)" 
                        onfocus="MealModal.handleItemInput(${idx}, this)"
                        onblur="setTimeout(() => MealModal.closeAutocomplete(${idx}), 200)"
                        placeholder="พิมพ์เพื่อค้นหา (เช่น หมูบด, ผัก)" 
                        class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none transition font-medium">
                    <div id="autocomplete-dropdown-${idx}" class="autocomplete-dropdown hidden"></div>
                </td>
                <td class="py-2 px-2">
                    <input type="number" step="any" min="0" value="${row.qty !== undefined ? row.qty : 1}" 
                        onchange="MealModal.updateItemRow(${idx}, 'qty', this.value)" 
                        class="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center focus:ring-2 focus:ring-emerald-700 focus:outline-none transition">
                </td>
                <td class="py-2 px-2">
                    <input type="number" id="item-price-input-${idx}" step="any" min="0" value="${row.price !== undefined ? row.price : 0}" 
                        onchange="MealModal.updateItemRow(${idx}, 'price', this.value)" 
                        class="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-bold text-emerald-850 focus:ring-2 focus:ring-emerald-700 focus:outline-none transition">
                </td>
                <td class="py-2 px-3 text-right font-bold text-slate-700 text-xs" id="item-total-display-${idx}">
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

    handleItemInput(idx, inputEl) {
        const val = inputEl.value;
        if (!this.activeRecord.items[idx]) return;
        this.activeRecord.items[idx].item = val;

        const [year, month] = this.selectedDateStr.split('-').map(Number);
        const results = StandardPrices.searchItems(val, year, month);

        const dropdown = document.getElementById(`autocomplete-dropdown-${idx}`);
        if (!dropdown) return;

        if (results.length === 0) {
            dropdown.classList.add('hidden');
            dropdown.innerHTML = '';
            return;
        }

        let html = '';
        results.forEach(res => {
            html += `
                <div class="autocomplete-item px-3 py-2 hover:bg-emerald-50 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-0"
                    onmousedown="MealModal.selectAutocompleteItem(${idx}, '${escapeHtml(res.name)}', ${res.price})">
                    <div class="flex items-center gap-1.5 truncate">
                        <span class="text-xs">${res.icon || '📦'}</span>
                        <span class="font-bold text-slate-800 text-xs">${escapeHtml(res.name)}</span>
                        <span class="text-[10px] text-slate-400">(${escapeHtml(res.unit || 'หน่วย')})</span>
                    </div>
                    <div class="text-xs font-bold text-emerald-850 whitespace-nowrap ml-2">
                        ${res.price} ฿
                    </div>
                </div>
            `;
        });

        dropdown.innerHTML = html;
        dropdown.classList.remove('hidden');
    },

    selectAutocompleteItem(idx, itemName, itemPrice) {
        if (!this.activeRecord.items[idx]) return;
        this.activeRecord.items[idx].item = itemName;
        this.activeRecord.items[idx].price = itemPrice;

        const qty = this.activeRecord.items[idx].qty || 1;
        this.activeRecord.items[idx].total = qty * itemPrice;

        this.renderIngredientsRows();
        this.closeAutocomplete(idx);
    },

    closeAutocomplete(idx) {
        const dropdown = document.getElementById(`autocomplete-dropdown-${idx}`);
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
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
