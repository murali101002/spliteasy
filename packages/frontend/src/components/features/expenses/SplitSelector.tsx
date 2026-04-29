import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/format';
import type { MemberBalance } from '@/types';

interface SplitSelectorProps {
  splitType: 'EQUAL' | 'EXACT';
  onSplitTypeChange: (type: 'EQUAL' | 'EXACT') => void;
  members: MemberBalance[];
  selectedMembers: string[];
  onToggleMember: (memberId: string) => void;
  exactAmounts: Record<string, string>;
  onExactAmountChange: (memberId: string, value: string) => void;
  amount: string;
  errors: Record<string, string>;
  calculateEqualShare: () => number;
}

export function SplitSelector({
  splitType,
  onSplitTypeChange,
  members,
  selectedMembers,
  onToggleMember,
  exactAmounts,
  onExactAmountChange,
  amount,
  errors,
  calculateEqualShare,
}: SplitSelectorProps) {
  return (
    <>
      <div>
        <label className="label">Split type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSplitTypeChange('EQUAL')}
            className={`flex-1 py-2 px-4 rounded-lg border ${
              splitType === 'EQUAL'
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-gray-300'
            }`}
          >
            Equal
          </button>
          <button
            type="button"
            onClick={() => onSplitTypeChange('EXACT')}
            className={`flex-1 py-2 px-4 rounded-lg border ${
              splitType === 'EXACT'
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-gray-300'
            }`}
          >
            Exact amounts
          </button>
        </div>
      </div>

      {splitType === 'EQUAL' ? (
        <div>
          <label className="label">Split between</label>
          {errors.members && <p className="text-sm text-red-600 mb-2">{errors.members}</p>}
          <div className="space-y-2">
            {members.map((member) => (
              <label
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => onToggleMember(member.id)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span>{member.name}</span>
                </div>
                {selectedMembers.includes(member.id) && amount && (
                  <span className="text-sm text-gray-500">
                    {formatCurrency(calculateEqualShare())}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <label className="label">Amount per person</label>
          {errors.exact && <p className="text-sm text-red-600 mb-2">{errors.exact}</p>}
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="flex-1">{member.name}</span>
                <div className="w-24">
                  <Input
                    type="number"
                    value={exactAmounts[member.id] || ''}
                    onChange={(e) => onExactAmountChange(member.id, e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
