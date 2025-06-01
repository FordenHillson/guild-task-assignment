import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://www.lotkeys.com/uploads/urunler/maplestorymlogolotkeys-yMU3.png.webp" 
                alt="MapleStory M Logo" 
                className="h-8"
              />
              <span className="font-bold text-lg hidden sm:block">MSM Task Manager</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/" 
              className={`flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors ${
                isActive('/') ? 'bg-gray-700 text-white' : 'text-gray-300'
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>            <Link 
              to="/about" 
              className={`flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors ${
                isActive('/about') ? 'bg-gray-700 text-white' : 'text-gray-300'
              }`}
            >
              <Info size={18} />
              <span>About</span>
            </Link>            
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4 border-t border-gray-700">
            <Link 
              to="/"
              className={`block px-4 py-2 rounded-md ${
                isActive('/') ? 'bg-gray-700 text-white' : 'text-gray-300'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Home size={18} />
                <span>Home</span>
              </div>
            </Link>
            <Link 
              to="/about"
              className={`block px-4 py-2 rounded-md mt-1 ${
                isActive('/about') ? 'bg-gray-700 text-white' : 'text-gray-300'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Info size={18} />
                <span>About</span>
              </div>
            </Link>
            <div className="px-4 py-2 mt-1">
              <RestartTutorialButton 
                className="w-full justify-center" 
                onRestart={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
