import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { Settings, Save, ShoppingBag, Plus, RefreshCw, AlertTriangle, Edit2, Trash2, EyeOff, Eye, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { StoreItem } from '../../types';

export const StoreAdminPage: React.FC = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [fetchingParams, setFetchingParams] = useState(true);
    const [items, setItems] = useState<StoreItem[]>([]);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: Partial<Omit<StoreItem, 'id'>> = {
        name: '',
        description: '',
        price: 0,
        icon: 'Gift',
        category: 'especias',
        color: 'blue',
        badge: '',
        legal_terms: '',
        is_active: true
    };

    const [formData, setFormData] = useState<Partial<Omit<StoreItem, 'id'>>>(initialFormState);

    useEffect(() => {
        if (user) {
            fetchItems();
        }
    }, [user]);

    const fetchItems = async () => {
        setFetchingParams(true);
        try {
            const { data, error } = await supabase
                .from('store_items')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            console.error('Error fetching items:', error);
            setMessage({ text: `Error cargando productos: ${error.message}`, type: 'error' });
        } finally {
            setFetchingParams(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setMessage({ text: 'Debes estar logueado para cargar productos.', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // "si lo editas, hacer que se reactive"
            const dataToSave = { ...formData };
            if (editingId) {
                dataToSave.is_active = true;
            }

            if (editingId) {
                const { error } = await supabase
                    .from('store_items')
                    .update(dataToSave)
                    .eq('id', editingId);
                
                if (error) throw error;
                setMessage({ text: 'Producto actualizado exitosamente.', type: 'success' });
            } else {
                const { error } = await supabase.from('store_items').insert(dataToSave);
                if (error) throw error;
                setMessage({ text: 'Producto cargado exitosamente en la tienda.', type: 'success' });
            }

            setFormData(initialFormState);
            setEditingId(null);
            fetchItems();
        } catch (error: any) {
            console.error('Error guardando producto:', error);
            const errorMsg = error.details || error.message || 'Error desconocido';
            setMessage({ 
                text: `Error al guardar: ${errorMsg}. ${error.hint ? `Tip: ${error.hint}` : ''}`, 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: StoreItem) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            icon: item.icon,
            category: item.category,
            color: item.color,
            badge: item.badge || '',
            legal_terms: item.legal_terms || '',
            is_active: item.is_active
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('store_items')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            
            setItems(prev => prev.map(item => item.id === id ? { ...item, is_active: !currentStatus } : item));
            setMessage({ text: `Producto ${!currentStatus ? 'reanudado' : 'suspendido'} exitosamente.`, type: 'success' });
        } catch (error: any) {
            console.error('Error actualizando estado:', error);
            setMessage({ text: `Error: ${error.details || error.message}`, type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        if (!window.confirm("¿Estás seguro de que deseas eliminar este producto permanentemente?")) return;

        try {
            const { error } = await supabase
                .from('store_items')
                .delete()
                .eq('id', id);
            if (error) throw error;
            
            setItems(prev => prev.filter(item => item.id !== id));
            setMessage({ text: 'Producto eliminado exitosamente.', type: 'success' });
            if (editingId === id) {
                handleCancelEdit();
            }
        } catch (error: any) {
            console.error('Error eliminando producto:', error);
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
        }
    };

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/20">
                    <AlertTriangle size={40} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Acceso Denegado</h1>
                <p className="text-zinc-400 max-w-md mx-auto mb-8 font-medium">
                    Debes iniciar sesión con la cuenta de administrador oficial para gestionar la tienda.
                </p>

                <div className="mt-8 flex gap-4">
                    <button 
                        onClick={() => window.location.href = '/'} 
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-white/5"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Settings className="text-blue-500" />
                    Panel de Administración
                </h1>
                <p className="text-zinc-500 font-bold mt-2">Carga y gestión del catálogo de recompensas de Jugátela.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Editor Container */}
                <div className="xl:col-span-1 bg-[#1A1F26] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden h-fit">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            {editingId ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-emerald-500" />}
                            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        {editingId && (
                            <button onClick={handleCancelEdit} title="Cancelar edición" className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-4">
                            {/* Básicos */}
                            <div className="space-y-4 text-white">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 ml-1">Nombre</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Fernet" className="w-full bg-[#12161A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 ml-1">Precio (Tokens)</label>
                                    <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full bg-[#12161A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 ml-1">Descripción</label>
                                    <input required type="text" name="description" value={formData.description} onChange={handleChange} className="w-full bg-[#12161A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>

                            {/* Visuales */}
                            <div className="space-y-4 text-white">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 ml-1">Color Base</label>
                                        <select name="color" value={formData.color} onChange={handleChange} className="w-full bg-[#12161A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                                            <option value="blue">Azul / Genérico</option>
                                            <option value="purple">Violeta / Fernet</option>
                                            <option value="red">Rojo / Fuego</option>
                                            <option value="amber">Ambar / Cerveza</option>
                                            <option value="green">Verde</option>
                                            <option value="zinc">Gris</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 ml-1">Icono</label>
                                        <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="w-full bg-[#12161A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 ml-1">Etiqueta (Opcional)</label>
                                    <input type="text" name="badge" value={formData.badge} onChange={handleChange} className="w-full bg-[#12161A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>

                            {/* Sistema */}
                            <div className="space-y-4 text-white">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 ml-1">Categoría</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#12161A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500">
                                        <option value="especias">Especias</option>
                                        <option value="boosters">Boosters</option>
                                        <option value="cosmeticos">Cosméticos</option>
                                        <option value="premios_fisicos">Premios Físicos</option>
                                    </select>
                                </div>
                                {!editingId && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 rounded bg-[#12161A] border-white/10 accent-emerald-500" />
                                        <label htmlFor="is_active" className="text-sm font-bold text-white cursor-pointer select-none">Activo y Visible inicial</label>
                                    </div>
                                )}
                                {editingId && (
                                    <p className="text-[10px] text-zinc-400 mt-2">* Al guardar la edición, el producto se reactivará automáticamente.</p>
                                )}
                            </div>

                            {/* Legales */}
                            <div className="text-white pt-2">
                                <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 ml-1">Términos (Opcional)</label>
                                <textarea name="legal_terms" rows={3} value={formData.legal_terms} onChange={handleChange} className="w-full bg-[#12161A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 resize-y" />
                            </div>
                        </div>

                        {message && (
                            <div className={cn(
                                "p-3 rounded-xl text-xs font-bold animate-in fade-in zoom-in-95",
                                message.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            )}>
                                {message.text}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                            {loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Producto')}
                        </button>
                    </form>
                </div>

                {/* List Container */}
                <div className="xl:col-span-2 bg-[#1A1F26] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[500px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <ShoppingBag className="text-purple-500" size={20} />
                            Catálogo {items.length > 0 && <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">{items.length}</span>}
                        </h2>
                        <button onClick={fetchItems} disabled={fetchingParams} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
                            <RefreshCw size={18} className={cn(fetchingParams && "animate-spin")} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {fetchingParams && items.length === 0 ? (
                            <div className="flex justify-center items-center h-40">
                                <RefreshCw className="animate-spin text-blue-500" size={32} />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center text-zinc-500 py-12">
                                No hay productos cargados en la base de datos.
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className={cn(
                                    "p-4 rounded-2xl border transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between",
                                    item.is_active ? "bg-[#12161A] border-white/10 hover:border-white/20" : "bg-red-950/20 border-red-500/20 opacity-75"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
                                            item.is_active ? "bg-white/5 text-white" : "bg-red-500/10 text-red-400"
                                        )}>
                                            {item.icon ? <span className="text-xs font-bold uppercase overflow-hidden max-w-full">{item.icon.substring(0,3)}</span> : '🎁'}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold flex items-center gap-2">
                                                {item.name}
                                                {!item.is_active && <span className="text-[10px] uppercase font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Suspendido</span>}
                                            </h3>
                                            <p className="text-zinc-400 text-sm">{item.category} • <span className="text-blue-400 font-bold">{item.price} 🪙</span></p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 self-end md:self-auto">
                                        <button 
                                            onClick={() => handleToggleActive(item.id, item.is_active)}
                                            className={cn(
                                                "p-2 rounded-lg text-sm transition-colors border flex items-center gap-1 font-bold",
                                                item.is_active 
                                                    ? "text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20" 
                                                    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                                            )}
                                            title={item.is_active ? "Suspender (Ocultar)" : "Reanudar (Mostrar)"}
                                        >
                                            {item.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                            <span className="hidden md:inline">{item.is_active ? 'Suspender' : 'Reanudar'}</span>
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="p-2 rounded-lg text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 rounded-lg text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                            title="Eliminar permanentemente"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};
