import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../../lib/firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { useStore } from '../../lib/store'
import { Odometer } from './Odometer'
import { Share2, Lock, Unlock, Zap, Ghost, Plus, Eye, Target, Share, RefreshCw, AlertTriangle, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react'
import { BlueprintPreviewModal } from './BlueprintPreviewModal'
import { AddRoadmapModal } from './AddRoadmapModal'
import { PersonalizationChoiceModal } from './PersonalizationChoiceModal'
import { Search, SlidersHorizontal, ArrowUpAz, Clock, GitFork } from 'lucide-react'

export function BlueprintExchange() {
    const [blueprints, setBlueprints] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user, subscribeToExchange, voteBlueprint, publishBlueprint, stealBlueprint, unpublishBlueprint } = useStore()
    const [selectedBlueprint, setSelectedBlueprint] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [choiceBlueprint, setChoiceBlueprint] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('newest') // newest, top, forked

    useEffect(() => {
        // Use real-time subscription
        const unsubscribe = subscribeToExchange((data) => {
            setBlueprints(data)
            setLoading(false)
        })
        return () => unsubscribe && unsubscribe()
    }, [subscribeToExchange])

    const filteredBlueprints = blueprints
        .filter(bp => {
            const query = searchQuery.toLowerCase()
            return (bp.role || bp.goal || '').toLowerCase().includes(query) ||
                (bp.authorName || '').toLowerCase().includes(query)
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.publishedAt) - new Date(a.publishedAt)
            if (sortBy === 'top') return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0))
            if (sortBy === 'forked') return (b.stealCount || 0) - (a.stealCount || 0)
            return 0
        })

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
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-white border-4 border-black px-6 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 group"
                        >
                            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                            Add Roadmap
                        </button>
                    </div>
                    <div className={`p-4 font-mono text-xs border-2 text-right transition-colors ${blueprints.length > 0 ? 'bg-black text-[#0f0] border-[#0f0]/30' : 'bg-brutal-red text-white border-black shadow-[4px_4px_0px_0px_#000]'}`}>
                        NET_CONNECT: ESTABLISHED <br />
                        DRIVES_READY: {blueprints.length} {error ? '[ERROR_DETECTED]' : ''}
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="mb-10 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={20} />
                    <input
                        type="text"
                        placeholder="SEARCH ROADMAPS, ROLES, OR CREATORS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border-4 border-black p-4 pl-12 font-black uppercase text-sm focus:outline-none focus:bg-brutal-yellow/10 transition-colors shadow-[4px_4px_0px_0px_#000]"
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { id: 'newest', icon: Clock, label: 'NEW' },
                        { id: 'top', icon: ThumbsUp, label: 'TOP' },
                        { id: 'forked', icon: GitFork, label: 'POPS' }
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setSortBy(btn.id)}
                            className={`px-4 py-2 border-4 border-black font-black uppercase text-xs flex items-center gap-2 transition-all shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1
                                ${sortBy === btn.id ? 'bg-brutal-yellow' : 'bg-white hover:bg-gray-100'}
                            `}
                        >
                            <btn.icon size={14} strokeWidth={3} />
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredBlueprints.map((bp) => (
                    <BlueprintCard
                        key={bp.id}
                        blueprint={bp}
                        userId={user?.uid}
                        onClick={() => setSelectedBlueprint(bp)}
                        onVote={async (id, type) => {
                            await voteBlueprint(id, type)
                            // Real-time onSnapshot handles the refresh automatically!
                        }}
                        onDelete={async (id) => {
                            if (window.confirm("Remove this roadmap from the global exchange? It won't affect your personal library.")) {
                                await unpublishBlueprint(id)
                            }
                        }}
                    />
                ))}
            </div>

            <AnimatePresence>
                {selectedBlueprint && (
                    <BlueprintPreviewModal
                        blueprint={selectedBlueprint}
                        onClose={() => setSelectedBlueprint(null)}
                        onSteal={() => {
                            setChoiceBlueprint(selectedBlueprint)
                            setSelectedBlueprint(null)
                        }}
                    />
                )}

                {showAddModal && (
                    <AddRoadmapModal
                        onClose={() => setShowAddModal(false)}
                        onSubmit={async (sessionId) => {
                            await publishBlueprint(sessionId, true)
                            alert("Roadmap Broadcasted Successfully! 🚀")
                        }}
                    />
                )}

                {choiceBlueprint && (
                    <PersonalizationChoiceModal
                        blueprint={choiceBlueprint}
                        onClose={() => setChoiceBlueprint(null)}
                        onChoice={async (personalize) => {
                            await stealBlueprint(choiceBlueprint, personalize)
                            setChoiceBlueprint(null)
                        }}
                    />
                )}
            </AnimatePresence>

            {error && (
                <div className="mb-8 p-4 bg-brutal-red border-4 border-black text-white font-mono text-sm flex items-center gap-3 shadow-[8px_8px_0px_0px_#000]">
                    <AlertTriangle size={24} />
                    <div>
                        <div className="font-black uppercase italic">Critical Interface Conflict:</div>
                        <div>{error}</div>
                    </div>
                </div>
            )}

            {blueprints.length === 0 && !loading && !error && (
                <div className="border-4 border-dashed border-black/20 p-20 text-center">
                    <Ghost size={48} className="mx-auto opacity-20 mb-4" />
                    <p className="font-black opacity-30 uppercase italic mb-2">The cloud is empty. Be the first to publish.</p>
                    <p className="font-mono text-[10px] opacity-40 uppercase">If you just published, try the refresh pulse on the right.</p>
                </div>
            )}
        </div>
    )
}

function BlueprintCard({ blueprint, userId, onClick, onVote, onDelete }) {
    const userVote = blueprint.votes?.[userId];
    const isOwner = blueprint.authorId === userId;

    return (
        <motion.div
            whileHover={{ scale: 1.01, translateY: -5 }}
            onClick={onClick}
            className="group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 flex flex-col h-full hover:shadow-[12px_12px_0px_0px_#000] cursor-pointer transition-all"
        >
            {/* Delete Option for Owner */}
            {isOwner && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(blueprint.id);
                    }}
                    className="absolute -top-3 -right-3 z-30 bg-brutal-red text-white p-2 border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 font-black uppercase text-[10px]"
                >
                    <Trash2 size={12} strokeWidth={4} />
                    UNPUBLISH
                </button>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <div className="bg-black text-white px-3 py-1 text-xs font-black uppercase italic w-fit">
                        By {blueprint.authorName || 'Shadow Dev'}
                    </div>
                    {blueprint.provenance?.isForked && (
                        <div className="flex items-center gap-1 mt-1 font-mono text-[9px] font-black uppercase opacity-60">
                            <GitFork size={10} /> Forked from {blueprint.provenance.originalAuthorName}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Odometer value={blueprint.stealCount || 0} />
                    <div className="flex items-center gap-1 border-l-2 border-black pl-3 ml-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVote(blueprint.id, 'up');
                            }}
                            className={`p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:shadow-none active:translate-y-0.5 transition-all
                                ${userVote === 'up' ? 'bg-brutal-green' : 'bg-white hover:bg-gray-100'}
                            `}
                        >
                            <ThumbsUp size={14} strokeWidth={3} />
                        </button>
                        <span className="font-mono text-xs font-black min-w-[1ch] text-center">
                            {(blueprint.upvotes || 0) - (blueprint.downvotes || 0)}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVote(blueprint.id, 'down');
                            }}
                            className={`p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:shadow-none active:translate-y-0.5 transition-all
                                ${userVote === 'down' ? 'bg-brutal-red text-white' : 'bg-white hover:bg-gray-100'}
                            `}
                        >
                            <ThumbsDown size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
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
            </div>

            <div className="mt-auto space-y-4 pt-4 border-t-2 border-black border-dashed opacity-60">
                <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1"><Unlock size={12} /> {blueprint.roadmap?.nodes?.length || 0} Milestones</span>
                    <span className="flex items-center gap-1"><Zap size={12} /> {blueprint.difficulty || 'Expert'}</span>
                </div>
            </div>
        </motion.div>
    )
}
