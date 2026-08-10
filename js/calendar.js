/**
 * Calendar Logic (Grid view & Mobile Agenda view)
 */
const _now = new Date();
let currentYear = _now.getFullYear();
let currentMonth = _now.getMonth() + 1; // 1-indexed (Jan=1 ... Dec=12)
let monthData = {}; // Cache: { "YYYY-MM-DD": { "มื้อเช้า": record, "มื้อกลางวัน": record, "มื้อเย็น": record } }

/** LocalStorage cache helpers — show data instantly while API loads */
function _cacheKey() { return `meal_cache_${currentYear}_${currentMonth}`; }

function _loadFromLocalCache() {
    try {
        const raw = localStorage.getItem(_cacheKey());
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') return parsed;
        }
    } catch (_) { /* ignore corrupt cache */ }
    return null;
}

function _saveToLocalCache() {
    try {
        localStorage.setItem(_cacheKey(), JSON.stringify(monthData));
    } catch (_) { /* storage full — silently skip */ }
}

async function loadCalendarView() {
    updateCalendarHeaderTitle();

    // 1) Show cached data instantly (if available)
    const cached = _loadFromLocalCache();
    if (cached && Object.keys(cached).length > 0) {
        monthData = cached;
        renderCalendarGrid();
        renderMobileAgendaView();
        calculateAndRenderStats();
    } else {
        renderEmptyCalendarGrid();
    }

    // 2) Fetch fresh data from Google Sheets in background
    try {
        const res = await API.getMonthData(currentYear, currentMonth);
        if (res && res.success && Array.isArray(res.data)) {
            organizeMonthDataCache(res.data);
            _saveToLocalCache();
        }
    } catch (err) {
        console.warn("Using offline / cached calendar data:", err);
    }

    // Ensure active month standard prices are synced
    if (typeof StandardPrices !== 'undefined') {
        const stdPrices = StandardPrices.getForMonth(currentYear, currentMonth);
        StandardPrices.propagatePriceChanges(currentYear, currentMonth, stdPrices);
    }

    // Prefetch favorite menus in background
    if (typeof FavoriteMenus !== 'undefined') {
        FavoriteMenus.fetchAll().catch(() => {});
    }

    renderCalendarGrid();
    renderMobileAgendaView();
    calculateAndRenderStats();
}

function updateCalendarHeaderTitle() {
    const thaiYear = currentYear + 543;
    const titleText = `${CONFIG.THAI_MONTHS[currentMonth - 1]} ${thaiYear}`;
    
    const titleEl = document.getElementById('calendarMonthTitle');
    if (titleEl) titleEl.innerText = titleText;

    const mobTitleEl = document.getElementById('mobileMonthTitle');
    if (mobTitleEl) mobTitleEl.innerText = titleText;
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    } else if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    loadCalendarView();
}

function resetToCurrentMonth() {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
    loadCalendarView();
}

function organizeMonthDataCache(recordsArray) {
    monthData = {};
    recordsArray.forEach(rec => {
        if (!rec.date) return;
        // Standardize YYYY-MM-DD format
        let dStr = rec.date;
        if (dStr.includes('T')) dStr = dStr.split('T')[0];

        if (!monthData[dStr]) {
            monthData[dStr] = {};
        }
        monthData[dStr][rec.meal_type] = rec;
    });
}

function renderEmptyCalendarGrid() {
    const grid = document.getElementById('calendarGrid');
    if (grid) {
        grid.innerHTML = '<div class="col-span-7 p-12 text-center text-slate-400 font-medium"><i class="fa-solid fa-spinner animate-spin mr-2"></i> กำลังโหลดข้อมูลปฏิทิน...</div>';
    }
    const agendaList = document.getElementById('agendaList');
    if (agendaList) {
        agendaList.innerHTML = '<div class="p-8 text-center text-slate-400 font-medium"><i class="fa-solid fa-spinner animate-spin mr-2"></i> กำลังโหลด...</div>';
    }
}

function renderCalendarGrid() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Padding for days before start of month
    for (let i = 0; i < firstDay; i++) {
        const padCell = document.createElement('div');
        padCell.className = 'bg-slate-50/50 min-h-[75px] sm:min-h-[105px] p-1.5 opacity-30 cursor-not-allowed';
        grid.appendChild(padCell);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day < 10 ? '0' + day : '' + day;
        const monthStr = currentMonth < 10 ? '0' + currentMonth : '' + currentMonth;
        const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;

        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-grid-cell bg-white p-1.5 sm:p-2 flex flex-col justify-between hover:bg-emerald-50/40 transition cursor-pointer group relative border-t border-l border-slate-100';
        dayCell.onclick = () => MealModal.openForDate(fullDateStr);

        // Day Number
        const dayHeader = document.createElement('div');
        dayHeader.className = 'flex items-center justify-between';
        
        const dayNum = document.createElement('span');
        dayNum.className = 'text-xs sm:text-sm font-bold text-slate-700 group-hover:text-emerald-850';
        dayNum.innerText = day;
        dayHeader.appendChild(dayNum);

        // Day Content Summary
        const dayEntries = monthData[fullDateStr] || {};
        const bRec = dayEntries['มื้อเช้า'];
        const lRec = dayEntries['มื้อเที่ยง'] || dayEntries['มื้อกลางวัน'];
        const dRec = dayEntries['มื้อเย็น'];

        const contentBox = document.createElement('div');
        contentBox.className = 'mt-1 space-y-0.5 overflow-hidden';

        if (bRec) {
            const badge = document.createElement('div');
            badge.className = 'badge-breakfast rounded px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold truncate flex items-center gap-1';
            badge.title = `มื้อเช้า: ${bRec.menu_name || 'ไม่มีชื่อเมนู'}`;
            badge.innerHTML = `<span class="shrink-0 font-bold">🌅 เช้า:</span> <span class="truncate">${escapeHtml(bRec.menu_name || 'ไม่มีชื่อเมนู')}</span>`;
            contentBox.appendChild(badge);
        }

        if (lRec) {
            const badge = document.createElement('div');
            badge.className = 'badge-lunch rounded px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold truncate flex items-center gap-1';
            badge.title = `มื้อเที่ยง: ${lRec.menu_name || 'ไม่มีชื่อเมนู'}`;
            badge.innerHTML = `<span class="shrink-0 font-bold">☀️ เที่ยง:</span> <span class="truncate">${escapeHtml(lRec.menu_name || 'ไม่มีชื่อเมนู')}</span>`;
            contentBox.appendChild(badge);
        }

        if (dRec) {
            const badge = document.createElement('div');
            badge.className = 'badge-dinner rounded px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold truncate flex items-center gap-1';
            badge.title = `มื้อเย็น: ${dRec.menu_name || 'ไม่มีชื่อเมนู'}`;
            badge.innerHTML = `<span class="shrink-0 font-bold">🌙 เย็น:</span> <span class="truncate">${escapeHtml(dRec.menu_name || 'ไม่มีชื่อเมนู')}</span>`;
            contentBox.appendChild(badge);
        }

        if (!bRec && !lRec && !dRec) {
            const emptyAdd = document.createElement('div');
            emptyAdd.className = 'opacity-0 group-hover:opacity-100 text-[10px] text-emerald-600 font-medium flex items-center justify-center py-1 transition';
            emptyAdd.innerHTML = '<i class="fa-solid fa-plus mr-0.5"></i> เพิ่ม';
            contentBox.appendChild(emptyAdd);
        }

        // Hover Tooltip / Detail Popup for Desktop & Mobile
        if (bRec || lRec || dRec) {
            const tooltip = document.createElement('div');
            tooltip.className = 'hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-30 pointer-events-none animate-fade-in border border-slate-700';
            let tooltipHTML = `<div class="font-bold text-emerald-300 mb-1.5 border-b border-slate-700 pb-1 flex items-center justify-between">
                <span>วันที่ ${day} ${CONFIG.THAI_MONTHS[currentMonth-1]}</span>
                <i class="fa-solid fa-utensils text-[10px] text-slate-400"></i>
            </div>`;
            
            if (bRec) tooltipHTML += `<div class="mb-1 text-amber-300"><b>🌅 เช้า:</b> ${escapeHtml(bRec.menu_name || '-')} <span class="text-white">(${Number(bRec.total_cost||0).toLocaleString('th-TH')}฿)</span></div>`;
            if (lRec) tooltipHTML += `<div class="mb-1 text-emerald-300"><b>☀️ เที่ยง:</b> ${escapeHtml(lRec.menu_name || '-')} <span class="text-white">(${Number(lRec.total_cost||0).toLocaleString('th-TH')}฿)</span></div>`;
            if (dRec) tooltipHTML += `<div class="text-indigo-300"><b>🌙 เย็น:</b> ${escapeHtml(dRec.menu_name || '-')} <span class="text-white">(${Number(dRec.total_cost||0).toLocaleString('th-TH')}฿)</span></div>`;

            tooltip.innerHTML = tooltipHTML;
            dayCell.appendChild(tooltip);
        }

        dayCell.appendChild(dayHeader);
        dayCell.appendChild(contentBox);
        grid.appendChild(dayCell);
    }
}

function renderMobileAgendaView() {
    const agendaList = document.getElementById('agendaList');
    if (!agendaList) return;

    agendaList.innerHTML = '';

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    let hasAnyData = false;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day < 10 ? '0' + day : '' + day;
        const monthStr = currentMonth < 10 ? '0' + currentMonth : '' + currentMonth;
        const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;

        const dayEntries = monthData[fullDateStr] || {};
        const bRec = dayEntries['มื้อเช้า'];
        const lRec = dayEntries['มื้อเที่ยง'] || dayEntries['มื้อกลางวัน'];
        const dRec = dayEntries['มื้อเย็น'];

        if (bRec || lRec || dRec) {
            hasAnyData = true;
            const dateObj = new Date(currentYear, currentMonth - 1, day);
            const dayOfWeekStr = CONFIG.THAI_DAYS_SHORT[dateObj.getDay()];

            const card = document.createElement('div');
            card.className = 'glass-card p-4 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500 transition';
            card.onclick = () => MealModal.openForDate(fullDateStr);

            let mealsHTML = '';
            if (bRec) {
                mealsHTML += `<div class="text-xs text-amber-700 font-semibold">🌅 เช้า: ${escapeHtml(bRec.menu_name || 'ไม่มีชื่อเมนู')} <span class="text-slate-500">(${Number(bRec.total_cost||0).toLocaleString('th-TH')}฿)</span></div>`;
            }
            if (lRec) {
                mealsHTML += `<div class="text-xs text-emerald-800 font-bold">☀️ เที่ยง: ${escapeHtml(lRec.menu_name || 'ไม่มีชื่อเมนู')} <span class="text-slate-500">(${Number(lRec.total_cost||0).toLocaleString('th-TH')}฿)</span></div>`;
            }
            if (dRec) {
                mealsHTML += `<div class="text-xs text-indigo-700 font-semibold">🌙 เย็น: ${escapeHtml(dRec.menu_name || 'ไม่มีชื่อเมนู')} <span class="text-slate-500">(${Number(dRec.total_cost||0).toLocaleString('th-TH')}฿)</span></div>`;
            }

            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-emerald-850 text-white flex flex-col items-center justify-center font-bold shadow-sm">
                        <span class="text-[10px] opacity-80 uppercase">${dayOfWeekStr}</span>
                        <span class="text-base leading-none">${day}</span>
                    </div>
                    <div class="space-y-0.5">
                        ${mealsHTML}
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-300 text-sm"></i>
            `;
            agendaList.appendChild(card);
        }
    }

    if (!hasAnyData) {
        agendaList.innerHTML = `
            <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                <i class="fa-regular fa-calendar-xmark text-3xl mb-2 text-slate-300"></i>
                <p class="text-xs font-semibold">ยังไม่มีรายการบันทึกในเดือนนี้</p>
                <p class="text-[11px] text-slate-400 mt-1">แตะปฏิทินเพื่อเลือกวันและบันทึกข้อมูล</p>
            </div>
        `;
    }
}
