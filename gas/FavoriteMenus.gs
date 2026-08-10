/**
 * FavoriteMenus.gs — จัดการข้อมูลเมนูยอดฮิต
 * เพิ่มไฟล์นี้ใน Google Apps Script project เดียวกันกับระบบ MealTrack
 */

function handleFavoriteMenus(action, payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("FavoriteMenus");
  
  // สร้าง Sheet อัตโนมัติถ้ายังไม่มี
  if (!sheet) {
    sheet = ss.insertSheet("FavoriteMenus");
    sheet.appendRow(["id", "name", "items", "total_cost", "updated_at", "use_count"]);
  }
  
  switch (action) {
    case "get_favorite_menus":
      return getFavoriteMenus(sheet);
    case "save_favorite_menu":
      return saveFavoriteMenu(sheet, payload);
    case "delete_favorite_menu":
      return deleteFavoriteMenu(sheet, payload);
    default:
      return { success: false, message: "Unknown favorite menu action" };
  }
}

function getFavoriteMenus(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };
  
  var headers = data[0];
  var results = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    // Parse items JSON string
    if (typeof row.items === "string" && row.items) {
      try { row.items = JSON.parse(row.items); } catch(e) { row.items = []; }
    }
    results.push(row);
  }
  
  return { success: true, data: results };
}

function saveFavoriteMenu(sheet, payload) {
  var menu = payload.menu;
  if (!menu || !menu.name) return { success: false, message: "Missing menu data" };
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var nameColIdx = headers.indexOf("name");
  var idColIdx = headers.indexOf("id");
  
  // ค้นหาแถวที่ต้องการอัพเดต (จาก id หรือ name)
  var existingRow = -1;
  for (var i = 1; i < data.length; i++) {
    var rowId = (data[i][idColIdx] || "").toString();
    var rowName = (data[i][nameColIdx] || "").toString().trim().toLowerCase();
    
    var matchId = menu.id && rowId === menu.id.toString();
    var matchName = rowName === menu.name.trim().toLowerCase();

    if (matchId || matchName) {
      existingRow = i + 1; // 1-indexed for Sheet
      break;
    }
  }
  
  var itemsStr = JSON.stringify(menu.items || []);
  var now = new Date().toISOString();
  
  if (existingRow > 0) {
    // อัพเดตแถวเดิม
    var useCountIdx = headers.indexOf("use_count");
    var currentUseCount = useCountIdx !== -1 ? Number(data[existingRow - 1][useCountIdx] || 0) : 0;
    var useCount = currentUseCount + 1;
    var rowData = [
      data[existingRow - 1][idColIdx], // keep existing id
      menu.name,
      itemsStr,
      menu.total_cost || 0,
      now,
      useCount
    ];
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    return { success: true, message: "Updated", id: rowData[0] };
  } else {
    // เพิ่มแถวใหม่
    var newId = "fav_" + new Date().getTime();
    var rowData = [newId, menu.name, itemsStr, menu.total_cost || 0, now, 1];
    sheet.appendRow(rowData);
    return { success: true, message: "Created", id: newId };
  }
}

function deleteFavoriteMenu(sheet, payload) {
  if (!payload.id) return { success: false, message: "Missing menu id" };
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idColIdx = headers.indexOf("id");
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][idColIdx] === payload.id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Deleted" };
    }
  }
  
  return { success: false, message: "Menu not found" };
}
