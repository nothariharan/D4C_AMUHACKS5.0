import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
        >
            <div className="relative">
                {/* Brutal Shadow Background */}
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" />

                {/* Main Loading Box */}
                <motion.div
                    initial={{ scale: 0.9, y: 0 }}
                    animate={{ scale: 1, y: [0, -10, 0] }}
                    transition={{
                        scale: { duration: 0.3 },
                        y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="relative bg-white border-4 border-black p-12 flex flex-col items-center gap-6"
                >
                    <div className="bg-brutal-yellow border-4 border-black px-6 py-2">
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                            Just Ask.
                        </h1>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        backgroundColor: ["#fff", "#FFD700", "#fff"],
                                        height: [16, 32, 16]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                    className="w-4 border-2 border-black"
                                />
                            ))}
                        </div>
                        <p className="font-mono text-sm font-bold uppercase tracking-widest mt-2 animate-pulse">
                            Syncing Reality...
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Status Branding */}
            <div className="absolute bottom-12 left-0 right-0 text-center">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                    Version 4.0 // Neural Lattice Initializing
                </span>
            </div>
        </motion.div>
    );
};
