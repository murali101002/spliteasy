import { ExpenseCard } from './ExpenseCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Expense } from '@/types';

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseClick?: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onExpenseClick }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title="No expenses yet"
        description="Add your first expense to start tracking."
      />
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onClick={onExpenseClick ? () => onExpenseClick(expense) : undefined}
        />
      ))}
    </div>
  );
}
