import React, { useState, useEffect } from 'react';
import Panel from '../../Panel';
import { Fight, Event as UFCEvent, Fighter } from '../../../types';

interface PicksManagerProps {
    events: UFCEvent[];
    fighters: Fighter[];
    getAllPicksForEvent: (eventId: string) => Promise<any[]>;
    getFightsForEvent: (eventId: string) => Promise<Fight[]>;
    updatePick: (pick: any) => Promise<void>;
    onBack: () => void;
}

const PicksManager: React.FC<PicksManagerProps> = ({
    events,
    fighters,
    getAllPicksForEvent,
    getFightsForEvent,
    updatePick,
    onBack
}) => {
    // Picks Management State
    const [selectedEventForPicks, setSelectedEventForPicks] = useState<string>('');
    const [eventPicks, setEventPicks] = useState<any[]>([]);
    const [filteredPicks, setFilteredPicks] = useState<any[]>([]);
    const [loadingPicks, setLoadingPicks] = useState(false);

    // Filters
    const [selectedUserFilter, setSelectedUserFilter] = useState('');
    const [selectedFightFilter, setSelectedFightFilter] = useState('');

    // Editing
    const [editingPickId, setEditingPickId] = useState<string | null>(null);
    const [editPointsValue, setEditPointsValue] = useState<number>(0);
    const [editNoteValue, setEditNoteValue] = useState<string>('');

    const [fightsMap, setFightsMap] = useState<Record<string, Fight>>({});

    // Load Picks AND Fights to map names
    useEffect(() => {
        const loadPicksAndFights = async () => {
            if (selectedEventForPicks) {
                setLoadingPicks(true);
                try {
                    const [picks, fights] = await Promise.all([
                        getAllPicksForEvent(selectedEventForPicks),
                        getFightsForEvent(selectedEventForPicks)
                    ]);

                    setEventPicks(picks);
                    setFilteredPicks(picks);

                    // Create Fight ID -> Fight Object map
                    const mapping: Record<string, Fight> = {};
                    fights.forEach(f => {
                        mapping[f.id] = f;
                    });
                    setFightsMap(mapping);

                } catch (error) {
                    console.error("Error loading picks and fights:", error);
                } finally {
                    setLoadingPicks(false);
                }
            } else {
                setEventPicks([]);
                setFilteredPicks([]);
                setFightsMap({});
            }
        };
        loadPicksAndFights();
    }, [selectedEventForPicks, getAllPicksForEvent, getFightsForEvent]);

    // Apply Filters
    useEffect(() => {
        let result = eventPicks;

        if (selectedUserFilter) {
            result = result.filter(p => p.user_id === selectedUserFilter);
        }

        if (selectedFightFilter) {
            result = result.filter(p => p.fight_id === selectedFightFilter);
        }

        setFilteredPicks(result);
    }, [selectedUserFilter, selectedFightFilter, eventPicks]);

    // Unique Users for Dropdown
    const uniqueUsers = Array.from(new Set(eventPicks.map(p => p.user_id))).sort();

    // Unique Fights for Dropdown
    const uniqueFightIds = Array.from(new Set(eventPicks.map(p => p.fight_id))).sort();

    const handleUpdatePickPoints = async (pick: any) => {
        if (editPointsValue < 0) return;

        await updatePick({
            ...pick,
            points_earned: editPointsValue,
            admin_note: editNoteValue
        });

        // Update local state
        const updateList = (list: any[]) => list.map(p =>
            p.id === pick.id ? { ...p, points_earned: editPointsValue, admin_note: editNoteValue } : p
        );

        setEventPicks(prev => updateList(prev));
        setEditingPickId(null);
    };

    const startEditing = (pick: any) => {
        setEditingPickId(pick.id);
        setEditPointsValue(pick.points_earned || 0);
        setEditNoteValue(pick.admin_note || '');
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                </button>
                <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                    Gerenciamento de Palpites
                </h1>
            </div>

            <Panel title="Corrigir Pontuações" icon="fact_check">
                <div className="p-4 space-y-6">
                    {/* Event Selector */}
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Selecione o Evento</label>
                        <select
                            value={selectedEventForPicks}
                            onChange={e => setSelectedEventForPicks(e.target.value)}
                            className="admin-input"
                        >
                            <option value="">Selecione um evento...</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Bar */}
                    {selectedEventForPicks && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Filtrar por Usuário (Opcional)</label>
                                <select
                                    value={selectedUserFilter}
                                    onChange={e => setSelectedUserFilter(e.target.value)}
                                    className="admin-input"
                                >
                                    <option value="">Todos os Usuários</option>
                                    {uniqueUsers.map(userId => (
                                        <option key={userId} value={userId}>{userId}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Filtrar por Luta (Opcional)</label>
                                <select
                                    value={selectedFightFilter}
                                    onChange={e => setSelectedFightFilter(e.target.value)}
                                    className="admin-input"
                                >
                                    <option value="">Todas as Lutas</option>
                                    {uniqueFightIds.map(fightId => {
                                        const f = fightsMap[fightId];
                                        const label = f ? `${f.fighter_a.name} vs ${f.fighter_b.name}` : `Luta ID: ${fightId}`;
                                        return (
                                            <option key={fightId} value={fightId}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Fight Result Display Box */}
                    {selectedFightFilter && fightsMap[selectedFightFilter] && (
                        <div className="bg-white/5 border border-white/10 rounded p-4 mb-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Resultado da Luta</h4>
                            {fightsMap[selectedFightFilter].winner_id ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Vencedor</p>
                                        <p className="text-primary font-bold text-lg">
                                            {fighters.find(f => f.id === fightsMap[selectedFightFilter].winner_id)?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Método</p>
                                        <p className="text-white font-mono">{fightsMap[selectedFightFilter].method || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Round</p>
                                        <p className="text-white font-mono">{fightsMap[selectedFightFilter].round_end || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Tempo</p>
                                        <p className="text-white font-mono">{fightsMap[selectedFightFilter].time || '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-2 rounded">
                                    <span className="material-symbols-outlined">pending</span>
                                    <span className="font-bold uppercase text-sm">Luta ainda aguardando resultado</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Picks Table */}
                    {selectedEventForPicks && (
                        <div className="border border-white/10 rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-xs text-gray-400 uppercase font-bold border-b border-white/10">
                                        <th className="p-3">Info / Categoria</th>
                                        <th className="p-3">Usuário</th>
                                        <th className="p-3">Luta (Palpite)</th>
                                        <th className="p-3">Método</th>
                                        <th className="p-3">Round</th>
                                        <th className="p-3 w-48">Pontos / Anotação</th>
                                        <th className="p-3 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {loadingPicks ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Carregando palpites...</td></tr>
                                    ) : filteredPicks.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum palpite encontrado.</td></tr>
                                    ) : (
                                        filteredPicks.map(pick => {
                                            const fight = fightsMap[pick.fight_id];
                                            const hasResult = fight && !!fight.winner_id;

                                            const getStyle = (isCorrect: boolean) => {
                                                if (!hasResult) return 'text-gray-400';
                                                return isCorrect ? 'text-green-500 font-bold' : 'text-red-500 line-through decoration-red-500/50';
                                            };

                                            const isFighterCorrect = hasResult && fight.winner_id === pick.fighter_id;
                                            const isMethodCorrect = isFighterCorrect && hasResult && fight.method?.includes(pick.method);
                                            let isRoundCorrect = false;
                                            if (isMethodCorrect && hasResult) {
                                                if (fight.method?.includes('DEC')) {
                                                    isRoundCorrect = (fight.method?.includes(pick.round || '')) || false;
                                                } else {
                                                    isRoundCorrect = fight.round_end === pick.round;
                                                }
                                            }

                                            return (
                                                <tr key={pick.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-3 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            {fight && fight.is_title && (
                                                                <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-fit flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[10px]">emoji_events</span> Cinturão
                                                                </span>
                                                            )}
                                                            {fight && fight.category === 'Main Event' && !fight.is_title && (
                                                                <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-fit flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[10px]">star</span> Main Event
                                                                </span>
                                                            )}
                                                            {!fight?.is_title && fight?.category !== 'Main Event' && (
                                                                <span className="text-gray-600 text-[10px] uppercase font-bold">{fight?.category || '-'}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-mono text-xs text-secondary-400 font-bold">{pick.user_id}</td>
                                                    <td className="p-3">
                                                        <div className="text-secondary-400 text-[10px] mb-0.5 uppercase tracking-wider font-bold">
                                                            {fight ? `${fight.fighter_a.name} vs ${fight.fighter_b.name}` : pick.fight_id}
                                                        </div>
                                                        <div className={`font-bold text-lg ${getStyle(isFighterCorrect)}`}>{
                                                            fighters.find(f => f.id === pick.fighter_id)?.name || pick.fighter_id
                                                        }</div>
                                                    </td>
                                                    <td className={`p-3 text-xs ${getStyle(isMethodCorrect)}`}>
                                                        {pick.method}
                                                    </td>
                                                    <td className={`p-3 text-xs ${getStyle(isRoundCorrect)}`}>
                                                        {pick.round}
                                                    </td>
                                                    <td className="p-3">
                                                        {editingPickId === pick.id ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-500">Pts:</span>
                                                                    <input
                                                                        type="number"
                                                                        value={editPointsValue}
                                                                        onChange={e => setEditPointsValue(parseInt(e.target.value))}
                                                                        className="w-16 bg-black border border-primary text-white text-center p-1 rounded text-xs"
                                                                    />
                                                                </div>
                                                                <textarea
                                                                    value={editNoteValue}
                                                                    onChange={e => setEditNoteValue(e.target.value)}
                                                                    placeholder="Motivo da alteração..."
                                                                    className="w-full bg-black/50 border border-white/10 rounded p-1 text-xs text-white resize-none"
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="font-bold text-white text-lg">{pick.points_earned || 0}</div>
                                                                {pick.admin_note && (
                                                                    <div className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1 py-0.5 rounded mt-1 inline-block">
                                                                        Nota: {pick.admin_note}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center align-top pt-4">
                                                        {editingPickId === pick.id ? (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => handleUpdatePickPoints(pick)}
                                                                    className="p-1 bg-green-500/20 text-green-500 rounded hover:bg-green-500/40"
                                                                    title="Salvar"
                                                                >
                                                                    <span className="material-symbols-outlined !text-sm">check</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingPickId(null)}
                                                                    className="p-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/40"
                                                                    title="Cancelar"
                                                                >
                                                                    <span className="material-symbols-outlined !text-sm">close</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => startEditing(pick)}
                                                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                                                title="Editar Pontos"
                                                            >
                                                                <span className="material-symbols-outlined !text-sm">edit</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Panel>
        </>
    );
};

export default PicksManager;
