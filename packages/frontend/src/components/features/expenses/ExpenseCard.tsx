import { formatCurrency, formatRelativeDate } from '@/utils/format';
import type { Expense } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
  onClick?: () => void;
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 bg-white rounded-lg border border-gray-100 ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      } ${expense.isDeleted ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`font-medium text-gray-900 ${expense.isDeleted ? 'line-through' : ''}`}>
            {expense.description}
          </p>
          <p className="text-sm text-gray-500">
            Paid by {expense.paidBy.name} · {formatRelativeDate(expense.createdAt)}
          </p>
        </div>
        <p className={`font-medium ${expense.isDeleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {formatCurrency(expense.amount)}
        </p>
      </div>
      {expense.isDeleted && (
        <p className="text-xs text-red-500 mt-1">Deleted</p>
      )}
    </div>
  );
}
