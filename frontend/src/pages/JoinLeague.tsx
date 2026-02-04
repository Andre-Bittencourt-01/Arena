import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { League } from '../types';

interface JoinLeagueProps {
    inviteCode?: string;
    onNavigate: (screen: any) => void;
    onJoinSuccess: () => void;
}

const JoinLeague: React.FC<JoinLeagueProps> = ({ inviteCode, onNavigate, onJoinSuccess }) => {
    const { get_league_by_invite_code, join_league } = useData();
    const { user } = useAuth();

    const [code, set_code] = useState(inviteCode || '');
    const [league, set_league] = useState<League | null>(null);
    const [error, set_error] = useState('');
    const [loading, set_loading] = useState(false);

    useEffect(() => {
        if (inviteCode) {
            verify_code(inviteCode);
        }
    }, [inviteCode]);

    const verify_code = async (code_to_verify: string) => {
        set_loading(true);
        set_error('');
        try {
            const found = await get_league_by_invite_code(code_to_verify);
            if (found) {
                set_league(found);
            } else {
                set_error('Liga não encontrada com este código.');
                set_league(null);
            }
        } catch (err: any) {
            set_error(err.message || 'Erro ao verificar código.');
        } finally {
            set_loading(false);
        }
    };

    const handle_join = async () => {
        if (!user || !league) return;

        try {
            await join_league(league.invite_code, user.id);
            onJoinSuccess();
        } catch (err: any) {
            set_error(err.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-surface-dark border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-neon-sm">
                <div className="text-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-primary mb-2">group_add</span>
                    <h1 className="text-2xl font-bold uppercase">Entrar em uma Liga</h1>
                </div>

                {!league ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm uppercase text-gray-400 mb-2">Código de Convite</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => set_code(e.target.value.toUpperCase())}
                                placeholder="EX: A1B2C3"
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-center text-2xl font-mono tracking-widest text-white focus:border-primary outline-none uppercase"
                            />
                        </div>
                        <button
                            onClick={() => verify_code(code)}
                            disabled={!code || loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white p-3 rounded-lg font-bold uppercase transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : 'Buscar Liga'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-400 text-sm mb-1 uppercase">Você foi convidado para</p>
                            <h2 className="text-2xl font-bold">{league.name}</h2>
                            <p className="text-xs text-gray-500 mt-2">Código: {league.invite_code}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { set_league(null); set_code(''); }}
                                className="flex-1 bg-surface-dark border border-white/10 text-white p-3 rounded-lg font-bold uppercase hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handle_join}
                                className="flex-1 bg-primary text-white p-3 rounded-lg font-bold uppercase shadow-neon-sm hover:scale-[1.02] transition-transform"
                            >
                                Entrar
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinLeague;
