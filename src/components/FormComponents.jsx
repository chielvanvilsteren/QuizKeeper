// Modern Form Components for QuizKeeper with custom styling
import React from 'react';

// Modern Card Component
export const Card = ({ children, title, className = '', ...props }) => {
  return (
    <div
      className={`bg-background rounded-xl shadow-lg border border-neutral/20 p-6 transition-all duration-200 hover:shadow-xl animate-slide-up ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-bold text-black mb-4 border-b border-neutral/20 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// Modern Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95';

  const variants = {
    primary: 'bg-secondary text-white hover:bg-accent focus:ring-secondary shadow-md hover:shadow-lg',
    secondary: 'bg-neutral text-white hover:bg-primary focus:ring-neutral shadow-md hover:shadow-lg',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary',
    ghost: 'text-primary hover:bg-background/50 focus:ring-primary'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Modern Form Field Component
export const FormField = ({
  label,
  error,
  required = false,
  className = '',
  children,
  ...props
}) => {
  const inputId = props.id || props.name;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-black"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {children || (
        <input
          {...props}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
            bg-white text-black placeholder-gray-500
            border-neutral/30 focus:border-secondary focus:ring-4 focus:ring-secondary/20
            hover:border-accent
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          `}
        />
      )}

      {error && (
        <p className="text-red-600 text-sm font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// Modern Select Component
export const Select = ({ options = [], placeholder, className = '', ...props }) => {
  return (
    <select
      className={`
        w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
        bg-white text-black
        border-neutral/30 focus:border-secondary focus:ring-4 focus:ring-secondary/20
        hover:border-accent cursor-pointer
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Modern Textarea Component
export const Textarea = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`
        w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
        bg-white text-black placeholder-gray-500
        border-neutral/30 focus:border-secondary focus:ring-4 focus:ring-secondary/20
        hover:border-accent resize-vertical min-h-[100px]
        ${className}
      `}
      {...props}
    />
  );
};

// Modern Badge Component
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-neutral text-white',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin text-secondary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
};
