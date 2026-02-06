'use client';

import { MoneyIn } from '@/lib/store';
import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { MoneyInModal } from './money-in-modal';
import { formatDate } from '@/lib/date-utils';

interface MoneyInSectionProps {
  projectId: string;
  moneyIn: MoneyIn[];
}

export function MoneyInSection({ projectId, moneyIn }: MoneyInSectionProps) {
  const { user } = useAuth();
  const { deleteMoneyIn } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingMoney, setEditingMoney] = useState<MoneyIn | null>(null);

  const total = moneyIn.reduce((sum, m) => sum + m.amount, 0);

  const handleEdit = (money: MoneyIn) => {
    setEditingMoney(money);
    setShowModal(true);
  };

  const handleDelete = (moneyId: string) => {
    if (confirm('Are you sure you want to delete this income?')) {
      deleteMoneyIn(moneyId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Budget Allocation (Money In)</h3>
        {user?.role === 'admin' && (
          <Button
            onClick={() => {
              setEditingMoney(null);
              setShowModal(true);
            }}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </Button>
        )}
      </div>

      <Card className="p-6 border-border/50 bg-gradient-to-br from-green-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Income Received</p>
            <p className="text-4xl font-bold text-green-600">₵{(total / 1000).toFixed(1)}K</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{moneyIn.length} transactions</p>
          </div>
        </div>
      </Card>

      {moneyIn.length === 0 ? (
        <Card className="p-8 text-center border-border/50">
          <p className="text-muted-foreground">No income recorded yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {moneyIn
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((money) => (
              <Card
                key={money.id}
                className="p-4 hover:shadow-md transition border-border/50 hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{money.description}</h4>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>📅 {formatDate(money.date)}</span>
                      <span>📄 {money.reference}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      +₵{(money.amount / 1000).toFixed(1)}K
                    </p>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(money)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(money.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}

      <MoneyInModal
        open={showModal}
        onOpenChange={setShowModal}
        projectId={projectId}
        moneyIn={editingMoney}
      />
    </div>
  );
}
