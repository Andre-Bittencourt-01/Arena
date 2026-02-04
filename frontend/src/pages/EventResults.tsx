import React, { useEffect, useState } from 'react';
import { Screen } from '../App';
import { useData } from '../contexts/DataContext';
import { Event, Fight, Pick } from '../types';
import ResponsiveBanner from '../components/common/ResponsiveBanner';
import * as dateUtils from '../utils/dateUtils';

interface EventResultsProps {
    onNavigate: (screen: Screen) => void;
    eventId: string;
}

const EventResults: React.FC<EventResultsProps> = ({ onNavigate, eventId }) => {
    const { get_event, get_fights_for_event, get_picks_for_event } = useData();
    const [event, set_event] = useState<Event | null>(null);
    const [fights, set_fights] = useState<Fight[]>([]);
    const [picks, set_picks] = useState<Record<string, Pick>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load_data = async () => {
            setLoading(true);
            const evt = await get_event(eventId);
            const fts = await get_fights_for_event(eventId);
            const user_picks = await get_picks_for_event(eventId);

            set_event(evt);
            set_fights(fts);
            set_picks(user_picks);
            setLoading(false);
        };
        load_data();
    }, [eventId]);

    if (loading || !event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
                <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 font-condensed uppercase tracking-[0.3em] font-black italic">Processando Resultados...</p>
            </div>
        );
    }

    // Calculate Stats
    let correct_picks = 0;
    let perfect_picks = 0; // "Mitadas" (Winner + Method + Round)
    let total_points_earned = 0;
    let correct_methods = 0;
    let correct_rounds = 0;

    fights.forEach(f => {
        const pick = picks[f.id];
        if (pick) {
            total_points_earned += pick.points_earned || 0;

            if (f.winner_id && pick.fighter_id === f.winner_id) {
                correct_picks++;

                if (f.method && pick.method && f.method.includes(pick.method)) {
                    correct_methods++;

                    const is_dec = f.method.includes('DEC');
                    const is_round_correct = is_dec
                        ? (f.method.includes(pick.round || ''))
                        : (f.round_end === pick.round);

                    if (is_round_correct) {
                        correct_rounds++;
                        if (f.video_url) perfect_picks++;
                    }
                }
            }
        }
    });

    const safe_div = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0;
    const winner_accuracy = safe_div(correct_picks, fights.length);
    const method_accuracy = safe_div(correct_methods, fights.length);
    const round_accuracy = safe_div(correct_rounds, fights.length);

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] font-sans bg-background-dark">
            <section className="relative overflow-hidden pt-12 pb-16 bg-zinc-950">
                <div className="absolute inset-0 z-0">
                    <img src={event.banner_url} className="w-full h-full object-cover opacity-20 grayscale scale-110 blur-sm" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/80 to-background-dark"></div>
                </div>

                <div className="max-w-[1600px] mx-auto px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <button onClick={() => onNavigate('dashboard')} className="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 group">
                                    <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                </button>
                                <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Resultado Final</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-condensed font-bold text-white leading-none uppercase italic">
                                {event.title}: <span className="text-primary">{event.subtitle.split(' vs ')[0]}</span> vs <span className="text-white">{event.subtitle.split(' vs ')[1]}</span>
                            </h1>
                            <p className="text-gray-400 font-condensed uppercase tracking-wide text-sm">{dateUtils.getLocationCity(event.location)} • {dateUtils.getEventDay(event.date)} {dateUtils.getEventMonthLong(event.date)}</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className={`p-4 sm:p-6 rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center text-center relative overflow-hidden group ${winner_accuracy > 50 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Vencedor</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl sm:text-4xl font-display font-black ${winner_accuracy > 50 ? 'text-green-500' : 'text-red-500'}`}>{winner_accuracy}</span>
                                    <span className="text-xs font-black text-white/20">%</span>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-all">
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/40 mb-1">Método</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl sm:text-4xl font-display font-black text-white">{method_accuracy}</span>
                                    <span className="text-xs font-black text-white/20">%</span>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-all">
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/40 mb-1">Round</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl sm:text-4xl font-display font-black text-white">{round_accuracy}</span>
                                    <span className="text-xs font-black text-white/20">%</span>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 rounded-2xl border border-primary/30 bg-primary/10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary mb-1">TOTAL</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl sm:text-4xl font-display font-black text-white">{total_points_earned}</span>
                                    <span className="text-xs font-black text-primary">PTS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-[1600px] mx-auto px-6 lg:px-8 pt-6 pb-4 w-full">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-xl font-condensed font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">grading</span>
                        Gabarito Oficial & Seus Palpites
                    </h2>
                </div>
            </section>

            <section className="flex-1 max-w-[1600px] mx-auto px-6 lg:px-8 pb-32 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {fights.map(fight => {
                        const is_main_event = fight.category === 'Main Event';
                        const winner_id = fight.winner_id;
                        const user_pick = picks[fight.id];
                        const my_pick_id = user_pick?.fighter_id;

                        const is_pick_correct = winner_id && my_pick_id === winner_id;
                        const points = user_pick?.points_earned || 0;

                        const fighter1_won = winner_id === fight.fighter_a.id;
                        const fighter2_won = winner_id === fight.fighter_b.id;

                        const is_method_correct = is_pick_correct && user_pick?.method && (
                            (fight.method?.includes('DEC') && user_pick.method === 'DEC') ||
                            (fight.method?.includes('SUB') && user_pick.method === 'SUB') ||
                            ((fight.method?.includes('KO') || fight.method?.includes('TKO')) && user_pick.method === 'KO/TKO')
                        );

                        const get_winner_box_styles = (is_winner: boolean, is_pick: boolean) => {
                            let border_class = 'border-white/10 bg-white/5 opacity-40';
                            let text_class = 'text-gray-500';
                            let icon = null;
                            let img_border_class = 'border-2 border-transparent';

                            if (is_winner) {
                                border_class = 'border-white bg-white/15 opacity-100';
                                text_class = 'text-white font-bold';
                                img_border_class = 'border-2 border-white';
                            }

                            if (is_pick) {
                                if (is_pick_correct) {
                                    border_class = 'border-green-500 bg-green-500/30 opacity-100';
                                    text_class = 'text-white font-bold';
                                    img_border_class = 'border-2 border-green-500';
                                    icon = 'check_circle';
                                } else if (winner_id) {
                                    border_class = 'border-red-500 bg-red-500/30 opacity-100';
                                    text_class = 'text-white font-bold';
                                    img_border_class = 'border-2 border-red-500';
                                    icon = 'cancel';
                                }
                            }

                            return { border_class, text_class, icon, img_border_class };
                        };

                        const f1_styles = get_winner_box_styles(fighter1_won, my_pick_id === fight.fighter_a.id);
                        const f2_styles = get_winner_box_styles(fighter2_won, my_pick_id === fight.fighter_b.id);

                        return (
                            <div key={fight.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{fight.category}</span>
                                </div>

                                <div className="p-4 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className={`aspect-square rounded-xl overflow-hidden ${f1_styles.img_border_class}`}>
                                                <img src={fight.fighter_a.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className={`p-2 rounded-lg border text-[10px] font-black uppercase text-center truncate ${f1_styles.border_class}`}>
                                                {f1_styles.icon && <span className="material-symbols-outlined text-[12px] align-middle mr-1">{f1_styles.icon}</span>}
                                                {fight.fighter_a.name}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className={`aspect-square rounded-xl overflow-hidden ${f2_styles.img_border_class}`}>
                                                <img src={fight.fighter_b.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className={`p-2 rounded-lg border text-[10px] font-black uppercase text-center truncate ${f2_styles.border_class}`}>
                                                {f2_styles.icon && <span className="material-symbols-outlined text-[12px] align-middle mr-1">{f2_styles.icon}</span>}
                                                {fight.fighter_b.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Pontos</span>
                                            <span className={`text-xl font-display font-black ${is_pick_correct ? 'text-green-500' : 'text-white/40'}`}>+{points}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Método</span>
                                            <div className="text-[10px] font-black text-white uppercase">{fight.method || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default EventResults;
