import React from 'react';

interface FighterFormProps {
    onSubmit: (e: React.FormEvent) => void;
    name: string; setName: (v: string) => void;
    nickname: string; setNickname: (v: string) => void;
    image: string; setImage: (v: string) => void;

    // Stats
    wins: string; setWins: (v: string) => void;
    losses: string; setLosses: (v: string) => void;
    draws: string; setDraws: (v: string) => void;
    nc: string; setNc: (v: string) => void;
}

const FighterForm: React.FC<FighterFormProps> = ({
    onSubmit, name, setName, nickname, setNickname, image, setImage,
    wins, setWins, losses, setLosses, draws, setDraws, nc, setNc
}) => (
    <form onSubmit={onSubmit} className="p-4 bg-black/40 rounded border border-white/10 space-y-3">
        <h3 className="text-xs uppercase font-bold text-gray-400 border-b border-white/10 pb-2">Cadastrar Novo Lutador</h3>
        <div className="grid grid-cols-2 gap-2">
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="admin-input" placeholder="Nome" required />
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="admin-input" placeholder="Apelido" />
        </div>

        <div className="grid grid-cols-4 gap-2">
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Vitórias</label>
                <input type="number" value={wins} onChange={e => setWins(e.target.value)} className="admin-input text-center" min="0" required />
            </div>
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Derrotas</label>
                <input type="number" value={losses} onChange={e => setLosses(e.target.value)} className="admin-input text-center" min="0" required />
            </div>
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Empates</label>
                <input type="number" value={draws} onChange={e => setDraws(e.target.value)} className="admin-input text-center" min="0" required />
            </div>
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">NC</label>
                <input type="number" value={nc} onChange={e => setNc(e.target.value)} className="admin-input text-center" min="0" required />
            </div>
        </div>

        <div>
            <input type="text" value={image} onChange={e => setImage(e.target.value)} className="admin-input" placeholder="URL Foto" required />
        </div>
        <button type="submit" className="w-full bg-surface-highlight hover:bg-white/20 text-white text-xs font-bold py-2 rounded uppercase">Cadastrar</button>
    </form>
);

export default FighterForm;
