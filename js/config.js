/**
 * Global Configuration & Constants
 */
const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbzMGut0MDH3rNl_toe3mhuow70CoUx4HxXjqpIXqJNfBKD7tqE00uGPTMfX9qQOpKhS/exec",
    THAI_MONTHS: [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ],
    THAI_DAYS_SHORT: ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."],
    // Daily budget calculation: (86 students * 40 THB) + (39 students * 60 THB) = 3,440 + 2,340 = 5,780 THB/day
    DAILY_BUDGET_RATE: 5780,
    STORAGE_AUTH_KEY: "meal_tracker_auth"
};
