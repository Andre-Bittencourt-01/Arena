import React from 'react';
import { Event } from '../../../types';
import { Screen } from '../../../App';

interface EventHeaderProps {
    event: Event;
    onNavigate: (screen: Screen) => void;
    backLabel?: string;
    showStats?: React.ReactNode;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event, onNavigate, backLabel = "Voltar para Eventos", showStats }) => {
    return (
        <section className="relative w-full h-[220px] overflow-hidden bg-background-dark border-b border-white/5">
            <div className="absolute inset-0 bg-cover bg-center bg-[position:var(--pos-mobile)] md:bg-[position:var(--pos-desktop)] transition-transform duration-700 scale-[var(--scale-mobile)] md:scale-[var(--scale-desktop)]"
                style={{
                    backgroundImage: `url("${event.banner_url}")`,
                    '--pos-mobile': event.banner_settings?.summary?.mobile ? `${event.banner_settings.summary.mobile.x}% ${event.banner_settings.summary.mobile.y}%` : (event.banner_position_mobile || '50% 20%'),
                    '--pos-desktop': event.banner_settings?.summary?.desktop ? `${event.banner_settings.summary.desktop.x}% ${event.banner_settings.summary.desktop.y}%` : (event.banner_position_desktop || '50% 50%'),
                    '--scale-mobile': event.banner_settings?.summary?.mobile?.scale || 1,
                    '--scale-desktop': event.banner_settings?.summary?.desktop?.scale || 1,
                } as React.CSSProperties}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/60 to-transparent"></div>

            <div className="relative h-full flex flex-col justify-end pb-6 px-6 lg:px-8 max-w-[1600px] mx-auto">
                <button onClick={() => onNavigate('events')} className="text-gray-400 hover:text-white uppercase text-xs font-bold tracking-widest flex items-center gap-1 mb-4 w-fit transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> {backLabel}
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-xs">history</span>
                            Evento Finalizado
                        </div>
                        <h1 className="text-4xl md:text-5xl font-condensed font-bold text-white leading-none uppercase italic">
                            {event.title}
                        </h1>
                        <p className="text-gray-400 font-condensed uppercase tracking-wide text-sm">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                    </div>

                    {showStats && (
                        <div className="flex gap-4">
                            {showStats}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default EventHeader;
