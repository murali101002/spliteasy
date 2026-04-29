import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { formatCurrency, getBalanceColor } from '@/utils/format';
import type { GroupListItem } from '@/types';

interface GroupCardProps {
  group: GroupListItem;
}

export function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate();

  return (
    <Card onClick={() => navigate(`/groups/${group.id}`)} className="hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{group.name}</h3>
          <p className="text-sm text-gray-500">{group.memberCount} members</p>
        </div>
        <div className="text-right">
          <p className={`font-medium ${getBalanceColor(group.myBalance)}`}>
            {group.myBalance === 0 ? 'Settled' : formatCurrency(Math.abs(group.myBalance))}
          </p>
          {group.myBalance !== 0 && (
            <p className="text-xs text-gray-500">
              {group.myBalance > 0 ? 'you are owed' : 'you owe'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
