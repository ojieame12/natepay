'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Briefcase } from 'lucide-react';

export default function CreateJobPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employerName: '',
    employerPhone: '',
    monthlyPay: '',
    paymentDay: '1',
  });

  const handleCreate = async () => {
    if (!formData.employerName || !formData.monthlyPay) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.employerName,
          clientPhone: formData.employerPhone,
          projectTitle: 'Monthly Services',
          mode: 'salary',
          totalAmount: Number(formData.monthlyPay),
          rawNotes: `Payment day: ${formData.paymentDay} of every month`,
          items: [
            {
              description: 'Monthly services',
              amount: Number(formData.monthlyPay),
            },
          ],
          // Skip AI, use simple template
          packages: [{
            name: 'Standard',
            price: Number(formData.monthlyPay),
            description: 'Monthly services payment',
            features: ['Guaranteed monthly payment', 'Secure auto-debit', 'Cancel anytime'],
            isRecommended: true,
          }],
          paymentPlans: [{
            type: 'full',
            deposit: Number(formData.monthlyPay),
            total: Number(formData.monthlyPay),
          }],
        }),
      });

      if (!res.ok) throw new Error('Failed to create job');

      const data = await res.json();
      if (data?.quote) {
        const url = `${window.location.origin}/q/accept/${data.quote.slug}`;
        setShareUrl(url);
      }
    } catch (err) {
      console.error(err);
      alert('Could not create job. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const shareViaWhatsApp = () => {
    if (!shareUrl) return;
    const message = encodeURIComponent(
      `Hi! I'd like to work for you. Please approve my payment request:\n\n${shareUrl}`
    );
    window.open(`https://wa.me/${formData.employerPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (shareUrl) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-6">
        <Card className="bg-feather-green/5 border-feather-green/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-feather-green flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-eel-black">Payment Request Ready!</h2>
              <p className="text-wolf-grey font-bold">Send this to {formData.employerName}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-hare-grey">
            <div className="text-xs font-bold text-wolf-grey uppercase mb-2">Payment Request Link</div>
            <div className="font-mono text-sm text-eel-black break-all">{shareUrl}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={shareViaWhatsApp}
              className="bg-feather-green border-feather-green"
            >
              📱 Send via WhatsApp
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied!');
              }}
            >
              📋 Copy Link
            </Button>
          </div>

          <Button variant="ghost" fullWidth onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-feather-green" />
          <h1 className="text-3xl font-extrabold text-eel-black">Add New Employer</h1>
        </div>
        <p className="text-wolf-grey font-bold">Set up automatic monthly payments</p>
      </div>

      <Card className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Input
            label="Employer Name"
            placeholder="e.g. Mrs. Johnson"
            value={formData.employerName}
            onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+254712345678"
            type="tel"
            value={formData.employerPhone}
            onChange={(e) => setFormData({ ...formData, employerPhone: e.target.value })}
          />
        </div>

        <Input
          label="Monthly Pay"
          placeholder="e.g. 200"
          type="number"
          value={formData.monthlyPay}
          onChange={(e) => setFormData({ ...formData, monthlyPay: e.target.value })}
        />

        <div className="space-y-2">
          <label className="block text-sm font-bold text-wolf-grey uppercase tracking-wide ml-1">
            Payment Day of Month
          </label>
          <select
            value={formData.paymentDay}
            onChange={(e) => setFormData({ ...formData, paymentDay: e.target.value })}
            className="w-full p-4 rounded-xl border-2 border-hare-grey bg-swan-white text-eel-black font-bold outline-none transition-colors focus:border-macaw-blue focus:bg-macaw-blue/5"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>
                {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of every month
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreate}
            disabled={isSaving || !formData.employerName || !formData.monthlyPay}
            className="bg-feather-green border-feather-green hover:bg-feather-green-active"
          >
            {isSaving ? 'Creating...' : 'Create Payment Request'}
          </Button>
        </div>
      </Card>

      <Card className="bg-macaw-blue/5 border-macaw-blue/20">
        <div className="text-sm font-bold text-macaw-blue">💡 How it works</div>
        <ol className="text-sm text-wolf-grey font-bold space-y-2 mt-3">
          <li>1. Create payment request</li>
          <li>2. Send to employer via WhatsApp</li>
          <li>3. They approve and set up auto-payment</li>
          <li>4. Get paid automatically every month!</li>
        </ol>
      </Card>
    </div>
  );
}
