import { motion } from 'framer-motion'
import { CheckCircle2, X, Zap, Target } from 'lucide-react'

export function PersonalizationChoiceModal({ blueprint, onClose, onChoice }) {
    if (!blueprint) return null

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] w-full max-w-md p-6"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Personalize Drive?</h2>
                        <p className="font-mono text-[10px] opacity-60 uppercase mt-1">Select Adaptation Protocol for {blueprint.role || blueprint.goal}</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-gray-100 p-1">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => onChoice(true)}
                        className="w-full p-4 border-2 border-black bg-brutal-blue text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all text-left group"
                    >
                        <div className="font-black uppercase text-sm mb-1 italic flex items-center gap-2">
                            <Zap size={16} /> Personalize (AI Tailoring)
                        </div>
                        <p className="text-[10px] font-mono opacity-80">Analyze your current skills and gaps via assessment. The roadmap will be adapted to fit you.</p>
                    </button>

                    <button
                        onClick={() => onChoice(false)}
                        className="w-full p-4 border-2 border-black bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all text-left group"
                    >
                        <div className="font-black uppercase text-sm mb-1 italic flex items-center gap-2">
                            <Target size={16} /> Copy As-Is
                        </div>
                        <p className="text-[10px] font-mono opacity-60">Instantly clone the author's original path. Best if you want to follow exactly what they did.</p>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-2 font-black uppercase text-xs border-2 border-black hover:bg-gray-100 transition-colors"
                >
                    Cancel
                </button>
            </motion.div>
        </div>
    )
}
