'use client';

import { useState } from 'react';
import { ConnectComponentsProvider, ConnectPayouts, ConnectBalances } from '@stripe/react-connect-js';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Check } from 'lucide-react';

export default function FinanceClient({ stripeAccountId }: { stripeAccountId?: string | null }) {
    const [isLoading, setIsLoading] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [isMonoActive, setIsMonoActive] = useState(false);

    // Stripe Connect State
    const [stripeConnectInstance] = useState(() => {
        const fetchClientSecret = async () => {
            const res = await fetch('/api/connect/session', { method: 'POST' });
            const { clientSecret } = await res.json();
            return clientSecret;
        };

        return loadConnectAndInitialize({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
            fetchClientSecret,
            appearance: {
                variables: {
                    colorPrimary: '#1cb0f6', // Macaw Blue
                    fontFamily: 'Nunito, sans-serif',
                },
            },
        });
    });

    // Flutterwave State
    const [flutterwaveData, setFlutterwaveData] = useState({
        accountNumber: '',
        bankCode: '',
        businessName: ''
    });
    const [isFlwLoading, setIsFlwLoading] = useState(false);

    const handleSetup = async () => {
        setIsLoading(true);
        setNotice(null);
        try {
            const res = await fetch('/api/connect/onboarding', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error(err);
            setNotice('Failed to start setup. Please try again.');
            setIsLoading(false);
        }
    };

    const handleFlutterwaveSetup = async () => {
        setIsFlwLoading(true);
        setNotice(null);
        try {
            const res = await fetch('/api/flutterwave/subaccount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account_number: flutterwaveData.accountNumber,
                    account_bank: flutterwaveData.bankCode,
                    business_name: flutterwaveData.businessName,
                    percentage_charge: 5 // Default platform fee
                }),
            });

            if (!res.ok) throw new Error('Failed to create subaccount');

            await res.json();
            setNotice('Flutterwave account connected successfully! 🎉');
            // Ideally we would update local state or re-fetch user settings here
        } catch (err) {
            console.error(err);
            setNotice('Failed to connect Flutterwave account. Please check your details.');
        } finally {
            setIsFlwLoading(false);
        }
    };

    if (!stripeAccountId) {
        return (
            <div className="max-w-2xl mx-auto py-12 space-y-8">
                <Card className="p-10 space-y-6">
                    <div className="text-6xl">🏦</div>
                    <h1 className="text-3xl font-extrabold text-eel-black">Setup Payouts (Global)</h1>
                    <p className="text-wolf-grey font-bold text-lg">
                        Connect your bank account via Stripe to receive payments from international clients (USD, EUR, GBP).
                    </p>
                    <Button size="lg" onClick={handleSetup} disabled={isLoading}>
                        {isLoading ? 'Redirecting...' : 'Connect with Stripe'}
                    </Button>
                </Card>

                <div className="flex items-center gap-4 text-wolf-grey font-bold uppercase tracking-wide justify-center">
                    <div className="h-px bg-hare-grey flex-1" />
                    <span>OR</span>
                    <div className="h-px bg-hare-grey flex-1" />
                </div>

                <Card className="p-10 space-y-6 border-macaw-blue/20">
                    <div className="text-6xl">🌍</div>
                    <h1 className="text-3xl font-extrabold text-eel-black">Setup Payouts (Africa)</h1>
                    <p className="text-wolf-grey font-bold text-lg">
                        Connect your local bank account via Flutterwave for payments in NGN, ZAR, KES, or GHS.
                    </p>

                    <div className="grid gap-4">
                        <Input
                            label="Business Name"
                            placeholder="e.g. My Design Studio"
                            value={flutterwaveData.businessName}
                            onChange={(e) => setFlutterwaveData({ ...flutterwaveData, businessName: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Bank Code"
                                placeholder="e.g. 044"
                                value={flutterwaveData.bankCode}
                                onChange={(e) => setFlutterwaveData({ ...flutterwaveData, bankCode: e.target.value })}
                            />
                            <Input
                                label="Account Number"
                                placeholder="e.g. 1234567890"
                                value={flutterwaveData.accountNumber}
                                onChange={(e) => setFlutterwaveData({ ...flutterwaveData, accountNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={handleFlutterwaveSetup}
                        disabled={isFlwLoading || !flutterwaveData.accountNumber || !flutterwaveData.bankCode}
                    >
                        {isFlwLoading ? 'Connecting...' : 'Connect with Flutterwave'}
                    </Button>
                </Card>

                <div className="flex items-center gap-4 text-wolf-grey font-bold uppercase tracking-wide justify-center">
                    <div className="h-px bg-hare-grey flex-1" />
                    <span>OR</span>
                    <div className="h-px bg-hare-grey flex-1" />
                </div>

                <Card className="p-10 space-y-6 border-eel-black/20">
                    <div className="text-6xl">🏦</div>
                    <h1 className="text-3xl font-extrabold text-eel-black">Direct Debit (Nigeria)</h1>
                    <p className="text-wolf-grey font-bold text-lg">
                        Connect Mono to accept recurring Direct Debit payments from Nigerian bank accounts.
                    </p>
                    <div className="bg-hare-grey/10 p-6 rounded-2xl border-2 border-hare-grey/50 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm border-2 border-hare-grey">
                                ⚡️
                            </div>
                        </div>
                        <div>
                            <p className="font-extrabold text-eel-black text-lg">Platform Managed</p>
                            <p className="text-wolf-grey font-bold text-sm max-w-xs mx-auto">
                                We handle the technical connection. Funds are routed directly to your connected bank account.
                            </p>
                        </div>
                    </div>
                    {isMonoActive ? (
                        <div className="flex items-center justify-center gap-2 p-4 bg-feather-green/10 text-feather-green font-extrabold rounded-xl border-2 border-feather-green/20">
                            <Check className="w-6 h-6" />
                            <span>Direct Debit Active</span>
                        </div>
                    ) : (
                        <Button
                            size="lg"
                            className="w-full bg-eel-black text-white hover:bg-eel-black/80 shadow-btn shadow-eel-black/50 border-eel-black"
                            onClick={() => {
                                setIsMonoActive(true);
                                setNotice('Direct Debit activated successfully! 🇳🇬');
                            }}
                        >
                            Activate Direct Debit
                        </Button>
                    )}
                </Card>

                {notice && (
                    <div className={`p-4 rounded-xl font-bold text-center ${notice.includes('success') ? 'bg-feather-green/10 text-feather-green' : 'bg-cardinal-red/10 text-cardinal-red'}`}>
                        {notice}
                    </div>
                )}
            </div>
        );
    }

    return (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <div className="max-w-5xl mx-auto space-y-8">
                <h1 className="text-3xl font-extrabold text-eel-black">Finance</h1>
                <div className="grid gap-8">
                    <Card>
                        <h2 className="text-xl font-extrabold mb-4">Balances</h2>
                        <ConnectBalances />
                    </Card>
                    <Card>
                        <h2 className="text-xl font-extrabold mb-4">Payouts</h2>
                        <ConnectPayouts />
                    </Card>
                </div>
            </div>
        </ConnectComponentsProvider>
    );
}
