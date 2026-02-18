import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Key, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ApiKeyModal = () => {
    const { apiKey, setApiKey } = useStore();
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState('');

    // If we already have a key (and it's not the dummy placeholder from env if any), don't show.
    // We check length > 10 as a basic sanity check
    if (apiKey && apiKey.length > 20) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputKey.trim().startsWith('sk-or-')) {
            setError('Invalid Key format. Should start with "sk-or-"');
            return;
        }
        setApiKey(inputKey.trim());
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] max-w-lg w-full p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-brutal-yellow p-3 border-2 border-black shadow-brutal">
                            <Key size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-black uppercase">Access Required</h2>
                    </div>

                    <p className="font-mono text-sm mb-6 text-gray-700">
                        <strong>JustAsk</strong> requires an OpenRouter API key to power its AI mentorship features.
                        Your key is stored locally in your browser and never sent to our servers.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-black uppercase text-sm mb-2">OpenRouter API Key</label>
                            <input
                                type="password"
                                value={inputKey}
                                onChange={(e) => {
                                    setInputKey(e.target.value);
                                    setError('');
                                }}
                                placeholder="sk-or-v1-..."
                                className="w-full bg-gray-100 border-2 border-black p-4 font-mono text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all"
                            />
                            {error && (
                                <div className="flex items-center gap-2 text-brutal-red font-bold text-xs mt-2">
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={!inputKey}
                                className="flex-1 bg-black text-white py-4 border-2 border-transparent font-black uppercase tracking-wider hover:bg-brutal-green hover:text-black hover:border-black hover:shadow-brutal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Initialize System
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300 text-center">
                        <a
                            href="https://openrouter.ai/keys"
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs text-gray-500 hover:text-black underline"
                        >
                            Get a free key from OpenRouter.ai &rarr;
                        </a>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
