import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Skull, ShieldAlert } from 'lucide-react';

export function CrisisTerminal({ gauntlet }) {
    const [history, setHistory] = useState([
        { type: 'system', content: 'ESTABLISHING SECURE CONNECTION...' },
        { type: 'system', content: 'CRISIS PROTOCOL INITIATED.' },
        { type: 'ai', content: gauntlet.scenario || "SYSTEM ALERT: Financial runway critical. Operational failure imminent." }
    ]);
    const [input, setInput] = useState('');
    const [turn, setTurn] = useState(1);
    const maxTurns = gauntlet.initialState?.turns || 3;
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleSend = () => {
        if (!input.trim()) return;

        const newHistory = [...history, { type: 'user', content: input }];
        setHistory(newHistory);
        setInput('');

        // Simulate AI Response (Mock for UI Demo)
        setTimeout(() => {
            let aiResponse = "DECISION CALCULATED. CONSEQUENCE: UNCERTAIN.";
            if (turn < maxTurns) {
                aiResponse = `TURN ${turn} RESULT: Stock dropped 5%. Investors panic. What is your mitigation strategy?`;
                setTurn(t => t + 1);
            } else {
                aiResponse = "SIMULATION COMPLETE. DATA READY FOR UPLOAD.";
            }

            setHistory(prev => [...prev, { type: 'ai', content: aiResponse }]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full bg-black text-green-500 font-mono p-4">
            {/* TERMINAL SCREEN */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 border-2 border-green-800 bg-black shadow-[inset_0_0_20px_rgba(0,255,0,0.1)] relative" ref={scrollRef}>
                {/* CRT Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,0,0.1)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />

                {history.map((msg, idx) => (
                    <div key={idx} className={`relative z-10 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block px-3 py-1 ${msg.type === 'system' ? 'text-red-500 font-bold' :
                            msg.type === 'user' ? 'text-white border border-green-500' : 'text-green-500'
                            }`}>
                            {msg.type === 'system' && '> SYSTEM: '}
                            {msg.type === 'ai' && '> CORE: '}
                            {msg.content}
                        </span>
                    </div>
                ))}
            </div>

            {/* INPUT AREA */}
            <div className="mt-4 flex gap-2">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">{'>'}</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="w-full bg-black border-2 border-green-700 text-green-500 p-3 pl-8 focus:outline-none focus:border-green-400 uppercase shadow-[0_0_10px_rgba(0,255,0,0.3)]"
                        placeholder="ENTER COMMAND..."
                        autoFocus
                    />
                </div>
                <button
                    onClick={handleSend}
                    className="bg-green-700 text-black px-6 font-black uppercase hover:bg-green-500 transition-colors"
                >
                    <Send size={20} />
                </button>
            </div>

            {/* HUD */}
            <div className="mt-2 flex justify-between text-xs text-green-800 uppercase font-black">
                <span>TURN: {turn}/{maxTurns}</span>
                <span>STATUS: CRITICAL</span>
                <span>ID: {gauntlet.initialState?.currency || 'ERR'}</span>
            </div>
        </div>
    );
}
