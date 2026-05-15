import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, Chrome } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { signInWithGoogle, signInWithEmail, user } = useUser();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    // Redirect if logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleEmailLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { error: loginError } = await signInWithEmail(email, password);
            if (loginError) throw loginError;
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message === 'Invalid login credentials'
                ? 'Credenciales inválidas. Verifica tu correo/contraseña.'
                : (err.message || 'Error al iniciar sesión'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0D12] relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[440px] z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo & Welcome */}
                <div className="text-center space-y-6">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-24 h-24 mx-auto relative rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl transition-transform hover:scale-105 duration-500">
                            <img src="/Escudo.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                            Jugátela <span className="text-blue-500">Sports</span>
                        </h2>
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em]">
                            Mundial 2026 • Exclusive Access
                        </p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-[#121820] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl relative">
                    <div className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        {/* Social Login */}
                        <div className="space-y-3">
                            <button
                                onClick={signInWithGoogle}
                                className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <Chrome size={18} /> Continuar con Google
                            </button>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#121820] px-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">O mediante correo</span>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                        placeholder="tu@email.com"
                                        className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between px-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contraseña</label>
                                    <Link to="/forgot-password" title="¿Olvidaste tu contraseña?" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">¿Olvidaste?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm font-bold placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleEmailLogin}
                                disabled={loading || !email || !password}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {loading ? 'Validando Accesso...' : 'Iniciar Sesión'}
                                <ShieldCheck size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="text-center space-y-4">
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-white hover:text-blue-500 transition-colors">
                            Regístrate ahora
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
