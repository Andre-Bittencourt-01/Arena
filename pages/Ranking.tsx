import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Ranking: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    leaderboard,
    rankingFilter,
    setRankingFilter,
    events,
    selectedPeriodId,
    setSelectedPeriodId
  } = useData();

  const [selectedEventId, setSelectedEventIdState] = React.useState<string | null>(null);

  // Sync with context
  React.useEffect(() => {
    if (selectedPeriodId) setSelectedEventIdState(selectedPeriodId);
  }, [selectedPeriodId]);

  // Auto-select default period when filter changes or on load
  React.useEffect(() => {
    if (selectedPeriodId) return;

    if (rankingFilter === 'week' && events.length > 0) {
      // Last completed event chronologically
      const sortedEvents = [...events]
        .filter(e => e.status === 'completed')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const lastEvent = sortedEvents[sortedEvents.length - 1];
      if (lastEvent) setSelectedPeriodId(lastEvent.id);
    } else if (rankingFilter === 'month') {
      // Current Month
      const now = new Date();
      const currentMonthId = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      setSelectedPeriodId(currentMonthId);
    } else if (rankingFilter === 'year') {
      // Current Year
      const currentYear = new Date().getFullYear().toString();
      setSelectedPeriodId(currentYear);
    }
  }, [rankingFilter, selectedPeriodId, events, setSelectedPeriodId]);

  const handlePeriodSelect = (id: string | null) => {
    setSelectedPeriodId(id);
    setSelectedEventIdState(id);
  };

  // Helper for Stepper Navigation
  const getStepperData = () => {
    let list: { id: string, label: string, sub?: string }[] = [];

    if (rankingFilter === 'week') {
      // Completed events, sorted by Date ASCENDING (Oldest -> Newest)
      list = events.filter(e => e.status === 'completed')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(e => ({ id: e.id, label: e.title, sub: e.subtitle }));
    } else if (rankingFilter === 'month') {
      list = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"]
        .map((label, i) => ({
          id: `2026-${(i + 1).toString().padStart(2, '0')}`,
          label,
          sub: '2026'
        }));
    } else {
      // Years sorted Ascending
      list = [{ id: '2025', label: '2025', sub: 'Temporada' }, { id: '2026', label: '2026', sub: 'Temporada' }];
    }

    // Current Index
    // Default to the LAST item (Newest/Current) if nothing selected
    const currentId = selectedPeriodId || list[list.length - 1]?.id;
    const currentIndex = list.findIndex(i => i.id === currentId);

    // Navigation: 
    // Left Arrow (Prev) -> Index - 1 (Older)
    // Right Arrow (Next) -> Index + 1 (Newer)

    const prevItem = currentIndex > 0 ? list[currentIndex - 1] : null;
    const nextItem = currentIndex < list.length - 1 ? list[currentIndex + 1] : null;
    const currentItem = list[currentIndex] || list[list.length - 1];

    return { prevItem, nextItem, currentItem, fullList: list };
  };

  const { prevItem, nextItem, currentItem, fullList } = getStepperData();

  // SWIPE GESTURE LOGIC
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && nextItem) {
      handlePeriodSelect(nextItem.id);
    } else if (isRightSwipe && prevItem) {
      handlePeriodSelect(prevItem.id);
    }

    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // FULL SELECTION MODAL
  const [showFullSelector, setShowFullSelector] = React.useState(false);



  // Top 3 for Podium
  const top3 = leaderboard.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  // Current user's rank and data
  const currentUserIndex = leaderboard.findIndex(u => u.id === currentUser?.id);
  // Use fallback to currentUser if not in leaderboard, ensuring the row always renders
  const currentUserData = currentUserIndex !== -1 ? leaderboard[currentUserIndex] : currentUser;

  // Get the points based on current filter for display in podium
  const getFilteredPoints = (user: any) => {
    if (!user) return 0;
    switch (rankingFilter) {
      case 'week': return user.points || 0;
      case 'month': return user.monthlyPoints || 0;
      case 'year': return user.yearlyPoints || 0;
      default: return user.points || 0;
    }
  };

  const periodLabel = {
    'week': 'Último Evento',
    'month': 'Performance Mensal',
    'year': 'Performance Anual',
    'all': 'Ranking Geral'
  }[rankingFilter as string || 'all'] || 'Ranking';

  const renderPerformance = (user: any, context: 'podium' | 'table' = 'podium') => {
    if (rankingFilter === 'week') return null;

    const delta = rankingFilter === 'month' ? user.monthlyRankDelta : user.yearlyRankDelta;

    // Sizing config based on context
    const isTable = context === 'table';
    const circleSize = isTable ? "size-[26px] sm:size-12" : "size-5 sm:size-10"; // Table: ~25% larger (20px -> 26px)
    const iconSize = isTable ? "text-[15px] sm:text-2xl" : "text-[12px] sm:text-lg"; // Table: Larger icon
    const textSize = isTable ? "text-[15px] sm:text-2xl" : "text-[12px] sm:text-xl"; // Table: Larger text

    if (delta === undefined) return (
      <div className={`flex items-center gap-0.5 text-white/20 font-mono tracking-tighter ${isTable ? 'text-[10px]' : 'text-[9px]'}`}>
        <span className={`material-symbols-outlined ${isTable ? 'text-[14px]' : 'text-[12px]'}`}>horizontal_rule</span>
        <span>NOVO</span>
      </div>
    );

    if (delta > 0) {
      return (
        <div className="flex items-center gap-1 text-green-400 group-hover:text-green-300 transition-colors">
          <div className={`${circleSize} rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20`}>
            <span className={`material-symbols-outlined ${iconSize} font-bold`}>trending_up</span>
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className={`font-display font-black ${textSize}`}>+{delta}</span>
          </div>
        </div>
      );
    } else if (delta < 0) {
      return (
        <div className="flex items-center gap-1 text-red-500 group-hover:text-red-400 transition-colors">
          <div className={`${circleSize} rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20`}>
            <span className={`material-symbols-outlined ${iconSize} font-bold`}>trending_down</span>
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className={`font-display font-black ${textSize}`}>{delta}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-white/20 transition-colors">
          <div className={`${circleSize} rounded-full bg-white/5 flex items-center justify-center border border-white/10`}>
            <span className={`material-symbols-outlined ${iconSize}`}>drag_handle</span>
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className={`font-display font-black ${textSize}`}>--</span>
          </div>
        </div>
      );
    }
  };

  const renderUserRow = (user: any, index: number, isHighlight: boolean = false) => {
    // If index is -1 (not in leaderboard), show "-" or special rank
    const rank = index === -1 ? '---' : (index + 1).toString().padStart(2, '0');
    const isCurrentUser = currentUser && user?.id === currentUser.id;
    const displayPoints = getFilteredPoints(user);

    if (!user) return null;

    return (
      <div
        key={`${isHighlight ? 'highlight-' : ''}${user.id}`}
        className={`group grid grid-cols-12 gap-0 px-2 sm:px-8 py-0 h-[50px] sm:h-16 transition-all duration-300 relative overflow-hidden items-center ${isHighlight ? 'bg-zinc-900 border-2 border-primary/40 rounded-xl mb-2 sm:mb-4 shadow-[0_0_40px_rgba(236,19,19,0.15)] ring-1 ring-white/5 mx-0 sm:mx-0' : (isCurrentUser ? 'bg-primary/5' : 'hover:bg-white/[0.04]')}`}
      >
        {isCurrentUser && !isHighlight && <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-primary shadow-[0_0_20px_rgba(236,19,19,0.5)]"></div>}

        {/* Rank Column */}
        <div className="col-span-2 sm:col-span-1 flex justify-center">
          <div className={`font-display text-xl sm:text-3xl font-black italic tracking-tighter transition-all ${isHighlight || isCurrentUser ? 'text-primary scale-110 drop-shadow-[0_0_10px_rgba(236,19,19,0.2)]' : 'text-white/90 group-hover:text-primary group-hover:scale-105'}`}>
            {rank}
          </div>
        </div>

        <div className="flex col-span-2 sm:col-span-3 justify-center sm:border-l border-white/5 sm:h-12 items-center shrink-0">
          {rankingFilter !== 'week' && <div className="origin-center">{renderPerformance(user, 'table')}</div>}
        </div>

        {/* Competitor Column - Fixed Span 6/5 regardless of filter */}
        <div className="col-span-6 sm:col-span-5 flex items-center justify-start pl-4 sm:pl-8 sm:border-l border-white/5 sm:h-12 px-2 overflow-hidden">
          <div className="flex items-center justify-start gap-2 sm:gap-4 w-full max-w-[280px]">
            {/* Avatar visible? Yes, keeping it. */}
            <div className={`size-8 sm:size-10 bg-zinc-800 flex-shrink-0 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 ${isHighlight || isCurrentUser ? 'ring-1 sm:ring-2 ring-primary ring-offset-1 sm:ring-offset-2 ring-offset-zinc-900 shadow-xl shadow-primary/30' : 'border border-white/10 shadow-lg'}`} style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}>
              <img alt={user.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity" src={user.avatar} />
            </div>
            <div className="flex flex-col min-w-0 items-start text-left">
              <div className="flex items-center gap-2 justify-start">
                <span className={`font-condensed font-bold uppercase tracking-tight text-sm sm:text-2xl truncate ${isHighlight || isCurrentUser ? 'text-primary' : 'text-white/90 group-hover:text-white'}`}>{user.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Points Column */}
        <div className="col-span-2 sm:col-span-3 text-center sm:text-right sm:pr-10 sm:border-l border-white/5 sm:h-12 flex flex-col justify-center items-center sm:items-end">
          <div className={`font-display text-xl sm:text-4xl font-black tracking-tighter leading-none ${isHighlight || isCurrentUser ? 'text-primary' : 'text-white group-hover:text-primary transition-colors'}`}>
            {displayPoints}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-0 font-display scroll-smooth pb-20 sm:pb-8">
      {/* Sticky Header & Banner Section */}
      <div className="sticky top-0 md:top-0 z-40 bg-background-dark/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-0 sm:pt-0 pb-0 sm:pb-0 mb-0 md:mb-0 border-b border-white/5">
        {/* Header section */}
        <div className="flex flex-col items-center justify-center gap-2 mb-1 pt-2 pb-0">
          <div className="w-full text-center">
            <h2 className="font-condensed text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-white italic">
              Ranking <span className="text-primary drop-shadow-[0_0_15px_rgba(236,19,19,0.3)]">Geral</span>
            </h2>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar pb-1">
            <div className="flex flex-nowrap items-center gap-2 sm:gap-4 min-w-max">
              {/* Filter Buttons */}
              {/* Filter Buttons - Segmented Control Style - Close to Banner below */}
              <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-lg w-full max-w-md mx-auto relative overflow-hidden mb-0.5">
                <div className="absolute inset-0 bg-white/5 pointer-events-none rounded-lg" />
                {[
                  { id: 'week', label: 'Eventos' },
                  { id: 'month', label: 'Mensal' },
                  { id: 'year', label: 'Anual' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setRankingFilter(btn.id as any)}
                    className={`flex-1 py-2 text-xs sm:text-sm font-condensed uppercase font-black tracking-widest transition-all rounded-md relative z-10 ${rankingFilter === btn.id ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* LINEAR NAVIGATION MERGED INTO BANNER BELOW */}


            </div>
          </div>
        </div>

        {/* Period Banner Section */}
        <div
          className="mb-3 sm:mb-4 relative h-[3.5rem] sm:h-[4.5rem] rounded-xl overflow-hidden border border-white/10 shadow-2xl group transition-all touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10 transition-opacity"></div>

          {/* NAVIGATION ARROWS OVERLAY */}
          <div className="absolute inset-0 z-30 pointer-events-none flex justify-between items-center px-1">
            <button
              disabled={!prevItem}
              onClick={(e) => { e.stopPropagation(); prevItem && handlePeriodSelect(prevItem.id); }}
              className={`size-12 flex items-center justify-center rounded-full pointer-events-auto transition-all active:scale-95 ${prevItem ? 'text-white/50 hover:bg-black/40 hover:text-white' : 'text-white/5 opacity-0'}`}
            >
              <span className="material-symbols-outlined text-3xl drop-shadow-lg">chevron_left</span>
            </button>
            <button
              disabled={!nextItem}
              onClick={(e) => { e.stopPropagation(); nextItem && handlePeriodSelect(nextItem.id); }}
              className={`size-12 flex items-center justify-center rounded-full pointer-events-auto transition-all active:scale-95 ${nextItem ? 'text-white/50 hover:bg-black/40 hover:text-white' : 'text-white/5 opacity-0'}`}
            >
              <span className="material-symbols-outlined text-3xl drop-shadow-lg">chevron_right</span>
            </button>
          </div>

          {/* CLICKABLE AREA TRIGGER FOR FULL SELECTION */}
          <div
            className="absolute inset-0 z-20 cursor-pointer active:bg-white/5 transition-colors"
            onClick={() => setShowFullSelector(true)}
          >
            {rankingFilter === 'week' ? (
              (() => {
                const event = events.find(e => e.id === currentItem?.id);
                return event ? (
                  <>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div> {/* Darken bg for text */}
                    <img src={event.banner_url} className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:scale-105 transition-transform duration-700 -z-20" alt="Event Banner" />
                    <div className="absolute inset-0 flex flex-col justify-center items-center px-16 text-center">
                      <p className="font-condensed text-[10px] text-primary uppercase font-bold tracking-widest mb-0.5 flex items-center gap-1">
                        Visualizando Ranking <span className="material-symbols-outlined text-[10px]">expand_more</span>
                      </p>
                      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 w-full px-2" key={currentItem?.id}>
                        <h4 className="font-condensed text-xl sm:text-2xl font-black text-white italic uppercase leading-none drop-shadow-md truncate w-full max-w-[95%] text-center">{event.title}</h4>
                        <span className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider">{event.subtitle}</span>
                      </div>
                    </div>
                  </>
                ) : null;
              })()
            ) : (
              <>
                <div className="absolute inset-0 bg-[#1a0c0c] flex items-center justify-center -z-10 overflow-hidden group-hover:bg-[#2a1212] transition-colors">
                  <span className="material-symbols-outlined text-[80px] text-white/[0.02] absolute rotate-12 -right-10">history_edu</span>
                </div>
                <div className="absolute inset-0 flex flex-col justify-center items-center px-16 text-center">
                  <p className="font-condensed text-[10px] text-primary uppercase font-bold tracking-widest mb-0.5 flex items-center gap-1">
                    {rankingFilter === 'month' ? 'Ranking Mensal' : 'Ranking Anual'} <span className="material-symbols-outlined text-[10px]">expand_more</span>
                  </p>
                  <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 w-full px-2" key={currentItem?.id}>
                    <h4 className="font-condensed text-xl sm:text-2xl font-black text-white italic uppercase leading-none drop-shadow-md w-full text-center">
                      {currentItem?.label}
                    </h4>
                    <span className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider">{currentItem?.sub}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>


      </div>

      <div className="mb-0 mt-0 relative z-20">
        {/* User Status Highlight - MOVED ABOVE PODIUM - Reduced gap to Podium */}
        {currentUserData && (
          <div className="animate-in fade-in slide-in-from-top duration-700 relative mb-2 mt-2.5">
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="size-5 bg-primary/20 border border-primary/40 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xs">person</span>
              </div>
              <h3 className="font-condensed text-sm sm:text-base text-white uppercase tracking-widest font-black italic">Sua <span className="text-primary">Posição</span></h3>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-md z-0"></div>
              {/* Reuse existing render logic but force highlight style */}
              {renderUserRow(currentUserData, currentUserIndex, true)}
            </div>
          </div>
        )}

        <h3 className="font-condensed text-sm sm:text-base text-white uppercase tracking-[0.3em] font-black flex items-center gap-3 border-l-2 border-primary pl-4 truncate whitespace-nowrap overflow-hidden">
          <span className="material-symbols-outlined text-primary text-base shrink-0">military_tech</span>
          <span className="truncate">Pódio de Elite</span>
        </h3>
      </div>

      {/* Podium - Horizontal Grid on Mobile & Desktop - Ratio 3-4-3 (30% | 40% | 30%) */}
      <div className="grid grid-cols-10 gap-1 md:gap-3 mb-4 sm:mb-8 items-end px-1 sm:px-4 mt-6 sm:mt-6 relative z-10">
        {/* Silver (30% width) */}
        <div className="col-span-3 order-1 w-full bg-card-dark border border-white/10 relative group hover:border-silver/50 transition-all duration-300 clip-corner">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-silver"></div>
          <div className="py-1 md:pt-2 md:pb-4 px-1 md:px-4 flex flex-col items-center justify-center gap-1 md:gap-4 min-h-[105px] md:min-h-auto">
            <div className="text-silver font-condensed text-3xl font-black opacity-10 absolute top-2 right-2 z-0 italic leading-none hidden md:block">02</div>
            {second && (
              <>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-12 md:size-24 overflow-hidden border border-silver/30 rotate-1 group-hover:rotate-0 transition-transform" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="2nd" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={second.avatar} />
                  </div>
                  <div className="absolute -bottom-2 lg:-bottom-2 -bottom-1 left-1/2 -translate-x-1/2 bg-silver text-black font-condensed text-[6px] md:text-[8px] font-black px-2 md:px-3 py-0.5 uppercase tracking-[0.2em] whitespace-nowrap z-20">PRATA</div>
                </div>
                <div className="text-center z-10 w-full mt-2">
                  <h4 className="font-condensed text-xs md:text-lg uppercase tracking-tighter text-white font-black leading-none mb-1 truncate px-1">{second.name}</h4>
                  <div className="border-t border-white/5 pt-1 md:pt-2 mt-1 md:mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-0 leading-none">
                    {rankingFilter !== 'week' && <div className="scale-90 origin-center">{renderPerformance(second, 'podium')}</div>}
                    <div className="font-display font-black text-lg md:text-2xl text-silver leading-none tracking-tight">
                      {getFilteredPoints(second)}<span className="text-[9px] md:text-sm opacity-50 ml-0.5">Pts</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gold - Peak Trophy (40% width) */}
        <div className="col-span-4 order-2 w-full bg-zinc-900 border border-gold/40 relative group hover:border-gold transition-all duration-500 transform -translate-y-4 md:-translate-y-6 shadow-[0_20px_50px_rgba(255,215,0,0.1)] clip-corner z-20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
          <div className="py-2 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-4 min-h-[130px] md:min-h-auto">
            <div className="text-gold font-condensed text-4xl font-black opacity-10 absolute top-2 right-4 z-0 italic leading-none hidden md:block">01</div>
            <span className="material-symbols-outlined text-gold text-2xl absolute top-2 left-4 hidden md:block">workspace_premium</span>
            {first && (
              <>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-16 md:size-28 overflow-hidden border border-gold/50 -rotate-1 group-hover:rotate-0 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.1)]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="1st" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={first.avatar} />
                  </div>
                  <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-gold text-black font-condensed text-[7px] md:text-[10px] font-black px-2 md:px-4 py-0.5 md:py-1 uppercase tracking-[0.3em] italic shadow-2xl whitespace-nowrap z-20">CAMPEÃO</div>
                </div>
                <div className="text-center z-10 w-full mt-2">
                  <h4 className="font-condensed text-sm md:text-xl uppercase tracking-tighter text-white font-black leading-none mb-0.5 md:mb-1 truncate px-1">{first.name}</h4>
                  <div className="font-mono text-[5px] md:text-[7px] text-gold/60 uppercase tracking-[0.4em] font-black mt-0.5 hidden sm:block">PODER_MÁXIMO</div>
                  <div className="border-t border-white/10 pt-2 md:pt-3 mt-1 md:mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-0 leading-none">
                    <div className="text-[9px] text-white/30 uppercase tracking-[0.5em] font-black hidden md:block absolute -top-3 left-1/2 -translate-x-1/2 w-full text-center">Ranking_Oficial</div>
                    {rankingFilter !== 'week' && <div className="">{renderPerformance(first, 'podium')}</div>}
                    <div className="font-display font-black text-2xl md:text-5xl text-gold leading-none tracking-tight">
                      {getFilteredPoints(first)}<span className="text-[10px] md:text-sm opacity-50 ml-1">Pts</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bronze (30% width) */}
        <div className="col-span-3 order-3 w-full bg-card-dark border border-white/10 relative group hover:border-bronze/50 transition-all duration-300 clip-corner">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-bronze"></div>
          <div className="py-1 md:pt-2 md:pb-4 px-1 md:px-4 flex flex-col items-center justify-center gap-1 md:gap-4 min-h-[105px] md:min-h-auto">
            <div className="text-bronze font-condensed text-3xl font-black opacity-10 absolute top-2 right-2 z-0 italic leading-none hidden md:block">03</div>
            {third && (
              <>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="size-12 md:size-24 overflow-hidden border border-bronze/30 -rotate-1 group-hover:rotate-0 transition-transform" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                    <img alt="3rd" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={third.avatar} />
                  </div>
                  <div className="absolute -bottom-2 lg:-bottom-2 -bottom-1 left-1/2 -translate-x-1/2 bg-bronze text-white font-condensed text-[6px] md:text-[8px] font-black px-2 md:px-3 py-0.5 uppercase tracking-[0.2em] whitespace-nowrap z-20">BRONZE</div>
                </div>
                <div className="text-center z-10 w-full mt-2">
                  <h4 className="font-condensed text-xs md:text-lg uppercase tracking-tighter text-white font-black leading-none mb-1 truncate px-1">{third.name}</h4>
                  <div className="border-t border-white/5 pt-1 md:pt-2 mt-1 md:mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-0 leading-none">
                    {rankingFilter !== 'week' && <div className="scale-90 origin-center">{renderPerformance(third, 'podium')}</div>}
                    <div className="font-display font-black text-lg md:text-2xl text-bronze leading-none tracking-tight">
                      {getFilteredPoints(third)}<span className="text-[9px] md:text-sm opacity-50 ml-0.5">Pts</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>




      {/* Execution Table UI */}
      <div className="flex mb-1 sm:mb-2 items-center justify-between px-1 sm:px-2">
        <h3 className="font-condensed text-sm sm:text-base text-white uppercase tracking-[0.3em] font-black flex items-center gap-3 italic border-l-2 border-primary pl-4">
          <span className="material-symbols-outlined text-primary text-xl">list_alt</span> TABELA DE PERFORMANCE
        </h3>
      </div>

      <div className="flex flex-col border border-white/10 bg-zinc-900/40 backdrop-blur-3xl overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-40"></div>

        {/* Header Grid */}
        <div className="grid grid-cols-12 gap-0 px-2 sm:px-8 py-2 sm:py-3 bg-black/80 border-b border-primary/20 text-[10px] sm:text-sm font-condensed text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.4em] font-black z-30 sticky top-0 backdrop-blur-xl items-center">
          <div className="col-span-2 sm:col-span-1 text-center sm:border-r border-white/5">Rank</div>
          <div className="col-span-2 sm:col-span-3 text-center sm:border-r border-white/5 text-primary/60">{rankingFilter !== 'week' ? 'Prog' : ''}</div>
          <div className="col-span-6 sm:col-span-5 flex items-center justify-start pl-4 sm:pl-8 border-r border-white/5 uppercase">Competidor</div>
          <div className="col-span-2 sm:col-span-3 text-center sm:text-right pr-0 sm:pr-6 uppercase tracking-[0.2em] sm:tracking-[0.5em] font-black text-white/70">Pts</div>
        </div>

        {/* Leaderboard Lines */}
        <div className="divide-y divide-white/10 relative z-10 border-t border-white/5">
          {leaderboard.length > 3 ? (
            leaderboard.slice(3).map((user, index) => renderUserRow(user, index + 3))
          ) : (
            <div className="py-40 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-white/5 text-9xl mb-8 animate-pulse">database_off</span>
              <div className="text-white/20 font-condensed italic text-2xl tracking-[0.4em] uppercase font-black">SISTEMA_SEM_RESPOSTA // DADOS_NÃO_LOCALIZADOS</div>
            </div>
          )}
        </div>

        <div className="p-12 text-center text-white/5 text-[11px] font-mono border-t border-white/5 uppercase tracking-[0.7em] bg-black/60 font-black">
          STATUS_MOTOR: ONLINE // CONEXÃO_SEGURA // v1.0.4.8_ELITE
        </div>
      </div>
      <div className="h-40"></div>
      {showFullSelector && (
        <div className="fixed top-[60px] md:top-[80px] bottom-[80px] left-3 right-3 z-[40] bg-zinc-950/95 backdrop-blur-md animate-in fade-in duration-200 flex flex-col p-4 sm:p-6 border border-white/10 shadow-2xl rounded-2xl">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setShowFullSelector(false)}
              className="size-12 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors shadow-lg border border-white/10"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col justify-center">
            <h2 className="text-2xl font-black text-white uppercase italic text-center mb-6 tracking-wider">
              Selecione {rankingFilter === 'week' ? 'o Evento' : rankingFilter === 'month' ? 'o Mês' : 'o Ano'}
            </h2>

            <div className={`grid gap-2 mx-auto w-full ${rankingFilter === 'month' ? 'grid-cols-2 grid-rows-6 h-full max-w-sm' : 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 max-w-2xl'}`}>
              {fullList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { handlePeriodSelect(item.id); setShowFullSelector(false); }}
                  className={`rounded-lg border flex flex-col items-center justify-center text-center transition-all active:scale-95 w-full ${rankingFilter === 'month' ? 'h-full' : 'p-2 py-3'} ${item.id === currentItem?.id ? 'bg-primary border-primary shadow-[0_0_20px_rgba(236,19,19,0.3)] scale-[1.02] z-10' : 'bg-zinc-900/80 border-white/5 hover:bg-zinc-800 hover:border-white/20'}`}
                >
                  {rankingFilter === 'week' ? (
                    (() => {
                      // Regex for case-insensitive 'vs', 'vs.', 'x', 'X' with spaces
                      const vsRegex = /\s+(?:vs\.?|x)\s+/i;

                      // For events, label is Title (UFC 300) and sub is Subtitle (Pereira vs Hill)
                      if (item.sub) {
                        const fighterParts = item.sub.split(vsRegex);

                        if (fighterParts.length === 2) {
                          return (
                            <div className="flex flex-col gap-0.5 leading-none w-full">
                              <span className={`font-condensed font-black uppercase truncate w-full px-1 text-base ${item.id === currentItem?.id ? 'text-white/60' : 'text-white/40'}`}>{item.label}</span>
                              <span className={`font-condensed font-black uppercase truncate w-full px-1 text-lg ${item.id === currentItem?.id ? 'text-white' : 'text-white/70'}`}>{fighterParts[0]}</span>
                              <span className={`text-[10px] font-bold italic lowercase ${item.id === currentItem?.id ? 'text-white' : 'text-primary'}`}>vs</span>
                              <span className={`font-condensed font-black uppercase truncate w-full px-1 text-lg ${item.id === currentItem?.id ? 'text-white' : 'text-white/70'}`}>{fighterParts[1]}</span>
                            </div>
                          );
                        }
                      }

                      // Fallback if no sub or no split
                      return <span className={`font-condensed font-black uppercase truncate w-full px-1 ${item.id === currentItem?.id ? 'text-white' : 'text-white/70'}`}>{item.label}</span>;
                    })()
                  ) : (
                    <span className={`font-condensed font-black uppercase truncate w-full px-1 ${rankingFilter === 'month' ? 'text-2xl' : 'text-3xl'} ${item.id === currentItem?.id ? 'text-white' : 'text-white/70'}`}>{item.label}</span>
                  )}
                  {/* Only show sub if NOT week/event (since we used sub above) OR if we fell back to simple label */}
                  {item.sub && rankingFilter !== 'week' && <span className={`uppercase tracking-wider mt-0.5 font-bold truncate w-full ${rankingFilter === 'month' ? 'text-[11px]' : 'text-xs'} ${item.id === currentItem?.id ? 'text-white/90' : 'text-white/30'}`}>{item.sub}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default Ranking;