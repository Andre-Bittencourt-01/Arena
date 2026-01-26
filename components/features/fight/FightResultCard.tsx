import React from 'react';
import { Fight, Pick } from '../../../types';

interface FightResultCardProps {
    fight: Fight;
    pick?: Pick;
}

const FightResultCard: React.FC<FightResultCardProps> = ({ fight, pick }) => {
    const isMainEvent = fight.category === 'Main Event';
    const winnerId = fight.winner_id;
    const myPickId = pick?.fighter_id;

    // Display Logic
    const resultMethodBase = fight.method?.split(' ')[0] || '';
    const resultRound = fight.round_end || '';
    const resultDetails = fight.method?.match(/\((.*?)\)/)?.[1] || '';

    const fighter1Won = winnerId === fight.fighter_a.id;
    const fighter2Won = winnerId === fight.fighter_b.id;

    const myPickMethod = pick?.method || '-';
    const myPickRound = pick?.round || '-';
    const pointsEarned = pick?.points_earned || 0;

    const isPickCorrect = myPickId === winnerId;
    const isDrawOrNC = fight.result === 'draw' || fight.result === 'nc';

    const displayMethodCorrect = fight.method?.includes(myPickMethod) && isPickCorrect;

    let displayRoundCorrect = false;
    if (displayMethodCorrect) {
        if (myPickMethod === 'DEC') displayRoundCorrect = fight.method?.includes(myPickRound) || false;
        else displayRoundCorrect = fight.round_end === myPickRound;
    }

    const pickedFighterA = myPickId === fight.fighter_a.id;

    // Compute border color based on result
    let borderColorClass = "border-white/10";
    if (isDrawOrNC) borderColorClass = "border-gray-600";
    else if (isPickCorrect) borderColorClass = "border-accent-green shadow-[0_0_10px_rgba(34,197,94,0.3)]";
    else borderColorClass = "border-primary shadow-[0_0_10px_rgba(239,68,68,0.3)]";

    return (
        <div className={`group relative flex flex-col bg-surface-dark ${borderColorClass} transition-all duration-300 rounded-lg overflow-hidden`}>
            {/* Result Badge Overlay */}
            <div className={`absolute top-0 right-0 z-20 px-2 py-1 rounded-bl-lg font-bold text-[10px] uppercase tracking-wider text-white shadow-sm flex items-center gap-1 ${isDrawOrNC ? 'bg-gray-600' :
                    isPickCorrect ? 'bg-accent-green' : 'bg-primary'
                }`}>
                <span className="material-symbols-outlined text-xs">{isDrawOrNC ? 'remove' : isPickCorrect ? 'check' : 'close'}</span>
                {isDrawOrNC ? 'Empate/NC' : isPickCorrect ? 'Acertou' : 'Errou'}
            </div>

            <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center bg-white/5">
                <span className={`${isMainEvent ? 'text-white' : 'text-gray-300'} font-condensed font-bold text-xs uppercase tracking-wider`}>{fight.category}</span>
                <span className="text-gray-500 text-[10px] uppercase font-bold">{fight.weight_class}</span>
            </div>

            <div className="px-3 py-4 flex flex-col gap-3">
                <div className="flex justify-center items-end gap-2 relative">
                    {/* Fighter A */}
                    <div className={`flex flex-col items-center gap-2 w-1/2 z-10 ${fighter2Won ? 'opacity-50 grayscale' : ''}`}>
                        <div className="relative w-full">
                            <img
                                alt={fight.fighter_a.name}
                                className={`w-full aspect-square rounded-lg object-cover ${fighter1Won ? 'border-2 border-accent-green' : ''}`}
                                src={fight.fighter_a.image_url}
                            />
                            {/* Pick Indicator */}
                            {pickedFighterA && (
                                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/20 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wide z-20 whitespace-nowrap">
                                    SEU PALPITE
                                </div>
                            )}
                        </div>
                        <span className={`font-condensed font-bold text-sm text-center leading-tight mt-1 px-1 ${fighter1Won ? 'text-accent-green' : 'text-gray-400'}`}>{fight.fighter_a.name}</span>
                    </div>

                    {/* VS */}
                    {isMainEvent && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-white/5 font-condensed font-bold text-3xl italic select-none pointer-events-none z-0">VS</div>
                    )}

                    {/* Fighter B */}
                    <div className={`flex flex-col items-center gap-2 w-1/2 z-10 ${fighter1Won ? 'opacity-50 grayscale' : ''}`}>
                        <div className="relative w-full">
                            <img
                                alt={fight.fighter_b.name}
                                className={`w-full aspect-square rounded-lg object-cover ${fighter2Won ? 'border-2 border-accent-green' : ''}`}
                                src={fight.fighter_b.image_url}
                            />
                            {/* Pick Indicator */}
                            {myPickId === fight.fighter_b.id && (
                                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/20 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wide z-20 whitespace-nowrap">
                                    SEU PALPITE
                                </div>
                            )}
                        </div>
                        <span className={`font-condensed font-bold text-sm text-center leading-tight mt-1 px-1 ${fighter2Won ? 'text-accent-green' : 'text-gray-400'}`}>{fight.fighter_b.name}</span>
                    </div>
                </div>

                {/* Right Column: Results & Comparison (Mobile/Card View Integrated) */}
                <div className="w-full bg-black/20 border border-white/5 rounded p-3 flex flex-col justify-center mt-2">
                    <div className="grid grid-cols-3 gap-y-2 gap-x-1 text-xs mb-2">
                        {/* Header */}
                        <div className="col-span-1"></div>
                        <div className="col-span-1 text-center text-[8px] uppercase font-bold text-gray-500 tracking-wider">Oficial</div>
                        <div className="col-span-1 text-center text-[8px] uppercase font-bold text-primary tracking-wider">Seu</div>

                        {/* Winner Row */}
                        <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-wide">Vencedor</div>
                        <div className="flex items-center justify-center">
                            <span className="font-condensed font-bold uppercase text-white bg-white/5 px-1.5 py-0.5 rounded text-[10px]">{fighter1Won ? fight.fighter_a.name.split(' ').pop() : fight.fighter_b.name.split(' ').pop()}</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className={`font-condensed font-bold uppercase px-1.5 py-0.5 rounded text-[10px] border ${isPickCorrect ? 'text-accent-green border-accent-green/30 bg-accent-green/5' : 'text-primary border-primary/30 bg-primary/5'}`}>
                                {pickedFighterA ? fight.fighter_a.name.split(' ').pop() : fight.fighter_b.name.split(' ').pop()}
                            </span>
                        </div>

                        {/* Method Row */}
                        <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-wide">Método</div>
                        <div className="flex items-center justify-center text-center">
                            <span className="text-white text-[10px] font-medium">{resultMethodBase}</span>
                        </div>
                        <div className="flex items-center justify-center text-center">
                            <span className={`text-[10px] font-medium ${displayMethodCorrect ? 'text-accent-green' : isPickCorrect ? 'text-primary' : 'text-gray-600'}`}>
                                {myPickMethod}
                            </span>
                        </div>

                        {/* Round/Detail Row */}
                        <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-wide">Detalhe</div>
                        <div className="flex items-center justify-center text-center">
                            <span className="text-white text-[10px] font-medium">{resultMethodBase === 'DEC' ? resultDetails : resultRound}</span>
                        </div>
                        <div className="flex items-center justify-center text-center">
                            <span className={`text-[10px] font-medium ${displayRoundCorrect ? 'text-accent-green' : (isPickCorrect && displayMethodCorrect) ? 'text-primary' : 'text-gray-600'}`}>
                                {myPickRound}
                            </span>
                        </div>
                    </div>

                    {/* Total Points */}
                    <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pontos</span>
                        <div className="flex items-end gap-1">
                            <span className={`text-xl font-condensed font-bold leading-none ${pointsEarned > 0 ? 'text-accent-green' : 'text-gray-600'}`}>+{pointsEarned}</span>
                            <span className="text-[8px] uppercase font-bold text-gray-500 mb-0.5">PTS</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FightResultCard;
