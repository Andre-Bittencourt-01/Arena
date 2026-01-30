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
        else if (methodUpper.includes('KO') || methodUpper.includes('TKO')) setResultType('KO/TKO');
        else setResultType('');

        setResultWinnerId(fight.winner_id || '');

        // 2. Determine Detail (Round or Dec Type)
        if (methodUpper.includes('DEC') || fight.result === 'draw') {
            if (methodUpper.includes('UNA') || methodUpper.includes('UNI')) setResultDetail('Unânime');
            else if (methodUpper.includes('SPLIT') || methodUpper.includes('DIV')) setResultDetail('Dividida');
            else if (methodUpper.includes('MAJ')) setResultDetail('Majoritária');
            else if (methodUpper.includes('TEC')) setResultDetail('Técnica');
            else setResultDetail('');
        } else {
            // Extract Round Number
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
            finalMethod = 'NC';
            finalWinnerId = undefined as any;
            finalRoundEnd = '';
        } else if (resultType === 'DRAW') {
            finalResult = 'draw';
            finalMethod = `Draw (${resultDetail})`;
            finalRoundEnd = resultDetail === 'Técnica' ? `R${fight.rounds}` : 'DEC';
            finalWinnerId = undefined as any;
        } else if (resultType === 'DEC') {
            finalResult = 'win';
            finalMethod = `DEC (${resultDetail})`;
            finalRoundEnd = 'DEC';
        } else {
            // KO/TKO or SUB
            finalResult = 'win';
            finalMethod = resultType === 'KO/TKO' ? 'KO/TKO' : 'SUB';
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
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.title} - {event.subtitle}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fights List */}
                    {resultsEventId && (
                        <div className="space-y-4">
                            {currentEventFights.length === 0 ? (
                                <p className="text-gray-500 text-sm">Nenhuma luta encontrada neste evento.</p>
                            ) : (
                                currentEventFights.map(fight => {
                                    const isEditing = editingResultFightId === fight.id;

                                    return (
                                        <div key={fight.id} className={`p-4 rounded border ${isEditing ? 'bg-white/10 border-primary' : 'bg-white/5 border-white/5'}`}>
                                            {/* Fight Header Info */}
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className={`font-bold uppercase ${fight.winner_id === fight.fighter_a_id ? 'text-green-500' : 'text-white'}`}>
                                                            {fight.fighter_a.name}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-bold">VS</span>
                                                    <div className="text-left">
                                                        <p className={`font-bold uppercase ${fight.winner_id === fight.fighter_b_id ? 'text-green-500' : 'text-white'}`}>
                                                            {fight.fighter_b.name}
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
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Round</p>
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
                                                            <option value="KO/TKO">KO / TKO</option>
                                                            <option value="SUB">Finalização (SUB)</option>
                                                            <option value="DEC">Decisão (DEC)</option>
                                                            <option value="DRAW">Empate</option>
                                                            <option value="NC">No Contest (NC)</option>
                                                        </select>
                                                    </div>

                                                    {/* 2. Winner (Conditional: KO/TKO, SUB, DEC) */}
                                                    {(resultType === 'KO/TKO' || resultType === 'SUB' || resultType === 'DEC') && (
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Vencedor</label>
                                                            <select
                                                                value={resultWinnerId}
                                                                onChange={e => setResultWinnerId(e.target.value)}
                                                                className="admin-input"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                <option value={fight.fighter_a_id}>{fight.fighter_a.name}</option>
                                                                <option value={fight.fighter_b_id}>{fight.fighter_b.name}</option>
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* 3. Detail/Round (Conditional) */}
                                                    {resultType !== 'NC' && resultType !== '' && (
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                                                                {(resultType === 'DEC' || resultType === 'DRAW') ? 'Tipo de Decisão' : 'Round do Término'}
                                                            </label>
                                                            <select
                                                                value={resultDetail}
                                                                onChange={e => setResultDetail(e.target.value)}
                                                                className="admin-input"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                {(resultType === 'DEC' || resultType === 'DRAW') ? (
                                                                    <>
                                                                        <option value="Unanimous">Unânime</option>
                                                                        <option value="Split">Dividida</option>
                                                                        <option value="Majority">Majoritária</option>
                                                                        <option value="Technical">Técnica</option>
                                                                    </>
                                                                ) : (
                                                                    // Generate Rounds based on fight duration
                                                                    Array.from({ length: fight.rounds || 3 }).map((_, i) => (
                                                                        <option key={i + 1} value={String(i + 1)}>Round {i + 1}</option>
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
