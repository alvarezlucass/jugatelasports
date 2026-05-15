import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { StoreItemCard } from '../components/store/StoreItemCard';
import { PurchaseModal } from '../components/store/PurchaseModal';
import { ShoppingBag, PackageOpen, Zap, Info } from 'lucide-react';
import type { StoreItem } from '../types';
import { supabase } from '../lib/supabase';

export const StorePage: React.FC = () => {
    const { user, purchaseItem } = useUser();
    const [activeTab, setActiveTab] = useState<'catalog' | 'inventory'>('catalog');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'especias' | 'boosters'>('all');
    const [purchasingItem, setPurchasingItem] = useState<StoreItem | null>(null);
    const [catalog, setCatalog] = useState<StoreItem[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(true);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const { data, error } = await supabase
                    .from('store_items')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCatalog(data as StoreItem[] || []);
            } catch (error) {
                console.error('Error cargando catalogo de la tienda:', error);
            } finally {
                setLoadingCatalog(false);
            }
        };

        fetchCatalog();
    }, []);

    const handlePurchase = async (item: StoreItem): Promise<boolean> => {
        const result = await purchaseItem(item);
        return result.success;
    };

    const filteredCatalog = catalog.filter(item =>
        selectedCategory === 'all' || item.category === selectedCategory
    );

    // Mapear el inventario del usuario a items del catálogo
    const userInventory = user?.inventory.map(invItem => {
        const catalogItem = catalog.find(i => i.id === invItem.itemId);
        // Si no está en el catálogo actual (ej: fue desactivado), mostramos datos genéricos o lo ocultamos
        if (!catalogItem) return null;
        
        return {
            ...catalogItem,
            quantity: invItem.quantity,
            purchasedAt: invItem.purchasedAt
        } as StoreItem & { quantity: number; purchasedAt: string };
    }).filter(Boolean) as (StoreItem & { quantity: number; purchasedAt: string })[];

    return (
        <div className="min-h-screen bg-[#0A0D12] pb-24 animate-in fade-in duration-700 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="container mx-auto px-4 lg:px-6 pt-12 relative z-10">
                {/* Header Sequence */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6">
                        <ShoppingBag size={14} className="text-blue-400" />
                        Bienvenido a la
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-4">
                        Tienda <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Premium</span>
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base font-medium max-w-xl mx-auto">
                        Invierte tus tokens de Jugátela en multiplicadores estratégicos o úsalos para apostar "especias" directamente contra tus amigos.
                    </p>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Sidebar (Wallet & Nav) */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* User Wallet Summary */}
                        <div className="bg-[#121820]/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Saldo Actual</p>
                                <p className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-md text-zinc-300 uppercase">Nv. {user?.level || 1}</p>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                    <span className="text-2xl drop-shadow-md">🪙</span>
                                </div>
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">{user?.tokens?.toLocaleString() || 0}</p>
                            </div>
                        </div>

                        {/* Navigation Tabs (Sidebar style on Desktop) */}
                        <div className="bg-[#121820]/50 backdrop-blur-md rounded-[2rem] p-2 border border-white/5 flex flex-row lg:flex-col gap-2">
                            <button
                                onClick={() => setActiveTab('catalog')}
                                className={`flex-1 py-4 px-6 rounded-3xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center lg:justify-start gap-3 ${activeTab === 'catalog'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Catálogo
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`flex-1 py-4 px-6 rounded-3xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center lg:justify-start gap-3 ${activeTab === 'inventory'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <PackageOpen className="w-5 h-5" />
                                Inventario
                            </button>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-9">
                        {/* Catalog View */}
                        {activeTab === 'catalog' && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                {/* Category Filters */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-white text-black' : 'bg-[#121820] text-zinc-400 border border-white/5 hover:bg-white/5'}`}
                                    >
                                        Explorar Todos
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('especias')}
                                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedCategory === 'especias' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-[#121820] text-zinc-400 border border-white/5 hover:bg-white/5'}`}
                                    >
                                        <span>🍹</span> Especias Sociales
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('boosters')}
                                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedCategory === 'boosters' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-[#121820] text-zinc-400 border border-white/5 hover:bg-white/5'}`}
                                    >
                                        <Zap size={14} className="fill-current" /> Boosters
                                    </button>
                                </div>

                                {/* Catalog Grid */}
                                {loadingCatalog ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
                                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                                        <p className="font-bold text-sm tracking-widest uppercase">Cargando Vitrina...</p>
                                    </div>
                                ) : filteredCatalog.length === 0 ? (
                                    <div className="text-center py-24 bg-white/5 rounded-[2rem] border border-white/5">
                                        <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No hay productos disponibles</h3>
                                        <p className="text-zinc-500">Intenta volver a revisar más tarde.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredCatalog.map(item => (
                                            <StoreItemCard
                                                key={item.id}
                                                item={item}
                                                onPurchase={setPurchasingItem}
                                                disabled={(user?.tokens || 0) < item.price}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Inventory View */}
                        {activeTab === 'inventory' && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center gap-4 mb-8 bg-blue-500/10 p-4 md:p-5 rounded-2xl border border-blue-500/20">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <Info className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-blue-200 leading-relaxed">
                                        Aquí residen tus posesiones. Recuerda que las <strong className="text-white">"especias"</strong> son exclusivas para ser apostadas en predicciones dentro de tus Grupos Privados contra tus amigos.
                                    </p>
                                </div>

                                {userInventory.length === 0 ? (
                                    <div className="bg-[#121820]/50 backdrop-blur-md rounded-[3rem] p-12 border border-white/5 text-center flex flex-col items-center justify-center min-h-[400px]">
                                        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                                            <PackageOpen className="w-10 h-10 text-zinc-600" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Inventario Vacío</h3>
                                        <p className="text-zinc-500 font-medium max-w-sm">No has adquirido ningún item aún. Visita el catálogo y usa tus tokens para equiparte.</p>
                                        <button onClick={() => setActiveTab('catalog')} className="mt-8 px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-zinc-200 transition-colors">
                                            Ir al Catálogo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userInventory.map(item => (
                                            <div key={item.id} className="bg-[#121820]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between hover:border-white/10 transition-colors group gap-4">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-16 h-16 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center border border-${item.color}-500/20 group-hover:scale-105 transition-transform shrink-0`}>
                                                        {item.category === 'especias' ? <span className="text-2xl">🍹</span> : <Zap className={`w-8 h-8 text-${item.color}-400`} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-white leading-tight tracking-tight mb-1">{item.name}</h4>
                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.category}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] pb-1 uppercase font-black text-zinc-500 tracking-widest">Posees</span>
                                                        <span className="text-2xl font-black bg-white/5 px-4 py-1 rounded-xl text-white border border-white/5 shadow-inner">x{item.quantity}</span>
                                                    </div>

                                                    {item.category === 'especias' && (
                                                        <button 
                                                            onClick={() => {
                                                                const message = encodeURIComponent(`¡Hola Jugátela! 🪙\n\nQuiero canjear mi [${item.name}] por WhatsApp.\n\nUsuario: ${user?.name || user?.nickname || 'Usuario'}\nItem ID: ${item.id}\nCantidad poseída: ${item.quantity}`);
                                                                window.open(`https://wa.me/5491122620697?text=${message}`, '_blank');
                                                            }}
                                                            className="px-6 py-3 bg-green-600 hover:bg-green-550 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 group/btn"
                                                        >
                                                            <span>Canjear</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white group-hover/btn:scale-125 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modals */}
            {purchasingItem && (
                <PurchaseModal
                    item={purchasingItem}
                    onClose={() => setPurchasingItem(null)}
                    onConfirm={handlePurchase}
                />
            )}
        </div>
    );
};
