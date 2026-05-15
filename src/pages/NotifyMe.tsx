
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Mail,
    Info,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

export const NotifyMe: React.FC = () => {
    const navigate = useNavigate();
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');

    const sports = [
        { id: 'football', label: 'Football' },
        { id: 'basketball', label: 'Basketball' },
        { id: 'tennis', label: 'Tennis' },
        { id: 'f1', label: 'F1' },
        { id: 'nfl', label: 'NFL' },
    ];

    const leagues = [
        "La Liga (España)",
        "Premier League",
        "NBA",
        "ATP Tour",
        "Champions League"
    ];

    const toggleSport = (id: string) => {
        if (selectedSports.includes(id)) {
            setSelectedSports(selectedSports.filter(s => s !== id));
        } else {
            setSelectedSports([...selectedSports, id]);
        }
    };

    const toggleLeague = (league: string) => {
        if (selectedLeagues.includes(league)) {
            setSelectedLeagues(selectedLeagues.filter(l => l !== league));
        } else {
            setSelectedLeagues([...selectedLeagues, league]);
        }
    };

    const countries = [
        { code: '+54', name: 'Argentina', flag: '🇦🇷' },
        { code: '+55', name: 'Brasil', flag: '🇧🇷' },
        { code: '+56', name: 'Chile', flag: '🇨🇱' },
        { code: '+57', name: 'Colombia', flag: '🇨🇴' },
        { code: '+52', name: 'México', flag: '🇲🇽' },
        { code: '+51', name: 'Perú', flag: '🇵🇪' },
        { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
        { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
        { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
        { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
        { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
    ];

    const [countryCode, setCountryCode] = useState(countries[0].code);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setWhatsapp(value);
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients similar to Home */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -z-10" />

            <div className="w-full max-w-2xl bg-[#151b23] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 text-center">

                {/* Back Button */}
                <div className="absolute top-6 right-6">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                    >
                        Volver
                    </button>
                </div>

                {/* Header Icon */}
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-8 h-8 text-blue-500" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    ¡Sé el primero en saber!
                </h1>

                <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                    Elegí qué deportes te interesan y te avisaremos por WhatsApp o mail apenas estén disponibles.
                </p>

                {/* Sports Selection */}
                <div className="text-left mb-8">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                        SELECCIONA DEPORTES
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {sports.map((sport) => (
                            <button
                                key={sport.id}
                                onClick={() => toggleSport(sport.id)}
                                className={cn(
                                    "px-6 py-3 rounded-full border transition-all duration-200 flex items-center gap-2",
                                    selectedSports.includes(sport.id)
                                        ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                                        : "bg-transparent border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                                )}
                            >
                                <span className={cn("w-3 h-3 rounded-full border border-current flex items-center justify-center", selectedSports.includes(sport.id) ? "bg-blue-500 border-blue-500" : "")}>
                                    {selectedSports.includes(sport.id) && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </span>
                                {sport.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leagues Selection */}
                <div className="text-left mb-8">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                        LIGAS DE INTERÉS
                    </h3>
                    <div className="bg-[#0f1219] border border-white/5 rounded-2xl p-2">
                        {leagues.map((league) => (
                            <button
                                key={league}
                                onClick={() => toggleLeague(league)}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between group",
                                    selectedLeagues.includes(league) ? "bg-blue-500/10 text-white" : "text-muted-foreground hover:bg-white/5"
                                )}
                            >
                                <span>{league}</span>
                                {selectedLeagues.includes(league) && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 px-1">
                        Manten presionado Ctrl (o Cmd) para seleccionar varias.
                    </p>
                </div>

                {/* Contact Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                            WHATSAPP
                        </label>
                        <div className="flex bg-[#0f1219] border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                            {/* Country Selector */}
                            <div className="relative border-r border-white/10">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="h-full bg-transparent text-white pl-3 pr-8 appearance-none outline-none cursor-pointer hover:bg-white/5 transition-colors"
                                >
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code} className="bg-[#151b23]">
                                            {country.flag} {country.code}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom arrow to ensure it looks good */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <input
                                type="tel"
                                placeholder="11 1234 5678"
                                value={whatsapp}
                                onChange={handlePhoneChange}
                                className="w-full bg-transparent py-4 px-4 text-white placeholder:text-muted-foreground/50 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                            EMAIL
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="usuario@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0f1219] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
                    <Info className="w-4 h-4" />
                    <span className="text-xs">No enviamos spam. Solo notificaciones importantes.</span>
                </div>

                {/* Submit Button */}
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => navigate('/')} // Just navigation for now
                >
                    Quiero enterarme primero
                </button>

            </div>
        </div>
    );
};
