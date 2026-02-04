import React from 'react';

interface FighterFormProps {
    on_submit: (e: React.FormEvent) => void;
    name: string; set_name: (v: string) => void;
    nickname: string; set_nickname: (v: string) => void;
    image: string; set_image: (v: string) => void;
    wins: string; set_wins: (v: string) => void;
    losses: string; set_losses: (v: string) => void;
    draws: string; set_draws: (v: string) => void;
    nc: string; set_nc: (v: string) => void;
}

const FighterForm: React.FC<FighterFormProps> = ({
    on_submit, name, set_name, nickname, set_nickname, image, set_image,
    wins, set_wins, losses, set_losses, draws, set_draws, nc, set_nc
}) => (
    <form onSubmit={on_submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Nome Completo</label>
                <input type="text" value={name} onChange={e => set_name(e.target.value)} className="admin-input" required />
            </div>
            <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Apelido</label>
                <input type="text" value={nickname} onChange={e => set_nickname(e.target.value)} className="admin-input" />
            </div>
        </div>
        <div>
            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">URL da Foto</label>
            <input type="text" value={image} onChange={e => set_image(e.target.value)} className="admin-input" required />
        </div>
        <div className="grid grid-cols-4 gap-4">
            <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Vitórias</label>
                <input type="number" value={wins} onChange={e => set_wins(e.target.value)} className="admin-input" required />
            </div>
            <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Derrotas</label>
                <input type="number" value={losses} onChange={e => set_losses(e.target.value)} className="admin-input" required />
            </div>
            <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Empates</label>
                <input type="number" value={draws} onChange={e => set_draws(e.target.value)} className="admin-input" required />
            </div>
            <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">NC</label>
                <input type="number" value={nc} onChange={e => set_nc(e.target.value)} className="admin-input" required />
            </div>
        </div>
        <button type="submit" className="w-full bg-secondary hover:bg-secondary-hover text-black font-bold py-3 rounded uppercase tracking-widest text-xs">
            Adicionar à Arena
        </button>
    </form>
);

export default FighterForm;
