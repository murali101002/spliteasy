import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface InviteLinkProps {
  inviteLink: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function InviteLink({ inviteLink, onRegenerate, isRegenerating }: InviteLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={inviteLink}
          className="input flex-1 bg-gray-50 text-sm"
        />
        <Button onClick={handleCopy} variant="secondary">
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Generate new link
        </button>
      )}
    </div>
  );
}
