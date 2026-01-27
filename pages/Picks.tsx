import React, { useState } from 'react';
import { Screen } from '../App';
import Panel from '../components/Panel';

interface PicksProps {
  onNavigate: (screen: Screen) => void;
}

const Picks: React.FC<PicksProps> = ({ onNavigate }) => {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const handleConfirm = () => {
    // In a real app, this would save to a database
    if (selectedWinner && selectedMethod && selectedRound) {
      // Just advance or show success message for now
      onNavigate('summary');
    }
  };

  return (
    <div className="p-4 md:p-8 font-display">
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-8 items-start justify-center">

        {/* Main Selection Area */}
        <div className="w-full max-w-3xl flex flex-col gap-6 flex-1">
          {/* Progress Bar */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end px-1">
              <span className="text-white text-sm font-bold tracking-wider uppercase">Evento Principal</span>
              <span className="text-primary text-sm font-bold">LUTA 12 <span className="text-text-muted">DE 15</span></span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-highlight overflow-hidden">
              <div className="h-full bg-primary rounded-full shadow-[0_0_10px_#ec1313]" style={{ width: '80%' }}></div>
            </div>
          </div>

          {/* Fight Card Header */}
          <div className="flex flex-col rounded-2xl border border-border-dark bg-surface-dark shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-surface-highlight to-surface-dark p-4 border-b border-border-dark text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase">
                Peso Pesado
              </h2>
              <p className="text-text-muted text-xs uppercase tracking-[0.2em] mt-1">Disputa de Cinturão</p>
            </div>

            {/* Fighters Visual - Vertical Stack on Mobile */}
            <div className="flex flex-col md:grid md:grid-cols-2 gap-0 relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 md:-translate-y-1/2 -translate-y-[10%] z-20">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black border-2 border-primary text-white font-black italic shadow-lg text-sm md:text-lg">
                  VS
                </div>
              </div>

              {/* Fighter 1 */}
              <div
                className={`relative group cursor-pointer border-b md:border-b-0 md:border-r border-border-dark/50 ${selectedWinner === 'marcus' ? 'border-r-0' : ''}`}
                onClick={() => setSelectedWinner('marcus')}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0"></div>
                <div
                  className={`aspect-[16/9] md:aspect-[4/5] w-full bg-cover bg-center bg-no-repeat transition-all duration-500 ${selectedWinner === 'marcus' ? 'scale-105' : 'grayscale group-hover:grayscale-0'}`}
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeuogyAzv8sjHHnfp2woQXzdD4mbc4hnB7VQikhwK0tvmyvQSE4hUoS0-ad4317ESO6yGWRxUGcaImvbymT-J-SLnkGNwX9GaZk9K8Mwo83ZHoG0dt7hjjtscOMFpeiAI1L4r8m-rAGf8SYRVY5HY9sOAi8OCJ_Ec_esDZ1-rsFbHmj25w2L4gLUY095GoQOQ-mQ6CButJFscHWnXuGGVBuETJ53hXhj9wxY4-HE4BSTMPnV1NpfbtH3LSEBcEVfAiLKRTdjrr_UBN')` }}
                ></div>
                <div className="absolute bottom-0 left-0 w-full p-4 z-10 flex flex-col items-center">
                  <span className="text-[10px] md:text-xs font-bold text-primary bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm mb-1 sm:mb-2">#1 RANKING</span>
                  <h3 className="text-xl md:text-2xl font-bold text-white text-center leading-none uppercase">Marcus <br className="hidden sm:block" /> "The Tank"</h3>
                </div>
                {selectedWinner === 'marcus' && (
                  <>
                    <div className="absolute inset-0 border-4 border-primary z-20 pointer-events-none opacity-100 shadow-[inset_0_0_30px_rgba(236,19,19,0.5)]"></div>
                    <div className="absolute top-4 right-4 z-20 bg-primary text-white rounded-full p-1 shadow-lg">
                      <span className="material-symbols-outlined text-lg block">check</span>
                    </div>
                  </>
                )}
              </div>

              {/* Fighter 2 */}
              <div
                className={`relative group cursor-pointer`}
                onClick={() => setSelectedWinner('diego')}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0"></div>
                <div
                  className={`aspect-[16/9] md:aspect-[4/5] w-full bg-cover bg-center bg-no-repeat transition-all duration-500 ${selectedWinner === 'diego' ? 'scale-105' : 'grayscale group-hover:grayscale-0'}`}
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXz43rglkDVCBukFJJAKRCMJEJVeBf4O23hqBF3Wt7qs4UQ9XKxG0Qh60vAzeT2Yk3fHuMLMBm_96c3k0z-gyX6G61y9Bh07cQzywCtfeZ850xj1FVOmg770Jbncu1x81wNe26ourvYQMEPdUCHzkAKAUT9vbY3h-YSLDv0zwnW52rnNdV8xXV2FxXAQ65NVI46I3zRS1Q727I1x2UInk5N705Pkld7HtQk93BrUguWhbsfFS9foH56xc27YxYaGAGqe7vGDwHFUEa')` }}
                ></div>
                <div className="absolute bottom-0 left-0 w-full p-4 z-10 flex flex-col items-center">
                  <span className="text-[10px] md:text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm mb-1 sm:mb-2">CHAMPION</span>
                  <h3 className="text-xl md:text-2xl font-bold text-white text-center leading-none uppercase">Diego <br className="hidden sm:block" /> Silva</h3>
                </div>
                {selectedWinner === 'diego' && (
                  <>
                    <div className="absolute inset-0 border-4 border-primary z-20 pointer-events-none opacity-100 shadow-[inset_0_0_30px_rgba(236,19,19,0.5)]"></div>
                    <div className="absolute top-4 right-4 z-20 bg-primary text-white rounded-full p-1 shadow-lg">
                      <span className="material-symbols-outlined text-lg block">check</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Selection Steps */}
            <div className="p-5 md:p-8 flex flex-col gap-8 bg-surface-dark relative">
              {/* Dashed Line Decoration (Desktop only) */}
              <div className="absolute left-8 top-0 bottom-0 w-px border-l border-dashed border-border-dark hidden md:block opacity-30"></div>

              {/* Step 1: Winner (Confirmed Visual) */}
              <div className="flex flex-col gap-4 relative md:pl-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-base md:text-lg font-bold uppercase flex items-center gap-2">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] text-white ${selectedWinner ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>1</span>
                    Quem vence?
                  </h4>
                  {selectedWinner && <span className="text-primary text-[10px] font-bold uppercase tracking-wider">Selecionado</span>}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setSelectedWinner('marcus')}
                    className={`relative overflow-hidden rounded-xl p-3 sm:p-4 border-2 transition-all shadow-lg group ${selectedWinner === 'marcus' ? 'bg-primary border-primary' : 'bg-surface-highlight border-transparent hover:border-border-dark'}`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <span className={`font-black uppercase text-sm sm:text-lg leading-none tracking-wide ${selectedWinner === 'marcus' ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>Marcus</span>
                      <span className={`${selectedWinner === 'marcus' ? 'text-white/80' : 'text-text-muted/60'} text-[9px] sm:text-xs font-medium uppercase truncate`}>"The Tank"</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedWinner('diego')}
                    className={`relative overflow-hidden rounded-xl p-3 sm:p-4 border-2 transition-all shadow-lg group ${selectedWinner === 'diego' ? 'bg-primary border-primary' : 'bg-surface-highlight border-transparent hover:border-border-dark'}`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <span className={`font-black uppercase text-sm sm:text-lg leading-none tracking-wide ${selectedWinner === 'diego' ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>Diego</span>
                      <span className={`${selectedWinner === 'diego' ? 'text-white/80' : 'text-text-muted/60'} text-[9px] sm:text-xs font-medium uppercase truncate`}>Silva</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Method */}
              <div className={`flex flex-col gap-4 relative md:pl-8 transition-opacity duration-300 ${!selectedWinner ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-lg font-bold uppercase flex items-center gap-2">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs text-white ${selectedMethod ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>2</span>
                    Como vence?
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedMethod('ko')}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 h-24 transition-all group ${selectedMethod === 'ko' ? 'bg-primary border-primary shadow-[0_0_15px_rgba(236,19,19,0.2)]' : 'bg-surface-highlight border-transparent hover:bg-primary/20 hover:border-primary'}`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${selectedMethod === 'ko' ? 'text-white' : 'text-text-muted group-hover:text-primary'}`}>sports_kabaddi</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${selectedMethod === 'ko' ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>KO / TKO</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('sub')}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 h-24 transition-all group ${selectedMethod === 'sub' ? 'bg-primary border-primary shadow-[0_0_15px_rgba(236,19,19,0.2)]' : 'bg-surface-highlight border-transparent hover:bg-primary/20 hover:border-primary'}`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${selectedMethod === 'sub' ? 'text-white' : 'text-text-muted group-hover:text-primary'}`}>settings_accessibility</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${selectedMethod === 'sub' ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>Finalização</span>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('dec')}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 h-24 transition-all group ${selectedMethod === 'dec' ? 'bg-primary border-primary shadow-[0_0_15px_rgba(236,19,19,0.2)]' : 'bg-surface-highlight border-transparent hover:bg-primary/20 hover:border-primary'}`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${selectedMethod === 'dec' ? 'text-white' : 'text-text-muted group-hover:text-primary'}`}>gavel</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${selectedMethod === 'dec' ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>Decisão</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Round */}
              <div className={`flex flex-col gap-4 relative md:pl-8 transition-opacity duration-300 ${!selectedMethod ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-base md:text-lg font-bold uppercase flex items-center gap-2">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] text-white ${selectedRound ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>3</span>
                    Em qual round?
                  </h4>
                  <span className="text-text-muted text-[10px] uppercase tracking-wider">Opcional</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((round) => (
                    <button
                      key={round}
                      onClick={() => setSelectedRound(round)}
                      className={`h-12 flex items-center justify-center rounded-xl border font-bold text-lg transition-all ${selectedRound === round ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(236,19,19,0.4)] transform scale-105' : 'bg-surface-highlight border-border-dark text-text-muted hover:border-primary hover:text-white'}`}
                    >
                      {round}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-6 md:border-t border-border-dark flex flex-col gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={!selectedWinner}
                  className={`w-full rounded-2xl py-5 text-white font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-neon ${selectedWinner ? 'bg-primary hover:bg-primary-hover active:scale-[0.98]' : 'bg-surface-highlight text-text-muted cursor-not-allowed grayscale'}`}
                >
                  <span>Confirmar Palpite</span>
                  <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </button>
                <p className="text-center text-[10px] text-text-muted uppercase tracking-tight">Ao confirmar, você concorda com as regras de pontuação.</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-4 text-center pb-8">
            <div className="bg-surface-dark border border-border-dark p-3 rounded-lg">
              <p className="text-text-muted text-xs uppercase mb-1">Total de Pontos Possíveis</p>
              <p className="text-white font-bold text-xl">150 PTS</p>
            </div>
            <div className="bg-surface-dark border border-border-dark p-3 rounded-lg">
              <p className="text-text-muted text-xs uppercase mb-1">Tempo Restante</p>
              <p className="text-primary font-bold text-xl flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">timer</span> 04:22
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Fight List */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4 sticky top-24">
          <Panel
            title="Card Completo"
            icon="view_list"
            className="h-auto max-h-[calc(100vh-8rem)]"
            headerAction={
              <span className="bg-surface-highlight text-text-muted text-xs font-bold px-2 py-1 rounded border border-border-dark">12/15</span>
            }
          >

            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2 fight-list-scroll custom-scrollbar">
              {/* Completed Fights */}
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="group flex items-center gap-3 p-2 rounded-lg bg-surface-highlight/30 border border-transparent hover:bg-surface-highlight/50 transition-colors">
                  <div className="text-green-500 flex items-center justify-center bg-green-500/10 rounded-full p-1">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center w-full">
                      <p className="text-[10px] text-text-muted font-bold uppercase">Luta {i + 1}</p>
                      <p className="text-xs text-white font-medium">Fighter A <span className="text-text-muted">vs</span> Fighter B</p>
                    </div>
                    <p className="text-[10px] text-primary/80 font-bold uppercase mt-0.5 tracking-wide">Fighter A • KO • R1</p>
                  </div>
                </div>
              ))}

              {/* Current Fight */}
              <div className="relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border-2 border-primary shadow-[0_0_20px_rgba(236,19,19,0.15)] my-2">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-full"></div>
                <div className="text-primary flex items-center justify-center bg-primary/20 rounded-full p-1.5 animate-pulse">
                  <span className="material-symbols-outlined text-xl">sports_mma</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-primary font-black uppercase tracking-wider">Luta 12 • Atual</p>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
                  </div>
                  <p className="text-sm text-white font-bold leading-tight">Marcus <span className="text-text-muted font-normal text-xs">vs</span> Diego</p>
                </div>
              </div>

              {/* Pending Fights */}
              <div className="group flex items-center gap-3 p-2 rounded-lg border border-border-dark/50 hover:bg-surface-highlight hover:border-border-dark transition-all">
                <div className="text-text-muted flex items-center justify-center bg-surface-highlight rounded-full p-1">
                  <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-text-muted font-bold uppercase">Luta 13</p>
                  <p className="text-xs text-text-muted group-hover:text-white font-medium transition-colors">Nunes <span className="text-text-muted/60">vs</span> Andrade</p>
                </div>
              </div>
              <div className="group flex items-center gap-3 p-2 rounded-lg border border-border-dark/50 hover:bg-surface-highlight hover:border-border-dark transition-all">
                <div className="text-text-muted flex items-center justify-center bg-surface-highlight rounded-full p-1">
                  <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-text-muted font-bold uppercase">Luta 14 • Co-Main</p>
                  <p className="text-xs text-text-muted group-hover:text-white font-medium transition-colors">Oliveira <span className="text-text-muted/60">vs</span> Makhachev</p>
                </div>
              </div>
              <div className="group flex items-center gap-3 p-2 rounded-lg border border-border-dark/50 hover:bg-surface-highlight hover:border-border-dark transition-all">
                <div className="text-text-muted flex items-center justify-center bg-surface-highlight rounded-full p-1">
                  <span className="material-symbols-outlined text-lg">radio_button_unchecked</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-text-muted font-bold uppercase">Luta 15 • Main Event</p>
                  <p className="text-xs text-text-muted group-hover:text-white font-medium transition-colors">Jones <span className="text-text-muted/60">vs</span> Miocic</p>
                </div>
              </div>
            </div>

            <div className="px-2 pt-4 flex justify-between text-[10px] text-text-muted font-medium uppercase tracking-wider border-t border-border-dark mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Feito</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Atual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-surface-highlight border border-text-muted"></span> Pendente</span>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default Picks;