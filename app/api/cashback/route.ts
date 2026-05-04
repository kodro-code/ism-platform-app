import { NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzQo2m-_lM3FDW6ePwVBnZQAhweEK6YwYnTakYxWkdl6EprH39T2iBUWzMC4Y3dreB6/exec';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res  = await fetch(GAS_URL, {
      method:  'POST',
      body:    JSON.stringify(body),
      headers: { 'Content-Type': 'text/plain' },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, message: 'Erro ao contatar o servidor' }, { status: 500 });
  }
}
