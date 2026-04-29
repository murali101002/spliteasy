import { useNavigate } from 'react-router-dom';
import { type ReactNode } from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  action?: ReactNode;
}

export function Header({ title, showBack = false, action }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {action}
      </div>
    </header>
  );
}
