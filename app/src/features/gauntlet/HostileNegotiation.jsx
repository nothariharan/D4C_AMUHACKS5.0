import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, UserX, ThumbsDown, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export function HostileNegotiation({ gauntlet }) {
    const [patience, setPatience] = useState(gauntlet.initialState?.patience || 100);
    const [messages, setMessages] = useState([
        { sender: 'opponent', text: gauntlet.scenario || "I don't see why we should invest. You have no traction." }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { sender: 'user', text: input }]);
        setInput('');

        // Mock opponent reaction
        setTimeout(() => {
            const damage = Math.floor(Math.random() * 20);
            setPatience(p => Math.max(0, p - damage));
            setMessages(prev => [...prev, {
                sender: 'opponent',
                text: "That answer is vague. Give me numbers or get out."
            }]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* OPPONENT HEADER */}
            <div className="bg-brutal-blue text-white p-4 border-b-4 border-black flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-black p-2 border-2 border-white">
                        <UserX size={24} />
                    </div>
                    <div>
                        <h3 className="font-black uppercase leading-none">{gauntlet.initialState?.role || "ANTAGONIST"}</h3>
                        <p className="text-xs opacity-75 font-mono">MOOD: HOSTILE</p>
                    </div>
                </div>

                {/* PATIENCE METER */}
                <div className="w-1/3">
                    <div className="flex justify-between text-xs font-black uppercase mb-1">
                        <span>Patience</span>
                        <span>{patience}%</span>
                    </div>
                    <div className="h-4 w-full bg-black border-2 border-white relative">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${patience}%` }}
                            className={`h-full ${patience > 50 ? 'bg-brutal-green' : patience > 20 ? 'bg-brutal-yellow' : 'bg-brutal-red'}`}
                        />
                    </div>
                </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] font-bold text-sm
                                ${msg.sender === 'user'
                                    ? 'bg-white text-black rounded-tr-none'
                                    : 'bg-brutal-red text-white rounded-tl-none'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {patience === 0 && (
                    <div className="text-center font-black text-red-600 bg-red-100 p-4 border-2 border-red-600 uppercase">
                        NEGOTIATION FAILED. OPPONENT LEFT.
                    </div>
                )}
            </div>

            {/* INPUT */}
            <div className="p-4 bg-white border-t-4 border-black flex gap-2">
                <input
                    className="flex-1 border-4 border-black p-3 font-mono focus:outline-none focus:bg-gray-50"
                    placeholder="Type your rebuttal..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    disabled={patience === 0}
                />
                <button
                    onClick={sendMessage}
                    disabled={patience === 0}
                    className="bg-black text-white px-6 border-4 border-transparent hover:border-black hover:bg-white hover:text-black transition-all"
                >
                    <Send />
                </button>
            </div>
        </div>
    );
}
