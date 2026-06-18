import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center">
              <Heart size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-primary-800">
              Health<span className="text-secondary-500">AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-primary-800 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-primary-800 transition-colors">How it Works</a>
            <a href="#benefits" className="text-sm text-slate-600 hover:text-primary-800 transition-colors">Benefits</a>
          </div>
          <Link to="/login" className="px-5 py-2 bg-secondary-500 text-white text-sm font-medium rounded-lg hover:bg-secondary-600 transition-all duration-200 shadow-sm">
            Login to Platform
          </Link>
        </div>
      </div>
    </nav>
  );
}
