import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Video, Code } from 'lucide-react'

export function NodeDetailModal({ node, onClose }) {
    if (!node) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, rotate: -2 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0.9, rotate: 2 }}
                    className="bg-white w-full max-w-lg border-3 border-black shadow-[8px_8px_0px_0px_#000] p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-6">
                        <span className={`
              inline-block px-3 py-1 font-mono font-bold text-sm border-2 border-black mb-2
              ${node.status === 'completed' ? 'bg-brutal-blue text-white' : ''}
              ${node.status === 'active' ? 'bg-brutal-yellow' : ''}
              ${node.status === 'locked' ? 'bg-gray-200 text-gray-500' : ''}
            `}>
                            {node.status.toUpperCase()}
                        </span>
                        <h2 className="text-4xl font-black uppercase leading-none">{node.title}</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 border-2 border-black">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <BookOpen size={20} />
                                WHY THIS MATTERS
                            </h3>
                            <p className="font-mono text-sm">
                                This skill is a fundamental building block. Without it, advanced concepts will be confusing.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center gap-2 p-3 border-2 border-black hover:bg-brutal-red hover:text-white transition-colors group">
                                <Video size={20} className="group-hover:animate-bounce" />
                                <span className="font-bold">Watch Tutorial</span>
                            </button>
                            <button className="flex items-center gap-2 p-3 border-2 border-black hover:bg-brutal-blue hover:text-white transition-colors group">
                                <Code size={20} className="group-hover:rotate-90 transition-transform" />
                                <span className="font-bold">Practice</span>
                            </button>
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
