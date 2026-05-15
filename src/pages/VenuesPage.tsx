import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Users } from 'lucide-react';
import { getVenues } from '../data/worldCupPersistence';

export const VenuesPage: React.FC = () => {
    const navigate = useNavigate();
    const venues = getVenues();

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-700 bg-[#0A0D12]">
            {/* Header */}
            <div className="container mx-auto px-4 pt-12 pb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
                >
                    <ChevronLeft size={16} /> Volver al Mundial
                </button>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-[0.2em] text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Sedes Oficiales
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                        Estadios <span className="text-blue-600">Mundial 2026</span>
                    </h1>
                    <p className="text-zinc-500 text-base md:text-lg font-bold">
                        Descubre las joyas arquitectónicas que albergarán la máxima cita.
                    </p>
                </div>
            </div>

            {/* Venues Grid */}
            <div className="container mx-auto px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue, idx) => (
                        <div
                            key={venue.id}
                            className="group relative overflow-hidden rounded-[2.5rem] bg-[#121820] border border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Image Container */}
                            <div className="relative h-48 md:h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#121820] via-black/20 to-transparent z-10" />
                                <img
                                    src={venue.image}
                                    alt={venue.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 text-transparent"
                                />
                                <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl">
                                    <span className="w-4 h-3 rounded-[2px] overflow-hidden flex items-center">
                                        <img src={`https://flagcdn.com/${venue.country === 'México' ? 'mx' : venue.country === 'USA' ? 'us' : 'ca'}.svg`} className="w-full h-full object-cover" alt={venue.country} />
                                    </span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{venue.country}</span>
                                </div>
                            </div>

                            {/* Info Container */}
                            <div className="p-6 md:p-8 flex flex-col items-center text-center flex-1 relative z-20 -mt-6 bg-gradient-to-b from-[#121820]/90 to-[#121820] rounded-b-[2.5rem] backdrop-blur-xl">
                                {venue.website ? (
                                    <a 
                                        href={venue.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-2xl md:text-3xl font-black text-white hover:text-blue-500 uppercase tracking-tighter mb-3 drop-shadow-lg transition-colors underline decoration-blue-600/30 underline-offset-4"
                                    >
                                        {venue.name}
                                    </a>
                                ) : (
                                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-3 drop-shadow-lg">{venue.name}</h3>
                                )}


                                <div className="flex flex-wrap justify-center items-center gap-3 mb-5">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-300 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-full shadow-inner">
                                        <MapPin size={14} className="text-blue-400" />
                                        {venue.city}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-300 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-full shadow-inner">
                                        <Users size={14} className="text-blue-400" />
                                        {venue.capacity.toLocaleString()} Cap.
                                    </div>
                                </div>

                                <p className="text-sm font-medium text-zinc-400 leading-relaxed mt-auto max-w-[90%]">
                                    {venue.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
