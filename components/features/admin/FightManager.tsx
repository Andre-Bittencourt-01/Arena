import React, { useState } from 'react';
import Panel from '../../Panel';
import { FightCategory, WeightClass, Fight, Fighter } from '../../../types';
import { useData } from '../../../contexts/DataContext';

interface FightManagerProps {
    editingEventId: string;
    fighters: Fighter[];
    currentEventFights: Fight[];
    setCurrentEventFights: React.Dispatch<React.SetStateAction<Fight[]>>;
    eventLockStatus: 'open' | 'locked' | 'scheduled' | 'cascade';
    cascadeStartTime: string;
    onOpenFighterModal: (target: 'fighter_a' | 'fighter_b') => void;
    // We pass these down so Admin can update them when a new fighter is created (optional but good for future)
    fighter1Id: string;
    setFighter1Id: (id: string) => void;
    fighter2Id: string;
    setFighter2Id: (id: string) => void;
}

const FightManager: React.FC<FightManagerProps> = ({
    editingEventId,
    fighters,
    currentEventFights,
    setCurrentEventFights,
    eventLockStatus,
    cascadeStartTime,
    onOpenFighterModal,
    fighter1Id,
    setFighter1Id,
    fighter2Id,
    setFighter2Id
}) => {
    const { createFight, updateFight, deleteFight, getFightsForEvent } = useData();

    // Fight Form State
    const [editingFightId, setEditingFightId] = useState<string | null>(null);
    const [category, setCategory] = useState<FightCategory>('Main Card');
    const [weightClass, setWeightClass] = useState<WeightClass>('Leve');
    const [rounds, setRounds] = useState(3);
    const [isTitle, setIsTitle] = useState(false);

    // Fight Locking State
    const [fightLockStatus, setFightLockStatus] = useState<'open' | 'locked'>('open');
    const [fightCustomLockTime, setFightCustomLockTime] = useState('');
    const [fightOrder, setFightOrder] = useState(1);

    // DND State
    const [draggedFightIndex, setDraggedFightIndex] = useState<number | null>(null);

    const handleFighterSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, target: 'fighter_a' | 'fighter_b') => {
        const value = e.target.value;
        if (value === 'NEW_FIGHTER') {
            onOpenFighterModal(target);
        } else {
            if (target === 'fighter_a') setFighter1Id(value);
            else setFighter2Id(value);
        }
    };

    const handleCreateOrUpdateFight = async (e: React.FormEvent | null, fightDataOverride?: Fight, skipRefresh = false) => {
        if (e) e.preventDefault();

        if (!editingEventId) return;

        // Validation for manual entry (if not override)
        if (!fightDataOverride) {
            if (!fighter1Id || !fighter2Id) {
                alert("Selecione os dois lutadores!");
                return;
            }
        }

        const fighterA = fighters.find(f => f.id === (fightDataOverride ? fightDataOverride.fighter_a_id : fighter1Id)) || { id: 'UNKNOWN', name: 'Unknown', image_url: '' } as Fighter;
        const fighterB = fighters.find(f => f.id === (fightDataOverride ? fightDataOverride.fighter_b_id : fighter2Id)) || { id: 'UNKNOWN', name: 'Unknown', image_url: '' } as Fighter;

        const fightData: Fight = fightDataOverride || {
            id: editingFightId || Date.now().toString(),
            event_id: editingEventId,
            fighter_a_id: fighterA.id,
            fighter_b_id: fighterB.id,
            fighter_a: fighterA,
            fighter_b: fighterB,
            category,
            weight_class: weightClass,
            rounds,
            is_title: isTitle,
            points: 25,
            lock_status: fightLockStatus,
            custom_lock_time: fightCustomLockTime,
            order: fightOrder
        };

        if (editingFightId || fightDataOverride) {
            await updateFight(fightData);
        } else {
            await createFight(fightData);
        }

        if (!skipRefresh) {
            // Reset inputs
            setFighter1Id(''); setFighter2Id(''); setEditingFightId(null);
            setIsTitle(false); setRounds(3);
            setFightLockStatus('open'); setFightCustomLockTime(''); setFightOrder(1);

            // Refresh
            const fights = await getFightsForEvent(editingEventId);
            // Maintain DESC sort
            setCurrentEventFights(fights.sort((a, b) => (b.order || 0) - (a.order || 0)));
        }
    };

    const handleEditFight = (fight: Fight) => {
        setEditingFightId(fight.id);
        setFighter1Id(fight.fighter_a_id);
        setFighter2Id(fight.fighter_b_id);
        setCategory(fight.category);
        setWeightClass(fight.weight_class);
        setRounds(fight.rounds);
        setIsTitle(fight.is_title || false);
        setFightLockStatus(fight.lock_status || 'open');
        setFightCustomLockTime(fight.custom_lock_time || '');
        setFightOrder(fight.order || (currentEventFights.findIndex(f => f.id === fight.id) + 1));
        document.getElementById('fight-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDeleteFight = async (id: string) => {
        if (confirm('Remover esta luta do card?')) {
            await deleteFight(id);
            if (editingEventId) {
                const fights = await getFightsForEvent(editingEventId);
                setCurrentEventFights(fights);
            }
        }
    };

    const handleCancelFightEdit = () => {
        setEditingFightId(null);
        setFighter1Id(''); setFighter2Id('');
        setIsTitle(false); setRounds(3);
        setFightLockStatus('open'); setFightCustomLockTime('');
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedFightIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (draggedFightIndex === null || draggedFightIndex === index) return;

        const newFights = [...currentEventFights];
        const draggedItem = newFights[draggedFightIndex];

        newFights.splice(draggedFightIndex, 1);
        newFights.splice(index, 0, draggedItem);

        setCurrentEventFights(newFights);
        setDraggedFightIndex(index);
    };

    const handleDragEnd = async () => {
        setDraggedFightIndex(null);
        if (!editingEventId) return;

        const totalFights = currentEventFights.length;
        const updatedFights = currentEventFights.map((f, i) => ({
            ...f,
            order: totalFights - i
        }));

        setCurrentEventFights(updatedFights);

        for (const fight of updatedFights) {
            await handleCreateOrUpdateFight(null, fight, true);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Panel title={editingFightId ? "Editar Luta" : "Adicionar Luta ao Card"} icon={editingFightId ? "edit_note" : "add_box"} id="fight-form">
                        <form onSubmit={(e) => handleCreateOrUpdateFight(e)} className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Canto Vermelho</label>
                                    <select
                                        value={fighter1Id}
                                        onChange={e => handleFighterSelectChange(e, 'fighter_a')}
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
                                        value={fighter2Id}
                                        onChange={e => handleFighterSelectChange(e, 'fighter_b')}
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
                                    <select value={category} onChange={e => setCategory(e.target.value as FightCategory)} className="admin-input">
                                        <option value="Main Event">Main Event</option>
                                        <option value="Co-Main Event">Co-Main Event</option>
                                        <option value="Main Card">Main Card</option>
                                        <option value="Preliminares">Preliminares</option>
                                        <option value="Early Prelims">Early Prelims</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Peso</label>
                                    <select value={weightClass} onChange={e => setWeightClass(e.target.value as WeightClass)} className="admin-input">
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
                                    <select value={rounds} onChange={e => setRounds(parseInt(e.target.value))} className="admin-input">
                                        <option value={3}>3 Rounds</option>
                                        <option value={5}>5 Rounds</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input type="checkbox" checked={isTitle} onChange={e => setIsTitle(e.target.checked)} id="isTitle" className="accent-primary h-4 w-4" />
                                    <label htmlFor="isTitle" className="text-xs uppercase font-bold text-gray-500 cursor-pointer">Cinturão</label>
                                </div>
                            </div>

                            {/* Fight Locking Config */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h4 className="text-xs font-bold text-gray-400 uppercase">Configuração de Trava Individual</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Status Individual</label>
                                        <select value={fightLockStatus} onChange={e => setFightLockStatus(e.target.value as any)} className="admin-input text-xs">
                                            <option value="open">Seguir Evento (Padrão)</option>
                                            <option value="locked">Travado Manualmente</option>
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Trava Personalizada</label>
                                        <input
                                            type="datetime-local"
                                            value={fightCustomLockTime}
                                            onChange={e => setFightCustomLockTime(e.target.value)}
                                            className={`admin-input text-xs ${!fightCustomLockTime && eventLockStatus === 'cascade' ? 'text-blue-300 italic opacity-80' : ''}`}
                                            placeholder={
                                                !fightCustomLockTime && eventLockStatus === 'cascade' && cascadeStartTime
                                                    ? "Calculado (Cascata)"
                                                    : ""
                                            }
                                        />
                                        {!fightCustomLockTime && eventLockStatus === 'cascade' && cascadeStartTime && (
                                            <div className="absolute right-8 top-8 pointer-events-none text-[9px] text-blue-300 bg-black/60 px-1 rounded backdrop-blur-sm">
                                                {new Date(new Date(cascadeStartTime).getTime() + (fightOrder - 1) * 30 * 60000).toLocaleString([], {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                        <p className="text-[9px] text-gray-500 mt-1">
                                            {!fightCustomLockTime && eventLockStatus === 'cascade'
                                                ? <span className="text-blue-400">Calculado via ordem (Cascata)</span>
                                                : "Deixe vazio para usar a Cascata"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Ordem (Cascata)</label>
                                        <input
                                            type="number"
                                            value={fightOrder}
                                            onChange={e => setFightOrder(parseInt(e.target.value))}
                                            className="admin-input text-xs"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className={`admin-btn-primary flex justify-center items-center gap-2 ${editingFightId ? 'bg-blue-600' : 'bg-green-600'}`}>
                                    <span className="material-symbols-outlined">{editingFightId ? 'save' : 'add'}</span>
                                    {editingFightId ? 'Salvar' : 'Adicionar'}
                                </button>
                                {editingFightId && (
                                    <button type="button" onClick={handleCancelFightEdit} className="px-4 bg-gray-600 hover:bg-gray-500 text-white rounded font-bold uppercase text-xs">Cancelar</button>
                                )}
                            </div>
                        </form>
                    </Panel>
                </div>

                <div className="lg:col-span-1">
                    <Panel title="Card Atual (Arrastar para Reordenar)" icon="view_list" className="h-full">
                        <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                                {(currentEventFights || []).length > 0 ? (
                                    (currentEventFights || []).map((fight, i) => {
                                        // Normalização de Exibição
                                        const displayRound = fight.round_end || '';
                                        const displayTime = fight.time || '';
                                        const hasResultInfo = displayRound || displayTime;

                                        console.log('Fight Render:', fight.id, { round_end: fight.round_end, roundEnd: (fight as any).roundEnd });

                                        return (
                                            <div
                                                key={fight.id || i}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, i)}
                                                onDragOver={(e) => handleDragOver(e, i)}
                                                onDragEnd={handleDragEnd}
                                                className={`bg-white/5 border border-white/5 rounded p-3 relative group transition-transform ${draggedFightIndex === i ? 'opacity-50 scale-95 border-primary' : 'hover:border-white/20'}`}
                                            >
                                                <div className="flex items-center gap-1 absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing">
                                                    <span className="material-symbols-outlined">drag_indicator</span>
                                                </div>
                                                <div className="pl-6">
                                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={fight?.order === currentEventFights.length ? "text-primary" : ""}>Order #{fight?.order}</span>
                                                            {i === 0 && <span className="text-[8px] bg-white/10 px-1 rounded text-white/50">Main Event?</span>}
                                                        </div>
                                                        {fight?.is_title && <span className="text-yellow-500 flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">emoji_events</span> Belt</span>}
                                                        <span>{fight?.weight_class}</span>

                                                        {/* Bloco de Resultado (Round/Tempo) */}
                                                        {hasResultInfo && (
                                                            <div className="flex items-center text-[10px] text-gray-500 border-l border-white/10 pl-2 ml-2 font-mono">
                                                                {displayRound && <span className="font-bold text-gray-400">{displayRound}</span>}
                                                                {displayTime && <span className="ml-1 opacity-70">- {displayTime}</span>}
                                                            </div>
                                                        )}
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

                                                    {eventLockStatus === 'cascade' && cascadeStartTime && (
                                                        <div className="mt-2 text-[9px] font-mono text-gray-500 flex items-center gap-1 border-t border-white/5 pt-1">
                                                            <span className="material-symbols-outlined text-[10px]">lock_clock</span>
                                                            <span className="text-gray-400">
                                                                Fecha em: {new Date(new Date(cascadeStartTime).getTime() + ((fight?.order || (i + 1)) - 1) * 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {fight?.order && <span className="opacity-50">(Ord: {fight?.order})</span>}
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                        <button onClick={() => handleEditFight(fight)} className="text-blue-400 hover:text-white"><span className="material-symbols-outlined">edit</span></button>
                                                        <button onClick={() => handleDeleteFight(fight.id)} className="text-red-500 hover:text-white"><span className="material-symbols-outlined">delete</span></button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-500 py-4 text-xs uppercase font-bold">Nenhuma luta cadastrada</p>
                                )}
                            </div>
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default FightManager;
