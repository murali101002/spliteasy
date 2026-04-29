import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SplitSelector } from '@/components/features/expenses/SplitSelector';
import { validateExpenseDescription, validateAmount } from '@/utils/validation';
import { formatCurrency } from '@/utils/format';
import type { MemberBalance, CreateExpenseInput } from '@/types';

interface ExpenseFormProps {
  members: MemberBalance[];
  currentUserId: string;
  onSubmit: (data: CreateExpenseInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateExpenseInput>;
}

export function ExpenseForm({
  members,
  currentUserId,
  onSubmit,
  onCancel,
  isLoading,
  initialData,
}: ExpenseFormProps) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [paidById, setPaidById] = useState(initialData?.paidById || currentUserId);
  const [splitType, setSplitType] = useState<'EQUAL' | 'EXACT'>(initialData?.splitType || 'EQUAL');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialData?.splitWith || members.map((m) => m.id)
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData?.shares) {
      const amounts: Record<string, string> = {};
      for (const share of initialData.shares) {
        amounts[share.userId] = share.amount.toString();
      }
      setExactAmounts(amounts);
    }
  }, [initialData?.shares]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleExactAmountChange = (memberId: string, value: string) => {
    setExactAmounts((prev) => ({ ...prev, [memberId]: value }));
  };

  const calculateEqualShare = () => {
    if (!amount || selectedMembers.length === 0) return 0;
    return parseFloat(amount) / selectedMembers.length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    const descError = validateExpenseDescription(description);
    if (descError) newErrors.description = descError;

    const amountError = validateAmount(amount);
    if (amountError) newErrors.amount = amountError;

    if (splitType === 'EQUAL' && selectedMembers.length === 0) {
      newErrors.members = 'Select at least one member';
    }

    if (splitType === 'EXACT') {
      const total = Object.values(exactAmounts).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      if (Math.abs(total - parseFloat(amount)) > 0.01) {
        newErrors.exact = `Amounts must equal ${formatCurrency(parseFloat(amount))} (current: ${formatCurrency(total)})`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: CreateExpenseInput = {
      description,
      amount: parseFloat(amount),
      paidById,
      splitType,
    };

    if (splitType === 'EQUAL') {
      data.splitWith = selectedMembers;
    } else {
      data.shares = Object.entries(exactAmounts)
        .filter(([, val]) => parseFloat(val) > 0)
        .map(([userId, val]) => ({
          userId,
          amount: parseFloat(val),
        }));
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        placeholder="What's this for?"
        maxLength={100}
      />

      <Input
        type="number"
        label="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        placeholder="0.00"
        step="0.01"
        min="0"
      />

      <div>
        <label className="label">Paid by</label>
        <select
          value={paidById}
          onChange={(e) => setPaidById(e.target.value)}
          className="input"
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} {member.id === currentUserId && '(you)'}
            </option>
          ))}
        </select>
      </div>

      <SplitSelector
        splitType={splitType}
        onSplitTypeChange={setSplitType}
        members={members}
        selectedMembers={selectedMembers}
        onToggleMember={toggleMember}
        exactAmounts={exactAmounts}
        onExactAmountChange={handleExactAmountChange}
        amount={amount}
        errors={errors}
        calculateEqualShare={calculateEqualShare}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Save
        </Button>
      </div>
    </form>
  );
}
