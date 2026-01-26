import React from 'react';

interface StatsOverviewProps {
    winnerAccuracy: number;
    methodAccuracy: number;
    roundAccuracy: number;
    totalPoints: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ winnerAccuracy, methodAccuracy, roundAccuracy, totalPoints }) => {
    return (
        <div className="bg-surface-dark/80 backdrop-blur border border-white/10 rounded-xl p-3 min-w-[300px] flex items-center justify-between gap-4">
            {/* Winner Stat */}
            <div className="flex flex-col items-center gap-1">
                <div className="relative h-12 w-12">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className={`${winnerAccuracy > 50 ? 'text-accent-green' : 'text-primary'} drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${winnerAccuracy}, 100`} strokeWidth="3"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{winnerAccuracy}%</span>
                    </div>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Vencedor</span>
            </div>

            {/* Method Stat */}
            <div className="flex flex-col items-center gap-1">
                <div className="relative h-12 w-12">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-gray-400" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${methodAccuracy}, 100`} strokeWidth="3"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{methodAccuracy}%</span>
                    </div>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Método</span>
            </div>

            {/* Round Stat */}
            <div className="flex flex-col items-center gap-1">
                <div className="relative h-12 w-12">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-gray-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${roundAccuracy}, 100`} strokeWidth="3"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{roundAccuracy}%</span>
                    </div>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Round</span>
            </div>

            <div className="h-10 w-px bg-white/10 mx-1"></div>

            <div className="flex flex-col items-end justify-center">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Pontuação Total</span>
                <span className="text-3xl font-condensed font-bold text-white leading-none">{totalPoints}</span>
                <span className="text-[10px] text-accent-green font-bold">PTS</span>
            </div>
        </div>
    );
};

export default StatsOverview;
