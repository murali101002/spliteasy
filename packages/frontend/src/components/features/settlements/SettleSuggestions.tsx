import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency } from '@/utils/format';
import { EmptyState } from '@/components/ui/EmptyState';
import type { SettleSuggestion } from '@/types';

interface SettleSuggestionsProps {
  suggestions: SettleSuggestion[];
  currentUserId: string;
  onRecordPayment: (suggestion: SettleSuggestion) => void;
}

export function SettleSuggestions({ suggestions, currentUserId, onRecordPayment }: SettleSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="All settled up!"
        description="Everyone in this group has a zero balance."
      />
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, index) => {
        const isCurrentUserPayer = suggestion.from.id === currentUserId;

        return (
          <div
            key={index}
            className="p-4 bg-white rounded-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={suggestion.from.name} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {isCurrentUserPayer ? 'You' : suggestion.from.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="font-medium">{suggestion.to.name}</span>
                </div>
                <p className="text-lg font-semibold text-primary-600">
                  {formatCurrency(suggestion.amount)}
                </p>
              </div>
            </div>
            {isCurrentUserPayer && (
              <Button
                onClick={() => onRecordPayment(suggestion)}
                size="sm"
                className="w-full"
              >
                Record payment
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
