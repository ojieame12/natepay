'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MobileMoneySelector } from '@/components/ui/MobileMoneySelector';
import { CheckCircle2 } from 'lucide-react';

interface SimpleQuote {
  id: string;
  clientName: string;
  clientPhone?: string;
  projectTitle: string;
  totalAmount: number;
  currency: string;
  rawNotes?: string;
}

export default function SimpleAcceptPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [quote, setQuote] = useState<SimpleQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/quotes/public/${slug}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        if (data?.quote) {
          setQuote(data.quote);
          // Auto-select mobile money if available for currency
          if (['KES', 'GHS', 'UGX'].includes(data.quote.currency)) {
            setPaymentMethod('mpesa');
          } else {
            setPaymentMethod('card');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleApprove = async () => {
    if (!quote) return;

    setIsPaying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          paymentMethod,
        }),
      });

      if (!res.ok) throw new Error('Failed to start payment');

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Could not process payment. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-wolf-grey font-bold">Loading...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-wolf-grey font-bold">Payment request not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-swan-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <Card className="bg-feather-green/5 border-feather-green/20 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-feather-green/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-feather-green" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-eel-black mb-2">
            Payment Request
          </h1>
          <p className="text-wolf-grey font-bold">
            From: {quote.clientName}
          </p>
        </Card>

        {/* Amount */}
        <Card>
          <div className="text-center space-y-4">
            <div className="text-sm font-bold text-wolf-grey uppercase">Monthly Payment</div>
            <div className="text-5xl font-extrabold text-eel-black">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: quote.currency || 'USD',
                maximumFractionDigits: 0,
              }).format(quote.totalAmount)}
            </div>
            <div className="text-sm text-wolf-grey font-bold">
              {quote.rawNotes || 'Auto-payment every month'}
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card>
          <MobileMoneySelector
            currency={quote.currency}
            onSelect={setPaymentMethod}
            selected={paymentMethod}
          />
        </Card>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleApprove}
          disabled={isPaying || !paymentMethod}
          className="bg-feather-green border-feather-green hover:bg-feather-green-active text-white h-14 text-lg"
        >
          {isPaying ? 'Processing...' : '✓ APPROVE & SET UP AUTO-PAYMENT'}
        </Button>

        {/* Trust Signals */}
        <div className="text-center space-y-2">
          <div className="text-xs text-wolf-grey font-bold">
            🔒 Secure payment • Cancel anytime • No hidden fees
          </div>
          <div className="text-[10px] text-wolf-grey">
            Powered by NatePay
          </div>
        </div>
      </div>
    </div>
  );
}
