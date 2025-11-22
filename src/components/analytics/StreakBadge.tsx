import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
    streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
    return (
        <div className="flex items-center gap-2 bg-fox-orange/10 px-3 py-1.5 rounded-full border border-fox-orange/20">
            <Flame className={`w-5 h-5 ${streak > 0 ? 'text-fox-orange fill-fox-orange animate-pulse' : 'text-wolf-grey'}`} />
            <div className="flex flex-col leading-none">
                <span className="text-lg font-extrabold text-eel-black">{streak}</span>
                <span className="text-[10px] font-bold text-wolf-grey uppercase tracking-wide">Day Streak</span>
            </div>
        </div>
    );
}
