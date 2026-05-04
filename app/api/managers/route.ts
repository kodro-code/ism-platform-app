import { NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzrWS6rn2THQBtzzRb_wh0yoayzBSMCG5ZkmykgWDVJXTBKDZaruSHPgq-ix6jMrvRtZg/exec';

export async function GET() {
  try {
    const res = await fetch(GAS_URL, {
      cache: 'no-store',
    });
    const managers = await res.json();
    return NextResponse.json(managers);
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo obtener la lista de managers' }, { status: 500 });
  }
}
