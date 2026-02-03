import React, { useState, useEffect } from 'react';
import Panel from '../../Panel';
import { Fight, Event as UFCEvent, Fighter } from '../../../types';

interface ResultsManagerProps {
    events: UFCEvent[];
    fighters: Fighter[];
    getFightsForEvent: (eventId: string) => Promise<Fight[]>;
    updateFight: (fight: Fight) => Promise<void>;
    onBack: () => void;
}

const ResultsManager: React.FC<ResultsManagerProps> = ({
    events,
    fighters,
    getFightsForEvent,
    updateFight,
    onBack
}) => {
    const [resultsEventId, setResultsEventId] = useState('');
    const [currentEventFights, setCurrentEventFights] = useState<Fight[]>([]);
    const [editingResultFightId, setEditingResultFightId] = useState<string | null>(null);

    // Edit State
    const [resultType, setResultType] = useState<string>(''); // KO/TKO, SUB, DEC, DRAW, NC
    const [resultWinnerId, setResultWinnerId] = useState('');
    const [resultDetail, setResultDetail] = useState(''); // Round Number or Decision Type
    const [resultTime, setResultTime] = useState('');

    useEffect(() => {
        const loadFights = async () => {
            if (resultsEventId) {
                const fights = await getFightsForEvent(resultsEventId);
                setCurrentEventFights(fights);
            } else {
                setCurrentEventFights([]);
            }
        };
        loadFights();
    }, [resultsEventId, getFightsForEvent]);

    const startEditingResult = (fight: Fight) => {
        setEditingResultFightId(fight.id);
        const methodUpper = (fight.method || '').toUpperCase();

        // 1. Determine Result Type
        if (fight.result === 'nc') setResultType('NC');
        else if (fight.result === 'draw') setResultType('DRAW');
        else if (methodUpper.includes('DEC')) setResultType('DEC');
        else if (methodUpper.includes('SUB')) setResultType('SUB');
        else if (methodUpper.includes('KO')) setResultType('KO');
        else setResultType('');

        setResultWinnerId(fight.winner_id || '');

        // 2. Determine Detail (Round or Dec Type)
        const roundEndUpper = (fight.round_end || '').toUpperCase();

        if (resultType === 'DEC' || resultType === 'DRAW') {
            if (methodUpper.includes('UNA') || methodUpper.includes('UNI') || roundEndUpper.includes('UNA') || roundEndUpper.includes('UNI')) setResultDetail('Unânime');
            else if (methodUpper.includes('SPLIT') || methodUpper.includes('DIV') || roundEndUpper.includes('SPLIT') || roundEndUpper.includes('DIV')) setResultDetail('Dividida');
            else if (methodUpper.includes('MAJ') || roundEndUpper.includes('MAJ')) setResultDetail('Majoritária');
            else if (methodUpper.includes('TEC') || roundEndUpper.includes('TEC')) setResultDetail('Técnica');
            else setResultDetail('');
        } else {
            // Extract Round Number - Only if not DEC/DRAW to avoid mapping "Unânime" to ""
            setResultDetail(fight.round_end ? fight.round_end.replace('R', '') : '');
        }

        setResultTime(fight.time || '');
    };

    const handleSaveResult = async (fight: Fight) => {
        let finalResult: Fight['result'] = 'win';
        let finalMethod = '';
        let finalRoundEnd = '';
        let finalWinnerId = resultWinnerId;

        if (resultType === 'NC') {
            finalResult = 'nc';
            finalMethod = 'Sem Resultado';
            finalWinnerId = undefined as any;
            finalRoundEnd = '';
        } else if (resultType === 'DRAW') {
            finalResult = 'draw';
            finalMethod = 'Empate';
            finalWinnerId = undefined as any;
            finalRoundEnd = resultDetail; // "Unânime", "Dividida", etc.
        } else if (resultType === 'DEC') {
            finalResult = 'win';
            finalMethod = 'Decisão';
            finalRoundEnd = resultDetail;
        } else {
            // KO or SUB
            finalResult = 'win';
            finalMethod = resultType === 'KO' ? 'KO' : 'SUB';
            finalRoundEnd = `R${resultDetail}`;
        }

        await updateFight({
            ...fight,
            winner_id: finalWinnerId,
            result: finalResult,
            method: finalMethod,
            round_end: finalRoundEnd,
            time: resultTime
        });

        alert('Resultado salvo! Pontuações recalculadas.');
        setEditingResultFightId(null);

        // Refresh
        const fights = await getFightsForEvent(resultsEventId);
        setCurrentEventFights(fights);
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                </button>
                <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                    Gerenciar Resultados
                </h1>
            </div>

            <Panel title="Definir Resultados das Lutas" icon="scoreboard">
                <div className="p-4 space-y-6">
                    {/* Event Selector */}
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Selecione o Evento</label>
                        <select
                            value={resultsEventId}
                            onChange={e => setResultsEventId(e.target.value)}
                            className="admin-input"
                        >
                            <option value="">Selecione um evento...</option>
                            {Array.isArray(events) && events.length > 0 ? (
                                events.map(event => (
                                    <option key={event.id} value={event.id}>{event?.title || 'Sem título'} - {event?.subtitle || ''}</option>
                                ))
                            ) : (
                                <option value="" disabled>Nenhum evento carregado</option>
                            )}
                        </select>
                    </div>

                    {/* Fights List */}
                    {resultsEventId && (
                        <div className="space-y-4">
                            {!Array.isArray(currentEventFights) || currentEventFights.length === 0 ? (
                                <p className="text-gray-500 text-sm">Nenhuma luta encontrada neste evento.</p>
                            ) : (
                                currentEventFights.map(fight => {
                                    const isEditing = editingResultFightId === fight.id;

                                    return (
                                        <div key={fight.id} className={`p-4 rounded border ${isEditing ? 'bg-white/10 border-primary' : 'bg-white/5 border-white/5'}`}>
                                            {/* Fight Header Info */}
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`text-right p-2 rounded transition-colors ${fight.winner_id && fight.fighter_a_id && fight.winner_id === fight.fighter_a_id ? 'bg-green-500/10 border border-green-500/50' : ''}`}>
                                                        <p className={`font-bold uppercase ${fight.winner_id && fight.fighter_a_id && fight.winner_id === fight.fighter_a_id ? 'text-green-500' : 'text-white'}`}>
                                                            {fight?.fighter_a?.name || 'Unknown A'}
                                                            {fight.winner_id && fight.fighter_a_id && fight.winner_id === fight.fighter_a_id && <span className="ml-1 text-[10px]">🏆</span>}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-bold">VS</span>
                                                    <div className={`text-left p-2 rounded transition-colors ${fight.winner_id && fight.fighter_b_id && fight.winner_id === fight.fighter_b_id ? 'bg-green-500/10 border border-green-500/50' : ''}`}>
                                                        <p className={`font-bold uppercase ${fight.winner_id && fight.fighter_b_id && fight.winner_id === fight.fighter_b_id ? 'text-green-500' : 'text-white'}`}>
                                                            {fight.winner_id && fight.fighter_b_id && fight.winner_id === fight.fighter_b_id && <span className="mr-1 text-[10px]">🏆</span>}
                                                            {fight?.fighter_b?.name || 'Unknown B'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {!isEditing && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Método</p>
                                                            <p className="text-xs font-mono text-white">{fight.method || '-'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">
                                                                {(fight.method === 'Decisão' || fight.method === 'Empate') ? 'Tipo' : 'Round'}
                                                            </p>
                                                            <p className="text-xs font-mono text-white">{fight.round_end || '-'}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => startEditingResult(fight)}
                                                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs uppercase font-bold text-white transition-colors"
                                                        >
                                                            Editar Resultado
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Edit Form */}
                                            {isEditing && (
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">

                                                    {/* 1. Result Type */}
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Tipo de Resultado</label>
                                                        <select
                                                            value={resultType}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                setResultType(val);
                                                                setResultDetail(''); // Reset detail on type change
                                                                if (val === 'NC' || val === 'DRAW') setResultWinnerId('');
                                                            }}
                                                            className="admin-input"
                                                        >
                                                            <option value="">Selecione...</option>
                                                            <option value="KO">KO (Nocaute)</option>
                                                            <option value="SUB">SUB (Finalização)</option>
                                                            <option value="DEC">Decisão</option>
                                                            <option value="DRAW">Empate</option>
                                                            <option value="NC">Sem Resultado (NC)</option>
                                                        </select>
                                                    </div>

                                                    {/* 2. Winner (Conditional) */}
                                                    {(resultType === 'KO' || resultType === 'SUB' || resultType === 'DEC') && (
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Vencedor 🏆</label>
                                                            <select
                                                                value={resultWinnerId}
                                                                onChange={e => setResultWinnerId(e.target.value)}
                                                                className={`admin-input ${resultWinnerId ? 'border-green-500 bg-green-500/5' : ''}`}
                                                            >
                                                                <option value="">Selecione...</option>
                                                                <option value={fight.fighter_a_id}>{fight?.fighter_a?.name || 'Fighter A'}</option>
                                                                <option value={fight.fighter_b_id}>{fight?.fighter_b?.name || 'Fighter B'}</option>
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* 3. Detail/Round (Conditional) */}
                                                    {resultType !== 'NC' && resultType !== '' && (
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                                                                {(resultType === 'DEC' || resultType === 'DRAW') ? 'Tipo' : 'Round'}
                                                            </label>
                                                            <select
                                                                value={resultDetail}
                                                                onChange={e => setResultDetail(e.target.value)}
                                                                className="admin-input"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                {(resultType === 'DEC' || resultType === 'DRAW') ? (
                                                                    <>
                                                                        <option value="Unânime">Unânime</option>
                                                                        <option value="Dividida">Dividida</option>
                                                                        <option value="Majoritária">Majoritária</option>
                                                                        <option value="Técnica">Técnica</option>
                                                                    </>
                                                                ) : (
                                                                    // Generate Rounds based on fight duration
                                                                    Array.from({ length: fight.rounds || 3 }).map((_, i) => (
                                                                        <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                                                                    ))
                                                                )}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-end gap-2">
                                                        <button
                                                            onClick={() => handleSaveResult(fight)}
                                                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded flex-1 flex justify-center items-center"
                                                            title="Salvar"
                                                            disabled={
                                                                !resultType ||
                                                                ((resultType === 'KO/TKO' || resultType === 'SUB' || resultType === 'DEC') && !resultWinnerId) ||
                                                                (resultType !== 'NC' && !resultDetail)
                                                            }
                                                        >
                                                            <span className="material-symbols-outlined text-lg">check</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingResultFightId(null)}
                                                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded flex-1 flex justify-center items-center"
                                                            title="Cancelar"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">close</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </Panel>
        </>
    );
};

export default ResultsManager;
