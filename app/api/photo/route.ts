import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return new NextResponse(null, { status: 400 });

  const urls = [
    `https://drive.google.com/thumbnail?id=${id}&sz=w400`,
    `https://lh3.googleusercontent.com/d/${id}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const ct  = res.headers.get('content-type') ?? '';
      if (res.ok && ct.startsWith('image/')) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          headers: {
            'Content-Type': ct,
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    } catch {}
  }

  return new NextResponse(null, { status: 404 });
}
