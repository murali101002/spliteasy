import { Header } from '@/components/layout/Header';
import { BalanceCard } from '@/components/features/dashboard/BalanceCard';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';
import { GroupCard } from '@/components/features/groups/GroupCard';
import { Spinner } from '@/components/ui/Spinner';
import { useUserBalance, useGroups } from '@/hooks/useGroups';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const { data: balanceData, isLoading: balanceLoading } = useUserBalance();
  const { data: groups, isLoading: groupsLoading } = useGroups();

  const recentGroups = groups?.slice(0, 3) || [];

  return (
    <div>
      <Header title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`} />

      <div className="p-4 space-y-6">
        {balanceLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <BalanceCard balance={balanceData?.totalBalance || 0} />
        )}

        <QuickActions />

        <div>
          <h2 className="text-lg font-semibold mb-3">Recent groups</h2>
          {groupsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : recentGroups.length > 0 ? (
            <div className="space-y-3">
              {recentGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No groups yet</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Recent activity</h2>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
