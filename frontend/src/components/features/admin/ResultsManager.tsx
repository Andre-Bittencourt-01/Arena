import React, { useState, useEffect } from 'react';
import Panel from '../../Panel';
import { Fight, Event as UFCEvent, Fighter } from '../../../types';

interface ResultsManagerProps {
    events: UFCEvent[];
    fighters: Fighter[];
    get_fights_for_event: (event_id: string) => Promise<Fight[]>;
    update_fight: (fight: Fight) => Promise<void>;
    on_back: () => void;
}

type OutcomeType = 'WIN_A' | 'WIN_B' | 'DRAW' | 'NC' | null;
type MethodType = 'KO/TKO' | 'SUB' | 'DEC' | null;

const ResultsManager: React.FC<ResultsManagerProps> = ({
    events,
    fighters,
    get_fights_for_event,
    update_fight,
    on_back
}) => {
    // Selection State
    const [selectedEventId, setSelectedEventId] = useState('');
    const [fights, setFights] = useState<Fight[]>([]);
    const [selectedFight, setSelectedFight] = useState<Fight | null>(null);

    // Judge State Machine
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [outcome, setOutcome] = useState<OutcomeType>(null);
    const [method, setMethod] = useState<MethodType>(null);
    const [detail, setDetail] = useState<string | null>(null); // Round Number or Decision Type
    const [time, setTime] = useState(''); // Time of finish

    // Load Fights
    useEffect(() => {
        if (selectedEventId) {
            get_fights_for_event(selectedEventId).then(setFights);
            setSelectedFight(null);
        } else {
            setFights([]);
        }
    }, [selectedEventId, get_fights_for_event]);

    // Reset Judge State when Fight Changes
    useEffect(() => {
        if (selectedFight) {
            setStep(1);
            setOutcome(null);
            setMethod(null);
            setDetail(null);
            setTime('');
        }
    }, [selectedFight]);

    const handleConfirmResult = async () => {
        if (!selectedFight || !outcome) return;

        const confirmMessage = "⚠️ O sistema irá RECALCULAR AUTOMATICAMENTE os pontos de todos os usuários.\nSe houver pontuação anterior errada, ela será corrigida agora.\n\nConfirmar veredito?";
        if (!window.confirm(confirmMessage)) return;

        // Map UI state to API payload (Prisma Enum safe)
        const result_map: Record<string, string> = {
            'WIN_A': 'WIN',
            'WIN_B': 'WIN',
            'DRAW': 'DRAW',
            'NC': 'NC'
        };

        const payload: any = {
            id: selectedFight.id,
            result: result_map[outcome],
            time: time,
            status: 'COMPLETED'
        };

        // Winner Logic
        if (outcome === 'WIN_A') payload.winner_id = selectedFight.fighter_a.id;
        else if (outcome === 'WIN_B') payload.winner_id = selectedFight.fighter_b.id;
        else payload.winner_id = null;

        // Method & Detail Logic
        if (method === 'DEC') {
            payload.method = 'Decisão';
            payload.round_end = detail; // "Unânime", etc.
        } else if (method === 'KO/TKO' || method === 'SUB') {
            payload.method = method === 'KO/TKO' ? 'KO' : 'SUB';
            payload.round_end = detail ? `R${detail}` : undefined;
        } else {
            // Draws / NC
            payload.method = outcome === 'DRAW' ? 'Empate' : null;
            payload.round_end = detail;
        }

        try {
            await update_fight(payload as Fight);
            alert('✅ Resultado oficializado e pontuações recalculadas!');
            // Refresh fights
            get_fights_for_event(selectedEventId).then(setFights);
            setSelectedFight(null);
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar resultado.');
        }
    };

    // RENDER STEPS
    const renderStep1_Verdict = () => {
        if (!selectedFight) return null;
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-condensed font-bold text-center uppercase text-white/80">Passo 1: Veredito</h3>

                {/* Fighters Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Fighter A */}
                    <button
                        onClick={() => { setOutcome('WIN_A'); setStep(2); }}
                        className={`p-6 rounded-xl border-2 transition-all group relative overflow-hidden ${outcome === 'WIN_A' ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 hover:border-primary hover:bg-white/10'}`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                                {selectedFight.fighter_a.image_url ? (
                                    <img src={selectedFight.fighter_a.image_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-gray-500 w-full h-full flex items-center justify-center">person</span>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">Canto Vermelho</span>
                                <span className="text-lg font-bold text-white uppercase leading-tight">{selectedFight.fighter_a.name}</span>
                            </div>
                        </div>
                    </button>

                    {/* Fighter B */}
                    <button
                        onClick={() => { setOutcome('WIN_B'); setStep(2); }}
                        className={`p-6 rounded-xl border-2 transition-all group relative overflow-hidden ${outcome === 'WIN_B' ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 hover:border-primary hover:bg-white/10'}`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                                {selectedFight.fighter_b.image_url ? (
                                    <img src={selectedFight.fighter_b.image_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-gray-500 w-full h-full flex items-center justify-center">person</span>
                                )}
                            </div>
                            <div className="text-center">
                                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Canto Azul</span>
                                <span className="text-lg font-bold text-white uppercase leading-tight">{selectedFight.fighter_b.name}</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Secondary Options */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <button
                        onClick={() => { setOutcome('DRAW'); setStep(2); }}
                        className="p-4 bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500 text-gray-400 hover:text-yellow-500 rounded-lg uppercase font-bold text-sm transition-all"
                    >
                        Empate (Draw)
                    </button>
                    <button
                        onClick={() => { setOutcome('NC'); setStep(3); setMethod(null); }} // NC skips method
                        className="p-4 bg-white/5 hover:bg-gray-500/20 border border-white/10 hover:border-gray-500 text-gray-400 hover:text-gray-300 rounded-lg uppercase font-bold text-sm transition-all"
                    >
                        No Contest (NC)
                    </button>
                </div>
            </div>
        );
    };

    const renderStep2_Method = () => {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-condensed font-bold text-center uppercase text-white/80">Passo 2: Método</h3>

                <div className="grid grid-cols-1 gap-3">
                    {/* Victory Methods */}
                    {(outcome === 'WIN_A' || outcome === 'WIN_B') && (
                        <>
                            <button
                                onClick={() => { setMethod('KO/TKO'); setStep(3); }}
                                className="p-4 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary rounded-lg text-white font-bold uppercase text-lg transition-all"
                            >
                                👊 KO / TKO
                            </button>
                            <button
                                onClick={() => { setMethod('SUB'); setStep(3); }}
                                className="p-4 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary rounded-lg text-white font-bold uppercase text-lg transition-all"
                            >
                                🥋 Finalização (SUB)
                            </button>
                        </>
                    )}

                    {/* Decision (Available for Win and Draw) */}
                    <button
                        onClick={() => { setMethod('DEC'); setStep(3); }}
                        className="p-4 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary rounded-lg text-white font-bold uppercase text-lg transition-all"
                    >
                        📝 Decisão (DEC)
                    </button>
                </div>

                <button onClick={() => setStep(1)} className="w-full text-xs text-gray-500 hover:text-white uppercase font-bold mt-4">
                    ← Voltar para Veredito
                </button>
            </div>
        );
    };

    const renderStep3_Detail = () => {
        if (!selectedFight) return null;

        const isDecision = method === 'DEC' || outcome === 'DRAW';
        const isFinish = method === 'KO/TKO' || method === 'SUB';
        // NC skips to here but effectively has no details needed, show confirm directly? or just a "Confirm NC"
        const isNC = outcome === 'NC';

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-condensed font-bold text-center uppercase text-white/80">Passo 3: Detalhes</h3>

                {!isNC && (
                    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-3 text-center">
                            {isDecision ? 'Tipo de Decisão' : 'Round do Término'}
                        </label>

                        <div className={`grid ${isDecision ? 'grid-cols-2' : 'grid-cols-5'} gap-2`}>
                            {isDecision ? (
                                <>
                                    {['Unânime', 'Dividida', 'Majoritária', 'Técnica'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setDetail(type)}
                                            className={`p-3 rounded border text-sm uppercase font-bold transition-all ${detail === type ? 'bg-primary text-white border-primary' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {Array.from({ length: selectedFight.rounds || 3 }).map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setDetail(String(i + 1))}
                                            className={`aspect-square rounded border text-lg font-bold transition-all ${detail === String(i + 1) ? 'bg-primary text-white border-primary' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Time Input (Only relevant for finishes usually, but field exists for all) */}
                {isFinish && (
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Tempo (Opcional)</label>
                        <input
                            type="text"
                            placeholder="ex: 4:59"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="admin-input text-center font-mono text-lg tracking-widest"
                        />
                    </div>
                )}

                {isNC && (
                    <p className="text-center text-yellow-500 font-bold uppercase">Confirmar No Contest?</p>
                )}

                <button
                    onClick={handleConfirmResult}
                    disabled={!isNC && !detail}
                    className="w-full p-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase rounded-lg shadow-lg shadow-green-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">gavel</span>
                    Confirmar Resultado Oficial
                </button>

                <button onClick={() => setStep(outcome === 'NC' ? 1 : 2)} className="w-full text-xs text-gray-500 hover:text-white uppercase font-bold mt-4">
                    ← Voltar
                </button>
            </div>
        );
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-4">
                <button onClick={on_back} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                </button>
                <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                    Mesa do Juiz ⚖️
                </h1>
            </div>

            <Panel title="Gerenciamento de Resultados" icon="gavel">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 min-h-[500px]">

                    {/* LEFT: Fight List */}
                    <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 p-4 flex flex-col gap-4">
                        <select
                            value={selectedEventId}
                            onChange={e => setSelectedEventId(e.target.value)}
                            className="admin-input"
                        >
                            <option value="">Selecione um evento...</option>
                            {Array.isArray(events) && events.map(event => (
                                <option key={event.id} value={event.id}>{event?.title}</option>
                            ))}
                        </select>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar max-h-[400px] lg:max-h-full">
                            {fights.map(fight => (
                                <button
                                    key={fight.id}
                                    onClick={() => setSelectedFight(fight)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedFight?.id === fight.id ? 'bg-white/10 border-primary text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Luta {fight.order}</span>
                                        {fight.result && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase font-bold">Finalizada</span>}
                                    </div>
                                    <div className="font-bold font-condensed uppercase flex items-center gap-2">
                                        <span className={fight.winner_id === fight.fighter_a.id ? 'text-green-400' : ''}>{fight.fighter_a.name}</span>
                                        <span className="text-gray-600 text-[10px]">VS</span>
                                        <span className={fight.winner_id === fight.fighter_b.id ? 'text-green-400' : ''}>{fight.fighter_b.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Judge Interface */}
                    <div className="lg:col-span-8 p-4 lg:p-8 flex items-center justify-center bg-dots-pattern relative">
                        {!selectedFight ? (
                            <div className="text-center text-gray-600">
                                <span className="material-symbols-outlined text-6xl mb-2 opacity-50">sports_mma</span>
                                <p className="uppercase font-bold tracking-widest text-sm">Selecione uma luta para julgar</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-xl relative">
                                {/* Progress Indicator */}
                                <div className="absolute -top-6 left-0 w-full flex justify-center gap-2 mb-8">
                                    <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-white/10'}`} />
                                    <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`} />
                                    <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-white/10'}`} />
                                </div>

                                {/* Dynamic Step Render */}
                                {step === 1 && renderStep1_Verdict()}
                                {step === 2 && renderStep2_Method()}
                                {step === 3 && renderStep3_Detail()}

                                {/* Fight Context Header (Visible always for context) */}
                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end opacity-50">
                                    <div className="text-xs uppercase font-bold text-gray-500">
                                        Julgando Luta #{selectedFight.order}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">{selectedFight.weight_class} • {selectedFight.rounds} Rounds</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Panel>
        </>
    );
};

export default ResultsManager;
