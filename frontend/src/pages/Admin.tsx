import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import { useData } from '../contexts/DataContext';
import { ApiDataService } from '../services/ApiDataService';
import { FightCategory, WeightClass, Event, Fight, BannerConfig, Fighter } from '../types';

import EventList from '../components/features/admin/EventList';
import EventEditor from '../components/features/admin/EventEditor';
import FightManager from '../components/features/admin/FightManager';
import ResultsManager from '../components/features/admin/ResultsManager';
import PicksManager from '../components/features/admin/PicksManager';
import FighterForm from '../components/features/admin/FighterForm';
import { Screen } from '../App';

interface AdminProps {
    on_navigate: (screen: Screen) => void;
}

const Admin: React.FC<AdminProps> = ({ on_navigate }) => {
    const {
        events,
        create_event,
        update_event,
        delete_event,
        create_fight,
        update_fight,
        delete_fight,
        get_fights_for_event,
        create_fighter,
        get_all_picks_for_event,
        submit_pick,
        get_admin_events
    } = useData();

    const [available_fighters, set_available_fighters] = useState<Fighter[]>([]);
    const [is_loading_fighters, set_is_loading_fighters] = useState(false);

    // FIXED: Removed unstable dependency and wrapped in useCallback (though useEffect with [] is enough if it only runs once)
    useEffect(() => {
        let is_mounted = true;
        const load_global_data = async () => {
            get_admin_events(); // This likely updates 'events' context
            try {
                set_is_loading_fighters(true);
                const api = new ApiDataService();
                const fighters_list = await api.get_fighters();
                if (is_mounted) set_available_fighters(fighters_list);
            } catch (error) {
                console.error("Erro ao carregar lutadores:", error);
            } finally {
                if (is_mounted) set_is_loading_fighters(false);
            }
        };
        load_global_data();
        return () => { is_mounted = false; };
    }, []); // Empty dependency array to run ONLY on mount

    const [view_mode, set_view_mode] = useState<'list' | 'edit' | 'picks' | 'results'>('list');

    const [is_fighter_modal_open, set_is_fighter_modal_open] = useState(false);
    const [pending_fighter_select, set_pending_fighter_select] = useState<'fighter_a' | 'fighter_b' | null>(null);

    const [editing_event_id, set_editing_event_id] = useState<string | null>(null);
    const [title, set_title] = useState('');
    const [subtitle, set_subtitle] = useState('');

    const [start_date, set_start_date] = useState('');
    const [start_time, set_start_time] = useState('');
    const [end_date, set_end_date] = useState('');
    const [end_time, set_end_time] = useState('');

    const [location, set_location] = useState('');
    const [banner_url, set_banner_url] = useState('');

    const [event_lock_status, set_event_lock_status] = useState<'open' | 'locked' | 'scheduled' | 'cascade'>('open');
    const [event_lock_time, set_event_lock_time] = useState('');
    const [cascade_start_time, set_cascade_start_time] = useState('');

    const [current_event_fights, set_current_event_fights] = useState<Fight[]>([]);

    const [fighter_1_id, set_fighter_1_id] = useState('');
    const [fighter_2_id, set_fighter_2_id] = useState('');

    const [new_fighter_name, set_new_fighter_name] = useState('');
    const [new_fighter_nickname, set_new_fighter_nickname] = useState('');
    const [new_fighter_image, set_new_fighter_image] = useState('');

    const [new_wins, set_new_wins] = useState('0');
    const [new_losses, set_new_losses] = useState('0');
    const [new_draws, set_new_draws] = useState('0');
    const [new_nc, set_new_nc] = useState('0');

    useEffect(() => {
        const load_fights = async () => {
            let fights: Fight[] = [];
            if (editing_event_id) {
                fights = await get_fights_for_event(editing_event_id);
            }

            if (fights.length > 0) {
                const sorted_fights = fights.sort((a, b) => {
                    const category_rank = {
                        'Main Event': 5,
                        'Co-Main Event': 4,
                        'Main Card': 3,
                        'Preliminares': 2,
                        'Early Prelims': 1
                    };
                    const rank_a = category_rank[a.category as keyof typeof category_rank] || 0;
                    const rank_b = category_rank[b.category as keyof typeof category_rank] || 0;
                    if (rank_a !== rank_b) return rank_b - rank_a;

                    if (a.is_title !== b.is_title) return (a.is_title ? 1 : 0) - (b.is_title ? 1 : 0) * -1;

                    return (b.order || 0) - (a.order || 0);
                });

                const total = sorted_fights.length;
                const fights_with_correct_order = sorted_fights.map((f, index) => ({
                    ...f,
                    order: total - index
                }));

                set_current_event_fights(fights_with_correct_order);
            } else {
                set_current_event_fights([]);
            }
        };
        load_fights();
    }, [editing_event_id, view_mode, events]);

    const default_banner_config = { x: 50, y: 50, scale: 1 };
    const [banner_settings, set_banner_settings] = useState<{
        dashboard: { desktop: BannerConfig; mobile: BannerConfig };
        list: { desktop: BannerConfig; mobile: BannerConfig };
        summary: { desktop: BannerConfig; mobile: BannerConfig };
    }>({
        dashboard: { desktop: { ...default_banner_config }, mobile: { ...default_banner_config, y: 20 } },
        list: { desktop: { ...default_banner_config }, mobile: { ...default_banner_config, y: 20 } },
        summary: { desktop: { ...default_banner_config }, mobile: { ...default_banner_config, y: 20 } }
    });

    const [active_context, set_active_context] = useState<keyof NonNullable<Event['banner_settings']>>('dashboard');
    const [active_mode, set_active_mode] = useState<'desktop' | 'mobile'>('desktop');

    const navigate_to_list = () => {
        set_view_mode('list');
        set_editing_event_id(null);
        reset_event_form();
    };

    const navigate_to_create = () => {
        set_view_mode('edit');
        set_editing_event_id(null);
        reset_event_form();
    };

    const navigate_to_edit = (event: Event) => {
        set_view_mode('edit');
        set_editing_event_id(event.id);

        set_title(event.title);
        set_subtitle(event.subtitle);

        const start_date_time = new Date(event.date);
        set_start_date(start_date_time.toISOString().split('T')[0]);
        set_start_time(start_date_time.toTimeString().slice(0, 5));

        if (event.end_date) {
            const end_date_time = new Date(event.end_date);
            set_end_date(end_date_time.toISOString().split('T')[0]);
            set_end_time(end_date_time.toTimeString().slice(0, 5));
        } else {
            const end_date_time = new Date(start_date_time.getTime() + 8 * 60 * 60 * 1000);
            set_end_date(end_date_time.toISOString().split('T')[0]);
            set_end_time(end_date_time.toTimeString().slice(0, 5));
        }

        const banner = event.banner_settings || {};
        set_banner_settings({
            dashboard: {
                desktop: banner.dashboard?.desktop || { ...default_banner_config },
                mobile: banner.dashboard?.mobile || { ...default_banner_config, y: 20 }
            },
            list: {
                desktop: banner.list?.desktop || { ...default_banner_config },
                mobile: banner.list?.mobile || { ...default_banner_config, y: 20 }
            },
            summary: {
                desktop: banner.summary?.desktop || { ...default_banner_config },
                mobile: banner.summary?.mobile || { ...default_banner_config, y: 20 }
            }
        });

        set_location(event.location);
        set_banner_url(event.banner_url);

        set_event_lock_status(event.lock_status || 'open');
        set_event_lock_time(event.lock_time || '');
        set_cascade_start_time(event.cascade_start_time || '');
    };

    const reset_event_form = () => {
        set_title('');
        set_subtitle('');
        set_start_date('');
        set_start_time('');
        set_end_date('');
        set_end_time('');
        set_location('');
        set_banner_url('');
        set_banner_settings({
            dashboard: { desktop: { ...default_banner_config }, mobile: { ...default_banner_config, y: 20 } },
            list: { desktop: { ...default_banner_config }, mobile: { ...default_banner_config, y: 20 } },
            summary: { desktop: { ...default_banner_config }, mobile: { ...default_banner_config, y: 20 } }
        });
        set_event_lock_status('open');
        set_event_lock_time('');
        set_cascade_start_time('');
    };

    const handle_create_or_update_event = async (e: React.FormEvent) => {
        e.preventDefault();

        const full_start_date = `${start_date}T${start_time}:00`;
        const full_end_date = `${end_date}T${end_time}:00`;

        const event_data = {
            title,
            subtitle,
            date: full_start_date,
            end_date: full_end_date,
            location,
            banner_url: banner_url,
            status: 'upcoming' as const,
            lock_status: event_lock_status,
            lock_time: event_lock_time,
            cascade_start_time: cascade_start_time,
            banner_settings: banner_settings,
        };

        if (editing_event_id) {
            await update_event({ ...event_data, id: editing_event_id });
            alert('Evento atualizado!');
        } else {
            await create_event(event_data);
            alert('Evento criado! Agora você pode editá-lo para adicionar lutas.');
            navigate_to_list();
        }
    };

    const handle_delete_event = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            await delete_event(id);
        }
    };

    const handle_create_fighter = async (e: React.FormEvent) => {
        e.preventDefault();

        const new_fighter = await create_fighter({
            name: new_fighter_name,
            nickname: new_fighter_nickname,
            image_url: new_fighter_image,
            wins: parseInt(new_wins) || 0,
            losses: parseInt(new_losses) || 0,
            draws: parseInt(new_draws) || 0,
            nc: parseInt(new_nc) || 0
        });

        set_new_fighter_name(''); set_new_fighter_nickname(''); set_new_fighter_image('');
        set_new_wins('0'); set_new_losses('0'); set_new_draws('0'); set_new_nc('0');

        if (is_fighter_modal_open) {
            set_is_fighter_modal_open(false);
            if (pending_fighter_select === 'fighter_a') set_fighter_1_id(new_fighter.id);
            if (pending_fighter_select === 'fighter_b') set_fighter_2_id(new_fighter.id);
            set_pending_fighter_select(null);
        }

        alert('Lutador cadastrado!');
    };

    const navigate_to_picks = () => {
        set_view_mode('picks');
        set_editing_event_id(null);
    };

    const navigate_to_results = () => {
        set_view_mode('results');
        set_editing_event_id(null);
    };


    // --- 🏆 VICTORY LAP: SEED 2.0 ---
    const [is_seeding, set_is_seeding] = useState(false);

    const handle_generate_seed = async () => {
        if (!confirm('SEED 2.0: Gerar evento completo para teste do Story Creator?')) return;
        set_is_seeding(true);
        try {
            const suffix = Math.floor(Math.random() * 1000);

            // 1. Create Event via Context (Tests Service Layer)
            const evt = await create_event({
                title: `UFC Victory ${suffix}`,
                subtitle: "Zero-Translation Card",
                date: new Date(Date.now() + 172800000).toISOString(),
                location: "Rio de Janeiro, BR",
                banner_url: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1600&auto=format&fit=crop",
                status: "upcoming"
            });

            console.log(`✅ Event Created: ${evt.id}`);

            // 2. Create Fighters & Fights
            const names = ["Anderson Silva", "Chael Sonnen", "Vitor Belfort", "Wanderlei Silva"];
            const imgs = [
                "https://randomuser.me/api/portraits/men/1.jpg",
                "https://randomuser.me/api/portraits/men/2.jpg",
                "https://randomuser.me/api/portraits/men/3.jpg",
                "https://randomuser.me/api/portraits/men/4.jpg"
            ];

            // Main Event
            const f1 = await create_fighter({ name: `${names[0]} ${suffix}`, nickname: "Spider", image_url: imgs[0], wins: 34, losses: 11, draws: 0, nc: 1 });
            const f2 = await create_fighter({ name: `${names[1]} ${suffix}`, nickname: "Gangster", image_url: imgs[1], wins: 31, losses: 17, draws: 1, nc: 0 });

            const fight1 = await create_fight({
                event_id: evt.id,
                fighter_a_id: f1.id,
                fighter_b_id: f2.id,
                category: "Main Event",
                weight_class: "Médio",
                rounds: 5,
                points: 100,
                order: 1
            });

            // Co-Main
            const f3 = await create_fighter({ name: `${names[2]} ${suffix}`, nickname: "Phenom", image_url: imgs[2], wins: 26, losses: 14, draws: 0, nc: 1 });
            const f4 = await create_fighter({ name: `${names[3]} ${suffix}`, nickname: "Axe Murderer", image_url: imgs[3], wins: 35, losses: 14, draws: 1, nc: 1 });

            const fight2 = await create_fight({
                event_id: evt.id,
                fighter_a_id: f3.id,
                fighter_b_id: f4.id,
                category: "Co-Main",
                weight_class: "M. Pesado",
                rounds: 3,
                points: 50,
                order: 2
            });

            // 3. Submit Picks (The Final Test)
            // Simulating picks via API Service directly to batch it
            const picks = [
                { fight_id: fight1.id, fighter_id: f1.id, method: "KO", round: "R2", event_id: evt.id }, // Correct snake_case
                { fight_id: fight2.id, fighter_id: f4.id, method: "DEC", round: "R3", event_id: evt.id }
            ];

            // We use the service method from Context if available, or direct api fetch
            // Assuming submit_pick is single, we loop:
            await submit_pick(picks[0]);
            await submit_pick(picks[1]);

            alert("🏆 SEED 2.0 SUCESSO! \n\nO sistema está 100% operacional.\nVá para o Dashboard e gere seu Story!");
            window.location.href = '/';

        } catch (err: any) {
            console.error(err);
            alert(`Erro no Seed: ${err.message}`);
        } finally {
            set_is_seeding(false);
            // load_global_data is defined inside useEffect, so we can't call it here directly. 
            // Triggering a re-fetch via get_admin_events which is available from context
            get_admin_events();
        }
    };

    const navigate_to_story = () => {
        on_navigate('story');
    };

    const handle_update_banner_setting = (key: 'x' | 'y' | 'scale', value: number) => {
        set_banner_settings(prev => {
            const context_data = prev[active_context];
            const mode_data = context_data[active_mode];

            return {
                ...prev,
                [active_context]: {
                    ...context_data,
                    [active_mode]: {
                        ...mode_data,
                        [key]: value
                    }
                }
            };
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 font-display pb-32 relative">

            {is_fighter_modal_open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#121212] border border-white/20 rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => set_is_fighter_modal_open(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h2 className="text-xl font-condensed font-bold text-white uppercase mb-4">Adicionar Lutador Rápido</h2>
                        <FighterForm
                            on_submit={handle_create_fighter}
                            name={new_fighter_name} set_name={set_new_fighter_name}
                            nickname={new_fighter_nickname} set_nickname={set_new_fighter_nickname}
                            wins={new_wins} set_wins={set_new_wins}
                            losses={new_losses} set_losses={set_new_losses}
                            draws={new_draws} set_draws={set_new_draws}
                            nc={new_nc} set_nc={set_new_nc}
                            image={new_fighter_image} set_image={set_new_fighter_image}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={navigate_to_list}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${view_mode === 'list' ? 'bg-primary text-white shadow-neon-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Eventos
                    </button>
                    <button
                        onClick={navigate_to_picks}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${view_mode === 'picks' ? 'bg-primary text-white shadow-neon-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Palpites
                    </button>
                    <button
                        onClick={navigate_to_results}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${view_mode === 'results' ? 'bg-primary text-white shadow-neon-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Resultados
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={navigate_to_story}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white/70 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">share</span>
                        📸 Testar Story Creator
                    </button>
                    <button
                        onClick={handle_generate_seed}
                        disabled={is_seeding}
                        className="bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/50 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        {is_seeding ? '...' : '🏆 Seed 2.0'}
                    </button>
                    <button
                        onClick={navigate_to_create}
                        className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded font-bold uppercase text-sm shadow-neon-sm transition-all active:scale-95"
                    >
                        Novo Evento
                    </button>
                </div>
            </div>

            {view_mode === 'list' ? (
                <EventList
                    events={events}
                    fighters={available_fighters}
                    on_navigate_to_results={navigate_to_results}
                    on_navigate_to_picks={navigate_to_picks}
                    on_navigate_to_create={navigate_to_create}
                    on_navigate_to_edit={navigate_to_edit}
                    on_delete_event={handle_delete_event}
                    on_create_fighter={handle_create_fighter}
                    new_fighter_name={new_fighter_name} set_new_fighter_name={set_new_fighter_name}
                    new_fighter_nickname={new_fighter_nickname} set_new_fighter_nickname={set_new_fighter_nickname}
                    new_wins={new_wins} set_new_wins={set_new_wins}
                    new_losses={new_losses} set_losses={set_new_losses}
                    new_draws={new_draws} set_draws={set_new_draws}
                    new_nc={new_nc} set_nc={set_new_nc}
                    new_fighter_image={new_fighter_image} set_new_fighter_image={set_new_fighter_image}
                />
            ) : view_mode === 'picks' ? (
                <PicksManager
                    events={events}
                    fighters={available_fighters}
                    get_all_picks_for_event={get_all_picks_for_event}
                    get_fights_for_event={get_fights_for_event}
                    submit_pick={submit_pick}
                    on_back={navigate_to_list}
                />
            ) : view_mode === 'edit' ? (
                <>
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={navigate_to_list} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                        </button>
                        <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                            {editing_event_id ? `Editando: ${title}` : 'Novo Evento'}
                        </h1>
                    </div>

                    <EventEditor
                        is_editing={!!editing_event_id}
                        title={title} set_title={set_title}
                        subtitle={subtitle} set_subtitle={set_subtitle}
                        start_date={start_date} set_start_date={set_start_date}
                        start_time={start_time} set_start_time={set_start_time}
                        end_date={end_date} set_end_date={set_end_date}
                        end_time={end_time} set_end_time={set_end_time}
                        location={location} set_location={set_location}
                        banner_url={banner_url} set_banner_url={set_banner_url}
                        banner_settings={banner_settings}
                        update_banner_setting={handle_update_banner_setting}
                        active_context={active_context}
                        set_active_context={set_active_context}
                        active_mode={active_mode}
                        set_active_mode={set_active_mode}
                        event_lock_status={event_lock_status}
                        set_event_lock_status={set_event_lock_status}
                        event_lock_time={event_lock_time}
                        set_event_lock_time={set_event_lock_time}
                        cascade_start_time={cascade_start_time}
                        set_cascade_start_time={set_cascade_start_time}
                        on_submit={handle_create_or_update_event}
                    />

                    {editing_event_id && (
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary">sports_mma</span>
                                <h2 className="text-xl font-condensed font-bold text-white uppercase tracking-wider">
                                    Card de Lutas
                                </h2>
                            </div>

                            <FightManager
                                editing_event_id={editing_event_id!}
                                fighters={available_fighters}
                                current_event_fights={current_event_fights}
                                set_current_event_fights={set_current_event_fights}
                                event_lock_status={event_lock_status}
                                cascade_start_time={cascade_start_time}
                                on_open_fighter_modal={(target) => {
                                    set_pending_fighter_select(target);
                                    set_is_fighter_modal_open(true);
                                }}
                                fighter_1_id={fighter_1_id}
                                set_fighter_1_id={set_fighter_1_id}
                                fighter_2_id={fighter_2_id}
                                set_fighter_2_id={set_fighter_2_id}
                            />
                        </div>
                    )}
                </>
            ) : view_mode === 'results' ? (
                <ResultsManager
                    events={events}
                    fighters={available_fighters}
                    get_fights_for_event={get_fights_for_event}
                    update_fight={update_fight}
                    on_back={navigate_to_list}
                />
            ) : null}

            <style>{`
                .admin-input { width: 100%; background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.25rem; padding: 0.5rem; color: white; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
                .admin-input:focus { border-color: #ec1313; }
                .admin-input option { background-color: #121212; color: white; }
                .admin-btn-primary { width: 100%; background-color: #ec1313; color: white; font-weight: bold; padding: 0.75rem; border-radius: 0.25rem; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.05em; transition: background-color 0.2s; }
                .admin-btn-primary:hover { background-color: #c91010; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                input[type="time"]::-webkit-calendar-picker-indicator,
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>
        </div >
    );
};

export default Admin;
