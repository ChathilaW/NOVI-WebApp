import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('group_session')
      .select('participant_name, peak_distraction_pct, peak_distraction_time')
      .gt('peak_distraction_pct', 40)
      .order('peak_distraction_time', { ascending: false });

    if (error) {
      console.error('[Summary API] Error fetching distractions:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });

  } catch (err: any) {
    console.error('[Summary API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
