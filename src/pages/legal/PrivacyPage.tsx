import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-zinc-300">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-3xl font-black text-white mb-8 tracking-tight uppercase">Política de Privacidad</h1>
            
            <div className="space-y-6 text-sm leading-relaxed">
                <p>
                    Su privacidad es importante para nosotros. En <strong>Jugatela Sports</strong>, nos comprometemos a proteger la información personal que comparte con nosotros al utilizar nuestra plataforma.
                </p>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">1. Información que Recopilamos</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Información de Registro:</strong> Cuando crea una cuenta (a través de email o Google Auth), recopilamos su nombre, dirección de correo electrónico, y una foto de perfil (avatar).</li>
                        <li><strong>Actividad en la Plataforma:</strong> Recopilamos datos sobre sus predicciones, desempeño (puntos, precisión), interacción en grupos, uso de items virtuales y navegación dentro de la plataforma.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">2. Cómo Utilizamos su Información</h2>
                    <p>Usamos sus datos exclusivamente para:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Operar, mantener y mejorar la plataforma de predicciones.</li>
                        <li>Mantener los rankings y tablas de posiciones precisas.</li>
                        <li>Personalizar su experiencia y ofrecerle contenido relevante.</li>
                        <li>Componer su perfil público (alias/nickname, estadísticas de juego), el cual será visible para otros usuarios.</li>
                        <li>Enviar notificaciones importantes sobre actualizaciones o premios (si lo autoriza).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">3. Compartir su Información</h2>
                    <p><strong>Nosotros NO vendemos su información personal a terceros.</strong> Solo podemos compartir información en las siguientes circunstancias:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Con proveedores de servicios esenciales (ej. bases de datos y servidores) que están bajo estrictos acuerdos de confidencialidad.</li>
                        <li>Con patrocinadores <strong>únicamente</strong> si usted decide reclamar un premio físico, y exclusivamente con el fin de coordinar la entrega (previa confirmación suya).</li>
                        <li>Cuando sea requerido por la ley aplicable.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">4. Seguridad de los Datos</h2>
                    <p>Implementamos medidas de seguridad de la industria (encriptación, proveedores de autenticación robustos como Supabase/Google) para proteger su cuenta y datos. Sin embargo, ningún método de transmisión por Internet es 100% seguro, por lo que le sugerimos utilizar contraseñas fuertes.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">5. Sus Derechos y Contacto</h2>
                    <p>Tiene derecho a solicitar la eliminación de su cuenta y todos sus datos asociados en cualquier momento.</p>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3 mt-4">
                        <Mail className="w-5 h-5 text-primary" />
                        <p>Para consultas, eliminación de datos o reclamos, escríbanos a: <a href="mailto:soporte@jugatelasports.com" className="text-blue-400 font-bold hover:underline">soporte@jugatelasports.com</a></p>
                    </div>
                </section>
            </div>
        </div>
    );
};
