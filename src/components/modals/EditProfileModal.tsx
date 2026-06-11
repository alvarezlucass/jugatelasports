import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { User } from '../../types';

interface EditProfileModalProps {
    isOpen: boolean;
    user: User | null;
    onSave: (data: any) => Promise<{ error: any }>;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    onClose
}) => {
    console.log('EditProfileModal rendering! isOpen:', isOpen);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80">
            <div className="bg-white p-10 rounded-2xl">
                <h1 className="text-black text-2xl mb-4">MODAL DE PRUEBA</h1>
                <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    CERRAR
                </button>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
