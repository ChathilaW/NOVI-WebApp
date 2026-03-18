"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

// Define the expected props for the SummaryBoard component
interface SummaryBoardProps {
    role: 'individual' | 'teacher';
}

// Define the shape of a single distraction record returned by the API
interface DistractionRecord {
    participant_name: string;
    distraction_percentage: number;
}

export default function SummaryBoard({ role }: SummaryBoardProps) {
    // Access the currently authenticated user from Clerk
    const { user } = useUser();
    
    // State to hold the list of distraction records from the API
    const [distractions, setDistractions] = useState<DistractionRecord[]>([]);
    
    // State to track if the API request is currently loading
    const [loading, setLoading] = useState(false);
    
    // State to hold the formatted date of the most recent session
    const [sessionDate, setSessionDate] = useState<string | null>(null);
    
    // State for the distraction filter threshold input (default '75')
    const [threshold, setThreshold] = useState<string>('75');
    
    // State to determine the sort order of the distraction list
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Effect hook to fetch data whenever role, threshold, or sortOrder changes
    useEffect(() => {
        // Only fetch if the user is a teacher and the user ID is available
        if (role === 'teacher' && user?.id) {
            const fetchDistractions = async () => {
                setLoading(true);
                try {
                    // Default to 75 if the user completely clears the input field
                    const currentThreshold = threshold === '' ? 75 : Number(threshold);
                    
                    // Fetch from the API, passing threshold, sort order, and the essential host_id for filtering
                    const res = await fetch(`/api/report/teacher/summary?threshold=${currentThreshold}&sort=${sortOrder}&host_id=${user.id}`);
                    const json = await res.json();
                    
                    // If the response is successful, update state with the retrieved data
                    if (json.ok) {
                        setDistractions(json.data.distractions || []);
                        
                        // Parse and format the returned session date if it exists
                        if (json.data.sessionDate) {
                            setSessionDate(new Date(json.data.sessionDate).toLocaleDateString());
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch distractions', err);
                } finally {
                    // Always disable the loading state when the fetch is complete
                    setLoading(false);
                }
            };
            fetchDistractions();
        }
    }, [role, threshold, sortOrder, user?.id]); // Safely include user?.id in dependencies

    return (
        <div className="flex flex-col flex-1 animate-fade-in">
            {/* Conditional rendering based on the user's role */}
            {role === 'individual' ? (
                <>
                    {/* UI for the Individual Role */}
                    <h2 className="text-2xl font-semibold mb-4 text-[#d89cf2]">Your Individual Summary</h2>
                    <p className="text-zinc-400 text-lg">A quick overview of your personal progress and key metrics.</p>
                    <div className="mt-8 space-y-4">
                        {/* Placeholder for future individual chart implementation */}
                        <div className="h-40 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">
                            Summary Chart Placeholder
                        </div>
                        {/* Placeholders for future individual metrics */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">Metric 1</div>
                             <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">Metric 2</div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* UI for the Teacher Role */}
                    <h2 className="text-2xl font-semibold mb-4 text-[#d89cf2]">Teacher Summary</h2>
                    <p className="text-zinc-400 text-lg">A quick overview of your classes' performance and aggregated metrics.</p>
                    <div className="mt-8 text-black text-base max-w-4xl">
                        
                        {/* Header displaying the date of the most recent mapped session */}
                        <div className="bg-[#dbdbdb] w-64 px-4 py-2 rounded-lg mb-6 flex gap-1">
                            <span>Date:</span>
                            {sessionDate && (
                                <span className="text-[#00518f] font-medium">
                                    {sessionDate}
                                </span>
                            )}
                        </div>

                        {/* Interactive UI controls for filtering and sorting the data */}
                        <div className="flex flex-col">
                            <div className="bg-[#dbdbdb] w-max px-4 py-2 rounded-t-lg flex items-center gap-4">
                                {/* Threshold Input filter control */}
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
                                {/* Sort Order Dropdown Select */}
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

                            {/* Main display area for distraction records */}
                            <div className="bg-[#dbdbdb] p-4 sm:p-6 rounded-b-lg rounded-tr-lg flex flex-col gap-4 min-h-[150px]">
                                {/* Loading state pulse indicator */}
                                {loading && <div className="text-zinc-600 animate-pulse">Loading data...</div>}
                                
                                {/* Empty state indicator when no records match filter criteria */}
                                {!loading && distractions.length === 0 && (
                                    <div className="text-zinc-600">
                                        {threshold === '' 
                                            ? "Please enter a percentage." 
                                            : `No distraction percentages > ${threshold}% recorded today.`}
                                    </div>
                                )}
                                
                                {/* Iterate and render each individual mapped distraction card */}
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
