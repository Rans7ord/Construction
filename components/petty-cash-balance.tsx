import { Card } from './ui/card';
import { ArrowUp, ArrowDown, Wallet } from 'lucide-react';

interface PettyCashBalanceProps {
  balance: {
    balance: number;
    totalInflow: number;
    totalOutflow: number;
  };
}

export function PettyCashBalance({ balance }: PettyCashBalanceProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {/* Total Balance */}
      <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
            <p className="text-4xl font-bold text-foreground">
              ${balance.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <Wallet className="w-12 h-12 text-primary/60" />
        </div>
      </Card>

      {/* Total Inflow */}
      <Card className="p-6 border-border/50 bg-gradient-to-br from-green-500/10 to-green-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Inflow</p>
            <p className="text-4xl font-bold text-green-600">
              ${balance.totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <ArrowUp className="w-12 h-12 text-green-600/60" />
        </div>
      </Card>

      {/* Total Outflow */}
      <Card className="p-6 border-border/50 bg-gradient-to-br from-red-500/10 to-red-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Outflow</p>
            <p className="text-4xl font-bold text-red-600">
              ${balance.totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <ArrowDown className="w-12 h-12 text-red-600/60" />
        </div>
      </Card>
    </div>
  );
}
