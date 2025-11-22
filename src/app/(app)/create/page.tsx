"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/lib/store';
import {
  type QuoteGenerationResponse,
  type SellerSettings,
} from '@/lib/ai';
import { Sparkles } from 'lucide-react';

export default function CreateQuotePage() {
  const router = useRouter();
  const addQuote = useStore((state) => state.addQuote);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedData, setGeneratedData] = useState<QuoteGenerationResponse | null>(null);
  const [settings, setSettings] = useState<SellerSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    projectTitle: '',
    notes: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoadingSettings(true);
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSettings(data?.settings ?? null);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings?.currency || 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const handleGenerate = async () => {
    setError(null);
    if (!formData.clientName || !formData.projectTitle) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: formData.projectTitle,
          notes: formData.notes,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate');
      const data = (await res.json()) as QuoteGenerationResponse;
      setGeneratedData(data);
    } catch (err) {
      console.error('Failed to generate', err);
      setError('AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!generatedData) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          projectTitle: formData.projectTitle,
          totalAmount: generatedData.total,
          rawNotes: formData.notes,
          items: generatedData.items,
          aiSummary: generatedData.summary,
          packages: generatedData.packages,
          paymentPlans: generatedData.paymentPlans,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save quote');
      }

      const data = await res.json();
      if (data?.quote) {
        addQuote(data.quote);
        const url = `${window.location.origin}/q/${data.quote.slug}`;
        setShareUrl(url);
        return;
      }
    } catch (err) {
      console.error(err);
      setError('Could not save quote. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-eel-black">New Quote</h1>
          {settings?.currency && (
            <div className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${['NGN', 'ZAR', 'KES', 'GHS'].includes(settings.currency)
                ? 'bg-feather-green/10 text-feather-green'
                : 'bg-macaw-blue/10 text-macaw-blue'
              }`}>
              {['NGN', 'ZAR', 'KES', 'GHS'].includes(settings.currency)
                ? '💳 via Flutterwave'
                : '💳 via Stripe'
              }
            </div>
          )}
        </div>
        <p className="text-wolf-grey font-bold">
          {loadingSettings
            ? 'Loading your settings...'
            : `Tell us about the project${settings?.currency ? ` (${settings.currency})` : ''}.`}
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Client Name"
              placeholder="e.g. John Doe"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
            <Input
              label="Company"
              placeholder="e.g. Acme Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <Input
            label="Project Title"
            placeholder="e.g. Website Redesign"
            value={formData.projectTitle}
            onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-sm font-bold text-wolf-grey uppercase tracking-wide ml-1">
              Project Notes
            </label>
            <textarea
              className="w-full p-4 rounded-xl border-2 border-hare-grey bg-swan-white text-eel-black font-bold placeholder:text-wolf-grey/50 outline-none transition-colors focus:border-macaw-blue focus:bg-macaw-blue/5 min-h-[150px] resize-y"
              placeholder="Paste emails, call notes, or requirements here..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {!generatedData && (
            <div className="pt-4 flex justify-end gap-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="w-48"
                onClick={handleGenerate}
                disabled={isGenerating || !formData.clientName || !formData.projectTitle}
              >
                {isGenerating ? 'Generating...' : 'Generate Quote ✨'}
              </Button>
            </div>
          )}
        </Card>

        {generatedData && (
          <Card className="space-y-6 border-macaw-blue bg-macaw-blue/5 ring-4 ring-macaw-blue/20 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-macaw-blue animate-bounce" />
                <h2 className="text-xl font-extrabold text-macaw-blue uppercase tracking-wide">AI Suggestion</h2>
              </div>
              <p className="text-wolf-grey font-bold text-lg leading-relaxed">{generatedData.summary}</p>
            </div>

            <div className="space-y-3">
              {generatedData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 p-4 bg-white rounded-2xl border-2 border-macaw-blue/20 shadow-sm hover:border-macaw-blue transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-eel-black text-lg">{item.description}</span>
                    <span className="font-extrabold text-macaw-blue text-xl">{formatMoney(item.amount)}</span>
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-2">
                <div className="text-sm font-bold text-wolf-grey uppercase tracking-wide">Packages</div>
                <div className="grid md:grid-cols-3 gap-3">
                  {generatedData.packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl border-2 p-3 space-y-2 ${pkg.isRecommended ? 'border-feather-green bg-feather-green/10' : 'border-hare-grey'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold uppercase text-wolf-grey">{pkg.name}</span>
                        {pkg.isRecommended && <span className="text-xs text-feather-green font-extrabold">⭐</span>}
                      </div>
                      <div className="text-xl font-extrabold text-eel-black">{formatMoney(pkg.price)}</div>
                      <p className="text-sm text-wolf-grey font-medium">{pkg.description}</p>
                      <ul className="space-y-1 text-sm font-bold text-eel-black">
                        {pkg.features.slice(0, 4).map((f, fIdx) => (
                          <li key={fIdx}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 px-4 border-t-2 border-macaw-blue/10">
                <span className="font-bold text-wolf-grey uppercase tracking-wider">Recommended Total</span>
                <span className="text-3xl font-extrabold text-eel-black">
                  {formatMoney(generatedData.total)}
                </span>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t-2 border-macaw-blue/10">
              <Button variant="ghost" onClick={() => setGeneratedData(null)} className="text-macaw-blue hover:bg-macaw-blue/10">
                Regenerate
              </Button>
              <Button variant="primary" size="lg" onClick={handleSave} className="min-w-[160px]" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Quote'}
              </Button>
            </div>

            {shareUrl && (
              <Card className="bg-white border-macaw-blue/40 space-y-3">
                <div className="text-sm font-bold text-wolf-grey uppercase">Quote ready</div>
                <div className="font-extrabold text-eel-black break-words">{shareUrl}</div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={handleCopy}>Copy link</Button>
                  <Button variant="outline" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                </div>
              </Card>
            )}
          </Card>
        )}

        {error && (
          <Card className="border-cardinal-red bg-cardinal-red/10 text-cardinal-red font-bold">
            {error}
          </Card>
        )}
      </div>
    </div>
  );
}
