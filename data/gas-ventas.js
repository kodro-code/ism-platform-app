/**
 * GAS VENTAS — Lee y elimina ventas del manager logueado
 *
 * INSTRUCCIONES DE DEPLOY:
 * 1. script.google.com → Nuevo proyecto → pegar este código
 * 2. Implementar → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo  |  Acceso: Cualquier usuario
 * 3. Copiar URL → pegar en .env.local como GAS_VENTAS_URL
 *
 * PLANILLA: 1W63tcLQMjqiHlTygSpItC-daOlCyAX3JqB5JC9ckEeg
 * Headers en fila 10 col B:P. Fecha en col E (índice 3 desde B).
 * Formatos de fecha soportados: Date object, M/D/YYYY, M/D/YYYY HH:mm, yyyy/MM/dd HH:mm
 */

const VENTAS_SS_ID = '1W63tcLQMjqiHlTygSpItC-daOlCyAX3JqB5JC9ckEeg';
const DATE_IDX     = 3; // col E = índice 3 desde col B (0-based)

// ── GET: leer todas las ventas (el cliente filtra por mes) ────────────────────
function doGet(e) {
  try {
    const pestana = (e.parameter.pestana || '').trim();
    if (!pestana) return respond({ success: false, error: 'Pestaña requerida' });

    const ss    = SpreadsheetApp.openById(VENTAS_SS_ID);
    const sheet = ss.getSheetByName(pestana);
    if (!sheet) return respond({ success: false, error: 'Pestaña "' + pestana + '" no encontrada' });

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow < 10 || lastCol < 2) return respond({ success: true, headers: [], data: [] });

    const numCols  = lastCol - 1; // desde col B
    const headers  = sheet.getRange(10, 2, 1, numCols).getValues()[0].map(function(h){ return String(h).trim(); });

    if (lastRow < 11) return respond({ success: true, headers: headers, data: [] });

    const rawData = sheet.getRange(11, 2, lastRow - 10, numCols).getValues();
    const tz      = Session.getScriptTimeZone();
    const rows    = [];

    rawData.forEach(function(row, i) {
      // Saltar filas vacías
      if (!row[0] && !row[DATE_IDX]) return;

      // Normalizar la fecha a formato yyyy/MM/dd HH:mm para que el cliente pueda parsearla
      var normalized = row.map(function(cell, ci) {
        if (cell instanceof Date) {
          return Utilities.formatDate(cell, tz, 'yyyy/MM/dd HH:mm');
        }
        if (ci === DATE_IDX && cell) {
          var d = parseVentaDate(String(cell));
          if (d) return Utilities.formatDate(d, tz, 'yyyy/MM/dd HH:mm');
        }
        return (cell === null || cell === undefined) ? '' : cell;
      });

      rows.push({ rowIndex: 11 + i, data: normalized });
    });

    // Más reciente primero
    rows.sort(function(a, b) {
      var da = parseVentaDate(a.data[DATE_IDX]);
      var db = parseVentaDate(b.data[DATE_IDX]);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.getTime() - da.getTime();
    });

    return respond({ success: true, headers: headers, data: rows });

  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

// ── POST: eliminar fila ───────────────────────────────────────────────────────
function doPost(e) {
  try {
    var body     = JSON.parse(e.postData.contents);
    var action   = body.action;
    var pestana  = body.pestana;
    var rowIndex = body.rowIndex;

    if (action !== 'delete') return respond({ success: false, error: 'Acción no reconocida' });
    if (!pestana || !rowIndex) return respond({ success: false, error: 'Datos insuficientes' });

    var ss    = SpreadsheetApp.openById(VENTAS_SS_ID);
    var sheet = ss.getSheetByName(pestana);
    if (!sheet) return respond({ success: false, error: 'Pestaña no encontrada' });
    if (rowIndex < 11) return respond({ success: false, error: 'Fila protegida' });

    sheet.deleteRow(rowIndex);
    return respond({ success: true });

  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

// ── parseVentaDate ────────────────────────────────────────────────────────────
// Soporta: Date object | "5/1/2026" | "5/1/2026 13:04" | "5/1/2026 13:04:00"
//          | "2026/05/01 13:04" | "Apr/1/26 13:04"
function parseVentaDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  var str = String(val).trim();

  // "2026/05/01 13:04" — formato normalizado
  var iso = str.match(/^(\d{4})\/(\d{2})\/(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (iso) return new Date(+iso[1], +iso[2]-1, +iso[3], iso[4]?+iso[4]:0, iso[5]?+iso[5]:0);

  // "5/1/2026 13:04:00" o "5/1/2026" — formato M/D/YYYY (Google Sheets)
  var mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (mdy) return new Date(+mdy[3], +mdy[1]-1, +mdy[2], mdy[4]?+mdy[4]:0, mdy[5]?+mdy[5]:0);

  // "Apr/1/26 13:04" — formato legacy MMM/d/yy
  var MONTHS = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  var leg = str.match(/^(\w{3})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (leg) {
    var mo = MONTHS[leg[1]];
    if (mo === undefined) return null;
    var yr = +leg[3]; if (yr < 100) yr += 2000;
    return new Date(yr, mo, +leg[2], leg[4]?+leg[4]:0, leg[5]?+leg[5]:0);
  }
  return null;
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
