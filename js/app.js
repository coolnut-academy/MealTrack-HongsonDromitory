/**
 * Main Application Controller & Authentication Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    init() {
        this.checkAuthSession();
    },

    checkAuthSession() {
        const savedAuth = localStorage.getItem(CONFIG.STORAGE_AUTH_KEY);
        if (savedAuth === 'true') {
            UI.closeModal('authModal');
            loadCalendarView();
        } else {
            UI.openModal('authModal');
        }
    },

    togglePasscodeVisibility() {
        const input = document.getElementById('passcodeInput');
        const icon = document.getElementById('togglePasscodeIcon');
        if (!input || !icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const passcode = document.getElementById('passcodeInput').value;
        const btn = document.getElementById('loginBtn');
        const errDiv = document.getElementById('authError');

        if (!passcode) return;

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i> กำลังตรวจสอบ...`;
        }
        if (errDiv) errDiv.classList.add('hidden');

        try {
            const res = await API.verifyPasscode(passcode);
            if (res && res.success) {
                localStorage.setItem(CONFIG.STORAGE_AUTH_KEY, 'true');
                UI.closeModal('authModal');
                UI.showToast("เข้าสู่ระบบสำเร็จ", "success");
                loadCalendarView();
            } else {
                if (errDiv) errDiv.classList.remove('hidden');
            }
        } catch (err) {
            if (errDiv) errDiv.classList.remove('hidden');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<span>ยืนยันเข้าสู่ระบบ</span> <i class="fa-solid fa-arrow-right ml-1"></i>`;
            }
        }
    },

    handleLogout() {
        if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            localStorage.removeItem(CONFIG.STORAGE_AUTH_KEY);
            UI.openModal('authModal');
            const input = document.getElementById('passcodeInput');
            if (input) input.value = '';
            UI.showToast("ออกจากระบบแล้ว", "info");
        }
    }
};
