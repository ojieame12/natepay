import { useState } from 'react';
import { clsx } from 'clsx';

interface MobileMoneyMethod {
  id: string;
  name: string;
  icon: string;
  supported: string[];
}

const MOBILE_MONEY_METHODS: MobileMoneyMethod[] = [
  { id: 'mpesa', name: 'M-Pesa', icon: '📱', supported: ['KES', 'TZS'] },
  { id: 'mtn', name: 'MTN Money', icon: '💛', supported: ['GHS', 'UGX', 'ZMW'] },
  { id: 'airtel', name: 'Airtel Money', icon: '🔴', supported: ['KES', 'UGX', 'NGN'] },
  { id: 'vodafone', name: 'Vodafone Cash', icon: '📞', supported: ['GHS'] },
];

interface MobileMoneySelectorProps {
  currency: string;
  onSelect: (methodId: string) => void;
  selected?: string;
}

export function MobileMoneySelector({ currency, onSelect, selected }: MobileMoneySelectorProps) {
  const available = MOBILE_MONEY_METHODS.filter(m =>
    m.supported.includes(currency.toUpperCase())
  );

  // If no mobile money for this currency, show card only
  if (available.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Payment Method</h3>
        <button
          onClick={() => onSelect('card')}
          className={clsx(
            "w-full p-4 rounded-2xl border-2 font-bold transition-all text-left",
            selected === 'card'
              ? 'border-macaw-blue bg-macaw-blue/10 text-macaw-blue'
              : 'border-hare-grey text-wolf-grey hover:border-macaw-blue'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">💳</div>
            <div>
              <div className="font-extrabold">Card Payment</div>
              <div className="text-xs opacity-80">Credit or Debit Card</div>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-wolf-grey uppercase tracking-wide">How do you want to pay?</h3>
      <div className="grid grid-cols-2 gap-3">
        {available.map(method => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={clsx(
              "p-4 rounded-2xl border-2 font-bold transition-all",
              selected === method.id
                ? 'border-feather-green bg-feather-green/10 text-feather-green'
                : 'border-hare-grey text-wolf-grey hover:border-feather-green'
            )}
          >
            <div className="text-3xl mb-1">{method.icon}</div>
            <div className="text-sm font-extrabold">{method.name}</div>
          </button>
        ))}

        <button
          onClick={() => onSelect('card')}
          className={clsx(
            "p-4 rounded-2xl border-2 font-bold transition-all",
            selected === 'card'
              ? 'border-macaw-blue bg-macaw-blue/10 text-macaw-blue'
              : 'border-hare-grey text-wolf-grey hover:border-macaw-blue'
          )}
        >
          <div className="text-3xl mb-1">💳</div>
          <div className="text-sm font-extrabold">Card</div>
        </button>
      </div>
    </div>
  );
}
