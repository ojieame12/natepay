import { Bird } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
            <div className="relative">
                <Bird className="w-16 h-16 text-feather-green animate-bounce" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/10 rounded-full blur-sm animate-pulse" />
            </div>
            <p className="text-wolf-grey font-extrabold text-lg animate-pulse">
                Loading...
            </p>
        </div>
    );
}
