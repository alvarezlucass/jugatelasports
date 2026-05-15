import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
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

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 bg-background/80 backdrop-blur-xl border border-primary/20 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Instalar App</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Agrega Jugatela Sports a tu inicio para una mejor experiencia y jugar sin conexión.
                    </p>
                    <button
                        onClick={handleInstallClick}
                        className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Instalar
                    </button>
                </div>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="text-muted-foreground hover:text-foreground p-1"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
