import React from 'react';
import { Screen } from '../App';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section className="bg-card-dark rounded-sm border border-border-dark shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #ec1313 0%, transparent 20%)' }}></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="relative flex-shrink-0">
            <div className="bg-center bg-no-repeat bg-cover h-32 w-32 md:h-40 md:w-40 rounded-sm border border-primary shadow-[0_0_20px_rgba(236,19,19,0.2)]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAy_EapvkihGHiQdlGtKfFdNmiZx3VvFs-MHE_SVfJKDEptqqHTTRYAJLrxu1UxckjC5Neaz8Kuz_2VdZW_6aqRNLHhG0vIBlHi_p7THDHm95EB3y4qZvNtS_3huGZqCN7Im10UM13f9LibTNaxNHi0_tIjeMq3PYBIHtYFoY9EHvjWVas_5bWwgfKlAsIQ3kv94xnrvbHOQtvshYYZv3-RIroS0qL6B8_IzhS6eDm9lBhBSlSxG29v2ujioIKWgpOA7mer0_6c9XDp")' }}></div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-bold font-condensed px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-md">
              Pro Member
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-condensed uppercase leading-none tracking-tight text-white mb-1">Campeão do Octógono</h1>
                <p className="text-text-secondary text-base font-medium font-mono mb-3">@usuario_mma</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 bg-border-dark px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider text-white border border-white/5">
                    <span className="material-symbols-outlined !text-sm text-primary">verified</span> Verificado
                  </span>
                  <span className="inline-flex items-center gap-1 bg-border-dark px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider text-white border border-white/5">
                    <span className="material-symbols-outlined !text-sm text-text-secondary">calendar_month</span> Desde 2023
                  </span>
                  <span className="inline-flex items-center gap-1 bg-border-dark px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider text-white border border-white/5">
                    <span className="material-symbols-outlined !text-sm text-text-secondary">group</span> Team Alpha
                  </span>
                </div>
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <button
                  onClick={() => onNavigate('story')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white transition-all rounded-sm h-12 px-8 font-bold font-condensed uppercase tracking-wider text-base shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined !text-[20px]">share</span>
                  Compartilhar Resultado
                </button>
                <button
                  onClick={() => onNavigate('admin')}
                  className="mt-2 md:mt-0 md:ml-4 w-full md:w-auto flex items-center justify-center gap-2 bg-surface-dark hover:bg-surface-highlight text-text-secondary hover:text-white transition-all rounded-sm h-12 px-6 font-bold font-condensed uppercase tracking-wider text-sm border border-white/10"
                >
                  <span className="material-symbols-outlined !text-[20px]">admin_panel_settings</span>
                  Admin
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 border-t border-border-dark pt-6 w-full md:max-w-lg">
              <div>
                <span className="block text-xs text-text-secondary uppercase tracking-widest font-bold">Vitórias</span>
                <span className="block text-xl font-bold font-condensed text-white">245</span>
              </div>
              <div>
                <span className="block text-xs text-text-secondary uppercase tracking-widest font-bold">Precisão</span>
                <span className="block text-xl font-bold font-condensed text-white">68%</span>
              </div>
              <div>
                <span className="block text-xs text-text-secondary uppercase tracking-widest font-bold">Ligas</span>
                <span className="block text-xl font-bold font-condensed text-white">4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card-dark rounded-sm p-6 border border-border-dark relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined !text-8xl">trophy</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary !text-lg">equalizer</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Pontos Totais</h3>
              </div>
              <p className="text-6xl font-bold font-condensed text-white tracking-tight">12,450</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded text-green-500 text-xs font-bold uppercase tracking-wide border border-green-500/20">
                <span className="material-symbols-outlined !text-sm">trending_up</span>
                +125 ESTA SEMANA
              </div>
            </div>
          </div>
          <div className="bg-card-dark rounded-sm p-6 border border-border-dark relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined !text-8xl">leaderboard</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary !text-lg">public</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Ranking Atual</h3>
              </div>
              <p className="text-6xl font-bold font-condensed text-white tracking-tight">#42</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded text-green-500 text-xs font-bold uppercase tracking-wide border border-green-500/20">
                <span className="material-symbols-outlined !text-sm">arrow_upward</span>
                TOP 1% GLOBAL
              </div>
            </div>
          </div>
          <div className="bg-card-dark rounded-sm p-6 border border-border-dark relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined !text-8xl">stars</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary !text-lg">military_tech</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Melhor Rodada</h3>
              </div>
              <p className="text-6xl font-bold font-condensed text-white tracking-tight">UFC 299</p>
              <div className="mt-2 inline-flex items-center gap-1 bg-border-dark px-2 py-0.5 rounded text-text-secondary text-xs font-bold uppercase tracking-wide border border-white/5">
                <span className="material-symbols-outlined !text-sm">check</span>
                1.250 PTS OBTIDOS
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-card-dark rounded-sm border border-border-dark p-6">
          <div className="flex items-center justify-between mb-6 border-b border-border-dark pb-4">
            <h2 className="text-lg font-bold font-condensed uppercase tracking-wide text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-primary block"></span>
              Análise de Precisão
            </h2>
            <button className="text-xs text-text-secondary hover:text-white uppercase font-bold tracking-widest transition-colors">Ver Detalhes</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border-dark">
            {/* Donut Chart 1 */}
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-[100px] h-[100px] rounded-full" style={{ background: 'conic-gradient(#ec1313 68%, transparent 0)', mask: 'radial-gradient(farthest-side, transparent 80%, black 0)', WebkitMask: 'radial-gradient(farthest-side, transparent 80%, black 0)' }}></div>
                <div className="absolute bg-card-dark w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center border border-border-dark">
                  <span className="text-2xl font-bold font-condensed text-white">68%</span>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold uppercase font-condensed text-white mb-1">Vencedor</h4>
                <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Taxa de Acerto</p>
              </div>
            </div>
            {/* Donut Chart 2 */}
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-[100px] h-[100px] rounded-full" style={{ background: 'conic-gradient(#ec1313 45%, transparent 0)', mask: 'radial-gradient(farthest-side, transparent 80%, black 0)', WebkitMask: 'radial-gradient(farthest-side, transparent 80%, black 0)' }}></div>
                <div className="absolute bg-card-dark w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center border border-border-dark">
                  <span className="text-2xl font-bold font-condensed text-white">45%</span>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold uppercase font-condensed text-white mb-1">Método</h4>
                <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">KO / SUB / DEC</p>
              </div>
            </div>
            {/* Donut Chart 3 */}
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-[100px] h-[100px] rounded-full" style={{ background: 'conic-gradient(#ec1313 30%, transparent 0)', mask: 'radial-gradient(farthest-side, transparent 80%, black 0)', WebkitMask: 'radial-gradient(farthest-side, transparent 80%, black 0)' }}></div>
                <div className="absolute bg-card-dark w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center border border-border-dark">
                  <span className="text-2xl font-bold font-condensed text-white">30%</span>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold uppercase font-condensed text-white mb-1">Round</h4>
                <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Precisão Exata</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="bg-card-dark rounded-sm border border-border-dark overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-dark bg-[#181a1e]">
            <h2 className="text-lg font-bold font-condensed uppercase tracking-wide text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-primary block"></span>
              Histórico de Eventos
            </h2>
            <button className="text-xs text-primary font-bold uppercase hover:text-white transition-colors tracking-widest flex items-center gap-1">
              Ver Todos <span className="material-symbols-outlined !text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#14161a] text-text-secondary text-[10px] uppercase tracking-widest border-b border-border-dark font-bold font-mono">
                  <th className="p-4 w-1/2">Evento / Data</th>
                  <th className="p-4 text-center">Pontos</th>
                  <th className="p-4 text-center">Rank</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                <tr className="group hover:bg-[#23262b] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-center bg-cover rounded-sm border border-border-dark shrink-0" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCpaPiYS1YVPFN4gMAiRTlC7S70k9sfeQk5UliIBnCVe3QIqn-fewjK6cgywTWZB746d3avd1att1hmX61qxWZCg0SVgnjh4BhiwFasvykcfsnxEVTjqg26SSirxmW8W5ho5x4IUIOcX1cq8a03M0fSGzp6WIDZp0scJXUOhjRkt-jxqSRbzQO3iDAB-LvvYXUMsyppubEAAYwmSAuuMJAvEwuYezfIjrbC7mbe_wzGZVhRhQbBZNFRQXwn4_dyHY3S1YSqAoYSfny2")' }}></div>
                      <div>
                        <p className="font-bold font-condensed text-lg text-white group-hover:text-primary transition-colors leading-tight">UFC 300: Pereira vs Hill</p>
                        <p className="text-[11px] text-text-secondary font-mono mt-1 uppercase tracking-wider">13 Abr, 2024</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold font-condensed text-2xl text-white block">850</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium text-sm text-text-secondary font-mono">#120</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-block px-2 py-1 bg-green-900/20 text-green-500 text-[10px] font-bold border border-green-900/30 rounded-sm uppercase tracking-wide">Finalizado</span>
                  </td>
                </tr>
                {/* Additional rows would go here */}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;