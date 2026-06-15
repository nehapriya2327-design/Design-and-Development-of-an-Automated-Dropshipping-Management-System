'use client';

import React from 'react';

interface PopupModalProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export default function PopupModal({ children, onClose }: PopupModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 popup-model">
      <div className="bg-white dark:bg-gray-600 rounded-lg shadow-lg p-6 relative popup-div">
        {onClose && (
          <button className="absolute top-2 right-2 text-black  dark:text-white" onClick={onClose} > ✕ </button>
        )}
        {children}
      </div>
    </div>
  );
}
