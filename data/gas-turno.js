/**
 * GAS TURNO — Relatório de final de turno + Mudança de horário / Horas extras
 *
 * INSTRUCCIONES DE DEPLOY:
 * 1. script.google.com → Nuevo proyecto → pegar este código
 * 2. Implementar → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo  |  Acceso: Cualquier usuario
 * 3. Copiar URL → pegar en .env.local como GAS_TURNO_URL
 *
 * PLANILLAS:
 *   Principal (marcação de turnos + Schedule): 1_uCu_up5XicYSqOu3PllrlBrbLjkzuDWaH3oKGGLb6k
 *   Control   (Report + Salary):               1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0
 *
 * Gerentes em fila 3 desde col C na aba do mês atual (ex: "May", "June").
 */

var PRINCIPAL_ID = '1_uCu_up5XicYSqOu3PllrlBrbLjkzuDWaH3oKGGLb6k';
var CONTROL_ID   = '1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0';

var REPORT_TAB   = 'Report';
var SALARY_TAB   = 'Salary';
var SCHEDULE_TAB = 'Schedule_Extra_Hours';

var REPORT_HEADERS = ['Timestamp','Manager','Start_Time','End_Time','System_Calls_Count','System_Calls_Time','WA_Calls_Count','WA_Calls_Time','Invoices_Sent','Payments_USD','Comments'];
var EXTRA_HEADERS  = ['Request_Type','Timestamp','Manager','Day_Off_Date','Recovery_Date','Shift_Duration','Extra_Hours_Quantity','Comments'];

// ── safeDate ──────────────────────────────────────────────────────────────────
// Formatea una celda como fecha/hora sin depender de instanceof Date.
// 1º intento: Utilities.formatDate (falla en algunos contextos standalone V8)
// 2º intento: métodos nativos JS de Date (getDate/getMonth/etc.)
// 3º intento: String(cell) tal cual (para celdas que ya son texto "dd/MM")
function safeDate(cell, tz, fmt) {
  if (cell === null || cell === undefined || cell === '') return '';
  // Primer intento
  try {
    return Utilities.formatDate(cell, tz, fmt);
  } catch(e1) {}
  // Segundo intento: métodos nativos JS si es un objeto Date
  if (typeof cell === 'object' && typeof cell.getFullYear === 'function') {
    try {
      var pad = function(n) { return ('0' + n).slice(-2); };
      var d  = cell.getDate(),  mo = cell.getMonth() + 1, y = cell.getFullYear();
      var h  = cell.getHours(), mi = cell.getMinutes();
      if (fmt === 'dd/MM/yyyy') return pad(d) + '/' + pad(mo) + '/' + y;
      if (fmt === 'dd/MM')      return pad(d) + '/' + pad(mo);
      if (fmt === 'HH:mm')      return pad(h) + ':' + pad(mi);
    } catch(e2) {}
  }
  return String(cell).trim();
}

// ── GET: ?action=managers ─────────────────────────────────────────────────────
function doGet(e) {
  try {
    var action = (e.parameter.action || '').trim();
    if (action === 'managers') return respond(getManagers());
    return respond({ success: false, error: 'Ação não reconhecida. Use ?action=managers' });
  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

// ── POST: action=report | action=extra ────────────────────────────────────────
function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === 'report') return respond(registrarTurno(body));
    if (action === 'extra')  return respond(registrarExtra(body));
    return respond({ success: false, error: 'Ação não reconhecida' });
  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

// ── getManagers ───────────────────────────────────────────────────────────────
function getManagers() {
  var ss  = SpreadsheetApp.openById(PRINCIPAL_ID);
  var tz  = ss.getSpreadsheetTimeZone();
  var now = new Date();

  var monthName = Utilities.formatDate(now, tz, 'MMMM');
  monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  var sheet = ss.getSheetByName(monthName);
  if (!sheet) return { success: false, error: 'Aba "' + monthName + '" não encontrada' };

  var lastCol = sheet.getLastColumn();
  if (lastCol < 3) return { success: true, managers: [] };

  var vals = sheet.getRange(3, 3, 1, lastCol - 2).getValues()[0];
  var managers = vals.filter(function(v) { return v && String(v).trim() !== ''; })
                     .map(function(v)    { return String(v).trim(); });
  return { success: true, managers: managers };
}

// ── registrarTurno ────────────────────────────────────────────────────────────
function registrarTurno(d) {
  var manager    = String(d.manager    || '').trim();
  var horaInicio = String(d.horaInicio || '').trim();
  var horaFin    = String(d.horaFin    || '').trim();
  var totalCalls = d.totalCalls;
  var timeCalls  = String(d.timeCalls  || '');
  var totalWA    = d.totalWA;
  var timeWA     = String(d.timeWA     || '');
  var invoices   = d.invoices;
  var payments   = d.payments;
  var comments   = String(d.comments   || '').trim();

  var ss         = SpreadsheetApp.openById(PRINCIPAL_ID);
  var tz         = ss.getSpreadsheetTimeZone();
  var now        = new Date();
  var todayFull  = Utilities.formatDate(now, tz, 'dd/MM/yyyy'); // "03/05/2026"
  var todayShort = Utilities.formatDate(now, tz, 'dd/MM');      // "03/05"

  // 1. Guardar en pestaña Report (CONTROL_ID) — no crítico si falla
  try {
    var ctrlSs      = SpreadsheetApp.openById(CONTROL_ID);
    var reportSheet = ctrlSs.getSheetByName(REPORT_TAB);
    if (!reportSheet) throw new Error('Aba "' + REPORT_TAB + '" não encontrada');
    if (reportSheet.getLastRow() === 0) reportSheet.appendRow(REPORT_HEADERS);
    reportSheet.appendRow([now, manager, horaInicio, horaFin, Number(totalCalls), timeCalls, Number(totalWA), timeWA, Number(invoices), Number(payments), comments]);
  } catch (err) {
    Logger.log('AVISO Report: ' + err.message);
  }

  // 2. Marcar checkboxes en la aba del mes (crítico)
  try {
    var monthName = Utilities.formatDate(now, tz, 'MMMM');
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
    var sheet = ss.getSheetByName(monthName);
    if (!sheet) throw new Error('Aba "' + monthName + '" não encontrada. Crie a aba do mês.');

    // Columna del manager en fila 3 (desde col C)
    var hdrs = sheet.getRange('C3:ZZ3').getValues()[0];
    var mIdx = -1;
    for (var i = 0; i < hdrs.length; i++) {
      if (hdrs[i] && String(hdrs[i]).trim() === manager) { mIdx = i; break; }
    }
    if (mIdx === -1) throw new Error('Gerente "' + manager + '" não encontrado na linha 3');
    var mCol = 3 + mIdx;

    // Buscar filas del turno en A:B desde fila 4
    var rows     = sheet.getRange('A4:B').getValues();
    var startRow = -1;
    var endRow   = -1;

    for (var r = 0; r < rows.length; r++) {
      // Comparar contra dd/MM/yyyy y dd/MM — la col A puede ser Date obj o texto "dd/MM"
      var cellA   = rows[r][0];
      var dateFmt = safeDate(cellA, tz, 'dd/MM/yyyy');
      var dateRaw = String(cellA).trim();
      var isToday = dateFmt === todayFull || dateRaw === todayShort || dateRaw === todayFull;
      if (!isToday) continue;

      // Fecha encontrada — buscar horas dentro del bloque
      for (var j = r; j < rows.length; j++) {
        var hRaw = rows[j][1];
        // Detectar fin del bloque del día
        if (String(hRaw).trim() === 'SOMA') break;
        // safeDate maneja tanto Date objects como strings "HH:mm"
        var hFmt = safeDate(hRaw, tz, 'HH:mm');

        if (hFmt === horaInicio) startRow = j + 4;
        if (hFmt === horaFin) {
          endRow = (horaFin !== '23:00') ? j + 4 - 1 : j + 4;
          break;
        }
      }
      if (startRow !== -1 && endRow !== -1) break;
    }

    if (startRow === -1 || endRow === -1 || startRow > endRow) {
      throw new Error('Horário "' + horaInicio + '"–"' + horaFin + '" não localizado para ' + todayFull + '. Verifique se a data de hoje está na col A e os horários na col B.');
    }

    var numRows = endRow - startRow + 1;
    var vals    = [];
    for (var k = 0; k < numRows; k++) vals.push([true]);
    sheet.getRange(startRow, mCol, numRows, 1).setValues(vals);

  } catch (err) {
    return { success: false, error: String(err) };
  }

  var dateStr = now.toLocaleDateString('pt-BR', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  return {
    success: true,
    date: dateStr,
    manager: manager, horaInicio: horaInicio, horaFin: horaFin,
    totalCalls: totalCalls, timeCalls: timeCalls,
    totalWA: totalWA, timeWA: timeWA,
    invoices: invoices, payments: payments, comments: comments
  };
}

// ── registrarExtra ────────────────────────────────────────────────────────────
function registrarExtra(d) {
  var manager       = String(d.manager       || '').trim();
  var requestType   = String(d.requestType   || '');
  var dayOff        = String(d.dayOff        || '');
  var recoveryDay   = String(d.recoveryDay   || '');
  var shiftDuration = String(d.shiftDuration || '');
  var extraHours    = String(d.extraHours    || '');
  var comments      = String(d.comments      || '').trim();

  var now     = new Date();
  var rowData = [requestType, now, manager, dayOff, recoveryDay, shiftDuration, extraHours, comments];
  var success = true;

  try {
    var ctrlSs      = SpreadsheetApp.openById(CONTROL_ID);
    var salarySheet = ctrlSs.getSheetByName(SALARY_TAB);
    if (!salarySheet) throw new Error('Aba "' + SALARY_TAB + '" não encontrada');
    if (salarySheet.getLastRow() === 0) salarySheet.appendRow(EXTRA_HEADERS);
    salarySheet.appendRow(rowData);
  } catch (err) {
    Logger.log('ERRO Salary: ' + err.message);
    success = false;
  }

  try {
    var prinSs        = SpreadsheetApp.openById(PRINCIPAL_ID);
    var scheduleSheet = prinSs.getSheetByName(SCHEDULE_TAB);
    if (!scheduleSheet) throw new Error('Aba "' + SCHEDULE_TAB + '" não encontrada');
    if (scheduleSheet.getLastRow() === 0) scheduleSheet.appendRow(EXTRA_HEADERS);
    scheduleSheet.appendRow(rowData);
  } catch (err) {
    Logger.log('ERRO Schedule: ' + err.message);
    success = false;
  }

  return { success: success, manager: manager, requestType: requestType };
}

// ── respond ───────────────────────────────────────────────────────────────────
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
