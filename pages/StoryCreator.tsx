import React from 'react';

const StoryCreator: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden min-h-[calc(100vh-64px)]">
      <aside className="w-full lg:w-80 bg-[#181111] border-r border-[#392828] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div>
            <h1 className="text-white text-lg font-bold">Story Creator</h1>
            <p className="text-[#b99d9d] text-sm">Personalize seus resultados para redes sociais</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#392828] border border-primary/30 cursor-pointer">
              <span className="material-symbols-outlined text-primary">auto_fix_high</span>
              <p className="text-white text-sm font-medium">Layout Dinâmico</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-white/70">palette</span>
              <p className="text-white text-sm font-medium">Editar Cores</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-white/70">text_fields</span>
              <p className="text-white text-sm font-medium">Fontes</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-white/70">verified</span>
              <p className="text-white text-sm font-medium">Branding</p>
            </div>
          </div>
          <div className="pt-6 border-t border-[#392828]">
            <p className="text-xs uppercase font-bold text-gray-500 mb-4 tracking-widest">Opções de Exportação</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-[#392828] p-3 rounded-lg flex flex-col items-center gap-1 hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined">image</span>
                <span className="text-[10px] font-bold">PNG</span>
              </button>
              <button className="bg-[#392828] p-3 rounded-lg flex flex-col items-center gap-1 hover:bg-primary/20 transition-colors border border-primary">
                <span className="material-symbols-outlined text-primary">share</span>
                <span className="text-[10px] font-bold">INSTAGRAM</span>
              </button>
            </div>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-6">
          <p className="text-xs text-primary font-bold mb-1">PRO TIP</p>
          <p className="text-[11px] text-[#b99d9d]">Cards com brilho dourado indicam acerto de vencedor, round e método!</p>
        </div>
      </aside>

      <section className="flex-1 bg-black/40 p-8 flex flex-col items-center overflow-y-auto">
        <h2 className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] mb-6">Preview do Story (9:16)</h2>
        
        {/* Instagram Story Canvas */}
        <div className="story-aspect-ratio w-full max-w-[420px] bg-background-dark shadow-2xl rounded-xl relative overflow-hidden flex flex-col border border-white/10 select-none bg-[#181111]">
          {/* Background Grain/Noise Overlay */}
          <div className="absolute inset-0 bg-cover opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAPIjwJCqt9iYlkHDzlFSLoMT6anude_L1kKgn4oDr7iIOtG5gKtGj7xxfyWxhPvr9qy79ArLxbGwCrlI8suCeMsytelXQ8GEMUaSPZ42haox5MoAgnspx1Hf5rC6TltYFkSpj6mVZaOshsNZlnZRmtFCtxv6SbAkKGBZRT8YaC1UzAe0w5rdA85eK4SH3DgPkwrGmIKU6imj-0ZwygWipJuUpQ5OfrgQqzIRnDNPbay3CFwMeE6QrJtyWW0SVwMMuH62Uhyirs1QcX")' }}></div>
          
          {/* TOP SECTION: Event Banner */}
          <div className="relative h-48 flex flex-col justify-end p-6 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg, #181111 0%, rgba(24, 17, 17, 0) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAR4T9rPX7TddUgozw5R6AuSA7GXOLx0ky13fODfAo_DzDIwXh0Wv0pn6DKowGbeW26GjX3wFURcXf_gebjHUC-ZpyE-smMbVPpP435IY2dXmCEGwmQb2eOT7c2YKT04lmAeWANgCtO8SytId_go16QxIkXB5eL5lUfXwxnT7mHzBU6rl0Tfbhw2a1Q6Yn3lTP3gnD8aVg-xhIfHgxSgi8Ax9dtwTXhaxg5P3X0mnu9ZB-e4t4C1G-PQk8U_7gZjoUlR5eX6LY8xL2r')` }}>
            <div className="absolute top-4 left-4">
              <span className="bg-primary px-3 py-1 text-[10px] font-black italic tracking-wider rounded-sm text-white">RESULTADOS FINAIS</span>
            </div>
            <h3 className="text-white text-2xl font-black italic tracking-tight leading-none uppercase drop-shadow-md">UFC 300:<br/>Pereira vs Hill</h3>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-primary text-5xl font-black italic leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">345</span>
              <span className="text-white text-sm font-bold pb-1 uppercase tracking-tight">Pontos totais</span>
            </div>
          </div>

          {/* MIDDLE SECTION: Fight Grid */}
          <div className="flex-1 p-3 grid grid-cols-3 grid-rows-5 gap-2 bg-[#181111]/90">
            {/* Valid Card Example */}
            <div className="relative rounded overflow-hidden shadow-[0_0_15px_rgba(255,215,0,0.4)] border border-[rgba(255,215,0,0.8)] bg-[#2a1a1a]">
              <div className="flex h-full">
                <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9q2wx9lQss71R7IDpNj-rIO0hzS36sBd8G3jPcxixVO0GDYENQ9VZlBexkJ26h7PLj-fZKhCtgQ_WKGOdhRozo-XGF4ZcO3Jo7sSku14X4x0_ayVpO4GYmBA5Z7HswEEQWyOC27RdU0iVR1f2yuQbOPy6W9IxZGl2bk5uKdsTsqkc5fc2yYjsX8y4_VzeQIOMM5k359MsLAmRxKkoMLAx4y89wmqp46xRmbMy-vVqlhd4zaZAaB8Vd839qY9BFdZUJBAr0gI77mSh")' }}></div>
                <div className="w-1/2 bg-cover bg-center grayscale" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_EkAqfuwKixSAzd8TShdyz1Ph5YCsYiYlcUtcVyUJuqEPdbkb3J_RQ4bsUYseKgun0KiHDVYaPZ2I504q22DzfUQ5eh3zktj2tCQxiQIZG1qkrWVoL_cipIUVZ5U1TjSuB5KO6gHauiIpmj55anbjVGax9DFgI2ymcOgxXDRQv-G0ROUDw9CwuzRtN4iv-SXOIm3pLbC_0NDB-vyXGImtKwwpO3gkIIDqKM7PY6wNM1Wg3vRqGQM2rx9_Jse4FN5-e5imDbIGVBgE")' }}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0bda0b] text-3xl font-bold drop-shadow-md">check_circle</span>
              </div>
              <div className="absolute bottom-0 right-0 bg-yellow-500 text-black text-[6px] font-black px-1">100%</div>
            </div>

            {/* Error Card Example */}
            <div className="relative rounded overflow-hidden bg-[#221010] border border-white/5">
              <div className="flex h-full">
                <div className="w-1/2 bg-cover bg-center grayscale" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDoG-xVP4C78-L7UD2i9Z2FQwNZ_Ed3j9E-2vmieT-_RX8Daekhx9jQYmGIwnRZXlSXSXyn7WdU__oizjVb5jRbXPjhT-4Xp1HAzoFF4u_Bd-3uAZxNQi7C_BDmmPzt10lKmmhGCQ8Lyr0PkzavuUoNRw828tdi3wPIsjIYgoUboMtfj3_QgnJVKOlyYyEJsDJWRxLgViPzQv2R_A1oqVf4rNmvxdupt5G7CtzuWamyoa4whEhOM3oPBUSjrztFp5hRD5LOC9-X0lAX")' }}></div>
                <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiJUSjMuvO83sh5eAfjXwMbsu_LDc4tuXbLj5lYn4tUJwmq4RISnMM2cX5f1vgPN6QaNk2el2gvXMP66zi9PAO8vyDVR24XNRpPBBuD1KRE2eioYCHyhYIagru7eCr-jdROP1BVyflbTZ8Uxp3ZsawHHXp7hxV1Nm_C8Un2dwf4uwICYtklp0VVWUG1gAowR4l_eBeAFiRlVi2OXMZl6Gy09WbpYKoQ1aI9G_CPCOJbPF73dtDpjHs6_GTrBn5v8P8i4R2uf7xxzDv")' }}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl font-bold drop-shadow-md">cancel</span>
              </div>
            </div>

            {/* Simulated Grid Items */}
            {Array.from({ length: 13 }).map((_, i) => (
               <div key={i} className={`relative rounded bg-[#221010] border border-white/5 flex items-center justify-center ${i % 3 === 0 ? 'border-[rgba(255,215,0,0.5)]' : ''}`}>
                 <span className={`material-symbols-outlined text-3xl font-bold drop-shadow-md ${i % 4 === 0 ? 'text-primary' : 'text-[#0bda0b]'}`}>
                   {i % 4 === 0 ? 'cancel' : 'check_circle'}
                 </span>
               </div>
            ))}
          </div>

          {/* BOTTOM SECTION: Branding & Ranking */}
          <div className="p-6 bg-gradient-to-t from-black to-transparent flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="size-4 text-primary">
                  <span className="material-symbols-outlined text-base">sports_mma</span>
                </div>
                <h4 className="text-white text-sm font-black italic tracking-tighter">ARENA MMA</h4>
              </div>
              <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">O Caminho do Cinturão</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">POSIÇÃO</p>
              <div className="bg-primary px-3 py-1 rounded shadow-neon-sm">
                <span className="text-white text-lg font-black italic">#42 GLOBAL</span>
              </div>
              <p className="text-[9px] text-[#0bda0b] font-bold mt-1 tracking-tight">TOP 1% DO EVENTO</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoryCreator;