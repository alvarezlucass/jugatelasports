import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export const UpdatePassword: React.FC = () => {
    const { updatePassword } = useUser();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error } = await updatePassword(password);
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
                <div className="w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground">¡Contraseña Actualizada!</h2>
                    <p className="text-muted-foreground">Tu contraseña ha sido cambiada correctamente. Te estamos redirigiendo al inicio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
            <div className="w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

                <div className="space-y-6 relative">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Nueva Contraseña</h2>
                        <p className="text-muted-foreground text-sm">Ingresa tu nueva contraseña para recuperar el acceso.</p>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Nueva Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                "Guardar Contraseña"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
