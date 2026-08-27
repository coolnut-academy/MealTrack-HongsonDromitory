/**
 * UI Utilities, Modals & Toast Notifications
 */
const UI = {
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        
        let iconClass = 'fa-circle-info text-blue-500';
        let bgBorder = 'bg-white border-slate-200 text-slate-800';
        
        if (type === 'success') {
            iconClass = 'fa-circle-check text-emerald-600';
            bgBorder = 'bg-emerald-50 border-emerald-200 text-emerald-900';
        } else if (type === 'error') {
            iconClass = 'fa-circle-exclamation text-red-600';
            bgBorder = 'bg-red-50 border-red-200 text-red-900';
        } else if (type === 'warning') {
            iconClass = 'fa-triangle-exclamation text-amber-500';
            bgBorder = 'bg-amber-50 border-amber-200 text-amber-900';
        }

        toast.className = `toast-item flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold ${bgBorder}`;
        toast.innerHTML = `<i class="fa-solid ${iconClass} text-base"></i> <span>${escapeHtml(message)}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    showConfirmToast(message, confirmLabel, onConfirm, durationMs = 10000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-item flex flex-col gap-2.5 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 shadow-xl text-xs font-medium max-w-xs animate-fade-in';
        
        toast.innerHTML = `
            <div class="flex items-start gap-2">
                <i class="fa-solid fa-circle-question text-emerald-600 text-base mt-0.5"></i>
                <span class="flex-1 text-slate-800 leading-snug">${escapeHtml(message)}</span>
            </div>
            <div class="flex items-center justify-end gap-2 mt-1">
                <button type="button" class="btn-cancel px-2.5 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg text-xs transition">ข้าม</button>
                <button type="button" class="btn-confirm px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs shadow-xs transition">${escapeHtml(confirmLabel)}</button>
            </div>
        `;

        const dismiss = () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        };

        const timerId = setTimeout(dismiss, durationMs);

        toast.querySelector('.btn-cancel').onclick = () => {
            clearTimeout(timerId);
            dismiss();
        };

        toast.querySelector('.btn-confirm').onclick = () => {
            clearTimeout(timerId);
            dismiss();
            try { onConfirm(); } catch (e) { console.error(e); }
        };

        container.appendChild(toast);
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            this.closeMobileMenu();
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    },

    toggleMobileMenu() {
        const drawer = document.getElementById('mobileMenuDrawer');
        const backdrop = document.getElementById('mobileMenuBackdrop');
        const icon = document.getElementById('mobileMenuIcon');
        if (!drawer) return;

        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    },

    openMobileMenu() {
        const drawer = document.getElementById('mobileMenuDrawer');
        const backdrop = document.getElementById('mobileMenuBackdrop');
        const icon = document.getElementById('mobileMenuIcon');
        if (drawer) {
            drawer.classList.remove('hidden');
            drawer.classList.add('flex');
        }
        if (backdrop) backdrop.classList.remove('hidden');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        }
    },

    closeMobileMenu() {
        const drawer = document.getElementById('mobileMenuDrawer');
        const backdrop = document.getElementById('mobileMenuBackdrop');
        const icon = document.getElementById('mobileMenuIcon');
        if (drawer) {
            drawer.classList.add('hidden');
            drawer.classList.remove('flex');
        }
        if (backdrop) backdrop.classList.add('hidden');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
        }
    },

    setSyncStatus(status, message = "") {
        // status: 'syncing' | 'synced' | 'cached' | 'error' | 'offline'
        const syncIcon = document.getElementById('syncStatusIcon');
        const syncText = document.getElementById('syncStatusText');
        const drawerDot = document.getElementById('drawerSyncDot');
        const drawerText = document.getElementById('drawerSyncText');
        const desktopPill = document.getElementById('desktopSyncPill');
        const desktopMsg = document.getElementById('desktopSyncMsg');
        const desktopPercent = document.getElementById('desktopSyncPercent');
        const mobilePercent = document.getElementById('mobileSyncPercent');

        if (status === 'syncing') {
            if (syncIcon) {
                syncIcon.className = 'fa-solid fa-arrows-rotate animate-spin text-gold-400';
            }
            if (syncText) syncText.innerText = 'กำลังโหลด...';
            if (mobilePercent) mobilePercent.classList.remove('hidden');
            if (drawerDot) drawerDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse';
            if (drawerText) drawerText.innerText = message || 'กำลังซิงค์ข้อมูล...';
            if (desktopPill) {
                desktopPill.classList.remove('hidden');
                desktopPill.classList.add('flex');
            }
            if (desktopMsg) desktopMsg.innerText = message || 'กำลังโหลดข้อมูล...';
        } else if (status === 'synced') {
            if (syncIcon) {
                syncIcon.className = 'fa-solid fa-cloud-arrow-down text-emerald-300';
            }
            if (syncText) syncText.innerText = 'ซิงค์แล้ว';
            if (drawerDot) drawerDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400';
            if (drawerText) drawerText.innerText = 'เชื่อมต่อออนไลน์ (ล่าสุด)';
            if (desktopPill) {
                if (desktopMsg) desktopMsg.innerText = 'ซิงค์ข้อมูลสำเร็จ';
                if (desktopPercent) desktopPercent.innerText = '100%';
                setTimeout(() => {
                    if (desktopPill) {
                        desktopPill.classList.add('hidden');
                        desktopPill.classList.remove('flex');
                    }
                }, 1800);
            }
            if (mobilePercent) {
                setTimeout(() => {
                    if (mobilePercent) mobilePercent.classList.add('hidden');
                }, 1800);
            }
        } else if (status === 'cached' || status === 'offline') {
            if (syncIcon) {
                syncIcon.className = 'fa-solid fa-database text-amber-300';
            }
            if (syncText) syncText.innerText = 'ออฟไลน์';
            if (drawerDot) drawerDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
            if (drawerText) drawerText.innerText = 'ข้อมูลในเครื่อง (ออฟไลน์)';
            if (desktopPill) {
                if (desktopMsg) desktopMsg.innerText = 'ใช้ข้อมูลออฟไลน์ในเครื่อง';
                setTimeout(() => {
                    if (desktopPill) {
                        desktopPill.classList.add('hidden');
                        desktopPill.classList.remove('flex');
                    }
                }, 2000);
            }
            if (mobilePercent) mobilePercent.classList.add('hidden');
        } else {
            if (syncIcon) {
                syncIcon.className = 'fa-solid fa-triangle-exclamation text-rose-300';
            }
            if (syncText) syncText.innerText = 'ขัดข้อง';
            if (drawerDot) drawerDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-400';
            if (drawerText) drawerText.innerText = 'การเชื่อมต่อขัดข้อง';
            if (desktopPill) {
                if (desktopMsg) desktopMsg.innerText = 'การเชื่อมต่อเซิร์ฟเวอร์ขัดข้อง';
                setTimeout(() => {
                    if (desktopPill) {
                        desktopPill.classList.add('hidden');
                        desktopPill.classList.remove('flex');
                    }
                }, 2500);
            }
            if (mobilePercent) mobilePercent.classList.add('hidden');
        }
    },

    setMobileView(viewType) {
        const gridView = document.getElementById('calendarGridContainer');
        const agendaView = document.getElementById('agendaViewContainer');
        const btnGrid = document.getElementById('btnMobileViewGrid');
        const btnAgenda = document.getElementById('btnMobileViewAgenda');

        if (viewType === 'grid') {
            if (gridView) gridView.classList.remove('hidden');
            if (agendaView) agendaView.classList.add('hidden');
            if (btnGrid) {
                btnGrid.classList.add('bg-white', 'text-emerald-850', 'shadow-xs');
                btnGrid.classList.remove('text-slate-500');
            }
            if (btnAgenda) {
                btnAgenda.classList.remove('bg-white', 'text-emerald-850', 'shadow-xs');
                btnAgenda.classList.add('text-slate-500');
            }
        } else {
            if (gridView) gridView.classList.add('hidden');
            if (agendaView) agendaView.classList.remove('hidden');
            if (btnAgenda) {
                btnAgenda.classList.add('bg-white', 'text-emerald-850', 'shadow-xs');
                btnAgenda.classList.remove('text-slate-500');
            }
            if (btnGrid) {
                btnGrid.classList.remove('bg-white', 'text-emerald-850', 'shadow-xs');
                btnGrid.classList.add('text-slate-500');
            }
        }
    }
};

/**
 * Real-time Visual Progress Loader for API operations (Google Sheets sync)
 */
const ProgressLoader = {
    timers: [],
    currentPercent: 0,
    currentStep: 1,

    start(initialMsg = "กำลังเชื่อมต่อฐานข้อมูล Google Sheets...") {
        this.reset();
        this.showTopBar();
        this.set(12, initialMsg, 1);

        // Natural stepped progression while network is fetching from GAS
        const schedule = [
            { delay: 600, percent: 26, msg: "กำลังส่งคำขอข้อมูลเมนูอาหาร...", step: 1 },
            { delay: 1800, percent: 48, msg: "กำลังค้นหาและดึงข้อมูลรอบเดือนจาก Google Sheets...", step: 2 },
            { delay: 3800, percent: 68, msg: "กำลังดาวน์โหลดรายการวัตถุดิบและคำนวณงบประมาณ...", step: 3 },
            { delay: 6500, percent: 84, msg: "กำลังจัดกลุ่มเมนูอาหารและตรวจสอบความถูกต้อง...", step: 3 },
            { delay: 10000, percent: 93, msg: "กำลังประมวลผลข้อมูลขั้นสุดท้าย...", step: 4 }
        ];

        this.timers = [];
        schedule.forEach(s => {
            const t = setTimeout(() => {
                this.set(s.percent, s.msg, s.step);
            }, s.delay);
            this.timers.push(t);
        });
    },

    set(percent, message = "", step = 1) {
        this.currentPercent = Math.min(percent, 98);
        this.currentStep = step;

        // 1. Top slim progress bar
        const topBar = document.getElementById('topProgressBar');
        if (topBar) topBar.style.width = `${this.currentPercent}%`;

        // 2. Desktop & Mobile Header percent indicators
        const desktopPercent = document.getElementById('desktopSyncPercent');
        const desktopMsg = document.getElementById('desktopSyncMsg');
        const mobilePercent = document.getElementById('mobileSyncPercent');
        const drawerText = document.getElementById('drawerSyncText');
        
        if (desktopPercent) desktopPercent.innerText = `${this.currentPercent}%`;
        if (desktopMsg && message) desktopMsg.innerText = message;
        if (mobilePercent) {
            mobilePercent.innerText = `${this.currentPercent}%`;
            mobilePercent.classList.remove('hidden');
        }
        if (drawerText && message) drawerText.innerText = `${message} (${this.currentPercent}%)`;

        // 3. Calendar In-Grid Loader Card
        const cardBar = document.getElementById('calendarLoaderBar');
        const cardPercent = document.getElementById('calendarLoaderPercent');
        const cardStage = document.getElementById('calendarLoaderStage');
        const cardStepText = document.getElementById('calendarLoaderStepText');

        if (cardBar) cardBar.style.width = `${this.currentPercent}%`;
        if (cardPercent) cardPercent.innerText = `${this.currentPercent}%`;
        if (cardStage && message) cardStage.innerText = message;
        if (cardStepText) {
            cardStepText.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1 text-emerald-600"></i> ดำเนินการขั้นที่ ${step}/4 (${this.currentPercent}%)`;
        }
    },

    finish(success = true) {
        if (this.timers && this.timers.length > 0) {
            this.timers.forEach(t => clearTimeout(t));
            this.timers = [];
        }

        if (success) {
            this.currentPercent = 100;
            const topBar = document.getElementById('topProgressBar');
            if (topBar) topBar.style.width = '100%';

            const cardBar = document.getElementById('calendarLoaderBar');
            const cardPercent = document.getElementById('calendarLoaderPercent');
            const cardStage = document.getElementById('calendarLoaderStage');
            const cardStepText = document.getElementById('calendarLoaderStepText');

            if (cardBar) cardBar.style.width = '100%';
            if (cardPercent) cardPercent.innerText = '100%';
            if (cardStage) cardStage.innerText = 'โหลดข้อมูลเสร็จสมบูรณ์!';
            if (cardStepText) {
                cardStepText.innerHTML = `<i class="fa-solid fa-circle-check mr-1 text-emerald-600"></i> โหลดข้อมูลครบถ้วน 100%`;
            }

            const desktopPercent = document.getElementById('desktopSyncPercent');
            const desktopMsg = document.getElementById('desktopSyncMsg');
            const mobilePercent = document.getElementById('mobileSyncPercent');
            if (desktopPercent) desktopPercent.innerText = '100%';
            if (desktopMsg) desktopMsg.innerText = 'ซิงค์ข้อมูลสำเร็จ';
            if (mobilePercent) mobilePercent.innerText = '100%';
        }

        setTimeout(() => {
            this.hideTopBar();
            const mobilePercent = document.getElementById('mobileSyncPercent');
            if (mobilePercent) mobilePercent.classList.add('hidden');
        }, 500);
    },

    reset() {
        if (this.timers && this.timers.length > 0) {
            this.timers.forEach(t => clearTimeout(t));
            this.timers = [];
        }
        this.currentPercent = 0;
        const topBar = document.getElementById('topProgressBar');
        if (topBar) topBar.style.width = '0%';
    },

    showTopBar() {
        const c = document.getElementById('topProgressBarContainer');
        if (c) c.classList.remove('opacity-0');
    },

    hideTopBar() {
        const c = document.getElementById('topProgressBarContainer');
        if (c) {
            c.classList.add('opacity-0');
            setTimeout(() => {
                const topBar = document.getElementById('topProgressBar');
                if (topBar) topBar.style.width = '0%';
            }, 300);
        }
    }
};

// Global escape key handler to close mobile menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (typeof UI !== 'undefined' && UI.closeMobileMenu) {
            UI.closeMobileMenu();
        }
    }
});

function escapeHtml(text) {
    if (!text) return "";
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
