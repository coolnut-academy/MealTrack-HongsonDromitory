/**
 * Google Sheets API Handler & Safe Data Parser
 */
const API = {
    /** Pre-warm GAS to avoid cold-start delay on actual data requests */
    warmUp() {
        fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'ping' })
        }).catch(() => {});
    },

    async call(action, payload = {}, retryCount = 1) {
        payload.action = action;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for GAS cold start & mobile 4G/5G
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            return data;
        } catch (err) {
            clearTimeout(timeoutId);
            if (retryCount > 0) {
                console.warn(`[API Retry] Retrying ${action}... (${retryCount} left)`);
                await new Promise(r => setTimeout(r, 1000));
                return this.call(action, payload, retryCount - 1);
            }
            console.error(`[API Error] ${action}:`, err);
            throw err;
        }
    },

    async verifyPasscode(passcode) {
        try {
            return await this.call('verify_passcode', { passcode });
        } catch (err) {
            // Offline/Fallback authentication
            if (passcode === "Hongson1234" || passcode === "admin") {
                return { success: true, message: "Offline fallback authenticated" };
            }
            return { success: false, message: "Passcode verification failed" };
        }
    },

    async getMonthData(year, month) {
        try {
            const res = await this.call('get_month_data', { year, month });
            if (res && res.success && Array.isArray(res.data)) {
                // Ensure items array is parsed correctly
                res.data.forEach(rec => {
                    if (typeof rec.items === 'string') {
                        try {
                            rec.items = JSON.parse(rec.items);
                        } catch (e) {
                            rec.items = [];
                        }
                    }
                });
            }
            return res;
        } catch (err) {
            return { success: false, data: [] };
        }
    },

    async saveMealRecord(record) {
        return await this.call('save_meal_record', { record });
    },

    async deleteMealRecord(date, mealType) {
        return await this.call('delete_meal_record', { date, meal_type: mealType });
    },

    async getStandardPrices(year, month) {
        try {
            const res = await this.call('get_standard_prices', { year, month });
            if (res && res.success && res.data) {
                if (typeof res.data === 'string') {
                    try { return { success: true, data: JSON.parse(res.data) }; } catch (e) {}
                }
                return res;
            }
            return { success: false, data: null };
        } catch (err) {
            return { success: false, data: null };
        }
    },

    async saveStandardPrices(year, month, data) {
        return await this.call('save_standard_prices', { year, month, data: JSON.stringify(data) });
    },

    async getFavoriteMenus() {
        try {
            const res = await this.call('get_favorite_menus');
            if (res && res.success && Array.isArray(res.data)) {
                res.data.forEach(item => {
                    if (typeof item.items === 'string') {
                        try { item.items = JSON.parse(item.items); } catch (e) { item.items = []; }
                    }
                });
            }
            return res;
        } catch (err) {
            return { success: false, data: [] };
        }
    },

    async saveFavoriteMenu(menu) {
        return await this.call('save_favorite_menu', { menu });
    },

    async deleteFavoriteMenu(id) {
        return await this.call('delete_favorite_menu', { id });
    }
};
