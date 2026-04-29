import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';
import { ExpenseForm } from '@/components/features/expenses/ExpenseForm';
import { MemberList } from '@/components/features/groups/MemberList';
import { InviteLink } from '@/components/features/groups/InviteLink';
import { SettleSuggestions } from '@/components/features/settlements/SettleSuggestions';
import { SettlementList } from '@/components/features/settlements/SettlementList';
import { RecordPaymentForm } from '@/components/features/settlements/RecordPaymentForm';
import { useGroup, useLeaveGroup, useRegenerateInvite } from '@/hooks/useGroups';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { useSettleSuggestions, useSettlements, useCreateSettlement } from '@/hooks/useSettlements';
import { useAuth } from '@/contexts/AuthContext';
import type { Expense, SettleSuggestion, CreateExpenseInput } from '@/types';
import toast from 'react-hot-toast';

type Tab = 'expenses' | 'balances' | 'settle';

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SettleSuggestion | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data: group, isLoading: groupLoading } = useGroup(id!);
  const { data: expensesData, isLoading: expensesLoading } = useExpenses(id!);
  const { data: suggestions, isLoading: suggestionsLoading } = useSettleSuggestions(id!);
  const { data: settlements, isLoading: settlementsLoading } = useSettlements(id!);

  const createExpense = useCreateExpense(id!);
  const updateExpense = useUpdateExpense(id!);
  const deleteExpense = useDeleteExpense(id!);
  const createSettlement = useCreateSettlement(id!);
  const leaveGroup = useLeaveGroup();
  const regenerateInvite = useRegenerateInvite();

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Group not found</p>
        <Button onClick={() => navigate('/groups')} className="mt-4">
          Back to groups
        </Button>
      </div>
    );
  }

  const handleCreateExpense = (data: CreateExpenseInput) => {
    if (selectedExpense) {
      updateExpense.mutate(
        { expenseId: selectedExpense.id, input: data },
        {
          onSuccess: () => {
            setShowExpenseModal(false);
            setSelectedExpense(null);
          },
        }
      );
    } else {
      createExpense.mutate(data, {
        onSuccess: () => {
          setShowExpenseModal(false);
          setSelectedExpense(null);
        },
      });
    }
  };

  const handleExpenseClick = (expense: Expense) => {
    if (expense.isDeleted) return;
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = () => {
    if (!selectedExpense) return;
    deleteExpense.mutate(selectedExpense.id, {
      onSuccess: () => {
        setShowExpenseModal(false);
        setSelectedExpense(null);
      },
    });
  };

  const handleRecordPayment = (suggestion: SettleSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (toUserId: string, amount: number) => {
    createSettlement.mutate(
      { toUserId, amount },
      {
        onSuccess: () => {
          setShowPaymentModal(false);
          setSelectedSuggestion(null);
        },
      }
    );
  };

  const handleLeaveGroup = () => {
    const myBalance = group.members.find((m) => m.id === user?.id)?.balance || 0;
    if (Math.abs(myBalance) > 0.01) {
      toast.error('You must settle your balance before leaving');
      return;
    }
    leaveGroup.mutate(id!, {
      onSuccess: () => {
        navigate('/groups');
      },
    });
    setShowMenuModal(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'expenses', label: 'Expenses' },
    { key: 'balances', label: 'Balances' },
    { key: 'settle', label: 'Settle' },
  ];

  return (
    <div>
      <Header
        title={group.name}
        showBack
        action={
          <button
            onClick={() => setShowMenuModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        }
      />

      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'expenses' && (
          <>
            {expensesLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : (
              <ExpenseList
                expenses={expensesData?.expenses || []}
                onExpenseClick={handleExpenseClick}
              />
            )}
            <button
              onClick={() => {
                setSelectedExpense(null);
                setShowExpenseModal(true);
              }}
              className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </>
        )}

        {activeTab === 'balances' && (
          <MemberList members={group.members} currentUserId={user?.id} />
        )}

        {activeTab === 'settle' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Suggested payments</h3>
              {suggestionsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <SettleSuggestions
                  suggestions={suggestions || []}
                  currentUserId={user?.id || ''}
                  onRecordPayment={handleRecordPayment}
                />
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Payment history</h3>
              {settlementsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <SettlementList
                  settlements={settlements || []}
                  currentUserId={user?.id || ''}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setSelectedExpense(null);
        }}
        title={selectedExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          members={group.members}
          currentUserId={user?.id || ''}
          onSubmit={handleCreateExpense}
          onCancel={() => {
            setShowExpenseModal(false);
            setSelectedExpense(null);
          }}
          isLoading={selectedExpense ? updateExpense.isPending : createExpense.isPending}
          initialData={
            selectedExpense
              ? {
                  description: selectedExpense.description,
                  amount: selectedExpense.amount,
                  paidById: selectedExpense.paidBy.id,
                  splitType: selectedExpense.splitType,
                  splitWith: selectedExpense.shares.map((s) => s.userId),
                  shares: selectedExpense.shares.map((s) => ({
                    userId: s.userId,
                    amount: s.amount,
                  })),
                }
              : undefined
          }
        />
        {selectedExpense && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="danger"
              onClick={handleDeleteExpense}
              isLoading={deleteExpense.isPending}
              className="w-full"
            >
              Delete expense
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedSuggestion(null);
        }}
        title="Record Payment"
      >
        <RecordPaymentForm
          members={group.members}
          currentUserId={user?.id || ''}
          onSubmit={handlePaymentSubmit}
          onCancel={() => {
            setShowPaymentModal(false);
            setSelectedSuggestion(null);
          }}
          isLoading={createSettlement.isPending}
          initialToUserId={selectedSuggestion?.to.id}
          initialAmount={selectedSuggestion?.amount}
        />
      </Modal>

      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Link"
      >
        <InviteLink
          inviteLink={group.inviteLink}
          onRegenerate={() => regenerateInvite.mutate(id!)}
          isRegenerating={regenerateInvite.isPending}
        />
      </Modal>

      <Modal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        title="Group Options"
      >
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowMenuModal(false);
              setShowInviteModal(true);
            }}
            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share invite link
          </button>
          <button
            onClick={handleLeaveGroup}
            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-red-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave group
          </button>
        </div>
      </Modal>
    </div>
  );
}
