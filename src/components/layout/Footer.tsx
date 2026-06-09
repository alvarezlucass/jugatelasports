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
                                <a href="https://instagram.com/jugatelasports" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <Instagram className="w-4 h-4" /> Instagram (@jugatelasports)
                                </a>
                            </li>
                            <li>
                                <a href="https://x.com/jugatelasports" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <Twitter className="w-4 h-4" /> X (@jugatelasports)
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/5491135830433" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-2 hover:text-primary transition-colors">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.437-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                                    WhatsApp (+54 9 11 3583-0433)
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
