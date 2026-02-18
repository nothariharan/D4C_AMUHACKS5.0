import React, { useState } from 'react';
import { PenTool, Highlighter, Type, AlertOctagon } from 'lucide-react';

export function RedPenTeardown({ gauntlet }) {
    const badContent = gauntlet.initialState?.content || "Lorum Ipsum dolor sit amet. Buy our product because it is good. We have features... (This is a placeholder for bad content)";
    const [corrections, setCorrections] = useState([]);
    const [selection, setSelection] = useState('');

    const handleSelect = () => {
        const sel = window.getSelection().toString();
        if (sel) {
            setSelection(sel);
        }
    };

    const addCorrection = (note) => {
        if (!selection) return;
        setCorrections([...corrections, { text: selection, note }]);
        setSelection('');
    };

    return (
        <div className="h-full bg-gray-100 flex overflow-hidden">
            {/* DOCUMENT AREA */}
            <div className="flex-1 p-12 overflow-y-auto">
                <div className="bg-white min-h-[800px] shadow-2xl p-16 relative font-serif text-xl leading-relaxed text-gray-800 border border-gray-200" onMouseUp={handleSelect}>
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-500/50" />
                    <h1 className="text-4xl font-bold mb-8 text-black">Draft_v1.pdf</h1>

                    <p className="whitespace-pre-wrap selection:bg-red-200 selection:text-red-900 border-l-4 border-gray-300 pl-6">
                        {badContent}
                    </p>

                    {/* OVERLAYS FOR CORRECTIONS - Simple visual stacking */}
                    {corrections.map((c, i) => (
                        <div key={i} className="absolute right-0 w-64 bg-yellow-100 p-4 border-2 border-red-500 shadow-md rotate-1 z-10" style={{ top: `${200 + i * 120}px`, right: '-20px' }}>
                            <div className="text-xs font-bold text-red-600 uppercase mb-1">Fix #{i + 1}</div>
                            <div className="italic mb-2 opacity-50 text-sm truncate">"{c.text}"</div>
                            <div className="font-handwriting text-red-700 text-lg font-bold">{c.note}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* TOOLS PANEL */}
            <div className="w-80 bg-gray-900 text-white p-6 border-l-4 border-black flex flex-col">
                <h3 className="font-black uppercase tracking-widest mb-6 text-gray-400 border-b border-gray-700 pb-2">Red Pen Tools</h3>

                <div className="space-y-6">
                    <div className={`p-4 border-2 border-white/20 bg-black/50 transition-opacity ${selection ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="text-xs font-bold uppercase mb-2 text-yellow-400">Selected Text:</div>
                        <div className="font-mono text-sm line-clamp-2 mb-4 italic text-gray-300">"{selection}"</div>

                        <div className="space-y-2">
                            <button onClick={() => addCorrection("Too Vague")} className="w-full bg-red-600 hover:bg-red-500 p-3 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors">
                                <AlertOctagon size={14} /> Mark as Vague
                            </button>
                            <button onClick={() => addCorrection("Grammar Error")} className="w-full bg-blue-600 hover:bg-blue-500 p-3 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors">
                                <Type size={14} /> Grammar Fix
                            </button>
                            <button onClick={() => addCorrection("Needs Data")} className="w-full bg-green-600 hover:bg-green-500 p-3 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors">
                                <Highlighter size={14} /> Cite Source
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-auto border-t border-gray-700 pt-6">
                    <div className="text-xs font-bold uppercase mb-2 text-gray-500">Detected Flaws</div>
                    <div className="text-6xl font-black text-red-500">{corrections.length}<span className="text-2xl text-gray-600">/3</span></div>
                </div>
            </div>
        </div>
    );
}
