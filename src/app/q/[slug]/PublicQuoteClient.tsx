"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

type QuoteItem = {
    description: string;
    amount: number;
    justification?: string;
};
type Package = {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    isRecommended: boolean;
};
type PaymentPlan = {
    id: string;
    type: string;
    deposit: number;
    total: number;
};

export type PublicQuote = {
    id: string;
    slug: string;
    clientName: string;
    projectTitle: string;
    status: string;
    totalAmount: number | null;
    items: QuoteItem[];
    packages: Package[];
    paymentPlans: PaymentPlan[];
    aiSummary?: string | null;
    retainerPrice?: number;
    retainerInterval?: string;
    retainerDescription?: string;
    createdAt: string; // serialized date
};

export default function PublicQuoteClient({ quote }: { quote: PublicQuote }) {
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [payToday, setPayToday] = useState(0);
    const [payLater, setPayLater] = useState(0);
    const [displayTotal, setDisplayTotal] = useState(0);
    const hasTrackedView = useRef(false);

    // Initialize selection
    useEffect(() => {
        if (quote) {
            const recommended = quote.packages?.find((p) => p.isRecommended)?.id;
            const plan = quote.paymentPlans?.[1]?.id || quote.paymentPlans?.[0]?.id || null;
            setSelectedPackageId(recommended ?? quote.packages?.[0]?.id ?? null);
            setSelectedPlanId(plan);
        }
    }, [quote]);

    // Track View on Mount
    useEffect(() => {
        if (quote && !hasTrackedView.current) {
            hasTrackedView.current = true;
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quoteId: quote.id,
                    type: 'VIEW',
                }),
            }).catch(console.error);
        }
    }, [quote]);

    const trackEvent = (type: string, metadata: Record<string, unknown> = {}) => {
        if (!quote) return;
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteId: quote.id,
                type,
                metadata,
            }),
        }).catch(console.error);
    };

    const packages = quote.packages ?? [];
    const paymentPlans = quote.paymentPlans ?? [];
    const selectedPackage = packages.find((p) => p.id === selectedPackageId) ?? packages[0];
    const selectedPlan = paymentPlans.find((p) => p.id === selectedPlanId) ?? paymentPlans[0];

    // Default to 50% deposit if no plan selected
    const baseTotal = selectedPackage ? selectedPackage.price : (quote.totalAmount || 0);

    // Calculate totals based on plan
    useEffect(() => {
        if (selectedPlan) {
            setPayToday(selectedPlan.deposit);
            setPayLater(selectedPlan.total - selectedPlan.deposit);
        } else {
            setPayToday(Math.round(baseTotal * 0.5));
            setPayLater(Math.round(baseTotal * 0.5));
        }
        setDisplayTotal(selectedPlan ? selectedPlan.total : baseTotal);
    }, [selectedPlan, baseTotal]);

    const handlePackageSelect = (pkgId: string) => {
        setSelectedPackageId(pkgId);
        trackEvent('PACKAGE_SELECT', { packageId: pkgId });
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idx = Number(e.target.value);
        const plan = paymentPlans[idx];
        if (plan) {
            setSelectedPlanId(plan.id);
            // Debounce tracking could be added here, for now just track
            trackEvent('PAYMENT_SLIDER', { planId: plan.id, type: plan.type });
        }
    };

    const beginCheckout = async () => {
        if (!quote) return;
        setIsPaying(true);
        setCheckoutUrl(null);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: quote.slug,
                    packageId: selectedPackage?.id ?? null,
                    planId: selectedPlan?.id ?? null,
                }),
            });
            if (!res.ok) {
                throw new Error('Failed to start checkout');
            }
            const data = await res.json();
            if (data?.url) {
                setCheckoutUrl(data.url);
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            console.error(err);
            alert('Unable to start payment. Please try again.');
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Card className="bg-macaw-blue/5 border-macaw-blue/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Quote for</p>
                            <h1 className="text-3xl font-extrabold text-eel-black">{quote.projectTitle}</h1>
                            <p className="text-wolf-grey font-bold">From: {quote.clientName}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-wolf-grey font-bold uppercase text-xs">Status</div>
                            <div className="text-sm font-extrabold text-eel-black">{quote.status}</div>
                        </div>
                    </div>
                </Card>

                {quote.aiSummary && (
                    <Card>
                        <h2 className="text-xl font-extrabold text-eel-black mb-2">Summary</h2>
                        <p className="text-wolf-grey font-medium">{quote.aiSummary}</p>
                    </Card>
                )}

                {packages.length > 0 && (
                    <Card className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Choose your package</p>
                                <h2 className="text-xl font-extrabold text-eel-black">Pick what feels right</h2>
                            </div>
                            <div className="text-xs font-bold text-wolf-grey uppercase bg-hare-grey/50 px-3 py-1 rounded-full">Tap to switch</div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {packages.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    onClick={() => handlePackageSelect(pkg.id)}
                                    className={`relative text-left rounded-3xl border-b-4 p-5 space-y-3 transition-all duration-200 active:scale-95 ${selectedPackage?.id === pkg.id
                                        ? 'border-macaw-blue bg-macaw-blue text-white shadow-lg scale-[1.02]'
                                        : 'border-hare-grey bg-white hover:border-macaw-blue hover:bg-macaw-blue/5'
                                        }`}
                                >
                                    {selectedPackage?.id === pkg.id && (
                                        <div className="absolute -top-3 -right-3 bg-bee-yellow text-white text-2xl rounded-full w-8 h-8 flex items-center justify-center shadow-sm animate-bounce">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className={`text-sm font-extrabold uppercase ${selectedPackage?.id === pkg.id ? 'text-white' : 'text-wolf-grey'}`}>{pkg.name}</div>
                                        {pkg.isRecommended && selectedPackage?.id !== pkg.id && (
                                            <span className="text-[10px] font-extrabold text-macaw-blue bg-macaw-blue/10 px-2 py-1 rounded-full uppercase tracking-wide">
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-3xl font-extrabold ${selectedPackage?.id === pkg.id ? 'text-white' : 'text-eel-black'}`}>${pkg.price.toLocaleString()}</div>
                                    <p className={`font-bold text-sm ${selectedPackage?.id === pkg.id ? 'text-white/90' : 'text-wolf-grey'}`}>{pkg.description}</p>
                                    <ul className="space-y-2 pt-2">
                                        {pkg.features.map((f, idx) => (
                                            <li key={idx} className={`text-sm font-bold flex items-center gap-2 ${selectedPackage?.id === pkg.id ? 'text-white' : 'text-eel-black'}`}>
                                                <span className={selectedPackage?.id === pkg.id ? 'text-white' : 'text-feather-green'}>•</span> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </button>
                            ))}
                        </div>
                    </Card>
                )}

                <Card>
                    <h2 className="text-xl font-extrabold text-eel-black mb-4">Breakdown</h2>
                    <div className="space-y-3">
                        {quote.items?.map((item, idx) => (
                            <div
                                key={idx}
                                className="group relative perspective-1000 cursor-pointer"
                                onClick={() => {
                                    // Toggle flip state logic would go here, for now just hover effect
                                }}
                            >
                                <div className="relative w-full transition-all duration-500 transform-style-3d group-hover:rotate-x-180">
                                    {/* Front */}
                                    <div className="flex items-center justify-between p-4 bg-swan-white rounded-2xl border-2 border-hare-grey backface-hidden">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-eel-black">{item.description}</span>
                                            {item.justification && (
                                                <span className="text-xs bg-macaw-blue/10 text-macaw-blue px-2 py-1 rounded-full font-extrabold uppercase tracking-wide">
                                                    Why?
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-extrabold text-macaw-blue">${item.amount.toLocaleString()}</span>
                                    </div>

                                    {/* Back (Justification) */}
                                    {item.justification && (
                                        <div className="absolute inset-0 flex items-center justify-center p-4 bg-macaw-blue text-white rounded-2xl border-2 border-macaw-blue rotate-x-180 backface-hidden">
                                            <p className="font-bold text-center text-sm">{item.justification}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {quote.retainerPrice && (
                            <div className="flex items-center justify-between p-4 bg-bee-yellow/10 rounded-2xl border-2 border-bee-yellow/30">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-eel-black">Monthly Retainer</span>
                                        <span className="text-xs bg-bee-yellow text-white px-2 py-1 rounded-full font-extrabold uppercase tracking-wide">Optional</span>
                                    </div>
                                    <p className="text-xs text-wolf-grey font-bold mt-1">{quote.retainerDescription || 'Maintenance & Support'}</p>
                                </div>
                                <span className="font-extrabold text-bee-yellow-active text-xl">+${quote.retainerPrice.toLocaleString()}/mo</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 px-2">
                            <span className="text-wolf-grey font-bold uppercase tracking-wide">Total Project Value</span>
                            <span className="text-3xl font-extrabold text-eel-black">
                                {quote.totalAmount ? `$${quote.totalAmount.toLocaleString()}` : '-'}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Payment timing</p>
                            <h2 className="text-xl font-extrabold text-eel-black">Slide to choose</h2>
                        </div>
                        <div className="text-xs font-bold text-white bg-macaw-blue px-3 py-1 rounded-xl uppercase tracking-wide">
                            {selectedPlan ? selectedPlan.type : 'balanced'}
                        </div>
                    </div>

                    <div className="relative py-4">
                        <input
                            type="range"
                            min={0}
                            max={(paymentPlans.length || 3) - 1}
                            step={1}
                            value={
                                selectedPlan
                                    ? paymentPlans.findIndex((p) => p.id === selectedPlan.id)
                                    : Math.floor((paymentPlans.length || 3) / 2)
                            }
                            onChange={handleSliderChange}
                            className="w-full h-4 bg-hare-grey rounded-full appearance-none cursor-pointer accent-macaw-blue hover:accent-macaw-blue-active transition-all"
                        />
                        <div className="flex justify-between mt-2 px-1">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="w-1 h-2 bg-wolf-grey/30 rounded-full" />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-wolf-grey uppercase tracking-wide px-1">
                        <span>Less now</span>
                        <span>Balanced</span>
                        <span>All now</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-2xl border-2 border-hare-grey p-4 transition-colors hover:border-macaw-blue/50">
                            <div className="text-xs font-bold text-wolf-grey uppercase mb-1">Pay today</div>
                            <div className="text-2xl font-extrabold text-eel-black">${payToday.toLocaleString()}</div>
                        </div>
                        <div className="rounded-2xl border-2 border-hare-grey p-4 transition-colors hover:border-macaw-blue/50">
                            <div className="text-xs font-bold text-wolf-grey uppercase mb-1">On delivery</div>
                            <div className="text-2xl font-extrabold text-eel-black">
                                {payLater > 0 ? `$${payLater.toLocaleString()}` : '—'}
                            </div>
                        </div>
                        <div className="rounded-2xl border-2 border-hare-grey p-4 bg-macaw-blue/5 border-macaw-blue/20">
                            <div className="text-xs font-bold text-macaw-blue uppercase mb-1">Total</div>
                            <div className="text-2xl font-extrabold text-macaw-blue">
                                {(selectedPlan ? selectedPlan.total : displayTotal).toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                })}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="text-center space-y-4">
                    <div className="text-2xl">🪄</div>
                    <h3 className="text-xl font-extrabold text-eel-black">Ready to move forward?</h3>
                    <p className="text-wolf-grey font-bold">
                        Pay the deposit now to lock in your slot. Remaining balance is due on delivery.
                    </p>
                    <div className="flex justify-center">
                        <Button variant="primary" size="lg" onClick={beginCheckout} disabled={isPaying}>
                            {isPaying ? 'Starting checkout...' : 'Approve & Pay'}
                        </Button>
                    </div>
                    {checkoutUrl && (
                        <p className="text-xs text-wolf-grey">
                            Redirecting... If not redirected, <a className="text-macaw-blue underline" href={checkoutUrl}>click here</a>.
                        </p>
                    )}
                </Card>
            </div>
        </div>
    );
}
