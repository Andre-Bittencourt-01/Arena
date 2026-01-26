import React from 'react';

const Ranking: React.FC = () => {
  return (
    <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8 font-grotesk">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-primary"></span>
            <span className="font-mono text-xs text-primary tracking-widest uppercase">Estatísticas Competitivas</span>
          </div>
          <h2 className="font-condensed text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none text-white">Ranking Global</h2>
        </div>
        <div className="flex bg-card-dark border border-white/10 p-1 rounded-none">
          <button className="px-6 py-2 bg-primary text-white font-condensed text-sm uppercase font-bold tracking-wide skew-x-[-10deg] mx-1">
            <span className="skew-x-[10deg] block">Semana</span>
          </button>
          <button className="px-6 py-2 text-white/50 hover:text-white font-condensed text-sm uppercase font-medium tracking-wide mx-1 transition-colors">
            Mês
          </button>
          <button className="px-6 py-2 text-white/50 hover:text-white font-condensed text-sm uppercase font-medium tracking-wide mx-1 transition-colors">
            Ano
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-condensed text-lg text-white/80 uppercase tracking-widest mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">emoji_events</span> Pódio da Temporada
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
        {/* Silver */}
        <div className="order-2 md:order-1 bg-card-dark border border-white/10 relative group hover:border-silver/50 transition-all duration-300 clip-corner">
          <div className="absolute top-0 left-0 w-full h-1 bg-silver"></div>
          <div className="p-6 flex flex-col items-center">
            <div className="text-silver font-condensed text-6xl font-bold opacity-20 absolute top-4 right-4 z-0">02</div>
            <div className="relative z-10 mb-4">
              <div className="size-48 overflow-hidden border-2 border-silver/30" style={{clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)'}}>
                <img alt="2nd Place" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBInBE5YGyqCiFmJNyIcz_zBN-Cad1k6Ga6POSxZXVbXJEC06m8koomRjlfc9eyqu0pj9CougpO7trbOQEismTQE3IO0W7SI1Noe_smbCUwt-w7-F7p9rYW__RVm9GpASiGyuuGzMoWuuN9WIXequzVaCeRLMxOTdzdBoXoLIYJd6BDy0HHhZXCQdJqMyo162k3B5S4UC5MNDnD6tcAYYOIfe4NrLVcuaDizvmelKaKJCcJLaxIkizhJtygFF9cZMBQv07gpNgw2XiR" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-silver text-black font-condensed text-xs font-bold px-3 py-1 uppercase tracking-wider skew-x-[-10deg]">
                <span className="skew-x-[10deg] block">Silver</span>
              </div>
            </div>
            <div className="text-center z-10 mt-2">
              <h4 className="font-condensed text-xl uppercase tracking-wide text-white">@borrachinha</h4>
              <div className="font-mono text-xs text-white/50 mb-3">Middleweight Fanatic</div>
              <div className="flex items-center justify-center gap-4 border-t border-white/10 pt-3 w-full">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Pontos</div>
                  <div className="font-display text-3xl text-silver font-bold">2.300</div>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Trend</div>
                  <div className="font-mono text-sm text-green-500 flex items-center">
                    <span className="material-symbols-outlined text-base">trending_up</span> +1
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gold */}
        <div className="order-1 md:order-2 bg-card-dark border border-gold/30 relative group hover:border-gold transition-all duration-300 transform md:-translate-y-6 shadow-[0_0_30px_rgba(255,215,0,0.1)] clip-corner">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
          <div className="p-8 flex flex-col items-center">
            <div className="text-gold font-condensed text-7xl font-bold opacity-20 absolute top-4 right-4 z-0">01</div>
            <div className="absolute top-4 left-4 text-gold animate-pulse">
              <span className="material-symbols-outlined">crown</span>
            </div>
            <div className="relative z-10 mb-6">
              <div className="size-64 overflow-hidden border-2 border-gold/50" style={{clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)'}}>
                <img alt="1st Place" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHMhj8lOZQwi_1nMY5eA05-JnrZ9oKLtc4dCr9fqnsx3ktsKhELlBuseSRMKX9svP8pMuyYHOJ5OSJ5_nAe7Vt6qTqgWiam3WTWk_W4aG8KrHSlYcUgMEk4JTd1gNVy5eAlMGx8rKh3smBZUH_ni4BgGmHdYD3otZjyZ1fPLtz_n8kC_viO3HLQkuCnqNdfo73nGN4-g5VdwAcu931f4WOXCCSulIYEaZu-xWXxRKGe6R-McnPshbjwn4bYhFt3GO63wxtLostEX2F" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gold text-black font-condensed text-sm font-bold px-4 py-1 uppercase tracking-wider skew-x-[-10deg] shadow-lg shadow-gold/20">
                <span className="skew-x-[10deg] block">Champion</span>
              </div>
            </div>
            <div className="text-center z-10 mt-2 w-full">
              <h4 className="font-condensed text-2xl uppercase tracking-wide text-white">@spider_silva</h4>
              <div className="font-mono text-xs text-gold mb-4">The Goat Predictor</div>
              <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4 w-full">
                <div className="text-center">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Acertos</div>
                  <div className="font-display font-bold text-xl text-white">94%</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Pontos</div>
                  <div className="font-display font-bold text-4xl text-gold leading-none">2.450</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Streak</div>
                  <div className="font-display font-bold text-xl text-white">12W</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bronze */}
        <div className="order-3 md:order-3 bg-card-dark border border-white/10 relative group hover:border-bronze/50 transition-all duration-300 clip-corner">
          <div className="absolute top-0 left-0 w-full h-1 bg-bronze"></div>
          <div className="p-6 flex flex-col items-center">
            <div className="text-bronze font-condensed text-6xl font-bold opacity-20 absolute top-4 right-4 z-0">03</div>
            <div className="relative z-10 mb-4">
              <div className="size-48 overflow-hidden border-2 border-bronze/30" style={{clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)'}}>
                <img alt="3rd Place" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnAZvZuVu2tLursjGDHDDRoPM0tdUm0LAXW_DCieAq0LumPDN6kjC7FKWfWNfcQMyGVXIttGdc9JF36qihYyXqJZutKPDkM5IAaHne05qF0FeGYaQCdsZzkvS2JLAdM1wJI_4oqlffrJn7kKB5oOUAsQLKwXUQTRQNPBd0fNvRaDtYgk_Lv9tyMc1rDwMYNTEEX9EUU97qfN0KZCEIOuV0Q3UqEI4HIhfEWqjDpZRyDkZIF4nJ-5O_m25cWBYYY9lALIeoGpP1N_JD" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-bronze text-white font-condensed text-xs font-bold px-3 py-1 uppercase tracking-wider skew-x-[-10deg]">
                <span className="skew-x-[10deg] block">Bronze</span>
              </div>
            </div>
            <div className="text-center z-10 mt-2">
              <h4 className="font-condensed text-xl uppercase tracking-wide text-white">@poatan_alex</h4>
              <div className="font-mono text-xs text-white/50 mb-3">Left Hook Expert</div>
              <div className="flex items-center justify-center gap-4 border-t border-white/10 pt-3 w-full">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Pontos</div>
                  <div className="font-display font-bold text-3xl text-bronze">2.150</div>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Trend</div>
                  <div className="font-mono text-sm text-red-500 flex items-center">
                    <span className="material-symbols-outlined text-base">trending_down</span> -2
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-condensed text-lg text-white/80 uppercase tracking-widest flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">format_list_numbered</span> Classificação Geral
        </h3>
        <div className="flex gap-2">
          <span className="size-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-xs font-mono text-white/50 uppercase">Live Updates</span>
        </div>
      </div>

      <div className="flex flex-col border border-white/10 bg-card-dark">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-[#121212] text-xs font-mono text-white/40 uppercase tracking-wider">
          <div className="col-span-1 text-center">Pos</div>
          <div className="col-span-1">Avatar</div>
          <div className="col-span-5">Competidor</div>
          <div className="col-span-3 text-right">Pontuação Total</div>
          <div className="col-span-2 text-center">Desempenho</div>
        </div>
        
        {/* List items would be generated by a loop in a real app */}
        <div className="group grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
          <div className="col-span-2 md:col-span-1 text-center font-condensed text-xl text-white/60 group-hover:text-white">04</div>
          <div className="col-span-2 md:col-span-1 flex justify-center md:justify-start">
            <div className="size-20 bg-zinc-800" style={{clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)'}}>
              <img alt="User 4" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYlrolDFu4ypcL8-0eew1BLFKn_mlavkfrPvCXyGnEdHqlYebD9Ms0QWa4I1j1pH7wOd32TW6Cc2yjQL5tJe2_CDXuFbktS-LccqI-mwG3Y5Po-09P6dSVRVH5kRDneYBNWn2wAE6d7P5s5hcUJNvUyJe0rmo-YKk8-0VUwlKuknjqf_Jv1rQxUA5yi6af8AX1jOLVwv1HOxR2KgfGEDbz0M7MaSdpX_WncDn0rpBd7AONWK1SVwQapYNYn8cAoKozwHlarm3Jf2lX" />
            </div>
          </div>
          <div className="col-span-5 md:col-span-5 flex flex-col justify-center">
            <span className="font-condensed font-medium uppercase tracking-wide text-white">@charles_dobronxs</span>
            <span className="text-xs text-white/30 font-mono hidden md:block">ID: #882910</span>
          </div>
          <div className="col-span-3 md:col-span-3 text-right">
            <span className="font-display text-2xl font-bold text-white tracking-wider">2.080</span>
            <span className="text-[10px] text-white/30 uppercase block -mt-1">PTS</span>
          </div>
          <div className="col-span-12 md:col-span-2 flex justify-end md:justify-center">
            <div className="flex items-center gap-1 text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-xs font-mono">
              <span className="material-symbols-outlined text-sm">arrow_upward</span> 3
            </div>
          </div>
        </div>

        {/* More items would go here... */}
        
        {/* User's row */}
        <div className="relative grid grid-cols-12 gap-4 px-6 py-4 border-l-4 border-primary bg-primary/5 items-center shadow-[inset_0_0_20px_rgba(236,19,19,0.1)]">
          <div className="absolute right-0 top-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-bl-sm">Você</div>
          <div className="col-span-2 md:col-span-1 text-center font-condensed text-xl text-primary font-bold">42</div>
          <div className="col-span-2 md:col-span-1 flex justify-center md:justify-start">
            <div className="size-20 bg-zinc-800 ring-2 ring-primary ring-offset-2 ring-offset-[#1E1E1E]" style={{clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)'}}>
              <img alt="Current User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdv6fnH2aUkUnStYycJnEKhaBICr74VmX4NnJNWQeAiTlNYjfRaYYdIaoUwqoIEjja3cV-obJrnb8Gr2KiHkzQz-DeJP1i1-21wlLJCmCXKcRBgb6F2m-uUznPWRZzMhZNCqAZa6eSt2I623-0Z_DFPK5NPmKdViNtogczjn5ZtJ-ArZKYBj2bztA5emkHyNyEy2LqUPyIDFtazLxIRtXY1YTN904jPv1NkVDpSRAx_bnPSnUrqaadV4tkE7fo8AizW2OjfaNetD1y" />
            </div>
          </div>
          <div className="col-span-5 md:col-span-5 flex flex-col justify-center">
            <span className="font-condensed font-bold uppercase tracking-wide text-white">@voce_lutador</span>
            <span className="text-xs text-primary/70 font-mono hidden md:block">ID: #ME4242</span>
          </div>
          <div className="col-span-3 md:col-span-3 text-right">
            <span className="font-display font-bold text-2xl text-primary tracking-wider">1.250</span>
            <span className="text-[10px] text-primary/50 uppercase block -mt-1">PTS</span>
          </div>
          <div className="col-span-12 md:col-span-2 flex justify-end md:justify-center">
            <div className="flex items-center gap-1 text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-xs font-mono">
              <span className="material-symbols-outlined text-sm">arrow_downward</span> 5
            </div>
          </div>
        </div>

        <div className="p-4 text-center text-white/20 text-xs font-mono border-t border-white/5 uppercase tracking-widest">
          ... Carregando mais resultados ...
        </div>
      </div>
      <div className="h-24"></div>
    </div>
  );
};

export default Ranking;