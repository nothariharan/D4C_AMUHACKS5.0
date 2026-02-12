import { X, Flame, Trophy, Zap, Target, Edit3, LogOut } from 'lucide-react'
import { useStore } from '../../lib/store'
import { ContributionGrid } from '../auth/ContributionGrid'
import { auth } from '../../lib/firebase'
import { signOut } from 'firebase/auth'

export function ProfilePage({ onClose }) {
    const { user, sessions, activeSessionId, engagementMetrics, isLoggedIn } = useStore()
    const activeSession = sessions[activeSessionId]

    // Mock data if no user (or "TEST" user)
    const displayName = user?.displayName || "Guest User"
    const email = user?.email || "guest@justask.dev"
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()

    // Calculate Stats (Sync with global engagement metrics from Firestore)
    const currentStreak = engagementMetrics.currentStreak || 0
    const totalTasks = engagementMetrics.totalProjects || 0
    const totalSessions = Object.keys(sessions).length

    // Velocity: Mock calculation (Tasks / Weeks active)
    const daysActive = Math.ceil((Date.now() - engagementMetrics.sessionStartTime) / (1000 * 60 * 60 * 24)) || 1
    const velocity = (totalTasks / (daysActive / 7)).toFixed(1)

    // Primary Skill (Just use current role for now)
    const primarySkill = activeSession?.role || "Explorer"

    // Count Completed Goals (Must master the Final Gauntlet)
    const goalsAchieved = Object.values(sessions).filter(s =>
        s.roadmap?.nodes?.length > 0 &&
        s.roadmap.nodes.every(n => n.status === 'completed') &&
        s.gauntlet?.status === 'passed'
    ).length

    const handleLogout = async () => {
        try {
            await signOut(auth)
            onClose()
        } catch (error) {
            console.error("Logout Error:", error)
        }
    }

    return (
        <div className="fixed inset-0 z-[500] bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">

            {/* Trading Card Container */}
            <div className="w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] relative flex flex-col">

                {/* Header (Top of Card) */}
                <div className="bg-black text-white p-4 flex justify-between items-start border-b-4 border-black">
                    <div className="flex flex-col">
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
                            {displayName}
                        </h2>
                        <span className="font-mono text-sm text-brutal-yellow mt-1">
                            MEMBER SINCE {memberSince}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white text-black p-2 border-2 border-black hover:bg-brutal-red hover:text-white transition-colors"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8 flex flex-col gap-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox
                            icon={<Flame size={24} className="text-brutal-red" />}
                            label="Streak"
                            value={`${currentStreak} Days`}
                        />
                        <StatBox
                            icon={<Trophy size={24} className="text-brutal-yellow" />}
                            label="Total Wins"
                            value={totalTasks}
                        />
                        <StatBox
                            icon={<Zap size={24} className="text-brutal-blue" />}
                            label="Velocity"
                            value={`${velocity}/wk`}
                        />
                        <StatBox
                            icon={<Target size={24} className="text-green-500" />}
                            label="Focus"
                            value={primarySkill}
                            isSmall={true}
                        />
                    </div>

                    {/* Heatmap Section */}
                    <div className="border-3 border-black p-1">
                        <div className="bg-black text-white px-3 py-1 font-bold font-mono text-xs uppercase inline-block mb-3 transform -translate-y-4 ml-4">
                            Consistency Record
                        </div>
                        {/* We reuse ContributionGrid but might need to pass a 'yellowTheme' prop if we modify it, 
                or just rely on its current implementation if it's already yellow-ish. 
                The current implementation has mixed colors. Let's stick with it or modify it later if strictly yellow is needed.
                For now we just render it. 
            */}
                        <ContributionGrid heatmapData={engagementMetrics.heatmapData} />
                    </div>

                    {/* Goals Achieved Counter Section (Only for logged in users) */}
                    {isLoggedIn && (
                        <div className="flex items-center justify-between p-6 bg-brutal-white border-3 border-black shadow-brutal">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000]">
                                    <Trophy size={32} className="text-brutal-yellow" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-xs uppercase text-gray-400 font-bold line-through">Placeholder</span>
                                    <span className="text-2xl font-black uppercase tracking-tighter">Goals Achieved</span>
                                </div>
                            </div>
                            <div className="text-6xl font-black bg-black text-white px-6 py-2 shadow-[8px_8px_0px_0px_#FFD700]">
                                {goalsAchieved}
                            </div>
                        </div>
                    )}

                    {/* Account Details / Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mt-auto">
                        <div className="font-mono text-xs text-gray-500">
                            ID: {user?.uid || "GUEST_SESSION_ID"} <br />
                            EMAIL: {email}
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {!isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        const { openTrap } = useStore.getState()
                                        openTrap()
                                    }}
                                    className="w-full md:w-48 flex items-center justify-center gap-2 px-6 py-4 border-4 border-black bg-brutal-yellow hover:translate-y-0.5 hover:shadow-none transition-all font-black text-lg uppercase shadow-[4px_4px_0px_0px_#000]"
                                >
                                    <LogOut size={20} className="rotate-180" /> Login Now
                                </button>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-white hover:bg-brutal-red hover:text-white transition-colors font-bold text-sm uppercase"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            )}
                        </div>
                    </div>

                </div>

                {/* Decorative corner accent */}
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-black opacity-20 pointer-events-none" />
            </div>
        </div>
    )
}

function StatBox({ icon, label, value, isSmall }) {
    return (
        <div className="border-3 border-black p-3 bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex items-center justify-between mb-2">
                {icon}
            </div>
            <div className="font-mono text-xs text-gray-500 uppercase">{label}</div>
            <div className={`font-black uppercase leading-tight ${isSmall ? 'text-sm truncate' : 'text-2xl'}`}>
                {value}
            </div>
        </div>
    )
}
