import { NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbz0BxPL6vFlpIHIJ5jGMvEF2PZ5enMgwXqL5yCmvoYbSGnqZbsTVmDK9JH0LOWsn8E8bg/exec';

export async function GET() {
  try {
    const res = await fetch(`${GAS_URL}?sheet=awards`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'No se pudo obtener achievements' }, { status: 500 });
  }
}
