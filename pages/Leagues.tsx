import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { League } from '../types';

interface LeaguesProps {
    onNavigate: (screen: any) => void;
    onSelectLeague: (leagueId: string) => void;
    onEditLeague: (leagueId: string) => void;
}

const Leagues: React.FC<LeaguesProps> = ({ onNavigate, onSelectLeague, onEditLeague }) => {
    const { getLeaguesForUser, createLeague } = useData();
    const { user } = useAuth();
    const [leagues, setLeagues] = useState<League[]>([]);

    const [isCreating, setIsCreating] = useState(false);
    const [newLeagueName, setNewLeagueName] = useState('');

    const [newLeagueLogo, setNewLeagueLogo] = useState('');
    const [error, setError] = useState('');


    useEffect(() => {
        if (user) {
            loadLeagues();
        }
    }, [user]);

    const loadLeagues = async () => {
        if (user) {
            const userLeagues = await getLeaguesForUser(user.id);
            setLeagues(userLeagues);
        }

    };

    const handleCreateLeague = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!user) return;

        try {
            await createLeague(newLeagueName, user.id, undefined, newLeagueLogo);
            setNewLeagueName('');
            setNewLeagueLogo('');
            setIsCreating(false);
            loadLeagues();
        } catch (err: any) {

            setError(err.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold uppercase tracking-tight">Minhas Ligas</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary text-white px-4 py-2 rounded font-bold uppercase text-sm shadow-neon-sm"
                >
                    Criar Liga
                </button>
            </div>

            {isCreating && (
                <div className="bg-surface-dark border border-white/10 p-4 rounded-xl space-y-4">
                    <h3 className="font-bold text-lg">Nova Liga</h3>
                    <form onSubmit={handleCreateLeague} className="space-y-4">
                        <div>
                            <label htmlFor="newLeagueName" className="block text-xs uppercase text-gray-400 mb-1">Nome da Liga</label>
                            <input
                                id="newLeagueName"
                                type="text"
                                value={newLeagueName}
                                onChange={(e) => setNewLeagueName(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-primary outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="newLeagueLogo" className="block text-xs uppercase text-gray-400 mb-1">URL do Logo (Opcional)</label>
                            <input
                                id="newLeagueLogo"
                                type="text"
                                value={newLeagueLogo}
                                onChange={(e) => setNewLeagueLogo(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-primary outline-none"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm uppercase font-bold text-gray-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded text-sm uppercase font-bold"
                            >
                                Confirmar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {leagues.map(league => {
                    const isOwner = league.ownerId === user?.id;
                    const isAdmin = league.admins?.includes(user?.id || '') || isOwner;
                    return (
                        <div
                            key={league.id}
                            onClick={() => {
                                console.log("Selecionando Liga:", league.id);
                                onSelectLeague(league.id);
                                setTimeout(() => onNavigate('league-details'), 0);
                            }}
                            className={`relative bg-surface-dark border p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01] overflow-hidden ${isOwner ? 'border-primary/40 shadow-[0_0_20px_rgba(236,19,19,0.1)]' : 'border-white/5 hover:border-white/20'}`}
                        >
                            {/* Status Badge */}
                            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-black uppercase tracking-widest ${isOwner ? 'bg-primary text-white shadow-neon-sm' : 'bg-white/10 text-white/50'}`}>
                                {isOwner ? '👑 Dono' : '👥 Membro'}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden ${isOwner ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10'}`}>
                                    {league.logo ? (
                                        <img src={league.logo} alt={league.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className={`material-symbols-outlined text-2xl ${isOwner ? 'text-primary' : 'text-gray-400'}`}>trophy</span>
                                    )}
                                </div>
                                <div className="pr-12">
                                    <h3 className={`font-bold text-lg leading-tight mb-1 truncate ${isOwner ? 'text-white' : 'text-gray-200'}`}>{league.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(3, league.members.length))].map((_, i) => (
                                                <div key={i} className="size-5 rounded-full border border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                    <span className="material-symbols-outlined text-[10px] text-gray-400">person</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{league.members.length} Participantes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Invite & Edit Actions (Owners/Admins) */}
                            {isAdmin && (
                                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log("Convidar clicado para liga:", league.id);
                                            const inviteLink = `${window.location.protocol}//${window.location.host}/?join=${league.inviteCode}`;
                                            navigator.clipboard.writeText(inviteLink);
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
                                            console.log("Editar clicado para liga:", league.id);
                                            onEditLeague(league.id);
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

                {leagues.length === 0 && !isCreating && (
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
