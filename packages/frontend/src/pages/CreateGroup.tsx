import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateGroupName } from '@/utils/validation';
import { useCreateGroup } from '@/hooks/useGroups';

export function CreateGroup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const createGroup = useCreateGroup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateGroupName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    createGroup.mutate(name, {
      onSuccess: (group) => {
        navigate(`/groups/${group.id}`);
      },
    });
  };

  return (
    <div>
      <Header title="Create Group" showBack />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          placeholder="e.g., Roommates, Trip to NYC"
          maxLength={50}
          autoFocus
        />

        <Button type="submit" className="w-full" isLoading={createGroup.isPending}>
          Create group
        </Button>
      </form>
    </div>
  );
}
