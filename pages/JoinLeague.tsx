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
    const { getLeagueByInviteCode, joinLeague } = useData();
    const { user } = useAuth();

    const [code, setCode] = useState(inviteCode || '');
    const [league, setLeague] = useState<League | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (inviteCode) {
            verifyCode(inviteCode);
        }
    }, [inviteCode]);

    const verifyCode = async (codeToVerify: string) => {
        setLoading(true);
        setError('');
        const found = await getLeagueByInviteCode(codeToVerify);
        if (found) {

            setLeague(found);
        } else {
            setError('Liga não encontrada com este código.');
            setLeague(null);
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (!user || !league) return;

        try {
            await joinLeague(league.inviteCode, user.id);
            onJoinSuccess();
        } catch (err: any) {

            setError(err.message);
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
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="EX: A1B2C3"
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-center text-2xl font-mono tracking-widest text-white focus:border-primary outline-none uppercase"
                            />
                        </div>
                        <button
                            onClick={() => verifyCode(code)}
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
                            <p className="text-xs text-gray-500 mt-2">Código: {league.inviteCode}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setLeague(null); setCode(''); }}
                                className="flex-1 bg-surface-dark border border-white/10 text-white p-3 rounded-lg font-bold uppercase hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleJoin}
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
