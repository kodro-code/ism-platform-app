import { NextRequest, NextResponse } from 'next/server';

const GAS_URL = process.env.GAS_INDICACOES_URL;

function noConfig() {
  return NextResponse.json({ success: false, error: 'GAS_INDICACOES_URL não configurada' });
}

// GET ?action=managers | referrals | referrals&code=XX | setup
export async function GET(req: NextRequest) {
  if (!GAS_URL) return noConfig();
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'managers';
    const code   = searchParams.get('code');

    let gasUrl = `${GAS_URL}?action=${action}`;
    if (code) gasUrl += `&code=${code}`;

    const res  = await fetch(gasUrl, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}

// POST — submitForm | updateStatus | toggleManager
export async function POST(req: NextRequest) {
  if (!GAS_URL) return noConfig();
  try {
    const body = await req.json();
    const res  = await fetch(GAS_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}
