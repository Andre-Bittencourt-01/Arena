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
        createFighter
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
                        <button onClick={navigateToCreate} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded font-bold uppercase tracking-wide flex items-center gap-2">
                            <span className="material-symbols-outlined">add_circle</span>
                            Novo Evento
                        </button>
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
            ) : (
                // EDIT VIEW
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
                                                        {fight.time && <span className="text-gray-600">{fight.round_end} - {fight.time}</span>}
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
