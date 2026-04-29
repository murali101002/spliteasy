import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const getMessage = () => {
    if (balance > 0) return 'You are owed';
    if (balance < 0) return 'You owe';
    return 'All settled up';
  };

  return (
    <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
      <p className="text-primary-100 text-sm">{getMessage()}</p>
      <p className={`text-3xl font-bold mt-1 ${balance === 0 ? '' : 'text-white'}`}>
        {balance === 0 ? 'Nice!' : formatCurrency(Math.abs(balance))}
      </p>
    </Card>
  );
}
