import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Zap, Clock, ArrowRight } from 'lucide-react';
import { useStore } from '../../lib/store';

export function GauntletOverlay() {
    const { activeSessionId, sessions, generateGauntletChallenge, startGauntlet } = useStore();
    const session = sessions[activeSessionId];

    useEffect(() => {
        if (session && !session.gauntlet) {
            generateGauntletChallenge(activeSessionId);
        }
    }, [activeSessionId, session]);

    if (!session) return null;

    const stats = {
        tasks: (session.roadmap?.nodes || []).reduce((acc, node) =>
            acc + (node.subNodes || []).reduce((sacc, sub) => sacc + (sub.tasks?.length || 0), 0), 0),
        nodes: (session.roadmap?.nodes || []).length
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[500] bg-black flex items-center justify-center p-4 overflow-hidden"
        >
            {/* Ambient Background Noise/Particles could go here */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brutal-red/40 via-transparent to-transparent animate-pulse" />
            </div>

            <div className="relative w-full max-w-2xl bg-white border-8 border-black shadow-[20px_20px_0px_0px_#000] p-8 md:p-12 text-center overflow-y-auto max-h-screen">
                <AnimatePresence mode="wait">
                    {!session.gauntlet ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="space-y-8 py-12"
                        >
                            <div className="w-24 h-24 border-8 border-black border-t-brutal-red rounded-full animate-spin mx-auto" />
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic">Analyzing Mastery...</h2>
                            <p className="font-mono text-gray-500 uppercase">Collating {stats.tasks} completed tasks from {stats.nodes} specialized nodes.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-black text-white p-4 -rotate-1 inline-block mb-4">
                                <Target size={64} strokeWidth={3} className="text-brutal-red" />
                            </div>

                            <h1 className="text-6xl md:text-7xl font-black uppercase leading-none tracking-tighter mb-4">
                                ALMOST <br /> <span className="text-brutal-red">THERE...</span>
                            </h1>

                            <div className="space-y-4 font-mono text-lg text-left border-l-8 border-black pl-6 py-4 bg-gray-50 uppercase">
                                <p><span className="font-black text-brutal-blue">✓</span> You completed {stats.tasks} tasks.</p>
                                <p><span className="font-black text-brutal-purple">✓</span> You cleared {stats.nodes} major milestones.</p>
                                <p><span className="font-black text-brutal-green">✓</span> You've proven your commitment.</p>
                            </div>

                            <div className="bg-brutal-yellow/20 p-6 border-4 border-black relative">
                                <span className="absolute -top-4 left-6 bg-black text-white px-3 py-1 text-xs font-black uppercase italic">The Truth</span>
                                <p className="text-2xl font-black uppercase leading-tight">BUT KNOWLEDGE ISN'T MASTERY.</p>
                                <p className="font-mono text-sm mt-2 text-gray-600">You must survive the Final Gauntlet to lock in your achievement permanently.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 border-4 border-black bg-black text-white text-left -rotate-1 shadow-[8px_8px_0px_0px_#FF0000]">
                                    <h3 className="text-xs font-black uppercase text-brutal-red mb-2 tracking-widest">Incoming Mission:</h3>
                                    <h4 className="text-2xl font-black uppercase text-brutal-yellow">{session.gauntlet.title}</h4>
                                    <p className="font-mono text-sm opacity-80 mt-1">{session.gauntlet.brief}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => startGauntlet(activeSessionId)}
                                        className="bg-brutal-green text-black border-4 border-black px-8 py-5 font-black text-2xl uppercase shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3"
                                    >
                                        REVEAL MY GAUNTLET <ArrowRight strokeWidth={4} />
                                    </button>
                                    <button
                                        onClick={() => dismissGauntlet(activeSessionId)}
                                        className="bg-gray-100 text-gray-400 border-4 border-black px-8 py-5 font-black text-2xl uppercase hover:bg-white transition-all underline underline-offset-8 decoration-4 decoration-brutal-red"
                                    >
                                        NOT READY YET
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
