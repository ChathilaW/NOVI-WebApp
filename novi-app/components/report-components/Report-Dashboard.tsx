import React from 'react'

interface ReportDashboardProps {
    role: 'individual' | 'teacher'
}

export default function ReportDashboard({ role }: ReportDashboardProps) {
    return (
        <div className="absolute inset-0 top-[112px] flex flex-col gap-5 text-white animate-fade-in px-6 sm:px-14 pb-8 pt-20 bg-[#1A1A1A]">
            <h1 className="text-3xl font-bold capitalize">{role} Dashboard</h1>
            <div className="flex flex-col flex-1">
                {role === 'individual' ? (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-4 text-[#d89cf2]">Your Individual Reports</h2>
                        <p className="text-zinc-400 text-lg">Here you can view your personal performance and metrics.</p>
                        {/* Placeholder content */}
                        <div className="mt-8 space-y-4">
                            <div className="h-40 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800" />
                            <div className="h-40 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800" />
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-semibold mb-4 text-[#d89cf2]">Teacher Overview</h2>
                        <p className="text-zinc-400 text-lg">Here you can view the performance reports of your students and classes.</p>
                        {/* Placeholder content */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-32 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800" />
                            <div className="h-32 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800" />
                            <div className="col-span-1 md:col-span-2 h-64 bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-800" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
