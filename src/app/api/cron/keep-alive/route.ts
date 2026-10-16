import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Supabase Free pauses a project after 7 days without activity. Vercel Cron calls this
// route daily (vercel.json); GitHub Actions pings the REST API as a second, independent layer.
export async function GET(request: Request) {
  // When CRON_SECRET is set in Vercel, Vercel Cron sends it as a Bearer token; reject other callers.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { status: 'error', message: 'Supabase credentials missing on server environment', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const { count, error } = await supabase.from('events').select('id', { count: 'exact', head: true });
    const latencyMs = Date.now() - startTime;

    if (error) {
      console.error('keep-alive ping failed:', error.message);
      return NextResponse.json(
        { status: 'error', message: error.message, latencyMs, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: 'ok', events: count ?? 0, latencyMs, timestamp: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error during Supabase keep-alive ping';
    console.error('keep-alive ping exception:', message);
    return NextResponse.json({ status: 'error', message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}
