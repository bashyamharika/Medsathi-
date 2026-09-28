import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, ShieldCheck, UserCheck, LogOut } from 'lucide-react';
import { Button } from './ui/Button.js';
import { useAuth } from '../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile, user, signOut } = useAuth();

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const caregiverName = profile?.full_name || user?.user_metadata?.full_name || 'Caregiver';

  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none"
            aria-label="MedSathi Home"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-sm shadow-teal-900/20 group-hover:bg-teal-800 transition-colors">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-stone-900">
                MED<span className="text-teal-700">SATHI</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600 inline" /> AI Companion
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors duration-200 ${
                isActive('/') && location.pathname === '/'
                  ? 'text-teal-700 font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Overview
            </Link>

            {session && (
              <Link
                to="/caregiver/dashboard"
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive('/caregiver/dashboard')
                    ? 'text-teal-700 font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                  <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-semibold truncate max-w-[150px]">{caregiverName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4 text-stone-500" />}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-base font-semibold ${
                location.pathname === '/'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              Overview
            </Link>

            {session && (
              <Link
                to="/caregiver/dashboard"
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-base font-semibold ${
                  isActive('/caregiver/dashboard')
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            {session ? (
              <>
                <div className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-700" />
                  <span>Signed in as <strong>{caregiverName}</strong></span>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4 text-stone-600" />}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="secondary" size="md" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
