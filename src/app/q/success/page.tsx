"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SuccessPage() {
  const params = useSearchParams();
  const slug = params.get('slug');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <Card className="max-w-lg w-full text-center space-y-8 border-feather-green bg-feather-green/5">
        <div className="space-y-2">
          <div className="text-6xl animate-bounce">✅</div>
          <h1 className="text-3xl font-extrabold text-eel-black">Payment received!</h1>
          <p className="text-wolf-grey font-bold text-lg">
            You&apos;re all set. We&apos;ve notified the seller and locked in your slot.
          </p>
        </div>

        <div className="space-y-4 text-left bg-white p-6 rounded-2xl border-2 border-hare-grey">
          <h3 className="text-sm font-extrabold text-wolf-grey uppercase tracking-wide">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-macaw-blue text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
              <p className="text-sm font-bold text-eel-black">Seller confirms receipt within 24h.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-macaw-blue text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
              <p className="text-sm font-bold text-eel-black">You&apos;ll receive a project kickoff email.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-macaw-blue text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
              <p className="text-sm font-bold text-eel-black">Work begins on the scheduled start date.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {slug && (
            <Link href={`/q/${slug}`}>
              <Button variant="primary" className="w-full">View Quote</Button>
            </Link>
          )}
          <Button
            variant="ghost"
            className="w-full text-wolf-grey hover:text-eel-black"
            onClick={() => alert('Receipt download would happen here!')}
          >
            📄 Download Receipt
          </Button>
        </div>
      </Card>
    </div>
  );
}
