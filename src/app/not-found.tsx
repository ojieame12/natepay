import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white">
            <Card className="max-w-md w-full text-center space-y-6 border-hare-grey bg-swan-white">
                <div className="text-8xl animate-bounce">🤔</div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-eel-black">404</h1>
                    <h2 className="text-xl font-extrabold text-wolf-grey">Page not found</h2>
                </div>
                <p className="text-wolf-grey font-bold">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link href="/dashboard" className="block">
                    <Button size="lg" className="w-full">
                        Return Home
                    </Button>
                </Link>
            </Card>
        </div>
    );
}
