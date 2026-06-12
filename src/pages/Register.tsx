import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronRight, Check, Mail, User, Calendar, Phone, Lock, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';

type Step = 1 | 2 | 3;

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signInWithGoogle, signUpWithEmail, resendEmailConfirmation, user } = useUser();

    // Redirect if logged in
    useEffect(() => {
        if (user) {
            const redirectUrl = location.state?.from || '/';
            navigate(redirectUrl, { replace: true });
        }
    }, [user, navigate, location.state]);

    const [step, setStep] = useState<Step>(1);

    // Form States
    const [legalData, setLegalData] = useState({
        isOver18: false,
        acceptedTerms: false
    });

    const [accountData, setAccountData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [identityData, setIdentityData] = useState({
        firstName: '',
        lastName: '',
        nickname: '',
        nicknameIsPublic: false,
        dni: '',
        birthDate: '',
        phone: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Password Validation State
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false,
        match: false
    });

    useEffect(() => {
        const { password, confirmPassword } = accountData;
        setPasswordCriteria({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            match: password === confirmPassword && password !== ''
        });
    }, [accountData.password, accountData.confirmPassword]);

    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

    const handleNext = () => {
        if (step === 2) {
            if (!isPasswordValid) return;
        }
        setError('');
        setStep(prev => Math.min(prev + 1, 3) as Step);
    };

    const handleRegister = async () => {
        // Validate Step 3 data
        if (!identityData.firstName || !identityData.lastName || !identityData.dni || !identityData.birthDate || !identityData.phone) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        // Validate Age (18+)
        // Parse date manually to avoid timezone issues
        const [year, month, day] = identityData.birthDate.split('-').map(Number);
        const birthDateObj = new Date(year, month - 1, day);
        const today = new Date();

        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        if (age < 18) {
            setError('Debes ser mayor de 18 años para registrarte. Tu edad no está autorizada por la ley.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const { error } = await signUpWithEmail(accountData.email, accountData.password, identityData);
            if (error) throw error;
            setShowSuccess(true);
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('profiles_dni_key')) {
                setError('Este DNI ya está registrado en el sistema.');
            } else {
                setError(err.message || 'Error al registrarse');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1) as Step);
    };



    const canProceedStep1 = legalData.isOver18 && legalData.acceptedTerms;

    const [resendCooldown, setResendCooldown] = useState(0);

    const handleResendEmail = async () => {
        if (resendCooldown > 0) return;

        const { error } = await resendEmailConfirmation(accountData.email);
        if (error) {
            setError('Error al reenviar el correo. Intenta nuevamente.');
        } else {
            setResendCooldown(60); // 60 seconds cooldown
        }
    };

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    if (showSuccess) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
                <div className="w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-foreground">¡Revisa tu Correo!</h2>
                    <p className="text-muted-foreground">Te hemos enviado un enlace de confirmación a <strong>{accountData.email}</strong>.</p>
                    <p className="text-sm text-muted-foreground">Una vez confirmado, podrás ingresar a tu cuenta.</p>

                    <div className="space-y-3">
                        <Link 
                            to="/login" 
                            state={{ from: location.state?.from }}
                            className="block w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            Ir a Iniciar Sesión
                        </Link>

                        <button
                            onClick={handleResendEmail}
                            disabled={resendCooldown > 0}
                            className="text-sm text-primary hover:text-primary/80 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {resendCooldown > 0
                                ? `Reenviar correo en ${resendCooldown}s`
                                : '¿No recibiste el correo? Reenviar'}
                        </button>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 mt-2">{error}</p>
                    )}
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

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mb-8 relative z-10">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                s === step ? "w-12 bg-primary" : "w-12 bg-muted/30"
                            )}
                        />
                    ))}
                </div>

                {/* Back Button */}
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="absolute top-8 left-8 p-2 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}

                {/* Step 1: Legal Verification */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto mb-6 shadow-xl shadow-primary/20 rounded-3xl overflow-hidden">
                                <img src="/Escudo.jpg" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Configuración de Cuenta</h2>
                            <p className="text-muted-foreground font-medium">Confirma tu elegibilidad para comenzar en la plataforma.</p>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start">
                            <div className="bg-blue-600 rounded-full p-1 mt-0.5 shrink-0">
                                <span className="block w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-blue-400">Aviso Importante</h4>
                                <p className="text-xs text-blue-300/80 leading-relaxed">Este no es un sitio de apuestas. No se utiliza dinero real. Todas las predicciones usan créditos virtuales solo por entretenimiento.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-start gap-4 p-4 rounded-2xl border border-border/50 bg-muted/10 hover:bg-muted/20 hover:border-border transition-all cursor-pointer group">
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5",
                                    legalData.isOver18 ? "bg-primary border-primary" : "border-muted-foreground group-hover:border-primary"
                                )}>
                                    {legalData.isOver18 && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={legalData.isOver18}
                                    onChange={(e) => setLegalData({ ...legalData, isOver18: e.target.checked })}
                                />
                                <div>
                                    <span className="block font-bold text-foreground">Confirmación de Edad</span>
                                    <span className="text-xs text-muted-foreground">Confirmo que soy mayor de 18 años.</span>
                                </div>
                            </label>

                            <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border/50 bg-muted/10 transition-all">
                                <label className="flex items-center gap-4 cursor-pointer group w-full">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                        legalData.acceptedTerms ? "bg-primary border-primary" : "border-muted-foreground group-hover:border-primary"
                                    )}>
                                        {legalData.acceptedTerms && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={legalData.acceptedTerms}
                                        onChange={(e) => setLegalData({ ...legalData, acceptedTerms: e.target.checked })}
                                    />
                                    <span className="block font-bold text-foreground">Acuerdo Legal</span>
                                </label>
                                <div className="ml-10">
                                    <span className="text-xs text-muted-foreground block">
                                        He leído y acepto los{' '}
                                        <Link to="/terminos" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
                                            Términos de Servicio
                                        </Link>
                                        , la{' '}
                                        <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
                                            Política de Privacidad
                                        </Link>
                                        , las{' '}
                                        <Link to="/reglas" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
                                            Reglas del Juego
                                        </Link>
                                        {' '}y el{' '}
                                        <Link to="/disclaimer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
                                            Juego Responsable
                                        </Link>.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!canProceedStep1}
                            onClick={handleNext}
                            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                        >
                            Siguiente
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Step 2: Account Creation */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Crea tu Cuenta</h2>
                            <p className="text-muted-foreground font-medium text-sm">Paso 2 de 3: Configuración de acceso</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={signInWithGoogle}
                                className="w-full flex items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 border border-border/50 py-3 rounded-xl font-bold transition-all text-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Continuar con Google
                            </button>

                            {/* Proximamente: Otros proveedores
                            <div className="grid grid-cols-2 gap-3 opacity-50 pointer-events-none">
                                <button className="flex items-center justify-center gap-2 bg-muted/30 border border-border/50 py-3 rounded-xl font-bold text-sm">
                                    <Facebook className="w-5 h-5 text-blue-600" /> Facebook
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-muted/30 border border-border/50 py-3 rounded-xl font-bold text-sm">
                                    <Mail className="w-5 h-5 text-orange-600" /> Hotmail
                                </button>
                            </div>
                            */}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">O regístrate con tu correo</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={accountData.email}
                                        onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                                        className="w-full bg-muted/20 border border-border/50 rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/30 transition-all font-medium"
                                        placeholder="nombre@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={accountData.password}
                                        onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                                        className="w-full bg-muted/20 border border-border/50 rounded-xl py-3.5 pl-12 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/30 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={accountData.confirmPassword}
                                        onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                                        className="w-full bg-muted/20 border border-border/50 rounded-xl py-3.5 pl-12 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-muted/30 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements UI */}
                            <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-xs">
                                <p className="font-bold text-muted-foreground mb-2">La contraseña debe tener:</p>
                                <div className={cn("flex items-center gap-2 transition-colors", passwordCriteria.length ? "text-green-500" : "text-muted-foreground")}>
                                    {passwordCriteria.length ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-0.5" />}
                                    Mínimo 8 caracteres
                                </div>
                                <div className={cn("flex items-center gap-2 transition-colors", passwordCriteria.uppercase ? "text-green-500" : "text-muted-foreground")}>
                                    {passwordCriteria.uppercase ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-0.5" />}
                                    Una mayúscula
                                </div>
                                <div className={cn("flex items-center gap-2 transition-colors", passwordCriteria.number ? "text-green-500" : "text-muted-foreground")}>
                                    {passwordCriteria.number ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-0.5" />}
                                    Un número
                                </div>
                                <div className={cn("flex items-center gap-2 transition-colors", passwordCriteria.special ? "text-green-500" : "text-muted-foreground")}>
                                    {passwordCriteria.special ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-0.5" />}
                                    Un carácter especial (!@#$...)
                                </div>
                                <div className={cn("flex items-center gap-2 transition-colors", passwordCriteria.match ? "text-green-500" : "text-muted-foreground")}>
                                    {passwordCriteria.match ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current ml-1 mr-0.5" />}
                                    Las contraseñas coinciden
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!isPasswordValid || !accountData.email}
                            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20 mt-4"
                        >
                            Siguiente
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Step 3: Identity & WhatsApp */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                <User className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Identidad y Perfil</h2>
                            <p className="text-muted-foreground text-xs mt-2 max-w-[280px] mx-auto">Completá tu perfil para activar tu cuenta. Datos reales obligatorios bajo ley vigente.</p>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Nombre <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={identityData.firstName}
                                        onChange={(e) => setIdentityData({ ...identityData, firstName: e.target.value })}
                                        className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Apellido <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={identityData.lastName}
                                        onChange={(e) => setIdentityData({ ...identityData, lastName: e.target.value })}
                                        className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                        placeholder="Tu apellido"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Apodo (Opcional)</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                            {identityData.nicknameIsPublic ? 'Público' : 'Solo Amigos'}
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="accent-primary"
                                            checked={identityData.nicknameIsPublic}
                                            onChange={(e) => setIdentityData({ ...identityData, nicknameIsPublic: e.target.checked })}
                                        />
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    value={identityData.nickname}
                                    onChange={(e) => setIdentityData({ ...identityData, nickname: e.target.value })}
                                    className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                    placeholder="Como quieres que te llamen"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">DNI <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={8}
                                        value={identityData.dni}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setIdentityData({ ...identityData, dni: val });
                                        }}
                                        className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                        placeholder="Solo números"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Fecha Nacimiento <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={identityData.birthDate}
                                            onChange={(e) => setIdentityData({ ...identityData, birthDate: e.target.value })}
                                            className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all font-medium appearance-none"
                                            placeholder="dd/mm/aaaa"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">WhatsApp <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        value={identityData.phone}
                                        onChange={(e) => setIdentityData({ ...identityData, phone: e.target.value })}
                                        className="w-full bg-muted/20 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                        placeholder="11 1234 5678"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground/70 ml-1">Usaremos este número para notificaciones (Verificación suspendida temporalmente).</p>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 flex gap-3">
                            <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-200/70 leading-relaxed">
                                Sus datos están protegidos bajo la Ley N° 25.326. Esta información es obligatoria para validar que usted es mayor de 18 años.
                            </p>
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={isLoading}
                            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
                        >
                            {isLoading ? 'Creando cuenta...' : 'Finalizar Registro'}
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">🚀</div>
                        </button>
                    </div>
                )}


                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <p className="text-muted-foreground font-medium text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link 
                            to="/login" 
                            state={{ from: location.state?.from }}
                            className="text-primary font-bold hover:underline"
                        >
                            Ingresa aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
