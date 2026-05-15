import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export const ForgotPassword: React.FC = () => {
    const { resetPassword } = useUser();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await resetPassword(email);
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Error al solicitar recuperación');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
                <div className="w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground">¡Revisa tu Correo!</h2>
                    <p className="text-muted-foreground">Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>.</p>
                    <Link to="/login" className="block w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
                        Volver a Iniciar Sesión
                    </Link>
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

                <div className="relative mb-6">
                    <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Login
                    </Link>
                </div>

                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Recuperar Contraseña</h2>
                        <p className="text-muted-foreground text-sm">Ingresa tu correo y te enviaremos las instrucciones.</p>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-muted/20 border border-border/50 rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/30 transition-all font-medium"
                                    placeholder="nombre@ejemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
