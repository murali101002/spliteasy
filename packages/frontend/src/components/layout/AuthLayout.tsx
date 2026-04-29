import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">$</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SplitEasy</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
