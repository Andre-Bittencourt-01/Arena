import React, { useState, useEffect, useMemo } from 'react';
import { Screen } from '../App';
import Panel from '../components/Panel';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Fight, Pick, Event } from '../types';
import { get_content_lock_status } from '../services/MockDataService';

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

const Picks: React.FC<PicksProps> = ({ on_navigate }) => {
  const { user } = useAuth();
  const {
    current_event,
    current_fights,
    get_picks_for_event,
    submit_picks_batch,
    get_fights_for_event,
    loading: data_loading
  } = useData();

  // 1. All Hooks & State moved to top (Rules of Hooks Fix)
  const [active_fight_id, set_active_fight_id] = useState<string | null>(null);
  const [event_picks, set_event_picks] = useState<Record<string, Pick>>({});
  const [selected_winner_id, set_selected_winner_id] = useState<string | null>(null);
  const [selected_method, set_selected_method] = useState<'KO/TKO' | 'SUB' | 'DEC' | null>(null);
  const [selected_round, set_selected_round] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);
  const [is_card_drawer_open, set_is_card_drawer_open] = useState(false);

  // 2. Derived State & Memoization
  const active_fight = useMemo(() =>
    current_fights.find(f => f.id === active_fight_id) || null
    , [active_fight_id, current_fights]);

  const completed_picks_count = useMemo(() => Object.keys(event_picks).length, [event_picks]);
  const picks_done = completed_picks_count;

  const progress_percent = current_fights.length > 0 ? (completed_picks_count / current_fights.length) * 100 : 0;

  const lock_info = useMemo(() => {
    return safe_get_lock_status(current_event, active_fight);
  }, [current_event, active_fight]);

  const is_locked = lock_info.status === 'LOCKED';

  const has_closed_fights = current_event ? current_fights.some(f => {
    const info = safe_get_lock_status(current_event, f);
    return info.status === 'LOCKED';
  }) : false;

  const all_fights_closed = current_event ? current_fights.every(f => {
    const info = safe_get_lock_status(current_event, f);
    return info.status === 'LOCKED';
  }) : false;

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
    const load_picks = async () => {
      if (current_event) {
        set_active_fight_id(null);
        const picks = await get_picks_for_event(current_event.id);
        set_event_picks(picks);

        if (current_fights.length > 0 && current_fights[0].event_id === current_event.id) {
          const first_pending = current_fights.find(f => !picks[f.id]) || current_fights[0];
          set_active_fight_id(first_pending.id);
        }
      }
    };
    load_picks();
  }, [current_event, current_fights, get_picks_for_event]);

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

  // 4. Handlers
  const handle_select_fighter = (fighter_id: string) => {
    set_selected_winner_id(fighter_id);
  };

  const handle_final_submit = async () => {
    if (!user || !current_event || is_submitting) return;

    set_is_submitting(true);
    try {
      const picks_array = Object.values(event_picks).map((pick: any) => ({
        fight_id: pick.fight_id as string,
        fighter_id: pick.fighter_id as string,
        method: pick.method as any,
        round: pick.round as string,
        user_id: user.id || '',
        event_id: current_event.id
      }));

      await submit_picks_batch(picks_array);
      alert("Todos os seus palpites foram salvos!");
      on_navigate('story');
    } catch (error) {
      console.error("Failed to submit batch picks", error);
      alert("Erro ao enviar palpites. Tente novamente.");
    } finally {
      set_is_submitting(false);
    }
  };

  const handle_confirm = async () => {
    if (is_locked) return;
    if (!user) {
      alert("Você precisa estar logado para palpitar!");
      return;
    }

    if (!selected_winner_id || !selected_method || !selected_round) {
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
      set_is_submitting(true);
      try {
        const previous_picks_array = Object.values(event_picks)
          .filter((p: any) => !!p && p.fight_id !== active_fight.id)
          .map((p: any) => ({
            fight_id: p.fight_id as string,
            fighter_id: p.fighter_id as string,
            method: p.method as any,
            round: p.round as string,
            user_id: user.id || '',
            event_id: current_event.id
          }));

        const final_batch = [...previous_picks_array, current_pick_payload];
        await submit_picks_batch(final_batch);

        alert("Card Finalizado! Seus palpites foram salvos.");
        on_navigate('story');
      } catch (error) {
        console.error("Batch submission failed", error);
        alert("Erro ao salvar card. Tente novamente.");
      } finally {
        set_is_submitting(false);
      }
    } else {
      // Local Update
      const updated_pick: Pick = {
        id: event_picks[active_fight.id]?.id || `pick_${user.id}_${active_fight.id}`,
        user_id: user.id || '',
        event_id: current_event.id,
        fight_id: active_fight.id,
        fighter_id: selected_winner_id,
        method: selected_method,
        round: selected_round,
        points_earned: 0
      };

      set_event_picks(prev => ({ ...prev, [active_fight.id]: updated_pick }));

      setTimeout(() => {
        const next_fight = current_fights[current_index + 1];
        set_active_fight_id(next_fight.id);

        if (!event_picks[next_fight.id]) {
          set_selected_winner_id(null);
          set_selected_method(null);
          set_selected_round(null);
        }
      }, 150);
    }
  };

  // Safe accessors for rendering
  const fighter_a = active_fight?.fighter_a;
  const fighter_b = active_fight?.fighter_b;
  const fighter_a_id = active_fight?.fighter_a_id;
  const fighter_b_id = active_fight?.fighter_b_id;

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
          onClick={() => on_navigate('events')}
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
          <div className="flex items-end justify-between gap-4 flex-shrink-0 relative z-10 px-1">
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <h1 className="text-primary text-xl md:text-2xl font-black uppercase tracking-tighter italic drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                  PALPITES
                </h1>
                <span className="text-white text-xl md:text-2xl font-black italic tracking-tighter">
                  {picks_done}/{current_fights.length}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary shadow-[0_0_10px_rgba(236,19,19,0.5)] transition-all duration-700 ease-out"
                  style={{ width: `${progress_percent}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => set_is_card_drawer_open(true)}
              className="flex items-center gap-2 bg-[#2a0a0a] hover:bg-primary/20 border border-primary/30 text-primary rounded-xl px-3 py-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(236,19,19,0.1)] group max-h-[42px]"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">view_list</span>
              <div className="flex flex-col items-end leading-none">
                <span className="text-[8px] font-black uppercase tracking-wider text-primary/70">CARD</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-primary">COMPLETO</span>
              </div>
            </button>
          </div>

          {/* Fight Card Header */}
          <div className="flex flex-col rounded-2xl border border-border-dark bg-surface-dark shadow-2xl overflow-hidden ring-1 ring-white/5 flex-1 min-h-0">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 border-b border-white/5 flex items-center justify-between gap-2 shadow-lg z-20 relative">
              <div className="bg-surface-highlight px-2 py-0.5 rounded text-[10px] md:text-xs font-black text-white uppercase tracking-wider">
                {current_event.title.split(' ').slice(0, 2).join(' ')}
              </div>
              <p className="text-primary text-[10px] md:text-xs font-black uppercase tracking-widest animate-pulse">
                {active_fight.is_title ? 'DISPUTA DE CINTURÃO' : (active_fight.category || 'Fight')}
              </p>
              <h2 className="text-[10px] md:text-xs font-black text-white uppercase italic tracking-wider">
                {active_fight?.weight_class?.replace('Peso', '')?.trim() || 'Peso Combinado'}
              </h2>
            </div>

            {/* Fighters Visual */}
            <div className="grid grid-cols-2 gap-px relative h-40 md:h-56 flex-shrink-0 bg-border-dark/30">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="flex h-5 w-5 md:h-8 md:w-8 items-center justify-center rounded-full bg-black border-2 border-primary text-white font-black italic shadow-[0_0_15px_rgba(236,19,19,0.4)] text-[9px] md:text-sm">
                  VS
                </div>
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
                    Quem vence?
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
                    Como vence?
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
                      onClick={() => set_selected_method(method.id as any)}
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
                    {selected_method === 'DEC' ? 'Qual tipo?' : 'Round?'}
                  </h4>
                </div>
                <div className={`grid gap-2 ${selected_method === 'DEC' ? 'grid-cols-3' : active_fight.rounds === 5 ? 'grid-cols-5' : 'grid-cols-3'}`}>
                  {selected_method === 'DEC' ? (
                    ['UNÂNIME', 'DIVIDIDA', 'MAJORIT.'].map((dec) => (
                      <button
                        key={dec}
                        onClick={() => set_selected_round(dec)}
                        className={`min-h-[36px] md:min-h-[44px] flex items-center justify-center rounded-xl border font-black text-[9px] tracking-tight transition-all active:scale-95 px-1 ${selected_round === dec ? 'bg-primary border-primary text-white shadow-neon' : 'bg-[#1a0f0f] border-transparent text-text-muted hover:border-primary/20 hover:text-white'}`}
                      >
                        {dec}
                      </button>
                    ))
                  ) : (
                    Array.from({ length: active_fight.rounds }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => set_selected_round(`R${i + 1}`)}
                        className={`h-10 md:h-12 flex items-center justify-center rounded-xl border font-condensed font-black text-lg md:text-xl transition-all active:scale-95 ${selected_round === `R${i + 1}` ? 'bg-primary border-primary text-white shadow-neon' : 'bg-[#1a0f0f] border-transparent text-text-muted hover:border-primary/20'}`}
                      >
                        {i + 1}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Action Button - Moved into Flow */}
            <div className="mt-2 md:mt-4 w-full z-30">
              <button
                onClick={handle_confirm}
                disabled={!selected_winner_id || !selected_method || !selected_round || is_submitting || is_locked}
                className={`w-full rounded-2xl py-4 md:py-6 text-white font-condensed font-black text-xl md:text-2xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative z-30 ${is_locked ? 'bg-white/5 text-white/20 cursor-not-allowed border-none shadow-none' :
                  selected_winner_id && selected_method && selected_round
                    ? 'bg-primary hover:bg-primary-hover active:scale-[0.98] shadow-neon'
                    : 'bg-surface-highlight text-white/10 cursor-not-allowed'
                  }`}
              >
                {is_submitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    {is_locked ? (
                      <>
                        <span className="material-symbols-outlined font-black text-xl">lock</span>
                        <span>Palpites Encerrados</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {current_fights.findIndex(f => f.id === active_fight_id) === current_fights.length - 1
                            ? (event_picks[active_fight.id!] ? 'Atualizar & Finalizar' : 'Finalizar Card')
                            : (event_picks[active_fight.id!] ? 'Atualizar' : 'Confirmar')
                          }
                        </span>
                        <span className="material-symbols-outlined font-black text-xl">arrow_forward</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>


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

        {/* Mobile Fight Card Drawer */}
        {is_card_drawer_open && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-300 lg:hidden"
            onClick={() => set_is_card_drawer_open(false)}
          >
            <div
              className="absolute bottom-0 left-0 w-full bg-surface-dark border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500 max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />

              <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-condensed font-black text-white uppercase italic tracking-tighter">Card Completo</h3>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">{picks_done} de {current_fights.length} lutas palpitadas</p>
                </div>
                <button
                  onClick={() => set_is_card_drawer_open(false)}
                  className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div className="grid grid-cols-1 gap-2">
                  {current_fights.map((fight, i) => {
                    if (!fight) return null;
                    const is_current = fight.id === active_fight_id;
                    const has_pick = !!event_picks[fight.id];
                    const pick = event_picks[fight.id];
                    const selected_fighter = pick ? (fight.fighter_a_id === pick.fighter_id ? fight.fighter_a : fight.fighter_b) : null;

                    return (
                      <div
                        key={fight.id}
                        onClick={() => {
                          set_active_fight_id(fight.id);
                          set_is_card_drawer_open(false);
                        }}
                        className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${is_current ? 'bg-primary border-transparent shadow-[0_0_20px_rgba(236,19,19,0.3)]' : 'bg-surface-highlight/40 border border-white/5'}`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${is_current ? 'bg-white text-primary border-white' : (has_pick ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-black/40 text-white/20 border-white/10')}`}>
                          {has_pick ? (
                            <span className="material-symbols-outlined text-sm font-bold italic">check</span>
                          ) : (
                            <span className="text-[10px] font-black italic">{i + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${is_current ? 'text-white/70' : 'text-text-muted'}`}>
                            {fight.weight_class}
                          </p>
                          <div className={`text-base font-condensed font-black leading-none truncate italic ${is_current ? 'text-white' : 'text-white/90'}`}>
                            {(fight.fighter_a?.name || 'Lutador A').split(' ').pop()} <span className="opacity-40 italic font-black mx-1">VS</span> {(fight.fighter_b?.name || 'Lutador B').split(' ').pop()}
                          </div>
                          {has_pick && !is_current && (
                            <p className="text-[10px] text-green-500 font-bold uppercase mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 bg-green-500 rounded-full" />
                              {(selected_fighter?.name || 'Lutador').split(' ').pop()} por {pick.method}
                            </p>
                          )}
                        </div>

                        {is_current && (
                          <div className="text-white">
                            <span className="material-symbols-outlined animate-bounce-x">arrow_forward</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer (Standard Submit when viewing list) */}
              <div className="p-6 flex-shrink-0 bg-black/40 border-t border-white/10">
                <button
                  onClick={picks_done > 0 ? handle_final_submit : () => set_is_card_drawer_open(false)}
                  disabled={is_submitting}
                  className={`w-full py-4 text-white font-condensed font-black text-xl uppercase tracking-widest rounded-2xl shadow-neon transition-transform active:scale-95 ${picks_done === current_fights.length ? 'bg-primary' : 'bg-surface-highlight hover:bg-white/10'}`}
                >
                  {is_submitting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                  ) : (
                    picks_done === current_fights.length ? 'Enviar Palpites' :
                      picks_done > 0 ? `Enviar ${picks_done} Palpites` :
                        'Voltar e Completar'
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Partial Submit FAB */}
        {picks_done > 0 && !is_card_drawer_open && (
          <button
            onClick={() => set_is_card_drawer_open(true)}
            className="fixed bottom-[85px] right-6 h-14 w-14 bg-primary rounded-full shadow-neon flex items-center justify-center z-[100] animate-in zoom-in duration-300 hover:scale-110 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-white text-2xl font-bold">send</span>
          </button>
        )}



      </div>
    </div>

  );
};

export default Picks;
