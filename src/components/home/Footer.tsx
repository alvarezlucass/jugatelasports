import React from 'react';
import {
    Shield,
    Share2,
    Globe
} from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="py-12 border-t border-white/5 mt-auto">
            <div className="container mx-auto px-4">
                <p className="text-center text-xs text-muted-foreground/50 uppercase tracking-widest mb-12">
                    Plataforma exclusiva para mayores de 18 años • Juega con responsabilidad
                </p>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                        {/* Brand Icon placeholder */}
                        <div className="w-6 h-6 bg-muted-foreground/20 rounded flex items-center justify-center">
                            <Shield className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold">© 2024 SportsPredict</span>
                    </div>

                    <div className="flex items-center gap-8">
                        <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Términos</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Contacto</a>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground">
                        <button className="hover:text-white transition-colors"><Share2 className="w-5 h-5" /></button>
                        <button className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
