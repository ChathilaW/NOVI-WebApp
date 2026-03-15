"use client"

import { useState } from 'react'
import { User } from 'lucide-react'
import ReportDashboard from '@/components/report-components/Report-Dashboard'

const ReportsPage = () => {
    const [selectedRole, setSelectedRole] = useState<'individual' | 'teacher' | null>(null)

    if (selectedRole) {
        return (
            <section className="flex w-full flex-1 flex-col gap-6 pt-10 text-white animate-fade-in px-4 md:px-8 pb-8">
                <div className="flex justify-start z-10 relative">
                    <button 
                        onClick={() => setSelectedRole(null)}
                        className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800"
                    >
                        &larr; Back to Role Selection
                    </button>
                </div>
                <ReportDashboard role={selectedRole} />
            </section>
        )
    }

    return (
        <section className="flex size-full flex-col items-center justify-center gap-10 pt-20 px-4 text-white animate-fade-in relative">
            <div className="relative bg-[#1a1a1b] w-full max-w-sm rounded-[24px] p-8 flex flex-col items-center shadow-2xl border border-zinc-800/50 mt-10">
                {/* Avatar overlapping the top edge */}
                <div className="absolute -top-[45px] w-[90px] h-[90px] bg-black rounded-full flex items-center justify-center" style={{ boxShadow: '0 0 0 10px transparent' }}>
                    <div className="w-[85px] h-[85px] rounded-full flex items-center justify-center border-[3px] border-white/20 relative overflow-hidden">
                        <User className="text-white w-10 h-10 mb-[-15px]" strokeWidth={2.5} />
                    </div>
                </div>
                
                <h2 className="text-[17px] font-semibold text-center mt-12 mb-8 leading-relaxed tracking-wide text-zinc-100">
                    are you trying to access<br />
                    the report ? Tell us who<br />
                    you are.
                </h2>

                <div className="flex flex-col w-full gap-4 px-2">
                    <button 
                        onClick={() => setSelectedRole('teacher')}
                        className="w-full py-2.5 rounded-full bg-[#682075] hover:bg-[#7d278c] transition-colors text-white font-medium shadow-md tracking-wide"
                    >
                        Teacher
                    </button>
                    <button 
                        onClick={() => setSelectedRole('individual')}
                        className="w-full py-2.5 rounded-full bg-[#682075] hover:bg-[#7d278c] transition-colors text-white font-medium shadow-md tracking-wide"
                    >
                        Individual
                    </button>
                </div>
            </div>
        </section>
    )
}

export default ReportsPage