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

function escapeHtml(text) {
    if (!text) return "";
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
