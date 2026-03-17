import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all rows from the group_session table that belong to the current host
    const { error } = await supabase
      .from('group_session')
      .delete()
      .eq('host_id', userId); // <-- Here: Only deletes rows where the group_session's host_id matches the active user's Clerk ID

    if (error) {
      console.error('[DB Cleanup] Error wiping group_session table:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log('[DB Cleanup] Successfully wiped group_session table for new meeting.');
    return NextResponse.json({ ok: true, message: 'Table cleared successfully' });

  } catch (err: any) {
    console.error('[DB Cleanup] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
