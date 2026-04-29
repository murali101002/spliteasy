import { Spinner } from '@/components/ui/Spinner';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
