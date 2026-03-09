import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/** GET /api/meeting/[id]/group-session → { distractedCount, totalCount, participants[] } */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Note: No stale time filter is used here as there is no last_seen / created_at column.
  const { data, error } = await supabase
    .from('group_session')
    .select('*')
    .eq('session_id', id)

  if (error) {
    console.error('[group_session GET]', error)
    return NextResponse.json({ distractedCount: 0, totalCount: 0, participants: [] })
  }

  let distractedCount = 0
  let totalCount = 0
  const participants = (data ?? []).map((row) => {
    const distractionPct =
      row.total_checks > 0
        ? Math.round((row.distracted_checks / row.total_checks) * 100)
        : 0

    if (row.status === 'FOCUSED' || row.status === 'DISTRACTED') {
      totalCount++
      if (row.status === 'DISTRACTED') distractedCount++
    }

    return {
      participantId: row.participant_id,
      name: row.participant_name,
      status: row.status,
      totalChecks: row.total_checks,
      distractedChecks: row.distracted_checks,
      distractionPct,
      peakDistractionPct: row.peak_distraction_pct,
      peakDistractionTime: row.peak_distraction_time
        ? new Date(row.peak_distraction_time).getTime()
        : 0,
    }
  })

  return NextResponse.json({ distractedCount, totalCount, participants })
}

/** POST /api/meeting/[id]/group-session — client sends full snapshot */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json() as {
    participantId: string
    name: string
    status?: string
    totalChecks: number
    distractedChecks: number
    peakDistractionPct: number
    peakDistractionTime: number
  }

  // Check if participant already exists without relying on composite primary keys for upsert
  const { data: existing, error: selectError } = await supabase
    .from('group_session')
    .select('session_id')
    .eq('session_id', id)
    .eq('participant_id', body.participantId)
    .maybeSingle()

  if (selectError) {
    console.error('[group_session POST select error]', selectError)
    return NextResponse.json({ ok: false, error: selectError.message }, { status: 500 })
  }

  const payload = {
    session_id: id,
    participant_id: body.participantId,
    participant_name: body.name,
    status: body.status,
    total_checks: body.totalChecks ?? 0,
    distracted_checks: body.distractedChecks ?? 0,
    peak_distraction_pct: body.peakDistractionPct ?? 0,
    peak_distraction_time: body.peakDistractionTime
      ? new Date(body.peakDistractionTime).toISOString()
      : null,
  }

  let dbError;

  if (existing) {
    const { error } = await supabase
      .from('group_session')
      .update(payload)
      .eq('session_id', id)
      .eq('participant_id', body.participantId)
    dbError = error
  } else {
    const { error } = await supabase
      .from('group_session')
      .insert(payload)
    dbError = error
  }

  if (dbError) {
    console.error('[group_session POST update/insert error]', dbError)
    return NextResponse.json({ ok: false, error: dbError.message }, { status: 500 })
  }
  
  return NextResponse.json({ ok: true })
}

/** DELETE /api/meeting/[id]/group-session?participantId=xxx */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const participantId = req.nextUrl.searchParams.get('participantId')

  if (participantId) {
    const { error } = await supabase
      .from('group_session')
      .delete()
      .eq('session_id', id)
      .eq('participant_id', participantId)

    if (error) console.error('[group_session DELETE]', error)
  }

  return NextResponse.json({ ok: true })
}
