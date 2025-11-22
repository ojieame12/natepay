import React from 'react';
import { clsx } from 'clsx';

interface MarketComparisonChartProps {
  min: number;
  max: number;
  current: number;
  currency?: string;
  className?: string;
}

export function MarketComparisonChart({ min, max, current, currency = 'USD', className }: MarketComparisonChartProps) {
  const upperLimit = Math.max(max, current) * 1.2;

  const minPercent = (min / upperLimit) * 100;
  const maxPercent = (max / upperLimit) * 100;
  const currentPercent = (current / upperLimit) * 100;
  const rangeWidth = maxPercent - minPercent;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={clsx('w-full space-y-2', className)}>
      <div className="flex justify-between text-xs font-bold text-wolf-grey uppercase tracking-wide">
        <span>Market Comparison</span>
        <span>{formatMoney(current)}</span>
      </div>

      <div className="relative h-8 bg-hare-grey/20 rounded-full w-full overflow-hidden">
        <div
          className="absolute top-0 bottom-0 bg-macaw-blue/20 border-x-2 border-macaw-blue/30"
          style={{ left: `${minPercent}%`, width: `${rangeWidth}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-1 bg-eel-black z-10"
          style={{ left: `${currentPercent}%` }}
        >
          <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-eel-black rounded-full border-2 border-white shadow-sm" />
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-bold text-wolf-grey">
        <div style={{ paddingLeft: `${minPercent}%` }}>Market Min: {formatMoney(min)}</div>
        <div style={{ paddingRight: `${100 - maxPercent}%` }}>Max: {formatMoney(max)}</div>
      </div>
    </div>
  );
}
