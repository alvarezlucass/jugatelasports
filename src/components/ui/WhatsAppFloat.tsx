import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloat: React.FC = () => {
    const handleWhatsAppClick = () => {
        const text = encodeURIComponent('¡Hola equipo de Jugatela Sports! Tengo una consulta sobre la plataforma.');
        window.open(`https://wa.me/5491135830433?text=${text}`, '_blank');
    };

    return (
        <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-50">
            <button
                onClick={handleWhatsAppClick}
                className="w-12 h-12 md:w-14 md:h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:scale-110 transition-transform hover:bg-[#20bd5a]"
                title="Soporte por WhatsApp"
            >
                <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </button>
        </div>
    );
};
