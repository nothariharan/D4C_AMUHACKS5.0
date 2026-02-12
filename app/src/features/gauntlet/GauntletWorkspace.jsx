import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code, FileText, Play, Send, CheckCircle,
    XCircle, AlertTriangle, Lightbulb, Terminal,
    FileCode, Layout, Save, Clock
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../lib/store';

export function GauntletWorkspace() {
    const { activeSessionId, sessions, submitGauntlet, dismissGauntlet } = useStore();
    const session = sessions[activeSessionId];
    const gauntlet = session?.gauntlet;

    const [activeFile, setActiveFile] = useState('index.html');
    const [files, setFiles] = useState(gauntlet?.starterCode || {
        'index.html': '<!-- Build your project here -->\n<h1>Final Project</h1>',
        'styles.css': '/* Style your project here */\nbody { background: #f0f0f0; }',
        'app.js': '// Logic goes here\nconsole.log("Mission Start");'
    });

    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [reflection, setReflection] = useState('');

    if (!gauntlet) return null;

    const handleSubmit = async () => {
        setIsVerifying(true);
        const submission = gauntlet.type === 'technical'
            ? { code: files, type: 'technical' }
            : { reflection, type: 'physical' };

        const res = await submitGauntlet(activeSessionId, submission);
        setResult(res);
        setIsVerifying(false);
    };

    return (
        <div className="fixed inset-0 z-[600] bg-white flex flex-col font-mono">
            {/* TOP BAR */}
            <div className="h-16 bg-black text-white flex items-center justify-between px-6 border-b-4 border-black relative">
                <div className="flex items-center gap-4">
                    <div className="bg-brutal-red p-1 rotate-12">
                        <Terminal size={20} strokeWidth={3} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">
                        GAUNTLET_WORKSPACE // {gauntlet.title}
                    </h2>
                </div>

                {/* ESCAPE HATCH: Centered "NOT READY" Button */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <button
                        onClick={() => dismissGauntlet(activeSessionId)}
                        className="bg-brutal-red text-white px-8 py-3 border-4 border-black font-black uppercase text-xl hover:translate-y-1 hover:shadow-none transition-all shadow-[8px_8px_0px_0px_#000] flex items-center gap-3 group"
                    >
                        <XCircle size={24} className="group-hover:rotate-90 transition-transform" />
                        NOT READY YET
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 text-brutal-yellow">
                        <Clock size={18} />
                        <span className="font-black underline uppercase text-xs">TIMER: {gauntlet.timeLimit} REMAINING</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isVerifying}
                        className="bg-brutal-green text-black px-6 py-2 border-2 border-white font-black uppercase text-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                    >
                        {isVerifying ? <span className="animate-spin opacity-50">✦</span> : <Send size={16} strokeWidth={3} />}
                        SUBMIT_FOR_REVIEW
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR: Instructions & Progress */}
                <div className="w-80 border-r-4 border-black bg-gray-100 flex flex-col p-6 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">The Mission</h3>
                            <p className="text-sm font-bold uppercase leading-tight bg-white p-3 border-2 border-black rotate-1">
                                {gauntlet.brief}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Requirements</h3>
                            <div className="space-y-2">
                                {gauntlet.requirements.map((req, idx) => (
                                    <div key={idx} className="flex gap-2 text-xs font-bold items-start bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                                        <span className="text-brutal-red font-black">□</span>
                                        <span>{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-brutal-blue/10 p-4 border-2 border-brutal-blue text-xs mt-auto">
                            <div className="flex items-center gap-2 text-brutal-blue font-black uppercase mb-1">
                                <Lightbulb size={14} /> AI Hint Usage: 1/3
                            </div>
                            <p className="text-gray-600">Need a push? Use your hints wisely. Mastery is earned, not given.</p>
                        </div>
                    </div>
                </div>

                {/* MAIN AREA: IDE or Upload */}
                <div className="flex-1 flex flex-col bg-gray-50 relative">
                    {gauntlet.type === 'technical' ? (
                        <>
                            {/* File Tabs */}
                            <div className="flex bg-gray-200 border-b-4 border-black">
                                {Object.keys(files).map(fileName => (
                                    <button
                                        key={fileName}
                                        onClick={() => setActiveFile(fileName)}
                                        className={`px-6 py-3 border-r-2 border-black font-black text-xs uppercase transition-all
                                            ${activeFile === fileName ? 'bg-white translate-y-[2px]' : 'bg-transparent text-gray-500 hover:bg-white'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileCode size={14} /> {fileName}
                                        </div>
                                    </button>
                                ))}
                                <div className="ml-auto p-3 text-[10px] text-gray-400 italic">AUTO-SAVING TO CLOUD...</div>
                            </div>

                            {/* Editor */}
                            <div className="flex-1 border-b-4 border-black shadow-inner">
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    path={activeFile}
                                    defaultLanguage={activeFile.endsWith('.html') ? 'html' : activeFile.endsWith('.css') ? 'css' : 'javascript'}
                                    value={files[activeFile]}
                                    onChange={(val) => setFiles(prev => ({ ...prev, [activeFile]: val }))}
                                    options={{
                                        fontSize: 16,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        minimap: { enabled: false },
                                        padding: { top: 20 }
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 p-12 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-4xl font-black uppercase italic">Submit Your Proof</h2>
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="Detail your process, challenges, and breakthroughs..."
                                className="w-full h-64 p-6 border-4 border-black font-mono text-lg focus:bg-brutal-yellow/10 focus:outline-none shadow-[8px_8px_0px_0px_#000]"
                            />
                            <div className="p-8 border-4 border-black border-dashed bg-gray-100 text-center cursor-pointer hover:bg-white transition-all">
                                <Layout className="mx-auto mb-4 opacity-30" size={48} />
                                <p className="font-black uppercase tracking-widest">DRAG IMAGES / VIDEOS HERE</p>
                                <p className="text-xs text-gray-400 mt-2 italic">(Simulated for this implementation)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RESULTS OVERLAY */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className={`w-full max-w-xl p-10 border-8 border-black shadow-[16px_16px_0px_0px_#000] text-center
                                ${result.passed ? 'bg-white' : 'bg-brutal-red text-white'}
                            `}
                        >
                            <div className={`w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4 border-black bg-black text-white ${result.passed ? 'rotate-12' : 'animate-bounce'}`}>
                                {result.passed ? <Trophy size={48} strokeWidth={3} /> : <AlertTriangle size={48} strokeWidth={3} />}
                            </div>

                            <h3 className="text-5xl font-black uppercase mb-4 tracking-tighter italic">
                                {result.passed ? 'MASTERED' : 'RETRY REQUIRED'}
                            </h3>

                            <div className={`p-6 border-4 border-black mb-8 text-left ${result.passed ? 'bg-gray-50' : 'bg-black text-white'}`}>
                                <p className="font-bold text-lg mb-4 underline uppercase">AI Feedback Score: {result.score}/100</p>
                                <p className="font-mono text-sm italic">"{result.feedback}"</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                {result.passed ? (
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="w-full bg-brutal-green text-black border-4 border-black py-4 font-black text-2xl uppercase shadow-[8px_8px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                        CLAIM MY GLORY
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setResult(null)}
                                        className="w-full bg-brutal-yellow text-black border-4 border-black py-4 font-black text-2xl uppercase shadow-[8px_8px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                        I'LL DO BETTER
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
