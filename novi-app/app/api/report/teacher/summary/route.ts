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

    // Parse host_id from query params
    const host_id = req.nextUrl.searchParams.get('host_id');

    // Check whether the current logged-in user's userid is provided
    if (!host_id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: No host_id provided' }, { status: 401 });
    }

    // Step 1 & 2: Query host_meetings for the latest meeting_id for this host_id
    const { data: hostMatches, error: hostError } = await supabase
      .from('host_meetings')
      .select('meeting_id')
      .eq('host_id', host_id)
      .order('date_time', { ascending: false })
      .limit(1);

    if (hostError) {
      console.error('[Summary API] Error querying host_meetings for latest session:', hostError);
      return NextResponse.json({ ok: false, error: hostError.message }, { status: 500 });
    }

    // If there're no matches, don't GET any rows in group_session table
    if (!hostMatches || hostMatches.length === 0) {
      return NextResponse.json({ 
        ok: true, 
        data: {
            distractions: [],
            sessionDate: null
        } 
      });
    }

    const latestMeetingId = hostMatches[0].meeting_id;

    if (!latestMeetingId) {
      return NextResponse.json({ 
        ok: true, 
        data: {
            distractions: [],
            sessionDate: null
        } 
      });
    }

    // Step 3: Fetch the raw check counts and related columns from group_session explicitly checked against the newest session_id
    const { data: rawData, error: distError } = await supabase
      .from('group_session')
      .select('participant_name, total_checks, distracted_checks')
      .eq('session_id', latestMeetingId)
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

    // Fetch the latest session time to display date even if distractions are empty (Filtered safely by session_id)
    const { data: sessionData, error: sessionError } = await supabase
        .from('group_session')
        .select('peak_distraction_time')
        .eq('session_id', latestMeetingId)
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
