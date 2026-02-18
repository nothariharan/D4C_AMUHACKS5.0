import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainConcept } from '../../lib/gemini';
import { useStore } from '../../lib/store';
import ReactMarkdown from 'react-markdown';

import { createPortal } from 'react-dom';

export default function AIExplainPanel({ task, onClose, isOpen, goal }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useStore();

    // Initialize conversation
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: `I can help you understand **${task.title}**. \n\nThis is a key step towards your goal of becoming a **${goal}**. What would you like to know?`,
                timestamp: new Date()
            }]);
        }
    }, [isOpen, task, goal]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Pass history to AI
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            history.push({ role: 'user', content: text });

            const aiResponseText = await explainConcept(task, history, goal);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: aiResponseText,
                timestamp: new Date()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting. Please try again.",
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Explain this simply",
        "Show me a code example",
        "Why is this important?",
        "Give me a practice problem"
    ];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white border-l-4 border-black shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-[9999] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-brutal-yellow border-b-4 border-black p-4 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest">AI Mentor</div>
                            <h2 className="text-xl font-bold truncate w-64">{task.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-black bg-white font-bold">
                            CLOSE [X]
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'assistant' ? 'bg-white' : 'bg-blue-100'}`}>
                                    <div className="flex items-center gap-2 mb-2 border-b-2 border-black/10 pb-1">
                                        <span className="text-xs font-bold uppercase">{msg.role === 'assistant' ? 'Mentor' : 'You'}</span>
                                    </div>
                                    <div className="prose prose-sm prose-p:leading-snug">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <span className="animate-pulse font-bold">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length < 3 && (
                        <div className="p-2 bg-gray-100 border-t-4 border-black flex flex-wrap gap-2 justify-center">
                            {suggestions.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleSend(s)}
                                    className="text-xs font-bold px-3 py-1 bg-white border-2 border-black hover:bg-brutal-yellow hover:translate-y-[-1px] transition-all"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-t-4 border-black">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask a question..."
                                className="flex-1 p-3 border-2 border-black font-mono text-sm focus:outline-none focus:bg-yellow-50"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim()}
                                className="bg-black text-white px-6 font-bold uppercase hover:bg-gray-800 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
