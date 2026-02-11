import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../lib/store'
import { X, BookOpen, Code, Link as LinkIcon, CheckCircle, Trophy } from 'lucide-react'

export function TaskThreadView({ task, onClose, onComplete }) {
    const { submitEvidence, completeTask } = useStore()
    const [activeTab, setActiveTab] = useState('breakdown')
    const [evidenceLink, setEvidenceLink] = useState('')
    const [evidenceNotes, setEvidenceNotes] = useState('')

    const handleSaveEvidence = () => {
        if (!evidenceLink && !evidenceNotes) return

        // Ensure we have parent IDs (passed from MetroMap)
        if (task.nodeId && task.subNodeId && task.taskIndex !== undefined) {
            submitEvidence(task.nodeId, task.subNodeId, task.taskIndex, {
                type: 'link',
                content: evidenceLink,
                notes: evidenceNotes
            })
            setEvidenceLink('')
            setEvidenceNotes('')
            // Ideally show a toast or success message here
        }
    }

    if (!task) return null

    // Mock data fallback if AI hasn't generated these fields yet
    const breakdown = task.breakdown || "This concept is fundamental to mastering the topic. It involves understanding the core principles and how they interact with other components in the system. By mastering this, you unlock the ability to build more complex applications."
    const practice = task.practice || {
        question: "Explain this concept in your own words.",
        hint: "Think about the 'why' behind it."
    }
    const resources = task.resources || [
        { title: "Official Documentation", url: task.link || "#" },
        { title: "Deep Dive Article", url: "#" }
    ]

    const tabs = [
        { id: 'breakdown', label: 'Concept', icon: BookOpen },
        { id: 'practice', label: 'Practice', icon: Code },
        { id: 'resources', label: 'Resources', icon: LinkIcon },
        { id: 'evidence', label: 'Evidence', icon: Trophy },
    ]

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl h-[80vh] bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] z-10 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start p-6 border-b-4 border-black bg-gray-50">
                        <div>
                            <h2 className="font-black text-3xl uppercase leading-none mb-2">{task.title}</h2>
                            <p className="font-mono text-gray-500 text-sm">{task.detail}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-full"
                        >
                            <X size={24} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Content Layout */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Tabs */}
                        <div className="w-20 md:w-64 border-r-4 border-black bg-gray-100 flex flex-col">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`p-4 flex items-center gap-3 font-bold border-b-2 border-black transition-all
                                            ${isActive ? 'bg-brutal-yellow text-black translate-x-1' : 'bg-transparent text-gray-500 hover:bg-white'}
                                        `}
                                    >
                                        <Icon size={24} strokeWidth={2.5} />
                                        <span className="hidden md:inline uppercase">{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white relative">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    {activeTab === 'breakdown' && (
                                        <div className="prose prose-lg max-w-none font-mono">
                                            <h3 className="uppercase font-black border-b-4 border-brutal-blue inline-block mb-4">The Breakdown</h3>
                                            <p className="text-lg leading-relaxed">{breakdown}</p>
                                        </div>
                                    )}

                                    {activeTab === 'practice' && (
                                        <div className="space-y-6">
                                            <h3 className="uppercase font-black border-b-4 border-brutal-red inline-block mb-4">Put it to work</h3>
                                            <div className="p-6 border-3 border-black bg-gray-50 shadow-brutal">
                                                <p className="font-bold text-xl mb-4">{practice.question}</p>
                                                <div className="w-full h-32 border-2 border-gray-300 bg-white p-4 font-mono text-sm text-gray-400">
                                                    // Type your valid solution or notes here...
                                                </div>
                                            </div>
                                            <div className="bg-brutal-yellow/20 p-4 border-l-4 border-brutal-yellow">
                                                <span className="font-bold uppercase text-sm">Hint:</span> {practice.hint}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'resources' && (
                                        <div className="space-y-4">
                                            <h3 className="uppercase font-black border-b-4 border-brutal-purple inline-block mb-4">Deep Dive Links</h3>
                                            {resources.map((res, idx) => (
                                                <a
                                                    key={idx}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 border-3 border-black hover:bg-black hover:text-white transition-all group shadow-sm hover:shadow-brutal"
                                                >
                                                    <span className="font-bold">{res.title}</span>
                                                    <LinkIcon size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'evidence' && (
                                        <div className="space-y-6">
                                            <h3 className="uppercase font-black border-b-4 border-brutal-green inline-block mb-4">Proof of Work</h3>

                                            <div className="p-6 border-3 border-black bg-gray-50 shadow-brutal space-y-4">
                                                <div>
                                                    <label className="font-bold text-sm uppercase block mb-1">Project / Repo Link</label>
                                                    <input
                                                        type="text"
                                                        value={evidenceLink}
                                                        onChange={(e) => setEvidenceLink(e.target.value)}
                                                        placeholder="https://github.com/..."
                                                        className="w-full p-2 border-2 border-black font-mono text-sm focus:bg-brutal-yellow focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-bold text-sm uppercase block mb-1">Reflection / Notes</label>
                                                    <textarea
                                                        value={evidenceNotes}
                                                        onChange={(e) => setEvidenceNotes(e.target.value)}
                                                        placeholder="What did you learn?"
                                                        className="w-full p-2 border-2 border-black font-mono text-sm focus:bg-brutal-yellow focus:outline-none h-24"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSaveEvidence}
                                                    className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-brutal-green hover:text-black border-2 border-transparent hover:border-black transition-colors w-full"
                                                >
                                                    Save Evidence
                                                </button>
                                            </div>

                                            {/* History List */}
                                            {task.evidence && task.evidence.length > 0 && (
                                                <div className="space-y-2 mt-8">
                                                    <h4 className="font-bold text-sm uppercase text-gray-500">History</h4>
                                                    {task.evidence.map((item, idx) => (
                                                        <div key={idx} className="border-2 border-black p-3 bg-white flex flex-col gap-1">
                                                            <div className="flex justify-between items-start">
                                                                <a href={item.content} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline truncate mr-2">
                                                                    {item.content || 'Note'}
                                                                </a>
                                                                <span className="font-mono text-xs text-gray-400">
                                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            {item.notes && (
                                                                <p className="font-mono text-sm text-gray-700 bg-gray-100 p-2 mt-1">
                                                                    {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t-4 border-black bg-white flex justify-end">
                        <button
                            onClick={() => {
                                if (task.completed) {
                                    onComplete(); // Just close if already done
                                    return;
                                }
                                if (task.nodeId && task.subNodeId && task.taskIndex !== undefined) {
                                    completeTask(task.nodeId, task.subNodeId, task.taskIndex);
                                    onComplete();
                                }
                            }}
                            disabled={task.completed}
                            className={`px-8 py-3 border-3 border-black font-black uppercase text-lg shadow-brutal transition-all flex items-center gap-2
                                ${task.completed
                                    ? 'bg-gray-200 text-gray-500 cursor-default shadow-none translate-y-1'
                                    : 'bg-brutal-green text-black hover:translate-y-1 hover:shadow-none'
                                }
                            `}
                        >
                            <CheckCircle size={24} /> {task.completed ? 'Completed' : 'Mark Complete'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
