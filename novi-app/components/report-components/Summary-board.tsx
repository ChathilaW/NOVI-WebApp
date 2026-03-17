"use client";
import React, { useState, useEffect } from 'react';

interface SummaryBoardProps {
    role: 'individual' | 'teacher';
}

interface DistractionRecord {
    participant_name: string;
    distraction_percentage: number;
}

export default function SummaryBoard({ role }: SummaryBoardProps) {
    const [distractions, setDistractions] = useState<DistractionRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionDate, setSessionDate] = useState<string | null>(null);
    const [threshold, setThreshold] = useState<string>('75');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    useEffect(() => {
        if (role === 'teacher') {
            const fetchDistractions = async () => {
                setLoading(true);
                try {
                    // Default to 75 if the user completely clears the input
                    const currentThreshold = threshold === '' ? 75 : Number(threshold);
                    const res = await fetch(`/api/report/teacher/summary?threshold=${currentThreshold}&sort=${sortOrder}`);
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
    }, [role, threshold, sortOrder]);
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
                            <div className="bg-[#dbdbdb] w-max px-4 py-2 rounded-t-lg flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span>Distraction percentage: &gt;</span>
                                    <input 
                                        type="number" 
                                        value={threshold}
                                        onChange={(e) => setThreshold(e.target.value)}
                                        className="w-16 h-7 px-2 rounded-md border border-zinc-400 focus:outline-[#d89cf2] bg-white text-black text-center"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Sort:</span>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                        className="h-7 px-2 rounded-md border border-zinc-400 focus:outline-[#d89cf2] bg-white text-black text-sm"
                                    >
                                        <option value="desc">Highest First</option>
                                        <option value="asc">Lowest First</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-[#dbdbdb] p-4 sm:p-6 rounded-b-lg rounded-tr-lg flex flex-col gap-4 min-h-[150px]">
                                {loading && <div className="text-zinc-600 animate-pulse">Loading data...</div>}
                                {!loading && distractions.length === 0 && (
                                    <div className="text-zinc-600">
                                        {threshold === '' 
                                            ? "Please enter a percentage." 
                                            : `No distraction percentages > ${threshold}% recorded today.`}
                                    </div>
                                )}
                                {!loading && distractions.map((d, i) => (
                                    <div key={i} className="bg-[#f58ffc] p-4 rounded-lg">
                                        <div>Name: {d.participant_name}</div>
                                        <div>Distraction percentage: {Math.round(d.distraction_percentage)}%</div>
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
