import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Parse threshold from query params
    const thresholdParam = req.nextUrl.searchParams.get('threshold');
    const threshold = thresholdParam ? parseInt(thresholdParam, 10) : 75;

    // Parse sorting order from query params
    const sortOrderParam = req.nextUrl.searchParams.get('sort');
    const isAscending = sortOrderParam === 'asc';

    // Fetch the raw check counts and related columns from group_session
    const { data: rawData, error: distError } = await supabase
      .from('group_session')
      .select('participant_name, total_checks, distracted_checks')
      .order('peak_distraction_time', { ascending: false });

    if (distError) {
      console.error('[Summary API] Error fetching distractions:', distError);
      return NextResponse.json({ ok: false, error: distError.message }, { status: 500 });
    }

    // Calculate percentage and filter based on threshold
    const distractionsData = (rawData || [])
      .map(row => {
        let pct = 0;
        if (row.total_checks && row.total_checks > 0) {
          pct = (row.distracted_checks / row.total_checks) * 100;
        }
        return {
          participant_name: row.participant_name,
          distraction_percentage: pct
        };
      })
      .filter(row => row.distraction_percentage > threshold);

    // Sort by calculated percentage
    distractionsData.sort((a, b) => {
        if (isAscending) {
            return a.distraction_percentage - b.distraction_percentage;
        } else {
            return b.distraction_percentage - a.distraction_percentage;
        }
    });

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
