import React from 'react';

// Base Modal Component
export const Modal = ({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-[#D0B9A7] border-2 border-black rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};

// Alert Modal (replaces alert())
export const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-[#B08463] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-[#714329]';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        {getIcon()}
        {title && (
          <h3 className={`text-lg font-semibold mb-2 ${getTitleColor()}`}>
            {title}
          </h3>
        )}
        <p className="text-[#714329] mb-6 whitespace-pre-line">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#B08463] text-white py-2 px-4 rounded-lg hover:bg-[#B9937B] transition-colors"
        >
          OK
        </button>
      </div>
    </Modal>
  );
};

// Confirm Modal (replaces confirm())
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ja', cancelText = 'Annuleren', type = 'warning' }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'danger': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-[#B08463] hover:bg-[#B9937B]';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        {getIcon()}
        {title && (
          <h3 className={`text-lg font-semibold mb-2 ${getTitleColor()}`}>
            {title}
          </h3>
        )}
        <p className="text-[#714329] mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#B5A192] text-[#714329] py-2 px-4 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 text-white py-2 px-4 rounded-lg transition-colors ${getConfirmButtonStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Prompt Modal (replaces prompt())
export const PromptModal = ({ isOpen, onClose, onConfirm, title, message, placeholder = '', defaultValue = '', inputType = 'text' }) => {
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    onConfirm(value);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-[#B08463] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          {title && (
            <h3 className="text-lg font-semibold mb-2 text-[#714329]">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-[#B5A192] mb-4">
              {message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <input
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-[#B5A192] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B08463] focus:border-transparent"
            autoFocus
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#B5A192] text-[#714329] py-2 px-4 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-[#B08463] text-white py-2 px-4 rounded-lg hover:bg-[#B9937B] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
};
