import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency, getBalanceColor } from '@/utils/format';
import type { MemberBalance } from '@/types';

interface MemberListProps {
  members: MemberBalance[];
  currentUserId?: string;
}

export function MemberList({ members, currentUserId }: MemberListProps) {
  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <Avatar name={member.name} src={member.profilePicture} />
            <div>
              <p className="font-medium text-gray-900">
                {member.name}
                {member.id === currentUserId && (
                  <span className="text-gray-500 font-normal"> (you)</span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${getBalanceColor(member.balance)}`}>
              {member.balance === 0 ? 'Settled' : formatCurrency(Math.abs(member.balance))}
            </p>
            {member.balance !== 0 && (
              <p className="text-xs text-gray-500">
                {member.balance > 0 ? 'gets back' : 'owes'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
