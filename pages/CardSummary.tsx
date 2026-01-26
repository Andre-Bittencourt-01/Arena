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
    <div className="flex flex-col min-h-[calc(100vh-64px)] relative">
      <section className="relative w-full h-[220px] overflow-hidden bg-background-dark border-b border-white/5">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${currentEvent.banner_url}")` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/60 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end pb-6 px-6 lg:px-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Ao Vivo em 2 Dias
              </div>
              <h1 className="text-4xl md:text-5xl font-condensed font-bold text-white leading-none uppercase italic">
                {currentEvent.title}: <span className="text-primary">{currentEvent.subtitle.split(' vs ')[0]}</span> vs <span className="text-white">{currentEvent.subtitle.split(' vs ')[1]}</span>
              </h1>
              <p className="text-gray-400 font-condensed uppercase tracking-wide text-sm">{currentEvent.location} • Card Principal 23:00</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-surface-dark/80 backdrop-blur border border-white/10 rounded p-3 min-w-[120px]">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Palpites</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent-green text-xl">check_circle</span>
                  <span className="text-xl font-bold text-white font-condensed">{completedPicks}/{completedPicks}</span>
                </div>
              </div>
              <div className="bg-surface-dark/80 backdrop-blur border border-white/10 rounded p-3 min-w-[120px]">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Pontos Max.</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">emoji_events</span>
                  <span className="text-xl font-bold text-white font-condensed">{totalPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-8 pt-6 pb-4 w-full">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xl font-condensed font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">assignment</span>
            Resumo do seu Card ({currentFights.length} Lutas)
          </h2>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Vencedor Selecionado</span>
          </div>
        </div>
      </section>

      <section className="flex-1 max-w-[1600px] mx-auto px-6 lg:px-8 pb-32 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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

                <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <span className={`${isMainEvent ? 'text-primary' : 'text-gray-300'} font-condensed font-bold text-xs uppercase tracking-wider`}>{fight.category}</span>
                  <span className="text-gray-500 text-[10px] uppercase font-bold">{fight.weight_class}</span>
                </div>

                <div className="px-3 py-4 flex flex-col gap-3">
                  <div className="flex justify-center items-end gap-2 relative">
                    {/* Fighter 1 */}
                    <div className={`flex flex-col items-center gap-2 w-1/2 z-10 ${fighter2Won ? 'opacity-50' : ''}`}>
                      <div className="relative w-full">
                        <img
                          alt={fight.fighter_a.name}
                          className={`w-full aspect-square rounded-lg object-cover ${fighter1Won ? 'border-2 border-primary shadow-[0_0_12px_rgba(236,19,19,0.4)]' : 'grayscale'}`}
                          src={fight.fighter_a.image_url}
                        />
                        {fighter1Won && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wider">WIN</div>
                        )}
                      </div>
                      <span className={`font-condensed font-bold text-sm text-center leading-tight mt-1 px-1 ${fighter1Won ? 'text-white' : 'text-gray-400'}`}>{fight.fighter_a.name}</span>
                    </div>

                    {/* VS */}
                    {isMainEvent && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-white/5 font-condensed font-bold text-3xl italic select-none pointer-events-none z-0">VS</div>
                    )}

                    {/* Fighter 2 */}
                    <div className={`flex flex-col items-center gap-2 w-1/2 z-10 ${fighter1Won ? 'opacity-50' : ''}`}>
                      <div className="relative w-full">
                        <img
                          alt={fight.fighter_b.name}
                          className={`w-full aspect-square rounded-lg object-cover ${fighter2Won ? 'border-2 border-primary shadow-[0_0_12px_rgba(236,19,19,0.4)]' : 'grayscale'}`}
                          src={fight.fighter_b.image_url}
                        />
                        {fighter2Won && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wider">WIN</div>
                        )}
                      </div>
                      <span className={`font-condensed font-bold text-sm text-center leading-tight mt-1 px-1 ${fighter2Won ? 'text-white' : 'text-gray-400'}`}>{fight.fighter_b.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                    <div className="bg-black/40 rounded p-1.5 border border-white/5 text-center">
                      <p className="text-[9px] text-gray-500 uppercase mb-0.5">Método</p>
                      <span className="text-white font-bold font-condensed">{fight.method || '--'}</span>
                    </div>
                    <div className="bg-black/40 rounded p-1.5 border border-white/5 text-center">
                      <p className="text-[9px] text-gray-500 uppercase mb-0.5">Round</p>
                      <span className="text-white font-bold font-condensed">{fight.round_end || '--'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto px-3 py-1.5 bg-black/30 border-t border-white/5 flex justify-between items-center">
                  <span className="text-gray-600 text-[10px] font-bold uppercase">Potencial</span>
                  <span className={`${fight.points === 35 ? 'text-accent-green' : 'text-gray-400'} text-xs font-bold font-condensed`}>+{fight.points} pts</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-md border-t border-white/10 p-4 shadow-2xl z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-white font-bold font-condensed text-lg leading-none">CARD COMPLETO!</p>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Todos os {currentFights.length} palpites registrados.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="text-gray-400 hover:text-white text-sm font-bold px-4 py-3 transition-colors uppercase font-condensed tracking-wide">
              Voltar e Editar
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex-1 md:flex-none bg-primary hover:bg-primary-hover text-white text-lg font-bold font-condensed uppercase tracking-wide py-3 px-10 rounded shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>ENVIAR PALPITES</span>
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSummary;