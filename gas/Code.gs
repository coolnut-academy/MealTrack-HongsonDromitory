/**
 * Code.gs — ไฟล์หลัก Google Apps Script สำหรับระบบ MealTrack โรงเรียนห้องสอนศึกษาฯ
 * คัดลอกโค้ดทั้งหมดนี้ไปวางทับไฟล์ Code.gs ใน Google Apps Script Project
 */

function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    var action = payload.action || "";
    var result = { success: false, message: "Invalid action" };

    // Route: Favorite Menus Actions (ส่งไปจัดการที่ FavoriteMenus.gs)
    if (action === "get_favorite_menus" || action === "save_favorite_menu" || action === "delete_favorite_menu") {
      result = handleFavoriteMenus(action, payload);
    }
    // Route: Ping / Warm Up
    else if (action === "ping") {
      result = { success: true, message: "pong" };
    }
    // Route: Authentication
    else if (action === "verify_passcode") {
      result = verifyPasscode(payload.passcode);
    }
    // Route: Calendar Month Data
    else if (action === "get_month_data") {
      result = getMonthData(payload.year, payload.month);
    }
    else if (action === "save_meal_record") {
      result = saveMealRecord(payload.record);
    }
    else if (action === "delete_meal_record") {
      result = deleteMealRecord(payload.date, payload.meal_type);
    }
    // Route: Monthly Standard Prices
    else if (action === "get_standard_prices") {
      result = getStandardPrices(payload.year, payload.month);
    }
    else if (action === "save_standard_prices") {
      result = saveStandardPrices(payload.year, payload.month, payload.data);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "API is active" }))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ==========================================================================
   AUTHENTICATION
   ========================================================================== */
function verifyPasscode(passcode) {
  var validPasscodes = ["Hongson1234", "admin", "1234"];
  if (validPasscodes.indexOf(passcode) !== -1) {
    return { success: true, message: "Authenticated" };
  }
  return { success: false, message: "Passcode verification failed" };
}


/* ==========================================================================
   MEAL RECORDS (บันทึกมื้ออาหาร)
   ========================================================================== */
function getMealRecordsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MealRecords");
  if (!sheet) {
    sheet = ss.insertSheet("MealRecords");
    sheet.appendRow(["Date", "MealType", "MenuName", "ItemsJSON", "TotalCost", "Status"]);
  }
  return sheet;
}

function findHeaderIndex(headers, possibleNames) {
  for (var i = 0; i < headers.length; i++) {
    var h = (headers[i] || "").toString().trim().toLowerCase();
    for (var j = 0; j < possibleNames.length; j++) {
      if (h === possibleNames[j].toLowerCase()) return i;
    }
  }
  return -1;
}

function getMonthData(year, month) {
  var sheet = getMealRecordsSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  var headers = data[0];
  var dateIdx = findHeaderIndex(headers, ["Date", "date"]);
  var mealTypeIdx = findHeaderIndex(headers, ["MealType", "meal_type"]);
  var menuNameIdx = findHeaderIndex(headers, ["MenuName", "menu_name"]);
  var itemsIdx = findHeaderIndex(headers, ["ItemsJSON", "items", "items_json"]);
  var totalCostIdx = findHeaderIndex(headers, ["TotalCost", "total_cost"]);
  var statusIdx = findHeaderIndex(headers, ["Status", "status"]);

  if (dateIdx === -1) dateIdx = 0;
  if (mealTypeIdx === -1) mealTypeIdx = 1;

  var results = [];

  for (var i = 1; i < data.length; i++) {
    var rowDate = data[i][dateIdx];
    if (!rowDate) continue;

    var d = new Date(rowDate);
    if (isNaN(d.getTime())) continue;

    var rYear = d.getFullYear();
    var rMonth = d.getMonth() + 1;

    // Check matching year and month
    if (rYear === Number(year) && rMonth === Number(month)) {
      var dateStr = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
      var record = {
        date: dateStr,
        meal_type: mealTypeIdx >= 0 ? data[i][mealTypeIdx] : "",
        menu_name: menuNameIdx >= 0 ? data[i][menuNameIdx] : "",
        items: itemsIdx >= 0 ? data[i][itemsIdx] : "[]",
        total_cost: totalCostIdx >= 0 ? Number(data[i][totalCostIdx]) || 0 : 0,
        status: statusIdx >= 0 ? data[i][statusIdx] : "COMPLETE"
      };
      results.push(record);
    }
  }

  return { success: true, data: results };
}

function saveMealRecord(rec) {
  if (!rec || !rec.date || !rec.meal_type) {
    return { success: false, message: "Missing record date or meal_type" };
  }

  var sheet = getMealRecordsSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var dateIdx = findHeaderIndex(headers, ["Date", "date"]);
  var mealTypeIdx = findHeaderIndex(headers, ["MealType", "meal_type"]);
  var menuNameIdx = findHeaderIndex(headers, ["MenuName", "menu_name"]);
  var itemsIdx = findHeaderIndex(headers, ["ItemsJSON", "items", "items_json"]);
  var totalCostIdx = findHeaderIndex(headers, ["TotalCost", "total_cost"]);
  var statusIdx = findHeaderIndex(headers, ["Status", "status"]);

  if (dateIdx === -1) dateIdx = 0;
  if (mealTypeIdx === -1) mealTypeIdx = 1;
  if (menuNameIdx === -1) menuNameIdx = 2;
  if (itemsIdx === -1) itemsIdx = 3;
  if (totalCostIdx === -1) totalCostIdx = 4;
  if (statusIdx === -1) statusIdx = 5;

  var targetRow = -1;
  var recDateStr = rec.date.toString().split('T')[0];

  for (var i = 1; i < data.length; i++) {
    var dVal = data[i][dateIdx];
    if (dVal instanceof Date) {
      dVal = Utilities.formatDate(dVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else if (typeof dVal === 'string') {
      dVal = dVal.split('T')[0];
    }

    var mVal = data[i][mealTypeIdx];
    if (dVal === recDateStr && mVal === rec.meal_type) {
      targetRow = i + 1; // 1-indexed for Sheet
      break;
    }
  }

  var itemsStr = typeof rec.items === 'string' ? rec.items : JSON.stringify(rec.items || []);
  var menuNameVal = rec.menu_name || "";
  var totalCostVal = Number(rec.total_cost) || 0;
  var statusVal = rec.status || "COMPLETE";

  if (targetRow > 0) {
    // Update existing row matching header locations
    var maxIdx = Math.max(dateIdx, mealTypeIdx, menuNameIdx, itemsIdx, totalCostIdx, statusIdx);
    var rowValues = data[targetRow - 1].slice(); // copy existing row array
    rowValues[dateIdx] = recDateStr;
    rowValues[mealTypeIdx] = rec.meal_type;
    rowValues[menuNameIdx] = menuNameVal;
    rowValues[itemsIdx] = itemsStr;
    rowValues[totalCostIdx] = totalCostVal;
    rowValues[statusIdx] = statusVal;

    sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
    return { success: true, message: "Updated meal record" };
  } else {
    // Construct new row array using header order
    var newRow = [];
    for (var h = 0; h < headers.length; h++) {
      if (h === dateIdx) newRow.push(recDateStr);
      else if (h === mealTypeIdx) newRow.push(rec.meal_type);
      else if (h === menuNameIdx) newRow.push(menuNameVal);
      else if (h === itemsIdx) newRow.push(itemsStr);
      else if (h === totalCostIdx) newRow.push(totalCostVal);
      else if (h === statusIdx) newRow.push(statusVal);
      else newRow.push("");
    }
    sheet.appendRow(newRow);
    return { success: true, message: "Saved new meal record" };
  }
}

function deleteMealRecord(dateStr, mealType) {
  if (!dateStr || !mealType) return { success: false, message: "Missing params" };

  var sheet = getMealRecordsSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var dateIdx = findHeaderIndex(headers, ["Date", "date"]);
  var mealTypeIdx = findHeaderIndex(headers, ["MealType", "meal_type"]);

  if (dateIdx === -1) dateIdx = 0;
  if (mealTypeIdx === -1) mealTypeIdx = 1;

  var targetDateStr = dateStr.toString().split('T')[0];

  for (var i = 1; i < data.length; i++) {
    var dVal = data[i][dateIdx];
    if (dVal instanceof Date) {
      dVal = Utilities.formatDate(dVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else if (typeof dVal === 'string') {
      dVal = dVal.split('T')[0];
    }

    if (dVal === targetDateStr && data[i][mealTypeIdx] === mealType) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Deleted meal record" };
    }
  }

  return { success: false, message: "Record not found" };
}


/* ==========================================================================
   STANDARD PRICES (ราคากลางวัตถุดิบรายเดือน)
   ========================================================================== */
function getStandardPricesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("StandardPrices");
  if (!sheet) {
    sheet = ss.insertSheet("StandardPrices");
    sheet.appendRow(["year", "month", "data", "updated_at"]);
  }
  return sheet;
}

function getStandardPrices(year, month) {
  var sheet = getStandardPricesSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: null };

  for (var i = 1; i < data.length; i++) {
    var rYear = Number(data[i][0]);
    var rMonth = Number(data[i][1]);

    if (rYear === Number(year) && rMonth === Number(month)) {
      var rawData = data[i][2];
      try {
        var parsed = JSON.parse(rawData);
        return { success: true, data: parsed };
      } catch (e) {
        return { success: true, data: rawData };
      }
    }
  }

  return { success: true, data: null };
}

function saveStandardPrices(year, month, priceDataStr) {
  var sheet = getStandardPricesSheet();
  var data = sheet.getDataRange().getValues();
  
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === Number(year) && Number(data[i][1]) === Number(month)) {
      targetRow = i + 1;
      break;
    }
  }

  var now = new Date().toISOString();
  var dataStr = typeof priceDataStr === 'string' ? priceDataStr : JSON.stringify(priceDataStr);

  if (targetRow > 0) {
    sheet.getRange(targetRow, 3, 1, 2).setValues([[dataStr, now]]);
    return { success: true, message: "Updated standard prices" };
  } else {
    sheet.appendRow([Number(year), Number(month), dataStr, now]);
    return { success: true, message: "Saved standard prices" };
  }
}
