import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validateAmount } from '@/utils/validation';
import type { MemberBalance } from '@/types';

interface RecordPaymentFormProps {
  members: MemberBalance[];
  currentUserId: string;
  onSubmit: (toUserId: string, amount: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialToUserId?: string;
  initialAmount?: number;
}

export function RecordPaymentForm({
  members,
  currentUserId,
  onSubmit,
  onCancel,
  isLoading,
  initialToUserId,
  initialAmount,
}: RecordPaymentFormProps) {
  const otherMembers = members.filter((m) => m.id !== currentUserId);
  const [toUserId, setToUserId] = useState(initialToUserId || otherMembers[0]?.id || '');
  const [amount, setAmount] = useState(initialAmount?.toString() || '');
  const [error, setError] = useState<string>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountError = validateAmount(amount);
    if (amountError) {
      setError(amountError);
      return;
    }

    if (!toUserId) {
      setError('Select a recipient');
      return;
    }

    onSubmit(toUserId, parseFloat(amount));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Pay to</label>
        <select
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          className="input"
        >
          {otherMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        type="number"
        label="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={error}
        placeholder="0.00"
        step="0.01"
        min="0"
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Record payment
        </Button>
      </div>
    </form>
  );
}
