/**
 * Monthly Standard Prices Management System
 * Handles price templates, monthly cloning, auto-suggestions, and price updates.
 */

const DEFAULT_STANDARD_PRICES = {
    categories: [
        {
            name: "แก๊สหุงต้ม",
            icon: "🔥",
            items: [
                { name: "แก๊สหุงต้ม", unit: "ถัง", price: 650 }
            ]
        },
        {
            name: "อาหารสด",
            icon: "🥩",
            items: [
                { name: "ไก่บด", unit: "กิโลกรัม", price: 95 },
                { name: "ไก่สับ", unit: "กิโลกรัม", price: 90 },
                { name: "ลูกชิ้นหมู", unit: "กิโลกรัม", price: 95 },
                { name: "หมูแดง", unit: "กิโลกรัม", price: 165 },
                { name: "หมูบด", unit: "กิโลกรัม", price: 165 },
                { name: "หมูยอ", unit: "กิโลกรัม", price: 80 },
                { name: "ไส้กรอก", unit: "กิโลกรัม", price: 90 },
                { name: "ปลาทู", unit: "เข่ง", price: 30 },
                { name: "กระดูกหมู", unit: "กิโลกรัม", price: 80 }
            ]
        },
        {
            name: "ผักสดและผลไม้",
            icon: "🥬",
            items: [
                { name: "กระเทียม", unit: "กิโลกรัม", price: 100 },
                { name: "กระหล่ำปลี", unit: "กิโลกรัม", price: 40 },
                { name: "กะเพรา", unit: "มัด", price: 5 },
                { name: "กะหล่ำดอก", unit: "กิโลกรัม", price: 60 },
                { name: "ข่า+ตระไคร้", unit: "มัด", price: 5 },
                { name: "ข้าวโพดอ่อน", unit: "กิโลกรัม", price: 60 },
                { name: "คืนฉ่าย", unit: "มัด", price: 5 },
                { name: "แครอท", unit: "กิโลกรัม", price: 60 },
                { name: "ต้นหอม/ผักชี", unit: "มัด", price: 5 },
                { name: "แตงกวา", unit: "กิโลกรัม", price: 35 },
                { name: "ถั่วฝักยาว", unit: "กิโลกรัม", price: 50 },
                { name: "ถั่วพู", unit: "ก้อน", price: 10 },
                { name: "บวบ", unit: "กิโลกรัม", price: 50 },
                { name: "ผักกวางตุ้ง", unit: "กิโลกรัม", price: 35 },
                { name: "ผักกาดขาว", unit: "กิโลกรัม", price: 40 },
                { name: "ผักกาดดอง", unit: "ปี๊ป", price: 350 },
                { name: "ผักบุ้ง", unit: "กิโลกรัม", price: 30 },
                { name: "พริกสด", unit: "กิโลกรัม", price: 70 },
                { name: "พริกหยวก", unit: "กิโลกรัม", price: 50 },
                { name: "ฟักทอง", unit: "กิโลกรัม", price: 40 },
                { name: "มะเขือเทศ", unit: "กิโลกรัม", price: 50 },
                { name: "มะเขือเปราะ", unit: "กิโลกรัม", price: 40 },
                { name: "มะเขือพวง", unit: "กิโลกรัม", price: 30 },
                { name: "มะเขือยาว", unit: "กิโลกรัม", price: 40 },
                { name: "มะนาว", unit: "กิโลกรัม", price: 60 },
                { name: "มะระหวาน", unit: "กิโลกรัม", price: 40 },
                { name: "มันฝรั่ง", unit: "กิโลกรัม", price: 50 },
                { name: "หน่อไม้", unit: "กิโลกรัม", price: 60 },
                { name: "หอมหัวใหญ่", unit: "กิโลกรัม", price: 60 },
                { name: "หอมแดง", unit: "กิโลกรัม", price: 50 },
                { name: "หัวไซเท้า", unit: "กิโลกรัม", price: 60 },
                { name: "โหระพา", unit: "มัด", price: 5 },
                { name: "มะม่วง", unit: "กิโลกรัม", price: 40 },
                { name: "แตงโม", unit: "กิโลกรัม", price: 35 },
                { name: "เงาะ", unit: "กิโลกรัม", price: 35 },
                { name: "ฝรั่ง", unit: "กิโลกรัม", price: 45 },
                { name: "ลิ้นจี่", unit: "กิโลกรัม", price: 50 },
                { name: "ลำไย", unit: "กิโลกรัม", price: 50 }
            ]
        },
        {
            name: "อาหารแห้ง/เครื่องปรุง",
            icon: "🧂",
            items: [
                { name: "กะทิ", unit: "กล่อง", price: 90 },
                { name: "กะปิ", unit: "กิโลกรัม", price: 30 },
                { name: "เกลือ", unit: "กิโลกรัม", price: 30 },
                { name: "ซอสหอยนางรม", unit: "ขวด", price: 60 },
                { name: "ซีอิ๊วขาว", unit: "ขวด", price: 60 },
                { name: "ซีอิ๊วดำ", unit: "ขวด", price: 50 },
                { name: "ซุปไก่ก้อน", unit: "กล่อง", price: 20 },
                { name: "น้ำตาลทราย", unit: "กิโลกรัม", price: 35 },
                { name: "น้ำตาลปิ๊บ", unit: "กิโลกรัม", price: 40 },
                { name: "น้ำปลา", unit: "ขวด", price: 30 },
                { name: "น้ำมันพืช", unit: "ขวด", price: 70 },
                { name: "น้ำส้มสายชู", unit: "ขวด", price: 30 },
                { name: "ปลากระป๋อง", unit: "กระป๋อง", price: 25 },
                { name: "ผงพะโล้", unit: "ซอง", price: 20 },
                { name: "ผงวุ้น", unit: "ซอง", price: 50 },
                { name: "พริกลาบ", unit: "ซอง", price: 20 },
                { name: "พริกแกง", unit: "กิโลกรัม", price: 80 },
                { name: "พริกไทยป่น", unit: "ขวด", price: 30 },
                { name: "รสดี (ใหญ่)", unit: "กิโลกรัม", price: 120 },
                { name: "วุ้นเส้นสด", unit: "ถุง", price: 30 },
                { name: "สาคู", unit: "ถุง", price: 20 },
                { name: "สีผสมอาหาร", unit: "ซอง", price: 10 },
                { name: "ข้าวสาร", unit: "กิโลกรัม", price: 40 },
                { name: "ไข่ไก่", unit: "แผง", price: 140 }
            ]
        }
    ]
};

const StandardPrices = {
    getStorageKey(year, month) {
        return `std_prices_${year}_${month}`;
    },

    /**
     * Ensures data contains all default categories and default items from DEFAULT_STANDARD_PRICES
     */
    mergeWithDefaults(data) {
        if (!data || !Array.isArray(data.categories) || data.categories.length === 0) {
            return JSON.parse(JSON.stringify(DEFAULT_STANDARD_PRICES));
        }

        const merged = JSON.parse(JSON.stringify(data));
        const defaults = DEFAULT_STANDARD_PRICES.categories;

        defaults.forEach(defCat => {
            let catObj = merged.categories.find(c => c.name === defCat.name);
            if (!catObj) {
                catObj = JSON.parse(JSON.stringify(defCat));
                merged.categories.push(catObj);
            } else {
                if (!Array.isArray(catObj.items)) catObj.items = [];
                defCat.items.forEach(defItem => {
                    const itemExists = catObj.items.some(it => (it.name || '').trim() === defItem.name.trim());
                    if (!itemExists) {
                        catObj.items.push(JSON.parse(JSON.stringify(defItem)));
                    }
                });
            }
        });

        return merged;
    },

    /**
     * Retrieves standard prices for a specific year & month.
     * If absent for the given month, it clones from previous month or default template.
     */
    getForMonth(year, month) {
        const key = this.getStorageKey(year, month);
        const saved = localStorage.getItem(key);
        let data = null;

        if (saved) {
            try {
                data = JSON.parse(saved);
            } catch (_) {}
        }

        if (!data) {
            // Search for previous month data to clone from
            let prevYear = year;
            let prevMonth = month - 1;
            if (prevMonth < 1) {
                prevMonth = 12;
                prevYear--;
            }

            const prevKey = this.getStorageKey(prevYear, prevMonth);
            const prevSaved = localStorage.getItem(prevKey);
            if (prevSaved) {
                try {
                    data = JSON.parse(prevSaved);
                } catch (_) {}
            }
        }

        data = this.mergeWithDefaults(data);
        data.year = year;
        data.month = month;
        localStorage.setItem(key, JSON.stringify(data));
        return data;
    },

    saveForMonth(year, month, data) {
        const key = this.getStorageKey(year, month);
        data = this.mergeWithDefaults(data);
        data.year = year;
        data.month = month;
        localStorage.setItem(key, JSON.stringify(data));

        // Auto propagate updated prices to existing records for this month
        this.propagatePriceChanges(year, month, data);

        // Sync with Google Sheets in background
        if (typeof API !== 'undefined' && API.saveStandardPrices) {
            API.saveStandardPrices(year, month, data).catch(err => {
                console.warn("Syncing standard prices to Google Sheets failed:", err);
            });
        }
    },

    async fetchRemoteForMonth(year, month) {
        if (typeof API === 'undefined' || !API.getStandardPrices) return null;
        try {
            const res = await API.getStandardPrices(year, month);
            if (res && res.success && res.data && Array.isArray(res.data.categories)) {
                let data = this.mergeWithDefaults(res.data);
                const key = this.getStorageKey(year, month);
                data.year = year;
                data.month = month;
                localStorage.setItem(key, JSON.stringify(data));
                this.propagatePriceChanges(year, month, data);
                return data;
            }
        } catch (err) {
            console.warn("Failed to fetch remote standard prices:", err);
        }
        return null;
    },

    /**
     * Search items matching keyword for standard prices of year & month
     */
    searchItems(keyword, year, month) {
        if (!keyword || !keyword.trim()) return [];
        const cleanKeyword = keyword.trim().toLowerCase();
        const data = this.getForMonth(year, month);
        const results = [];

        if (data && Array.isArray(data.categories)) {
            data.categories.forEach(cat => {
                if (Array.isArray(cat.items)) {
                    cat.items.forEach(item => {
                        const itemName = (item.name || '').toLowerCase();
                        const catName = (cat.name || '').toLowerCase();
                        const nameMatch = itemName.includes(cleanKeyword);
                        const catMatch = catName.includes(cleanKeyword);

                        if (nameMatch || catMatch) {
                            let score = 0;
                            if (itemName === cleanKeyword) score = 100;
                            else if (itemName.startsWith(cleanKeyword)) score = 80;
                            else if (nameMatch) score = 60;
                            else if (catMatch) score = 20;

                            results.push({
                                ...item,
                                category: cat.name,
                                icon: cat.icon || "📦",
                                _score: score
                            });
                        }
                    });
                }
            });
        }

        results.sort((a, b) => b._score - a._score);
        return results;
    },

    /**
     * Propagates standard price changes to monthData records in active memory/cache for the target month
     */
    propagatePriceChanges(year, month, stdData) {
        if (typeof monthData === 'undefined' || !monthData) return;

        // Build price map: { "หมูบด": 170, ... }
        const priceMap = {};
        if (stdData && Array.isArray(stdData.categories)) {
            stdData.categories.forEach(cat => {
                if (Array.isArray(cat.items)) {
                    cat.items.forEach(it => {
                        if (it.name && it.price !== undefined) {
                            priceMap[it.name.trim()] = Number(it.price) || 0;
                        }
                    });
                }
            });
        }

        let updatedAny = false;
        // Loop over dates in monthData for target year & month
        Object.keys(monthData).forEach(dateStr => {
            const [dYear, dMonth] = dateStr.split('-').map(Number);
            if (dYear === Number(year) && dMonth === Number(month)) {
                const dayEntries = monthData[dateStr];
                if (dayEntries) {
                    Object.keys(dayEntries).forEach(mealKey => {
                        const mealRec = dayEntries[mealKey];
                        if (mealRec && Array.isArray(mealRec.items)) {
                            let mealCost = 0;
                            mealRec.items.forEach(row => {
                                const itemName = (row.item || "").trim();
                                if (priceMap.hasOwnProperty(itemName)) {
                                    row.price = priceMap[itemName];
                                }
                                const q = Number(row.qty) || 0;
                                const p = Number(row.price) || 0;
                                row.total = q * p;
                                mealCost += row.total;
                            });
                            mealRec.total_cost = mealCost;
                            updatedAny = true;
                        }
                    });
                }
            }
        });

        if (updatedAny) {
            if (typeof _saveToLocalCache === 'function') _saveToLocalCache();
            if (typeof renderCalendarGrid === 'function') renderCalendarGrid();
            if (typeof renderMobileAgendaView === 'function') renderMobileAgendaView();
            if (typeof calculateAndRenderStats === 'function') calculateAndRenderStats();
        }
    }
};

/**
 * Standard Prices Modal Controller
 */
const StandardPricesModal = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    activeCategory: "ทั้งหมด",
    searchFilter: "",

    open() {
        if (typeof currentYear !== 'undefined') this.currentYear = currentYear;
        if (typeof currentMonth !== 'undefined') this.currentMonth = currentMonth;
        this.render();
        UI.openModal('standardPricesModal');

        // Fetch remote data in background to sync changes from other devices
        StandardPrices.fetchRemoteForMonth(this.currentYear, this.currentMonth).then(remoteData => {
            if (remoteData) this.render();
        });
    },

    close() {
        UI.closeModal('standardPricesModal');
    },

    changeMonth(year, month) {
        this.currentYear = Number(year);
        this.currentMonth = Number(month);
        this.render();

        StandardPrices.fetchRemoteForMonth(this.currentYear, this.currentMonth).then(remoteData => {
            if (remoteData) this.render();
        });
    },

    setCategoryFilter(catName) {
        this.activeCategory = catName;
        const stdData = StandardPrices.getForMonth(this.currentYear, this.currentMonth);
        this.renderCategoriesNav(stdData);
        this.renderItemsList();
    },

    setSearchFilter(val) {
        this.searchFilter = val.trim().toLowerCase();
        this.renderItemsList();
    },

    render() {
        const stdData = StandardPrices.getForMonth(this.currentYear, this.currentMonth);
        const thaiYear = this.currentYear + 543;
        const thaiMonthStr = CONFIG.THAI_MONTHS[this.currentMonth - 1];

        // Render Month Selector Options
        const monthSelect = document.getElementById('stdPricesMonthSelect');
        if (monthSelect) {
            monthSelect.innerHTML = '';
            // Generate list of months for current year and adjacent years
            for (let y = this.currentYear - 1; y <= this.currentYear + 1; y++) {
                for (let m = 1; m <= 12; m++) {
                    const opt = document.createElement('option');
                    opt.value = `${y}-${m}`;
                    opt.innerText = `${CONFIG.THAI_MONTHS[m - 1]} ${y + 543}`;
                    if (y === this.currentYear && m === this.currentMonth) {
                        opt.selected = true;
                    }
                    monthSelect.appendChild(opt);
                }
            }
        }

        const titleEl = document.getElementById('stdPricesTitle');
        if (titleEl) {
            titleEl.innerText = `ราคากลางวัตถุดิบ — ประจำเดือน ${thaiMonthStr} ${thaiYear}`;
        }

        this.renderCategoriesNav(stdData);
        this.renderItemsList();
    },

    renderCategoriesNav(stdData) {
        const nav = document.getElementById('stdPricesCategoryNav');
        if (!nav) return;

        nav.innerHTML = '';

        // "ทั้งหมด" Button
        const allBtn = document.createElement('button');
        allBtn.className = `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            this.activeCategory === 'ทั้งหมด' 
                ? 'bg-emerald-850 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`;
        allBtn.innerHTML = `<span>📦 ทั้งหมด</span>`;
        allBtn.onclick = () => this.setCategoryFilter('ทั้งหมด');
        nav.appendChild(allBtn);

        stdData.categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                this.activeCategory === cat.name 
                    ? 'bg-emerald-850 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`;
            btn.innerHTML = `<span>${cat.icon || ''} ${cat.name}</span>`;
            btn.onclick = () => this.setCategoryFilter(cat.name);
            nav.appendChild(btn);
        });
    },

    renderItemsList() {
        const tbody = document.getElementById('stdPricesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const stdData = StandardPrices.getForMonth(this.currentYear, this.currentMonth);
        let count = 0;

        stdData.categories.forEach((cat, catIdx) => {
            if (this.activeCategory !== 'ทั้งหมด' && this.activeCategory !== cat.name) {
                return;
            }

            cat.items.forEach((item, itemIdx) => {
                if (this.searchFilter) {
                    const matchName = item.name.toLowerCase().includes(this.searchFilter);
                    const matchCat = cat.name.toLowerCase().includes(this.searchFilter);
                    if (!matchName && !matchCat) return;
                }

                count++;
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition';
                tr.innerHTML = `
                    <td class="py-2 px-3 text-center text-slate-400 font-medium text-xs">${count}</td>
                    <td class="py-2 px-3 text-xs font-medium text-slate-500">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                            ${cat.icon || ''} ${cat.name}
                        </span>
                    </td>
                    <td class="py-2 px-3">
                        <input type="text" value="${escapeHtml(item.name)}" 
                            onchange="StandardPricesModal.updateItem(${catIdx}, ${itemIdx}, 'name', this.value)"
                            class="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-none transition">
                    </td>
                    <td class="py-2 px-3">
                        <input type="text" value="${escapeHtml(item.unit || 'กิโลกรัม')}" 
                            onchange="StandardPricesModal.updateItem(${catIdx}, ${itemIdx}, 'unit', this.value)"
                            class="w-24 text-center px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none transition">
                    </td>
                    <td class="py-2 px-3">
                        <div class="relative flex items-center justify-end">
                            <input type="number" step="any" min="0" value="${item.price}" 
                                onchange="StandardPricesModal.updateItem(${catIdx}, ${itemIdx}, 'price', this.value)"
                                class="w-28 text-right font-bold text-emerald-850 px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50/30 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none transition">
                            <span class="ml-1 text-xs text-slate-400">฿</span>
                        </div>
                    </td>
                    <td class="py-2 px-2 text-center">
                        <button type="button" onclick="StandardPricesModal.removeItem(${catIdx}, ${itemIdx})" 
                            class="text-slate-300 hover:text-red-600 transition p-1" title="ลบรายการนี้">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });

        if (count === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-slate-400 text-xs font-medium">
                        ไม่พบรายการวัตถุดิบตามเงื่อนไขที่เลือก
                    </td>
                </tr>
            `;
        }
    },

    updateItem(catIdx, itemIdx, field, val) {
        const stdData = StandardPrices.getForMonth(this.currentYear, this.currentMonth);
        if (stdData.categories[catIdx] && stdData.categories[catIdx].items[itemIdx]) {
            if (field === 'price') {
                stdData.categories[catIdx].items[itemIdx][field] = parseFloat(val) || 0;
            } else {
                stdData.categories[catIdx].items[itemIdx][field] = val.trim();
            }
            StandardPrices.saveForMonth(this.currentYear, this.currentMonth, stdData);
            UI.showToast("อัปเดตราคากลางเรียบร้อยแล้ว", "success");
        }
    },

    removeItem(catIdx, itemIdx) {
        const stdData = StandardPrices.getForMonth(this.currentYear, this.currentMonth);
        if (stdData.categories[catIdx] && stdData.categories[catIdx].items[itemIdx]) {
            const itemName = stdData.categories[catIdx].items[itemIdx].name;
            if (confirm(`คุณต้องการลบ "${itemName}" ออกจากราคากลางใช่หรือไม่?`)) {
                stdData.categories[catIdx].items.splice(itemIdx, 1);
                StandardPrices.saveForMonth(this.currentYear, this.currentMonth, stdData);
                this.render();
                UI.showToast(`ลบ "${itemName}" เรียบร้อยแล้ว`, "info");
            }
        }
    },

    openAddItemModal() {
        const stdData = StandardPrices.getForMonth(this.currentYear, this.currentMonth);
        const catSelect = document.getElementById('addItemCategorySelect');
        if (catSelect) {
            catSelect.innerHTML = '';
            stdData.categories.forEach((cat, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.innerText = `${cat.icon || '📦'} ${cat.name}`;
                if (this.activeCategory !== 'ทั้งหมด' && this.activeCategory === cat.name) {
                    opt.selected = true;
                }
                catSelect.appendChild(opt);
            });
        }

        const nameInput = document.getElementById('addItemNameInput');
        const unitInput = document.getElementById('addItemUnitInput');
        const priceInput = document.getElementById('addItemPriceInput');

        if (nameInput) nameInput.value = '';
        if (unitInput) unitInput.value = 'กิโลกรัม';
        if (priceInput) priceInput.value = '';

        UI.openModal('addStandardItemModal');
    },

    closeAddItemModal() {
        UI.closeModal('addStandardItemModal');
    },

    saveNewItemFromModal(e) {
        if (e) e.preventDefault();
        const catSelect = document.getElementById('addItemCategorySelect');
        const nameInput = document.getElementById('addItemNameInput');
        const unitInput = document.getElementById('addItemUnitInput');
        const priceInput = document.getElementById('addItemPriceInput');

        if (!catSelect || !nameInput) return;

        const catIdx = parseInt(catSelect.value);
        const name = nameInput.value.trim();
        const unit = unitInput ? unitInput.value.trim() : 'กิโลกรัม';
        const price = priceInput ? (parseFloat(priceInput.value) || 0) : 0;

        if (!name) {
            UI.showToast("กรุณาระบุชื่อวัตถุดิบ", "warning");
            return;
        }

        const stdData = StandardPrices.getForMonth(this.currentYear, this.currentMonth);
        if (!stdData.categories[catIdx]) {
            UI.showToast("หมวดหมู่ไม่ถูกต้อง", "error");
            return;
        }

        stdData.categories[catIdx].items.push({
            name: name,
            unit: unit || 'กิโลกรัม',
            price: price
        });

        StandardPrices.saveForMonth(this.currentYear, this.currentMonth, stdData);
        this.render();
        this.closeAddItemModal();
        UI.showToast(`เพิ่ม "${name}" เข้าสู่ราคากลางเรียบร้อยแล้ว`, "success");
    }
};
