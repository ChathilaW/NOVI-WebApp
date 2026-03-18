import React from 'react';
import { Download } from 'lucide-react';

interface ReportsBoardProps {
    role: 'individual' | 'teacher';
}

export default function ReportsBoard({ role }: ReportsBoardProps) {
    return (
        <div className="flex flex-col flex-1 animate-fade-in">
            {role === 'individual' && (
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
            )}

            {role === 'teacher' && (
                <>
                    <h3 className="text-2xl font-bold mb-8 text-[#ee6df6]">Meeting Reports</h3>
                    
                    <div className="space-y-4 mt-4">
                        {/* Render 3 placeholder cards matching the design */}
                        {[1, 2, 3].map((item) => (
                            <div 
                                key={item} 
                                className="bg-[#ee6df6] rounded-xl p-5 flex flex-col gap-4 w-full max-w-4xl shadow-sm border border-transparent hover:border-[#4299e1] transition-colors"
                            >
                                {/* Meeting ID */}
                                <div className="bg-white rounded-lg px-4 py-2 w-full max-w-md shadow-sm">
                                    <span className="text-[#ee6df6] font-bold text-lg">Meeting ID:</span>
                                </div>
                                
                                <div className="flex justify-between items-end gap-4">
                                    {/* Date and Time flex container */}
                                    <div className="flex gap-4 flex-wrap">
                                        <div className="bg-white rounded-lg px-4 py-2 min-w-[160px] shadow-sm">
                                            <span className="text-[#ee6df6] font-bold text-lg">Date:</span>
                                        </div>
                                        <div className="bg-white rounded-lg px-4 py-2 min-w-[160px] shadow-sm">
                                            <span className="text-[#ee6df6] font-bold text-lg">Time:</span>
                                        </div>
                                    </div>
                                    
                                    {/* Download button */}
                                    <button 
                                        className="bg-white rounded-xl p-3 hover:bg-zinc-100 transition-transform hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
                                        title="Download Report"
                                    >
                                        <Download className="w-6 h-6 text-[#ee6df6] stroke-[3]" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
