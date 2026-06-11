import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Calendar, Phone, CreditCard, Check, X, User as UserIcon } from 'lucide-react';
import type { User } from '../../types';

interface EditProfileData {
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    phone: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    user: User | null;
    onSave: (data: EditProfileData) => Promise<{ error: any }>;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    user,
    onSave,
    onClose
}) => {
    const [formData, setFormData] = useState<EditProfileData>({
        firstName: '',
        lastName: '',
        dni: '',
        birthDate: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                dni: user.dni || '',
                birthDate: user.birthDate || '',
                phone: user.phone || ''
            });
            setError('');
            setSuccess(false);
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName) {
            setError('Nombre y Apellido son obligatorios.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            const { error: saveError } = await onSave(formData);
            if (saveError) throw saveError;
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={!loading ? onClose : undefined} />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#0F131A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <button 
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-6 right-6 z-20 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                    title="Cerrar"
                >
                    <X className="w-4 h-4" />
                </button>
                
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 p-8 border-b border-white/5">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                    
                    {/* Logo */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-white/10 shadow-xl">
                            <Settings className="w-8 h-8 text-zinc-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                Ajustes de Perfil
                            </h2>
                            <p className="text-zinc-400 text-xs font-medium mt-1 max-w-[280px] mx-auto">
                                Actualiza tu información personal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold text-center">
                            Perfil actualizado exitosamente.
                        </div>
                    )}

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3 pl-11 pr-4 text-white text-sm font-medium placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                Apellido <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
                                placeholder="Tu apellido"
                            />
                        </div>
                    </div>

                    {/* DNI */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                            DNI
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={8}
                                value={formData.dni}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData({ ...formData, dni: val });
                                }}
                                className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3 pl-11 pr-4 text-white text-sm font-medium placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
                                placeholder="Solo números"
                            />
                        </div>
                    </div>

                    {/* Birth Date */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                            Fecha de Nacimiento
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3 pl-11 pr-4 text-white text-sm font-medium placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                            WhatsApp
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3 pl-11 pr-4 text-white text-sm font-medium placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
                                placeholder="11 1234 5678"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-black/20">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || success}
                        className="w-full py-4 bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 disabled:opacity-60 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : success ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Guardado</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
