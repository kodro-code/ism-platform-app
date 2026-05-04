/**
 * GAS INDICAÇÕES — Referral system backend
 *
 * DEPLOY:
 * 1. script.google.com → Nuevo proyecto → pegar este código
 * 2. Implementar → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo  |  Acceso: Cualquier usuario
 * 3. Copiar URL → pegar en .env.local como GAS_INDICACOES_URL
 * 4. Abrir la URL con ?action=setup para inicializar las pestañas
 *
 * SPREADSHEET: 1RgqNg4LA5pPPIt3nJoS5Dnvryi8nNZarWZgRegRgwqo
 *
 * GET  ?action=setup              → inicializa Managers_Config
 * GET  ?action=managers           → lista de managers con active status
 * GET  ?action=referrals          → todos los referrals (director)
 * GET  ?action=referrals&code=09  → referrals de un manager
 *
 * POST { action:'submitForm',   ...formData }              → guarda referral + Telegram
 * POST { action:'updateStatus', rowIndex, status, notes }  → actualiza status
 * POST { action:'toggleManager', code, active }            → activa/desactiva manager
 */

var SS_ID        = '1RgqNg4LA5pPPIt3nJoS5Dnvryi8nNZarWZgRegRgwqo';
var RESPOSTAS    = 'Respostas';
var MANAGERS_CFG = 'Managers_Config';

// ── TELEGRAM ──────────────────────────────────────────────────────────────────
var TELEGRAM_TOKEN     = '8006128271:AAGfGXN1bkqJZQ2RQc-KQrJGe7jP7uCpsC8';
var TELEGRAM_CHAT_ID   = '-1002417105121';
var TELEGRAM_THREAD_ID = 3804; // null si no usas tópicos

// ── MANAGERS SEED (solo para el primer setup) ─────────────────────────────────
var MANAGERS_SEED = [
  ['01', 'ISM Bruna Regina Rozza',           '@brunarozza',           true],
  ['02', 'ISM Juliana Cataldo Braga',         '@Julibraga',            true],
  ['03', 'ISM Izabela Costa De Oliveira',     '@izabelaoliveiraz',     true],
  ['04', 'ISM Beatriz Matos Mota',            '@belatrizmm',           true],
  ['05', 'ISM Arturo Pacheco',                '@arturopp',             true],
  ['06', 'ISM Melissa Andreia Fagundes',      '@MelissaFagundes',      true],
  ['07', 'ISM Moacir de Souza Junqueira',     '@moacirjunqueira',      true],
  ['08', 'ISM Taiza dos Santos Reis',         '@taizareis',            true],
  ['09', 'ISM Alcidelia Valeriano',           '@alcideliavaleriano',   true],
  ['10', 'ISM Luana Dias dos Santos',         '@luanad1as',            true],
  ['11', 'ISM Leticia Tiburcio Ervilha',      '@tiburcioleticia',      true],
  ['12', 'ISM Mariana Mischiatti Cavaleiro',  '@marianamischiatti',    true],
];

// ── GET ───────────────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    var action = (e.parameter.action || '').trim();
    var ss     = SpreadsheetApp.openById(SS_ID);

    if (action === 'setup')     return respond(setupSheets(ss));
    if (action === 'managers')  return respond(getManagers(ss));
    if (action === 'referrals') return respond(getReferrals(ss, e.parameter.code || null));

    return respond({ success: false, error: 'Ação não reconhecida. Use ?action=setup|managers|referrals' });
  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var action = body.action;
    var ss     = SpreadsheetApp.openById(SS_ID);

    if (action === 'submitForm')    return respond(submitForm(ss, body));
    if (action === 'updateStatus')  return respond(updateStatus(ss, body));
    if (action === 'toggleManager') return respond(toggleManager(ss, body));

    return respond({ success: false, error: 'Ação não reconhecida' });
  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

// ── setupSheets ───────────────────────────────────────────────────────────────
function setupSheets(ss) {
  var res = ss.getSheetByName(RESPOSTAS);
  if (!res) res = ss.insertSheet(RESPOSTAS);
  if (res.getLastRow() === 0) {
    res.appendRow(['ID_Referido','Nome','Telefone','Email','Horário','Dia_Contato',
                   'Data','Link_Cliente','Manager_Responsável','Status','Status_Updated','Notes']);
  }

  var mgr = ss.getSheetByName(MANAGERS_CFG);
  if (!mgr) {
    mgr = ss.insertSheet(MANAGERS_CFG);
    mgr.appendRow(['Manager_Code','Manager_Name','Telegram_Tag','Active']);
    MANAGERS_SEED.forEach(function(row) { mgr.appendRow(row); });
    return { success: true, message: 'Managers_Config criada com ' + MANAGERS_SEED.length + ' managers.' };
  }

  return { success: true, message: 'Sheets já existem. Nenhuma alteração feita.' };
}

// ── getManagers ───────────────────────────────────────────────────────────────
function getManagers(ss) {
  var sheet = ss.getSheetByName(MANAGERS_CFG);
  if (!sheet) return { success: false, error: 'Managers_Config não encontrada. Execute ?action=setup primeiro.' };

  var rows     = sheet.getDataRange().getValues();
  var managers = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    managers.push({
      code:        String(r[0]).trim().padStart(2, '0'),
      name:        String(r[1]).trim(),
      telegramTag: String(r[2]).trim(),
      active:      r[3] === true || String(r[3]).toLowerCase() === 'true'
    });
  }
  return { success: true, managers: managers };
}

// ── getReferrals ──────────────────────────────────────────────────────────────
function getReferrals(ss, managerCode) {
  var sheet = ss.getSheetByName(RESPOSTAS);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, referrals: [] };

  var rows      = sheet.getDataRange().getValues();
  var tz        = Session.getScriptTimeZone();
  var referrals = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;

    var id   = String(r[0]).trim();
    var code = id.length >= 2 ? id.slice(-2) : '';

    if (managerCode && code !== String(managerCode).trim()) continue;

    referrals.push({
      rowIndex:      i + 1,
      id:            id,
      managerCode:   code,
      nome:          r[1]  || '',
      telefone:      r[2]  || '',
      email:         r[3]  || '',
      horario:       r[4]  || '',
      diaContato:    r[5]  || '',
      data:          r[6]  ? safeFormatDate(r[6], tz) : '',
      linkCliente:   r[7]  || '',
      managerName:   r[8]  || '',
      status:        r[9]  || 'Não Contactado',
      statusUpdated: r[10] ? safeFormatDate(r[10], tz) : '',
      notes:         r[11] || ''
    });
  }

  referrals.sort(function(a, b) { return b.rowIndex - a.rowIndex; });
  return { success: true, referrals: referrals };
}

// ── submitForm ────────────────────────────────────────────────────────────────
function submitForm(ss, data) {
  var sheet = ss.getSheetByName(RESPOSTAS);
  if (!sheet) return { success: false, error: 'Respostas não encontrada' };

  var now        = new Date();
  var idReferido = String(data.idReferido || '').trim();
  var code       = idReferido.length >= 2 ? idReferido.slice(-2) : '';

  // Build BO link from ID length
  var linkCliente = '';
  if (idReferido.length === 9) {
    linkCliente = 'https://bo.kodland.org/students/' + idReferido.substring(0, 7);
  } else if (idReferido.length === 10) {
    linkCliente = 'https://kodland.amocrm.ru/leads/detail/' + idReferido.substring(0, 8);
  }

  // Look up manager name + Telegram tag
  var managerName = 'Desconhecido';
  var managerTag  = '';
  var mgrSheet = ss.getSheetByName(MANAGERS_CFG);
  if (mgrSheet) {
    var mgrRows = mgrSheet.getDataRange().getValues();
    for (var i = 1; i < mgrRows.length; i++) {
      if (String(mgrRows[i][0]).trim().padStart(2, '0') === code) {
        managerName = String(mgrRows[i][1]).trim();
        managerTag  = String(mgrRows[i][2]).trim();
        break;
      }
    }
  }

  sheet.appendRow([
    idReferido,
    String(data.nome       || '').trim(),
    String(data.telefone   || '').trim(),
    String(data.email      || '').trim(),
    String(data.horario    || '').trim(),
    String(data.diaContato || '').trim(),
    now,
    linkCliente,
    managerName,
    'Não Contactado',
    '',
    ''
  ]);

  try { sendTelegram(data, managerName, managerTag, linkCliente, now); }
  catch(e) { Logger.log('Telegram error: ' + e.message); }

  return { success: true, manager: managerName, linkCliente: linkCliente };
}

// ── updateStatus ──────────────────────────────────────────────────────────────
function updateStatus(ss, data) {
  var sheet = ss.getSheetByName(RESPOSTAS);
  if (!sheet)                            return { success: false, error: 'Respostas não encontrada' };
  if (!data.rowIndex || data.rowIndex < 2) return { success: false, error: 'rowIndex inválido' };

  var tz  = Session.getScriptTimeZone();
  var now = Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm');

  sheet.getRange(data.rowIndex, 10).setValue(data.status || '');
  sheet.getRange(data.rowIndex, 11).setValue(now);
  if (data.notes !== undefined) sheet.getRange(data.rowIndex, 12).setValue(data.notes);

  return { success: true };
}

// ── toggleManager ─────────────────────────────────────────────────────────────
function toggleManager(ss, data) {
  var sheet = ss.getSheetByName(MANAGERS_CFG);
  if (!sheet) return { success: false, error: 'Managers_Config não encontrada' };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().padStart(2, '0') === String(data.code).trim().padStart(2, '0')) {
      var newVal = data.active === true || data.active === 'true';
      sheet.getRange(i + 1, 4).setValue(newVal);
      return { success: true, code: data.code, active: newVal };
    }
  }
  return { success: false, error: 'Manager não encontrado' };
}

// ── sendTelegram (HTML parse_mode — más confiable que MarkdownV2) ──────────────
function sendTelegram(data, managerName, managerTag, linkCliente, date) {
  var tz      = Session.getScriptTimeZone();
  var dateStr = Utilities.formatDate(date, tz, 'dd/MM/yyyy HH:mm');
  var tag     = managerTag ? managerTag : managerName;
  var cliente = data.clientName ? escHtml(String(data.clientName)) : '';

  var msg = '✨ <b>NOVO INDICADO!</b> ✨\n\n';
  msg += '👋 Olá ' + tag + ',\n\n';
  if (cliente) {
    msg += 'O cliente <b>' + cliente + '</b> indicou um novo contato!\n\n';
  } else {
    msg += 'Um novo indicado preencheu o formulário!\n\n';
  }
  msg += '<b>👤 Dados do Indicado:</b>\n';
  msg += '• <b>Nome:</b> '     + escHtml(data.nome       || '') + '\n';
  msg += '• <b>Telefone:</b> ' + escHtml(data.telefone   || '') + '\n';
  msg += '• <b>Email:</b> '    + escHtml(data.email      || '') + '\n';
  msg += '• <b>Horário:</b> '  + escHtml(data.horario    || '') + '\n';
  msg += '• <b>Dia:</b> '      + escHtml(data.diaContato || '') + '\n';
  msg += '• <b>Data:</b> '     + dateStr + '\n';
  if (linkCliente) {
    msg += '• <b>Link BO:</b> <a href="' + linkCliente + '">' + linkCliente + '</a>\n';
  }
  msg += '\n<i>Entre em contato o mais rápido possível!</i> 🚀';

  var payload = {
    chat_id:    TELEGRAM_CHAT_ID,
    text:       msg,
    parse_mode: 'HTML'
  };
  if (TELEGRAM_THREAD_ID) payload.message_thread_id = TELEGRAM_THREAD_ID;

  var response = UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage',
    { method: 'post', payload: payload }
  );
  Logger.log('Telegram response: ' + response.getContentText());
}

// ── helpers ───────────────────────────────────────────────────────────────────
function safeFormatDate(cell, tz) {
  try { return Utilities.formatDate(new Date(cell), tz, 'dd/MM/yyyy HH:mm'); }
  catch(e) { return String(cell); }
}

function escHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
