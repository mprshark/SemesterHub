import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'Unknown IP';
    const userAgent = req.headers.get('user-agent') || 'Unknown Browser';
    const { pathname } = await req.json().catch(() => ({ pathname: '/' }));

    const { error } = await supabase.from('visitor_logs').insert([
      { ip_address: ip, user_agent: userAgent, path: pathname }
    ]);

    if (error) {
      console.error('Failed to log visitor:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
