import { useEffect, useState } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // 1. Detectar si ya está en modo standalone (PWA instalada y ejecutándose)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone;
        
        if (isStandalone) {
            return;
        }

        // 2. Verificar si el usuario ya desestimó el prompt anteriormente
        const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
        if (isDismissed) {
            return;
        }

        // 3. Detectar si el dispositivo es iOS (iPhone/iPad/iPod)
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // 4. Configurar eventos para navegadores basados en Chromium
        const handleBeforeInstall = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // 5. Para iOS: Mostrar el prompt automáticamente después de 4 segundos si no está instalado
        if (ios) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 4000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa_prompt_dismissed', 'true');
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 bg-[#131822]/95 backdrop-blur-xl border border-primary/20 p-5 rounded-[2rem] shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Download className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-wider text-white">Instalar App</h3>
                    </div>
                    
                    {isIOS ? (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                                Agrega <strong className="text-white">Jugatela Sports</strong> a tu pantalla de inicio para una experiencia inmersiva y acceso rápido:
                            </p>
                            <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-2 text-[11px] text-zinc-300 font-bold">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-black">1</span>
                                    <span>Presiona el botón de compartir</span>
                                    <Share className="w-3.5 h-3.5 text-zinc-400 inline" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-black">2</span>
                                    <span>Selecciona <strong className="text-white">"Agregar a inicio"</strong></span>
                                    <Plus className="w-3.5 h-3.5 text-zinc-400 inline" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                                Descarga <strong className="text-white">Jugatela Sports</strong> en tu dispositivo para competir en el Prode con mayor fluidez y notificaciones activas.
                            </p>
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Instalar ahora
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-zinc-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
