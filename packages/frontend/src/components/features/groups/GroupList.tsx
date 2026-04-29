import { GroupCard } from './GroupCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import type { GroupListItem } from '@/types';

interface GroupListProps {
  groups: GroupListItem[];
}

export function GroupList({ groups }: GroupListProps) {
  const navigate = useNavigate();

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        title="No groups yet"
        description="Create a group to start splitting expenses with friends."
        action={
          <Button onClick={() => navigate('/groups/new')}>
            Create Group
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
