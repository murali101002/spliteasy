import { formatCurrency, formatRelativeDate } from '@/utils/format';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Settlement } from '@/types';

interface SettlementListProps {
  settlements: Settlement[];
  currentUserId: string;
}

export function SettlementList({ settlements, currentUserId }: SettlementListProps) {
  if (settlements.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        title="No payments yet"
        description="Recorded payments will appear here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {settlements.map((settlement) => {
        const isPayer = settlement.from.id === currentUserId;
        const isReceiver = settlement.to.id === currentUserId;

        return (
          <div
            key={settlement.id}
            className="p-4 bg-white rounded-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {isPayer ? 'You' : settlement.from.name} paid{' '}
                  {isReceiver ? 'you' : settlement.to.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatRelativeDate(settlement.createdAt)}
                </p>
              </div>
              <p className={`font-medium ${isPayer ? 'text-red-600' : isReceiver ? 'text-green-600' : 'text-gray-900'}`}>
                {isPayer ? '-' : isReceiver ? '+' : ''}
                {formatCurrency(settlement.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
