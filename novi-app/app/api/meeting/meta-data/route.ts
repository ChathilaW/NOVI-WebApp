import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const host_id = searchParams.get('host_id');
    const meeting_id = searchParams.get('meeting_id');

    let query = supabase.from('host_meetings').select('*');
    if (host_id) query = query.eq('host_id', host_id);
    if (meeting_id) query = query.eq('meeting_id', meeting_id);

    const { data, error } = await query;

    if (error) {
      console.error('[Meeting Meta-Data DB Get] Error fetching host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error('[Meeting Meta-Data DB Get] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { host_id, meeting_id } = body;

    if (!host_id || !meeting_id) {
      return NextResponse.json({ error: 'Missing host_id or meeting_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('host_meetings')
      .insert([{ host_id, meeting_id }]);

    if (error) {
      console.error('[Meeting Meta-Data DB Post] Error inserting host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Success setup host meeting', data }, { status: 201 });
  } catch (err: any) {
    console.error('[Meeting Meta-Data DB Post] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const meeting_id = searchParams.get('meeting_id');

    if (!meeting_id) {
      return NextResponse.json({ error: 'Missing meeting_id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('host_meetings')
      .delete()
      .eq('meeting_id', meeting_id);

    if (error) {
      console.error('[Meeting Meta-Data DB Delete] Error deleting host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('[Meeting Meta-Data DB Delete] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
