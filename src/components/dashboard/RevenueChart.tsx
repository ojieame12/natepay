'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
    data: {
        date: string;
        amount: number;
    }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-wolf-grey font-bold bg-hare-grey/10 rounded-2xl border-2 border-dashed border-hare-grey">
                No revenue data yet
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#777777', fontSize: 12, fontWeight: 'bold' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#777777', fontSize: 12, fontWeight: 'bold' }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: '#E5E5E5', opacity: 0.4 }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-eel-black text-white p-3 rounded-xl shadow-xl border-2 border-white/10">
                                        <p className="text-xs font-bold text-white/70 mb-1">{payload[0].payload.date}</p>
                                        <p className="text-xl font-extrabold">
                                            ${(payload[0].value as number).toLocaleString()}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar
                        dataKey="amount"
                        fill="#1CB0F6"
                        radius={[8, 8, 0, 0]}
                        barSize={40}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
