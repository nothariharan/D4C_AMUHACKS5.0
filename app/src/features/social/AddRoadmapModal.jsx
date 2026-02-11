import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Share2 } from 'lucide-react'
import { useStore } from '../../lib/store'

export function AddRoadmapModal({ onClose, onSubmit }) {
    const { sessions } = useStore()
    const [selectedId, setSelectedId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // Filter sessions that have a generated roadmap
    const publishableSessions = Object.values(sessions).filter(s => s.roadmap && s.status !== 'archived')

    const handleSubmit = async () => {
        if (isLoading || !selectedId) return
        setIsLoading(true)
        try {
            await onSubmit(selectedId)
            onClose()
        } catch (err) {
            console.error("Publish Error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-lg p-8"
            >
                <div className="flex justify-between items-start mb-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-brutal-blue">Publish Drive</h2>
                    <button onClick={onClose} className="hover:bg-gray-100 p-1">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                <p className="font-mono text-xs text-gray-400 uppercase mb-6">Select a roadmap from your local drives to broadcast to the network:</p>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {publishableSessions.length > 0 ? (
                        publishableSessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => setSelectedId(session.id)}
                                className={`w-full text-left p-4 border-2 border-black transition-all flex flex-col gap-1 group ${selectedId === session.id ? 'bg-brutal-yellow shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000]'}`}
                            >
                                <span className="font-black uppercase text-lg leading-tight group-hover:text-brutal-blue">{session.role || session.goal}</span>
                                <span className="font-mono text-[10px] opacity-60 uppercase italic">
                                    {session.roadmap?.nodes?.length || 0} Milestones // Created {new Date(session.createdAt).toLocaleDateString()}
                                </span>
                            </button>
                        ))
                    ) : (
                        <div className="border-4 border-dashed border-black/10 p-10 text-center bg-gray-50">
                            <p className="font-mono text-sm text-gray-400 uppercase font-black">No active roadmaps found.<br />Back to mission control to start a new drive.</p>
                        </div>
                    )}
                </div>

                {publishableSessions.length > 0 && (
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedId}
                        className="w-full mt-8 py-4 bg-black text-white font-black uppercase text-xl italic hover:bg-brutal-blue disabled:opacity-30 disabled:hover:bg-black transition-all shadow-[8px_8px_0px_0px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 active:translate-y-1 active:shadow-none"
                    >
                        {isLoading ? <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin rounded-full" /> : <><Share2 size={24} strokeWidth={3} /> Publish to Exchange</>}
                    </button>
                )}
            </motion.div>
        </div>
    )
}
