// Modern Header Component for QuizBeheer
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-primary/95 backdrop-blur-md shadow-2xl sticky top-0 z-50 animate-fade-in border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="relative">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-accent transition-all duration-300 p-2.5 shadow-lg group-hover:shadow-xl group-hover:scale-105">
                <img
                  src="/favicon.ico"
                  alt="QuizBeheer Logo"
                  className="w-full h-full object-contain filter brightness-150 drop-shadow-sm"
                />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-accent rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-black group-hover:text-gray-800 transition-colors duration-200 tracking-tight">
                QuizBeheer
              </h1>
              <p className="text-gray-700 text-sm -mt-1 font-medium">De slimste pubquiz app</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink to="/" isActive={isActive('/')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </NavLink>
            <NavLink to="/new" isActive={isActive('/new')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nieuwe Quiz
            </NavLink>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-black hover:text-gray-800 transition-colors p-2 rounded-xl hover:bg-white/10">
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

// Enhanced Navigation Link Component
const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2.5 rounded-xl font-medium transition-all duration-200 relative overflow-hidden group ${
      isActive
        ? 'bg-secondary text-white shadow-lg scale-105'
        : 'text-black hover:text-gray-800 hover:bg-white/20 hover:scale-105'
    }`}
  >
    <span className="relative z-10 flex items-center">{children}</span>
    {!isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-accent/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    )}
  </Link>
);

export default Header;
