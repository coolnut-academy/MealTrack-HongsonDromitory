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
    sheet.appendRow(["id", "date", "meal_type", "menu_name", "items", "total_cost", "status", "updated_at"]);
  }
  return sheet;
}

function getMonthData(year, month) {
  var sheet = getMealRecordsSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  var headers = data[0];
  var results = [];
  var dateIdx = headers.indexOf("date");

  for (var i = 1; i < data.length; i++) {
    var rowDate = data[i][dateIdx];
    if (!rowDate) continue;

    var d = new Date(rowDate);
    var rYear = d.getFullYear();
    var rMonth = d.getMonth() + 1;

    // Check matching year and month
    if (rYear === Number(year) && rMonth === Number(month)) {
      var record = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j];
        if (headers[j] === "date" && val instanceof Date) {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
        }
        record[headers[j]] = val;
      }
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

  var dateIdx = headers.indexOf("date");
  var mealTypeIdx = headers.indexOf("meal_type");

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
  var now = new Date().toISOString();

  if (targetRow > 0) {
    // Update existing row
    var existingId = data[targetRow - 1][headers.indexOf("id")] || ("rec_" + Date.now());
    var rowData = [
      existingId,
      recDateStr,
      rec.meal_type,
      rec.menu_name || "",
      itemsStr,
      rec.total_cost || 0,
      rec.status || "COMPLETE",
      now
    ];
    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    return { success: true, message: "Updated meal record", id: existingId };
  } else {
    // Append new row
    var newId = "rec_" + Date.now();
    var rowData = [
      newId,
      recDateStr,
      rec.meal_type,
      rec.menu_name || "",
      itemsStr,
      rec.total_cost || 0,
      rec.status || "COMPLETE",
      now
    ];
    sheet.appendRow(rowData);
    return { success: true, message: "Saved new meal record", id: newId };
  }
}

function deleteMealRecord(dateStr, mealType) {
  if (!dateStr || !mealType) return { success: false, message: "Missing params" };

  var sheet = getMealRecordsSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var dateIdx = headers.indexOf("date");
  var mealTypeIdx = headers.indexOf("meal_type");

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
