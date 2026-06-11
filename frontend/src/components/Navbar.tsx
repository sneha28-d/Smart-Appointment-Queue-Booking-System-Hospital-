import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`text-sm font-medium transition-colors duration-200 ${
        isActive(to)
          ? 'text-blue-600'
          : 'text-slate-600 hover:text-blue-600'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">DocQueue</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLink('/', 'Home')}
          {navLink('/doctors', 'Doctors')}
          {navLink('/about', 'About')}
          {navLink('/contact', 'Contact')}
          {isAuthenticated && user?.role === 'customer' && navLink('/dashboard', 'Dashboard')}
          {isAuthenticated && user?.role === 'admin' && navLink('/admin', 'Admin')}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === 'admin' ? '/admin' : '/my-profile'}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                  {user?.name?.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-800">{user?.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 hover:text-red-500 transition px-3 py-1.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition px-3">
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-md shadow-blue-500/30"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          {navLink('/', 'Home')}
          {navLink('/doctors', 'Doctors')}
          {navLink('/about', 'About')}
          {navLink('/contact', 'Contact')}
          {isAuthenticated && user?.role === 'customer' && navLink('/dashboard', 'Dashboard')}
          {isAuthenticated && user?.role === 'admin' && navLink('/admin', 'Admin Panel')}

          <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-red-500">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-slate-700">Login</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-blue-600">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;