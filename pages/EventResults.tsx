import React, { useEffect, useState } from 'react';
import { Screen } from '../App';
import { useData } from '../contexts/DataContext';
import { Event, Fight, Pick } from '../types';

interface EventResultsProps {
    onNavigate: (screen: Screen) => void;
    eventId: string;
}

const EventResults: React.FC<EventResultsProps> = ({ onNavigate, eventId }) => {
    const { getEvent, getFightsForEvent, getPicksForEvent } = useData();
    const [event, setEvent] = useState<Event | null>(null);
    const [fights, setFights] = useState<Fight[]>([]);
    const [picks, setPicks] = useState<Record<string, Pick>>({});
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
    let perfectPicks = 0; // "Mitadas" (Winner + Method + Round)
    let totalPointsEarned = 0;
    let correctMethods = 0;
    let correctRounds = 0;

    fights.forEach(f => {
        const pick = picks[f.id];
        if (pick) {
            totalPointsEarned += pick.points_earned || 0;

            if (f.winner_id && pick.fighter_id === f.winner_id) {
                correctPicks++;

                if (f.method && pick.method && f.method.includes(pick.method)) {
                    correctMethods++;

                    const isDec = f.method.includes('DEC');
                    const isRoundCorrect = isDec
                        ? (f.method.includes(pick.round || ''))
                        : (f.round_end === pick.round);

                    if (isRoundCorrect) {
                        correctRounds++;
                        if (f.video_url) perfectPicks++;
                    }
                }
            }
        }
    });

    const safeDiv = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0;
    const winnerAccuracy = safeDiv(correctPicks, fights.length);
    const methodAccuracy = safeDiv(correctMethods, fights.length);
    const roundAccuracy = safeDiv(correctRounds, fights.length);

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

                        <div className="flex gap-4">
                            <div className="bg-surface-dark/80 backdrop-blur border border-white/10 rounded-xl p-3 min-w-[300px] flex items-center justify-between gap-4">
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
                        const userPick = picks[fight.id];
                        const myPickId = userPick?.fighter_id;

                        const isPickCorrect = winnerId && myPickId === winnerId;
                        const points = userPick?.points_earned || 0;

                        const fighter1Won = winnerId === fight.fighter_a.id;
                        const fighter2Won = winnerId === fight.fighter_b.id;

                        // Unified method correction check
                        const isMethodCorrect = isPickCorrect && userPick?.method && (
                            (fight.method?.includes('DEC') && userPick.method === 'DEC') ||
                            (fight.method?.includes('SUB') && userPick.method === 'SUB') ||
                            ((fight.method?.includes('KO') || fight.method?.includes('TKO')) && userPick.method === 'KO/TKO')
                        );

                        const getWinnerBoxStyles = (isWinner: boolean, isPick: boolean) => {
                            let borderClass = 'border-white/10 bg-white/5 opacity-40';
                            let textClass = 'text-gray-500';
                            let iconClass = '';
                            let icon = null;
                            let imgBorderClass = 'border-2 border-transparent';
                            let imgShadowClass = '';

                            if (isWinner) {
                                borderClass = 'border-white bg-white/15 opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.1)]';
                                textClass = 'text-white font-bold tracking-tight';
                                imgBorderClass = 'border-2 border-white';
                                imgShadowClass = 'shadow-[0_0_15px_rgba(255,255,255,0.3)]';
                            }

                            if (isPick) {
                                if (isPickCorrect) {
                                    borderClass = 'border-green-500 bg-green-500/30 opacity-100 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
                                    textClass = 'text-white font-bold tracking-tight';
                                    imgBorderClass = 'border-2 border-green-500';
                                    imgShadowClass = 'shadow-[0_0_15px_rgba(34,197,94,0.4)]';
                                    iconClass = 'text-green-500';
                                    icon = 'check_circle';
                                } else if (winnerId) {
                                    borderClass = 'border-red-500 bg-red-500/30 opacity-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                                    textClass = 'text-white font-bold tracking-tight';
                                    imgBorderClass = 'border-2 border-red-500';
                                    imgShadowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';
                                    iconClass = 'text-red-500';
                                    icon = 'cancel';
                                }
                            }

                            return { borderClass, textClass, iconClass, icon, imgBorderClass, imgShadowClass };
                        };

                        const f1Styles = getWinnerBoxStyles(fighter1Won, myPickId === fight.fighter_a.id);
                        const f2Styles = getWinnerBoxStyles(fighter2Won, myPickId === fight.fighter_b.id);

                        return (
                            <div key={fight.id} className={`group relative flex flex-col bg-surface-dark border-white/10 transition-all duration-300 rounded-lg overflow-hidden border`}>
                                {/* Header */}
                                <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <span className={`${isMainEvent ? 'text-white' : 'text-gray-300'} font-condensed font-bold text-xs uppercase tracking-wider`}>{fight.category}</span>
                                    <span className="text-gray-500 text-[10px] uppercase font-bold">{fight.weight_class}</span>
                                </div>

                                <div className="px-3 py-4 flex flex-col gap-3">
                                    {/* Fighters Images - Visual Result */}
                                    <div className="flex justify-center items-end gap-2 relative mb-2">
                                        {/* Fighter 1 */}
                                        <div className={`flex flex-col items-center gap-2 w-1/2 z-10 ${fighter2Won && myPickId !== fight.fighter_a.id ? 'opacity-40 grayscale' : ''}`}>
                                            <div className="relative w-full">
                                                <img
                                                    alt={fight.fighter_a.name}
                                                    className={`w-full aspect-square rounded-lg object-cover transition-all duration-300 ${f1Styles.imgBorderClass} ${f1Styles.imgShadowClass} ${myPickId === fight.fighter_a.id && !isPickCorrect && winnerId ? 'opacity-80' : ''}`}
                                                    src={fight.fighter_a.image_url}
                                                />

                                                {/* CORRECT PICK INDICATOR */}
                                                {fighter1Won && isPickCorrect && (
                                                    <div className="absolute top-1 left-1 z-30 bg-black/40 backdrop-blur-[2px] rounded-full p-0.5 shadow-md">
                                                        <span className="material-symbols-outlined text-xl text-green-500 block leading-none">check_circle</span>
                                                    </div>
                                                )}

                                                {/* INCORRECT PICK INDICATOR */}
                                                {myPickId === fight.fighter_a.id && !isPickCorrect && winnerId && (
                                                    <div className="absolute top-1 left-1 z-30 bg-black/40 backdrop-blur-[2px] rounded-full p-0.5 shadow-md">
                                                        <span className="material-symbols-outlined text-xl text-red-500 block leading-none">cancel</span>
                                                    </div>
                                                )}

                                                {/* User Pick Badge */}
                                                {myPickId === fight.fighter_a.id && (
                                                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-blue-600 border border-blue-400/30 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wide z-20 whitespace-nowrap flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[8px]">person</span> SEU
                                                    </div>
                                                )}
                                            </div>

                                            {/* Winner Box 1 */}
                                            <div className={`w-full flex items-center justify-center gap-1 px-1 py-1.5 mt-1 rounded border text-[10px] font-condensed transition-all duration-300 ${f1Styles.borderClass}`}>
                                                {f1Styles.icon && <span className={`material-symbols-outlined text-[14px] ${f1Styles.iconClass}`}>{f1Styles.icon}</span>}
                                                <span className={`text-center leading-tight truncate ${f1Styles.textClass}`}>{fight.fighter_a.name}</span>
                                            </div>
                                        </div>

                                        {/* VS */}
                                        {isMainEvent && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-white/5 font-condensed font-bold text-3xl italic select-none pointer-events-none z-0">VS</div>
                                        )}

                                        {/* Fighter 2 */}
                                        <div className={`flex flex-col items-center gap-2 w-1/2 z-10 ${fighter1Won && myPickId !== fight.fighter_b.id ? 'opacity-40 grayscale' : ''}`}>
                                            <div className="relative w-full">
                                                <img
                                                    alt={fight.fighter_b.name}
                                                    className={`w-full aspect-square rounded-lg object-cover transition-all duration-300 ${f2Styles.imgBorderClass} ${f2Styles.imgShadowClass} ${myPickId === fight.fighter_b.id && !isPickCorrect && winnerId ? 'opacity-80' : ''}`}
                                                    src={fight.fighter_b.image_url}
                                                />

                                                {/* CORRECT PICK INDICATOR */}
                                                {fighter2Won && isPickCorrect && (
                                                    <div className="absolute top-1 left-1 z-30 bg-black/40 backdrop-blur-[2px] rounded-full p-0.5 shadow-md">
                                                        <span className="material-symbols-outlined text-xl text-green-500 block leading-none">check_circle</span>
                                                    </div>
                                                )}

                                                {/* INCORRECT PICK INDICATOR */}
                                                {myPickId === fight.fighter_b.id && !isPickCorrect && winnerId && (
                                                    <div className="absolute top-1 left-1 z-30 bg-black/40 backdrop-blur-[2px] rounded-full p-0.5 shadow-md">
                                                        <span className="material-symbols-outlined text-xl text-red-500 block leading-none">cancel</span>
                                                    </div>
                                                )}

                                                {/* User Pick Badge */}
                                                {myPickId === fight.fighter_b.id && (
                                                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-blue-600 border border-blue-400/30 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wide z-20 whitespace-nowrap flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[8px]">person</span> SEU
                                                    </div>
                                                )}
                                            </div>

                                            {/* Winner Box 2 */}
                                            <div className={`w-full flex items-center justify-center gap-1 px-1 py-1.5 mt-1 rounded border text-[10px] font-condensed transition-all duration-300 ${f2Styles.borderClass}`}>
                                                {f2Styles.icon && <span className={`material-symbols-outlined text-[14px] ${f2Styles.iconClass}`}>{f2Styles.icon}</span>}
                                                <span className={`text-center leading-tight truncate ${f2Styles.textClass}`}>{fight.fighter_b.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Method Selector Bar */}
                                    <div className="grid grid-cols-3 gap-1 mb-2">
                                        {['KO/TKO', 'SUB', 'DEC'].map((methodType) => {
                                            const isOfficial = fight.method?.includes(methodType) || (methodType === 'DEC' && fight.method?.includes('DEC'));
                                            const isMyPick = userPick?.method === methodType;
                                            // Method is correct if matches official AND winner is correct
                                            const isCorrect = isOfficial && isMyPick && isPickCorrect;

                                            let borderClass = 'border-white/10 bg-white/5 opacity-40';
                                            let textClass = 'text-gray-500';
                                            let iconClass = '';
                                            let icon = null;

                                            if (isOfficial) {
                                                borderClass = 'border-white bg-white/15 opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.1)]';
                                                textClass = 'text-white font-bold tracking-tight';
                                            }

                                            if (isMyPick) {
                                                if (isCorrect) {
                                                    borderClass = 'border-green-500 bg-green-500/30 opacity-100 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
                                                    textClass = 'text-white font-bold tracking-tight';
                                                    iconClass = 'text-green-500';
                                                    icon = 'check_circle';
                                                } else if (winnerId) {
                                                    borderClass = 'border-red-500 bg-red-500/30 opacity-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                                                    textClass = 'text-white font-bold tracking-tight';
                                                    iconClass = 'text-red-500';
                                                    icon = 'cancel';
                                                }
                                            }

                                            return (
                                                <div key={methodType} className={`flex items-center justify-center gap-1.5 py-2 rounded border text-[10px] font-condensed transition-all duration-300 ${borderClass}`}>
                                                    {icon && <span className={`material-symbols-outlined text-[14px] ${iconClass}`}>{icon}</span>}
                                                    <span className={textClass}>{methodType}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Round Selector Bar */}
                                    <div className={`grid ${isMainEvent ? 'grid-cols-5' : 'grid-cols-3'} gap-1 mb-2`}>
                                        {[1, 2, 3, 4, 5].map((roundNum) => {
                                            if (!isMainEvent && roundNum > 3) return null;

                                            const isDecision = fight.method?.includes('DEC');
                                            const maxRounds = isMainEvent ? 5 : 3;

                                            let officialRoundNum = 0;
                                            if (isDecision) {
                                                officialRoundNum = maxRounds;
                                            } else if (fight.round_end) {
                                                officialRoundNum = parseInt(fight.round_end.toString().replace('R', ''));
                                            }

                                            let userPickRoundNum = 0;
                                            if (userPick?.round) {
                                                userPickRoundNum = parseInt(userPick.round.toString().replace('R', ''));
                                            }

                                            const isOfficial = officialRoundNum === roundNum;
                                            const isMyPick = userPickRoundNum === roundNum;
                                            // Round is correct ONLY if Winner AND Method were also correct (point-yielding)
                                            const isCorrect = isOfficial && isMyPick && isMethodCorrect;

                                            let borderClass = 'border-white/10 bg-white/5 opacity-40';
                                            let textClass = 'text-gray-500';
                                            let iconClass = '';
                                            let icon = null;

                                            if (isOfficial) {
                                                borderClass = 'border-white bg-white/15 opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.1)]';
                                                textClass = 'text-white font-bold tracking-tight';
                                            }

                                            if (isMyPick) {
                                                if (isCorrect) {
                                                    borderClass = 'border-green-500 bg-green-500/30 opacity-100 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
                                                    textClass = 'text-white font-bold tracking-tight';
                                                    iconClass = 'text-green-500';
                                                    icon = 'check_circle';
                                                } else if (winnerId) {
                                                    borderClass = 'border-red-500 bg-red-500/30 opacity-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                                                    textClass = 'text-white font-bold tracking-tight';
                                                    iconClass = 'text-red-500';
                                                    icon = 'cancel';
                                                }
                                            }

                                            return (
                                                <div key={roundNum} className={`flex items-center justify-center gap-1.5 py-2 rounded border text-[10px] font-condensed transition-all duration-300 ${borderClass}`}>
                                                    {icon && <span className={`material-symbols-outlined text-[14px] ${iconClass}`}>{icon}</span>}
                                                    <span className={textClass}>R{roundNum}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Decision Type Selector Bar */}
                                    <div className="grid grid-cols-3 gap-1 mb-2">
                                        {['UNÂNIME', 'DIVIDIDA', 'MAJORITÁRIA'].map((decType) => {
                                            const isOfficial = fight.method?.toUpperCase().includes(decType);
                                            const isMyPick = userPick?.round?.toUpperCase() === decType;
                                            // Decision Type is correct ONLY if Winner AND Method (DEC) were also correct
                                            const isCorrect = isOfficial && isMyPick && isMethodCorrect;

                                            let borderClass = 'border-white/10 bg-white/5 opacity-40';
                                            let textClass = 'text-gray-500';
                                            let iconClass = '';
                                            let icon = null;

                                            if (isOfficial) {
                                                borderClass = 'border-white bg-white/15 opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.1)]';
                                                textClass = 'text-white font-bold tracking-wide';
                                            }

                                            if (isMyPick) {
                                                if (isCorrect) {
                                                    borderClass = 'border-green-500 bg-green-500/30 opacity-100 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
                                                    textClass = 'text-white font-bold tracking-wide';
                                                    iconClass = 'text-green-500';
                                                    icon = 'check_circle';
                                                } else if (winnerId) {
                                                    borderClass = 'border-red-500 bg-red-500/30 opacity-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                                                    textClass = 'text-white font-bold tracking-wide';
                                                    iconClass = 'text-red-500';
                                                    icon = 'cancel';
                                                }
                                            }

                                            return (
                                                <div key={decType} className={`flex items-center justify-center gap-1 py-2 rounded border text-[9px] font-condensed transition-all duration-300 ${borderClass}`}>
                                                    {icon && <span className={`material-symbols-outlined text-[12px] ${iconClass}`}>{icon}</span>}
                                                    <span className={textClass}>{decType}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Points Footer */}
                                    <div className={`p-2 rounded border flex justify-between items-center ${isPickCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
                                        <span className={`text-[10px] uppercase font-bold ${isPickCorrect ? 'text-green-500' : 'text-red-400'}`}>
                                            {isPickCorrect ? 'Pontuação Conquistada' : 'Não Pontuou'}
                                        </span>
                                        <span className={`text-sm font-bold font-condensed ${isPickCorrect ? 'text-white' : 'text-gray-500'}`}>
                                            {isPickCorrect ? `+${points}` : '0'} PTS
                                        </span>
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
