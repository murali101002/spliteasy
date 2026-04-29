import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/api/auth';
import { validateName } from '@/utils/validation';
import toast from 'react-hot-toast';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    setIsLoading(true);

    try {
      const updated = await updateProfile({
        name,
        profilePicture: profilePicture || null,
      });
      updateUser(updated);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <Header title="Profile" />

      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center">
          <Avatar name={user?.name || ''} src={user?.profilePicture} size="lg" />
          <p className="mt-2 text-lg font-medium">{user?.name}</p>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />

          <Input
            label="Profile Picture URL"
            type="url"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Save changes
          </Button>
        </form>

        <div className="pt-4 border-t">
          <Button variant="ghost" onClick={handleLogout} className="w-full text-red-600">
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
