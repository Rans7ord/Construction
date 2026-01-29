'use client';

import { Card } from '@/components/ui/card';

interface ProfitOverviewProps {
  totalIncome: number;
  totalSpent: number;
  profit: number;
  remaining: number;
}

export default function ProfitOverview({
  totalIncome,
  totalSpent,
  profit,
  remaining,
}: ProfitOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 rounded-lg bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
        <p className="text-xs text-muted-foreground mb-1 font-medium">Total Income/Contract</p>
        <p className="text-2xl font-bold text-green-600">
          ₵{(totalIncome / 1000).toFixed(1)}K
        </p>
        <p className="text-xs text-muted-foreground mt-2">From all payments</p>
      </Card>

      <Card className="p-4 rounded-lg bg-gradient-to-br from-orange-500/5 to-orange-500/10 border border-orange-500/20">
        <p className="text-xs text-muted-foreground mb-1 font-medium">Total Spent/Expenditure</p>
        <p className="text-2xl font-bold text-orange-600">
          ₵{(totalSpent / 1000).toFixed(1)}K
        </p>
        <p className="text-xs text-muted-foreground mt-2">All expenses</p>
      </Card>

      <Card className="p-4 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-muted-foreground mb-1 font-medium">Profit (10%)</p>
        <p className="text-2xl font-bold text-blue-600">
          ₵{(profit / 1000).toFixed(1)}K
        </p>
        <p className="text-xs text-muted-foreground mt-2">10% of total income</p>
      </Card>

      <Card className={`p-4 rounded-lg border ${
        remaining >= 0
          ? 'bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20'
          : 'bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20'
      }`}>
        <p className="text-xs text-muted-foreground mb-1 font-medium">Budget Remaining</p>
        <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          ₵{(remaining / 1000).toFixed(1)}K
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {remaining >= 0 ? 'Available budget' : 'Budget exceeded'}
        </p>
      </Card>
    </div>
  );
}
