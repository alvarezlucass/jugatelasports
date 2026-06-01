import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useUser();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in duration-500">
                <RefreshCw size={40} className="text-blue-500 animate-spin opacity-25" />
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Cargando...</p>
            </div>
        );
    }

    if (!user) {
        // Redirect to login, saving the original location in state
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};
