import React from 'react';
import Panel from '../../Panel';
import FighterForm from './FighterForm';
import { Fighter } from '@/types'; // Adjust path if needed

interface FighterBankProps {
    fighters: Fighter[];
    onCreateFighter: (e: React.FormEvent) => void;
    newFighterName: string; setNewFighterName: (v: string) => void;
    newFighterNickname: string; setNewFighterNickname: (v: string) => void;
    newWins: string; setNewWins: (v: string) => void;
    newLosses: string; setLosses: (v: string) => void;
    newDraws: string; setDraws: (v: string) => void;
    newNc: string; setNc: (v: string) => void;
    newFighterImage: string; setNewFighterImage: (v: string) => void;
}

const FighterBank: React.FC<FighterBankProps> = ({
    fighters,
    onCreateFighter,
    newFighterName, setNewFighterName,
    newFighterNickname, setNewFighterNickname,
    newWins, setNewWins,
    newLosses, setLosses,
    newDraws, setDraws,
    newNc, setNc,
    newFighterImage, setNewFighterImage
}) => {
    return (
        <Panel title="Banco de Lutadores (Acesso Rápido)" icon="groups">
            <div className="p-2 space-y-4">
                <FighterForm
                    onSubmit={onCreateFighter}
                    name={newFighterName} setName={setNewFighterName}
                    nickname={newFighterNickname} setNickname={setNewFighterNickname}
                    wins={newWins} setWins={setNewWins}
                    losses={newLosses} setLosses={setLosses}
                    draws={newDraws} setDraws={setDraws}
                    nc={newNc} setNc={setNc}
                    image={newFighterImage} setImage={setNewFighterImage}
                />

                <div className="h-[300px] overflow-y-auto grid grid-cols-2 gap-2">
                    {fighters.map(fighter => (
                        <div key={fighter.id} className="bg-white/5 p-2 rounded flex items-center gap-3 border border-white/5">
                            <img src={fighter.image_url} className="w-8 h-8 rounded object-cover bg-black" />
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{fighter.name}</p>
                                <p className="text-[10px] text-gray-500">
                                    {fighter.wins}-{fighter.losses}-{fighter.draws} ({fighter.nc})
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
    );
};

export default FighterBank;
