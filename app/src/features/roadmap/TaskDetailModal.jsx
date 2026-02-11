import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, X, CheckSquare } from 'lucide-react'

export function TaskDetailModal({ task, onClose }) {
    if (!task) return null

    // Helper to handle legacy string tasks
    const title = typeof task === 'string' ? task : task.title
    const detail = typeof task === 'string' ? "No details available." : task.detail
    const link = typeof task === 'string' ? null : task.link

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 z-10"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-6">
                        <span className="font-mono text-xs font-bold bg-brutal-yellow px-2 py-1 border-2 border-black inline-block mb-2 transform -rotate-2 shadow-[2px_2px_0px_0px_#000]">
                            TASK DETAILS
                        </span>
                        <h2 className="text-3xl font-black uppercase leading-tight">{title}</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 border-l-4 border-black font-mono text-sm leading-relaxed">
                            {detail}
                        </div>

                        {link && (
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between w-full bg-brutal-blue text-white p-4 font-bold border-3 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
                            >
                                <span className="uppercase">Start Resource</span>
                                <ExternalLink size={20} className="group-hover:rotate-45 transition-transform" />
                            </a>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t-2 border-dashed border-gray-300">
                            <div className="relative">
                                <input type="checkbox" className="peer w-6 h-6 appearance-none border-3 border-black bg-white checked:bg-brutal-green transition-colors cursor-pointer" />
                                <CheckSquare className="absolute top-0 left-0 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" size={24} />
                            </div>
                            <span className="font-mono text-xs text-gray-500 uppercase font-bold">Mark as Completed</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
