"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CancelPage() {
  const params = useSearchParams();
  const slug = params.get('slug');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <Card className="max-w-lg w-full text-center space-y-4 border-fox-orange bg-fox-orange/10">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-2xl font-extrabold text-eel-black">Payment canceled</h1>
        <p className="text-wolf-grey font-bold">
          No worries—your selections are saved. You can resume checkout anytime.
        </p>
        {slug && (
          <Link href={`/q/${slug}`}>
            <Button variant="secondary">Back to quote</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
