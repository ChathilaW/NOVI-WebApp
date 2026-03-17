import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch the highly distracted users
    const { data: distractionsData, error: distError } = await supabase
      .from('group_session')
      .select('participant_name, peak_distraction_pct, peak_distraction_time')
      .gt('peak_distraction_pct', 40)
      .order('peak_distraction_time', { ascending: false });

    if (distError) {
      console.error('[Summary API] Error fetching distractions:', distError);
      return NextResponse.json({ ok: false, error: distError.message }, { status: 500 });
    }

    // Fetch the latest session time to display date even if distractions are empty
    const { data: sessionData, error: sessionError } = await supabase
        .from('group_session')
        .select('peak_distraction_time')
        .order('peak_distraction_time', { ascending: false })
        .limit(1);

    if (sessionError) {
        console.error('[Summary API] Error fetching session date:', sessionError);
        // Continue even if session date fetch fails, the UI will fall back gracefully
    }

    return NextResponse.json({ 
        ok: true, 
        data: {
            distractions: distractionsData || [],
            sessionDate: sessionData && sessionData.length > 0 ? sessionData[0].peak_distraction_time : null
        } 
    });

  } catch (err: any) {
    console.error('[Summary API] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
