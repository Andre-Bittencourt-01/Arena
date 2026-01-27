import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import { useData } from '../contexts/DataContext';
import { FightCategory, WeightClass, Event as UFCEvent, Fight } from '../types';

// --- Helper Components ---

interface FighterFormProps {
    onSubmit: (e: React.FormEvent) => void;
    name: string; setName: (v: string) => void;
    nickname: string; setNickname: (v: string) => void;
    image: string; setImage: (v: string) => void;

    // Stats
    wins: string; setWins: (v: string) => void;
    losses: string; setLosses: (v: string) => void;
    draws: string; setDraws: (v: string) => void;
    nc: string; setNc: (v: string) => void;
}

const FighterForm: React.FC<FighterFormProps> = ({
    onSubmit, name, setName, nickname, setNickname, image, setImage,
    wins, setWins, losses, setLosses, draws, setDraws, nc, setNc
}) => (
    <form onSubmit={onSubmit} className="p-4 bg-black/40 rounded border border-white/10 space-y-3">
        <h3 className="text-xs uppercase font-bold text-gray-400 border-b border-white/10 pb-2">Cadastrar Novo Lutador</h3>
        <div className="grid grid-cols-2 gap-2">
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="admin-input" placeholder="Nome" required />
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="admin-input" placeholder="Apelido" />
        </div>

        <div className="grid grid-cols-4 gap-2">
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Vitórias</label>
                <input type="number" value={wins} onChange={e => setWins(e.target.value)} className="admin-input text-center" min="0" required />
            </div>
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Derrotas</label>
                <input type="number" value={losses} onChange={e => setLosses(e.target.value)} className="admin-input text-center" min="0" required />
            </div>
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Empates</label>
                <input type="number" value={draws} onChange={e => setDraws(e.target.value)} className="admin-input text-center" min="0" required />
            </div>
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">NC</label>
                <input type="number" value={nc} onChange={e => setNc(e.target.value)} className="admin-input text-center" min="0" required />
            </div>
        </div>

        <div>
            <input type="text" value={image} onChange={e => setImage(e.target.value)} className="admin-input" placeholder="URL Foto" required />
        </div>
        <button type="submit" className="w-full bg-surface-highlight hover:bg-white/20 text-white text-xs font-bold py-2 rounded uppercase">Cadastrar</button>
    </form>
);

const Admin: React.FC = () => {
    const {
        events,
        createEvent,
        updateEvent,
        deleteEvent,
        createFight,
        updateFight,
        deleteFight,
        getFightsForEvent,
        fighters,
        createFighter,
        getAllPicksForEvent,
        updatePick
    } = useData();

    // View Mode: 'list' or 'edit'
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');

    // Modal State
    const [isFighterModalOpen, setIsFighterModalOpen] = useState(false);
    const [pendingFighterSelect, setPendingFighterSelect] = useState<'fighter_a' | 'fighter_b' | null>(null);

    // Event Form State
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');

    // Split Date Time State
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    const [location, setLocation] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');

    // Fight Form State
    const [currentEventFights, setCurrentEventFights] = useState<Fight[]>([]);

    const [editingFightId, setEditingFightId] = useState<string | null>(null);
    const [fighter1Id, setFighter1Id] = useState('');
    const [fighter2Id, setFighter2Id] = useState('');
    const [category, setCategory] = useState<FightCategory>('Main Card');
    const [weightClass, setWeightClass] = useState<WeightClass>('Leve');
    const [rounds, setRounds] = useState(3);
    const [isTitle, setIsTitle] = useState(false);

    // New Fighter Form State (Detailed Stats)
    const [newFighterName, setNewFighterName] = useState('');
    const [newFighterNickname, setNewFighterNickname] = useState('');
    const [newFighterImage, setNewFighterImage] = useState('');

    const [newWins, setNewWins] = useState('0');
    const [newLosses, setNewLosses] = useState('0');
    const [newDraws, setNewDraws] = useState('0');
    const [newNc, setNewNc] = useState('0');

    useEffect(() => {
        const loadFights = async () => {
            if (editingEventId) {
                const fights = await getFightsForEvent(editingEventId);
                setCurrentEventFights(fights);
            } else {
                setCurrentEventFights([]);
            }
        };
        loadFights();
    }, [editingEventId, events]);

    // --- Date/Time Logic ---

    // Automatically calculate End Date/Time when Start changes
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        updateEndDateTime(newStartDate, startTime);
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartTime = e.target.value;
        setStartTime(newStartTime);
        updateEndDateTime(startDate, newStartTime);
    };

    const updateEndDateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return;

        // Create Date object from inputs
        const start = new Date(`${dateStr}T${timeStr}`);

        // Add 8 hours
        const end = new Date(start.getTime() + 8 * 60 * 60 * 1000); // +8h

        // Format back to YYYY-MM-DD and HH:MM
        const endDateStr = end.toISOString().split('T')[0];
        const endTimeStr = end.toTimeString().slice(0, 5); // HH:MM

        setEndDate(endDateStr);
        setEndTime(endTimeStr);
    };

    // --- Navigation ---

    const navigateToList = () => {
        setViewMode('list');
        setEditingEventId(null);
        resetEventForm();
    };

    const navigateToCreate = () => {
        setViewMode('edit');
        setEditingEventId(null);
        resetEventForm();
    };

    const navigateToEdit = (event: UFCEvent) => {
        setViewMode('edit');
        setEditingEventId(event.id);

        setTitle(event.title);
        setSubtitle(event.subtitle);

        const startDateTime = new Date(event.date);
        setStartDate(startDateTime.toISOString().split('T')[0]);
        setStartTime(startDateTime.toTimeString().slice(0, 5));

        if (event.end_date) {
            const endDateTime = new Date(event.end_date);
            setEndDate(endDateTime.toISOString().split('T')[0]);
            setEndTime(endDateTime.toTimeString().slice(0, 5));
        } else {
            // Fallback calculation if no end_date exists yet
            const endDateTime = new Date(startDateTime.getTime() + 8 * 60 * 60 * 1000);
            setEndDate(endDateTime.toISOString().split('T')[0]);
            setEndTime(endDateTime.toTimeString().slice(0, 5));
        }

        setLocation(event.location);
        setBannerUrl(event.banner_url);
    };

    const resetEventForm = () => {
        setTitle('');
        setSubtitle('');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setLocation('');
        setBannerUrl('');
    };

    // --- Event Handlers ---

    const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        const fullStartDate = `${startDate}T${startTime}:00`;
        const fullEndDate = `${endDate}T${endTime}:00`;

        const eventData = {
            title,
            subtitle,
            date: fullStartDate,
            end_date: fullEndDate,
            location,
            banner_url: bannerUrl,
            status: 'upcoming' as const
        };

        if (editingEventId) {
            await updateEvent({ ...eventData, id: editingEventId });
            alert('Evento atualizado!');
        } else {
            await createEvent(eventData);
            alert('Evento criado! Agora você pode editá-lo para adicionar lutas.');
            navigateToList();
        }
    };

    const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            await deleteEvent(id);
        }
    };

    // --- Fighter Handlers ---

    const handleCreateFighter = async (e: React.FormEvent) => {
        e.preventDefault();

        await createFighter({
            name: newFighterName,
            nickname: newFighterNickname,
            image_url: newFighterImage,
            wins: parseInt(newWins) || 0,
            losses: parseInt(newLosses) || 0,
            draws: parseInt(newDraws) || 0,
            nc: parseInt(newNc) || 0
        });

        // Reset inputs
        setNewFighterName(''); setNewFighterNickname(''); setNewFighterImage('');
        setNewWins('0'); setNewLosses('0'); setNewDraws('0'); setNewNc('0');

        if (isFighterModalOpen) {
            setIsFighterModalOpen(false);
        }

        alert('Lutador cadastrado!');
    };

    const handleFighterSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, target: 'fighter_a' | 'fighter_b') => {
        const value = e.target.value;
        if (value === 'NEW_FIGHTER') {
            setPendingFighterSelect(target);
            setIsFighterModalOpen(true);
        } else {
            if (target === 'fighter_a') setFighter1Id(value);
            else setFighter2Id(value);
        }
    };

    // --- Fight Handlers ---

    const handleCreateOrUpdateFight = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEventId || !fighter1Id || !fighter2Id) return;

        const fighterA = fighters.find(f => f.id === fighter1Id);
        const fighterB = fighters.find(f => f.id === fighter2Id);
        if (!fighterA || !fighterB) return;

        const fightData = {
            event_id: editingEventId,
            fighter_a_id: fighterA.id,
            fighter_b_id: fighterB.id,
            fighter_a: fighterA,
            fighter_b: fighterB,
            category,
            weight_class: weightClass,
            rounds,
            is_title: isTitle,
            points: 25
        };

        if (editingFightId) {
            await updateFight({ ...fightData, id: editingFightId });
            setEditingFightId(null);
            alert('Luta atualizada!');
        } else {
            await createFight({ ...fightData, id: '' });
            alert('Luta adicionada!');
        }

        // Reset inputs
        setFighter1Id(''); setFighter2Id(''); setEditingFightId(null);
        setIsTitle(false); setRounds(3);

        // Refresh
        const fights = await getFightsForEvent(editingEventId);
        setCurrentEventFights(fights);
    };

    const handleEditFight = (fight: Fight) => {
        setEditingFightId(fight.id);
        setFighter1Id(fight.fighter_a_id);
        setFighter2Id(fight.fighter_b_id);
        setCategory(fight.category);
        setWeightClass(fight.weight_class);
        setRounds(fight.rounds);
        setIsTitle(fight.is_title || false);
        document.getElementById('fight-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDeleteFight = async (id: string) => {
        if (confirm('Remover esta luta do card?')) {
            await deleteFight(id);
            if (editingEventId) {
                const fights = await getFightsForEvent(editingEventId);
                setCurrentEventFights(fights);
            }
        }
    };

    const handleCancelFightEdit = () => {
        setEditingFightId(null);
        setFighter1Id(''); setFighter2Id('');
        setIsTitle(false); setRounds(3);
    };

    // --- Picks Management State ---
    const [selectedEventForPicks, setSelectedEventForPicks] = useState<string>('');
    const [eventPicks, setEventPicks] = useState<any[]>([]);
    const [filteredPicks, setFilteredPicks] = useState<any[]>([]);
    const [loadingPicks, setLoadingPicks] = useState(false);

    // Filters
    const [selectedUserFilter, setSelectedUserFilter] = useState('');
    const [selectedFightFilter, setSelectedFightFilter] = useState('');

    // Editing
    const [editingPickId, setEditingPickId] = useState<string | null>(null);
    const [editPointsValue, setEditPointsValue] = useState<number>(0);
    const [editNoteValue, setEditNoteValue] = useState<string>('');

    const [fightsMap, setFightsMap] = useState<Record<string, Fight>>({});

    // Load Picks AND Fights to map names
    useEffect(() => {
        const loadPicksAndFights = async () => {
            if (selectedEventForPicks) {
                setLoadingPicks(true);
                try {
                    const [picks, fights] = await Promise.all([
                        getAllPicksForEvent(selectedEventForPicks),
                        getFightsForEvent(selectedEventForPicks)
                    ]);

                    setEventPicks(picks);
                    setFilteredPicks(picks);

                    // Create Fight ID -> Fight Object map
                    const mapping: Record<string, Fight> = {};
                    fights.forEach(f => {
                        mapping[f.id] = f;
                    });
                    setFightsMap(mapping);

                } catch (error) {
                    console.error("Error loading picks and fights:", error);
                } finally {
                    setLoadingPicks(false);
                }
            } else {
                setEventPicks([]);
                setFilteredPicks([]);
                setFightsMap({});
            }
        };
        loadPicksAndFights();
    }, [selectedEventForPicks, getAllPicksForEvent, getFightsForEvent]);

    // Apply Filters
    useEffect(() => {
        let result = eventPicks;

        if (selectedUserFilter) {
            result = result.filter(p => p.user_id === selectedUserFilter);
        }

        if (selectedFightFilter) {
            result = result.filter(p => p.fight_id === selectedFightFilter);
        }

        setFilteredPicks(result);
    }, [selectedUserFilter, selectedFightFilter, eventPicks]);

    // Unique Users for Dropdown
    const uniqueUsers = Array.from(new Set(eventPicks.map(p => p.user_id))).sort();

    // Unique Fights for Dropdown
    const uniqueFightIds = Array.from(new Set(eventPicks.map(p => p.fight_id))).sort();

    const handleUpdatePickPoints = async (pick: any) => {
        if (editPointsValue < 0) return;

        await updatePick({
            ...pick,
            points_earned: editPointsValue,
            admin_note: editNoteValue
        });

        // Update local state
        const updateList = (list: any[]) => list.map(p =>
            p.id === pick.id ? { ...p, points_earned: editPointsValue, admin_note: editNoteValue } : p
        );

        setEventPicks(prev => updateList(prev));
        // Filter will re-run automatically due to dependency on eventPicks, 
        // but we can also update immediate filtered state if needed.
        // setFilteredPicks(prev => updateList(prev)); 

        setEditingPickId(null);
    };

    const startEditing = (pick: any) => {
        setEditingPickId(pick.id);
        setEditPointsValue(pick.points_earned || 0);
        setEditNoteValue(pick.admin_note || '');
    };

    const navigateToPicks = () => {
        setViewMode('picks' as any);
        setEditingEventId(null);
        setSelectedUserFilter('');
        setSelectedFightFilter('');
    };

    // --- RENDER ---

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 font-display pb-32 relative">

            {/* Modal Overlay */}
            {isFighterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#121212] border border-white/20 rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsFighterModalOpen(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h2 className="text-xl font-condensed font-bold text-white uppercase mb-4">Adicionar Lutador Rápido</h2>
                        <FighterForm
                            onSubmit={handleCreateFighter}
                            name={newFighterName} setName={setNewFighterName}
                            nickname={newFighterNickname} setNickname={setNewFighterNickname}
                            wins={newWins} setWins={setNewWins}
                            losses={newLosses} setLosses={setNewLosses}
                            draws={newDraws} setDraws={setNewDraws}
                            nc={newNc} setNc={setNewNc}
                            image={newFighterImage} setImage={setNewFighterImage}
                        />
                    </div>
                </div>
            )}

            {/* View Switching */}
            {viewMode === 'list' ? (
                // LIST VIEW
                <>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-condensed font-bold text-white uppercase">Painel Administrativo</h1>
                        <div className="flex gap-2">
                            <button onClick={navigateToPicks} className="bg-surface-highlight hover:bg-white/20 text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
                                <span className="material-symbols-outlined">fact_check</span>
                                Gerenciar Palpites
                            </button>
                            <button onClick={navigateToCreate} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
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
                                        onClick={() => navigateToEdit(event)}
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
                                            <button onClick={(e) => handleDeleteEvent(event.id, e)} className="p-2 hover:bg-red-500/20 rounded-full text-red-500 transition-colors">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum evento encontrado.</p>}
                            </div>
                        </Panel>

                        <Panel title="Banco de Lutadores (Acesso Rápido)" icon="groups">
                            <div className="p-2 space-y-4">
                                <FighterForm
                                    onSubmit={handleCreateFighter}
                                    name={newFighterName} setName={setNewFighterName}
                                    nickname={newFighterNickname} setNickname={setNewFighterNickname}
                                    wins={newWins} setWins={setNewWins}
                                    losses={newLosses} setLosses={setNewLosses}
                                    draws={newDraws} setDraws={setNewDraws}
                                    nc={newNc} setNc={setNewNc}
                                    image={newFighterImage} setImage={setNewFighterImage}
                                />

                                <div className="h-[300px] overflow-y-auto grid grid-cols-2 gap-2">
                                    {fighters.map(fighter => (
                                        <div key={fighter.id} className="bg-white/5 p-2 rounded flex items-center gap-3 border border-white/5">
                                            <img src={fighter.image_url} className="w-8 h-8 rounded object-cover bg-black" />
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-white truncate">{fighter.name}</p>
                                                <p className="text-[10px] text-gray-500">
                                                    {fighter.wins}-{fighter.losses}-{fighter.draws} ({fighter.nc})
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Panel>
                    </div>
                </>
            ) : viewMode === 'picks' as any ? (
                // PICKS MANAGEMENT VIEW
                <>
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={navigateToList} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                        </button>
                        <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                            Gerenciamento de Palpites
                        </h1>
                    </div>

                    <Panel title="Corrigir Pontuações" icon="fact_check">
                        <div className="p-4 space-y-6">
                            {/* Event Selector */}
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Selecione o Evento</label>
                                <select
                                    value={selectedEventForPicks}
                                    onChange={e => setSelectedEventForPicks(e.target.value)}
                                    className="admin-input"
                                >
                                    <option value="">Selecione um evento...</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Bar */}
                            {selectedEventForPicks && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Filtrar por Usuário (Opcional)</label>
                                        <select
                                            value={selectedUserFilter}
                                            onChange={e => setSelectedUserFilter(e.target.value)}
                                            className="admin-input"
                                        >
                                            <option value="">Todos os Usuários</option>
                                            {uniqueUsers.map(userId => (
                                                <option key={userId} value={userId}>{userId}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Filtrar por Luta (Opcional)</label>
                                        <select
                                            value={selectedFightFilter}
                                            onChange={e => setSelectedFightFilter(e.target.value)}
                                            className="admin-input"
                                        >
                                            <option value="">Todas as Lutas</option>
                                            {uniqueFightIds.map(fightId => {
                                                const f = fightsMap[fightId];
                                                const label = f ? `${f.fighter_a.name} vs ${f.fighter_b.name}` : `Luta ID: ${fightId}`;
                                                return (
                                                    <option key={fightId} value={fightId}>
                                                        {label}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Fight Result Display Box */}
                            {selectedFightFilter && fightsMap[selectedFightFilter] && (
                                <div className="bg-white/5 border border-white/10 rounded p-4 mb-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Resultado da Luta</h4>
                                    {fightsMap[selectedFightFilter].winner_id ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Vencedor</p>
                                                <p className="text-primary font-bold text-lg">
                                                    {fighters.find(f => f.id === fightsMap[selectedFightFilter].winner_id)?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Método</p>
                                                <p className="text-white font-mono">{fightsMap[selectedFightFilter].method || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Round</p>
                                                <p className="text-white font-mono">{fightsMap[selectedFightFilter].round_end || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Tempo</p>
                                                <p className="text-white font-mono">{fightsMap[selectedFightFilter].time || '-'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-2 rounded">
                                            <span className="material-symbols-outlined">pending</span>
                                            <span className="font-bold uppercase text-sm">Luta ainda aguardando resultado</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Picks Table */}
                            {selectedEventForPicks && (
                                <div className="border border-white/10 rounded overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-xs text-gray-400 uppercase font-bold border-b border-white/10">
                                                <th className="p-3">Info / Categoria</th>
                                                <th className="p-3">Usuário</th>
                                                <th className="p-3">Luta (Palpite)</th>
                                                <th className="p-3">Método</th>
                                                <th className="p-3">Round</th>
                                                <th className="p-3 w-48">Pontos / Anotação</th>
                                                <th className="p-3 text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {loadingPicks ? (
                                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Carregando palpites...</td></tr>
                                            ) : filteredPicks.length === 0 ? (
                                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum palpite encontrado.</td></tr>
                                            ) : (
                                                filteredPicks.map(pick => {
                                                    const fight = fightsMap[pick.fight_id];
                                                    const hasResult = fight && !!fight.winner_id;

                                                    // Determine styles based on result
                                                    const getStyle = (isCorrect: boolean) => {
                                                        if (!hasResult) return 'text-gray-400';
                                                        return isCorrect ? 'text-green-500 font-bold' : 'text-red-500 line-through decoration-red-500/50';
                                                    };

                                                    // Strict Scoring Logic for Styles
                                                    const isFighterCorrect = hasResult && fight.winner_id === pick.fighter_id;

                                                    // Method is only correct IF fighter is correct AND method matches
                                                    const isMethodCorrect = isFighterCorrect && hasResult && fight.method?.includes(pick.method);

                                                    // Round is only correct IF Method is correct (dependency) AND round matches
                                                    let isRoundCorrect = false;
                                                    if (isMethodCorrect && hasResult) {
                                                        if (fight.method?.includes('DEC')) {
                                                            // For Decision, check if "Unanimous" or "Split" matches
                                                            isRoundCorrect = (fight.method?.includes(pick.round || '')) || false;
                                                        } else {
                                                            // For Finish, check exact Round number
                                                            isRoundCorrect = fight.round_end === pick.round;
                                                        }
                                                    }

                                                    return (
                                                        <tr key={pick.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="p-3 whitespace-nowrap">
                                                                <div className="flex flex-col gap-1">
                                                                    {fight && fight.is_title && (
                                                                        <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-fit flex items-center gap-1">
                                                                            <span className="material-symbols-outlined text-[10px]">emoji_events</span> Cinturão
                                                                        </span>
                                                                    )}
                                                                    {fight && fight.category === 'Main Event' && !fight.is_title && (
                                                                        <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-fit flex items-center gap-1">
                                                                            <span className="material-symbols-outlined text-[10px]">star</span> Main Event
                                                                        </span>
                                                                    )}
                                                                    {!fight?.is_title && fight?.category !== 'Main Event' && (
                                                                        <span className="text-gray-600 text-[10px] uppercase font-bold">{fight?.category || '-'}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-3 font-mono text-xs text-secondary-400 font-bold">{pick.user_id}</td>
                                                            <td className="p-3">
                                                                <div className="text-secondary-400 text-[10px] mb-0.5 uppercase tracking-wider font-bold">
                                                                    {fight ? `${fight.fighter_a.name} vs ${fight.fighter_b.name}` : pick.fight_id}
                                                                </div>
                                                                <div className={`font-bold text-lg ${getStyle(isFighterCorrect)}`}>{
                                                                    fighters.find(f => f.id === pick.fighter_id)?.name || pick.fighter_id
                                                                }</div>
                                                            </td>
                                                            <td className={`p-3 text-xs ${getStyle(isMethodCorrect)}`}>
                                                                {pick.method}
                                                            </td>
                                                            <td className={`p-3 text-xs ${getStyle(isRoundCorrect)}`}>
                                                                {pick.round}
                                                            </td>
                                                            <td className="p-3">
                                                                {editingPickId === pick.id ? (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] uppercase font-bold text-gray-500">Pts:</span>
                                                                            <input
                                                                                type="number"
                                                                                value={editPointsValue}
                                                                                onChange={e => setEditPointsValue(parseInt(e.target.value))}
                                                                                className="w-16 bg-black border border-primary text-white text-center p-1 rounded text-xs"
                                                                            />
                                                                        </div>
                                                                        <textarea
                                                                            value={editNoteValue}
                                                                            onChange={e => setEditNoteValue(e.target.value)}
                                                                            placeholder="Motivo da alteração..."
                                                                            className="w-full bg-black/50 border border-white/10 rounded p-1 text-xs text-white resize-none"
                                                                            rows={2}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="font-bold text-white text-lg">{pick.points_earned || 0}</div>
                                                                        {pick.admin_note && (
                                                                            <div className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1 py-0.5 rounded mt-1 inline-block">
                                                                                Nota: {pick.admin_note}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-3 text-center align-top pt-4">
                                                                {editingPickId === pick.id ? (
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button
                                                                            onClick={() => handleUpdatePickPoints(pick)}
                                                                            className="p-1 bg-green-500/20 text-green-500 rounded hover:bg-green-500/40"
                                                                            title="Salvar"
                                                                        >
                                                                            <span className="material-symbols-outlined !text-sm">check</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingPickId(null)}
                                                                            className="p-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/40"
                                                                            title="Cancelar"
                                                                        >
                                                                            <span className="material-symbols-outlined !text-sm">close</span>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => startEditing(pick)}
                                                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                                                        title="Editar Pontos"
                                                                    >
                                                                        <span className="material-symbols-outlined !text-sm">edit</span>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Panel>
                </>
            ) : (
                // EDIT VIEW (Existing code...)
                <>
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={navigateToList} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                        </button>
                        <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                            {editingEventId ? `Editando: ${title}` : 'Novo Evento'}
                        </h1>
                    </div>

                    <Panel title="Informações do Evento" icon="info">
                        <form onSubmit={handleCreateOrUpdateEvent} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Título</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="admin-input" placeholder="Ex: UFC 300" required />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Subtítulo</label>
                                    <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="admin-input" placeholder="Ex: Pereira vs Hill" required />
                                </div>
                            </div>

                            {/* Start Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-primary mb-1">Início do Evento</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={handleStartDateChange}
                                            className="admin-input"
                                            required
                                        />
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={handleStartTimeChange}
                                            className="admin-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Término (Padrão: +8h)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="admin-input text-gray-400"
                                            required
                                        />
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={e => setEndTime(e.target.value)}
                                            className="admin-input text-gray-400"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Local</label>
                                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="admin-input" placeholder="Las Vegas, NV" required />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-500 mb-1">URL do Banner</label>
                                    <input type="text" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="admin-input" placeholder="http://..." required />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/10">
                                <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold uppercase tracking-wide">
                                    {editingEventId ? 'Salvar Alterações' : 'Criar Evento'}
                                </button>
                            </div>
                        </form>
                    </Panel>

                    {editingEventId && (
                        <div className="space-y-6 pt-6 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-condensed font-bold text-white uppercase flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">sports_mma</span>
                                    Card de Lutas
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <Panel title={editingFightId ? "Editar Luta" : "Adicionar Luta"} icon={editingFightId ? "edit" : "playlist_add"} id="fight-form">
                                        <form onSubmit={handleCreateOrUpdateFight} className="p-4 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                                {/* Fighter 1 */}
                                                <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <h3 className="text-red-500 font-bold uppercase text-sm border-b border-white/10 pb-2 mb-2">Red Corner</h3>
                                                    <select
                                                        value={fighter1Id}
                                                        onChange={(e) => handleFighterSelectChange(e, 'fighter_a')}
                                                        className="admin-input"
                                                        required
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="NEW_FIGHTER" className="font-bold text-accent-green">+ Adicionar Novo Lutador</option>
                                                        <optgroup label="Lutadores Cadastrados">
                                                            {fighters.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                {/* VS */}
                                                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-black border border-white/20 rounded-full w-8 h-8 z-10 font-bold font-condensed text-white text-xs">VS</div>
                                                {/* Fighter 2 */}
                                                <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <h3 className="text-blue-500 font-bold uppercase text-sm border-b border-white/10 pb-2 mb-2">Blue Corner</h3>
                                                    <select
                                                        value={fighter2Id}
                                                        onChange={(e) => handleFighterSelectChange(e, 'fighter_b')}
                                                        className="admin-input"
                                                        required
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="NEW_FIGHTER" className="font-bold text-accent-green">+ Adicionar Novo Lutador</option>
                                                        <optgroup label="Lutadores Cadastrados">
                                                            {fighters.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                        </optgroup>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 bg-black/20 p-3 rounded-lg">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Categoria</label>
                                                    <select value={category} onChange={e => setCategory(e.target.value as any)} className="admin-input text-xs">
                                                        <option value="Main Event">Main Event</option>
                                                        <option value="Co-Main">Co-Main</option>
                                                        <option value="Main Card">Main Card</option>
                                                        <option value="Prelim">Prelim</option>
                                                        <option value="Early">Early</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Peso</label>
                                                    <select value={weightClass} onChange={e => setWeightClass(e.target.value as any)} className="admin-input text-xs">
                                                        <option value="Mosca">Mosca</option>
                                                        <option value="Galo">Galo</option>
                                                        <option value="Pena">Pena</option>
                                                        <option value="Leve">Leve</option>
                                                        <option value="Meio-Médio">Meio-Médio</option>
                                                        <option value="Médio">Médio</option>
                                                        <option value="M. Pesado">Meio-Pesado</option>
                                                        <option value="Pesado">Pesado</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Rounds</label>
                                                    <input type="number" value={rounds} onChange={e => setRounds(parseInt(e.target.value))} className="admin-input text-xs" min="3" max="5" step="2" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 bg-white/5 p-3 rounded border border-white/5">
                                                <input
                                                    type="checkbox"
                                                    id="isTitleCheck"
                                                    checked={isTitle}
                                                    onChange={e => setIsTitle(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-black/50"
                                                />
                                                <label htmlFor="isTitleCheck" className="text-xs font-bold text-white uppercase cursor-pointer select-none flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
                                                    Valendo Cinturão?
                                                </label>
                                            </div>

                                            <div className="flex gap-2">
                                                <button type="submit" className={`admin-btn-primary flex justify-center items-center gap-2 ${editingFightId ? 'bg-blue-600' : 'bg-green-600'}`}>
                                                    <span className="material-symbols-outlined">{editingFightId ? 'save' : 'add'}</span>
                                                    {editingFightId ? 'Salvar' : 'Adicionar'}
                                                </button>
                                                {editingFightId && (
                                                    <button type="button" onClick={handleCancelFightEdit} className="px-4 bg-gray-600 hover:bg-gray-500 text-white rounded font-bold uppercase text-xs">Cancelar</button>
                                                )}
                                            </div>
                                        </form>
                                    </Panel>
                                </div>

                                <div className="lg:col-span-1">
                                    <Panel title="Card Atual" icon="view_list" className="h-full">
                                        <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                                            {currentEventFights.map(fight => (
                                                <div key={fight.id} className="bg-white/5 border border-white/5 rounded p-3 relative group">
                                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 mb-2">
                                                        <span>{fight.category}</span>
                                                        <span>{fight.weight_class}</span>
                                                        {fight.is_title && <span className="text-yellow-500 flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">emoji_events</span> Belt</span>}
                                                        {fight.time && <span className="text-gray-600 border-l border-white/10 pl-2 ml-2">{fight.round_end} - {fight.time}</span>}
                                                    </div>
                                                    <div className="flex items-center justify-between gap-1 mb-2">
                                                        <span className={`text-xs font-bold truncate w-20 ${fight.winner_id === fight.fighter_a_id ? 'text-green-500' : 'text-white'}`}>
                                                            {fight.fighter_a.name.split(' ').pop()}
                                                            {fight.winner_id === fight.fighter_a_id && <span className="ml-1 text-[8px] align-top">🏆</span>}
                                                        </span>
                                                        <span className="text-[10px] text-primary font-bold">VS</span>
                                                        <span className={`text-xs font-bold truncate w-20 text-right ${fight.winner_id === fight.fighter_b_id ? 'text-green-500' : 'text-white'}`}>
                                                            {fight.winner_id === fight.fighter_b_id && <span className="mr-1 text-[8px] align-top">🏆</span>}
                                                            {fight.fighter_b.name.split(' ').pop()}
                                                        </span>
                                                    </div>

                                                    {/* Result Details Badge */}
                                                    {fight.result && (
                                                        <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                                                            <div className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${fight.result === 'win' ? 'bg-green-500/10 text-green-500' :
                                                                fight.result === 'draw' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                    'bg-gray-500/10 text-gray-400'
                                                                }`}>
                                                                {fight.result === 'win' ? 'Vitória' : fight.result === 'draw' ? 'Empate' : 'No Contest'}
                                                            </div>
                                                            <div className="text-[9px] text-gray-400 truncate max-w-[120px]">
                                                                {fight.method}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                        <button onClick={() => handleEditFight(fight)} className="text-blue-400 hover:text-white"><span className="material-symbols-outlined">edit</span></button>
                                                        <button onClick={() => handleDeleteFight(fight.id)} className="text-red-500 hover:text-white"><span className="material-symbols-outlined">delete</span></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <style>{`
                .admin-input { width: 100%; background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.25rem; padding: 0.5rem; color: white; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
                .admin-input:focus { border-color: #ec1313; }
                .admin-input option { background-color: #121212; color: white; }
                .admin-btn-primary { width: 100%; background-color: #ec1313; color: white; font-weight: bold; padding: 0.75rem; border-radius: 0.25rem; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.05em; transition: background-color 0.2s; }
                .admin-btn-primary:hover { background-color: #c91010; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                input[type="time"]::-webkit-calendar-picker-indicator,
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Admin;
