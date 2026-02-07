import React, { useState, useEffect, useMemo } from 'react';
import { Screen } from '../App';
import Panel from '../components/Panel';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Fight, Pick, Event } from '../types';
import { get_content_lock_status } from '../services/MockDataService';
import { useNavigation } from '../contexts/NavigationContext';
import SuccessOverlay from '../components/SuccessOverlay';

interface PicksProps {
  on_navigate: (screen: Screen) => void;
}

// Safe wrapper defined outside to avoid stale closures/deps
const safe_get_lock_status = (event: Event | null, fight: Fight | null) => {
  if (!event || !fight) return { status: 'OPEN' as const, reason: undefined };
  try {
    const info = get_content_lock_status(event, fight);
    // Normalize status to uppercase for safety
    return {
      ...info,
      status: (info.status || 'OPEN').toUpperCase() as 'OPEN' | 'LOCKED'
    };
  } catch (e) {
    console.error("Error calculating lock status", e);
    return { status: 'OPEN' as const, reason: undefined };
  }
};

// Helper for deep comparison of picks
const is_pick_modified = (p1: Pick | undefined, p2: Pick | undefined) => {
  if (!p1 && !p2) return false;
  if (!p1 || !p2) return true;
  return p1.fighter_id !== p2.fighter_id ||
    p1.method !== p2.method ||
    p1.round !== p2.round;
};

const Picks: React.FC<PicksProps> = ({ on_navigate }) => {
  const { user } = useAuth();

  // --- SCORING HELPERS (2026 Rules) ---
  const calculate_potential_points = (fight: Fight, pick: Partial<Pick>, pick_pct: number = 50) => {
    let points = 30; // Base: Winner

    // Bonus: Importance
    if (fight.is_title) points += 60;
    else if (fight.category === 'Main Event') points += 30;

    // Bonus: Method & Round (Assuming perfect pick)
    if (pick.method) points += 20;
    if (pick.round) points += 10;

    // Bonus: Mitada
    if (pick_pct <= 20) points += 90;

    return points;
  };

  // Mock Pick Stats (To be replaced by API)
  const get_fighter_pick_pct = (fighter_id: string | undefined): number => {
    if (!fighter_id) return 0;
    // Deterministic mock based on ID char
    const code = fighter_id.charCodeAt(fighter_id.length - 1);
    if (code % 7 === 0) return 9; // Mitada mock (lucky 7)
    if (code % 5 === 0) return 15; // Mitada mock
    return 65; // Standard favorite
  };

  const {
    current_event,
    current_fights: data_fights,
    get_picks_for_event,
    submit_picks_batch,
    get_fights_for_event,
    loading: data_loading
  } = useData();

  // 1. All Hooks & State moved to top (Rules of Hooks Fix)
  const [active_fight_id, set_active_fight_id] = useState<string | null>(null);
  const [event_picks, set_event_picks] = useState<Record<string, Pick>>({});
  const [original_picks, set_original_picks] = useState<Record<string, Pick>>({});
  const [selected_winner_id, set_selected_winner_id] = useState<string | null>(null);
  const [selected_method, set_selected_method] = useState<'KO/TKO' | 'SUB' | 'DEC' | null>(null);
  const [selected_round, set_selected_round] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);


  // Navigation Guard State
  const [show_unsaved_modal, set_show_unsaved_modal] = useState(false);
  const [show_success_summary, set_show_success_summary] = useState(false);
  const [pending_destination, set_pending_destination] = useState<Screen | null>(null);
  const [show_fight_list, set_show_fight_list] = useState(false);
  const { setBlocker, removeBlocker } = useNavigation();

  // 2. REVERSE FIGHTS (Main Event First -> Prelim Last)
  const current_fights = useMemo(() => {
    if (!current_event?.id) return [];
    // Filter by event AND Reverse order
    const fights = (data_fights || []).filter(f => f.event_id === current_event.id);
    return [...fights].reverse(); // Index 0 = Main Event
  }, [data_fights, current_event]);

  // Derived State & Memoization
  const active_fight = useMemo(() =>
    current_fights.find(f => f.id === active_fight_id) || null
    , [active_fight_id, current_fights]);

  // Safe accessors for rendering & logic
  const fighter_a = active_fight?.fighter_a;
  const fighter_b = active_fight?.fighter_b;
  const fighter_a_id = active_fight?.fighter_a_id;
  const fighter_b_id = active_fight?.fighter_b_id;

  // LOCK LOGIC (Component Scope - Hoisted)
  const lock_info = safe_get_lock_status(current_event, active_fight);
  const is_locked = lock_info.status === 'LOCKED' ||
    (active_fight?.status || 'SCHEDULED') === 'COMPLETED' ||
    (active_fight?.status || 'SCHEDULED') === 'FINISHED' ||
    !!active_fight?.winner_id ||
    (current_event?.status === 'COMPLETED');

  // 3. Effects

  const completed_picks_count = useMemo(() => Object.keys(event_picks).length, [event_picks]);
  const picks_done = completed_picks_count;

  const progress_percent = current_fights.length > 0 ? (completed_picks_count / current_fights.length) * 100 : 0;



  // Dirty Check: Compare current picks with original picks using robust field check
  const is_dirty = useMemo(() => {
    // Check if any pick in event_picks differs from original_picks
    const keys = Array.from(new Set([...Object.keys(event_picks), ...Object.keys(original_picks)]));
    return keys.some(key => is_pick_modified(event_picks[key], original_picks[key]));
  }, [event_picks, original_picks]);

  const has_closed_fights = current_event ? current_fights.some(f => {
    const info = safe_get_lock_status(current_event, f);
    return info.status === 'LOCKED';
  }) : false;

  const all_fights_closed = current_event ? current_fights.every(f => {
    const info = safe_get_lock_status(current_event, f);
    return info.status === 'LOCKED';
  }) : false;

  // 1. Define Reusable Fetch Function
  const refresh_picks = async () => {
    if (current_event) {
      try {
        const picks = await get_picks_for_event(current_event.id);
        set_event_picks(picks);
        set_original_picks(JSON.parse(JSON.stringify(picks))); // Sync source of truth

        if (current_fights.length > 0 && current_fights[0].event_id === current_event.id) {
          // User request: Start at the Main Event (First item in reversed list)
          set_active_fight_id(current_fights[0].id);
        }
      } catch (err) {
        console.error("Failed to refresh picks", err);
      }
    }
  };

  // 3. Effects
  // Defensive Fetch: Ensure fights are loaded if we have an event but no fights
  useEffect(() => {
    if (current_event && current_fights.length === 0 && !data_loading) {
      console.warn("Defensive Fetch: Current fights empty for event", current_event.id);
      get_fights_for_event(current_event.id);
    }
  }, [current_event, current_fights, data_loading, get_fights_for_event]);

  // Load initial data
  useEffect(() => {
    set_active_fight_id(null);
    refresh_picks();
  }, [current_event?.id]); // Depend strictly on ID

  // Sync selection stages with active fight's existing pick
  useEffect(() => {
    if (active_fight_id && event_picks[active_fight_id]) {
      const pick = event_picks[active_fight_id];
      set_selected_winner_id(pick.fighter_id);
      set_selected_method(pick.method as any);
      set_selected_round(pick.round);
    } else {
      set_selected_winner_id(null);
      set_selected_method(null);
      set_selected_round(null);
    }
  }, [active_fight_id, event_picks]);

  // Browser Refresh/Close Guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (is_dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [is_dirty]);

  // Global Navigation Guard (Navbar)
  useEffect(() => {
    if (is_dirty) {
      setBlocker((target: Screen) => {
        set_pending_destination(target);
        set_show_unsaved_modal(true);
        return true; // Block navigation
      });
    } else {
      removeBlocker();
    }
    return () => removeBlocker();
  }, [is_dirty, setBlocker, removeBlocker]);

  // 4. Handlers
  // Real-time update helper
  const update_live_pick = (changes: Partial<Pick>) => {
    if (!active_fight || !user || !current_event) return;

    set_event_picks(prev => {
      const current_pick = prev[active_fight.id] || {
        id: `pick_${user.id}_${active_fight.id}`,
        user_id: user.id || '',
        event_id: current_event.id,
        fight_id: active_fight.id,
        fighter_id: null,
        method: null,
        round: null,
        points_earned: 0
      };

      return {
        ...prev,
        [active_fight.id]: { ...current_pick, ...changes }
      };
    });
  };

  // 4. Handlers
  const handle_select_fighter = (fighter_id: string) => {
    if (is_locked) return;
    set_selected_winner_id(fighter_id);
    update_live_pick({ fighter_id });
  };

  const handle_select_method = (method: string) => {
    if (is_locked) return;
    set_selected_method(method as any);
    update_live_pick({ method: method as any });
  };

  const handle_select_round = (round: string) => {
    if (is_locked) return;
    set_selected_round(round);
    update_live_pick({ round });
  };

  // Success Logic Helper
  const handle_save_success = async (target_screen?: Screen) => {
    // CRITICAL: Fetch the TRUTH from server.
    // If backend ignored a locked pick, this will revert it in the UI.
    await refresh_picks();

    set_show_unsaved_modal(false);
    if (target_screen) {
      on_navigate(target_screen);
    } else {
      set_show_success_summary(true);
    }
  };

  const handle_final_submit = async (target_screen?: Screen) => {
    if (!user || !current_event || is_submitting) return false;

    // PRE-FLIGHT CHECK: Integrity Guard
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sessão expirada. Faça login novamente.");
      window.location.reload();
      return false;
    }

    set_is_submitting(true);

    // 1. Build Dirty Payload (Only changed items)
    const get_dirty_payload = (currentStates: Record<string, Pick>) => {
      return Object.values(currentStates).filter((pick: any) => {
        const original = original_picks[pick.fight_id];
        return is_pick_modified(pick, original);
      }).map((pick: any) => ({
        fight_id: pick.fight_id as string,
        fighter_id: pick.fighter_id as string,
        method: pick.method as any,
        round: pick.round as string,
        user_id: user.id || '',
        event_id: current_event.id
      }));
    };

    const initial_payload = get_dirty_payload(event_picks);

    if (initial_payload.length === 0) {
      set_show_unsaved_modal(false);
      if (target_screen) on_navigate(target_screen);
      set_is_submitting(false);
      return true;
    }

    try {
      // 1. ATTEMPT: Send batch
      await submit_picks_batch(initial_payload);

      // 2. VERIFICATION: Fetch fresh truth from server immediately
      // We need to know if the backend "Soft Skipped" any locked fight
      const fresh_picks = await get_picks_for_event(current_event.id);

      // 3. AUDIT: Compare what we sent vs what is now in DB
      const ignored_items = initial_payload.filter(attempted => {
        const saved = fresh_picks[attempted.fight_id];

        // If pick is missing OR key fields don't match, it was ignored/reverted
        return !saved ||
          saved.fighter_id !== attempted.fighter_id ||
          saved.method !== attempted.method ||
          saved.round !== attempted.round;
      });

      // 4. FEEDBACK: If backend ignored anything, tell the user WHY
      if (ignored_items.length > 0) {
        const ignored_names = ignored_items.map(p => {
          const f = current_fights.find(cf => cf.id === p.fight_id);
          if (f && f.fighter_a && f.fighter_b) {
            return `${f.fighter_a.name} x ${f.fighter_b.name}`;
          }
          // Fallback if data missing
          const index = f ? current_fights.indexOf(f) + 1 : '?';
          return `Luta ${index}`;
        }).join('\n- '); // New line for each fight

        alert(`⚠️ PALPITES PARCIALMENTE SALVOS\n\nAs seguintes lutas já estavam encerradas e suas alterações foram descartadas:\n\n- ${ignored_names}`);
      }

      // 5. SYNC UI
      set_event_picks(fresh_picks);
      set_original_picks(JSON.parse(JSON.stringify(fresh_picks)));

      // Update success state (skip internal re-fetch since we just did it)
      set_show_unsaved_modal(false);
      if (target_screen) {
        on_navigate(target_screen);
      } else {
        set_show_success_summary(true);
      }
      return true;

    } catch (error: any) {
      console.warn("Batch save failed. Switching to Serial Fallback...", error);
      const status = error.response?.status || 500;

      // FALLBACK: SERIAL RETRY (Save Valid Picks One-by-One)
      if (status === 400 || status === 403) {
        let saved_count = 0;

        // Loop through each dirty pick and try to save individually
        for (const pick of initial_payload) {
          try {
            // Send single-item batch
            await submit_picks_batch([pick]);
            saved_count++;
          } catch (innerError) {
            console.warn(`Skipping locked/invalid fight: ${pick.fight_id}`);
            // Ignore error, continue to next pick
          }
        }

        if (saved_count > 0) {
          alert(`Salvo com sucesso! (Ignoramos ${initial_payload.length - saved_count} lutas encerradas).`);
          handle_save_success(target_screen);
          setTimeout(() => window.location.reload(), 1500);
          return true;
        } else {
          alert("Não foi possível salvar. Todas as lutas selecionadas já encerraram.");
          window.location.reload();
          return false;
        }
      } else {
        alert("Erro de conexão. Tente novamente.");
      }
      return false;
    } finally {
      set_is_submitting(false);
    }
  };

  // Navigation Guard Interceptor
  const handle_safe_exit = (target: Screen) => {
    if (is_dirty) {
      set_pending_destination(target);
      set_show_unsaved_modal(true);
    } else {
      on_navigate(target);
    }
  };

  const handle_discard_and_navigate = () => {
    set_show_unsaved_modal(false);
    if (pending_destination) {
      on_navigate(pending_destination);
    }
  };

  // Progress Count Helper
  const picking_progress_count = completed_picks_count;

  const handle_confirm = async () => {
    // We allow handle_confirm to run even if is_locked to permit navigation
    if (!user) {
      alert("Você precisa estar logado para palpitar!");
      return;
    }

    // Only enforce mandatory picks if the fight is OPEN. 
    // If it's locked, we allow proceeding even with empty selection.
    if (!is_locked && (!selected_winner_id || !selected_method || !selected_round)) {
      alert("Por favor, preencha todas as etapas do palpite!");
      return;
    }

    if (!current_event || !active_fight) return;

    // 1. Current Pick Payload (Snake_Case)
    const current_pick_payload = {
      fight_id: active_fight.id,
      fighter_id: selected_winner_id,
      method: selected_method,
      round: selected_round,
      user_id: user.id,
      event_id: current_event.id
    };

    const current_index = current_fights.findIndex(f => f.id === active_fight_id);
    const is_last_fight = current_index === current_fights.length - 1;

    if (is_last_fight) {
      await handle_final_submit();
    } else {
      // Just Navigation now, as state is updated in real-time
      setTimeout(() => {
        const next_fight = current_fights[current_index + 1];
        set_active_fight_id(next_fight.id);
      }, 150);
    }
  };

  const handle_prev_fight = () => {
    if (!current_fights || !active_fight_id) return;
    const current_index = current_fights.findIndex(f => f.id === active_fight_id);
    if (current_index > 0) {
      set_active_fight_id(current_fights[current_index - 1].id);
    }
  };





  // 5. Conditional Renders (Guards) - Moved to bottom
  if (current_event && current_fights.length === 0 && !data_loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
        <div className="bg-white/5 p-6 rounded-full mb-4 animate-pulse">
          <span className="material-symbols-outlined text-4xl md:text-6xl text-gray-500">ring_volume</span>
        </div>
        <h2 className="text-xl md:text-3xl font-condensed font-bold uppercase text-white mb-2">Card em Definição</h2>
        <p className="text-gray-400 max-w-md text-sm md:text-base">
          As lutas deste evento ainda não foram liberadas para palpites. Volte em breve!
        </p>
        <button
          onClick={() => handle_safe_exit('events')}
          className="mt-8 px-6 py-3 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-lg uppercase font-bold tracking-widest transition-all"
        >
          Voltar para Eventos
        </button>
      </div>
    );
  }

  if (!current_event || !active_fight) {
    if (data_loading) {
      return (
        <div className="flex-1 flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-white">
        <p>Nenhuma luta encontrada.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background-dark">
      <div className="mx-auto max-w-7xl w-full flex flex-col lg:flex-row gap-2 md:gap-4 items-start justify-start h-full p-2 md:p-4 overflow-hidden pb-[85px] md:pb-4">

        {/* Main Selection Area */}
        <div className="w-full max-w-3xl flex flex-col gap-3 md:gap-6 flex-1 h-full overflow-hidden">
          {/* RESTORED RED HEADER STYLE & FIX NUMBERING */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 backdrop-blur-sm mb-2 rounded-t-2xl">
            {/* Left Side: Fight Indicator */}
            <div className="flex items-center gap-3">
              <span className="text-white font-black text-sm md:text-base tracking-widest uppercase">
                LUTA {(current_fights.length - current_fights.findIndex(f => f.id === active_fight_id)).toString().padStart(2, '0')}
              </span>
              <span className="text-white/20 text-xs">|</span>
              <span className="text-[#ce0e2d] font-black text-sm md:text-base tracking-widest drop-shadow-md uppercase">
                PALPITES {picks_done}/{current_fights.length}
              </span>
            </div>

            {/* Right Side: Status Indicator */}
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
              {is_locked ? '🔒 ENCERRADA' : '🟢 ABERTA'}
            </div>
          </div>

          {/* Fight Card Header */}
          <div className="flex flex-col rounded-2xl border border-border-dark bg-surface-dark shadow-2xl overflow-hidden ring-1 ring-white/5 flex-1 min-h-0 relative">

            {/* Live Stats Header (Power Bar) */}
            <div className="bg-black/80 backdrop-blur-md px-4 py-3 border-b border-white/5 flex flex-col gap-2 shadow-lg z-20 relative min-h-[60px] justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Palpites da Galera
                </span>
                <div className="flex items-center gap-2">
                  <span className="bg-surface-highlight px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-wider">
                    {current_event.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              </div>

              {(() => {
                const pct_a = active_fight.fighter_a_pick_pct ?? 0;
                const pct_b = active_fight.fighter_b_pick_pct ?? 0;
                const total = active_fight.total_picks ?? 0;
                const has_enough_data = total >= 5;

                if (!has_enough_data) {
                  return (
                    <div className="w-full h-4 bg-white/5 rounded-full flex items-center justify-center">
                      <span className="text-[9px] text-white/20 font-condensed uppercase tracking-widest">
                        Aguardando mais palpites...
                      </span>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Power Bar (Tug of War) */}
                    <div className="relative h-4 w-full bg-surface-highlight rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="h-full flex items-center justify-start pl-2 transition-all duration-700 bg-red-600"
                        style={{ width: `${pct_a}%` }}
                      >
                        <span className="text-[9px] font-black text-white drop-shadow-md leading-none">
                          {pct_a}%
                        </span>
                      </div>
                      <div
                        className="h-full flex items-center justify-end pr-2 transition-all duration-700 bg-blue-600"
                        style={{ width: `${pct_b}%` }}
                      >
                        <span className="text-[9px] font-black text-white drop-shadow-md leading-none">
                          {pct_b}%
                        </span>
                      </div>

                      {/* VS Marker */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-background-dark z-10 opacity-30"></div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* MITADA ALERT BANNER (New Element) */}
            {(() => {
              const total = active_fight.total_picks ?? 0;
              // RULE: Only show if we have significant data
              if (total < 5) return null;

              const pct_a = active_fight.fighter_a_pick_pct ?? 0;
              const pct_b = active_fight.fighter_b_pick_pct ?? 0;
              const mitada_a = pct_a <= 20;
              const mitada_b = pct_b <= 20;
              // Check if opportunity exists AND mitada is NOT selected
              const has_opportunity = (mitada_a || mitada_b);
              const is_mitada_selected = (mitada_a && selected_winner_id === fighter_a_id) || (mitada_b && selected_winner_id === fighter_b_id);

              if (has_opportunity && !is_mitada_selected) {
                return (
                  <div className="w-full bg-amber-500/90 py-1 flex items-center justify-center relative z-20 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    <span className="text-black font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm font-bold">local_fire_department</span>
                      🔥 Luta com chance de mitada | super azarão
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Fighters Visual */}
            <div className="grid grid-cols-2 gap-px relative h-40 md:h-56 flex-shrink-0 bg-border-dark/30">

              {/* is_locked reused from outer scope logic handled in next block for visual overlay */}

              {/* Dynamic Mitada Alert (Smart Three-Step) */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
                {(() => {
                  const total = active_fight.total_picks ?? 0;

                  // Default VS (Shown if locked, low data, or normal pick)
                  const DefaultVS = (
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black border-2 border-primary text-white font-black italic shadow-[0_0_15px_rgba(236,19,19,0.4)] text-[10px] md:text-sm">
                      VS
                    </div>
                  );

                  if (is_locked) {
                    return (
                      <div className="px-4 py-2 rounded-full bg-black/80 border border-white/20 backdrop-blur-md text-white font-condensed uppercase tracking-widest text-xs font-bold flex items-center gap-2 shadow-xl z-50">
                        <span className="material-symbols-outlined text-sm text-yellow-500">lock</span>
                        <span>Apostas Encerradas</span>
                      </div>
                    );
                  }

                  // RULE: Hide special badges if low data
                  if (total < 5) return DefaultVS;

                  const pct_a = active_fight.fighter_a_pick_pct ?? 0;
                  const pct_b = active_fight.fighter_b_pick_pct ?? 0;
                  const mitada_a = pct_a <= 20;
                  const mitada_b = pct_b <= 20;
                  const selected_mitada = (mitada_a && selected_winner_id === fighter_a_id) ||
                    (mitada_b && selected_winner_id === fighter_b_id);

                  if (selected_mitada) {
                    return (
                      <div className="transition-all duration-500 ease-out flex flex-col items-center justify-center z-[100] relative scale-110">
                        <div className="px-4 py-2 rounded-full flex flex-col items-center transition-all duration-500 relative overflow-hidden min-w-[150px] bg-green-600 animate-bounce shadow-[0_0_20px_rgba(22,163,74,0.6)] border-[3px] border-white">
                          <div className="flex items-center gap-1.5 relative z-10">
                            <span className="material-symbols-outlined text-base text-white">check_circle</span>
                            <span className="font-black uppercase italic tracking-widest text-xs leading-tight text-white drop-shadow-md">
                              AZARÃO SELECIONADO !
                            </span>
                          </div>
                          <div className="relative z-10 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-300">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white drop-shadow-md">
                              PODE VALER +90 PONTOS
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return DefaultVS;
                })()}
              </div>

              {/* Fighter A */}
              <div
                className={`relative group cursor-pointer overflow-hidden h-full`}
                onClick={() => handle_select_fighter(fighter_a_id)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10"></div>
                <div
                  className={`h-full w-full bg-cover bg-center bg-no-repeat transition-all duration-700 ${selected_winner_id === fighter_a.id ? 'scale-110 grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                  style={{ backgroundImage: `url('${fighter_a?.image_url || ''}')` }}
                ></div>
                <div className="absolute bottom-0 left-0 w-full p-2 z-10 flex flex-col items-center">
                  <h3 className="text-sm md:text-xl font-condensed font-black text-white text-center leading-none uppercase italic tracking-tighter truncate w-full px-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {fighter_a?.name?.split(' ').pop() || 'Lutador A'}
                  </h3>
                  {/* Mitada Badge A */}
                  {(active_fight.total_picks || 0) >= 5 && (active_fight.fighter_a_pick_pct || 0) <= 20 && (
                    <div className="bg-amber-500/90 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 mb-0.5 shadow-lg animate-pulse flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                      MITADA {active_fight.fighter_a_pick_pct}%
                    </div>
                  )}
                </div>
                {selected_winner_id === fighter_a_id && (
                  <div className="absolute inset-0 border-2 border-primary z-20 pointer-events-none opacity-100 shadow-[inset_0_0_20px_rgba(236,19,19,0.4)]">
                    <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-primary text-white rounded-full p-0.5 md:p-1 shadow-2xl animate-in zoom-in-50 duration-300">
                      <span className="material-symbols-outlined text-[10px] md:text-sm block font-bold">check</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fighter B */}
              <div
                className={`relative group cursor-pointer overflow-hidden h-full`}
                onClick={() => handle_select_fighter(fighter_b_id)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10"></div>
                <div
                  className={`h-full w-full bg-cover bg-center bg-no-repeat transition-all duration-700 ${selected_winner_id === fighter_b.id ? 'scale-110 grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                  style={{ backgroundImage: `url('${fighter_b?.image_url || ''}')` }}
                ></div>
                <div className="absolute bottom-0 left-0 w-full p-2 z-10 flex flex-col items-center">
                  <h3 className="text-sm md:text-xl font-condensed font-black text-white text-center leading-none uppercase italic tracking-tighter truncate w-full px-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {fighter_b?.name?.split(' ').pop() || 'Lutador B'}
                  </h3>
                  {/* Mitada Badge B */}
                  {(active_fight.total_picks || 0) >= 5 && (active_fight.fighter_b_pick_pct || 0) <= 20 && (
                    <div className="bg-amber-500/90 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 mb-0.5 shadow-lg animate-pulse flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                      MITADA {active_fight.fighter_b_pick_pct}%
                    </div>
                  )}
                </div>
                {selected_winner_id === fighter_b_id && (
                  <div className="absolute inset-0 border-2 border-primary z-20 pointer-events-none opacity-100 shadow-[inset_0_0_20px_rgba(236,19,19,0.4)]">
                    <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-primary text-white rounded-full p-0.5 md:p-1 shadow-2xl animate-in zoom-in-50 duration-300">
                      <span className="material-symbols-outlined text-[10px] md:text-sm block font-bold">check</span>
                    </div>
                  </div>
                )}
              </div>

              {is_locked && (
                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                  <span className="material-symbols-outlined text-4xl text-white/50 mb-2">lock</span>
                  <p className="text-white font-bold uppercase tracking-widest text-sm text-center">
                    {lock_info.reason === 'EVENT_CLOSED' ? 'Evento Fechado' :
                      lock_info.reason === 'FIGHT_CLOSED' ? 'Votação Encerrada' :
                        lock_info.reason === 'CASCADE' ? 'Fechamento Automático' : 'Bloqueado'}
                  </p>
                </div>
              )}
            </div>

            {/* Selection Steps */}
            <div className={`flex-1 overflow-hidden px-3 py-1.5 md:p-4 flex flex-col justify-evenly bg-surface-dark relative z-20 ${is_locked ? 'pointer-events-none opacity-50 grayscale' : ''}`}>
              <div className="absolute left-7 top-0 bottom-0 w-px border-l border-dashed border-border-dark hidden md:block opacity-20"></div>

              {/* Step 1: Winner */}
              <div className="flex flex-col gap-1.5 md:gap-2 relative md:pl-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-[10px] md:text-sm font-condensed font-black uppercase flex items-center gap-2 italic">
                    <span className={`flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full text-[8px] text-white transition-colors ${selected_winner_id ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>1</span>
                    <span>
                      Quem vence?
                      <span className="text-primary ml-1">
                        (+{active_fight.is_title ? '90' : active_fight.category === 'Main Event' ? '60' : '30'} pts)
                      </span>
                    </span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handle_select_fighter(fighter_a_id)}
                    className={`relative overflow-hidden rounded-xl py-4 border-2 transition-all active:scale-95 group ${selected_winner_id === fighter_a_id ? 'bg-primary border-primary shadow-[0_0_20px_rgba(236,19,19,0.3)]' : 'bg-[#1a0f0f] border-transparent hover:bg-[#2a1515] hover:border-primary/30'}`}
                  >
                    <span className={`font-condensed font-black uppercase text-sm md:text-lg italic leading-none tracking-tight block text-center ${selected_winner_id === fighter_a_id ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>{fighter_a?.name || 'Lutador A'}</span>
                  </button>
                  <button
                    onClick={() => handle_select_fighter(fighter_b_id)}
                    className={`relative overflow-hidden rounded-xl py-4 border-2 transition-all active:scale-95 group ${selected_winner_id === fighter_b_id ? 'bg-primary border-primary shadow-[0_0_20px_rgba(236,19,19,0.3)]' : 'bg-[#1a0f0f] border-transparent hover:bg-[#2a1515] hover:border-primary/30'}`}
                  >
                    <span className={`font-condensed font-black uppercase text-sm md:text-lg italic leading-none tracking-tight block text-center ${selected_winner_id === fighter_b_id ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>{fighter_b?.name || 'Lutador B'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Method */}
              <div className={`flex flex-col gap-1.5 md:gap-2 relative md:pl-8 transition-all duration-500 ${!selected_winner_id ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-[10px] md:text-sm font-condensed font-black uppercase flex items-center gap-2 italic">
                    <span className={`flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full text-[8px] text-white transition-colors ${selected_method ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>2</span>
                    <span>
                      Como vence?
                      <span className="text-primary ml-1">(+20 pts)</span>
                    </span>
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'KO/TKO', label: 'Knockout', icon: 'sports_kabaddi' },
                    { id: 'SUB', label: 'Finalização', icon: 'settings_accessibility' },
                    { id: 'DEC', label: 'Decisão', icon: 'gavel' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => handle_select_method(method.id)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 h-14 md:h-16 transition-all active:scale-95 group ${selected_method === method.id ? 'bg-primary border-primary shadow-neon' : 'bg-[#1a0f0f] border-transparent hover:bg-[#2a1515] hover:border-primary/30'}`}
                    >
                      <span className={`material-symbols-outlined text-xl md:text-2xl ${selected_method === method.id ? 'text-white' : 'text-text-muted group-hover:text-primary'}`}>{method.icon}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${selected_method === method.id ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Round */}
              <div className={`flex flex-col gap-1.5 md:gap-2 relative md:pl-8 transition-all duration-500 ${!selected_method ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-[10px] md:text-sm font-condensed font-black uppercase flex items-center gap-2 italic">
                    <span className={`flex items-center justify-center w-4 h-4 md:w-6 md:h-6 rounded-full text-[8px] text-white transition-colors ${selected_round ? 'bg-primary' : 'bg-surface-highlight border border-border-dark text-text-muted'}`}>3</span>
                    <span>
                      {selected_method === 'DEC' ? 'Qual tipo?' : 'Round?'}
                      <span className="text-primary ml-1">(+10 pts)</span>
                    </span>
                  </h4>
                </div>
                <div className={`grid gap-2 ${selected_method === 'DEC' ? 'grid-cols-3' : active_fight.rounds === 5 ? 'grid-cols-5' : 'grid-cols-3'}`}>
                  {selected_method === 'DEC' ? (
                    ['UNÂNIME', 'DIVIDIDA', 'MAJORIT.'].map((dec) => (
                      <button
                        key={dec}
                        onClick={() => handle_select_round(dec)}
                        className={`min-h-[36px] md:min-h-[44px] flex items-center justify-center rounded-xl border font-black text-[9px] tracking-tight transition-all active:scale-95 px-1 ${selected_round === dec ? 'bg-primary border-primary text-white shadow-neon' : 'bg-[#1a0f0f] border-transparent text-text-muted hover:border-primary/20 hover:text-white'}`}
                      >
                        {dec}
                      </button>
                    ))
                  ) : (
                    Array.from({ length: active_fight.rounds }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handle_select_round(`R${i + 1}`)}
                        className={`h-10 md:h-12 flex items-center justify-center rounded-xl border font-condensed font-black text-lg md:text-xl transition-all active:scale-95 ${selected_round === `R${i + 1}` ? 'bg-primary border-primary text-white shadow-neon' : 'bg-[#1a0f0f] border-transparent text-text-muted hover:border-primary/20'}`}
                      >
                        {i + 1}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Main Footer Action: NAVIGATION */}
            <div className="mt-2 md:mt-4 w-full z-30 flex gap-2">
              {/* BACK BUTTON */}
              {current_fights.findIndex(f => f.id === active_fight_id) > 0 && (
                <button
                  onClick={handle_prev_fight}
                  disabled={is_submitting}
                  className="w-14 md:w-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-white text-xl">arrow_back</span>
                </button>
              )}

              {/* DYNAMIC NEXT/SAVE BUTTON */}
              <button
                onClick={handle_confirm}
                disabled={is_submitting || (current_fights.findIndex(f => f.id === active_fight_id) !== current_fights.length - 1 && !is_locked && (!selected_winner_id || !selected_method || !selected_round))}
                className={`flex-1 rounded-2xl py-4 md:py-6 text-white font-condensed font-black text-xl md:text-2xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative z-30 ${is_submitting
                  ? 'bg-surface-highlight opacity-50 cursor-wait'
                  : (current_fights.findIndex(f => f.id === active_fight_id) === current_fights.length - 1 || is_locked || (selected_winner_id && selected_method && selected_round))
                    ? 'bg-primary hover:bg-primary-hover shadow-neon active:scale-[0.98]' // STANDARD RED for all active states
                    : 'bg-surface-highlight text-white/10 cursor-not-allowed' // Disabled state
                  }`}
              >
                {is_submitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>
                      {current_fights.findIndex(f => f.id === active_fight_id) === current_fights.length - 1
                        ? 'SALVAR E SAIR'
                        : 'PRÓXIMO'
                      }
                    </span>
                    {current_fights.findIndex(f => f.id === active_fight_id) === current_fights.length - 1 ? (
                      <span className="material-symbols-outlined font-black text-2xl">save</span>
                    ) : (
                      <span className="material-symbols-outlined font-black text-2xl">arrow_forward</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div >


          {/* Desktop-only Footer Button (Hidden on Mobile) */}
        </div>


        {/* Sidebar Fight List */}
        <aside className="hidden lg:flex w-72 h-full lg:h-[calc(100vh-100px)] overflow-hidden flex-col flex-shrink-0 lg:sticky lg:top-0">
          <Panel
            title="Card"
            icon="view_list"
            className="flex-1 flex flex-col overflow-hidden shadow-2xl border-white/5 bg-surface-dark/40 backdrop-blur-md"
            headerAction={
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full border border-primary/20 tracking-widest">
                {picks_done}/{current_fights.length}
              </span>
            }
          >
            <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1.5 custom-scrollbar pb-2">
              {current_fights.map((fight, i) => {
                if (!fight || !current_event) return null;
                const is_current = fight.id === active_fight_id;
                const has_pick = !!event_picks[fight.id];
                const fight_lock_info = safe_get_lock_status(current_event, fight);
                const is_fight_locked = fight_lock_info.status === 'LOCKED';

                return (
                  <div
                    key={fight.id}
                    onClick={() => set_active_fight_id(fight.id)}
                    className={`group cursor-pointer relative flex items-center gap-2 p-1.5 md:p-2 rounded-lg transition-all duration-300 ${is_current ? 'bg-primary/10 border border-primary ring-1 ring-white/5' : 'bg-surface-highlight/20 border border-white/5 hover:bg-surface-highlight/40'}`}
                  >
                    <div className={`flex items-center justify-center rounded-full p-1 transition-all ${has_pick ? 'text-green-500 bg-green-500/10' : (is_current ? 'text-primary bg-primary/20 animate-pulse' : 'text-white/20 bg-black/40')}`}>
                      {is_fight_locked && !has_pick ? (
                        <span className="material-symbols-outlined text-2xl md:text-3xl font-bold text-gray-500/50">lock</span>
                      ) : (
                        <span className="material-symbols-outlined text-[12px] md:text-base font-bold">
                          {has_pick ? 'check_circle' : (is_current ? 'sports_mma' : 'radio_button_unchecked')}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[6px] md:text-[7px] font-black uppercase tracking-tight ${is_current ? 'text-primary' : (has_pick ? 'text-green-500/70' : 'text-text-muted')}`}>
                        Luta {i + 1}
                      </p>
                      <p className={`text-[9px] md:text-[11px] font-condensed font-black leading-none truncate italic ${is_current ? 'text-white' : (has_pick ? 'text-white/80' : 'text-white/40')}`}>
                        {(fight.fighter_a?.name || 'Lutador A').split(' ').pop()} <span className="opacity-20 mx-0.5">VS</span> {(fight.fighter_b?.name || 'Lutador B').split(' ').pop()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </aside>







        {/* Navigation Guard Modal */}
        {/* FIGHT LIST BOTTOM SHEET - GRID LAYOUT */}
        {show_fight_list && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => set_show_fight_list(false)}></div>
            <div className="bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl p-6 w-full max-w-lg mx-auto relative z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl h-[70vh] flex flex-col">

              {/* Sheet Header */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-white text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">grid_view</span>
                  Visão Geral
                </h3>
                <button
                  onClick={() => set_show_fight_list(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-white text-xl">close</span>
                </button>
              </div>

              {/* Fight Grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {current_fights.map((fight, index) => {
                    const pick = event_picks[fight.id];
                    const is_done = !!pick;
                    const is_active = fight.id === active_fight_id;
                    const fight_lock = safe_get_lock_status(current_event, fight);
                    const is_locked = fight_lock.status === 'LOCKED';

                    // Determine Card Styles
                    let borderClass = 'border-white/10';
                    let bgClass = 'bg-white/5';
                    let textClass = 'text-white/40';

                    if (is_active) {
                      borderClass = 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
                      bgClass = 'bg-blue-500/10';
                      textClass = 'text-blue-400';
                    } else if (is_done) {
                      borderClass = 'border-green-500/50';
                      bgClass = 'bg-green-500/5';
                      textClass = 'text-green-400';
                    } else if (is_locked) {
                      bgClass = 'bg-black/40';
                    }

                    return (
                      <button
                        key={fight.id}
                        onClick={() => {
                          set_active_fight_id(fight.id);
                          set_show_fight_list(false);
                        }}
                        className={`aspect-[4/5] rounded-xl border flex flex-col items-center justify-center p-2 gap-2 relative group overflow-hidden transition-all active:scale-95 ${borderClass} ${bgClass}`}
                      >
                        {is_active && <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>}

                        <span className={`text-[10px] font-black uppercase absolute top-2 left-2 ${textClass}`}>#{index + 1}</span>

                        {is_locked && !is_done && (
                          <span className="material-symbols-outlined text-2xl text-white/20 absolute">lock</span>
                        )}

                        <div className="flex items-center justify-center w-full gap-1 mt-4">
                          {/* Avatars */}
                          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 overflow-hidden relative z-10">
                            <img src={fight.fighter_a?.image_url} className="w-full h-full object-cover grayscale opacity-70" alt="" />
                          </div>
                          <span className="text-[8px] font-black italic text-white/20">VS</span>
                          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 overflow-hidden relative z-10">
                            <img src={fight.fighter_b?.image_url} className="w-full h-full object-cover grayscale opacity-70" alt="" />
                          </div>
                        </div>

                        {/* Status Dot */}
                        <div className={`w-2 h-2 rounded-full absolute bottom-3 transition-colors ${is_done ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : (is_active ? 'bg-blue-500' : 'bg-white/10')}`}></div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Palpitado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Atual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Bloqueado</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {show_unsaved_modal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
                </div>
                <h3 className="text-xl font-condensed font-black text-white uppercase italic tracking-tighter mb-2">
                  Alterações não salvas
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Seus palpites ainda não foram salvos. Você preencheu <strong className="text-white">{picking_progress_count}</strong> de <strong className="text-white">{current_fights.length}</strong> palpites possíveis.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handle_final_submit(pending_destination || 'events')}
                    disabled={is_submitting}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-neon flex items-center justify-center gap-2"
                  >
                    {is_submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span>SALVAR E SAIR</span>
                        <span className="material-symbols-outlined text-lg">save</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handle_discard_and_navigate}
                    disabled={is_submitting}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95"
                  >
                    SAIR SEM SALVAR
                  </button>

                  <button
                    onClick={() => set_show_unsaved_modal(false)}
                    disabled={is_submitting}
                    className="mt-2 text-xs text-gray-400 hover:text-white font-bold uppercase tracking-widest transition-colors"
                  >
                    VOLTAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Overlay Logic */}
        {show_success_summary && current_event && (
          <SuccessOverlay
            event={current_event}
            fights={current_fights}
            picks={event_picks} // Use current state to reflect latest
            user={user}
            pendingDestination={pending_destination}
            onClose={() => set_show_success_summary(false)}
            onExit={(target: Screen) => {
              set_show_success_summary(false);
              // Explicitly remove blocker to allow safe exit via button
              removeBlocker();
              on_navigate(target);
            }}
          />
        )}

      </div>
    </div>

  );
};

export default Picks;
