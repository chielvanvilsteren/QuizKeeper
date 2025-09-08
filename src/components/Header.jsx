// Modern Header Component for QuizKeeper
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-primary shadow-lg sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors duration-200">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white group-hover:text-background transition-colors duration-200">
                QuizKeeper
              </h1>
              <p className="text-neutral text-sm -mt-1">De slimste pubquiz app</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" isActive={isActive('/')}>
              🏠 Home
            </NavLink>
            <NavLink to="/new" isActive={isActive('/new')}>
              ➕ Nieuwe Quiz
            </NavLink>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-background transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Navigation Link Component
const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? 'bg-secondary text-white shadow-md'
        : 'text-neutral hover:text-white hover:bg-accent'
    }`}
  >
    {children}
  </Link>
);

export default Header;
