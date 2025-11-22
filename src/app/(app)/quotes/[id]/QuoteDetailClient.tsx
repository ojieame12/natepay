'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Copy, ExternalLink, Eye, MousePointerClick, DollarSign } from 'lucide-react';
import type { Quote } from '@/lib/store';

export default function QuoteDetailClient({ quote }: { quote: Quote }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Quote deleted successfully');
            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete quote');
            setIsDeleting(false);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/q/${quote.slug}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Link copied to clipboard!');
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-wolf-grey hover:text-eel-black pl-0">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleCopyLink}>
                        <Copy className="w-4 h-4 mr-2" /> Copy Link
                    </Button>
                    <Button variant="outline" onClick={() => toast.success('Quote resent to client!')}>
                        <span className="mr-2">📩</span> Resend
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                        <span className="mr-2">✏️</span> Edit
                    </Button>
                    <a href={`/q/${quote.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary">
                            <ExternalLink className="w-4 h-4 mr-2" /> View Public Page
                        </Button>
                    </a>
                    <Button variant="ghost" className="text-cardinal-red hover:bg-cardinal-red/10" onClick={handleDelete} disabled={isDeleting}>
                        <Trash2 className="w-4 h-4 mr-2" /> {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card className="border-macaw-blue/20 bg-macaw-blue/5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-extrabold text-eel-black mb-2">{quote.projectTitle}</h1>
                                <p className="text-wolf-grey font-bold text-lg">Client: {quote.clientName}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl font-extrabold uppercase tracking-wide ${quote.status === 'Paid' ? 'bg-feather-green text-white' : 'bg-hare-grey text-wolf-grey'
                                }`}>
                                {quote.status}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-extrabold text-eel-black mb-4">Quote Details</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-hare-grey">
                                <span className="font-bold text-wolf-grey">Total Amount</span>
                                <span className="font-extrabold text-eel-black text-xl">${quote.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-hare-grey">
                                <span className="font-bold text-wolf-grey">Created</span>
                                <span className="font-bold text-eel-black">{new Date(quote.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-hare-grey">
                                <span className="font-bold text-wolf-grey">Slug</span>
                                <span className="font-mono text-sm bg-hare-grey/20 px-2 py-1 rounded">{quote.slug}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-extrabold text-wolf-grey uppercase tracking-wide">Engagement</h3>

                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-macaw-blue/10 flex items-center justify-center text-macaw-blue">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-eel-black">{quote.views || 0}</div>
                            <div className="text-xs font-bold text-wolf-grey uppercase">Total Views</div>
                        </div>
                    </Card>

                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-bee-yellow/10 flex items-center justify-center text-bee-yellow">
                            <MousePointerClick className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-eel-black">--</div>
                            <div className="text-xs font-bold text-wolf-grey uppercase">Clicks</div>
                        </div>
                    </Card>

                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-feather-green/10 flex items-center justify-center text-feather-green">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-eel-black">--</div>
                            <div className="text-xs font-bold text-wolf-grey uppercase">Conversion Rate</div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
