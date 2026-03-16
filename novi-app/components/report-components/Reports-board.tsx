import React from 'react';

interface ReportsBoardProps {
    role: 'individual' | 'teacher';
}

export default function ReportsBoard({ role }: ReportsBoardProps) {
    return (
        <div className="flex flex-col flex-1 animate-fade-in">
            {role === 'individual' ? (
                <>
                    <h2 className="text-2xl font-semibold mb-4 text-[#d89cf2]">Detailed Reports</h2>
                    <p className="text-zinc-400 text-lg">In-depth breakdown of your past assignments and scores.</p>
                    <div className="mt-8 space-y-4">
                        <div className="h-20 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center px-6 text-zinc-500">
                            Assignment 1 Details
                        </div>
                        <div className="h-20 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center px-6 text-zinc-500">
                            Assignment 2 Details
                        </div>
                        <div className="h-20 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center px-6 text-zinc-500">
                            Assignment 3 Details
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-semibold mb-4 text-[#d89cf2]">Student Reports</h2>
                    <p className="text-zinc-400 text-lg">Detailed performance reports for individual students across assignments.</p>
                    <div className="mt-8 space-y-4">
                        <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center px-6 text-zinc-500">
                            Student A Report Card
                        </div>
                        <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center px-6 text-zinc-500">
                            Student B Report Card
                        </div>
                        <div className="h-24 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800 flex items-center px-6 text-zinc-500">
                            Student C Report Card
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
