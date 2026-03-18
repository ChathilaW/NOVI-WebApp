import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET endpoint to fetch meeting metadata
// Accepts query parameters: ?host_id=... & meeting_id=... & latest=true
export async function GET(req: Request) {
  try {
    // Parse the URL to get query parameters
    const { searchParams } = new URL(req.url);
    const host_id = searchParams.get('host_id');
    const meeting_id = searchParams.get('meeting_id');
    // Start building the Supabase query to select all columns
    let query = supabase.from('host_meetings').select('*');
    
    // Apply filters if parameters are provided
    if (host_id) query = query.eq('host_id', host_id);
    if (meeting_id) query = query.eq('meeting_id', meeting_id);

    // Execute the query
    const { data, error } = await query;

    // Handle database errors
    if (error) {
      console.error('[Meeting Meta-Data DB Get] Error fetching host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the successful data response
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    // Catch-all for unexpected server errors
    console.error('[Meeting Meta-Data DB Get] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST endpoint to create a new meeting metadata record
export async function POST(req: Request) {
  try {
    // Parse the JSON body from the request
    const body = await req.json();
    const { host_id, meeting_id, date_time } = body;

    // Validate that all required fields are present
    if (!host_id || !meeting_id || !date_time) {
      return NextResponse.json({ error: 'Missing host_id, meeting_id, or date_time' }, { status: 400 });
    }

    // Insert the new record into the host_meetings table
    const { data, error } = await supabase
      .from('host_meetings')
      .insert([{ host_id, meeting_id, date_time }]);

    // Handle database insertion errors
    if (error) {
      console.error('[Meeting Meta-Data DB Post] Error inserting host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return success response with the inserted data
    return NextResponse.json({ message: 'Success setup host meeting', data }, { status: 201 });
  } catch (err: any) {
    // Catch-all for unexpected server errors
    console.error('[Meeting Meta-Data DB Post] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE endpoint to remove a meeting metadata record
export async function DELETE(req: Request) {
  try {
    // Extract the meeting_id from the query parameters
    const { searchParams } = new URL(req.url);
    const meeting_id = searchParams.get('meeting_id');

    // Ensure a meeting_id is provided to avoid deleting unrelated records
    if (!meeting_id) {
      return NextResponse.json({ error: 'Missing meeting_id' }, { status: 400 });
    }

    // Delete the specific row corresponding to the meeting_id
    const { error } = await supabase
      .from('host_meetings')
      .delete()
      .eq('meeting_id', meeting_id);

    // Handle database deletion errors
    if (error) {
      console.error('[Meeting Meta-Data DB Delete] Error deleting host_meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return successful deletion message
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (err: any) {
    // Catch-all for unexpected server errors
    console.error('[Meeting Meta-Data DB Delete] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
