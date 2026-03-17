"use client";
import React, { useState, useEffect } from 'react';

interface SummaryBoardProps {
    role: 'individual' | 'teacher';
}

interface DistractionRecord {
    participant_name: string;
    peak_distraction_pct: number;
    peak_distraction_time: string;
}

export default function SummaryBoard({ role }: SummaryBoardProps) {
    const [distractions, setDistractions] = useState<DistractionRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionDate, setSessionDate] = useState<string | null>(null);

    useEffect(() => {
        if (role === 'teacher') {
            const fetchDistractions = async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/report/teacher/summary');
                    const json = await res.json();
                    if (json.ok) {
                        setDistractions(json.data.distractions || []);
                        if (json.data.sessionDate) {
                            setSessionDate(new Date(json.data.sessionDate).toLocaleDateString());
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch distractions', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDistractions();
        }
    }, [role]);
    return (
        <div className="flex flex-col flex-1 animate-fade-in">
            {role === 'individual' ? (
                <>
                    <h2 className="text-2xl font-semibold mb-4 text-[#d89cf2]">Your Individual Summary</h2>
                    <p className="text-zinc-400 text-lg">A quick overview of your personal progress and key metrics.</p>
                    <div className="mt-8 space-y-4">
                        <div className="h-40 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">
                            Summary Chart Placeholder
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">Metric 1</div>
                             <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">Metric 2</div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-semibold mb-4 text-[#d89cf2]">Teacher Summary</h2>
                    <p className="text-zinc-400 text-lg">A quick overview of your classes' performance and aggregated metrics.</p>
                    <div className="mt-8 text-black text-base max-w-4xl">
                        <div className="bg-[#dbdbdb] w-64 px-4 py-2 rounded-lg mb-6 flex gap-1">
                            <span>Date:</span>
                            {sessionDate && (
                                <span className="text-[#00518f] font-medium">
                                    {sessionDate}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <div className="bg-[#dbdbdb] w-max px-4 py-2 rounded-t-lg">
                                Peak distractions:
                            </div>
                            <div className="bg-[#dbdbdb] p-4 sm:p-6 rounded-b-lg rounded-tr-lg flex flex-col gap-4 min-h-[150px]">
                                {loading && <div className="text-zinc-600 animate-pulse">Loading data...</div>}
                                {!loading && distractions.length === 0 && (
                                    <div className="text-zinc-600">No high peak distractions recorded today.</div>
                                )}
                                {!loading && distractions.map((d, i) => (
                                    <div key={i} className="bg-[#f58ffc] p-4 rounded-lg">
                                        <div>Name: {d.participant_name}</div>
                                        <div>Peak distraction pct: {Math.round(d.peak_distraction_pct)}%</div>
                                        <div>Time: {new Date(d.peak_distraction_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
