"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUser } from '@clerk/nextjs';
import { useStore, type Quote } from '@/lib/store';
import { Zap, DollarSign, FileText, Hourglass, Bird } from 'lucide-react';
import { toast } from 'sonner';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { WorkerDashboard } from '@/components/worker/WorkerDashboard';

export default function DashboardPage() {
  const { user } = useUser();
  const quotes = useStore((state) => state.quotes);
  const setQuotes = useStore((state) => state.setQuotes);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [contracts, setContracts] = useState<any[]>([]);

  const renderRetainer = (quote: Quote) => {
    if (!quote.retainerStatus || quote.retainerStatus === 'none') return null;
    const labelMap: Record<string, string> = {
      pending: 'Retainer Pending',
      active: 'Retainer Active',
      past_due: 'Retainer Past Due',
      canceled: 'Retainer Canceled',
    };
    const colorMap: Record<string, string> = {
      pending: 'bg-bee-yellow/20 text-bee-yellow',
      active: 'bg-feather-green/20 text-feather-green',
      past_due: 'bg-cardinal-red/10 text-cardinal-red',
      canceled: 'bg-wolf-grey/10 text-wolf-grey',
    };
    const label = labelMap[quote.retainerStatus] || quote.retainerStatus;
    const color = colorMap[quote.retainerStatus] || 'bg-hare-grey text-eel-black';
    return (
      <div className={`text-xs font-extrabold uppercase px-2 py-1 rounded-full inline-flex items-center gap-1 ${color}`}>
        <span>🔁</span> {label}
      </div>
    );
  };

  // Load user settings to check userType
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data?.settings?.userType) {
            setUserType(data.settings.userType);
          }
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadQuotes = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const res = await fetch('/api/quotes', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch quotes');
        const data = await res.json();
        if (isMounted && data?.quotes) {
          setQuotes(data.quotes);
          // Filter for contracts (mode = 'salary')
          const workerContracts = data.quotes
            .filter((q: Quote) => q.mode === 'salary')
            .map((q: Quote) => ({
              id: q.id,
              employerName: q.clientName,
              amount: q.totalAmount || 0,
              status: q.retainerStatus || 'pending',
              nextPaymentDate: new Date(),
              currency: q.currency || 'USD',
            }));
          setContracts(workerContracts);
        }
      } catch (error) {
        console.error('Failed to load quotes', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadQuotes();
    return () => {
      isMounted = false;
    };
  }, [user?.id, setQuotes]);

  const activeQuotes = quotes.filter((q) => q.status === 'Sent' || q.status === 'Viewed').length;
  const drafts = quotes.filter((q) => q.status === 'Draft').length;
  const pendingRevenue = quotes
    .filter((q) => q.status !== 'Draft' && q.status !== 'Paid')
    .reduce((acc, q) => acc + (q.totalAmount || 0), 0);

  // Derived Data for Charts/Lists
  const uniqueClients = Array.from(new Set(quotes.map(q => q.clientName))).length;
  const recentClients = Array.from(new Set(quotes.map(q => q.clientName))).slice(0, 5);

  // Simple Revenue Chart Data (Mock distribution for visual)

  // Show worker dashboard if user is a worker
  if (userType === 'worker') {
    return <WorkerDashboard contracts={contracts} userName={user?.firstName || 'there'} />;
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-eel-black">Dashboard</h1>
          <p className="text-wolf-grey font-bold">Welcome back, {user?.firstName || 'Guest'}!</p>
        </div>
        <Link href="/create">
          <Button variant="primary" size="lg">
            <span className="mr-2">➕</span> New Quote
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-feather-green text-white border-feather-green shadow-btn shadow-feather-green-active transform hover:-translate-y-1 transition-transform duration-200">
          <div className="text-5xl font-extrabold mb-2">{activeQuotes}</div>
          <div className="font-bold opacity-90 uppercase tracking-wide text-sm flex items-center gap-2">
            <Zap className="w-5 h-5" /> Active Quotes
          </div>
        </Card>
        <Card className="bg-macaw-blue text-white border-macaw-blue shadow-btn shadow-macaw-blue-active transform hover:-translate-y-1 transition-transform duration-200">
          <div className="text-5xl font-extrabold mb-2">${pendingRevenue.toLocaleString()}</div>
          <div className="font-bold opacity-90 uppercase tracking-wide text-sm flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Pending Revenue
          </div>
        </Card>
        <Card className="bg-fox-orange text-white border-fox-orange shadow-btn shadow-fox-orange-active transform hover:-translate-y-1 transition-transform duration-200">
          <div className="text-5xl font-extrabold mb-2">{drafts}</div>
          <div className="font-bold opacity-90 uppercase tracking-wide text-sm flex items-center gap-2">
            <FileText className="w-5 h-5" /> Drafts
          </div>
        </Card>
        <Card className="bg-bee-yellow text-white border-bee-yellow shadow-btn shadow-bee-yellow-active transform hover:-translate-y-1 transition-transform duration-200">
          <div className="text-5xl font-extrabold mb-2">{uniqueClients}</div>
          <div className="font-bold opacity-90 uppercase tracking-wide text-sm flex items-center gap-2">
            <Bird className="w-5 h-5" /> Total Clients
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-extrabold text-eel-black uppercase tracking-wide ml-1">Recent Activity</h2>
          {quotes.length > 0 ? (
            <div className="grid gap-4">
              {quotes.map((quote) => (
                <Link key={quote.id} href={`/quotes/${quote.id}`} className="block">
                  <Card hoverable className="flex items-center justify-between p-4 group cursor-pointer transition-all hover:border-macaw-blue">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border-b-4 transition-transform group-hover:scale-110 ${quote.status === 'Draft'
                          ? 'bg-hare-grey text-wolf-grey border-wolf-grey/20'
                          : 'bg-bee-yellow text-white border-bee-yellow-active'
                          }`}
                      >
                        {quote.clientName[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl text-eel-black group-hover:text-macaw-blue transition-colors">{quote.projectTitle}</h3>
                        <p className="text-wolf-grey text-sm font-bold">{quote.clientName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-xl text-eel-black">
                        {quote.totalAmount ? `$${quote.totalAmount.toLocaleString()}` : '-'}
                      </div>
                      <div className="flex flex-col items-end gap-2 mt-1">
                        <div className="flex items-center gap-3">
                          <div className="text-wolf-grey text-xs font-bold uppercase tracking-wide">
                            {quote.status} • {new Date(quote.createdAt).toLocaleDateString()}
                          </div>
                          {quote.views && quote.views > 0 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-macaw-blue bg-macaw-blue/10 px-2 py-0.5 rounded-full">
                              <span className="text-lg">👀</span> {quote.views}
                            </div>
                          )}
                        </div>
                        {renderRetainer(quote)}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-macaw-blue hover:bg-macaw-blue/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = `${window.location.origin}/q/${quote.slug}`;
                            navigator.clipboard.writeText(url).then(() => {
                              toast.success('Link copied to clipboard!');
                            }).catch(console.error);
                          }}
                        >
                          🔗 Copy Link
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-16 border-dashed border-4 border-hare-grey bg-swan-white/50">
              <div className="flex justify-center mb-6">
                {isLoading ? (
                  <Hourglass className="w-24 h-24 text-macaw-blue animate-spin-slow" />
                ) : (
                  <Bird className="w-24 h-24 text-feather-green animate-bounce" />
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-eel-black mb-2">
                {isLoading ? 'Loading quotes...' : 'Start your streak!'}
              </h3>
              <p className="text-wolf-grey font-bold text-lg mb-8 max-w-md mx-auto">
                Create your first quote to start tracking your freelance empire.
              </p>
              <Link href="/create">
                <Button variant="primary" size="lg" className="animate-pulse">
                  Create Quote
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-eel-black uppercase tracking-wide ml-1">Insights</h2>

          {/* Revenue Chart */}
          <Card className="space-y-4">
            <h3 className="font-extrabold text-eel-black">Revenue Trend</h3>
            <RevenueChart
              data={quotes
                .filter(q => q.totalAmount)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map(q => ({
                  date: new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  amount: q.totalAmount || 0
                }))
              }
            />
          </Card>

          {/* Recent Clients */}
          <Card className="space-y-4">
            <h3 className="font-extrabold text-eel-black">Recent Clients</h3>
            <div className="space-y-3">
              {recentClients.map((client, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-hare-grey/20 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-full bg-bee-yellow/20 text-bee-yellow flex items-center justify-center font-bold text-sm">
                    {client[0]}
                  </div>
                  <span className="font-bold text-eel-black text-sm">{client}</span>
                </div>
              ))}
              {recentClients.length === 0 && (
                <div className="text-wolf-grey font-bold text-sm">No clients yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
