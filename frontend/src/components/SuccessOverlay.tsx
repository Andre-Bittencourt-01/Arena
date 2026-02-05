import React, { useRef, useState } from 'react';
import { Event, Fight, Pick, User } from '../types';
import StoryCard from './StoryCard';
import { Screen } from '../App';
import { toPng } from 'html-to-image';

interface SuccessOverlayProps {
    event: Event;
    fights: Fight[];
    picks: Record<string, Pick>;
    user: User | null;
    onClose: () => void;
    onExit: (target: Screen) => void;
    pendingDestination: Screen | null;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
    event,
    fights,
    picks,
    user,
    onClose,
    onExit,
    pendingDestination
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    // Calculate stats (even if minimal for now)
    let total_points = 0;
    let correct_picks = 0;
    fights.forEach(f => {
        const pick = picks[f.id];
        if (pick) {
            total_points += pick.points_earned || 0;
            if (f.winner_id && pick.fighter_id === f.winner_id) correct_picks++;
        }
    });
    const accuracy = fights.length > 0 ? Math.round((correct_picks / fights.length) * 100) : 0;

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);

        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#000000'
            });

            if (navigator.share) {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], `meus-palpites-${event.id}.png`, { type: "image/png" });
                await navigator.share({
                    title: 'Meus Palpites - Arena MMA',
                    text: `Confira meus palpites para o ${event.title}!`,
                    files: [file]
                });
            } else {
                // Fallback: Download
                const link = document.createElement('a');
                link.download = `meus-palpites-${event.id}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error("Share failed", err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleExitClick = () => {
        onExit(pendingDestination || 'events');
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">

            {/* Header */}
            <div className="w-full text-center pt-8 pb-4 shrink-0 relative z-20">
                <h2 className="text-2xl md:text-3xl font-condensed font-black text-white uppercase italic tracking-tighter drop-shadow-lg">
                    Resumo dos seus Palpites
                </h2>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 animate-pulse">
                    Salvo com Sucesso!
                </p>
            </div>

            {/* Card Preview Area */}
            <div className="flex-1 flex items-center justify-center p-4 w-full overflow-y-auto custom-scrollbar">
                <div className="scale-75 md:scale-90 origin-center bg-black shadow-2xl rounded-lg overflow-hidden border border-white/10">
                    <StoryCard
                        ref={cardRef}
                        event={event}
                        fights={fights}
                        picks={picks}
                        user={user}
                        total_points={total_points}
                        accuracy={accuracy}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="w-full max-w-md mx-auto p-6 flex flex-col gap-3 shrink-0 relative z-20">

                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-condensed font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(236,19,19,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 group"
                >
                    {isSharing ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
                            <span>Compartilhar</span>
                        </>
                    )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span>Voltar</span>
                    </button>

                    <button
                        onClick={handleExitClick}
                        className="py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <span>Sair</span>
                        <span className="material-symbols-outlined text-sm">logout</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SuccessOverlay;
