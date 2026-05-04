// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCCIONES:
// 1. Abre tu GAS (el mismo que ya tienes para managers)
// 2. Reemplaza tu función doGet() existente por esta versión
// 3. Agrega la función getAwards() al final del archivo
// 4. Guarda y despliega una nueva versión (Deploy > Manage deployments > New version)
// ─────────────────────────────────────────────────────────────────────────────

// REEMPLAZA tu doGet() existente por esta:
function doGet(e) {
  const sheet = e.parameter.sheet;
  if (sheet === 'awards') {
    return getAwards();
  }
  return getManagers(); // tu función existente, no la toques
}

// AGREGA esta función nueva al final:
function getAwards() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Awards');

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data   = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const awards = data
    .filter(row => String(row[0]).trim() !== '')
    .map(row => ({
      manager:  String(row[0]).trim(),
      active:   row[1] === true || String(row[1]).toUpperCase() === 'TRUE',
      month:    Number(row[2]),
      year:     Number(row[3]),
      award:    String(row[4]).trim(),
      photoUrl: String(row[5]).trim(),
    }));

  return ContentService
    .createTextOutput(JSON.stringify(awards))
    .setMimeType(ContentService.MimeType.JSON);
}
