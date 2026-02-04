import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { League, User } from '../types';

interface EditLeagueProps {
    league_id: string;
    onBack: () => void;
}

const EditLeague: React.FC<EditLeagueProps> = ({ league_id, onBack }) => {
    const { get_league_by_id, update_league, delete_league, get_user_by_id, remove_member, manage_admin } = useData();
    const { user } = useAuth();

    const [league, set_league] = useState<League | null>(null);
    const [members, set_members] = useState<User[]>([]);

    const [name, set_name] = useState('');
    const [description, set_description] = useState('');
    const [logo_url, set_logo_url] = useState('');
    const [loading, set_loading] = useState(true);
    const [saving, set_saving] = useState(false);
    const [error, set_error] = useState('');

    const is_owner = league?.owner_id === user?.id;
    const is_admin = league?.admins.includes(user?.id || '') || is_owner;

    useEffect(() => {
        let mounted = true;
        set_error('');
        set_loading(true);

        const load = async () => {
            try {
                const data = await get_league_by_id(league_id);
                if (mounted && data) {
                    set_league(data);
                    set_name(data.name);
                    set_description(data.description || '');
                    set_logo_url(data.logo_url || data.logo || '');

                    const members_data = await Promise.all(
                        data.members.map(id => get_user_by_id(id))
                    );
                    if (mounted) {
                        set_members(members_data.filter(u => u !== null) as User[]);
                    }
                } else if (mounted && !data) {
                    set_error('Liga não encontrada.');
                }
            } catch (err: any) {
                if (mounted) {
                    console.error("Erro detalhado ao carregar liga:", err);
                    const is_cancel = err.name === 'CanceledError' || err.name === 'AbortError' || err?.message === 'canceled';
                    if (is_cancel) return;

                    set_league(prev => {
                        if (!prev) set_error("Falha ao carregar dados da liga.");
                        return prev;
                    });
                }
            } finally {
                if (mounted) set_loading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, [league_id, get_league_by_id, get_user_by_id]);

    const handle_save_details = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!league || !is_admin) return;

        const payload = {
            name,
            description,
            logo_url: logo_url
        };

        set_saving(true);
        set_error('');
        try {
            await update_league(league_id, payload);
            alert("Liga atualizada com sucesso!");
        } catch (err: any) {
            console.error("Erro ao salvar liga:", err);
            set_error(err.message || 'Erro ao salvar alterações.');
        } finally {
            set_saving(false);
        }
    };

    const handle_delete_league = async () => {
        if (!is_owner) return;
        if (window.confirm("Tem certeza que deseja EXCLUIR permanentemente esta liga? Esta ação não pode ser desfeita.")) {
            try {
                await delete_league(league_id);
                onBack();
            } catch (err: any) {
                set_error(err.message || 'Erro ao excluir liga.');
            }
        }
    };

    const handle_remove_member = async (target_user_id: string) => {
        if (!is_admin) return;
        if (target_user_id === league?.owner_id) return;

        if (window.confirm("Remover este membro da liga?")) {
            try {
                const updated = await remove_member(league_id, target_user_id);
                set_league(updated);
                set_members(prev => prev.filter(m => m.id !== target_user_id));
            } catch (err: any) {
                set_error(err.message || 'Erro ao remover membro.');
            }
        }
    };

    const handle_toggle_admin = async (target_user_id: string, current_is_admin: boolean) => {
        if (!is_owner) return;
        const action = current_is_admin ? 'demote' : 'promote';
        try {
            const updated = await manage_admin(league_id, target_user_id, action);
            set_league(updated);
        } catch (err: any) {
            set_error(err.message || 'Erro ao alterar permissão.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-500 font-condensed uppercase tracking-widest text-sm">Carregando dados da liga...</p>
        </div>
    );

    if (error && !league) return (
        <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl mx-4 my-8">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
            <p className="text-red-400 font-bold uppercase tracking-widest">{error}</p>
            <button onClick={onBack} className="mt-6 text-gray-400 hover:text-white underline text-sm">Voltar para Ligas</button>
        </div>
    );

    if (!league) return <div className="p-8 text-center text-red-400">Liga não encontrada.</div>;

    return (
        <div className="container mx-auto px-4 py-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black uppercase italic tracking-wider">Editar <span className="text-primary">Liga</span></h1>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined text-lg">warning</span>
                    <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                </div>
            )}

            {/* Basic Info Section */}
            <section className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-1 bg-gradient-to-r from-primary/20 to-transparent" />
                <form onSubmit={handle_save_details} className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="leagueName" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Nome da Liga</label>
                                <input
                                    id="leagueName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => set_name(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
                                    placeholder="Nome da liga"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="leagueDesc" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Descrição</label>
                                <textarea
                                    id="leagueDesc"
                                    value={description}
                                    onChange={(e) => set_description(e.target.value)}
                                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium resize-none text-sm"
                                    placeholder="Conte mais sobre sua liga..."
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="logoUrl" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">URL do Logo</label>
                                <div className="flex gap-3">
                                    <div className="size-12 shrink-0 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                        {logo_url ? <img src={logo_url} alt={`Logo da liga ${name}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-gray-600">image</span></div>}
                                    </div>
                                    <input
                                        id="logoUrl"
                                        type="text"
                                        value={logo_url}
                                        onChange={(e) => set_logo_url(e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Código de Convite</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-primary font-mono font-bold tracking-tighter">{league.invite_code}</code>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(league.invite_code);
                                            alert("Código copiado!");
                                        }}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <span className="material-symbols-outlined text-lg">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-[0.2em] shadow-neon-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Members Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-black uppercase italic tracking-widest">Membros & <span className="text-primary">Permissões</span></h2>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{members.length} cadastrados</span>
                </div>

                <div className="grid gap-3">
                    {members.map(member => {
                        const member_is_owner = league.owner_id === member.id;
                        const member_is_admin = league.admins.includes(member.id);

                        return (
                            <div key={member.id} className="group bg-surface-dark/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-white/10 hover:bg-surface-dark">
                                <img src={member.avatar_url || (member as any).avatar} className="size-12 rounded-full border border-white/10 outline-none" alt={member.name} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white truncate">{member.name}</h4>
                                        {member_is_owner ? (
                                            <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">DONO</span>
                                        ) : member_is_admin ? (
                                            <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">ADMIN</span>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">{member.points} pts acumulados</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {is_owner && !member_is_owner && (
                                        <button
                                            onClick={() => handle_toggle_admin(member.id, member_is_admin)}
                                            className={`size-9 rounded-lg flex items-center justify-center transition-all ${member_is_admin ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                            title={member_is_admin ? "Remover Admin" : "Tornar Admin"}
                                        >
                                            <span className="material-symbols-outlined text-lg">{member_is_admin ? 'verified_user' : 'shield'}</span>
                                        </button>
                                    )}

                                    {is_admin && !member_is_owner && member.id !== user?.id && (
                                        <button
                                            onClick={() => handle_remove_member(member.id)}
                                            className="size-9 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                            title="Remover da Liga"
                                        >
                                            <span className="material-symbols-outlined text-lg">person_remove</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Danger Zone */}
            {is_owner && (
                <section className="pt-8 border-t border-white/5">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <span className="material-symbols-outlined">warning</span>
                            <h3 className="font-black uppercase italic tracking-widest text-sm">Zona de <span className="underline italic">Perigo</span></h3>
                        </div>
                        <p className="text-xs text-red-500/60 font-medium">Ao excluir a liga, todos os participantes serão removidos e o histórico desta liga será apagado para sempre.</p>
                        <button
                            onClick={handle_delete_league}
                            className="w-full py-4 rounded-xl border border-red-500/30 text-red-500 font-bold uppercase text-xs tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-[0.98]"
                        >
                            Excluir Liga Permanentemente
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default EditLeague;
