import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { GroupList } from '@/components/features/groups/GroupList';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useGroups } from '@/hooks/useGroups';

export function Groups() {
  const navigate = useNavigate();
  const { data: groups, isLoading } = useGroups();

  return (
    <div>
      <Header
        title="Groups"
        action={
          <Button size="sm" onClick={() => navigate('/groups/new')}>
            New
          </Button>
        }
      />

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <GroupList groups={groups || []} />
        )}
      </div>
    </div>
  );
}
