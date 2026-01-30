import React from 'react';
import { Event as UFCEvent, Fighter } from '@/types';
import Panel from '../../Panel';
import FighterBank from './FighterBank';

interface EventListProps {
    events: UFCEvent[];
    fighters: Fighter[];
    onNavigateToResults: () => void;
    onNavigateToPicks: () => void;
    onNavigateToCreate: () => void;
    onNavigateToEdit: (event: UFCEvent) => void;
    onDeleteEvent: (id: string, e: React.MouseEvent) => void;

    // Fighter Form Props (Pass-through to FighterBank)
    onCreateFighter: (e: React.FormEvent) => void;
    newFighterName: string; setNewFighterName: (v: string) => void;
    newFighterNickname: string; setNewFighterNickname: (v: string) => void;
    newWins: string; setNewWins: (v: string) => void;
    newLosses: string; setLosses: (v: string) => void;
    newDraws: string; setDraws: (v: string) => void;
    newNc: string; setNc: (v: string) => void;
    newFighterImage: string; setNewFighterImage: (v: string) => void;
}

const EventList: React.FC<EventListProps> = ({
    events, fighters,
    onNavigateToResults, onNavigateToPicks, onNavigateToCreate, onNavigateToEdit, onDeleteEvent,
    onCreateFighter, newFighterName, setNewFighterName, newFighterNickname, setNewFighterNickname,
    newWins, setNewWins, newLosses, setLosses, newDraws, setDraws, newNc, setNc, newFighterImage, setNewFighterImage
}) => {
    return (
        <>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-condensed font-bold text-white uppercase">Painel Administrativo</h1>
                <div className="flex gap-2">
                    <button onClick={onNavigateToResults} className="bg-surface-highlight hover:bg-white/20 text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
                        <span className="material-symbols-outlined">scoreboard</span>
                        Resultados
                    </button>
                    <button onClick={onNavigateToPicks} className="bg-surface-highlight hover:bg-white/20 text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
                        <span className="material-symbols-outlined">fact_check</span>
                        Gerenciar Palpites
                    </button>
                    <button onClick={onNavigateToCreate} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
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
                                onClick={() => onNavigateToEdit(event)}
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
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-gray-400">edit</span>
                                    <button onClick={(e) => onDeleteEvent(event.id, e)} className="p-2 hover:bg-red-500/20 rounded-full text-red-500 transition-colors">
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
                    onCreateFighter={onCreateFighter}
                    newFighterName={newFighterName} setNewFighterName={setNewFighterName}
                    newFighterNickname={newFighterNickname} setNewFighterNickname={setNewFighterNickname}
                    newWins={newWins} setNewWins={setNewWins}
                    newLosses={newLosses} setLosses={setLosses}
                    newDraws={newDraws} setDraws={setDraws}
                    newNc={newNc} setNc={setNc}
                    newFighterImage={newFighterImage} setNewFighterImage={setNewFighterImage}
                />
            </div>
        </>
    );
};

export default EventList;
