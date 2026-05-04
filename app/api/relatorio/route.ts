import { NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzVUgNnh842kvIZLAkyWG_-uA7vlfAe1W6AyVnDaQGLGSaOXKKt3WwAS_GzkzE7VJYcpw/exec';

export async function GET() {
  try {
    const res  = await fetch(`${GAS_URL}?action=getManagers`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

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
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Error al contactar el servidor' }, { status: 500 });
  }
}
