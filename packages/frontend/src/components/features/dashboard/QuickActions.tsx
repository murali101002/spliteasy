import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add expense',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: () => navigate('/groups'),
    },
    {
      label: 'Create group',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: () => navigate('/groups/new'),
    },
  ];

  return (
    <div className="flex gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="flex-1 flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
            {action.icon}
          </div>
          <span className="text-sm font-medium text-gray-700">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
