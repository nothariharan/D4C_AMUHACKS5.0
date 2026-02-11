import { motion, AnimatePresence } from 'framer-motion'

export function Odometer({ value }) {
    const digits = String(value).padStart(3, '0').split('')

    return (
        <div className="flex bg-black p-1 border-2 border-white/20 shadow-inner">
            {digits.map((digit, i) => (
                <div key={i} className="relative w-6 h-8 bg-[#111] overflow-hidden border-x border-white/5 flex flex-col items-center">
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={digit}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="text-xl font-bold font-mono text-brutal-yellow absolute inset-0 flex items-center justify-center"
                        >
                            {digit}
                        </motion.span>
                    </AnimatePresence>
                </div>
            ))}
        </div>
    )
}
