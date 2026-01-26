import React, { useEffect, useState } from 'react';
import { Screen } from '../App';
import { useData } from '../contexts/DataContext';
import { Event, Fight, Pick } from '../types';
import EventHeader from '../components/features/event/EventHeader';
import StatsOverview from '../components/features/stats/StatsOverview';
import FightResultCard from '../components/features/fight/FightResultCard';

interface EventResultsProps {
    onNavigate: (screen: Screen) => void;
    eventId: string;
}

const EventResults: React.FC<EventResultsProps> = ({ onNavigate, eventId }) => {
    const { getEvent, getFightsForEvent, getPicksForEvent } = useData();
    const [event, setEvent] = useState<Event | null>(null);
    const [fights, setFights] = useState<Fight[]>([]);
    const [picks, setPicks] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const evt = await getEvent(eventId);
            const fts = await getFightsForEvent(eventId);
            const userPicks = await getPicksForEvent(eventId);

            setEvent(evt);
            setFights(fts);
            setPicks(userPicks);
            setLoading(false);
        };
        loadData();
    }, [eventId]);

    if (loading || !event) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-primary/30"></div>
            </div>
        );
    }

    // Calculate Stats
    let correctPicks = 0;
    let totalPointsEarned = 0;

    fights.forEach(f => {
        if (f.winner_id && picks[f.id] === f.winner_id) {
            correctPicks++;
            totalPointsEarned += f.points;
        }
    });

    const winnerAccuracy = fights.length > 0 ? Math.round((correctPicks / fights.length) * 100) : 0;
    // Mocking Method/Round stats as we don't pick them yet, but user requested the visual
    const methodAccuracy = Math.round(winnerAccuracy * 0.7);
    const roundAccuracy = Math.round(winnerAccuracy * 0.5);

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] font-sans bg-background-dark">
            {/* Banner Header */}
            <section className="relative w-full h-[220px] overflow-hidden bg-background-dark border-b border-white/5">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${event.banner_url}")` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/60 to-transparent"></div>

                <div className="relative h-full flex flex-col justify-end pb-6 px-6 lg:px-8 max-w-[1600px] mx-auto">
                    <button onClick={() => onNavigate('events')} className="text-gray-400 hover:text-white uppercase text-xs font-bold tracking-widest flex items-center gap-1 mb-4 w-fit transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar para Eventos
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                                <span className="material-symbols-outlined text-xs">history</span>
                                Evento Finalizado
                            </div>
                            <h1 className="text-4xl md:text-5xl font-condensed font-bold text-white leading-none uppercase italic">
                                {event.title}: <span className="text-primary">{event.subtitle.split(' vs ')[0]}</span> vs <span className="text-white">{event.subtitle.split(' vs ')[1]}</span>
                            </h1>
                            <p className="text-gray-400 font-condensed uppercase tracking-wide text-sm">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                        </div>

                        {/* Stats Summary Visuals */}
                        <div className="flex gap-4">
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
                                    <span className="text-3xl font-condensed font-bold text-white leading-none">{totalPointsEarned}</span>
                                    <span className="text-[10px] text-accent-green font-bold">PTS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-[1600px] mx-auto px-6 lg:px-8 pt-6 pb-4 w-full">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-xl font-condensed font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">grading</span>
                        Gabarito Oficial & Seus Palpites
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-green"></span><span>Acerto</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span><span>Erro</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500"></span><span>Empate/NC</span></div>
                    </div>
                </div>
            </section>

            {/* Results Grid - Card Style */}
            <section className="flex-1 max-w-[1600px] mx-auto px-6 lg:px-8 pb-32 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {fights.map(fight => {
                        const isMainEvent = fight.category === 'Main Event';
                        const winnerId = fight.winner_id;
                        const myPickId = picks[fight.id];

                        const isPickCorrect = myPickId === winnerId;
                        const isDrawOrNC = fight.result === 'draw' || fight.result === 'nc';

                        const fighter1Won = winnerId === fight.fighter_a.id;
                        const fighter2Won = winnerId === fight.fighter_b.id;

                        // Compute border color based on result
                        let borderColorClass = "border-white/10";
                        if (isDrawOrNC) borderColorClass = "border-gray-600";
                        else if (isPickCorrect) borderColorClass = "border-accent-green shadow-[0_0_10px_rgba(34,197,94,0.3)]";
                        else borderColorClass = "border-primary shadow-[0_0_10px_rgba(239,68,68,0.3)]";

                        return (
                            <div key={fight.id} className={`group relative flex flex-col bg-surface-dark ${borderColorClass} transition-all duration-300 rounded-lg overflow-hidden`}>
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
                                        {/* Fighter 1 */}
                                        <div className={`flex flex-col items-center gap-2 w-1/2 z-10 ${fighter2Won ? 'opacity-50 grayscale' : ''}`}>
                                            <div className="relative w-full">
                                                <img
                                                    alt={fight.fighter_a.name}
                                                    className={`w-full aspect-square rounded-lg object-cover ${fighter1Won ? 'border-2 border-accent-green' : ''}`}
                                                    src={fight.fighter_a.image_url}
                                                />
                                                {/* Pick Indicator */}
                                                {myPickId === fight.fighter_a.id && (
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

                                        {/* Fighter 2 */}
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

                                    {/* Result Details */}
                                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                        <div className="bg-black/40 rounded p-1.5 border border-white/5 text-center">
                                            <p className="text-[9px] text-gray-500 uppercase mb-0.5">Método</p>
                                            <span className="text-white font-bold font-condensed text-[10px]">{fight.method || '--'}</span>
                                        </div>
                                        <div className="bg-black/40 rounded p-1.5 border border-white/5 text-center">
                                            <p className="text-[9px] text-gray-500 uppercase mb-0.5">Pontos</p>
                                            <span className={`${isPickCorrect ? 'text-accent-green' : 'text-gray-600'} font-bold font-condensed`}>
                                                {isPickCorrect ? `+${fight.points}` : '0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default EventResults;
