import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const ReferralRoute: React.FC = () => {
    const { refId } = useParams<{ refId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (refId) {
            // Save the referral ID in localStorage to be used during registration
            localStorage.setItem('jugatela_referral', refId);
        }
        // Redirect to home page
        navigate('/', { replace: true });
    }, [refId, navigate]);

    // Show a blank or loading state while redirecting
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400 font-bold uppercase tracking-widest">Cargando invitación...</p>
        </div>
    );
};
