import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Package, Terminal, ExternalLink } from 'lucide-react';
import { useStore } from '../../lib/store';

export function TheManifest({ onClose }) {
    const { manifestData } = useStore();

    if (!manifestData) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[600] bg-white/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="w-full max-w-3xl bg-white border-4 border-black shadow-[16px_16px_0px_0px_#000] p-8 font-mono relative">

                {/* Header Section */}
                <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
                    <div>
                        <div className="bg-black text-white px-2 py-1 text-xs font-bold inline-block mb-2">
                            SYSTEM_LOG // MANIFEST_V1.0
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter">
                            SUBJECT: {manifestData.subject}
                        </h2>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="bg-brutal-yellow px-2 font-bold">STREAK: {manifestData.status.streak}</span>
                            <span className="bg-black text-white px-2 font-bold">VERIFIED: {manifestData.status.total}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="border-3 border-black p-2 hover:bg-brutal-red hover:text-white transition-all">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Cargo Section (Career Highlights) */}
                <div className="space-y-8">
                    {manifestData.cargo.map((item, idx) => (
                        <div key={idx} className="border-3 border-black p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Package size={20} strokeWidth={3} />
                                <h3 className="text-xl font-black uppercase bg-black text-white px-3 py-1">
                                    CARGO: {item.role}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold underline mb-2 tracking-widest uppercase text-xs text-gray-500">Proofs of Competency</h4>
                                    <ul className="list-none space-y-1">
                                        {item.highlights.map((h, i) => (
                                            <li key={i} className="flex gap-2 text-sm">
                                                <span className="text-brutal-green font-bold">{" >> "}</span> {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {item.verifiedLinks && item.verifiedLinks.length > 0 && (
                                    <div>
                                        <h4 className="font-bold underline mb-2 tracking-widest uppercase text-xs text-gray-500">Evidence Vault Links</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {item.verifiedLinks.map((link, i) => (
                                                <a
                                                    key={i}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border-2 border-black text-xs font-bold hover:bg-brutal-yellow transition-all"
                                                >
                                                    <ExternalLink size={12} /> {link.title} (VERIFIED)
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Logs Section */}
                <div className="mt-12 bg-gray-50 border-3 border-black p-4">
                    <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                        <Terminal size={18} strokeWidth={3} />
                        <span className="font-black text-xs uppercase tracking-widest">Verification Logs</span>
                    </div>
                    <div className="space-y-1">
                        {manifestData.logs.map((log, i) => (
                            <div key={i} className="text-[11px] leading-tight text-gray-600">
                                <span className="text-black font-bold mr-2">[{log.split(':')[0]}]</span>
                                {log.split(':')[1]}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-8 flex justify-between items-end">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-brutal-green mb-1">
                            <ShieldCheck size={16} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase">Authentication: JUSTASK_PROTOCOL_VERIFIED</span>
                        </div>
                        <div className="text-[9px] text-gray-400">TIMESTAMP: {new Date().toISOString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-black text-xs border-t-2 border-black pt-1 px-4 italic">JustAsk. Compiler // No Fluff Core</div>
                    </div>
                </div>

                {/* Print/Share Button (Decorative for now) */}
                <button className="absolute -bottom-6 -right-6 bg-brutal-green text-black px-6 py-3 border-4 border-black font-black uppercase shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    Share Manifest
                </button>
            </div>
        </motion.div>
    );
}
