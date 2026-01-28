import React, { useEffect } from 'react';
import { Screen } from '../App';
import { useData } from '../contexts/DataContext';

interface CardSummaryProps {
  onNavigate: (screen: Screen) => void;
}

const CardSummary: React.FC<CardSummaryProps> = ({ onNavigate }) => {
  const { currentEvent, currentFights, loading, getFightsForEvent } = useData();

  useEffect(() => {
    if (currentEvent) {
      getFightsForEvent(currentEvent.id);
    }
  }, [currentEvent, getFightsForEvent]); // Added getFightsForEvent to dependency array

  if (loading || !currentEvent) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-primary/30"></div>
      </div>
    );
  }

  // Calculate stats (mocked logic for now based on data)
  const totalPoints = currentFights.length > 0 ? 380 : 0; // This should be calculated based on actual fight points
  const completedPicks = currentFights.length;

  return (
    <div className="flex flex-col h-full font-display bg-background-dark overflow-hidden">
      <section className="relative w-full h-[120px] md:h-[220px] overflow-hidden bg-background-dark border-b border-white/5 flex-shrink-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${currentEvent.banner_url}")` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/60 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end pb-3 px-4 lg:px-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-6">
            <div className="space-y-0.5 md:space-y-1">
              <div className="inline-flex items-center gap-2 px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary text-[8px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-2">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary animate-pulse"></span>
                Ao Vivo em 2 Dias
              </div>
              <h1 className="text-xl md:text-5xl font-condensed font-bold text-white leading-none uppercase italic truncate max-w-[280px] md:max-w-none">
                {currentEvent.title}: <span className="text-primary">{currentEvent.subtitle.split(' vs ')[0]}</span> vs {currentEvent.subtitle.split(' vs ')[1]}
              </h1>
              <p className="text-gray-400 font-condensed uppercase tracking-wide text-[10px] md:text-sm">{currentEvent.location.split(',')[0]} • 23:00</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-surface-dark/80 backdrop-blur border border-white/10 rounded p-1.5 md:p-3 min-w-[80px] md:min-w-[120px]">
                <p className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1">Palpites</p>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="material-symbols-outlined text-accent-green text-sm md:text-xl">check_circle</span>
                  <span className="text-xs md:text-xl font-bold text-white font-condensed">{completedPicks}/{completedPicks}</span>
                </div>
              </div>
              <div className="bg-surface-dark/80 backdrop-blur border border-white/10 rounded p-1.5 md:p-3 min-w-[80px] md:min-w-[120px]">
                <p className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1">Pontos</p>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="material-symbols-outlined text-primary text-sm md:text-xl">emoji_events</span>
                  <span className="text-xs md:text-xl font-bold text-white font-condensed">{totalPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 lg:px-8 pt-3 pb-2 w-full flex-shrink-0">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h2 className="text-sm md:text-xl font-condensed font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg md:text-xl">assignment</span>
            Seu Card ({currentFights.length} Lutas)
          </h2>
          <div className="flex items-center gap-2 text-[8px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>Vencedor</span>
          </div>
        </div>
      </section>

      <section className="flex-1 max-w-[1600px] mx-auto px-4 lg:px-8 pb-32 w-full overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-3">
          {currentFights.map((fight) => {
            const isMainEvent = fight.category === 'Main Event';
            const winnerId = fight.winner_id;

            const fighter1Won = winnerId === fight.fighter_a.id;
            const fighter2Won = winnerId === fight.fighter_b.id;

            return (
              <div key={fight.id} className="group relative flex flex-col bg-surface-dark border border-white/10 hover:border-primary/50 transition-all duration-300 rounded-lg overflow-hidden shadow-lg card-gradient">
                {isMainEvent ? (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                ) : (
                  <div className="absolute top-0 left-0 w-1 h-full bg-border-dark group-hover:bg-primary transition-colors"></div>
                )}

                <div className="px-2 py-1.5 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <span className={`${isMainEvent ? 'text-primary' : 'text-gray-300'} font-condensed font-bold text-[9px] md:text-xs uppercase tracking-wider`}>{fight.category}</span>
                  <span className="text-gray-500 text-[8px] md:text-[10px] uppercase font-bold">{fight.weight_class}</span>
                </div>

                <div className="px-2 py-2 md:py-4 flex flex-col gap-2 md:gap-3">
                  <div className="flex justify-center items-end gap-1.5 md:gap-2 relative">
                    {/* Fighter 1 */}
                    <div className={`flex flex-col items-center gap-1 md:gap-2 w-1/2 z-10 ${fighter2Won ? 'opacity-50' : ''}`}>
                      <div className="relative w-full">
                        <img
                          alt={fight.fighter_a.name}
                          className={`w-full aspect-square rounded-md md:rounded-lg object-cover ${fighter1Won ? 'border-2 border-primary shadow-[0_0_8px_rgba(236,19,19,0.4)]' : 'grayscale'}`}
                          src={fight.fighter_a.image_url}
                        />
                        {fighter1Won && (
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[7px] md:text-[9px] font-bold px-1 py-0.5 rounded shadow-sm tracking-wider">WIN</div>
                        )}
                      </div>
                      <span className={`font-condensed font-bold text-[10px] md:text-sm text-center leading-tight mt-0.5 px-0.5 truncate w-full ${fighter1Won ? 'text-white' : 'text-gray-400'}`}>{fight.fighter_a.name.split(' ').pop()}</span>
                    </div>

                    {/* VS */}
                    {isMainEvent && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-white/5 font-condensed font-bold text-2xl italic select-none pointer-events-none z-0">VS</div>
                    )}

                    {/* Fighter 2 */}
                    <div className={`flex flex-col items-center gap-1 md:gap-2 w-1/2 z-10 ${fighter1Won ? 'opacity-50' : ''}`}>
                      <div className="relative w-full">
                        <img
                          alt={fight.fighter_b.name}
                          className={`w-full aspect-square rounded-md md:rounded-lg object-cover ${fighter2Won ? 'border-2 border-primary shadow-[0_0_8px_rgba(236,19,19,0.4)]' : 'grayscale'}`}
                          src={fight.fighter_b.image_url}
                        />
                        {fighter2Won && (
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[7px] md:text-[9px] font-bold px-1 py-0.5 rounded shadow-sm tracking-wider">WIN</div>
                        )}
                      </div>
                      <span className={`font-condensed font-bold text-[10px] md:text-sm text-center leading-tight mt-0.5 px-0.5 truncate w-full ${fighter2Won ? 'text-white' : 'text-gray-400'}`}>{fight.fighter_b.name.split(' ').pop()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 md:gap-2 text-[9px] md:text-xs mt-0.5">
                    <div className="bg-black/40 rounded p-1 border border-white/5 text-center">
                      <p className="text-[7px] md:text-[9px] text-gray-500 uppercase mb-0">Método</p>
                      <span className="text-white font-bold font-condensed">{fight.method || '--'}</span>
                    </div>
                    <div className="bg-black/40 rounded p-1 border border-white/5 text-center">
                      <p className="text-[7px] md:text-[9px] text-gray-500 uppercase mb-0">Round</p>
                      <span className="text-white font-bold font-condensed">{fight.round_end || '--'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto px-2 py-1 bg-black/30 border-t border-white/5 flex justify-between items-center">
                  <span className="text-gray-600 text-[8px] md:text-[10px] font-bold uppercase">Potencial</span>
                  <span className={`${fight.points === 35 ? 'text-accent-green' : 'text-gray-400'} text-[10px] md:text-xs font-bold font-condensed`}>+{fight.points} pts</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-md border-t border-white/10 p-2 md:p-4 shadow-2xl z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center animate-bounce flex-shrink-0">
              <span className="material-symbols-outlined text-sm md:text-base">check_circle</span>
            </div>
            <div className="flex flex-col">
              <p className="text-white font-bold font-condensed text-base md:text-lg leading-none tracking-tight">CARD COMPLETO!</p>
              <p className="text-gray-500 text-[8px] md:text-xs uppercase tracking-wider">Todos os {currentFights.length} palpites registrados.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <button className="text-gray-400 hover:text-white text-[10px] md:text-sm font-bold px-2 py-2 md:px-4 md:py-3 transition-colors uppercase font-condensed tracking-wide">
              Editar
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex-1 md:flex-none bg-primary hover:bg-primary-hover text-white text-sm md:text-lg font-bold font-condensed uppercase tracking-wide py-2.5 px-6 md:py-3 md:px-10 rounded shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>ENVIAR PALPITES</span>
              <span className="material-symbols-outlined text-base md:text-xl">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSummary;