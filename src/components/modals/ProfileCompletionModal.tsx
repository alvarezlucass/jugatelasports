import React, { useState } from 'react';
import { Shield, Calendar, Phone, CreditCard, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProfileCompletionData {
    firstName: string;
    lastName: string;
    dni: string;
    birthDate: string;
    phone: string;
}

interface ProfileCompletionModalProps {
    isOpen: boolean;
    userName?: string;
    onComplete: (data: ProfileCompletionData) => Promise<void>;
    onClose?: () => void;
    onSignOut?: () => void;
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
    isOpen,
    userName,
    onComplete,
    onClose,
    onSignOut
}) => {
    const [formData, setFormData] = useState<ProfileCompletionData>({
        firstName: '',
        lastName: '',
        dni: '',
        birthDate: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName || !formData.dni || !formData.birthDate || !formData.phone) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        // Validate Age (18+)
        const [year, month, day] = formData.birthDate.split('-').map(Number);
        const birthDateObj = new Date(year, month - 1, day);
        const today = new Date();

        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        if (age < 18) {
            setError('Debes ser mayor de 18 años para participar en la plataforma.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await onComplete(formData);
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#0F131A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 z-20 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        title="Completar más tarde"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-blue-600/20 to-indigo-800/20 p-8 border-b border-white/5">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                    
                    {/* Logo */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                            <img src="/Escudo.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Un paso más</span>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                ¡Bienvenido{userName ? `, ${userName.split(' ')[0]}` : ''}!
                            </h2>
                            <p className="text-zinc-400 text-xs font-medium mt-1 max-w-[280px] mx-auto">
                                Para participar en Jugátela Sports necesitamos verificar tu identidad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-4">
                    {/* Legal Notice */}
                    <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 flex gap-3 items-start">
                        <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-300/70 leading-relaxed">
                            Datos obligatorios bajo la <strong>Ley N° 25.326</strong>. Esta información es requerida para validar que eres mayor de 18 años.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full bg-white/[0.04] border border-white/8 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all"
                                placeholder="Tu nombre"
                            />
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
                            DNI <span className="text-red-500">*</span>
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
                            Fecha de Nacimiento <span className="text-red-500">*</span>
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
                            WhatsApp <span className="text-red-500">*</span>
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
                        <p className="text-[10px] text-zinc-700 ml-1">Para notificaciones importantes (verificación suspendida temporalmente).</p>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Activar Mi Cuenta
                            </>
                        )}
                    </button>

                    {onSignOut && (
                        <button
                            onClick={onSignOut}
                            disabled={loading}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            Cerrar Sesión
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
