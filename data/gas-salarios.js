/**
 * gas-salarios.js — Rhino + V8 compatible
 * Deploy as Google Apps Script Web App (Execute as: Me, Access: Anyone).
 */

var BLOCK         = 12;
var DCOL          = 1;
var SHEET_NAME    = 'Salaries_Final';
var PASSWORDS_TAB = 'passwords';

function doGet(e) {
  try {
    var action = (e.parameter.action || '').trim();
    if (action === 'getAll')      return respond(getAllManagers());
    if (action === 'setApproval') return respond(setApproval(
      Number(e.parameter.mgrRow),
      Number(e.parameter.col),
      String(e.parameter.status || '').trim()
    ));
    return respond({ error: 'Unknown action: ' + action });
  } catch (err) {
    return respond({ error: String(err), stack: err && err.stack ? String(err.stack).slice(0, 400) : '' });
  }
}

function respond(data) {
  var out = ContentService.createTextOutput(JSON.stringify(data));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

// Returns { 'email@domain.com': { photoUrl, displayName } } for active managers.
// Returns null if passwords tab is missing → no filter applied.
function getManagersMeta() {
  try {
    var ss = SpreadsheetApp.openById('1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0');
    var sh = ss.getSheetByName(PASSWORDS_TAB);
    if (!sh) return null;

    var vals = sh.getDataRange().getValues();
    if (vals.length < 2) return {};

    var header    = vals[0];
    var emailCol  = -1, nameCol = -1, activeCol = -1, photoCol = -1;

    for (var h = 0; h < header.length; h++) {
      var hName = String(header[h]).toLowerCase().trim();
      if (hName === 'email')                                                             emailCol  = h;
      if (hName === 'name' || hName === 'nombre' || hName === 'nome')                   nameCol   = h;
      if (hName === 'active' || hName === 'ativo' || hName === 'activo')                activeCol = h;
      if (hName === 'foto url' || hName === 'photo url' || hName === 'photo' || hName === 'foto') photoCol = h;
    }

    if (emailCol < 0) return null;

    var meta = {};
    for (var i = 1; i < vals.length; i++) {
      if (activeCol >= 0) {
        var isActive = vals[i][activeCol];
        if (isActive === false || String(isActive).toLowerCase() === 'false') continue;
      }
      var email = String(vals[i][emailCol] || '').trim().toLowerCase();
      if (!email) continue;
      var photoUrl    = photoCol >= 0 ? String(vals[i][photoCol]  || '').trim() : '';
      var displayName = nameCol  >= 0 ? String(vals[i][nameCol]   || '').trim() : '';
      meta[email] = { photoUrl: photoUrl, displayName: displayName };
    }
    return meta;
  } catch (err) {
    return null;
  }
}

function getAllManagers() {
  var ss   = SpreadsheetApp.openById('1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0');
  var sh   = ss.getSheetByName(SHEET_NAME);
  var vals = sh.getDataRange().getValues();
  var rows = vals.length;

  var meta     = getManagersMeta();
  var managers = [];
  var r        = 0;

  while (r + BLOCK <= rows) {
    var name  = String(vals[r][0] || '').trim();
    var email = String(vals[r][1] || '').trim().toLowerCase();

    if (!name) { r += BLOCK; continue; }

    // Email-based lookup in passwords tab
    var mgrMeta;
    if (meta === null) {
      mgrMeta = { photoUrl: '', displayName: name };
    } else if (email && meta[email] !== undefined) {
      mgrMeta = meta[email];
    } else {
      // Not in passwords (inactive/terminated) — include for totals but mark inactive
      mgrMeta = { photoUrl: '', displayName: name, inactive: true };
    }

    var dataRow     = vals[r + 1];
    var fixRow      = vals[r + 2];
    var salesRow    = vals[r + 3];
    var pctRow      = vals[r + 4];
    var commRow     = vals[r + 5];
    var extraRow    = vals[r + 6];
    var bonusRow    = vals[r + 7];
    var finesRow    = vals[r + 8];
    var totalRow    = vals[r + 9];
    var commentRow  = vals[r + 10];
    var approvedRow = vals[r + 11];

    var payments = [];

    for (var c = DCOL; c < dataRow.length; c++) {
      var dateVal = dataRow[c];
      if (!dateVal) continue;

      var dateRaw = (dateVal instanceof Date)
        ? dateVal.toISOString()
        : String(dateVal).trim();

      if (!dateRaw) continue;

      var fix         = Number(fixRow[c])    || 0;
      var totalSales  = Number(salesRow[c])  || 0;
      var pctComm     = Number(pctRow[c])    || 0;
      var commission  = Number(commRow[c])   || 0;
      var extraDays   = Number(extraRow[c])  || 0;
      var bonus       = Number(bonusRow[c])  || 0;
      var fines       = Number(finesRow[c])  || 0;
      var totalSalary = Number(totalRow[c])  || 0;
      var comment     = String(commentRow[c] || '').trim();
      var approved    = String(approvedRow[c]|| '').trim();
      var isClosing   = commission !== 0 || totalSales !== 0;

      payments.push({
        dateRaw:     dateRaw,
        col:         c,
        rowStart:    r,
        isClosing:   isClosing,
        fix:         fix,
        totalSales:  totalSales,
        pctComm:     pctComm,
        commission:  commission,
        extraDays:   extraDays,
        bonus:       bonus,
        fines:       fines,
        totalSalary: totalSalary,
        comment:     comment,
        approved:    approved
      });
    }

    managers.push({
      name:     mgrMeta.displayName || name,
      email:    email,
      rowStart: r,
      payments: payments,
      photoUrl: mgrMeta.photoUrl || '',
      inactive: mgrMeta.inactive || false
    });
    r += BLOCK;
  }

  return managers;
}

// mgrRow: 0-indexed block start. Approved row is at offset 11.
// getRange is 1-indexed: sheet row = mgrRow + 12, sheet col = col + 1
function setApproval(mgrRow, col, status) {
  var ss = SpreadsheetApp.openById('1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0');
  var sh = ss.getSheetByName(SHEET_NAME);
  sh.getRange(mgrRow + 12, col + 1).setValue(status);
  SpreadsheetApp.flush();
  return { ok: true };
}
