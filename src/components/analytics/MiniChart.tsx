import React from 'react';

interface MiniChartProps {
    data: number[];
    color?: string;
    height?: number;
    label?: string;
}

export function MiniChart({ data, color = 'bg-macaw-blue', height = 40, label }: MiniChartProps) {
    const max = Math.max(...data, 1);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-end gap-1 h-full" style={{ height }}>
                {data.map((value, i) => (
                    <div
                        key={i}
                        className={`w-2 rounded-t-sm ${color} opacity-80 hover:opacity-100 transition-all`}
                        style={{ height: `${(value / max) * 100}%` }}
                        title={`${value}`}
                    />
                ))}
            </div>
            {label && <div className="text-[10px] font-bold text-wolf-grey uppercase tracking-wide text-center">{label}</div>}
        </div>
    );
}
