/**
 * GAS AUTH — Script independiente para autenticación de managers
 *
 * INSTRUCCIONES DE DEPLOY:
 * 1. Abrir script.google.com → Nuevo proyecto → pegar este código
 * 2. Implementar > Nueva implementación > Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier usuario
 * 3. Copiar la URL generada y pegarla en .env.local como GAS_AUTH_URL
 *
 * PLANILLA: 1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0
 * PESTAÑA:  passwords
 * COLUMNAS: email | password | nombre | rol | turno_inicio | turno_fin | Active
 */

const SPREADSHEET_ID = '1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0';
const SHEET_NAME = 'passwords';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { email, password } = body;

    if (!email || !password) {
      return respond({ success: false, error: 'Credenciales incompletas' });
    }

    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data  = sheet.getDataRange().getValues();
    const heads = data[0].map(h => String(h).trim().toLowerCase());

    const col = {
      email:   heads.indexOf('email'),
      pass:    heads.indexOf('password'),
      nombre:  heads.indexOf('nombre'),
      rol:     heads.indexOf('rol'),
      inicio:  heads.indexOf('turno_inicio'),
      fin:     heads.indexOf('turno_fin'),
      active:  heads.indexOf('active'),
      foto:    heads.indexOf('foto'),
      pestana: heads.indexOf('pestana'),
    };

    for (let i = 1; i < data.length; i++) {
      const row      = data[i];
      const rowEmail = String(row[col.email]).trim().toLowerCase();
      const rowPass  = String(row[col.pass]).trim();
      const isActive = row[col.active] === true
        || String(row[col.active]).toLowerCase() === 'true'
        || row[col.active] === 1;

      if (rowEmail === email.trim().toLowerCase() && rowPass === password && isActive) {
        return respond({
          success: true,
          user: {
            email:        String(row[col.email]).trim(),
            nombre:       String(row[col.nombre]).trim(),
            rol:          String(row[col.rol]).trim(),
            turno_inicio: String(row[col.inicio]).trim(),
            turno_fin:    String(row[col.fin]).trim(),
            foto:         col.foto    >= 0 ? String(row[col.foto]).trim()    : '',
            pestana:      col.pestana >= 0 ? String(row[col.pestana]).trim() : '',
          },
        });
      }
    }

    return respond({ success: false, error: 'Email ou senha inválidos' });

  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

// Health check
function doGet() {
  return respond({ status: 'ok', service: 'ism-auth' });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
