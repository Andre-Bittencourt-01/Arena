import React, { useState, useEffect } from 'react';
import Panel from '../../Panel';
import { Fight, Event as UFCEvent, Fighter, Pick } from '../../../frontend/src/types';

interface PicksManagerProps {
    events: UFCEvent[];
    fighters: Fighter[];
    get_all_picks_for_event: (event_id: string) => Promise<Pick[]>;
    get_fights_for_event: (event_id: string) => Promise<Fight[]>;
    submit_pick: (pick: any) => Promise<void>;
    on_back: () => void;
}

const PicksManager: React.FC<PicksManagerProps> = ({
    events,
    fighters,
    get_all_picks_for_event,
    get_fights_for_event,
    submit_pick,
    on_back
}) => {
    const [selected_event_for_picks, set_selected_event_for_picks] = useState<string>('');
    const [event_picks, set_event_picks] = useState<Pick[]>([]);
    const [filtered_picks, set_filtered_picks] = useState<Pick[]>([]);
    const [loading_picks, set_loading_picks] = useState(false);

    const [selected_user_filter, set_selected_user_filter] = useState('');
    const [selected_fight_filter, set_selected_fight_filter] = useState('');

    const [editing_pick_id, set_editing_pick_id] = useState<string | null>(null);
    const [edit_points_value, set_edit_points_value] = useState<number>(0);
    const [edit_note_value, set_edit_note_value] = useState<string>('');

    const [fights_map, set_fights_map] = useState<Record<string, Fight>>({});

    useEffect(() => {
        const load_picks_and_fights = async () => {
            if (selected_event_for_picks) {
                set_loading_picks(true);
                try {
                    const [picks, fights] = await Promise.all([
                        get_all_picks_for_event(selected_event_for_picks),
                        get_fights_for_event(selected_event_for_picks)
                    ]);

                    set_event_picks(picks);
                    set_filtered_picks(picks);

                    const mapping: Record<string, Fight> = {};
                    fights.forEach(f => {
                        mapping[f.id] = f;
                    });
                    set_fights_map(mapping);

                } catch (error) {
                    console.error("Error loading picks and fights:", error);
                } finally {
                    set_loading_picks(false);
                }
            } else {
                set_event_picks([]);
                set_filtered_picks([]);
                set_fights_map({});
            }
        };
        load_picks_and_fights();
    }, [selected_event_for_picks, get_all_picks_for_event, get_fights_for_event]);

    useEffect(() => {
        let result = event_picks;

        if (selected_user_filter) {
            result = result.filter(p => p.user_id === selected_user_filter);
        }

        if (selected_fight_filter) {
            result = result.filter(p => p.fight_id === selected_fight_filter);
        }

        set_filtered_picks(result);
    }, [selected_user_filter, selected_fight_filter, event_picks]);

    const unique_users = Array.from(new Set(event_picks.map(p => p.user_id))).sort();
    const unique_fight_ids = Array.from(new Set(event_picks.map(p => p.fight_id))).sort();

    const handle_update_pick_points = async (pick: Pick) => {
        if (edit_points_value < 0) return;

        await submit_pick({
            ...pick,
            points_earned: edit_points_value,
            admin_note: edit_note_value
        });

        const update_list = (list: Pick[]) => list.map(p =>
            p.id === pick.id ? { ...p, points_earned: edit_points_value, admin_note: edit_note_value } : p
        );

        set_event_picks(prev => update_list(prev));
        set_editing_pick_id(null);
    };

    const start_editing = (pick: Pick) => {
        set_editing_pick_id(pick.id);
        set_edit_points_value(pick.points_earned || 0);
        set_edit_note_value(pick.admin_note || '');
    };

    return (
        <>
            <div className="flex items-center gap-4 mb-4">
                <button onClick={on_back} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                </button>
                <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                    Gerenciamento de Palpites
                </h1>
            </div>

            <Panel title="Corrigir Pontuações" icon="fact_check">
                <div className="p-4 space-y-6">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Selecione o Evento</label>
                        <select
                            value={selected_event_for_picks}
                            onChange={e => set_selected_event_for_picks(e.target.value)}
                            className="admin-input"
                        >
                            <option value="">Selecione um evento...</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.title}</option>
                            ))}
                        </select>
                    </div>

                    {selected_event_for_picks && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Filtrar por Usuário (Opcional)</label>
                                <select
                                    value={selected_user_filter}
                                    onChange={e => set_selected_user_filter(e.target.value)}
                                    className="admin-input"
                                >
                                    <option value="">Todos os Usuários</option>
                                    {unique_users.map(user_id => (
                                        <option key={user_id} value={user_id}>{user_id}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Filtrar por Luta (Opcional)</label>
                                <select
                                    value={selected_fight_filter}
                                    onChange={e => set_selected_fight_filter(e.target.value)}
                                    className="admin-input"
                                >
                                    <option value="">Todas as Lutas</option>
                                    {unique_fight_ids.map(fight_id => {
                                        const f = fights_map[fight_id];
                                        const label = f ? `${f.fighter_a.name} vs ${f.fighter_b.name}` : `Luta ID: ${fight_id}`;
                                        return (
                                            <option key={fight_id} value={fight_id}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    )}

                    {selected_fight_filter && fights_map[selected_fight_filter] && (
                        <div className="bg-white/5 border border-white/10 rounded p-4 mb-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Resultado da Luta</h4>
                            {fights_map[selected_fight_filter].winner_id ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Vencedor</p>
                                        <p className="text-primary font-bold text-lg">
                                            {fighters.find(f => f.id === fights_map[selected_fight_filter].winner_id)?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Método</p>
                                        <p className="text-white font-mono">{fights_map[selected_fight_filter].method || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Round</p>
                                        <p className="text-white font-mono">{fights_map[selected_fight_filter].round_end || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Tempo</p>
                                        <p className="text-white font-mono">{fights_map[selected_fight_filter].time || '-'}</p>
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

                    {selected_event_for_picks && (
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
                                    {loading_picks ? (
                                        <tr><td colSpan={7} className="p-8 text-center text-gray-500">Carregando palpites...</td></tr>
                                    ) : filtered_picks.length === 0 ? (
                                        <tr><td colSpan={7} className="p-8 text-center text-gray-500">Nenhum palpite encontrado.</td></tr>
                                    ) : (
                                        filtered_picks.map(pick => {
                                            const fight = fights_map[pick.fight_id];
                                            const has_result = fight && !!fight.winner_id;

                                            const get_style = (is_correct: boolean) => {
                                                if (!has_result) return 'text-gray-400';
                                                return is_correct ? 'text-green-500 font-bold' : 'text-red-500 line-through decoration-red-500/50';
                                            };

                                            const is_fighter_correct = has_result && fight.winner_id === pick.fighter_id;
                                            const is_method_correct = is_fighter_correct && has_result && (fight.method?.includes(pick.method) || (pick.method === 'KO/TKO' && fight.method === 'KO'));
                                            let is_round_correct = false;
                                            if (is_method_correct && has_result) {
                                                if (fight.method?.includes('Decisão') || fight.method === 'Decisão') {
                                                    is_round_correct = (fight.round_end === pick.round) || false;
                                                } else {
                                                    is_round_correct = fight.round_end === pick.round;
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
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-mono text-xs text-secondary-400 font-bold">{pick.user_id}</td>
                                                    <td className="p-3">
                                                        <div className="text-secondary-400 text-[10px] mb-0.5 uppercase tracking-wider font-bold">
                                                            {fight ? `${fight.fighter_a.name} vs ${fight.fighter_b.name}` : pick.fight_id}
                                                        </div>
                                                        <div className={`font-bold text-lg ${get_style(is_fighter_correct)}`}>{
                                                            fighters.find(f => f.id === pick.fighter_id)?.name || pick.fighter_id
                                                        }</div>
                                                    </td>
                                                    <td className={`p-3 text-xs ${get_style(is_method_correct)}`}>
                                                        {pick.method}
                                                    </td>
                                                    <td className={`p-3 text-xs ${get_style(is_round_correct)}`}>
                                                        {pick.round}
                                                    </td>
                                                    <td className="p-3">
                                                        {editing_pick_id === pick.id ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-500">Pts:</span>
                                                                    <input
                                                                        type="number"
                                                                        value={edit_points_value}
                                                                        onChange={e => set_edit_points_value(parseInt(e.target.value))}
                                                                        className="w-16 bg-black border border-primary text-white text-center p-1 rounded text-xs"
                                                                    />
                                                                </div>
                                                                <textarea
                                                                    value={edit_note_value}
                                                                    onChange={e => set_edit_note_value(e.target.value)}
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
                                                        {editing_pick_id === pick.id ? (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => handle_update_pick_points(pick)}
                                                                    className="p-1 bg-green-500/20 text-green-500 rounded hover:bg-green-500/40"
                                                                >
                                                                    <span className="material-symbols-outlined !text-sm">check</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => set_editing_pick_id(null)}
                                                                    className="p-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/40"
                                                                >
                                                                    <span className="material-symbols-outlined !text-sm">close</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => start_editing(pick)}
                                                                className="p-1 text-gray-400 hover:text-white transition-colors"
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
