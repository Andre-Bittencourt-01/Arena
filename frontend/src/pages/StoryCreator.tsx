import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Event, Fight, Pick } from '../frontend/src/types';
import { toPng } from 'html-to-image';
import { Screen } from '../App';

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
          <div
            ref={story_ref}
            className="w-[375px] h-[667px] bg-[#1a1a1a] relative flex flex-col select-none overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[#0a0a0a]"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-black/90"></div>
            </div>

            <div className={`px-4 pt-4 pb-2 flex items-center justify-between relative z-10 bg-gradient-to-b from-black/80 to-transparent shrink-0 transition-all`}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-cover bg-center border border-white/20 shadow-lg"
                  style={{ backgroundImage: `url("${user?.avatar_url}")` }}
                ></div>
                <div>
                  <p className="text-white text-[10px] font-bold leading-none">{user?.name}</p>
                  <p className="text-primary text-[8px] font-bold uppercase tracking-wider mt-0.5">Arena Member</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">sports_mma</span>
                  <span className="text-white text-[10px] font-black italic tracking-tighter">ARENA</span>
                </div>
              </div>
            </div>

            <div className={`relative ${fights.length > 10 ? 'h-14' : 'h-24'} shrink-0 mx-4 mt-0.5 rounded-lg overflow-hidden shadow-2xl border border-white/10 group transition-all flex items-center`}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${selected_event.banner_url}")` }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-20">
                <div className={`px-1.5 py-0.5 rounded text-[7px] font-black italic tracking-widest uppercase text-white ${selected_event.status === 'completed' ? 'bg-accent-green' : 'bg-primary'}`}>
                  {selected_event.status === 'completed' ? 'RESULTADOS' : 'PALPITES'}
                </div>
              </div>

              <div className="relative z-20 pl-4 py-2 flex flex-col justify-center h-full">
                <h2 className="text-white text-sm font-black italic uppercase leading-tight drop-shadow-md truncate max-w-[200px]">
                  {selected_event.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-400 text-[8px] font-condensed uppercase tracking-wide">
                    {new Date(selected_event.date).toLocaleDateString()}
                  </span>
                  <span className="text-gray-500 text-[6px]">•</span>
                  <span className="text-gray-400 text-[8px] font-condensed uppercase tracking-wide truncate max-w-[100px]">
                    {selected_event.location}
                  </span>
                </div>
              </div>
            </div>

            {selected_event.status === 'completed' && fights.length <= 14 && (
              <div className="mx-4 mt-1.5 flex gap-1 shrink-0">
                <div className="flex-1 bg-white/5 border border-white/5 rounded p-1 flex items-center justify-between px-2">
                  <span className="text-[7px] text-gray-500 uppercase font-bold">Pontos</span>
                  <span className="text-sm font-black text-white leading-none">{total_points}</span>
                </div>
                <div className="flex-1 bg-white/5 border border-white/5 rounded p-1 flex items-center justify-between px-2">
                  <span className="text-[7px] text-gray-500 uppercase font-bold"> Precisão</span>
                  <span className="text-sm font-black text-accent-green leading-none">{accuracy}%</span>
                </div>
              </div>
            )}

            <div className="flex-1 px-4 py-2 overflow-hidden relative z-10 flex flex-col min-h-0">
              {(() => {
                const is_odd_count = fights.length % 2 !== 0;
                const row_count = is_odd_count
                  ? 1 + Math.ceil((fights.length - 1) / 2)
                  : Math.ceil(fights.length / 2);

                const grid_template_rows = is_odd_count
                  ? `1.4fr repeat(${row_count - 1}, 1fr)`
                  : `repeat(${row_count}, 1fr)`;

                return (
                  <div
                    className="grid grid-cols-2 gap-0.5 h-full w-full"
                    style={{ gridTemplateRows: grid_template_rows }}
                  >
                    {fights.map((fight, index) => {
                      const user_pick = picks[fight.id];
                      const has_pick = !!user_pick;
                      const is_completed = selected_event.status === 'completed';
                      const is_upcoming = !is_completed;
                      const winner_id = fight.winner_id;

                      const my_pick_id = user_pick?.fighter_id;
                      const is_pick_correct = is_completed && winner_id && my_pick_id === winner_id;

                      const f_a = fight.fighter_a;
                      const f_b = fight.fighter_b;

                      const f1_dim = is_completed
                        ? (winner_id && winner_id !== f_a.id)
                        : (is_upcoming && my_pick_id && my_pick_id !== f_a.id);

                      const f2_dim = is_completed
                        ? (winner_id && winner_id !== f_b.id)
                        : (is_upcoming && my_pick_id && my_pick_id !== f_b.id);

                      const is_main_event = index === 0;
                      const is_full_width = is_odd_count && is_main_event;

                      const img_width = is_full_width ? 'w-24' : 'w-10';

                      const result_round_prop = (fight as any).result_round || (fight as any).round_end || fight.rounds;
                      const result_method_prop = (fight as any).method || 'DEC';

                      let simple_method = 'DEC';
                      const m_upper = result_method_prop.toUpperCase();
                      if (m_upper.includes('KO') || m_upper.includes('TKO')) simple_method = 'KO';
                      else if (m_upper.includes('SUB')) simple_method = 'SUB';
                      else if (m_upper.includes('DEC')) simple_method = 'DEC';
                      else simple_method = m_upper.substring(0, 3);

                      const renderWinnerBadge = () => {
                        const text_size = is_full_width ? 'text-[7px]' : 'text-[4px]';
                        const p_padding = is_full_width ? 'px-2 py-0.5' : 'px-1 py-[1px]';

                        return (
                          <div className={`absolute top-0 right-0 bg-accent-green text-black ${text_size} font-black ${p_padding} rounded-bl-sm uppercase tracking-tighter leading-none shadow-sm z-10`}>
                            VENCEDOR
                          </div>
                        );
                      };

                      const renderResultFooter = () => {
                        const text_size = is_full_width ? 'text-[7px]' : 'text-[4px]';
                        const p_padding = is_full_width ? 'px-2 py-0.5' : 'px-1.5 py-[1px]';
                        const min_w_method = is_full_width ? 'min-w-[28px]' : 'min-w-[14px]';
                        const min_w_round = is_full_width ? 'min-w-[18px]' : 'min-w-[10px]';

                        let second_box_content = `R${String(result_round_prop).replace(/[^\d]/g, '')}`;

                        if (simple_method === 'DEC') {
                          const m_up = result_method_prop.toUpperCase();
                          if (m_up.includes('UNA') || m_up.includes('UNI')) {
                            second_box_content = is_full_width ? 'UNANIME' : 'UNA';
                          } else if (m_up.includes('SPLIT') || m_up.includes('DIV')) {
                            second_box_content = is_full_width ? 'DIVIDIDA' : 'DIV';
                          } else if (m_up.includes('MAJ')) {
                            second_box_content = is_full_width ? 'MAJORITARIA' : 'MAJ';
                          }
                        }

                        return (
                          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-evenly pb-[1px]">
                            <div className={`bg-accent-green text-black ${text_size} font-black ${p_padding} rounded-t-sm uppercase tracking-tighter leading-none ${min_w_method} text-center shadow-sm`}>
                              {simple_method}
                            </div>
                            <div className={`bg-accent-green text-black ${text_size} font-black ${p_padding} rounded-t-sm uppercase tracking-tighter leading-none ${min_w_round} text-center shadow-sm`}>
                              {second_box_content}
                            </div>
                          </div>
                        );
                      };

                      return (
                        <div
                          key={fight.id}
                          className={`relative h-full bg-white/5 border border-white/5 rounded-sm flex overflow-hidden group
                                    ${is_full_width ? 'col-span-2 border-primary/30 bg-gradient-to-r from-black via-primary/5 to-black' : ''}
                                `}
                        >
                          <div className={`relative ${img_width} h-full shrink-0 transition-all border-r border-white/5
                              ${is_upcoming && my_pick_id === f_a.id ? 'border-2 border-accent-green box-border z-10' : ''}
                          `}>
                            <img src={f_a.image_url} alt={f_a.name} className={`w-full h-full object-cover object-top ${f1_dim ? 'grayscale opacity-50' : ''}`} />
                            {my_pick_id === f_a.id && <div className={`absolute bottom-0 h-0.5 w-full ${is_pick_correct ? 'bg-accent-green' : is_completed && winner_id ? 'bg-red-500' : 'bg-accent-green'}`}></div>}

                            {is_completed && winner_id === f_a.id && (
                              <>
                                {renderWinnerBadge()}
                                {renderResultFooter()}
                              </>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between items-center px-1 py-1 relative min-w-0 h-full">
                            <div className="flex flex-col items-center justify-center w-full grow">
                              {(() => {
                                const get_fighter_style = (id: string, is_dim: boolean) => {
                                  if (my_pick_id === id) {
                                    if (is_upcoming) return 'text-accent-green';
                                    if (is_pick_correct) return 'text-accent-green';
                                    if (is_completed && winner_id) return 'text-red-500 line-through decoration-[0.5px]';
                                    return 'text-white';
                                  }
                                  return is_dim ? 'text-gray-600' : 'text-white';
                                };

                                return (
                                  <>
                                    <div className={`w-full text-center ${is_full_width ? 'text-[12px] mb-0.5' : 'text-[8px] mb-[1px]'} font-black uppercase truncate leading-tight ${get_fighter_style(f_a.id, f1_dim)}`}>
                                      {f_a.name.split(' ').pop()}
                                    </div>

                                    <div className={`${is_full_width ? 'text-[7px]' : 'text-[4px]'} font-black italic text-white/40 uppercase leading-none my-[1px]`}>
                                      VS
                                    </div>

                                    <div className={`w-full text-center ${is_full_width ? 'text-[12px] mt-0.5' : 'text-[8px] mt-[1px]'} font-black uppercase truncate leading-tight ${get_fighter_style(f_b.id, f2_dim)}`}>
                                      {f_b.name.split(' ').pop()}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>

                            {has_pick ? (
                              <div className={`grid ${is_upcoming ? 'grid-cols-2' : 'grid-cols-3'} gap-[1px] w-full ${is_full_width ? 'h-4' : 'h-2.5'} mt-auto`}>
                                {(() => {
                                  let pick_meth_simple = 'KO';
                                  const pick_meth_raw = user_pick.method || '';
                                  if (pick_meth_raw.includes('KO') || pick_meth_raw.includes('TKO')) pick_meth_simple = 'KO';
                                  else if (pick_meth_raw.includes('SUB')) pick_meth_simple = 'SUB';
                                  else if (pick_meth_raw.includes('DEC')) pick_meth_simple = 'DEC';

                                  const pick_method_correct = is_completed && simple_method === pick_meth_simple;
                                  const pick_method_style = is_upcoming
                                    ? 'text-accent-green'
                                    : pick_method_correct
                                      ? 'text-accent-green'
                                      : (is_completed && winner_id ? 'text-red-500 line-through decoration-[0.5px]' : 'text-primary');

                                  const user_pick_round = (user_pick as any).round;
                                  const clean_round = user_pick_round ? String(user_pick_round).replace(/[^\d]/g, '') : '';
                                  const pick_round_content = clean_round ? `R${clean_round}` : pick_meth_simple === 'DEC' ? 'DEC' : '-';

                                  const result_round_val = (fight as any).result_round;
                                  let pick_round_correct = false;
                                  if (pick_meth_simple === 'DEC' && simple_method === 'DEC') pick_round_correct = true;
                                  else if (clean_round && result_round_val && Number(clean_round) === Number(result_round_val)) pick_round_correct = true;

                                  const pick_round_style = is_upcoming
                                    ? 'text-accent-green'
                                    : pick_round_correct
                                      ? 'text-accent-green'
                                      : (is_completed && winner_id ? 'text-red-500 line-through decoration-[0.5px]' : 'text-primary');

                                  const points = user_pick.points_earned || 0;
                                  const points_text = points > 0 ? `+${points} Pts` : '0 Pts';

                                  const text_size = is_full_width ? 'text-[8px]' : 'text-[4px]';

                                  return (
                                    <>
                                      <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${text_size} font-bold uppercase ${pick_method_style}`}>
                                        {pick_meth_simple}
                                      </div>
                                      <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${text_size} font-bold uppercase ${pick_round_style}`}>
                                        {pick_round_content}
                                      </div>
                                      {is_completed && (
                                        <div className={`bg-white/5 rounded-[1px] flex items-center justify-center ${text_size} font-black text-white`}>
                                          {points_text}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div className={`w-full ${is_full_width ? 'h-4' : 'h-2.5'} mt-auto flex items-center justify-center opacity-20`}>
                                <div className="h-[1px] w-full bg-white/20"></div>
                              </div>
                            )}

                          </div>

                          <div className={`relative ${img_width} h-full shrink-0 transition-all border-l border-white/5
                             ${is_upcoming && my_pick_id === f_b.id ? 'border-2 border-accent-green box-border z-10' : ''}
                          `}>
                            <img src={f_b.image_url} alt={f_b.name} className={`w-full h-full object-cover object-top ${f2_dim ? 'grayscale opacity-50' : ''}`} />
                            {my_pick_id === f_b.id && <div className={`absolute bottom-0 h-0.5 w-full ${is_pick_correct ? 'bg-accent-green' : is_completed && winner_id ? 'bg-red-500' : 'bg-accent-green'}`}></div>}

                            {is_completed && winner_id === f_b.id && (
                              <>
                                {renderWinnerBadge()}
                                {renderResultFooter()}
                              </>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className={`px-5 ${fights.length > 12 ? 'py-2' : 'py-4'} bg-black border-t border-white/10 flex items-center justify-between relative z-10 shrink-0`}>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-sm">sports_mma</span>
                <span className="text-[8px] text-white font-bold uppercase tracking-widest">ARENAMMA.APP</span>
              </div>
              <div className="text-[7px] text-gray-600 uppercase font-medium">Onde a luta começa</div>
            </div>

          </div>
        )}
      </section>
    </div>
  );
};

export default StoryCreator;