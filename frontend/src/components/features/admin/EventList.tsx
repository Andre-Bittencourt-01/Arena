import React from 'react';
import { Event as UFCEvent, Fighter } from '../../../types';
import Panel from '../../Panel';
import FighterBank from './FighterBank';

interface EventListProps {
    events: UFCEvent[];
    fighters: Fighter[];
    on_navigate_to_results: () => void;
    on_navigate_to_picks: () => void;
    on_navigate_to_create: () => void;
    on_navigate_to_edit: (event: UFCEvent) => void;
    on_delete_event: (id: string, e: React.MouseEvent) => void;

    // Fighter Form Props
    on_create_fighter: (e: React.FormEvent) => void;
    new_fighter_name: string; set_new_fighter_name: (v: string) => void;
    new_fighter_nickname: string; set_new_fighter_nickname: (v: string) => void;
    new_wins: string; set_new_wins: (v: string) => void;
    new_losses: string; set_losses: (v: string) => void;
    new_draws: string; set_draws: (v: string) => void;
    new_nc: string; set_nc: (v: string) => void;
    new_fighter_image: string; set_new_fighter_image: (v: string) => void;
}

const EventList: React.FC<EventListProps> = ({
    events, fighters,
    on_navigate_to_results, on_navigate_to_picks, on_navigate_to_create, on_navigate_to_edit, on_delete_event,
    on_create_fighter, new_fighter_name, set_new_fighter_name, new_fighter_nickname, set_new_fighter_nickname,
    new_wins, set_new_wins, new_losses, set_losses, new_draws, set_draws, new_nc, set_nc, new_fighter_image, set_new_fighter_image
}) => {
    return (
        <>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-condensed font-bold text-white uppercase">Painel Administrativo</h1>
                <div className="flex gap-2">
                    <button onClick={on_navigate_to_results} className="bg-surface-highlight hover:bg-white/20 text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
                        <span className="material-symbols-outlined">scoreboard</span>
                        Resultados
                    </button>
                    <button onClick={on_navigate_to_picks} className="bg-surface-highlight hover:bg-white/20 text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
                        <span className="material-symbols-outlined">fact_check</span>
                        Gerenciar Palpites
                    </button>
                    <button onClick={on_navigate_to_create} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
                        <span className="material-symbols-outlined">add_circle</span>
                        Novo Evento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Panel title="Eventos Cadastrados" icon="event_note">
                    <div className="p-2 space-y-2">
                        {events.map(event => (
                            <div
                                key={event.id}
                                className="p-4 rounded border bg-white/5 border-white/5 hover:border-white/20 flex justify-between items-center cursor-pointer group"
                                onClick={() => on_navigate_to_edit(event)}
                            >
                                <div>
                                    <h4 className="font-bold text-white text-lg">{event.title}</h4>
                                    <p className="text-sm text-gray-400">{event.subtitle}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${event.status === 'live' ? 'bg-red-500/20 text-red-500 animate-pulse' :
                                            event.status === 'completed' ? 'bg-white/5 text-gray-500' :
                                                'bg-green-500/10 text-green-500'
                                            }`}>
                                            {event.status === 'upcoming' && 'Próximos Eventos'}
                                            {event.status === 'live' && 'Ao Vivo'}
                                            {event.status === 'completed' && 'Eventos Passados'}
                                        </span>
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">
                                            {new Date(event.date).toLocaleDateString()}
                                        </span>
                                        {event.fights_count !== undefined && (
                                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">
                                                {event.fights_count} {event.fights_count === 1 ? 'Luta' : 'Lutas'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-gray-400">edit</span>
                                    <button onClick={(e) => on_delete_event(event.id, e)} className="p-2 hover:bg-red-500/20 rounded-full text-red-500 transition-colors">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {events.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum evento encontrado.</p>}
                    </div>
                </Panel>

                <FighterBank
                    fighters={fighters}
                    on_create_fighter={on_create_fighter}
                    new_fighter_name={new_fighter_name} set_new_fighter_name={set_new_fighter_name}
                    new_fighter_nickname={new_fighter_nickname} set_new_fighter_nickname={set_new_fighter_nickname}
                    new_wins={new_wins} set_new_wins={set_new_wins}
                    new_losses={new_losses} set_losses={set_losses}
                    new_draws={new_draws} set_draws={set_draws}
                    new_nc={new_nc} set_nc={set_nc}
                    new_fighter_image={new_fighter_image} set_new_fighter_image={set_new_fighter_image}
                />
            </div>
        </>
    );
};

export default EventList;
