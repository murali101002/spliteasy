import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="max-w-lg mx-auto px-4 py-12 flex flex-col min-h-screen">
        <header className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-bold text-xl">$</span>
          </div>
          <span className="text-2xl font-bold text-white">SplitEasy</span>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Split expenses with friends, easily
          </h1>
          <p className="text-primary-100 text-lg mb-8">
            Track shared expenses, see who owes what, and settle up with minimal transactions.
          </p>

          <div className="space-y-3">
            <Link to="/register">
              <Button variant="secondary" className="w-full bg-white text-primary-600 hover:bg-gray-100">
                Get started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="w-full text-white hover:bg-primary-600">
                Log in
              </Button>
            </Link>
          </div>
        </main>

        <footer className="text-center text-primary-200 text-sm mt-8">
          Simple. Clean. Fair.
        </footer>
      </div>
    </div>
  );
}
