/**
 * GAS MINHA ÁREA — Dashboard personal del manager
 *
 * DEPLOY:
 * 1. script.google.com → Nuevo proyecto → pegar este código
 * 2. Implementar → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo  |  Acceso: Cualquier usuario
 * 3. Copiar URL → pegar en .env.local como GAS_MINHA_AREA_URL
 * 4. Abrir ?action=test para verificar la conexión
 *
 * GET ?action=getData&email=...&pestana=...&month=5&year=2026
 * GET ?action=getManagers
 */

var CONTROL_ID        = '1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0';
var VENTAS_ID         = '1W63tcLQMjqiHlTygSpItC-daOlCyAX3JqB5JC9ckEeg';
var SALES_HISTORY_TAB = 'AOV-Sales'; // nombre de la pestaña dentro del spreadsheet de control
var SALES_START_YEAR  = 2025;        // año de la primera columna del histórico (agosto 2025)
var BOARDS_TAB     = 'Boards';
var REPORT_TAB     = 'Report';
var META_CALL_SECS = 180; // 3 min target per client (3 attempts per client)

// ── Boards column layout (0-indexed). Data starts at Google Sheets row 4 = index 3
var B_ROW   = 3;   // first data row (0-indexed)
var B_NAME  = 0;   // A  – Manager name
var B_RANK  = 1;   // B  – Rank / Position
var B_EMAIL = 2;   // C  – Corporate email
// D(3) – Stars AOB  |  E(4) – Stars utilización  |  F(5) – Stars revenue  (not read)
var B_RATE  = 6;   // G  – Run Rate
var B_STATE = 7;   // H  – Estado (High Average, Top Performance…)
var B_VENTAS= 8;   // I  – Venta acumulada hasta ahora
var B_META  = 9;   // J  – Meta mensual
var B_PAYS  = 10;  // K  – Nº pagos
var B_AOV   = 11;  // L  – AOV (promedio de venta)
var B_UPGRD = 12;  // M  – Meta de upgrades
// N(13)–S(18) – 6 espinas Ishikawa (pre-calculadas)
var B_ESP1  = 13;  // N  – Espina 1
var B_ESP2  = 14;  // O  – Espina 2
var B_ESP3  = 15;  // P  – Espina 3
var B_ESP4  = 16;  // Q  – Espina 4
var B_ESP5  = 17;  // R  – Espina 5
var B_ESP6  = 18;  // S  – Espina 6
var B_BASE  = 19;  // T  – Salario base (15 días)
// U(20) – venta total (referencia, misma que I)
var B_CPCT  = 21;  // V  – Porcentaje comisión
var B_CAMT  = 22;  // W  – Monto comisión (pre-calculado)
var B_XDAYS = 23;  // X  – Nº días extras
var B_XVAL  = 24;  // Y  – Valor día extra ($25 fijo)
var B_BONUS = 25;  // Z  – Bonus
var B_MULT  = 26;  // AA – Multas
var B_CMT   = 27;  // AB – Comentarios del mes
var B_NOTA  = 28;  // AC – Nota esperada
var B_RECONO  = 29; // AD – Reconocimientos (veces ganó Manager del Mes)
var B_UPGPREM = 30; // AE – Upgrades para PRM (pre-contados)
var B_UPGIND  = 31; // AF – Upgrades para IND (pre-contados)
var B_REFER   = 32; // AG – Referidos del mes
var B_PESTANA = 33; // AH – Nombre de la pestaña en el spreadsheet de Ventas

// ── doGet ─────────────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    var p      = e.parameter || {};
    var action = (p.action || '').trim();
    var email  = (p.email  || '').trim().toLowerCase();
    var pestana= (p.pestana|| '').trim();
    var month  = p.month ? parseInt(p.month) : new Date().getMonth() + 1;
    var year   = p.year  ? parseInt(p.year)  : new Date().getFullYear();

    var spreadsheetId = (p.spreadsheetId || '').trim() || CONTROL_ID;

    if (action === 'getData')          return respond(getData(email, pestana, month, year, spreadsheetId));
    if (action === 'getManagers')      return respond(getManagers(spreadsheetId));
    if (action === 'getSalesHistory')  return respond(getSalesHistory(email));
    if (action === 'test')             return respond({ success: true, message: 'Minha Área GAS operativo' });

    return respond({ success: false, error: 'Acción no reconocida. Use ?action=getData|getManagers|test' });
  } catch(err) {
    return respond({ success: false, error: String(err) });
  }
}

// ── getData ───────────────────────────────────────────────────────────────────
function getData(email, pestana, month, year, spreadsheetId) {
  if (!email) return { success: false, error: 'Email requerido' };

  var controlSS = SpreadsheetApp.openById(spreadsheetId || CONTROL_ID);
  var boards    = readBoards(controlSS, email);
  if (!boards)  return { success: false, error: 'Manager no encontrado en la pestaña Boards' };

  var calls = readReport(controlSS, boards.managerName, month, year);
  var eff   = calcEfficiency(calls);

  // Sales: use Ventas spreadsheet if pestana provided, else fall back to Boards columns I/K/L
  var ventas;
  if (pestana) {
    ventas = readVentas(pestana, month, year);
    ventas.referrals = boards.boardsVentas.referrals; // always use manually-entered value from Boards col AG
  } else {
    ventas = {
      total:     boards.boardsVentas.total,
      payments:  boards.boardsVentas.payments,
      aov:       boards.boardsVentas.aov,
      referrals: boards.boardsVentas.referrals,
      weekly:    [0,0,0,0],
      upgrades:  boards.boardsVentas.upgrades,
    };
  }

  // Historical adjustments: when querying a past month, Boards reflects current state.
  // Use a Historico sheet for the real meta of that month; run rate = final ventas total.
  var now = new Date();
  var curMonth = now.getMonth() + 1, curYear = now.getFullYear();
  var isHistorical = year < curYear || (year === curYear && month < curMonth);
  var historico = isHistorical ? readHistorico(controlSS, email, month, year) : null;

  var runRate     = isHistorical ? ventas.total : boards.runRate;
  var meta        = historico ? historico.meta        : boards.meta;
  var metaUpgrade = historico ? historico.metaUpgrade : boards.metaUpgrade;

  // Commission: use pre-calculated value from Boards (columns V/W) when available,
  // otherwise calculate from ventas total
  var comm;
  if (boards.commAmt > 0 || boards.commPct > 0) {
    comm = {
      pct:           boards.commPct,
      amount:        boards.commAmt,
      nextThreshold: 0,
      missingForNext:0,
    };
  } else {
    comm = calcCommission(ventas.total);
  }

  return {
    success:         true,
    managerName:     boards.managerName,
    rank:            boards.rank,
    reconhecimentos: boards.reconhecimentos,
    estado:          boards.estado,
    runRate:         runRate,
    meta:            meta,
    metaUpgrade:     metaUpgrade,
    ishikawa: {
      labels:  ['Apresentação','Disponibilidade','Pergunta','Inf. Indiretas','Conhecer Produto','Conhecer Valor'],
      values:  [boards.esp1, boards.esp2, boards.esp3, boards.esp4, boards.esp5, boards.esp6],
      average: boards.ishikawaAvg,
    },
    comentarios:  boards.comentarios,
    notaEsperada: boards.notaEsperada,
    salary: {
      base:       boards.base,
      bonus:      boards.bonus,
      multas:     boards.multas,
      diasExtras: boards.diasExtras,
      commission: comm,
      total:      Math.round((boards.base + comm.amount + boards.bonus + boards.diasExtras - boards.multas) * 100) / 100,
    },
    ventas: {
      total:     ventas.total,
      payments:  ventas.payments,
      aov:       ventas.aov,
      referrals: ventas.referrals,
      weekly:    ventas.weekly,
      upgrades:  ventas.upgrades || 0,
    },
    calls:      calls,
    efficiency: eff,
    month:      month,
    year:       year,
  };
}

// ── readBoards ────────────────────────────────────────────────────────────────
function readBoards(ss, email) {
  var sheet = ss.getSheetByName(BOARDS_TAB);
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  if (data.length <= B_ROW) return null;

  function num(v) { return parseFloat(String(v || 0)) || 0; }
  function pct(v) {
    if (v === '' || v === null || v === undefined) return 0;
    if (typeof v === 'number' && v > 0 && v <= 1) return Math.round(v * 100);
    return parseFloat(String(v).replace('%','')) || 0;
  }

  for (var i = B_ROW; i < data.length; i++) {
    var row = data[i];
    if (!row[B_EMAIL]) continue;
    if (String(row[B_EMAIL]).trim().toLowerCase() !== email) continue;

    var esp = [B_ESP1,B_ESP2,B_ESP3,B_ESP4,B_ESP5,B_ESP6].map(function(c){ return pct(row[c]); });
    var filled = esp.filter(function(v){ return v > 0; });
    var avg    = filled.length > 0 ? filled.reduce(function(a,b){return a+b;},0)/filled.length : 0;

    var extraCount = num(row[B_XDAYS]);
    var extraRate  = num(row[B_XVAL]) || 25;

    return {
      managerName:     String(row[B_NAME]  || '').trim(),
      rank:            String(row[B_RANK]  || '').trim(),
      reconhecimentos: num(row[B_RECONO]),
      runRate:         num(row[B_RATE]),
      estado:          String(row[B_STATE] || '').trim(),
      meta:            num(row[B_META]),
      metaUpgrade:     num(row[B_UPGRD]),
      esp1:esp[0], esp2:esp[1], esp3:esp[2], esp4:esp[3], esp5:esp[4], esp6:esp[5],
      ishikawaAvg:     Math.round(avg * 100) / 100,
      base:            num(row[B_BASE]),
      commPct:         num(row[B_CPCT]),
      commAmt:         num(row[B_CAMT]),
      bonus:           num(row[B_BONUS]),
      multas:          num(row[B_MULT]),
      diasExtras:      Math.round(extraCount * extraRate * 100) / 100,
      comentarios:     String(row[B_CMT]   || '').trim(),
      notaEsperada:    num(row[B_NOTA]),
      boardsVentas: {
        total:    num(row[B_VENTAS]),
        payments: num(row[B_PAYS]),
        aov:      num(row[B_AOV]),
        upgrades: num(row[B_UPGPREM]) + num(row[B_UPGIND]),
        referrals:num(row[B_REFER]),
      },
    };
  }
  return null;
}

// ── readHistorico ─────────────────────────────────────────────────────────────
// Reads the "Historico" sheet for the real meta/metaUpgrade of a past month.
// Sheet format (headers in row 1): email | month | year | meta | metaUpgrade
function readHistorico(ss, email, month, year) {
  try {
    var sheet = ss.getSheetByName('Historico');
    if (!sheet || sheet.getLastRow() < 2) return null;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(row[0]).trim().toLowerCase() !== email) continue;
      if (parseInt(row[1]) !== month) continue;
      if (parseInt(row[2]) !== year)  continue;
      var meta = parseFloat(String(row[3])) || 0;
      var metaUpgrade = parseFloat(String(row[4])) || 0;
      if (meta > 0) return { meta: meta, metaUpgrade: metaUpgrade };
    }
  } catch(e) {}
  return null;
}

// ── getManagers ───────────────────────────────────────────────────────────────
function getManagers(spreadsheetId) {
  try {
    var controlSS = SpreadsheetApp.openById(spreadsheetId || CONTROL_ID);
    var sheet     = controlSS.getSheetByName(BOARDS_TAB);
    if (!sheet) return { success: false, error: 'Aba "' + BOARDS_TAB + '" não encontrada' };

    var data = sheet.getDataRange().getValues();
    if (data.length <= B_ROW) return { success: false, error: 'Sem dados em Boards (esperado dados a partir da linha 4)' };

    function num(v) { return parseFloat(String(v || 0)) || 0; }

    var managers = [];
    for (var i = B_ROW; i < data.length; i++) {
      var row = data[i];
      if (!row[B_EMAIL]) continue;
      var emailVal = String(row[B_EMAIL]).trim().toLowerCase();
      if (!emailVal || emailVal.indexOf('@') < 0) continue;

      managers.push({
        email:        emailVal,
        name:         String(row[B_NAME]    || '').trim().replace(/^ISM\s+/i, ''),
        rank:         String(row[B_RANK]    || '').trim(),
        runRate:      num(row[B_RATE]),
        meta:         num(row[B_META]),
        notaEsperada: num(row[B_NOTA]),
        estado:       String(row[B_STATE]   || '').trim(),
        pestana:      String(row[B_PESTANA] || '').trim(),
      });
    }

    return { success: true, managers: managers };
  } catch(err) {
    return { success: false, error: String(err) };
  }
}

// ── readReport ────────────────────────────────────────────────────────────────
function readReport(ss, managerName, month, year) {
  var sheet = ss.getSheetByName(REPORT_TAB);
  var empty = { sysCalls:0, sysTimeSec:0, waCalls:0, waTimeSec:0, turnoCount:0 };
  if (!sheet || sheet.getLastRow() < 2) return empty;

  var data    = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim().toLowerCase(); });

  var cTs     = headers.indexOf('timestamp');
  var cMgr    = headers.indexOf('manager');
  var cSysCnt = headers.indexOf('system_calls_count');
  var cSysTm  = headers.indexOf('system_calls_time');
  var cWaCnt  = headers.indexOf('wa_calls_count');
  var cWaTm   = headers.indexOf('wa_calls_time');

  var result  = { sysCalls:0, sysTimeSec:0, waCalls:0, waTimeSec:0, turnoCount:0 };
  var nameLow = managerName.replace(/^ISM\s+/i,'').trim().toLowerCase();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[cTs] || !row[cMgr]) continue;

    var rowMgr = String(row[cMgr]).replace(/^ISM\s+/i,'').trim().toLowerCase();
    if (rowMgr !== nameLow) continue;

    var ts = new Date(row[cTs]);
    if (isNaN(ts.getTime())) continue;
    if (ts.getMonth()+1 !== month || ts.getFullYear() !== year) continue;

    result.sysCalls  += parseInt(String(row[cSysCnt]||0)) || 0;
    result.sysTimeSec+= timeToSec(row[cSysTm]);
    result.waCalls   += parseInt(String(row[cWaCnt] ||0)) || 0;
    result.waTimeSec += timeToSec(row[cWaTm]);
    result.turnoCount++;
  }
  return result;
}

// ── readVentas ────────────────────────────────────────────────────────────────
function readVentas(pestana, month, year) {
  try {
    var ss    = SpreadsheetApp.openById(VENTAS_ID);
    var sheet = ss.getSheetByName(pestana);
    if (!sheet || sheet.getLastRow() < 11) return emptyVentas();

    var numCols = sheet.getLastColumn() - 1;
    var headers = sheet.getRange(10, 2, 1, numCols).getValues()[0]
                       .map(function(h){ return String(h).trim().toLowerCase(); });

    var cDate   = 3;
    var cAmount = -1;
    var cWork   = -1;
    var cFormat = -1;
    for (var h = 0; h < headers.length; h++) {
      if (headers[h].indexOf('amount') >= 0 && headers[h].indexOf('usd') >= 0) cAmount = h;
      if (headers[h].indexOf('work') >= 0 && headers[h].indexOf('front') >= 0) cWork = h;
      if (headers[h] === 'format') cFormat = h;
    }
    if (cAmount < 0) return emptyVentas();

    var rawData = sheet.getRange(11, 2, sheet.getLastRow()-10, numCols).getValues();
    var weeks   = [0,0,0,0];
    var total = 0, payments = 0, referrals = 0, upgrades = 0;

    for (var i = 0; i < rawData.length; i++) {
      var row = rawData[i];
      if (!row[cDate]) continue;
      var d = new Date(row[cDate]);
      if (isNaN(d.getTime())) continue;
      if (d.getMonth()+1 !== month || d.getFullYear() !== year) continue;

      var amt = parseFloat(String(row[cAmount]||0)) || 0;
      if (amt <= 0) continue;

      total += amt;
      payments++;

      var day = d.getDate();
      weeks[day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3] += amt;

      if (cWork >= 0 && String(row[cWork]).trim().toLowerCase() === 'referral') referrals++;

      if (cFormat >= 0) {
        var fmt = String(row[cFormat] || '').trim().toLowerCase();
        if (fmt === 'upgrade to prm' || fmt === 'upgrade to ind') upgrades++;
      }
    }

    return {
      total:     Math.round(total*100)/100,
      payments:  payments,
      aov:       payments > 0 ? Math.round(total/payments*100)/100 : 0,
      referrals: referrals,
      weekly:    weeks.map(function(v){ return Math.round(v*100)/100; }),
      upgrades:  upgrades,
    };
  } catch(e) {
    return emptyVentas();
  }
}

// ── calcEfficiency ────────────────────────────────────────────────────────────
function calcEfficiency(calls) {
  var total    = calls.sysCalls + calls.waCalls;
  var totalSec = calls.sysTimeSec + calls.waTimeSec;
  if (total === 0) return { pct:0, avgPerClientSec:0, totalCalls:0, totalTimeSec:0, metaSec:META_CALL_SECS };

  var clients         = total / 3;
  var avgPerClientSec = Math.round(totalSec / clients);
  var pct             = Math.round(avgPerClientSec / META_CALL_SECS * 100 * 100) / 100;

  return {
    pct:            pct,
    avgPerClientSec:avgPerClientSec,
    totalCalls:     total,
    sysCalls:       calls.sysCalls,
    sysTimeSec:     calls.sysTimeSec,
    waCalls:        calls.waCalls,
    waTimeSec:      calls.waTimeSec,
    totalTimeSec:   totalSec,
    metaSec:        META_CALL_SECS,
  };
}

// ── calcCommission ────────────────────────────────────────────────────────────
function calcCommission(total) {
  var pct = total >= 20000 ? 6 : total >= 15000 ? 5 : total >= 9500 ? 4 : total >= 6500 ? 3 : total >= 3500 ? 2 : 0;
  var nextThreshold = [3500,6500,9500,15000,20000,Infinity];
  var levels        = [0,2,3,4,5,6];
  var levelIdx      = levels.indexOf(pct);
  return {
    pct:           pct,
    amount:        Math.round(total * pct / 100 * 100) / 100,
    nextThreshold: nextThreshold[levelIdx >= 0 ? levelIdx : 0],
    missingForNext:levelIdx >= 0 && levelIdx < nextThreshold.length-1 ? Math.max(0, nextThreshold[levelIdx] - total) : 0,
  };
}

// ── helpers ───────────────────────────────────────────────────────────────────
function timeToSec(val) {
  if (!val) return 0;
  if (val instanceof Date) return val.getHours()*3600 + val.getMinutes()*60 + val.getSeconds();
  if (typeof val === 'number') return Math.round(val * 86400);
  var parts = String(val).trim().split(':').map(Number);
  if (parts.length === 3) return (parts[0]*3600 + parts[1]*60 + parts[2]) || 0;
  if (parts.length === 2) return (parts[0]*60  + parts[1]) || 0;
  return 0;
}

function emptyVentas() {
  return { total:0, payments:0, aov:0, referrals:0, weekly:[0,0,0,0], upgrades:0 };
}

// ── getSalesHistory ───────────────────────────────────────────────────────────
// Reads AOV-Sales spreadsheet: col A = name, col B = email, col C+ = months
function getSalesHistory(email) {
  if (!email) return { success: false, error: 'Email requerido' };

  try {
    var ss    = SpreadsheetApp.openById(CONTROL_ID);
    var sheet = ss.getSheetByName(SALES_HISTORY_TAB);
    if (!sheet) return { success: false, error: 'Pestaña "' + SALES_HISTORY_TAB + '" não encontrada' };
    if (sheet.getLastRow() < 2) return { success: false, error: 'Sem dados' };

    var data    = sheet.getDataRange().getValues();
    var headers = data[0];

    // Build month column map from headers (col B onwards = index 2+)
    var MONTH_NAMES = ['january','february','march','april','may','june',
                       'july','august','september','october','november','december'];
    var monthCols = [];
    var curYear   = SALES_START_YEAR;
    var lastIdx   = -1;

    for (var c = 2; c < headers.length; c++) {
      var h  = String(headers[c] || '').trim().toLowerCase();
      var mi = MONTH_NAMES.indexOf(h);
      if (mi < 0) continue;
      if (lastIdx >= 0 && mi <= lastIdx) curYear++; // year rollover (Dec → Jan)
      lastIdx = mi;
      monthCols.push({ col: c, month: mi + 1, year: curYear });
    }

    // Find manager row by email (col B = index 1)
    for (var i = 1; i < data.length; i++) {
      var row      = data[i];
      var rowEmail = String(row[1] || '').trim().toLowerCase();
      if (rowEmail !== email) continue;

      var points = [];
      for (var j = 0; j < monthCols.length; j++) {
        var mc  = monthCols[j];
        var raw = String(row[mc.col] || '').replace(/[$,\s]/g, '');
        var val = parseFloat(raw) || 0;
        if (val > 0) points.push({ month: mc.month, year: mc.year, total: val });
      }
      return { success: true, points: points };
    }

    return { success: false, error: 'Manager não encontrado no histórico' };
  } catch(e) {
    return { success: false, error: String(e) };
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
