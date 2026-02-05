import React from 'react';
import Panel from '../../Panel';
import FighterForm from './FighterForm';
import { Fighter } from '../../../types';

interface FighterBankProps {
    fighters: Fighter[];
    on_create_fighter: (e: React.FormEvent) => void;
    new_fighter_name: string; set_new_fighter_name: (v: string) => void;
    new_fighter_nickname: string; set_new_fighter_nickname: (v: string) => void;
    new_wins: string; set_new_wins: (v: string) => void;
    new_losses: string; set_losses: (v: string) => void;
    new_draws: string; set_draws: (v: string) => void;
    new_nc: string; set_nc: (v: string) => void;
    new_fighter_image: string; set_new_fighter_image: (v: string) => void;
}

const FighterBank: React.FC<FighterBankProps> = ({
    fighters, on_create_fighter,
    new_fighter_name, set_new_fighter_name,
    new_fighter_nickname, set_new_fighter_nickname,
    new_wins, set_new_wins,
    new_losses, set_losses,
    new_draws, set_draws,
    new_nc, set_nc,
    new_fighter_image, set_new_fighter_image
}) => {
    return (
        <div className="space-y-8">
            <Panel title="Cadastrar Lutador" icon="person_add">
                <div className="p-4">
                    <FighterForm
                        on_submit={on_create_fighter}
                        name={new_fighter_name} set_name={set_new_fighter_name}
                        nickname={new_fighter_nickname} set_nickname={set_new_fighter_nickname}
                        image={new_fighter_image} set_image={set_new_fighter_image}
                        wins={new_wins} set_wins={set_new_wins}
                        losses={new_losses} set_losses={set_losses}
                        draws={new_draws} set_draws={set_draws}
                        nc={new_nc} set_nc={set_nc}
                    />
                </div>
            </Panel>

            <Panel title="Banco de Lutadores" icon="group">
                <div className="grid grid-cols-2 gap-4 p-4 max-h-[600px] overflow-y-auto">
                    {fighters.map(fighter => (
                        <div key={fighter.id} className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5">
                            <img src={fighter.image_url} alt={fighter.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                            <div>
                                <p className="font-bold text-white text-xs uppercase">{fighter.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono">
                                    {fighter.wins}-{fighter.losses}-{fighter.draws} ({fighter.nc} NC)
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>
        </div>
    );
};

export default FighterBank;
