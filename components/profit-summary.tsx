'use client';

import { Card } from '@/components/ui/card';
import { useData } from '@/lib/data-context';

interface ProfitSummaryProps {
  projectId: string;
}

export default function ProfitSummary({ projectId }: ProfitSummaryProps) {
  const { state } = useData();

  const project = state.projects.find((p) => p.id === projectId);
  if (!project) return null;

  const projectIncome = state.moneyIn.filter((m) => m.projectId === projectId);
  const projectExpenses = state.expenses.filter((e) => e.projectId === projectId);

  const totalIncome = projectIncome.reduce((sum, m) => sum + m.amount, 0);
  const totalExpenses = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome * 0.1;
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Income/Contract</p>
          <p className="text-2xl font-bold text-green-600">₵{(totalIncome / 1000).toFixed(1)}K</p>
        </div>
      </Card>

      <Card className="p-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Profit (10%)</p>
          <p className="text-2xl font-bold text-blue-600">₵{(profit / 1000).toFixed(1)}K</p>
        </div>
      </Card>

      <Card className="p-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Spent/Expenditure</p>
          <p className="text-2xl font-bold text-orange-600">₵{(totalExpenses / 1000).toFixed(1)}K</p>
        </div>
      </Card>

      <Card className="p-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₵{(netProfit / 1000).toFixed(1)}K
          </p>
        </div>
      </Card>
    </div>
  );
}
