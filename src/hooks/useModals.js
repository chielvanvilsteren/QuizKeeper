import { useState } from 'react';

// Custom hook for managing modals
export const useModals = () => {
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning' });
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, placeholder: '', defaultValue: '' });

  // Show alert modal (replaces alert())
  const showAlert = (message, title = '', type = 'info') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // Show success alert
  const showSuccess = (message, title = 'Gelukt!') => {
    showAlert(message, title, 'success');
  };

  // Show error alert
  const showError = (message, title = 'Fout') => {
    showAlert(message, title, 'error');
  };

  // Show warning alert
  const showWarning = (message, title = 'Waarschuwing') => {
    showAlert(message, title, 'warning');
  };

  // Show info alert
  const showInfo = (message, title = 'Informatie') => {
    showAlert(message, title, 'info');
  };

  // Close alert modal
  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  // Show confirm modal (replaces confirm())
  const showConfirm = (message, title = 'Bevestigen', type = 'warning') => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: (result) => {
          closeConfirm();
          resolve(result);
        }
      });
    });
  };

  // Close confirm modal
  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning' });
  };

  // Show prompt modal (replaces prompt())
  const showPrompt = (message, title = 'Invoer vereist', placeholder = '', defaultValue = '') => {
    return new Promise((resolve) => {
      setPromptModal({
        isOpen: true,
        title,
        message,
        placeholder,
        defaultValue,
        onConfirm: (result) => {
          closePrompt();
          resolve(result);
        }
      });
    });
  };

  // Close prompt modal
  const closePrompt = () => {
    setPromptModal({ isOpen: false, title: '', message: '', onConfirm: null, placeholder: '', defaultValue: '' });
  };

  return {
    // Alert modal state and functions
    alertModal,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert,

    // Confirm modal state and functions
    confirmModal,
    showConfirm,
    closeConfirm,

    // Prompt modal state and functions
    promptModal,
    showPrompt,
    closePrompt
  };
};
