import { NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxZM-ltM2eRn9uZ7lIMGfk7UhDXbdaG_QOAaU0kSdKtrGhgTNE2HXznjYrowzb50lSGOA/exec';

// ── Agregar una línea aquí cada mes nuevo ─────────────────────────────────────
const SHEETS: Record<string, string> = {
  '2026-04': '13CgeUCJIhVb1N43R8r46nqpaPMLVYFQgVM86_QrfRHg',
  '2026-05': '1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0',
  // '2026-06': 'ID_DEL_SHEET_DE_JUNIO',
};

const CURRENT = '2026-05';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month') || CURRENT;
  const spreadsheetId = SHEETS[month] || SHEETS[CURRENT];

  try {
    const res  = await fetch(`${GAS_URL}?spreadsheetId=${spreadsheetId}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'No se pudo obtener datos' }, { status: 500 });
  }
}
