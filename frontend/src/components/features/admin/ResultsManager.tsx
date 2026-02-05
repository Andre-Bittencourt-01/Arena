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

const ResultsManager: React.FC<ResultsManagerProps> = ({
    events,
    fighters,
    get_fights_for_event,
    update_fight,
    on_back
}) => {
    const [results_event_id, set_results_event_id] = useState('');
    const [current_event_fights, set_current_event_fights] = useState<Fight[]>([]);
    const [editing_result_fight_id, set_editing_result_fight_id] = useState<string | null>(null);

    // Edit State
    const [result_type, set_result_type] = useState<string>(''); // KO/TKO, SUB, DEC, DRAW, NC
    const [result_winner_id, set_result_winner_id] = useState('');
    const [result_detail, set_result_detail] = useState(''); // Round Number or Decision Type
    const [result_time, set_result_time] = useState('');

    useEffect(() => {
        const load_fights = async () => {
            if (results_event_id) {
                const fights = await get_fights_for_event(results_event_id);
                set_current_event_fights(fights);
            } else {
                set_current_event_fights([]);
            }
        };
        load_fights();
    }, [results_event_id, get_fights_for_event]);

    const start_editing_result = (fight: Fight) => {
        set_editing_result_fight_id(fight.id);
        const method_upper = (fight.method || '').toUpperCase();

        if (fight.result === 'nc') set_result_type('NC');
        else if (fight.result === 'draw') set_result_type('DRAW');
        else if (method_upper.includes('DEC')) set_result_type('DEC');
        else if (method_upper.includes('SUB')) set_result_type('SUB');
        else if (method_upper.includes('KO')) set_result_type('KO');
        else set_result_type('');

        set_result_winner_id(fight.winner_id || '');

        const round_end_upper = (fight.round_end || '').toUpperCase();

        if (result_type === 'DEC' || result_type === 'DRAW') {
            if (method_upper.includes('UNA') || method_upper.includes('UNI') || round_end_upper.includes('UNA') || round_end_upper.includes('UNI')) set_result_detail('Unânime');
            else if (method_upper.includes('SPLIT') || method_upper.includes('DIV') || round_end_upper.includes('SPLIT') || round_end_upper.includes('DIV')) set_result_detail('Dividida');
            else if (method_upper.includes('MAJ') || round_end_upper.includes('MAJ')) set_result_detail('Majoritária');
            else if (method_upper.includes('TEC') || round_end_upper.includes('TEC')) set_result_detail('Técnica');
            else set_result_detail('');
        } else {
            set_result_detail(fight.round_end ? fight.round_end.replace('R', '') : '');
        }

        set_result_time(fight.time || '');
    };

    const handle_save_result = async (fight: Fight) => {
        let final_result: Fight['result'] = 'win';
        let final_method = '';
        let final_round_end = '';
        let final_winner_id = result_winner_id;

        if (result_type === 'NC') {
            final_result = 'nc';
            final_method = 'Sem Resultado';
            final_winner_id = undefined as any;
            final_round_end = '';
        } else if (result_type === 'DRAW') {
            final_result = 'draw';
            final_method = 'Empate';
            final_winner_id = undefined as any;
            final_round_end = result_detail;
        } else if (result_type === 'DEC') {
            final_result = 'win';
            final_method = 'Decisão';
            final_round_end = result_detail;
        } else {
            final_result = 'win';
            final_method = result_type === 'KO' ? 'KO' : 'SUB';
            final_round_end = `R${result_detail}`;
        }

        await update_fight({
            ...fight,
            winner_id: final_winner_id,
            result: final_result,
            method: final_method,
            round_end: final_round_end,
            time: result_time
        });

        alert('Resultado salvo! Pontuações recalculadas.');
        set_editing_result_fight_id(null);

        const fights = await get_fights_for_event(results_event_id);
        set_current_event_fights(fights);
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-4">
                <button onClick={on_back} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                </button>
                <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                    Gerenciar Resultados
                </h1>
            </div>

            <Panel title="Definir Resultados das Lutas" icon="scoreboard">
                <div className="p-4 space-y-6">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Selecione o Evento</label>
                        <select
                            value={results_event_id}
                            onChange={e => set_results_event_id(e.target.value)}
                            className="admin-input"
                        >
                            <option value="">Selecione um evento...</option>
                            {Array.isArray(events) && events.map(event => (
                                <option key={event.id} value={event.id}>{event?.title || 'Sem título'} - {event?.subtitle || ''}</option>
                            ))}
                        </select>
                    </div>

                    {results_event_id && (
                        <div className="space-y-4">
                            {current_event_fights.map(fight => {
                                const is_editing = editing_result_fight_id === fight.id;

                                return (
                                    <div key={fight.id} className={`p-4 rounded border ${is_editing ? 'bg-white/10 border-primary' : 'bg-white/5 border-white/5'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`text-right p-2 rounded transition-colors ${fight.winner_id && fight.winner_id === fight.fighter_a_id ? 'bg-green-500/10 border border-green-500/50' : ''}`}>
                                                    <p className={`font-bold uppercase ${fight.winner_id && fight.winner_id === fight.fighter_a_id ? 'text-green-500' : 'text-white'}`}>
                                                        {fight?.fighter_a?.name || 'Unknown A'}
                                                        {fight.winner_id && fight.winner_id === fight.fighter_a_id && <span className="ml-1 text-[10px]">🏆</span>}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-500 font-bold">VS</span>
                                                <div className={`text-left p-2 rounded transition-colors ${fight.winner_id && fight.winner_id === fight.fighter_b_id ? 'bg-green-500/10 border border-green-500/50' : ''}`}>
                                                    <p className={`font-bold uppercase ${fight.winner_id && fight.winner_id === fight.fighter_b_id ? 'text-green-500' : 'text-white'}`}>
                                                        {fight.winner_id && fight.winner_id === fight.fighter_b_id && <span className="mr-1 text-[10px]">🏆</span>}
                                                        {fight?.fighter_b?.name || 'Unknown B'}
                                                    </p>
                                                </div>
                                            </div>

                                            {!is_editing && (
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
                                                        onClick={() => start_editing_result(fight)}
                                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs uppercase font-bold text-white transition-colors"
                                                    >
                                                        Editar Resultado
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {is_editing && (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Tipo de Resultado</label>
                                                    <select
                                                        value={result_type}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            set_result_type(val);
                                                            set_result_detail('');
                                                            if (val === 'NC' || val === 'DRAW') set_result_winner_id('');
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

                                                {(result_type === 'KO' || result_type === 'SUB' || result_type === 'DEC') && (
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Vencedor 🏆</label>
                                                        <select
                                                            value={result_winner_id}
                                                            onChange={e => set_result_winner_id(e.target.value)}
                                                            className={`admin-input ${result_winner_id ? 'border-green-500 bg-green-500/5' : ''}`}
                                                        >
                                                            <option value="">Selecione...</option>
                                                            <option value={fight.fighter_a_id}>{fight?.fighter_a?.name || 'Fighter A'}</option>
                                                            <option value={fight.fighter_b_id}>{fight?.fighter_b?.name || 'Fighter B'}</option>
                                                        </select>
                                                    </div>
                                                )}

                                                {result_type !== 'NC' && result_type !== '' && (
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                                                            {(result_type === 'DEC' || result_type === 'DRAW') ? 'Tipo' : 'Round'}
                                                        </label>
                                                        <select
                                                            value={result_detail}
                                                            onChange={e => set_result_detail(e.target.value)}
                                                            className="admin-input"
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {(result_type === 'DEC' || result_type === 'DRAW') ? (
                                                                <>
                                                                    <option value="Unânime">Unânime</option>
                                                                    <option value="Dividida">Dividida</option>
                                                                    <option value="Majoritária">Majoritária</option>
                                                                    <option value="Técnica">Técnica</option>
                                                                </>
                                                            ) : (
                                                                Array.from({ length: fight.rounds || 3 }).map((_, i) => (
                                                                    <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                                                                ))
                                                            )}
                                                        </select>
                                                    </div>
                                                )}

                                                <div className="flex items-end gap-2">
                                                    <button
                                                        onClick={() => handle_save_result(fight)}
                                                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded flex-1 flex justify-center items-center"
                                                        disabled={
                                                            !result_type ||
                                                            ((result_type === 'KO' || result_type === 'SUB' || result_type === 'DEC') && !result_winner_id) ||
                                                            (result_type !== 'NC' && !result_detail)
                                                        }
                                                    >
                                                        <span className="material-symbols-outlined text-lg">check</span>
                                                    </button>
                                                    <button
                                                        onClick={() => set_editing_result_fight_id(null)}
                                                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded flex-1 flex justify-center items-center"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Panel>
        </>
    );
};

export default ResultsManager;
