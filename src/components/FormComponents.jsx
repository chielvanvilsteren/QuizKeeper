// Modern Form Components for QuizKeeper with custom styling
import React from 'react';

// Modern Card Component
export const Card = ({ children, title, className = '', ...props }) => {
  return (
    <div
      className={`bg-surface rounded-xl shadow-lg border border-border p-6 transition-all duration-200 hover:shadow-xl animate-slide-up ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-bold text-text-dark mb-4 border-b border-border pb-2">
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
    primary: 'bg-primary text-white hover:bg-secondary focus:ring-primary shadow-md hover:shadow-lg',
    secondary: 'bg-secondary text-white hover:bg-accent focus:ring-secondary shadow-md hover:shadow-lg',
    success: 'bg-success text-white hover:bg-green-700 focus:ring-success shadow-md hover:shadow-lg',
    danger: 'bg-error text-white hover:bg-red-700 focus:ring-error shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-primary hover:bg-background focus:ring-primary'
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
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = label?.toLowerCase().replace(/\s+/g, '-') || 'input';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-dark"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-3 
          border rounded-lg
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error 
            ? 'border-error focus:ring-error' 
            : 'border-border focus:ring-primary'
          }
          ${disabled ? 'bg-gray-50' : 'bg-surface'}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm text-error mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// Modern Badge Component
export const Badge = ({ children, variant = 'default', size = 'medium', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-primary',
    secondary: 'bg-purple-100 text-secondary',
    success: 'bg-green-100 text-success',
    warning: 'bg-yellow-100 text-warning',
    danger: 'bg-red-100 text-error'
  };

  const sizes = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

// Modern Loading Spinner Component
export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary ${sizes[size]} ${className}`} />
  );
};

// Modern Select Component
export const Select = ({
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  placeholder = 'Selecteer...',
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = label?.toLowerCase().replace(/\s+/g, '-') || 'select';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-dark"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-3 
          border rounded-lg
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error 
            ? 'border-error focus:ring-error' 
            : 'border-border focus:ring-primary'
          }
          ${disabled ? 'bg-gray-50' : 'bg-surface'}
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

      {error && (
        <p className="text-sm text-error mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// Modern Textarea Component
export const Textarea = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  rows = 3,
  className = '',
  ...props
}) => {
  const textareaId = label?.toLowerCase().replace(/\s+/g, '-') || 'textarea';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-text-dark"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          w-full px-4 py-3 
          border rounded-lg
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          resize-vertical
          ${error 
            ? 'border-error focus:ring-error' 
            : 'border-border focus:ring-primary'
          }
          ${disabled ? 'bg-gray-50' : 'bg-surface'}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm text-error mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
