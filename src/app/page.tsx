"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    currency: 'USD',
    baseHourlyRate: '',
    minHourlyRate: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Hydrate settings if they exist
  useEffect(() => {
    const loadSettings = async () => {
      if (!isSignedIn) return;
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const s = data?.settings;
        if (s) {
          setFormData({
            businessName: s.businessName || '',
            currency: s.currency || 'USD',
            baseHourlyRate: s.baseHourlyRate ? String(s.baseHourlyRate) : '',
            minHourlyRate: s.minHourlyRate ? String(s.minHourlyRate) : '',
          });
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    loadSettings();
  }, [isSignedIn]);

  const steps = [
    {
      title: isSignedIn ? `Welcome, ${user?.firstName}!` : "Welcome to Quote Cards!",
      desc: "Let's get you set up to send beautiful quotes.",
      content: (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Sparkles className="w-24 h-24 text-macaw-blue animate-bounce" />
          </div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <Button variant="primary" size="lg">
                Sign In to Start
              </Button>
            </SignInButton>
          ) : (
            <div className="text-wolf-grey font-bold">
              Ready to set up your business profile?
            </div>
          )}
        </div>
      )
    },
    {
      title: "What's your business name?",
      desc: "This will appear on your quotes.",
      content: (
        <Input
          autoFocus
          placeholder="e.g. Acme Inc."
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
        />
      )
    },
    {
      title: "Pick your currency",
      desc: "You can change this later.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {['USD', 'EUR', 'GBP', 'ZAR'].map(c => (
            <button
              key={c}
              onClick={() => setFormData({ ...formData, currency: c })}
              className={`p-4 rounded-2xl border-2 font-bold transition-all ${formData.currency === c
                ? 'border-macaw-blue bg-macaw-blue/10 text-macaw-blue'
                : 'border-hare-grey text-wolf-grey hover:border-macaw-blue'
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Your rates",
      desc: "Set your ideal and minimum hourly rates.",
      content: (
        <div className="space-y-4">
          <Input
            label="Ideal hourly rate"
            placeholder="e.g. 120"
            type="number"
            value={formData.baseHourlyRate}
            onChange={(e) => setFormData({ ...formData, baseHourlyRate: e.target.value })}
          />
          <Input
            label="Minimum acceptable rate"
            placeholder="e.g. 80"
            type="number"
            value={formData.minHourlyRate}
            onChange={(e) => setFormData({ ...formData, minHourlyRate: e.target.value })}
          />
        </div>
      )
    }
  ];

  const handleNext = async () => {
    setError(null);
    if (step === 0 && !isSignedIn) {
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName || undefined,
          currency: formData.currency,
          baseHourlyRate: formData.baseHourlyRate ? Number(formData.baseHourlyRate) : undefined,
          minHourlyRate: formData.minHourlyRate ? Number(formData.minHourlyRate) : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setNotice('Settings saved!');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Could not save your settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto">
      <div className="w-full mb-8">
        <div className="h-4 bg-hare-grey rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-feather-green"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "backOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
          className="w-full space-y-8 text-center"
        >
          <h1 className="text-3xl font-extrabold text-eel-black tracking-tight">{steps[step].title}</h1>
          <p className="text-wolf-grey text-lg font-bold">{steps[step].desc}</p>

          <div className="py-6">
            {steps[step].content}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="w-full mt-8">
        {(step > 0 || isSignedIn) && (
          <Button fullWidth size="lg" onClick={handleNext} className="animate-in fade-in zoom-in duration-300" disabled={isSaving}>
            {step === steps.length - 1 ? (isSaving ? "Saving..." : "Get Started") : "Continue"}
          </Button>
        )}
        {error && <p className="text-cardinal-red text-sm font-bold mt-3 text-center">{error}</p>}
        {notice && !error && <p className="text-feather-green text-sm font-bold mt-3 text-center">{notice}</p>}
      </div>
    </div>
  );
}
