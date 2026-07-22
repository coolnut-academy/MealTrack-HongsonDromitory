/**
 * Google Sheets API Handler & Safe Data Parser
 */
const API = {
    async call(action, payload = {}) {
        payload.action = action;
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return data;
        } catch (err) {
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
    }
};
