import React, { forwardRef } from 'react';
import { Event, Fight, Pick, User } from '../types';

interface StoryCardProps {
    event: Event;
    fights: Fight[];
    picks: Record<string, Pick>;
    user: User | null;
    total_points: number;
    accuracy: number;
}

const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(({
    event,
    fights,
    picks,
    user,
    total_points,
    accuracy
}, ref) => {
    return (
        <div
            ref={ref}
            className="w-[375px] h-[667px] bg-[#1a1a1a] relative flex flex-col select-none overflow-hidden"
        >
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[#0a0a0a]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-black/90"></div>
            </div>

            <div className={`px-4 pt-4 pb-2 flex items-center justify-between relative z-10 bg-gradient-to-b from-black/80 to-transparent shrink-0 transition-all`}>
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-full bg-cover bg-center border border-white/20 shadow-lg"
                        style={{ backgroundImage: `url("${user?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=random'}")` }}
                    ></div>
                    <div>
                        <p className="text-white text-[10px] font-bold leading-none">{user?.name || 'Torcedor'}</p>
                        <p className="text-primary text-[8px] font-bold uppercase tracking-wider mt-0.5">Arena Member</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-sm">sports_mma</span>
                        <span className="text-white text-[10px] font-black italic tracking-tighter">ARENA</span>
                    </div>
                </div>
            </div>

            <div className={`relative ${fights.length > 10 ? 'h-14' : 'h-24'} shrink-0 mx-4 mt-0.5 rounded-lg overflow-hidden shadow-2xl border border-white/10 group transition-all flex items-center`}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${event.banner_url}")` }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-20">
                    <div className={`px-1.5 py-0.5 rounded text-[7px] font-black italic tracking-widest uppercase text-white ${event.status === 'completed' ? 'bg-accent-green' : 'bg-primary'}`}>
                        {event.status === 'completed' ? 'RESULTADOS' : 'PALPITES'}
                    </div>
                </div>

                <div className="relative z-20 pl-4 py-2 flex flex-col justify-center h-full">
                    <h2 className="text-white text-sm font-black italic uppercase leading-tight drop-shadow-md truncate max-w-[200px]">
                        {event.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-400 text-[8px] font-condensed uppercase tracking-wide">
                            {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="text-gray-500 text-[6px]">•</span>
                        <span className="text-gray-400 text-[8px] font-condensed uppercase tracking-wide truncate max-w-[100px]">
                            {event.location}
                        </span>
                    </div>
                </div>
            </div>

            {event.status === 'completed' && fights.length <= 14 && (
                <div className="mx-4 mt-1.5 flex gap-1 shrink-0">
                    <div className="flex-1 bg-white/5 border border-white/5 rounded p-1 flex items-center justify-between px-2">
                        <span className="text-[7px] text-gray-500 uppercase font-bold">Pontos</span>
                        <span className="text-sm font-black text-white leading-none">{total_points}</span>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/5 rounded p-1 flex items-center justify-between px-2">
                        <span className="text-[7px] text-gray-500 uppercase font-bold"> Precisão</span>
                        <span className="text-sm font-black text-accent-green leading-none">{accuracy}%</span>
                    </div>
                </div>
            )}

            <div className="flex-1 px-4 py-2 overflow-hidden relative z-10 flex flex-col min-h-0">
                {(() => {
                    const is_odd_count = fights.length % 2 !== 0;
                    const row_count = is_odd_count
                        ? 1 + Math.ceil((fights.length - 1) / 2)
                        : Math.ceil(fights.length / 2);

                    const grid_template_rows = is_odd_count
                        ? `1.4fr repeat(${row_count - 1}, 1fr)`
                        : `repeat(${row_count}, 1fr)`;

                    return (
                        <div
                            className="grid grid-cols-2 gap-0.5 h-full w-full"
                            style={{ gridTemplateRows: grid_template_rows }}
                        >
                            {fights.map((fight, index) => {
                                const user_pick = picks[fight.id];
                                const has_pick = !!user_pick;
                                const is_completed = event.status === 'completed';
                                const is_upcoming = !is_completed;
                                const winner_id = fight.winner_id;

                                const my_pick_id = user_pick?.fighter_id;
                                const is_pick_correct = is_completed && winner_id && my_pick_id === winner_id;

                                const f_a = fight.fighter_a;
                                const f_b = fight.fighter_b;

                                // Defensive check required if MockDataService isn't fully populated yet
                                if (!f_a || !f_b) return null;

                                const f1_dim = is_completed
                                    ? (winner_id && winner_id !== f_a.id)
                                    : (is_upcoming && my_pick_id && my_pick_id !== f_a.id);

                                const f2_dim = is_completed
                                    ? (winner_id && winner_id !== f_b.id)
                                    : (is_upcoming && my_pick_id && my_pick_id !== f_b.id);

                                const is_main_event = index === 0;
                                const is_full_width = is_odd_count && is_main_event;

                                const img_width = is_full_width ? 'w-24' : 'w-10';

                                const result_round_prop = (fight as any).result_round || (fight as any).round_end || fight.rounds;
                                const result_method_prop = (fight as any).method || 'DEC';

                                let simple_method = 'DEC';
                                const m_upper = result_method_prop.toUpperCase();
                                if (m_upper.includes('KO') || m_upper.includes('TKO')) simple_method = 'KO';
                                else if (m_upper.includes('SUB')) simple_method = 'SUB';
                                else if (m_upper.includes('DEC')) simple_method = 'DEC';
                                else simple_method = m_upper.substring(0, 3);

                                const renderWinnerBadge = () => {
                                    const text_size = is_full_width ? 'text-[7px]' : 'text-[4px]';
                                    const p_padding = is_full_width ? 'px-2 py-0.5' : 'px-1 py-[1px]';

                                    return (
                                        <div className={`absolute top-0 right-0 bg-accent-green text-black ${text_size} font-black ${p_padding} rounded-bl-sm uppercase tracking-tighter leading-none shadow-sm z-10`}>
                                            VENCEDOR
                                        </div>
                                    );
                                };

                                const renderResultFooter = () => {
                                    const text_size = is_full_width ? 'text-[7px]' : 'text-[4px]';
                                    const p_padding = is_full_width ? 'px-2 py-0.5' : 'px-1.5 py-[1px]';
                                    const min_w_method = is_full_width ? 'min-w-[28px]' : 'min-w-[14px]';
                                    const min_w_round = is_full_width ? 'min-w-[18px]' : 'min-w-[10px]';

                                    let second_box_content = `R${String(result_round_prop).replace(/[^\d]/g, '')}`;

                                    if (simple_method === 'DEC') {
                                        const m_up = result_method_prop.toUpperCase();
                                        if (m_up.includes('UNA') || m_up.includes('UNI')) {
                                            second_box_content = is_full_width ? 'UNANIME' : 'UNA';
                                        } else if (m_up.includes('SPLIT') || m_up.includes('DIV')) {
                                            second_box_content = is_full_width ? 'DIVIDIDA' : 'DIV';
                                        } else if (m_up.includes('MAJ')) {
                                            second_box_content = is_full_width ? 'MAJORITARIA' : 'MAJ';
                                        }
                                    }

                                    return (
                                        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-evenly pb-[1px]">
                                            <div className={`bg-accent-green text-black ${text_size} font-black ${p_padding} rounded-t-sm uppercase tracking-tighter leading-none ${min_w_method} text-center shadow-sm`}>
                                                {simple_method}
                                            </div>
                                            <div className={`bg-accent-green text-black ${text_size} font-black ${p_padding} rounded-t-sm uppercase tracking-tighter leading-none ${min_w_round} text-center shadow-sm`}>
                                                {second_box_content}
                                            </div>
                                        </div>
                                    );
                                };

                                return (
                                    <div
                                        key={fight.id}
                                        className={`relative h-full bg-white/5 border border-white/5 rounded-sm flex overflow-hidden group
                              ${is_full_width ? 'col-span-2 border-primary/30 bg-gradient-to-r from-black via-primary/5 to-black' : ''}
                          `}
                                    >
                                        <div className={`relative ${img_width} h-full shrink-0 transition-all border-r border-white/5
                        ${is_upcoming && my_pick_id === f_a.id ? 'border-2 border-accent-green box-border z-10' : ''}
                    `}>
                                            <img src={f_a.image_url} alt={f_a.name} className={`w-full h-full object-cover object-top ${f1_dim ? 'grayscale opacity-50' : ''}`} />
                                            {my_pick_id === f_a.id && <div className={`absolute bottom-0 h-0.5 w-full ${is_pick_correct ? 'bg-accent-green' : is_completed && winner_id ? 'bg-red-500' : 'bg-accent-green'}`}></div>}

                                            {is_completed && winner_id === f_a.id && (
                                                <>
                                                    {renderWinnerBadge()}
                                                    {renderResultFooter()}
                                                </>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between items-center px-1 py-1 relative min-w-0 h-full">
                                            <div className="flex flex-col items-center justify-center w-full grow">
                                                {(() => {
                                                    const get_fighter_style = (id: string, is_dim: boolean) => {
                                                        if (my_pick_id === id) {
                                                            if (is_upcoming) return 'text-accent-green';
                                                            if (is_pick_correct) return 'text-accent-green';
                                                            if (is_completed && winner_id) return 'text-red-500 line-through decoration-[0.5px]';
                                                            return 'text-white';
                                                        }
                                                        return is_dim ? 'text-gray-600' : 'text-white';
                                                    };

                                                    return (
                                                        <>
                                                            <div className={`w-full text-center ${is_full_width ? 'text-[12px] mb-0.5' : 'text-[8px] mb-[1px]'} font-black uppercase truncate leading-tight ${get_fighter_style(f_a.id, f1_dim)}`}>
                                                                {f_a.name.split(' ').pop()}
                                                            </div>

                                                            <div className={`${is_full_width ? 'text-[7px]' : 'text-[4px]'} font-black italic text-white/40 uppercase leading-none my-[1px]`}>
                                                                VS
                                                            </div>

                                                            <div className={`w-full text-center ${is_full_width ? 'text-[12px] mt-0.5' : 'text-[8px] mt-[1px]'} font-black uppercase truncate leading-tight ${get_fighter_style(f_b.id, f2_dim)}`}>
                                                                {f_b.name.split(' ').pop()}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            {has_pick ? (
                                                <div className={`grid ${is_upcoming ? 'grid-cols-2' : 'grid-cols-3'} gap-[1px] w-full ${is_full_width ? 'h-4' : 'h-2.5'} mt-auto`}>
                                                    {(() => {
                                                        let pick_meth_simple = 'KO';
                                                        const pick_meth_raw = user_pick.method || '';
                                                        if (pick_meth_raw.includes('KO') || pick_meth_raw.includes('TKO')) pick_meth_simple = 'KO';
                                                        else if (pick_meth_raw.includes('SUB')) pick_meth_simple = 'SUB';
                                                        else if (pick_meth_raw.includes('DEC')) pick_meth_simple = 'DEC';

                                                        const pick_method_correct = is_completed && simple_method === pick_meth_simple;
                                                        const pick_method_style = is_upcoming
                                                            ? 'text-accent-green'
                                                            : pick_method_correct
                                                                ? 'text-accent-green'
                                                                : (is_completed && winner_id ? 'text-red-500 line-through decoration-[0.5px]' : 'text-primary');

                                                        const user_pick_round = (user_pick as any).round;
                                                        const clean_round = user_pick_round ? String(user_pick_round).replace(/[^\d]/g, '') : '';
                                                        const pick_round_content = clean_round ? `R${clean_round}` : pick_meth_simple === 'DEC' ? 'DEC' : '-';

                                                        const result_round_val = (fight as any).result_round;
                                                        let pick_round_correct = false;
                                                        if (pick_meth_simple === 'DEC' && simple_method === 'DEC') pick_round_correct = true;
                                                        else if (clean_round && result_round_val && Number(clean_round) === Number(result_round_val)) pick_round_correct = true;

                                                        const pick_round_style = is_upcoming
                                                            ? 'text-accent-green'
                                                            : pick_round_correct
                                                                ? 'text-accent-green'
                                                                : (is_completed && winner_id ? 'text-red-500 line-through decoration-[0.5px]' : 'text-primary');

                                                        const points = user_pick.points_earned || 0;
                                                        const points_text = points > 0 ? `+${points} Pts` : '0 Pts';

                                                        const text_size = is_full_width ? 'text-[8px]' : 'text-[4px]';

                                                        return (
                                                            <>
                                                                <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${text_size} font-bold uppercase ${pick_method_style}`}>
                                                                    {pick_meth_simple}
                                                                </div>
                                                                <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${text_size} font-bold uppercase ${pick_round_style}`}>
                                                                    {pick_round_content}
                                                                </div>
                                                                {is_completed && (
                                                                    <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${text_size} font-black text-white`}>
                                                                        {points_text}
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <div className={`w-full ${is_full_width ? 'h-4' : 'h-2.5'} mt-auto flex items-center justify-center opacity-20`}>
                                                    <div className="h-[1px] w-full bg-white/20"></div>
                                                </div>
                                            )}

                                        </div>

                                        <div className={`relative ${img_width} h-full shrink-0 transition-all border-l border-white/5
                       ${is_upcoming && my_pick_id === f_b.id ? 'border-2 border-accent-green box-border z-10' : ''}
                    `}>
                                            <img src={f_b.image_url} alt={f_b.name} className={`w-full h-full object-cover object-top ${f2_dim ? 'grayscale opacity-50' : ''}`} />
                                            {my_pick_id === f_b.id && <div className={`absolute bottom-0 h-0.5 w-full ${is_pick_correct ? 'bg-accent-green' : is_completed && winner_id ? 'bg-red-500' : 'bg-accent-green'}`}></div>}

                                            {is_completed && winner_id === f_b.id && (
                                                <>
                                                    {renderWinnerBadge()}
                                                    {renderResultFooter()}
                                                </>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            <div className={`px-5 ${fights.length > 12 ? 'py-2' : 'py-4'} bg-black border-t border-white/10 flex items-center justify-between relative z-10 shrink-0`}>
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-sm">sports_mma</span>
                    <span className="text-[8px] text-white font-bold uppercase tracking-widest">ARENAMMA.APP</span>
                </div>
                <div className="text-[7px] text-gray-600 uppercase font-medium">Onde a luta começa</div>
            </div>
        </div>
    );
});

StoryCard.displayName = 'StoryCard';

export default StoryCard;
