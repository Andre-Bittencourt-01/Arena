
import React, { useState } from 'react';
import { Screen } from '../App';
import { useData } from '../contexts/DataContext';
import { Event } from '../types';

interface EventsProps {
  onNavigate: (screen: Screen) => void;
  onNavigateToResult: (eventId: string) => void;
}

const Events: React.FC<EventsProps> = ({ onNavigate, onNavigateToResult }) => {
  const { events, setCurrentEvent } = useData();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Filter and sort events
  const filteredEvents = events.filter(event => {
    if (activeTab === 'upcoming') {
      return event.status === 'upcoming' || event.status === 'live';
    } else {
      return event.status === 'completed';
    }
  }).sort((a, b) => {
    // Upcoming: Ascending status (Live first), then date. Past: Descending date.
    if (activeTab === 'upcoming') {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // Formatting helpers
  const getEventMonth = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
  const getEventDay = (dateStr: string) => new Date(dateStr).getDate();
  const getEventTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const getLocationCity = (loc: string) => loc.split(',')[0].toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 md:py-12 font-sans">
      <div className="flex flex-col gap-4 md:gap-8 mb-6 md:mb-10">
        <div>
          <h2 className="font-condensed text-3xl md:text-5xl text-white tracking-wide uppercase mb-1 md:mb-2">Calendário de Lutas</h2>
          <p className="text-gray-400 text-xs md:text-base">Selecione os eventos para realizados seus palpites ou ver resultados.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 border-b border-white/10 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 px-2 md:pb-4 md:px-4 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-colors border-b-2 shrink-0 ${activeTab === 'upcoming' ? 'text-white border-primary' : 'text-gray-500 border-transparent hover:text-white'}`}
          >
            Próximos
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 px-2 md:pb-4 md:px-4 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-colors border-b-2 shrink-0 ${activeTab === 'past' ? 'text-white border-primary' : 'text-gray-500 border-transparent hover:text-white'}`}
          >
            Passados
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <article
              key={event.id}
              className={`relative group overflow-hidden rounded-xl bg-surface-dark border border-white/5 transition-all duration-300 shadow-lg ${event.status === 'live' ? 'hover:border-yellow-500/30' :
                event.status === 'upcoming' ? 'hover:border-primary/50 hover:shadow-neon-sm' :
                  'opacity-80 hover:opacity-100'
                }`}
            >
              <div className="absolute inset-0 z-0">
                <img
                  className={`w-full h-full object-cover object-top transition-transform duration-700 ${event.status === 'completed' ? 'opacity-20 grayscale' :
                    event.status === 'live' ? 'opacity-30 mix-blend-luminosity group-hover:scale-105' :
                      'opacity-50 mix-blend-overlay group-hover:scale-105'
                    }`}
                  src={event.banner_url}
                  alt={event.title}
                />
                <div className={`absolute inset-0 bg-gradient-to-r from-background-dark to-transparent ${event.status === 'completed' ? 'via-background-dark/95' :
                  event.status === 'live' ? 'via-background-dark/80' :
                    'via-background-dark/90'
                  }`}></div>
              </div>

              <div className="relative z-10 p-4 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div className="flex-1 space-y-1.5 md:space-y-3">
                  {/* Status Badge */}
                  {event.status === 'live' && (
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                        <span className="w-1 h-1 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
                        AO VIVO
                      </span>
                    </div>
                  )}
                  {event.status === 'upcoming' && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 border border-primary/40 text-primary text-[8px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-neon-sm">
                      Palpites Abertos
                    </span>
                  )}
                  {event.status === 'completed' && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                      Finalizado
                    </span>
                  )}

                  <h3 className={`font-condensed text-2xl md:text-6xl leading-none tracking-tight ${event.status === 'completed' ? 'text-gray-300' : 'text-white'}`}>
                    {event.title}
                  </h3>
                  <p className="font-condensed text-base md:text-3xl text-gray-300 uppercase leading-none truncate max-w-[240px] md:max-w-none">
                    {event.subtitle.split(' vs ')[0]} <span className={`${event.status === 'live' ? 'text-yellow-500' : event.status === 'upcoming' ? 'text-primary' : 'text-gray-600'} font-bold`}>VS</span> {event.subtitle.split(' vs ')[1]}
                  </p>

                  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] md:text-sm font-medium mt-2 ${event.status === 'completed' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`material-symbols-outlined text-base md:text-lg ${event.status === 'live' ? 'text-yellow-500' : event.status === 'upcoming' ? 'text-primary' : 'text-gray-600'}`}>calendar_today</span>
                      {getEventDay(event.date)} {getEventMonth(event.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={`material-symbols-outlined text-base md:text-lg ${event.status === 'live' ? 'text-yellow-500' : event.status === 'upcoming' ? 'text-primary' : 'text-gray-600'}`}>location_on</span>
                      {getLocationCity(event.location)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (event.status === 'completed') {
                      onNavigateToResult(event.id);
                    } else {
                      setCurrentEvent(event);
                      onNavigate('picks');
                    }
                  }}
                  className={`w-full md:w-auto min-w-[140px] font-condensed font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${event.status === 'live' ? 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                    event.status === 'upcoming' ? 'bg-primary hover:bg-primary-dark text-white shadow-neon' :
                      'bg-transparent border border-white/20 hover:bg-white/5 text-white'
                    }`}
                >
                  <span className="text-sm md:text-base">{event.status === 'completed' ? 'Resultados' : event.status === 'live' ? 'Acompanhar' : 'Palpitar'}</span>
                  <span className="material-symbols-outlined text-lg md:text-xl">
                    {event.status === 'completed' ? 'visibility' : event.status === 'live' ? 'live_tv' : 'arrow_forward'}
                  </span>
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
            <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">event_busy</span>
            <p className="text-gray-500 font-condensed text-xl uppercase">Nenhum evento encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;