'use client';

import { Card } from './ui/card';
import { formatAmount } from '@/lib/utils';

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageSpent: number;
}

export function BudgetOverview({
  totalBudget,
  totalSpent,
  remaining,
  percentageSpent,
}: BudgetOverviewProps) {
  return (
    <Card className="p-6 border-border/50">
      <h3 className="text-lg font-semibold mb-6">Budget Overview</h3>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Budget Usage</span>
            <span className="text-sm font-semibold">{percentageSpent.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${Math.min(percentageSpent, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-primary/5">
            <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
            <p className="text-xl font-bold text-primary">{formatAmount(totalBudget)}</p>

          </div>
          <div className="p-3 rounded-lg bg-orange-500/5">
            <p className="text-xs text-muted-foreground mb-1">Spent</p>
            <p className="text-xl font-bold text-orange-600">{formatAmount(totalSpent)}</p>

          </div>
          <div className={`p-3 rounded-lg ${remaining >= 0 ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p
              className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatAmount(remaining)}

            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
