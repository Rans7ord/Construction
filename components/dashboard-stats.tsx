'use client';

import { Card } from './ui/card';
import { DollarSign, TrendingDown, TrendingUp, Briefcase } from 'lucide-react';

interface DashboardStatsProps {
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  remaining: number;
  projectCount: number;
}

export function DashboardStats({
  totalBudget,
  totalSpent,
  totalIncome,
  remaining,
  projectCount,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Budget',
      value: totalBudget,
      icon: DollarSign,
      color: 'from-primary to-primary/50',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
    },
    {
      label: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      color: 'from-green-500 to-green-500/50',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Expenses',
      value: totalSpent,
      icon: TrendingDown,
      color: 'from-orange-500 to-orange-500/50',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-600',
    },
    {
      label: 'Remaining Budget',
      value: remaining,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-500/50',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            className="border-border/50 hover:border-primary/30 transition overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">
                    ₵{(stat.value / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
