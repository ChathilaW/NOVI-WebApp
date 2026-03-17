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
                    <div className="mt-8 text-black text-base max-w-4xl">
                        <div className="bg-[#dbdbdb] w-64 px-4 py-2 rounded-lg mb-6">
                            Date:
                        </div>

                        <div className="flex flex-col">
                            <div className="bg-[#dbdbdb] w-max px-4 py-2 rounded-t-lg">
                                Peak distractions:
                            </div>
                            <div className="bg-[#dbdbdb] p-4 sm:p-6 rounded-b-lg rounded-tr-lg flex flex-col gap-4">
                                <div className="bg-[#f58ffc] p-4 rounded-lg">
                                    <div>Name:</div>
                                    <div>Peak distraction pct:</div>
                                    <div>Time:</div>
                                </div>
                                <div className="bg-[#f58ffc] p-4 rounded-lg">
                                    <div>Name:</div>
                                    <div>Peak distraction pct:</div>
                                    <div>Time:</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
