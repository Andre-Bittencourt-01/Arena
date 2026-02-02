import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { League, User } from '../types';

interface EditLeagueProps {
    leagueId: string;
    onBack: () => void;
}

const EditLeague: React.FC<EditLeagueProps> = ({ leagueId, onBack }) => {
    const { getLeagueById, updateLeague, deleteLeague, getUserById, removeMember, manageAdmin } = useData();
    const { user } = useAuth();

    const [league, setLeague] = useState<League | null>(null);
    const [members, setMembers] = useState<User[]>([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isOwner = league?.ownerId === user?.id;
    const isAdmin = league?.admins.includes(user?.id || '') || isOwner;

    useEffect(() => {
        let mounted = true;
        setError(''); // Limpa erros antigos
        setLoading(true);

        const load = async () => {
            try {
                const data = await getLeagueById(leagueId);
                if (mounted && data) {
                    setLeague(data);
                    setName(data.name);
                    setDescription(data.description || '');
                    setLogoUrl(data.logo || '');

                    const membersData = await Promise.all(
                        data.members.map(id => getUserById(id))
                    );
                    if (mounted) {
                        setMembers(membersData.filter(u => u !== null) as User[]);
                    }
                } else if (mounted && !data) {
                    setError('Liga não encontrada.');
                }
            } catch (err: any) {
                if (mounted) {
                    console.error("Erro detalhado ao carregar liga:", err);

                    // Ignorar erros de cancelamento/aborto comuns em StrictMode ou navegação rápida
                    const isCancel = err.name === 'CanceledError' || err.name === 'AbortError' || err?.message === 'canceled';
                    if (isCancel) return;

                    // Só mostra erro na tela se REALMENTE não tivermos dados preenchidos
                    setLeague(prev => {
                        if (!prev) setError("Falha ao carregar dados da liga.");
                        return prev;
                    });
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, [leagueId, getLeagueById, getUserById]);

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!league || !isAdmin) return;

        const payload = {
            name,
            description,
            logo_url: logoUrl
        };

        console.log('Payload Update League:', payload);

        setSaving(true);
        setError('');
        try {
            await updateLeague(leagueId, payload);
            alert("Liga atualizada com sucesso!");
        } catch (err: any) {
            console.error("Erro ao salvar liga:", err);
            setError(err.message || 'Erro ao salvar alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLeague = async () => {
        if (!isOwner) return;
        if (window.confirm("Tem certeza que deseja EXCLUIR permanentemente esta liga? Esta ação não pode ser desfeita.")) {
            try {
                await deleteLeague(leagueId);
                onBack();
            } catch (err: any) {
                setError(err.message || 'Erro ao excluir liga.');
            }
        }
    };

    const handleRemoveMember = async (targetUserId: string) => {
        if (!isAdmin) return;
        if (targetUserId === league?.ownerId) return;

        if (window.confirm("Remover este membro da liga?")) {
            try {
                const updated = await removeMember(leagueId, targetUserId);
                setLeague(updated);
                setMembers(prev => prev.filter(m => m.id !== targetUserId));
            } catch (err: any) {
                setError(err.message || 'Erro ao remover membro.');
            }
        }
    };

    const handleToggleAdmin = async (targetUserId: string, currentIsAdmin: boolean) => {
        if (!isOwner) return;
        const action = currentIsAdmin ? 'demote' : 'promote';
        try {
            const updated = await manageAdmin(leagueId, targetUserId, action);
            setLeague(updated);
        } catch (err: any) {
            setError(err.message || 'Erro ao alterar permissão.');
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
                <form onSubmit={handleSaveDetails} className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="leagueName" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Nome da Liga</label>
                                <input
                                    id="leagueName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                    onChange={(e) => setDescription(e.target.value)}
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
                                        {logoUrl ? <img src={logoUrl} alt={`Logo da liga ${name}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-gray-600">image</span></div>}
                                    </div>
                                    <input
                                        id="logoUrl"
                                        type="text"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Código de Convite</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-primary font-mono font-bold tracking-tighter">{league.inviteCode}</code>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(league.inviteCode);
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
                        const memberIsOwner = league.ownerId === member.id;
                        const memberIsAdmin = league.admins.includes(member.id);

                        return (
                            <div key={member.id} className="group bg-surface-dark/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-white/10 hover:bg-surface-dark">
                                <img src={member.avatar} className="size-12 rounded-full border border-white/10" alt={member.name} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white truncate">{member.name}</h4>
                                        {memberIsOwner ? (
                                            <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">DONO</span>
                                        ) : memberIsAdmin ? (
                                            <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">ADMIN</span>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">{member.points} pts acumulados</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isOwner && !memberIsOwner && (
                                        <button
                                            onClick={() => handleToggleAdmin(member.id, memberIsAdmin)}
                                            className={`size-9 rounded-lg flex items-center justify-center transition-all ${memberIsAdmin ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                            title={memberIsAdmin ? "Remover Admin" : "Tornar Admin"}
                                        >
                                            <span className="material-symbols-outlined text-lg">{memberIsAdmin ? 'verified_user' : 'shield'}</span>
                                        </button>
                                    )}

                                    {isAdmin && !memberIsOwner && member.id !== user?.id && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
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
            {isOwner && (
                <section className="pt-8 border-t border-white/5">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <span className="material-symbols-outlined">warning</span>
                            <h3 className="font-black uppercase italic tracking-widest text-sm">Zona de <span className="underline italic">Perigo</span></h3>
                        </div>
                        <p className="text-xs text-red-500/60 font-medium">Ao excluir a liga, todos os participantes serão removidos e o histórico desta liga será apagado para sempre.</p>
                        <button
                            onClick={handleDeleteLeague}
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
