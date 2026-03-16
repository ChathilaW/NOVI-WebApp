import React from 'react';

interface SummaryBoardProps {
    role: 'individual' | 'teacher';
}

export default function SummaryBoard({ role }: SummaryBoardProps) {
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
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-32 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">Class Average</div>
                        <div className="h-32 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">Top Performers</div>
                        <div className="h-32 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">Needs Attention</div>
                        <div className="col-span-1 md:col-span-3 h-64 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center justify-center text-zinc-500">
                            Overall Class Progress Chart
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
