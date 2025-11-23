'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white">
            <Card className="max-w-md w-full text-center space-y-6 border-cardinal-red bg-cardinal-red/5">
                <div className="text-6xl">🤕</div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-extrabold text-eel-black">Something went wrong!</h1>
                    <p className="text-wolf-grey font-bold text-sm">
                        We encountered an unexpected error.
                    </p>
                </div>
                <div className="flex gap-4 justify-center">
                    <Button
                        variant="secondary"
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        Go Home
                    </Button>
                    <Button
                        onClick={reset}
                        className="bg-cardinal-red hover:bg-cardinal-red-active border-cardinal-red-active shadow-cardinal-red-active"
                    >
                        Try again
                    </Button>
                </div>
            </Card>
        </div>
    );
}
