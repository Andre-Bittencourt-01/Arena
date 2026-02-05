import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Event, Fight, Pick } from '../types';
import { toPng } from 'html-to-image';
import { Screen } from '../App';
import StoryCard from '../components/StoryCard';

interface StoryCreatorProps {
  on_navigate?: (screen: Screen) => void;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ on_navigate }) => {
  const { events, get_fights_for_event, get_picks_for_event, current_event } = useData();
  const { user } = useAuth();
  const [selected_event_id, set_selected_event_id] = useState<string | null>(null);
  const [selected_event, set_selected_event] = useState<Event | null>(null);
  const [fights, set_fights] = useState<Fight[]>([]);
  const [picks, set_picks] = useState<Record<string, Pick>>({});
  const [is_loading, set_is_loading] = useState(false);
  const story_ref = useRef<HTMLDivElement>(null);
  const [is_downloading, set_is_downloading] = useState(false);
  const [mobile_view, set_mobile_view] = useState<'list' | 'preview'>('list');

  // Filter events
  const upcoming_events = events.filter(e => e.status === 'upcoming');
  const past_events = events.filter(e => e.status === 'completed');

  // Load initial event
  useEffect(() => {
    if (!selected_event_id && events.length > 0) {
      if (current_event) {
        set_selected_event_id(current_event.id);
      } else {
        const latest_completed = past_events[0];
        if (latest_completed) {
          set_selected_event_id(latest_completed.id);
        } else if (upcoming_events.length > 0) {
          set_selected_event_id(upcoming_events[0].id);
        }
      }
    }
  }, [events, selected_event_id, current_event]);

  // Fetch data
  useEffect(() => {
    const load_event_data = async () => {
      if (!selected_event_id) return;

      set_is_loading(true);
      const found_event = events.find(e => e.id === selected_event_id) || null;
      set_selected_event(found_event);

      if (found_event) {
        const fts = await get_fights_for_event(selected_event_id);
        const user_picks = await get_picks_for_event(selected_event_id);
        set_fights(fts);
        set_picks(user_picks);
      }
      set_is_loading(false);
    };

    load_event_data();
  }, [selected_event_id, events]);

  // Handle Selection (Mobile Auto-Switch)
  const handle_event_select = (id: string) => {
    set_selected_event_id(id);
    set_mobile_view('preview');
  };

  // Download Handler
  const handle_download = async () => {
    if (!story_ref.current) return;
    set_is_downloading(true);
    try {
      const data_url = await toPng(story_ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#000000'
      });
      const link = document.createElement('a');
      link.download = `arena-story-${selected_event?.id || 'event'}.png`;
      link.href = data_url;
      link.click();
    } catch (err) {
      console.error('Failed to download story image', err);
    } finally {
      set_is_downloading(false);
    }
  };

  // Share Handler (Native)
  const handle_share = async () => {
    if (story_ref.current && navigator.share) {
      try {
        set_is_downloading(true);
        const data_url = await toPng(story_ref.current, {
          cacheBust: true,
          pixelRatio: 2,
          quality: 0.95,
          backgroundColor: '#000000'
        });
        const response = await fetch(data_url);
        const blob = await response.blob();
        const file = new File([blob], "meus-palpites.png", { type: "image/png" });

        await navigator.share({
          title: 'Meus Palpites - Arena MMA',
          text: `Confira meus palpites para o ${selected_event?.title}!`,
          files: [file]
        });
      } catch (error) {
        console.error("Erro ao compartilhar", error);
      } finally {
        set_is_downloading(false);
      }
    } else {
      handle_download();
    }
  };

  // Stats
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

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden min-h-[calc(100vh-64px)] bg-background-dark">
      {/* SIDEBAR */}
      <aside className={`w-full lg:w-80 bg-surface-dark border-r border-white/5 p-6 flex flex-col shrink-0 overflow-y-auto max-h-[calc(100vh-64px)] custom-scrollbar z-20 ${mobile_view === 'list' ? 'flex' : 'hidden'} lg:flex`}>
        <div className="mb-8">
          <h1 className="text-white text-lg font-bold font-condensed uppercase tracking-wide">Story Creator</h1>
          <p className="text-gray-400 text-xs mt-1">Crie e compartilhe seus resultados.</p>
        </div>

        <div className="space-y-6">
          {upcoming_events.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase font-bold text-primary tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-primary rounded-full"></span> Próximos
              </h3>
              <div className="space-y-2">
                {upcoming_events.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => handle_event_select(evt.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selected_event_id === evt.id ? 'bg-primary/20 border-primary text-white' : 'bg-black/20 border-transparent text-gray-400 hover:bg-black/40 hover:text-white'}`}
                  >
                    <div className="text-xs font-bold font-condensed uppercase">{evt.title}</div>
                    <div className="text-[10px] opacity-70 truncate">{evt.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {past_events.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase font-bold text-accent-green tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-accent-green rounded-full"></span> Realizados
              </h3>
              <div className="space-y-2">
                {past_events.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => handle_event_select(evt.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selected_event_id === evt.id ? 'bg-accent-green/10 border-accent-green text-white' : 'bg-black/20 border-transparent text-gray-400 hover:bg-black/40 hover:text-white'}`}
                  >
                    <div className="text-xs font-bold font-condensed uppercase">{evt.title}</div>
                    <div className="text-[10px] opacity-70 truncate">{evt.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-8 flex flex-col gap-3">
          <button
            onClick={handle_share}
            disabled={is_downloading}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-condensed font-black uppercase tracking-widest rounded-xl shadow-neon flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {is_downloading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                <span className="material-symbols-outlined">share</span>
                <span>Compartilhar Card</span>
              </>
            )}
          </button>

          {on_navigate && (
            <button
              onClick={() => on_navigate('ranking')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-condensed font-bold uppercase tracking-widest rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined">leaderboard</span>
              <span>Ver Ranking</span>
            </button>
          )}
        </div>
      </aside>

      <section className={`flex-1 bg-black/50 p-4 lg:p-8 flex flex-col items-center overflow-y-auto ${mobile_view === 'preview' ? 'flex' : 'hidden'} lg:flex`}>
        <div className="w-full lg:hidden flex items-center justify-between mb-4 shrink-0">
          <button
            onClick={() => set_mobile_view('list')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
            <span className="text-xs font-bold uppercase tracking-widest">Eventos</span>
          </button>

          <button
            onClick={handle_download}
            disabled={is_downloading}
            className="bg-primary hover:bg-primary/80 text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {is_downloading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-white block"></span>
            ) : (
              <span className="material-symbols-outlined block">download</span>
            )}
          </button>
        </div>

        <h2 className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mb-6 hidden lg:block">Preview (9:16)</h2>

        {is_loading || !selected_event ? (
          <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2 border-primary/30"></div>
          </div>
        ) : (
          <StoryCard
            ref={story_ref}
            event={selected_event}
            fights={fights}
            picks={picks}
            user={user}
            total_points={total_points}
            accuracy={accuracy}
          />
        )}
      </section>
    </div>
  );
};

export default StoryCreator;