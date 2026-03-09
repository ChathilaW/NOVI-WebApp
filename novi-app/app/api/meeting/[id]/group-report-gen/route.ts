import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Fetch all group session data for this meeting
    const { data: participants, error } = await supabase
      .from('group_session')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      console.error('[CSV Gen] Error fetching group session data:', error);
      return NextResponse.json({ ok: false, error: 'Failed to fetch data' }, { status: 500 });
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({ ok: false, message: 'No data found for this session' });
    }

    // CSV Headers
    const headers = [
      'Participant Name',
      'Focus Pct',
      'Distraction Pct',
      'Peak Distraction Pct',
      'Peak Distraction Time'
    ];

    // Format Data Rows
    const rows = participants.map((p) => {
      const total = p.total_checks || 0;
      const distracted = p.distracted_checks || 0;
      
      const distractionPct = total > 0 ? (distracted / total) * 100 : 0;
      const focusPct = total > 0 ? 100 - distractionPct : 100;
      
      // Format time to be more readable (optional, currently using ISO string if present)
      const peakTimeFormatted = p.peak_distraction_time 
        ? new Date(p.peak_distraction_time).toLocaleTimeString() 
        : 'N/A';

      return [
        `"${p.participant_name || 'Unknown'}"`,
        Math.round(focusPct).toString() + '%',
        Math.round(distractionPct).toString() + '%',
        Math.round(p.peak_distraction_pct || 0).toString() + '%',
        `"${peakTimeFormatted}"`
      ].join(',');
    });

    // Combine Headers and Rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Define File Name
    const fileName = `group_report-MeetingID-${sessionId}.csv`;

    // Upload to Supabase Storage Bucket named "generated_reports"
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated_reports') // Make sure your bucket is exactly named "generated_reports"
      .upload(fileName, csvContent, {
        contentType: 'text/csv',
        upsert: true // Overwrite if a file with the same name already exists
      });

    if (uploadError) {
      console.error('[CSV Gen] Error uploading to Supabase:', uploadError);
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${uploadError.message}` }, 
        { status: 500 }
      );
    }

    console.log(`[CSV Gen] Successfully uploaded report to Supabase: ${fileName}`);

    return NextResponse.json({ 
      ok: true, 
      message: 'Report generated and securely saved to Supabase',
      file: fileName
    });

  } catch (err: any) {
    console.error('[CSV Gen] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
