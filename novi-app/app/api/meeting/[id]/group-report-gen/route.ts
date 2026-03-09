import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

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
      console.error('[Excel Gen] Error fetching group session data:', error);
      return NextResponse.json({ ok: false, error: 'Failed to fetch data' }, { status: 500 });
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({ ok: false, message: 'No data found for this session' });
    }

    // Headers
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
      
      // Format time to be more readable
      const peakTimeFormatted = p.peak_distraction_time 
        ? new Date(p.peak_distraction_time).toLocaleTimeString() 
        : 'N/A';

      return [
        p.participant_name || 'Unknown',
        Math.round(focusPct).toString() + '%',
        Math.round(distractionPct).toString() + '%',
        Math.round(p.peak_distraction_pct || 0).toString() + '%',
        peakTimeFormatted
      ];
    });

    // Create Worksheet from Array of Arrays
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Attempt to make headers bold
    // Note: The community version of 'xlsx' strips style objects by default on write,
    // but building the style object anyway in case it's processed properly.
    for (let c = 0; c < headers.length; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: c });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true }
      };
    }
    
    // Auto-size columns slightly for better readability
    ws['!cols'] = [
      { wch: 25 }, // Participant Name
      { wch: 15 }, // Focus Pct
      { wch: 20 }, // Distraction Pct
      { wch: 25 }, // Peak Distraction Pct
      { wch: 25 }, // Peak Distraction Time
    ];

    // Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate Excel File Buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Define File Name
    const fileName = `group_report-MeetingID-${sessionId}.xlsx`;

    // Upload to Supabase Storage Bucket named "generated_reports"
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated_reports') // Make sure your bucket is exactly named "generated_reports"
      .upload(fileName, excelBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true // Overwrite if a file with the same name already exists
      });

    if (uploadError) {
      console.error('[Excel Gen] Error uploading to Supabase:', uploadError);
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${uploadError.message}` }, 
        { status: 500 }
      );
    }

    console.log(`[Excel Gen] Successfully uploaded report to Supabase: ${fileName}`);

    return NextResponse.json({ 
      ok: true, 
      message: 'Excel report generated and securely saved to Supabase',
      file: fileName
    });

  } catch (err: any) {
    console.error('[Excel Gen] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
