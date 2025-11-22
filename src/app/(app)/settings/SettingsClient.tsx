"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

import { useSearchParams } from 'next/navigation';

export default function SettingsClient() {
    const searchParams = useSearchParams();
    const showOnboarding = searchParams.get('onboarding') === 'true';

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        currency: 'USD',
        baseHourlyRate: 100,
        minHourlyRate: 50,
        defaultDeposit: 0.5,
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.id) { // Check if data exists
                        setFormData({
                            businessName: data.businessName || '',
                            currency: data.currency || 'USD',
                            baseHourlyRate: data.baseHourlyRate || 100,
                            minHourlyRate: data.minHourlyRate || 50,
                            defaultDeposit: data.defaultDeposit || 0.5,
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load settings', error);
                toast.error('Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('Settings saved successfully!');
            // Remove onboarding param if present
            if (showOnboarding) {
                window.history.replaceState({}, '', '/settings');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-wolf-grey font-bold">Loading settings...</div>;
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            {showOnboarding && (
                <Card className="bg-macaw-blue/10 border-macaw-blue mb-6 animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-extrabold text-macaw-blue mb-2">👋 Welcome to Quote Cards!</h2>
                    <p className="text-eel-black font-bold">
                        Let&apos;s get your profile set up first. We need your currency and rates to generate accurate AI quotes.
                    </p>
                </Card>
            )}

            <div>
                <h1 className="text-3xl font-extrabold text-eel-black">Settings</h1>
                <p className="text-wolf-grey font-bold">
                    Configure your business profile. The AI uses this to generate accurate quotes.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="space-y-6">
                    <h2 className="text-xl font-extrabold text-eel-black">Business Profile</h2>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Business Name</label>
                            <input
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="e.g. Acme Design Studio"
                                className="w-full px-4 py-3 rounded-xl border-2 border-hare-grey bg-swan-white font-bold text-eel-black focus:border-macaw-blue outline-none transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Currency</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-hare-grey bg-swan-white font-bold text-eel-black focus:border-macaw-blue outline-none transition-colors appearance-none"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="NGN">NGN (₦)</option>
                                    <option value="ZAR">ZAR (R)</option>
                                    <option value="KES">KES (KSh)</option>
                                    <option value="GHS">GHS (₵)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Default Deposit</label>
                                <select
                                    name="defaultDeposit"
                                    value={formData.defaultDeposit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, defaultDeposit: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-hare-grey bg-swan-white font-bold text-eel-black focus:border-macaw-blue outline-none transition-colors appearance-none"
                                >
                                    <option value={0.3}>30%</option>
                                    <option value={0.5}>50%</option>
                                    <option value={1.0}>100%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="space-y-6">
                    <h2 className="text-xl font-extrabold text-eel-black">Pricing Strategy</h2>
                    <p className="text-sm text-wolf-grey font-bold">These figures help the AI estimate project costs.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Base Hourly Rate</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-wolf-grey font-bold">$</span>
                                <input
                                    type="number"
                                    name="baseHourlyRate"
                                    value={formData.baseHourlyRate}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-hare-grey bg-swan-white font-bold text-eel-black focus:border-macaw-blue outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Min Hourly Rate</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-wolf-grey font-bold">$</span>
                                <input
                                    type="number"
                                    name="minHourlyRate"
                                    value={formData.minHourlyRate}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-hare-grey bg-swan-white font-bold text-eel-black focus:border-macaw-blue outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="lg" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
