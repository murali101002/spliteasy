import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { useJoinGroup } from '@/hooks/useGroups';
import { useAuth } from '@/contexts/AuthContext';

export function JoinGroup() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const joinGroup = useJoinGroup();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      sessionStorage.setItem('pendingInvite', inviteCode || '');
      navigate('/login');
      return;
    }

    if (inviteCode && !joinGroup.isPending && !joinGroup.isSuccess && !joinGroup.isError) {
      joinGroup.mutate(inviteCode, {
        onSuccess: (data) => {
          navigate(`/groups/${data.id}`);
        },
        onError: () => {
          navigate('/groups');
        },
      });
    }
  }, [inviteCode, isAuthenticated, authLoading, joinGroup, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Joining group...</p>
      </div>
    </div>
  );
}
