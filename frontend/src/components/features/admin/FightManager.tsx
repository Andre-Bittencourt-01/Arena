import React, { useState } from 'react';
import Panel from '../../Panel';
import { FightCategory, WeightClass, Fight, Fighter } from '../../../types';
import { useData } from '../../../contexts/DataContext';

interface FightManagerProps {
    editing_event_id: string;
    fighters: Fighter[];
    current_event_fights: Fight[];
    set_current_event_fights: React.Dispatch<React.SetStateAction<Fight[]>>;
    event_lock_status: 'open' | 'locked' | 'scheduled' | 'cascade';
    cascade_start_time: string;
    on_open_fighter_modal: (target: 'fighter_a' | 'fighter_b') => void;
    fighter_1_id: string;
    set_fighter_1_id: (id: string) => void;
    fighter_2_id: string;
    set_fighter_2_id: (id: string) => void;
}

// Helper Function for Status Logic
const get_status_info = (fight: Fight, event_lock_status: string) => {
    const has_time = !!fight.custom_lock_time;
    const status = (fight.lock_status || '').toUpperCase();
    const is_locked = status === 'LOCKED' || status === 'CLOSED';
    const ev_status = (event_lock_status || '').toLowerCase();

    const time = has_time ? new Date(fight.custom_lock_time!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    // 02d: Fechada Manual
    if (is_locked && !has_time) return { label: 'FECHADA (MANUAL)', color: 'text-red-400', bg: 'bg-red-500/20', icon: 'block' };

    // 02c: Aberta Sem Trava
    if (!is_locked && ev_status === 'open' && !has_time) return { label: 'ABERTA (SEM TRAVA)', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: 'lock_open' };

    // 02a/02b: Cascata
    if (ev_status === 'cascade' && has_time) {
        return is_locked
            ? { label: `CASCATA (FECHADA) - ${time}`, color: 'text-blue-300', bg: 'bg-blue-900/40', icon: 'lock' }
            : { label: `CASCATA (ABERTA) - ${time}`, color: 'text-blue-400', bg: 'bg-blue-500/20', icon: 'bolt' };
    }

    // 02e/02f: Agendada
    if (has_time) {
        return is_locked
            ? { label: `AGENDADA (FECHADA) - ${time}`, color: 'text-purple-300', bg: 'bg-purple-900/40', icon: 'lock_clock' }
            : { label: `AGENDADA (ABERTA) - ${time}`, color: 'text-purple-400', bg: 'bg-purple-500/10', icon: 'event' };
    }

    return { label: 'PENDENTE', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: 'warning' };
};

const FightManager: React.FC<FightManagerProps> = ({
    editing_event_id,
    fighters,
    current_event_fights,
    set_current_event_fights,
    event_lock_status,
    cascade_start_time,
    on_open_fighter_modal,
    fighter_1_id,
    set_fighter_1_id,
    fighter_2_id,
    set_fighter_2_id
}) => {
    const { create_fight, update_fight, delete_fight, get_fights_for_event, reorder_fights, refresh_data, loading } = useData();

    // Fight Form State
    const [editing_fight_id, set_editing_fight_id] = useState<string | null>(null);
    const [category, set_category] = useState<FightCategory>('Main Card');
    const [weight_class, set_weight_class] = useState<WeightClass>('Leve');
    const [rounds, set_rounds] = useState(3);
    const [is_title, set_is_title] = useState(false);

    // Fight Locking State
    const [fight_lock_status, set_fight_lock_status] = useState<'open' | 'locked'>('open');
    const [fight_custom_lock_time, set_fight_custom_lock_time] = useState('');
    const [fight_order, set_fight_order] = useState(1);

    // DND State
    const [dragged_fight_index, set_dragged_fight_index] = useState<number | null>(null);

    const handle_fighter_select_change = (e: React.ChangeEvent<HTMLSelectElement>, target: 'fighter_a' | 'fighter_b') => {
        const value = e.target.value;
        if (value === 'NEW_FIGHTER') {
            on_open_fighter_modal(target);
        } else {
            if (target === 'fighter_a') set_fighter_1_id(value);
            else set_fighter_2_id(value);
        }
    };

    const handle_create_or_update_fight = async (e: React.FormEvent | null, fight_data_override?: Fight, skip_refresh = false) => {
        if (e) e.preventDefault();

        if (!editing_event_id) return;

        if (!fight_data_override) {
            if (!fighter_1_id || !fighter_2_id) {
                alert("Selecione os dois lutadores!");
                return;
            }
        }

        const fighter_a = fighters.find(f => f.id === (fight_data_override ? fight_data_override.fighter_a_id : fighter_1_id)) || { id: 'UNKNOWN', name: 'Unknown', image_url: '' } as Fighter;
        const fighter_b = fighters.find(f => f.id === (fight_data_override ? fight_data_override.fighter_b_id : fighter_2_id)) || { id: 'UNKNOWN', name: 'Unknown', image_url: '' } as Fighter;

        const fight_data: Fight = fight_data_override || {
            id: editing_fight_id || Date.now().toString(),
            event_id: editing_event_id,
            fighter_a_id: fighter_a.id,
            fighter_b_id: fighter_b.id,
            fighter_a: fighter_a,
            fighter_b: fighter_b,
            category,
            weight_class,
            rounds,
            is_title: is_title,
            points: 25,
            lock_status: fight_lock_status,
            custom_lock_time: fight_custom_lock_time,
            order: fight_order
        };

        if (editing_fight_id || fight_data_override) {
            await update_fight(fight_data);
        } else {
            await create_fight(fight_data);
        }

        if (!skip_refresh) {
            // Reset inputs
            set_fighter_1_id(''); set_fighter_2_id(''); set_editing_fight_id(null);
            set_is_title(false); set_rounds(3);
            set_fight_lock_status('open'); set_fight_custom_lock_time(''); set_fight_order(1);

            // Refresh
            const fights = await get_fights_for_event(editing_event_id);
            // Maintain DESC sort
            set_current_event_fights(fights.sort((a, b) => (b.order || 0) - (a.order || 0)));
        }
    };

    const handle_edit_fight = (fight: Fight) => {
        set_editing_fight_id(fight.id);
        set_fighter_1_id(fight.fighter_a_id);
        set_fighter_2_id(fight.fighter_b_id);
        set_category(fight.category);
        set_weight_class(fight.weight_class);
        set_rounds(fight.rounds);
        set_is_title(fight.is_title || false);
        set_fight_lock_status(fight.lock_status || 'open');
        set_fight_custom_lock_time(fight.custom_lock_time || '');
        set_fight_order(fight.order || (current_event_fights.findIndex(f => f.id === fight.id) + 1));
        document.getElementById('fight-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handle_delete_fight = async (id: string) => {
        if (confirm('Remover esta luta do card?')) {
            await delete_fight(id);
            if (editing_event_id) {
                const fights = await get_fights_for_event(editing_event_id);
                set_current_event_fights(fights);
            }
        }
    };

    const handle_cancel_fight_edit = () => {
        set_editing_fight_id(null);
        set_fighter_1_id(''); set_fighter_2_id('');
        set_is_title(false); set_rounds(3);
        set_fight_lock_status('open'); set_fight_custom_lock_time('');
    };

    const handle_drag_start = (e: React.DragEvent, index: number) => {
        set_dragged_fight_index(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    };

    const handle_drag_over = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (dragged_fight_index === null || dragged_fight_index === index) return;

        const new_fights = [...current_event_fights];
        const dragged_item = new_fights[dragged_fight_index];

        new_fights.splice(dragged_fight_index, 1);
        new_fights.splice(index, 0, dragged_item);

        set_current_event_fights(new_fights);
        set_dragged_fight_index(index);
    };

    const handle_drag_end = async () => {
        set_dragged_fight_index(null);
        if (!editing_event_id) return;

        // 1. Atualiza a ordem visual sequencialmente
        // OBS: O array current_event_fights JÁ está reordenado pelo handle_drag_over
        const updated = current_event_fights.map((f, i) => ({
            ...f,
            order: i + 1
        }));

        set_current_event_fights(updated);

        // 2. DISPARO DE PERSISTÊNCIA (Ação necessária)
        try {
            await reorder_fights(updated.map(f => ({ id: f.id, order: f.order })));
            console.log("✅ [UI] Ordem sincronizada no banco de dados.");

            // 3. AUTO-REFRESH (Piscadinha para atualizar horários)
            const fresh = await get_fights_for_event(editing_event_id);
            set_current_event_fights(fresh);

        } catch (error) {
            console.error("❌ [UI] Erro ao salvar ordem:", error);
            alert("Erro ao salvar ordem. Veja console.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header com Sync Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">sports_mma</span>
                        Gerenciamento de Lutas
                    </h2>
                    <p className="text-gray-400 text-sm">Arraste para reordenar (Cascata Inteligente)</p>
                </div>
                <button
                    onClick={() => refresh_data && refresh_data()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    Sincronizar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Panel title={editing_fight_id ? "Editar Luta" : "Adicionar Luta ao Card"} icon={editing_fight_id ? "edit_note" : "add_box"} id="fight-form">
                        <form onSubmit={(e) => handle_create_or_update_fight(e)} className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Canto Vermelho</label>
                                    <select
                                        value={fighter_1_id}
                                        onChange={e => handle_fighter_select_change(e, 'fighter_a')}
                                        className="admin-input"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="NEW_FIGHTER" className="text-primary font-bold">+ NOVO LUTADOR</option>
                                        {fighters.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Canto Azul</label>
                                    <select
                                        value={fighter_2_id}
                                        onChange={e => handle_fighter_select_change(e, 'fighter_b')}
                                        className="admin-input"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="NEW_FIGHTER" className="text-primary font-bold">+ NOVO LUTADOR</option>
                                        {fighters.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Categoria (Card)</label>
                                    <select value={category} onChange={e => set_category(e.target.value as FightCategory)} className="admin-input">
                                        <option value="Main Event">Main Event</option>
                                        <option value="Co-Main Event">Co-Main Event</option>
                                        <option value="Main Card">Main Card</option>
                                        <option value="Preliminares">Preliminares</option>
                                        <option value="Early Prelims">Early Prelims</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Peso</label>
                                    <select value={weight_class} onChange={e => set_weight_class(e.target.value as WeightClass)} className="admin-input">
                                        <option value="Peso Mosca">Mosca</option>
                                        <option value="Peso Galo">Galo</option>
                                        <option value="Peso Pena">Pena</option>
                                        <option value="Peso Leve">Leve</option>
                                        <option value="Peso Meio-Médio">Meio-Médio</option>
                                        <option value="Peso Médio">Médio</option>
                                        <option value="Peso Meio-Pesado">Meio-Pesado</option>
                                        <option value="Peso Pesado">Pesado</option>
                                        <option value="Peso Palha Feminino">Palha (F)</option>
                                        <option value="Peso Mosca Feminino">Mosca (F)</option>
                                        <option value="Peso Galo Feminino">Galo (F)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Rounds</label>
                                    <select value={rounds} onChange={e => set_rounds(parseInt(e.target.value))} className="admin-input">
                                        <option value={3}>3 Rounds</option>
                                        <option value={5}>5 Rounds</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input type="checkbox" checked={is_title} onChange={e => set_is_title(e.target.checked)} id="is_title" className="accent-primary h-4 w-4" />
                                    <label htmlFor="is_title" className="text-xs uppercase font-bold text-gray-500 cursor-pointer">Cinturão</label>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h4 className="text-xs font-bold text-gray-400 uppercase">Configuração de Trava Individual</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Status Individual</label>
                                        <select value={fight_lock_status} onChange={e => set_fight_lock_status(e.target.value as any)} className="admin-input text-xs">
                                            <option value="open">Seguir Evento (Padrão)</option>
                                            <option value="locked">Travado Manualmente</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Trava Personalizada</label>
                                        <input
                                            type="datetime-local"
                                            value={fight_custom_lock_time}
                                            onChange={e => set_fight_custom_lock_time(e.target.value)}
                                            className={`admin-input text-xs ${!fight_custom_lock_time && event_lock_status === 'cascade' ? 'text-blue-300 italic opacity-80' : ''}`}
                                            placeholder={
                                                !fight_custom_lock_time && event_lock_status === 'cascade' && cascade_start_time
                                                    ? "Calculado (Cascata)"
                                                    : ""
                                            }
                                        />
                                        {!fight_custom_lock_time && event_lock_status === 'cascade' && cascade_start_time && (
                                            <div className="absolute right-8 top-8 pointer-events-none text-[9px] text-blue-300 bg-black/60 px-1 rounded backdrop-blur-sm">
                                                {new Date(new Date(cascade_start_time).getTime() + (fight_order - 1) * 30 * 60000).toLocaleString([], {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                        <p className="text-[9px] text-gray-500 mt-1">
                                            {!fight_custom_lock_time && event_lock_status === 'cascade'
                                                ? <span className="text-blue-400">Calculado via ordem (Cascata)</span>
                                                : "Deixe vazio para usar a Cascata"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Ordem (Cascata)</label>
                                        <input
                                            type="number"
                                            value={fight_order}
                                            onChange={e => set_fight_order(parseInt(e.target.value))}
                                            className="admin-input text-xs"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className={`admin-btn-primary flex justify-center items-center gap-2 ${editing_fight_id ? 'bg-blue-600' : 'bg-green-600'}`}>
                                    <span className="material-symbols-outlined">{editing_fight_id ? 'save' : 'add'}</span>
                                    {editing_fight_id ? 'Salvar' : 'Adicionar'}
                                </button>
                                {editing_fight_id && (
                                    <button type="button" onClick={handle_cancel_fight_edit} className="px-4 bg-gray-600 hover:bg-gray-500 text-white rounded font-bold uppercase text-xs">Cancelar</button>
                                )}
                            </div>
                        </form>
                    </Panel>
                </div>

                <div className="lg:col-span-1">
                    <Panel title="Card Atual (Arrastar para Reordenar)" icon="view_list" className="h-full">
                        <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-gray-500 py-4">Carregando lutas...</p>
                            ) : (
                                <>
                                    {(current_event_fights || []).length > 0 ? (
                                        (current_event_fights || []).map((fight, i) => {
                                            const statusInfo = get_status_info(fight, event_lock_status);

                                            return (
                                                <div
                                                    key={fight.id || i}
                                                    draggable
                                                    onDragStart={(e) => handle_drag_start(e, i)}
                                                    onDragOver={(e) => handle_drag_over(e, i)}
                                                    onDragEnd={handle_drag_end}
                                                    className={`bg-white/5 border border-white/5 rounded p-3 relative group transition-transform ${dragged_fight_index === i ? 'opacity-50 scale-95 border-primary' : 'hover:border-white/20'}`}
                                                >
                                                    <div className="flex items-center gap-1 absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing">
                                                        <span className="material-symbols-outlined">drag_indicator</span>
                                                    </div>
                                                    <div className="pl-6">
                                                        {/* Header: Order + Status Info */}
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`text-[10px] uppercase font-bold mt-1 ${fight?.order === current_event_fights.length ? "text-primary" : "text-gray-500"}`}>Order #{fight?.order}</span>

                                                            {/* Status Badges & Time Block */}
                                                            <div className="flex flex-col gap-1 items-end mt-1">
                                                                <span className={`${statusInfo.bg} ${statusInfo.color} text-[9px] px-1.5 py-0.5 rounded border border-white/10 font-bold uppercase flex items-center gap-1`}>
                                                                    <span className="material-symbols-outlined text-[10px]">{statusInfo.icon}</span> {statusInfo.label}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-1 mb-2">
                                                            <span className={`text-xs font-bold truncate w-20 ${fight?.winner_id === fight?.fighter_a_id ? 'text-green-500' : 'text-white'}`}>
                                                                {fight?.fighter_a?.name?.split(' ').pop() || 'Unknown'}
                                                                {fight?.winner_id === fight?.fighter_a_id && <span className="ml-1 text-[8px] align-top">🏆</span>}
                                                            </span>
                                                            <span className="text-[10px] text-primary font-bold">VS</span>
                                                            <span className={`text-xs font-bold truncate w-20 text-right ${fight?.winner_id === fight?.fighter_b_id ? 'text-green-500' : 'text-white'}`}>
                                                                {fight?.winner_id === fight?.fighter_b_id && <span className="mr-1 text-[8px] align-top">🏆</span>}
                                                                {fight?.fighter_b?.name?.split(' ').pop() || 'Unknown'}
                                                            </span>
                                                        </div>

                                                        {fight?.result && (
                                                            <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                                                                <div className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${fight?.result === 'win' ? 'bg-green-500/10 text-green-500' :
                                                                    fight?.result === 'draw' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                        'bg-gray-500/10 text-gray-400'
                                                                    }`}>
                                                                    {fight?.result === 'win' ? 'Vitória' : fight?.result === 'draw' ? 'Empate' : 'No Contest'}
                                                                </div>
                                                                <div className="text-[9px] text-gray-400 truncate max-w-[120px]">
                                                                    {fight?.method}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 bg-black/90 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                            <button onClick={() => handle_edit_fight(fight)} className="text-blue-400 hover:text-white"><span className="material-symbols-outlined">edit</span></button>
                                                            <button onClick={() => handle_delete_fight(fight.id)} className="text-red-500 hover:text-white"><span className="material-symbols-outlined">delete</span></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-center text-gray-500 py-4 text-xs uppercase font-bold">Nenhuma luta cadastrada</p>
                                    )}
                                </>
                            )}
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default FightManager;
