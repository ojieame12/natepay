'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Users, DollarSign, Calendar } from 'lucide-react';

interface Contract {
  id: string;
  employerName: string;
  amount: number;
  status: string;
  nextPaymentDate: Date;
  currency: string;
}

interface WorkerDashboardProps {
  contracts: Contract[];
  userName: string;
}

export function WorkerDashboard({ contracts, userName }: WorkerDashboardProps) {
  const activeContracts = contracts.filter(c => c.status === 'active');
  const monthlyIncome = activeContracts.reduce((sum, c) => sum + c.amount, 0);
  const nextPayment = contracts
    .filter(c => c.status === 'active')
    .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())[0];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-eel-black">Your Employers</h1>
          <p className="text-wolf-grey font-bold">Welcome back, {userName}!</p>
        </div>
        <Link href="/create/job">
          <Button variant="primary" size="lg" className="bg-feather-green border-feather-green">
            <span className="mr-2">➕</span> Add Employer
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-feather-green text-white border-feather-green shadow-btn shadow-feather-green-active">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <div className="text-5xl font-extrabold mb-1">{activeContracts.length}</div>
              <div className="font-bold opacity-90 uppercase tracking-wide text-sm">Active Employers</div>
            </div>
          </div>
        </Card>

        <Card className="bg-macaw-blue text-white border-macaw-blue shadow-btn shadow-macaw-blue-active">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8" />
            <div>
              <div className="text-5xl font-extrabold mb-1">${monthlyIncome.toLocaleString()}</div>
              <div className="font-bold opacity-90 uppercase tracking-wide text-sm">Monthly Income</div>
            </div>
          </div>
        </Card>

        <Card className="bg-bee-yellow text-white border-bee-yellow shadow-btn shadow-bee-yellow-active">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <div>
              <div className="text-2xl font-extrabold mb-1">
                {nextPayment ? new Date(nextPayment.nextPaymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
              </div>
              <div className="font-bold opacity-90 uppercase tracking-wide text-sm">Next Payment</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Employer List */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-eel-black uppercase tracking-wide ml-1">Your Employers</h2>

        {contracts.length > 0 ? (
          <div className="grid gap-4">
            {contracts.map((contract) => {
              const statusColors = {
                active: 'bg-feather-green/20 text-feather-green',
                pending: 'bg-bee-yellow/20 text-bee-yellow',
                past_due: 'bg-cardinal-red/10 text-cardinal-red',
                canceled: 'bg-wolf-grey/10 text-wolf-grey',
              };

              return (
                <Card key={contract.id} hoverable className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-feather-green/20 border-b-4 border-feather-green flex items-center justify-center text-2xl font-bold text-feather-green">
                      {contract.employerName[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl text-eel-black">{contract.employerName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-extrabold uppercase px-2 py-1 rounded-full ${statusColors[contract.status as keyof typeof statusColors] || statusColors.active}`}>
                          {contract.status}
                        </span>
                        <span className="text-xs text-wolf-grey font-bold">
                          Next: {new Date(contract.nextPaymentDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-xl text-eel-black">
                      ${contract.amount.toLocaleString()}/mo
                    </div>
                    <div className="text-wolf-grey text-xs font-bold uppercase tracking-wide mt-1">
                      {contract.currency}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16 border-dashed border-4 border-hare-grey bg-swan-white/50">
            <div className="flex justify-center mb-6">
              <Users className="w-24 h-24 text-feather-green" />
            </div>
            <h3 className="text-2xl font-extrabold text-eel-black mb-2">
              No employers yet
            </h3>
            <p className="text-wolf-grey mb-6 font-bold">Add your first employer to start getting paid automatically.</p>
            <Link href="/create/job">
              <Button variant="primary" className="bg-feather-green border-feather-green">
                Add First Employer
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
