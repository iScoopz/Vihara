import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      status: 'error',
      message: 'Supabase credentials missing on server environment',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Lightweight query directly to Supabase to register active database activity
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        latencyMs,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase heartbeat ping successful. Project activity has been recorded.',
      latencyMs,
      recordsFound: data?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Unexpected error during Supabase keep-alive ping',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
