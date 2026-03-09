import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

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

    // Define File Path (Project Root / generated_reports)
    const fileName = `meeting_report_${sessionId}.csv`;
    const reportsDir = path.join(process.cwd(), 'generated_reports');
    const filePath = path.join(reportsDir, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    console.log(`[CSV Gen] Successfully generated report: ${filePath}`);

    return NextResponse.json({ 
      ok: true, 
      message: 'Report generated successfully',
      file: fileName
    });

  } catch (err: any) {
    console.error('[CSV Gen] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
