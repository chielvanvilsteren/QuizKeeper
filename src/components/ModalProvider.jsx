import React, { createContext, useContext } from 'react';
import { useModals } from '../hooks/useModals';
import { AlertModal, ConfirmModal } from './Modal';

const ModalContext = createContext();

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const modals = useModals();

  return (
    <ModalContext.Provider value={modals}>
      {children}

      {/* Alert Modal */}
      <AlertModal
        isOpen={modals.alertModal.isOpen}
        onClose={modals.closeAlert}
        title={modals.alertModal.title}
        message={modals.alertModal.message}
        type={modals.alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modals.confirmModal.isOpen}
        onClose={() => {
          modals.confirmModal.onConfirm?.(false);
          modals.closeConfirm();
        }}
        onConfirm={() => {
          modals.confirmModal.onConfirm?.(true);
          modals.closeConfirm();
        }}
        title={modals.confirmModal.title}
        message={modals.confirmModal.message}
        type={modals.confirmModal.type}
      />
    </ModalContext.Provider>
  );
};
