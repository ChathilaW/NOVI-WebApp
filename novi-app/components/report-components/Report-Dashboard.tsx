'use client'

import React, { useState } from 'react'
import SummaryBoard from './Summary-board'
import ReportsBoard from './Reports-board'

interface ReportDashboardProps {
    role: 'individual' | 'teacher'
    onBack: () => void
}

export default function ReportDashboard({ role, onBack }: ReportDashboardProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'reports'>('summary')

    return (
        <div className="absolute inset-0 top-[112px] flex text-white animate-fade-in bg-[#1A1A1A]">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-zinc-800 flex flex-col p-6 pt-20 justify-between">
                <div>
                    <button 
                        onClick={onBack}
                        className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 bg-zinc-900 px-4 py-3 rounded-lg border border-zinc-800 mb-8 hover:bg-zinc-800 w-full"
                    >
                        &larr; Back to Role Selection
                    </button>
                    
                    <h2 className="text-xl font-bold mb-4 text-zinc-200">Navigation</h2>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                                activeTab === 'summary' 
                                ? 'bg-zinc-800 text-[#d89cf2] font-semibold' 
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                            }`}
                        >
                            Summary
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                                activeTab === 'reports' 
                                ? 'bg-zinc-800 text-[#d89cf2] font-semibold' 
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                            }`}
                        >
                            Reports
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-5 px-6 sm:px-14 pb-8 pt-20 overflow-y-auto">
                <h1 className="text-3xl font-bold capitalize">{role} Dashboard</h1>
                <div className="flex flex-col flex-1">
                    {activeTab === 'summary' && <SummaryBoard role={role} />}
                    {activeTab === 'reports' && <ReportsBoard role={role} />}
                </div>
            </div>
        </div>
    )
}
