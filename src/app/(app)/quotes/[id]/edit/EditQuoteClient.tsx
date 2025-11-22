'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react';
import type { Quote, QuoteItem } from '@/lib/store';

export default function EditQuoteClient({ quote }: { quote: Quote }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        clientName: quote.clientName,
        projectTitle: quote.projectTitle,
        status: quote.status,
        items: quote.items || [],
        retainerNegotiation: quote.retainerNegotiation,
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/quotes/${quote.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: formData.clientName,
                    projectTitle: formData.projectTitle,
                    status: formData.status,
                    items: formData.items,
                    retainerNegotiation: formData.retainerNegotiation,
                }),
            });

            if (!res.ok) throw new Error('Failed to save');

            await res.json();
            toast.success('Quote updated successfully');
            router.push(`/quotes/${quote.id}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const updateItem = (idx: number, updates: Partial<QuoteItem>) => {
        const newItems = [...formData.items];
        newItems[idx] = { ...newItems[idx], ...updates };
        setFormData({ ...formData, items: newItems });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateNegotiation = (idx: number, updates: any) => {
        const newItems = [...formData.items];
        const current = newItems[idx].negotiation || {
            marketRate: { min: 0, max: 0 },
            complexityScore: 'Medium',
            whyItMatters: '',
            roiPotential: '',
        };
        newItems[idx].negotiation = { ...current, ...updates };
        setFormData({ ...formData, items: newItems });
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8 pb-32">
            <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-4 z-50 border-b border-hare-grey/20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-extrabold text-eel-black">Edit Quote</h1>
                </div>
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="grid gap-8">
                {/* Basic Info */}
                <Card className="space-y-6">
                    <h2 className="text-xl font-extrabold text-eel-black">Basic Info</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Client Name"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        />
                        <Input
                            label="Project Title"
                            value={formData.projectTitle}
                            onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-wolf-grey uppercase tracking-wide mb-2">Status</label>
                        <select
                            className="w-full p-3 rounded-xl border-2 border-hare-grey bg-swan-white font-bold"
                            value={formData.status}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Viewed">Viewed</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                </Card>

                {/* Line Items */}
                <Card className="space-y-6">
                    <h2 className="text-xl font-extrabold text-eel-black">Line Items & Smart Data</h2>
                    <div className="space-y-4">
                        {formData.items.map((item, idx) => (
                            <div key={idx} className="border-2 border-hare-grey rounded-2xl p-4 space-y-4 bg-white">
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            label="Description"
                                            value={item.description}
                                            onChange={(e) => updateItem(idx, { description: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <Input
                                            label="Price"
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateItem(idx, { amount: Number(e.target.value) })}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="mt-8 text-cardinal-red hover:bg-cardinal-red/10"
                                        onClick={() => {
                                            const newItems = formData.items.filter((_, i) => i !== idx);
                                            setFormData({ ...formData, items: newItems });
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Smart Data Editor */}
                                <div className="bg-macaw-blue/5 rounded-xl p-4 border border-macaw-blue/20 space-y-4">
                                    <div className="flex items-center gap-2 text-macaw-blue font-extrabold uppercase text-xs tracking-wide">
                                        <Sparkles className="w-4 h-4" /> Smart Negotiation Data
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-wolf-grey uppercase">Market Min</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 rounded-lg border border-hare-grey font-bold"
                                                value={item.negotiation?.marketRate.min || 0}
                                                onChange={(e) => updateNegotiation(idx, { marketRate: { ...item.negotiation?.marketRate, min: Number(e.target.value) } })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-wolf-grey uppercase">Market Max</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 rounded-lg border border-hare-grey font-bold"
                                                value={item.negotiation?.marketRate.max || 0}
                                                onChange={(e) => updateNegotiation(idx, { marketRate: { ...item.negotiation?.marketRate, max: Number(e.target.value) } })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-wolf-grey uppercase">Complexity</label>
                                        <select
                                            className="w-full p-2 rounded-lg border border-hare-grey font-bold"
                                            value={item.negotiation?.complexityScore || 'Medium'}
                                            onChange={(e) => updateNegotiation(idx, { complexityScore: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-wolf-grey uppercase">Why it matters</label>
                                        <input
                                            className="w-full p-2 rounded-lg border border-hare-grey font-bold"
                                            value={item.negotiation?.whyItMatters || ''}
                                            onChange={(e) => updateNegotiation(idx, { whyItMatters: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-wolf-grey uppercase">ROI Potential</label>
                                        <input
                                            className="w-full p-2 rounded-lg border border-hare-grey font-bold"
                                            value={item.negotiation?.roiPotential || ''}
                                            onChange={(e) => updateNegotiation(idx, { roiPotential: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() => setFormData({
                                ...formData,
                                items: [...formData.items, { description: 'New Item', amount: 0 }]
                            })}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                    </div>
                </Card>

                {/* Retainer Editor */}
                {formData.retainerNegotiation && (
                    <Card className="space-y-6 border-bee-yellow/20 bg-bee-yellow/5">
                        <h2 className="text-xl font-extrabold text-eel-black">Smart Retainer Data</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-wolf-grey uppercase">Risk of Inaction</label>
                                <textarea
                                    className="w-full p-3 rounded-xl border-2 border-hare-grey font-bold"
                                    value={formData.retainerNegotiation.riskOfInaction}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        retainerNegotiation: { ...formData.retainerNegotiation!, riskOfInaction: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-wolf-grey uppercase">Alt Cost Description</label>
                                    <input
                                        className="w-full p-3 rounded-xl border-2 border-hare-grey font-bold"
                                        value={formData.retainerNegotiation.alternativeCost.description}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            retainerNegotiation: {
                                                ...formData.retainerNegotiation!,
                                                alternativeCost: { ...formData.retainerNegotiation!.alternativeCost, description: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-wolf-grey uppercase">Alt Cost Amount</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl border-2 border-hare-grey font-bold"
                                        value={formData.retainerNegotiation.alternativeCost.amount}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            retainerNegotiation: {
                                                ...formData.retainerNegotiation!,
                                                alternativeCost: { ...formData.retainerNegotiation!.alternativeCost, amount: Number(e.target.value) }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
