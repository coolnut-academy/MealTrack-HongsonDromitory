/**
 * Statistics & Report Controller
 * Handles budget summary, ingredient consumption aggregation, category filtering, and enhanced CSV export.
 */
const Stats = {
    activeTab: 'budget',
    activeIngredientCat: 'ทั้งหมด',
    cachedAggregatedIngredients: [],

    openModal(initialTab = 'budget') {
        this.setFilterRange('month');
        this.switchTab(initialTab);
        UI.openModal('statsModal');
    },

    closeModal() {
        UI.closeModal('statsModal');
    },

    switchTab(tabName) {
        this.activeTab = tabName;

        const budgetBtn = document.getElementById('stats-tab-budget');
        const ingBtn = document.getElementById('stats-tab-ingredients');
        const budgetSec = document.getElementById('statsBudgetSection');
        const ingSec = document.getElementById('statsIngredientsSection');

        if (tabName === 'ingredients') {
            if (budgetBtn) {
                budgetBtn.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 hover:bg-slate-100 text-slate-600";
            }
            if (ingBtn) {
                ingBtn.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 bg-emerald-850 text-white shadow-xs";
            }
            if (budgetSec) budgetSec.classList.add('hidden');
            if (ingSec) ingSec.classList.remove('hidden');
        } else {
            if (budgetBtn) {
                budgetBtn.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 bg-emerald-850 text-white shadow-xs";
            }
            if (ingBtn) {
                ingBtn.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 hover:bg-slate-100 text-slate-600";
            }
            if (budgetSec) budgetSec.classList.remove('hidden');
            if (ingSec) ingSec.classList.add('hidden');
        }
    },

    setFilterRange(type) {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (type === 'today') {
            // start & end = today
        } else if (type === 'week') {
            const day = now.getDay();
            start.setDate(now.getDate() - day);
            end.setDate(now.getDate() + (6 - day));
        } else if (type === 'month') {
            start = new Date(currentYear, currentMonth - 1, 1);
            end = new Date(currentYear, currentMonth, 0);
        } else if (type === 'year') {
            start = new Date(currentYear, 0, 1);
            end = new Date(currentYear, 11, 31);
        }

        // Active tab styling
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('bg-emerald-850', 'text-white', 'shadow-xs');
            btn.classList.add('hover:bg-slate-100', 'text-slate-600');
        });

        const activeBtn = document.getElementById(`filter-btn-${type}`);
        if (activeBtn) {
            activeBtn.classList.remove('hover:bg-slate-100', 'text-slate-600');
            activeBtn.classList.add('bg-emerald-850', 'text-white', 'shadow-xs');
        }

        const startInput = document.getElementById('statsStartDate');
        const endInput = document.getElementById('statsEndDate');

        if (startInput) startInput.value = this.formatDateISO(start);
        if (endInput) endInput.value = this.formatDateISO(end);

        calculateAndRenderStats();
    },

    formatDateISO(d) {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    filterIngredientsCategory(catName) {
        this.activeIngredientCat = catName;

        const catMap = {
            'ทั้งหมด': 'ing-cat-all',
            'ข้าวสาร & เนื้อสัตว์': 'ing-cat-meat',
            'อาหารแห้ง/เครื่องปรุง': 'ing-cat-seasoning',
            'ผักสดและผลไม้': 'ing-cat-vege',
            'แก๊สหุงต้ม': 'ing-cat-gas'
        };

        document.querySelectorAll('.ing-cat-btn').forEach(btn => {
            btn.className = "ing-cat-btn px-3 py-1.5 font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition";
        });

        const activeId = catMap[catName];
        if (activeId) {
            const activeBtn = document.getElementById(activeId);
            if (activeBtn) {
                activeBtn.className = "ing-cat-btn px-3 py-1.5 font-bold rounded-lg bg-emerald-850 text-white transition";
            }
        }

        this.renderIngredientTable();
    },

    renderIngredientTable() {
        const tbody = document.getElementById('ingredientStatsTableBody');
        const searchInput = document.getElementById('statsIngredientSearch');
        const badge = document.getElementById('ingredientRowCountBadge');
        if (!tbody) return;

        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const items = this.cachedAggregatedIngredients || [];

        let totalIngCostSum = 0;
        items.forEach(it => { totalIngCostSum += it.total; });

        const filtered = items.filter(it => {
            const nameMatch = !keyword || it.name.toLowerCase().includes(keyword);
            
            let catMatch = true;
            if (this.activeIngredientCat === 'ข้าวสาร & เนื้อสัตว์') {
                catMatch = (it.category === 'อาหารสด' || it.name.includes('ข้าวสาร'));
            } else if (this.activeIngredientCat === 'อาหารแห้ง/เครื่องปรุง') {
                catMatch = (it.category === 'อาหารแห้ง/เครื่องปรุง' && !it.name.includes('ข้าวสาร'));
            } else if (this.activeIngredientCat === 'ผักสดและผลไม้') {
                catMatch = (it.category === 'ผักสดและผลไม้');
            } else if (this.activeIngredientCat === 'แก๊สหุงต้ม') {
                catMatch = (it.category === 'แก๊สหุงต้ม');
            }

            return nameMatch && catMatch;
        });

        if (badge) badge.innerText = `${filtered.length} รายการ`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-8 text-center text-slate-400">
                        <i class="fa-solid fa-inbox text-2xl mb-2 block"></i>
                        <p class="text-xs">ไม่พบข้อมูลวัตถุดิบในช่วงเวลาหรือหมวดหมู่ที่เลือก</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        let pageCostSum = 0;

        filtered.forEach((row, idx) => {
            pageCostSum += row.total;
            const pct = totalIngCostSum > 0 ? ((row.total / totalIngCostSum) * 100).toFixed(1) : '0.0';

            html += `
                <tr class="hover:bg-slate-50/90 transition border-b border-slate-100">
                    <td class="py-2.5 px-3 text-center text-slate-400 font-semibold text-xs">${idx + 1}</td>
                    <td class="py-2.5 px-4 font-bold text-slate-800 flex items-center gap-2 text-xs">
                        <span>${row.icon}</span>
                        <span>${escapeHtml(row.name)}</span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/70">
                            ${escapeHtml(row.category)}
                        </span>
                    </td>
                    <td class="py-2.5 px-3 text-right font-black text-emerald-850 text-xs">${row.qty.toLocaleString('th-TH', { maximumFractionDigits: 2 })}</td>
                    <td class="py-2.5 px-3 text-center text-slate-500 text-xs">${escapeHtml(row.unit)}</td>
                    <td class="py-2.5 px-4 text-right font-bold text-slate-800 text-xs">${row.total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="py-2.5 px-3 text-right text-slate-500 text-xs font-medium">${pct}%</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        const footerQtySum = document.getElementById('statTotalIngQtySum');
        const footerCostSum = document.getElementById('statTotalIngCostSum');
        if (footerQtySum) footerQtySum.innerText = filtered.length.toLocaleString('th-TH');
        if (footerCostSum) footerCostSum.innerText = `${pageCostSum.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
    },

    exportToCSV() {
        const sInput = document.getElementById('statsStartDate');
        const eInput = document.getElementById('statsEndDate');
        const sDate = sInput ? sInput.value : "";
        const eDate = eInput ? eInput.value : "";

        let csvContent = "\uFEFF=== รายงานสรุปค่าใช้จ่ายมื้ออาหาร ===\n";
        csvContent += "วันที่,มื้ออาหาร,ชื่อเมนู,ยอดรวมเงิน (บาท)\n";

        const mData = (typeof monthData !== 'undefined' && monthData) ? monthData : {};
        Object.keys(mData).sort().forEach(dStr => {
            if ((!sDate || dStr >= sDate) && (!eDate || dStr <= eDate)) {
                const dayObj = mData[dStr] || {};
                Object.keys(dayObj).forEach(mKey => {
                    const rec = dayObj[mKey];
                    if (rec) {
                        csvContent += `"${rec.date}","${rec.meal_type}","${rec.menu_name || ''}",${rec.total_cost || 0}\n`;
                    }
                });
            }
        });

        csvContent += "\n=== รายงานสรุปปริมาณวัตถุดิบและเครื่องปรุงสะสม ===\n";
        csvContent += "ลำดับ,ชื่อวัตถุดิบ/เครื่องปรุง,หมวดหมู่,ปริมาณรวมที่ใช้,หน่วยนับ,รวมเป็นเงิน (บาท)\n";

        const items = this.cachedAggregatedIngredients || [];
        items.forEach((row, idx) => {
            csvContent += `${idx + 1},"${row.name}","${row.category}",${row.qty},"${row.unit}",${row.total}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Meal_And_Ingredients_Summary_${currentYear}_${currentMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        UI.showToast("ดาวน์โหลดไฟล์ CSV รายงานสรุปเรียบร้อยแล้ว", "success");
    },

    printReport() {
        document.body.classList.remove('printing-daily');
        document.body.classList.add('printing-stats');

        const cleanup = () => {
            document.body.classList.remove('printing-stats');
            window.removeEventListener('afterprint', cleanup);
        };
        window.addEventListener('afterprint', cleanup);

        setTimeout(() => {
            window.print();
            setTimeout(cleanup, 2000);
        }, 100);
    }
};

function calculateAndRenderStats() {
    const sInput = document.getElementById('statsStartDate');
    const eInput = document.getElementById('statsEndDate');
    const sDate = sInput ? sInput.value : "";
    const eDate = eInput ? eInput.value : "";

    const label = document.getElementById('reportRangeLabel');
    if (label) {
        label.innerText = `ประจำช่วงวันที่ ${sDate || '-'} ถึง ${eDate || '-'}`;
    }

    // 1. Calculate Budget Stats
    let totalSpent = 0;
    let breakfastSpent = 0;
    let lunchSpent = 0;
    let dinnerSpent = 0;
    let recordedDaysSet = new Set();

    // 2. Aggregate Ingredients Map
    const ingredientMap = {};

    const mData = (typeof monthData !== 'undefined' && monthData) ? monthData : {};
    Object.keys(mData).forEach(dStr => {
        if ((!sDate || dStr >= sDate) && (!eDate || dStr <= eDate)) {
            const dayObj = mData[dStr] || {};
            Object.keys(dayObj).forEach(mealKey => {
                const rec = dayObj[mealKey];
                if (!rec) return;
                const cost = Number(rec.total_cost) || 0;
                totalSpent += cost;
                recordedDaysSet.add(dStr);

                if (mealKey === 'มื้อเช้า') breakfastSpent += cost;
                if (mealKey === 'มื้อกลางวัน' || mealKey === 'มื้อเที่ยง') lunchSpent += cost;
                if (mealKey === 'มื้อเย็น') dinnerSpent += cost;

                // Process ingredient items
                if (Array.isArray(rec.items)) {
                    rec.items.forEach(it => {
                        const itemName = (it.item || "").trim();
                        const qty = Number(it.qty) || 0;
                        const rowTotal = Number(it.total) || (qty * (Number(it.price) || 0));

                        if (itemName && qty > 0) {
                            if (!ingredientMap[itemName]) {
                                const meta = StandardPrices.getItemMeta(itemName);
                                ingredientMap[itemName] = {
                                    name: itemName,
                                    qty: 0,
                                    total: 0,
                                    unit: meta.unit,
                                    category: meta.category,
                                    icon: meta.icon
                                };
                            }
                            ingredientMap[itemName].qty += qty;
                            ingredientMap[itemName].total += rowTotal;
                        }
                    });
                }
            });
        }
    });

    const daysCount = recordedDaysSet.size;
    const estimatedBudget = daysCount * CONFIG.DAILY_BUDGET_RATE;

    const totalEl = document.getElementById('statTotalSpent');
    const daysEl = document.getElementById('statDaysCount');
    const budgetEl = document.getElementById('statAllocatedBudget');
    const breakfastEl = document.getElementById('statBreakfastSpent');
    const lunchEl = document.getElementById('statLunchSpent');
    const dinnerEl = document.getElementById('statDinnerSpent');

    if (totalEl) totalEl.innerText = totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (daysEl) daysEl.innerText = daysCount;
    if (budgetEl) budgetEl.innerText = estimatedBudget.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (breakfastEl) breakfastEl.innerText = `${breakfastSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
    if (lunchEl) lunchEl.innerText = `${lunchSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
    if (dinnerEl) dinnerEl.innerText = `${dinnerSpent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;

    // 3. Process & Render Ingredient Summary Cards & Table
    const aggregatedList = Object.values(ingredientMap).sort((a, b) => b.total - a.total);
    Stats.cachedAggregatedIngredients = aggregatedList;

    let totalRiceKg = 0;
    let totalPorkKg = 0;
    let totalPorkCost = 0;
    let totalChickenKg = 0;
    let totalChickenCost = 0;
    let totalSeasoningCost = 0;
    let seasoningTypesCount = 0;

    aggregatedList.forEach(it => {
        const lower = it.name.toLowerCase();
        
        // Rice
        if (lower.includes('ข้าวสาร')) {
            totalRiceKg += it.qty;
        }

        // Pork Group
        if (lower.includes('หมู')) {
            totalPorkKg += it.qty;
            totalPorkCost += it.total;
        }

        // Chicken Group
        if (lower.includes('ไก่')) {
            totalChickenKg += it.qty;
            totalChickenCost += it.total;
        }

        // Seasonings & Dry Goods
        if (it.category === 'อาหารแห้ง/เครื่องปรุง' && !lower.includes('ข้าวสาร')) {
            totalSeasoningCost += it.total;
            seasoningTypesCount++;
        }
    });

    const riceKgEl = document.getElementById('statRiceKg');
    const riceBagsEl = document.getElementById('statRiceBags');
    const porkKgEl = document.getElementById('statPorkKg');
    const porkCostEl = document.getElementById('statPorkCost');
    const chickenKgEl = document.getElementById('statChickenKg');
    const chickenCostEl = document.getElementById('statChickenCost');
    const seasoningCountEl = document.getElementById('statSeasoningTypesCount');
    const seasoningCostEl = document.getElementById('statSeasoningCost');

    if (riceKgEl) riceKgEl.innerText = totalRiceKg.toLocaleString('th-TH', { maximumFractionDigits: 2 });
    if (riceBagsEl) riceBagsEl.innerText = (totalRiceKg / 45).toFixed(1);
    if (porkKgEl) porkKgEl.innerText = totalPorkKg.toLocaleString('th-TH', { maximumFractionDigits: 2 });
    if (porkCostEl) porkCostEl.innerText = totalPorkCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (chickenKgEl) chickenKgEl.innerText = totalChickenKg.toLocaleString('th-TH', { maximumFractionDigits: 2 });
    if (chickenCostEl) chickenCostEl.innerText = totalChickenCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (seasoningCountEl) seasoningCountEl.innerText = seasoningTypesCount;
    if (seasoningCostEl) seasoningCostEl.innerText = totalSeasoningCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    Stats.renderIngredientTable();
}
