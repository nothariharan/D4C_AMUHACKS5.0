import { motion, AnimatePresence } from 'framer-motion'
import { X, Unlock, Zap, Share2, Target, CheckCircle2, ChevronDown, ChevronRight, ListChecks } from 'lucide-react'
import { useState } from 'react'

export function BlueprintPreviewModal({ blueprint, onClose, onSteal }) {
    const [choice, setChoice] = useState(null) // 'personalize' | 'asis'
    const [expandedNodes, setExpandedNodes] = useState({})
    const [expandedSubNodes, setExpandedSubNodes] = useState({})

    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }))
    }

    const toggleSubNode = (subNodeId) => {
        setExpandedSubNodes(prev => ({ ...prev, [subNodeId]: !prev[subNodeId] }))
    }

    if (!blueprint) return null

    const handleStealClick = () => {
        if (!choice) return
        onSteal(choice === 'personalize')
    }

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-brutal-blue text-white p-6 border-b-4 border-black flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase opacity-80">
                            <Target size={14} /> Blueprint Preview
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                            {blueprint.role || blueprint.goal}
                        </h2>
                        <p className="mt-2 text-sm font-bold uppercase opacity-90">
                            AUTHOR: {blueprint.authorName || 'Unknown Agent'}
                        </p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 transition-colors">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Stats bar */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="brutal-border p-4 bg-gray-50 flex items-center gap-3">
                            <Unlock size={24} className="text-gray-400" />
                            <div>
                                <div className="text-[10px] font-mono uppercase text-gray-400">Milestones</div>
                                <div className="text-xl font-black">{blueprint.roadmap?.nodes?.length || 0}</div>
                            </div>
                        </div>
                        <div className="brutal-border p-4 bg-gray-50 flex items-center gap-3">
                            <Zap size={24} className="text-gray-400" />
                            <div>
                                <div className="text-[10px] font-mono uppercase text-gray-400">Level</div>
                                <div className="text-xl font-black">{blueprint.difficulty || 'Expert'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Node List */}
                    <div>
                        <h3 className="font-black uppercase mb-4 text-gray-400 font-mono text-xs tracking-widest">[ CORE_PHASES ]</h3>
                        <div className="space-y-4">
                            {blueprint.roadmap?.nodes?.map((node, i) => (
                                <div key={node.id} className="border-2 border-black bg-gray-50 overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                                    <button
                                        onClick={() => toggleNode(node.id)}
                                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-brutal-yellow transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold uppercase text-lg leading-none">{node.title}</div>
                                            <div className="text-[10px] font-mono opacity-50 mt-1 uppercase">
                                                {node.subNodes?.length || 0} Sub-sectors • {node.subNodes?.reduce((acc, sub) => acc + (sub.tasks?.length || 0), 0) || 0} Quests
                                            </div>
                                        </div>
                                        {expandedNodes[node.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </button>

                                    <AnimatePresence>
                                        {expandedNodes[node.id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t-2 border-black bg-white"
                                            >
                                                {node.subNodes?.map(sub => (
                                                    <div key={sub.id} className="border-b last:border-b-0 border-black/10">
                                                        <button
                                                            onClick={() => toggleSubNode(sub.id)}
                                                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 bg-brutal-blue border border-black rotate-45" />
                                                                <span className="font-bold uppercase text-sm">{sub.title}</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono opacity-40 uppercase">{sub.tasks?.length || 0} Quests</span>
                                                        </button>

                                                        <AnimatePresence>
                                                            {expandedSubNodes[sub.id] && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="bg-gray-50 border-t border-black/5 px-4 pb-4 pt-2"
                                                                >
                                                                    <div className="space-y-2">
                                                                        {sub.tasks?.map((task, idx) => {
                                                                            const taskTitle = typeof task === 'string' ? task : task.title;
                                                                            return (
                                                                                <div key={idx} className="flex gap-2 items-start text-xs font-mono opacity-70 border-l-2 border-black/20 pl-3 py-1">
                                                                                    <span className="text-brutal-blue font-black">{idx + 1}.</span>
                                                                                    <span className="uppercase">{taskTitle}</span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decision Zone */}
                    <div className="bg-black text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_#3b82f6]">
                        <h3 className="text-xl font-black uppercase mb-4 italic flex items-center gap-2">
                            <Share2 size={24} /> Steal This Document?
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setChoice('personalize')}
                                className={`p-4 border-2 text-left transition-all ${choice === 'personalize' ? 'bg-brutal-blue border-white ring-2 ring-white ring-offset-2 ring-offset-black' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                            >
                                <div className="font-black uppercase text-sm mb-1 italic flex items-center gap-2 text-white">
                                    Personalize
                                    {choice === 'personalize' && <CheckCircle2 size={16} />}
                                </div>
                                <p className="text-[10px] font-mono opacity-60 text-white">Adapt to my current skills & gaps (AI Assessment phase)</p>
                            </button>

                            <button
                                onClick={() => setChoice('asis')}
                                className={`p-4 border-2 text-left transition-all ${choice === 'asis' ? 'bg-brutal-red border-white ring-2 ring-white ring-offset-2 ring-offset-black' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                            >
                                <div className="font-black uppercase text-sm mb-1 italic flex items-center gap-2 text-white">
                                    Copy As-Is
                                    {choice === 'asis' && <CheckCircle2 size={16} />}
                                </div>
                                <p className="text-[10px] font-mono opacity-60 text-white">Full copy of author's original path (Skip assessment)</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t-4 border-black bg-gray-50 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 font-black uppercase border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!choice}
                        onClick={handleStealClick}
                        className={`flex-[2] py-4 font-black uppercase italic text-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3
                            ${!choice ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-brutal-yellow text-black hover:bg-black hover:text-white'}
                        `}
                    >
                        <Share2 size={24} strokeWidth={3} />
                        Steal Document
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
