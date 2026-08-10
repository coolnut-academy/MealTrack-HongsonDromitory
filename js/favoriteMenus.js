/**
 * Popular / Favorite Menus (Recipe Book) Manager & Modal Controller
 * Synchronizes with Google Sheets as primary storage, using LocalStorage as cache.
 */

const FAVORITE_MENUS_CACHE_KEY = "meal_favorite_menus_cache";

const FavoriteMenus = {
    cache: [],

    _loadFromCache() {
        try {
            const raw = localStorage.getItem(FAVORITE_MENUS_CACHE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    this.cache = parsed;
                    return parsed;
                }
            }
        } catch (_) {}
        this.cache = [];
        return [];
    },

    _saveToCache(data) {
        this.cache = data || [];
        try {
            localStorage.setItem(FAVORITE_MENUS_CACHE_KEY, JSON.stringify(this.cache));
        } catch (_) {}
    },

    getAll() {
        if (!this.cache || this.cache.length === 0) {
            this._loadFromCache();
        }
        return this.cache;
    },

    async fetchAll() {
        this._loadFromCache();
        try {
            const res = await API.getFavoriteMenus();
            if (res && res.success && Array.isArray(res.data)) {
                this._saveToCache(res.data);
                return res.data;
            }
        } catch (err) {
            console.warn("Using cached favorite menus:", err);
        }
        return this.getAll();
    },

    search(keyword) {
        if (!keyword || !keyword.trim()) return [];
        const clean = keyword.trim().toLowerCase();
        const all = this.getAll();
        const results = [];

        all.forEach(menu => {
            const nameLower = (menu.name || "").toLowerCase();
            if (nameLower.includes(clean)) {
                let score = 0;
                if (nameLower === clean) score = 100;
                else if (nameLower.startsWith(clean)) score = 80;
                else score = 50;

                results.push({
                    ...menu,
                    _score: score
                });
            }
        });

        results.sort((a, b) => (b.use_count || 0) - (a.use_count || 0) || b._score - a._score);
        return results;
    },

    async save(menuData) {
        if (!menuData || !menuData.name) return { success: false, message: "ไม่มีชื่อเมนู" };

        const nameTrimmed = menuData.name.trim();
        const current = this.getAll();
        const existingIdx = current.findIndex(m => m.name.trim().toLowerCase() === nameTrimmed.toLowerCase());

        const payload = {
            id: menuData.id || (existingIdx >= 0 ? current[existingIdx].id : null),
            name: nameTrimmed,
            items: menuData.items || [],
            total_cost: Number(menuData.total_cost) || 0
        };

        // Optimistic cache update
        if (existingIdx >= 0) {
            current[existingIdx] = {
                ...current[existingIdx],
                items: payload.items,
                total_cost: payload.total_cost,
                updated_at: new Date().toISOString(),
                use_count: (Number(current[existingIdx].use_count) || 0) + 1
            };
        } else {
            current.push({
                id: payload.id || ("fav_" + Date.now()),
                name: payload.name,
                items: payload.items,
                total_cost: payload.total_cost,
                updated_at: new Date().toISOString(),
                use_count: 1
            });
        }
        this._saveToCache(current);

        // Sync with Google Sheets
        try {
            const res = await API.saveFavoriteMenu(payload);
            if (res && res.success) {
                // Refresh full list from remote to keep IDs and use_count in sync
                await this.fetchAll();
                return res;
            }
        } catch (err) {
            console.warn("Failed to sync favorite menu to Google Sheets:", err);
            UI.showToast("บันทึกสูตรในเครื่องแล้ว (ไม่สามารถส่งไป Google Sheets ได้)", "warning");
        }
        return { success: true };
    },

    async delete(id) {
        if (!id) return;
        let current = this.getAll();
        current = current.filter(m => m.id !== id);
        this._saveToCache(current);

        try {
            await API.deleteFavoriteMenu(id);
            await this.fetchAll();
        } catch (err) {
            console.warn("Failed to delete favorite menu from Google Sheets:", err);
        }
    }
};

/**
 * Favorite Menus Modal UI Controller
 */
const FavoriteMenusModal = {
    searchFilter: "",
    expandedCards: new Set(),
    editingMenuId: null,

    open() {
        this.searchFilter = "";
        const searchInput = document.getElementById('favMenuSearchInput');
        if (searchInput) searchInput.value = "";
        
        UI.openModal('favoriteMenusModal');
        this.render();

        // Fetch fresh from Google Sheets in background
        FavoriteMenus.fetchAll().then(() => {
            this.render();
        });
    },

    close() {
        UI.closeModal('favoriteMenusModal');
    },

    setSearchFilter(val) {
        this.searchFilter = (val || "").trim().toLowerCase();
        this.render();
    },

    toggleExpand(id) {
        if (this.expandedCards.has(id)) {
            this.expandedCards.delete(id);
        } else {
            this.expandedCards.add(id);
        }
        this.render();
    },

    render() {
        const container = document.getElementById('favMenuListContainer');
        const countBadge = document.getElementById('favMenuTotalCountBadge');
        if (!container) return;

        let menus = FavoriteMenus.getAll();

        if (this.searchFilter) {
            menus = menus.filter(m => (m.name || "").toLowerCase().includes(this.searchFilter));
        }

        // Sort by use_count descending, then by name
        menus.sort((a, b) => (Number(b.use_count) || 0) - (Number(a.use_count) || 0) || (a.name || "").localeCompare(b.name || "", 'th'));

        if (countBadge) countBadge.innerText = `${menus.length} รายการ`;

        if (menus.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                    <i class="fa-solid fa-utensils text-3xl mb-2 text-slate-300"></i>
                    <p class="text-xs font-bold text-slate-600">ยังไม่มีข้อมูลเมนูยอดฮิต</p>
                    <p class="text-[11px] text-slate-400 mt-1">เมนูจะถูกบันทึกอัตโนมัติเมื่อผู้ใช้บันทึกรายการอาหารมื้อเช้า/เที่ยง/เย็น หรือเพิ่มเมนูใหม่ด้วยตนเอง</p>
                </div>
            `;
            return;
        }

        let html = '';
        menus.forEach((menu, idx) => {
            const isExpanded = this.expandedCards.has(menu.id);
            const items = menu.items || [];
            const useCount = Number(menu.use_count) || 1;
            const totalCost = Number(menu.total_cost) || 0;

            let itemsPreview = items.map(it => `${escapeHtml(it.item || '')} (${it.qty || 1})`).join(', ');
            if (!itemsPreview) itemsPreview = "ไม่มีรายละเอียดวัตถุดิบ";

            let itemsTableRows = '';
            items.forEach((it, iIdx) => {
                const q = Number(it.qty) || 0;
                const p = Number(it.price) || 0;
                const tot = Number(it.total) || (q * p);
                itemsTableRows += `
                    <tr class="border-b border-slate-100 hover:bg-slate-50/60 text-xs">
                        <td class="py-1.5 px-3 text-center text-slate-400 font-medium">${iIdx + 1}</td>
                        <td class="py-1.5 px-3 font-semibold text-slate-800">${escapeHtml(it.item || '')}</td>
                        <td class="py-1.5 px-3 text-center text-slate-700 font-bold">${q}</td>
                        <td class="py-1.5 px-3 text-right text-emerald-800 font-bold">${p.toLocaleString('th-TH')} ฿</td>
                        <td class="py-1.5 px-3 text-right text-slate-800 font-bold">${tot.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                    </tr>
                `;
            });

            html += `
                <div class="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition overflow-hidden">
                    <div class="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-gradient-to-r from-white via-white to-emerald-50/30"
                        onclick="FavoriteMenusModal.toggleExpand('${menu.id}')">
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-850 border border-emerald-200/60 flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-xs">
                                <i class="fa-solid fa-utensils"></i>
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <h4 class="font-bold text-sm sm:text-base text-slate-800 truncate">${escapeHtml(menu.name)}</h4>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                        <i class="fa-solid fa-fire-flame-curved text-amber-500"></i> บันทึกแล้ว ${useCount} ครั้ง
                                    </span>
                                </div>
                                <p class="text-xs text-slate-500 truncate mt-0.5">${itemsPreview}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            <div class="text-right hidden sm:block">
                                <span class="text-[10px] text-slate-400 font-medium block">ประมาณการมื้อนี้</span>
                                <span class="text-sm font-bold text-emerald-850">${totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                            </div>

                            <button type="button" onclick="event.stopPropagation(); FavoriteMenusModal.openEditModal('${menu.id}')"
                                class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-850 transition flex items-center justify-center text-xs"
                                title="แก้ไขสูตรเมนูนี้">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" onclick="event.stopPropagation(); FavoriteMenusModal.deleteMenu('${menu.id}', '${escapeHtml(menu.name)}')"
                                class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 transition flex items-center justify-center text-xs"
                                title="ลบเมนูนี้ออกจากสูตรยอดฮิต">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            <div class="w-6 h-6 flex items-center justify-center text-slate-400">
                                <i class="fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-xs"></i>
                            </div>
                        </div>
                    </div>

                    ${isExpanded ? `
                        <div class="border-t border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 space-y-3 animate-fade-in">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-bold text-slate-700 flex items-center gap-1.5">
                                    <i class="fa-solid fa-list-check text-emerald-700"></i> ส่วนประกอบและปริมาณในสูตร (${items.length} รายการ)
                                </span>
                                <span class="font-bold text-emerald-850 sm:hidden">รวมเป็นเงิน: ${totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</span>
                            </div>

                            <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                                <table class="w-full text-left border-collapse">
                                    <thead class="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase">
                                        <tr>
                                            <th class="py-2 px-3 text-center w-10">ที่</th>
                                            <th class="py-2 px-3">วัตถุดิบ / เครื่องปรุง</th>
                                            <th class="py-2 px-3 text-center w-20">จำนวน</th>
                                            <th class="py-2 px-3 text-right w-24">หน่วยละ</th>
                                            <th class="py-2 px-3 text-right w-28">รวมเป็นเงิน</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${itemsTableRows}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        container.innerHTML = html;
    },

    openAddModal() {
        this.editingMenuId = null;
        const titleEl = document.getElementById('favMenuFormTitle');
        if (titleEl) titleEl.innerText = "เพิ่มสูตรเมนูยอดฮิตใหม่";

        const nameInput = document.getElementById('favMenuFormNameInput');
        if (nameInput) nameInput.value = "";

        this.editingItems = [
            { item: "", qty: 1, price: 0, total: 0 }
        ];

        this.renderFormItemsRows();
        UI.openModal('favMenuFormModal');
    },

    openEditModal(id) {
        const menus = FavoriteMenus.getAll();
        const target = menus.find(m => m.id === id);
        if (!target) return;

        this.editingMenuId = id;
        const titleEl = document.getElementById('favMenuFormTitle');
        if (titleEl) titleEl.innerText = `แก้ไขสูตรเมนู "${target.name}"`;

        const nameInput = document.getElementById('favMenuFormNameInput');
        if (nameInput) nameInput.value = target.name || "";

        this.editingItems = JSON.parse(JSON.stringify(target.items || []));
        if (this.editingItems.length === 0) {
            this.editingItems.push({ item: "", qty: 1, price: 0, total: 0 });
        }

        this.renderFormItemsRows();
        UI.openModal('favMenuFormModal');
    },

    closeFormModal() {
        UI.closeModal('favMenuFormModal');
    },

    editingItems: [],

    renderFormItemsRows() {
        const tbody = document.getElementById('favMenuFormItemsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.editingItems.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-100';
            tr.innerHTML = `
                <td class="py-2 px-3 text-center text-slate-400 text-xs font-medium">${idx + 1}</td>
                <td class="py-1.5 px-2">
                    <input type="text" value="${escapeHtml(row.item || '')}" 
                        onchange="FavoriteMenusModal.updateFormItem(${idx}, 'item', this.value)"
                        placeholder="ชื่อวัตถุดิบ (เช่น หมูบด)" 
                        class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none">
                </td>
                <td class="py-1.5 px-2">
                    <input type="number" step="any" min="0" value="${row.qty !== undefined ? row.qty : 1}" 
                        onchange="FavoriteMenusModal.updateFormItem(${idx}, 'qty', this.value)"
                        class="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-bold">
                </td>
                <td class="py-1.5 px-2">
                    <input type="number" step="any" min="0" value="${row.price !== undefined ? row.price : 0}" 
                        onchange="FavoriteMenusModal.updateFormItem(${idx}, 'price', this.value)"
                        class="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-bold text-emerald-850">
                </td>
                <td class="py-1.5 px-3 text-right font-bold text-slate-700 text-xs">
                    ${(Number(row.total) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                </td>
                <td class="py-1.5 px-2 text-center">
                    <button type="button" onclick="FavoriteMenusModal.removeFormItemRow(${idx})" class="text-slate-300 hover:text-red-600 transition p-1">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        this.calculateFormTotalCost();
    },

    updateFormItem(index, field, val) {
        if (!this.editingItems[index]) return;
        if (field === 'qty' || field === 'price') {
            this.editingItems[index][field] = parseFloat(val) || 0;
        } else {
            this.editingItems[index][field] = val.trim();
        }
        const q = Number(this.editingItems[index].qty) || 0;
        const p = Number(this.editingItems[index].price) || 0;
        this.editingItems[index].total = q * p;

        this.renderFormItemsRows();
    },

    addFormItemRow() {
        this.editingItems.push({ item: "", qty: 1, price: 0, total: 0 });
        this.renderFormItemsRows();
    },

    removeFormItemRow(index) {
        if (this.editingItems.length > index) {
            this.editingItems.splice(index, 1);
            this.renderFormItemsRows();
        }
    },

    calculateFormTotalCost() {
        const grand = this.editingItems.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
        const display = document.getElementById('favMenuFormTotalCostDisplay');
        if (display) display.innerText = grand.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    async saveFormMenu(e) {
        if (e) e.preventDefault();

        const nameInput = document.getElementById('favMenuFormNameInput');
        const name = nameInput ? nameInput.value.trim() : "";

        if (!name) {
            UI.showToast("กรุณาระบุชื่อเมนู", "warning");
            return;
        }

        const validItems = this.editingItems.filter(it => (it.item || "").trim() !== "");
        if (validItems.length === 0) {
            UI.showToast("กรุณาเพิ่มส่วนประกอบอย่างน้อย 1 รายการ", "warning");
            return;
        }

        const totalCost = validItems.reduce((sum, row) => sum + (Number(row.total) || 0), 0);

        const menuData = {
            id: this.editingMenuId,
            name: name,
            items: validItems,
            total_cost: totalCost
        };

        this.closeFormModal();
        UI.showToast("กำลังบันทึกสูตรเมนูยอดฮิต...", "info");

        const res = await FavoriteMenus.save(menuData);
        if (res && res.success) {
            UI.showToast(`บันทึกสูตรเมนู "${name}" เรียบร้อยแล้ว`, "success");
            this.render();
        }
    },

    async deleteMenu(id, name) {
        if (confirm(`คุณต้องการลบเมนู "${name}" ออกจากสูตรยอดฮิตใช่หรือไม่?`)) {
            await FavoriteMenus.delete(id);
            UI.showToast(`ลบเมนู "${name}" เรียบร้อยแล้ว`, "info");
            this.render();
        }
    }
};
