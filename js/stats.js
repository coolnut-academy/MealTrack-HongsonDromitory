/**
 * Statistics & Report Controller
 */
const Stats = {
    openModal() {
        this.setFilterRange('month');
        UI.openModal('statsModal');
    },

    closeModal() {
        UI.closeModal('statsModal');
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

    exportToCSV() {
        let csvContent = "\uFEFFวันที่,มื้ออาหาร,ชื่อเมนู,ยอดรวมเงิน (บาท)\n";

        Object.keys(monthData).sort().forEach(dStr => {
            const dayObj = monthData[dStr];
            Object.keys(dayObj).forEach(mKey => {
                const rec = dayObj[mKey];
                csvContent += `"${rec.date}","${rec.meal_type}","${rec.menu_name || ''}",${rec.total_cost || 0}\n`;
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Meal_Summary_${currentYear}_${currentMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        UI.showToast("ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว", "success");
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

    let totalSpent = 0;
    let breakfastSpent = 0;
    let lunchSpent = 0;
    let dinnerSpent = 0;
    let recordedDaysSet = new Set();

    Object.keys(monthData).forEach(dStr => {
        if ((!sDate || dStr >= sDate) && (!eDate || dStr <= eDate)) {
            const dayObj = monthData[dStr];
            Object.keys(dayObj).forEach(mealKey => {
                const rec = dayObj[mealKey];
                const cost = Number(rec.total_cost) || 0;
                totalSpent += cost;
                recordedDaysSet.add(dStr);

                if (mealKey === 'มื้อเช้า') breakfastSpent += cost;
                if (mealKey === 'มื้อกลางวัน') lunchSpent += cost;
                if (mealKey === 'มื้อเย็น') dinnerSpent += cost;
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
}
