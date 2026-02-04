import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { League } from '../types';

interface LeaguesProps {
    on_navigate: (screen: any) => void;
    on_select_league: (league_id: string) => void;
    on_edit_league: (league_id: string) => void;
}

const Leagues: React.FC<LeaguesProps> = ({ on_navigate, on_select_league, on_edit_league }) => {
    const { get_leagues_for_user, create_league } = useData();
    const { user } = useAuth();
    const [leagues, set_leagues] = useState<League[]>([]);
    const [is_creating, set_is_creating] = useState(false);
    const [new_league_name, set_new_league_name] = useState('');
    const [new_league_logo, set_new_league_logo] = useState('');
    const [error, set_error] = useState('');

    const load_leagues = async () => {
        if (user) {
            try {
                const user_leagues = await get_leagues_for_user(user.id);
                set_leagues(user_leagues);
            } catch (err: any) {
                console.error("Erro ao carregar ligas:", err);
            }
        }
    };

    useEffect(() => {
        if (user) {
            load_leagues();
        }
    }, [user]);

    const handle_create_league = async (e: React.FormEvent) => {
        e.preventDefault();
        set_error('');
        if (!user) return;

        try {
            await create_league(new_league_name, user.id, undefined, new_league_logo);
            set_new_league_name('');
            set_new_league_logo('');
            set_is_creating(false);
            load_leagues();
        } catch (err: any) {
            set_error(err.message || "Erro ao criar liga");
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold uppercase tracking-tight">Minhas Ligas</h1>
                <button
                    onClick={() => set_is_creating(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold uppercase text-sm tracking-wider hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nova Liga
                </button>
            </div>

            {is_creating && (
                <div className="bg-surface-dark border border-border-dark p-6 rounded-2xl relative animate-in slide-in-from-top duration-300">
                    <button
                        onClick={() => set_is_creating(false)}
                        className="absolute top-4 right-4 text-text-muted hover:text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 className="text-xl font-bold mb-4 uppercase italic">Criar Nova Liga</h2>
                    <form onSubmit={handle_create_league} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-1">Nome da Liga</label>
                            <input
                                type="text"
                                value={new_league_name}
                                onChange={(e) => set_new_league_name(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all"
                                placeholder="Ex: Elite do MMA"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-1">URL da Logo (opcional)</label>
                            <input
                                type="text"
                                value={new_league_logo}
                                onChange={(e) => set_new_league_logo(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>
                        {error && <p className="text-primary text-sm font-bold bg-primary/10 p-3 rounded-lg">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-primary-hover transition-colors shadow-neon"
                        >
                            Criar Liga
                        </button>
                    </form>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {leagues.map(league => {
                    const is_owner = league.owner_id === user?.id;
                    const is_admin = league.members.find(m => m.user_id === user?.id)?.role === 'ADMIN' || is_owner;

                    return (
                        <div
                            key={league.id}
                            onClick={() => {
                                on_select_league(league.id);
                                on_navigate('league-details');
                            }}
                            className={`relative bg-surface-dark border p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01] overflow-hidden ${is_owner ? 'border-primary/40 shadow-[0_0_20px_rgba(236,19,19,0.15)]' : 'border-white/5 hover:border-white/20'}`}
                        >
                            {/* Status Badge */}
                            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-black uppercase tracking-widest ${is_owner ? 'bg-primary text-white shadow-neon-sm' : 'bg-white/10 text-white/50'}`}>
                                {is_owner ? '👑 Dono' : '👥 Membro'}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden ${is_owner ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10'}`}>
                                    {league.logo_url ? (
                                        <img src={league.logo_url} alt={league.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className={`material-symbols-outlined text-2xl ${is_owner ? 'text-primary' : 'text-gray-400'}`}>trophy</span>
                                    )}
                                </div>
                                <div className="pr-12">
                                    <h3 className={`font-bold text-lg leading-tight mb-1 truncate ${is_owner ? 'text-white' : 'text-gray-200'}`}>{league.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(3, league.members.length))].map((_, i) => (
                                                <div key={i} className="size-5 rounded-full border border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                    <span className="material-symbols-outlined text-[10px] text-gray-400">person</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{league.members_count || league.members.length} Participantes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Invite & Edit Actions (Owners/Admins) */}
                            {is_admin && (
                                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const invite_link = `${window.location.protocol}//${window.location.host}/?join=${league.invite_code}`;
                                            navigator.clipboard.writeText(invite_link);
                                            alert(`Link de convite copiado!`);
                                        }}
                                        className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">link</span>
                                        Convidar
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            on_edit_league(league.id);
                                        }}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">settings</span>
                                        Editar
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {leagues.length === 0 && !is_creating && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        <p>Você ainda não participa de nenhuma liga.</p>
                        <p className="text-sm">Crie uma nova ou entre com um código de convite.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leagues;
