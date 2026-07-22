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
