import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRecentActivity } from '@/hooks/useGroups';
import { formatCurrency, formatRelativeDate } from '@/utils/format';
import { useNavigate } from 'react-router-dom';

export function ActivityFeed() {
  const { data: activities, isLoading } = useRecentActivity(10);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon="receipt"
        title="No activity yet"
        description="Add your first expense to get started"
      />
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <button
          key={activity.id}
          onClick={() => navigate(`/groups/${activity.groupId}`)}
          className="w-full text-left p-3 bg-white rounded-lg border hover:border-primary-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500">
                {activity.groupName}
                {activity.paidBy && ` · paid by ${activity.paidBy}`}
                {' · '}
                {formatRelativeDate(activity.createdAt)}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-900 ml-3 shrink-0">
              {formatCurrency(activity.amount)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
