import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const baseClasses = 'card p-4';
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';

  return (
    <div className={`${baseClasses} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
