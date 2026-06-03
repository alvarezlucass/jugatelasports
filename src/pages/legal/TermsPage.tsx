import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-zinc-300">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-3xl font-black text-white mb-8 tracking-tight uppercase">Términos y Condiciones</h1>
            
            <div className="space-y-6 text-sm leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">1. Naturaleza del Servicio</h2>
                    <p>Jugatela Sports es una plataforma interactiva de predicciones deportivas diseñada exclusivamente para fines de entretenimiento ("free-to-play"). <strong>Bajo ninguna circunstancia somos un sitio de apuestas con dinero real.</strong> Los "Tokens" (PKTS) y otras monedas virtuales de la plataforma no tienen valor monetario real en el mundo exterior, no pueden ser adquiridos por dinero real de forma obligatoria para jugar, ni pueden ser canjeados, retirados o vendidos por dinero fiduciario o criptomonedas.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">2. Aceptación de los Términos</h2>
                    <p>Al acceder y crear una cuenta en Jugatela Sports, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestro servicio.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">3. Cuentas de Usuario</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Debe proporcionar información precisa y completa al crear su cuenta.</li>
                        <li><strong>Prohibición de Múltiples Cuentas:</strong> Cada usuario tiene derecho a una (1) sola cuenta. La creación de cuentas secundarias para manipular rankings o ganar ventajas será penalizada con suspensión permanente.</li>
                        <li>Es responsable de mantener la confidencialidad de su cuenta y contraseña.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">4. Conducta de la Comunidad</h2>
                    <p>Jugatela Sports fomenta la competencia sana. Está estrictamente prohibido el uso de lenguaje ofensivo, discriminatorio, spam, o acoso a otros usuarios a través de Grupos, chat de partidos o Retos PvP. Nos reservamos el derecho de eliminar contenido y suspender cuentas que violen esta regla.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">5. Premios Físicos de Patrocinadores (Sponsors)</h2>
                    <p>Ocasionalmente, Jugatela Sports o sus patrocinadores pueden ofrecer premios físicos o experiencias en la "Tienda". Estos se entregan "tal cual" y están sujetos a disponibilidad y a los términos específicos de cada patrocinador. Jugatela Sports no se hace responsable por inconvenientes ajenos en la logística de dichos premios de terceros.</p>
                </section>
                
                <section>
                    <h2 className="text-xl font-bold text-primary mb-3">6. Modificaciones al Servicio</h2>
                    <p>Nos reservamos el derecho de modificar o discontinuar el servicio (o cualquier parte de él) en cualquier momento, con o sin previo aviso. Nos esforzaremos por notificar cambios significativos en los Términos con antelación a través de la plataforma.</p>
                </section>
            </div>
        </div>
    );
};
