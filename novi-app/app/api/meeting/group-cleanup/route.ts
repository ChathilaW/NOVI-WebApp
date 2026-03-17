import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE() {
  try {
    // Delete all rows from the group_session table. 
    // Supabase requires at least one filter for a delete operation, 
    // so we use a condition that is always true (session_id is not empty).
    const { error } = await supabase
      .from('group_session')
      .delete()
      .neq('session_id', 'dummy_value_to_trigger_delete_all');
      
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
