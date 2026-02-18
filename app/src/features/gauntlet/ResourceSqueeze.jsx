import React, { useState } from 'react';
import { DollarSign, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

export function ResourceSqueeze({ gauntlet }) {
    const budget = gauntlet.initialState?.budget || 5000;
    const sliders = gauntlet.initialState?.sliders || [
        { label: 'Marketing (Ads)', cost: 1 },
        { label: 'Development', cost: 1 },
        { label: 'Design Polish', cost: 1 },
        { label: 'Influencers', cost: 1 }
    ];

    const [allocations, setAllocations] = useState(
        sliders.reduce((acc, s) => ({ ...acc, [s.label]: 20 }), {})
    );

    const totalSpent = Object.values(allocations).reduce((sum, val) => sum + (val * (budget / 100)), 0);
    const remaining = budget - totalSpent;

    const handleSliderChange = (label, val) => {
        setAllocations(prev => ({ ...prev, [label]: parseInt(val) }));
    };

    return (
        <div className="h-full bg-gray-50 p-8 flex flex-col items-center overflow-y-auto">
            <h2 className="text-3xl font-black uppercase mb-8">Budget Allocation_Protocol</h2>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* SLIDERS */}
                <div className="space-y-8 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
                    {sliders.map((s) => (
                        <div key={s.label}>
                            <div className="flex justify-between font-black uppercase mb-2">
                                <span>{s.label}</span>
                                <span>{allocations[s.label]}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={allocations[s.label]}
                                onChange={(e) => handleSliderChange(s.label, e.target.value)}
                                className="w-full h-6 bg-gray-200 rounded-none appearance-none cursor-pointer border-2 border-black
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-black
                                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
                            />
                        </div>
                    ))}
                </div>

                {/* VISUALIZER */}
                <div className="flex flex-col gap-6">
                    <div className={`p-6 border-4 border-black text-center ${remaining < 0 ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Remaining Budget</h3>
                        <div className={`text-5xl font-black font-mono my-2 ${remaining < 0 ? 'text-red-600' : 'text-black'}`}>
                            ${remaining.toFixed(0)}
                        </div>
                        {remaining < 0 && (
                            <div className="flex items-center justify-center gap-2 text-red-600 font-bold uppercase text-xs">
                                <AlertCircle size={14} /> Over Budget
                            </div>
                        )}
                    </div>

                    <div className="h-64 bg-white border-4 border-black p-6 flex items-end gap-4 shadow-[8px_8px_0px_0px_#000]">
                        {Object.entries(allocations).map(([key, val]) => (
                            <div key={key} className="flex-1 flex flex-col justify-end h-full group relative">
                                <div
                                    className="w-full bg-black border-2 border-white transition-all duration-300"
                                    style={{ height: `${val}%` }}
                                />
                                <span className="text-[10px] font-bold uppercase text-center mt-2 truncate w-full block">
                                    {key.split(' ')[0]}
                                </span>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono font-bold text-xs opacity-0 group-hover:opacity-100 bg-black text-white px-2 py-1">
                                    {val}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
