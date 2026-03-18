import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function DELETE() {
  try {
    // Authenticate the user natively to prevent unauthorized wipes
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Step 1: Find the latest meeting recorded for this host
    const { data: hostMatches, error: hostError } = await supabase
      .from('host_meetings')
      .select('meeting_id')
      .eq('host_id', userId)
      .order('date_time', { ascending: false })
      .limit(1);

    if (hostError) {
      console.error('[DB Cleanup] Error querying host_meetings for latest session:', hostError);
      return NextResponse.json({ ok: false, error: hostError.message }, { status: 500 });
    }

    // Step 2: If no matches are found, don't delete any rows in group_session
    if (!hostMatches || hostMatches.length === 0) {
      console.log('[DB Cleanup] No host meetings found for user. Skipping cleanup.');
      return NextResponse.json({ ok: true, message: 'No cleanup needed for this user' });
    }

    // Extract the latest meeting_id
    const latestMeetingId = hostMatches[0].meeting_id;

    if (!latestMeetingId) {
      return NextResponse.json({ ok: true, message: 'No latest session_id found to cleanup' });
    }

    // Step 3: Check whether the extracted meeting_id is in any row of group_session
    // and DELETE only those distinct rows that match the session_id
    const { error: deleteError } = await supabase
      .from('group_session')
      .delete()
      .eq('session_id', latestMeetingId);

    if (deleteError) {
      console.error(`[DB Cleanup] Error wiping group_session for meeting ${latestMeetingId}:`, deleteError);
      return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
    }

    console.log(`[DB Cleanup] Successfully wiped previous tracking rows for group_session ${latestMeetingId}.`);
    return NextResponse.json({ ok: true, message: 'Specific session cleared successfully from group_session' });

  } catch (err: any) {
    console.error('[DB Cleanup] Unexpected error during selective cleanup:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
