import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, BookOpen, Scale, FileText, Instagram, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#0A0D12] border-t border-white/5 pt-12 pb-24 md:pb-8 text-zinc-400 relative z-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    
                    {/* Brand & Disclaimer */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/Escudo.jpg" alt="Jugatela Sports" className="w-8 h-8 rounded-lg shadow-lg" />
                            <span className="text-xl font-black text-white tracking-tight">Jugatela Sports</span>
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-500">
                            La plataforma definitiva de predicciones deportivas free-to-play. 
                            Compite con tus amigos, analiza estadísticas en tiempo real y demuestra quién sabe más de fútbol.
                        </p>
                        
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex gap-3 items-start mt-4">
                            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-200/80 font-medium leading-relaxed">
                                <strong className="text-red-400">Sitio de Entretenimiento Gratuito.</strong> Jugatela Sports NO es una casa de apuestas. 
                                Los Tokens (PKTS) y monedas virtuales utilizados en esta plataforma no tienen valor monetario real 
                                y no pueden ser canjeados, retirados o vendidos por dinero en efectivo. Juega con responsabilidad.
                            </p>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Legales</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/terminos" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <FileText className="w-4 h-4" /> Términos y Condiciones
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacidad" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <ShieldAlert className="w-4 h-4" /> Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <Scale className="w-4 h-4" /> Juego Responsable
                                </Link>
                            </li>
                            <li>
                                <Link to="/reglas" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <BookOpen className="w-4 h-4" /> Reglas del Juego
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Comunidad</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <Instagram className="w-4 h-4" /> Instagram
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <Twitter className="w-4 h-4" /> X (Twitter)
                                </a>
                            </li>
                            <li>
                                <a href="mailto:soporte@jugatelasports.com" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <Mail className="w-4 h-4" /> Soporte
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
                    <p className="text-xs text-zinc-600 font-medium text-center md:text-left">
                        &copy; {currentYear} Jugatela Sports. Todos los derechos reservados.
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-700 mt-2 md:mt-0 font-bold">
                        V1.0 - Free to Play
                    </p>
                </div>
            </div>
        </footer>
    );
};
