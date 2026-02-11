import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../lib/firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { useStore } from '../../lib/store'
import { Odometer } from './Odometer'
import { Share2, Lock, Unlock, Zap, Ghost } from 'lucide-react'

export function BlueprintExchange() {
    const [blueprints, setBlueprints] = useState([])
    const [loading, setLoading] = useState(true)
    const { stealBlueprint } = useStore()

    useEffect(() => {
        const fetchBlueprints = async () => {
            try {
                const q = query(
                    collection(db, "public_blueprints"),
                    orderBy("publishedAt", "desc"),
                    limit(20)
                )
                const snap = await getDocs(q)
                const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setBlueprints(data)
            } catch (err) {
                console.error("Fetch Blueprints Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchBlueprints()
    }, [])

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-black border-t-brutal-yellow animate-spin" />
                <p className="mt-4 font-black uppercase italic">Scanning Network...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div>
                    <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
                        Roadmap <span className="bg-brutal-yellow text-black px-2">Exchange</span>
                    </h2>
                    <p className="font-mono text-sm mt-4 opacity-70">
                        [ AUTH_MODE: SOCIAL_FORKING ] <br />
                        SHARE YOUR PATH. STEAL THEIR KNOWLEDGE.
                    </p>
                </div>
                <div className="bg-black text-[#0f0] p-4 font-mono text-xs border-2 border-[#0f0]/30">
                    NET_CONNECT: ESTABLISHED <br />
                    DRIVES_READY: {blueprints.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blueprints.map((bp) => (
                    <BlueprintCard key={bp.id} blueprint={bp} onSteal={() => stealBlueprint(bp)} />
                ))}
            </div>

            {blueprints.length === 0 && (
                <div className="border-4 border-dashed border-black/20 p-20 text-center">
                    <Ghost size={48} className="mx-auto opacity-20 mb-4" />
                    <p className="font-black opacity-30 uppercase">The cloud is empty. Be the first to publish.</p>
                </div>
            )}
        </div>
    )
}

function BlueprintCard({ blueprint, onSteal }) {
    const [isStealing, setIsStealing] = useState(false)

    const handleSteal = async () => {
        setIsStealing(true)
        try {
            await onSteal()
        } finally {
            setIsStealing(false)
        }
    }

    return (
        <motion.div
            whileHover={{ scale: 1.01, translateY: -5 }}
            className="group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 flex flex-col h-full hover:shadow-[12px_12px_0px_0px_#000] transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="bg-black text-white px-3 py-1 text-xs font-black uppercase italic">
                    By {blueprint.authorName || 'Shadow Dev'}
                </div>
                <Odometer value={blueprint.stealCount || 0} />
            </div>

            <h3 className="text-2xl font-black uppercase leading-tight mb-2 group-hover:text-brutal-blue transition-colors">
                {blueprint.role || blueprint.goal}
            </h3>

            <div className="flex flex-wrap gap-2 mb-6">
                {blueprint.roadmap?.nodes?.slice(0, 3).map(n => (
                    <span key={n.id} className="font-mono text-[10px] bg-gray-100 border-2 border-black px-1.5 py-0.5 font-bold uppercase">
                        {n.title}
                    </span>
                ))}
                {blueprint.roadmap?.nodes?.length > 3 && (
                    <span className="font-mono text-[10px] bg-gray-100 border-2 border-dashed border-black px-1.5 py-0.5 font-bold">
                        +{blueprint.roadmap.nodes.length - 3} MORE
                    </span>
                )}
            </div>

            <div className="mt-auto space-y-4">
                <div className="flex items-center gap-4 text-xs font-mono opacity-60">
                    <span className="flex items-center gap-1"><Unlock size={12} /> {blueprint.roadmap?.nodes?.length || 0} Milestones</span>
                    <span className="flex items-center gap-1"><Zap size={12} /> {blueprint.difficulty || 'Expert'}</span>
                </div>

                <button
                    onClick={handleSteal}
                    disabled={isStealing}
                    className={`
                        w-full py-4 font-black uppercase text-xl italic border-4 border-black 
                        shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 
                        transition-all flex items-center justify-center gap-3
                        ${isStealing ? 'bg-gray-200 cursor-not-allowed' : 'bg-brutal-red text-white hover:bg-black'}
                    `}
                >
                    {isStealing ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                    ) : (
                        <>
                            <Share2 size={24} strokeWidth={3} />
                            Steal Document
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    )
}
