import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import { useData } from '../contexts/DataContext';
import { ApiDataService } from '../services/ApiDataService';
import { FightCategory, WeightClass, Event as UFCEvent, Fight, BannerConfig, Fighter } from '../types';

// --- Helper Components ---

import FighterForm from '../components/features/admin/FighterForm';
import EventList from '../components/features/admin/EventList';
import BannerPositionEditor from '../components/features/admin/BannerPositionEditor';
import EventEditor from '../components/features/admin/EventEditor';
import FightManager from '../components/features/admin/FightManager';
import ResultsManager from '../components/features/admin/ResultsManager';
import PicksManager from '../components/features/admin/PicksManager';
import { Screen } from '../App';

// --- Helper Components ---

interface AdminProps {
    onNavigate: (screen: Screen) => void;
}

const Admin: React.FC<AdminProps> = ({ onNavigate }) => {
    const {
        events,
        createEvent,
        updateEvent,
        deleteEvent,
        createFight,
        updateFight,
        deleteFight,
        getFightsForEvent,
        createFighter,
        getAllPicksForEvent,
        submitPick,
        getAdminEvents
    } = useData();

    // Local state for fighters to ensure dropdown population
    const [availableFighters, setAvailableFighters] = useState<Fighter[]>([]);
    const [isLoadingFighters, setIsLoadingFighters] = useState(false);

    useEffect(() => {
        const loadGlobalData = async () => {
            getAdminEvents();

            // Fetch fighters explicitly
            try {
                setIsLoadingFighters(true);
                const api = new ApiDataService();
                const fightersList = await api.getFighters();
                setAvailableFighters(fightersList);
            } catch (error) {
                console.error("Erro ao carregar lutadores:", error);
            } finally {
                setIsLoadingFighters(false);
            }
        };
        loadGlobalData();
    }, [getAdminEvents]);

    // View Mode: 'list' or 'edit' or 'picks' or 'results'
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'picks' | 'results'>('list');

    // Results Management State (Moved to component)
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

    // Event Locking State
    const [eventLockStatus, setEventLockStatus] = useState<'open' | 'locked' | 'scheduled' | 'cascade'>('open');
    const [eventLockTime, setEventLockTime] = useState('');
    const [cascadeStartTime, setCascadeStartTime] = useState('');

    const [currentEventFights, setCurrentEventFights] = useState<Fight[]>([]);

    // Shared Fighter Select State (used by FightManager and modal)
    const [fighter1Id, setFighter1Id] = useState('');
    const [fighter2Id, setFighter2Id] = useState('');

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
            let fights: Fight[] = [];
            if (editingEventId) {
                fights = await getFightsForEvent(editingEventId);
            }

            if (fights.length > 0) {
                // 1. Sort by Logical Hierarchy (Main Event Top, Prelims Bottom)
                const sortedFights = fights.sort((a, b) => {
                    // Priority 1: Category Rank
                    const categoryRank = {
                        'Main Event': 5,
                        'Co-Main Event': 4,
                        'Main Card': 3,
                        'Preliminares': 2,
                        'Early Prelims': 1
                    };
                    const rankA = categoryRank[a.category as keyof typeof categoryRank] || 0;
                    const rankB = categoryRank[b.category as keyof typeof categoryRank] || 0;
                    if (rankA !== rankB) return rankB - rankA; // Higher rank first

                    // Priority 2: Title Fight
                    if (a.is_title !== b.is_title) return (a.is_title ? 1 : 0) - (b.is_title ? 1 : 0) * -1; // Title first (actually logic: true > false)

                    // Priority 3: Order (fallback if already set correctly)
                    return (b.order || 0) - (a.order || 0);
                });

                // 2. Re-assign Order values to match this hierarchy (Top = Max Order = Closes Last)
                const total = sortedFights.length;
                const fightsWithCorrectOrder = sortedFights.map((f, index) => ({
                    ...f,
                    order: total - index
                }));

                setCurrentEventFights(fightsWithCorrectOrder);
            } else {
                setCurrentEventFights([]);
            }
        };
        loadFights();
    }, [editingEventId, viewMode, events]);

    // Banner Settings (Granular)
    const defaultBannerConfig = { x: 50, y: 50, scale: 1 };
    const [bannerSettings, setBannerSettings] = useState<{
        dashboard: { desktop: BannerConfig; mobile: BannerConfig };
        list: { desktop: BannerConfig; mobile: BannerConfig };
        summary: { desktop: BannerConfig; mobile: BannerConfig };
    }>({
        dashboard: { desktop: { ...defaultBannerConfig }, mobile: { ...defaultBannerConfig, y: 20 } },
        list: { desktop: { ...defaultBannerConfig }, mobile: { ...defaultBannerConfig, y: 20 } },
        summary: { desktop: { ...defaultBannerConfig }, mobile: { ...defaultBannerConfig, y: 20 } }
    });

    const [activeContext, setActiveContext] = useState<keyof NonNullable<UFCEvent['banner_settings']>>('dashboard');
    const [activeMode, setActiveMode] = useState<'desktop' | 'mobile'>('desktop');

    // --- Date/Time Logic ---



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

        // Banner Settings
        const banner = event.banner_settings || {};
        setBannerSettings({
            dashboard: {
                desktop: banner.dashboard?.desktop || { ...defaultBannerConfig },
                mobile: banner.dashboard?.mobile || { ...defaultBannerConfig, y: 20 }
            },
            list: {
                desktop: banner.list?.desktop || { ...defaultBannerConfig },
                mobile: banner.list?.mobile || { ...defaultBannerConfig, y: 20 }
            },
            summary: {
                desktop: banner.summary?.desktop || { ...defaultBannerConfig },
                mobile: banner.summary?.mobile || { ...defaultBannerConfig, y: 20 }
            }
        });

        setLocation(event.location);
        setBannerUrl(event.banner_url);

        // Locking Props
        setEventLockStatus(event.lock_status || 'open');
        setEventLockTime(event.lock_time || '');
        setCascadeStartTime(event.cascade_start_time || '');
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
        setBannerSettings({
            dashboard: { desktop: { ...defaultBannerConfig }, mobile: { ...defaultBannerConfig, y: 20 } },
            list: { desktop: { ...defaultBannerConfig }, mobile: { ...defaultBannerConfig, y: 20 } },
            summary: { desktop: { ...defaultBannerConfig }, mobile: { ...defaultBannerConfig, y: 20 } }
        });
        // Locking
        setEventLockStatus('open');
        setEventLockTime('');
        setCascadeStartTime('');
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
            status: 'upcoming' as const,
            // Locking
            lock_status: eventLockStatus,
            lock_time: eventLockTime,
            cascade_start_time: cascadeStartTime,
            banner_settings: bannerSettings,
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

        const newFighter = await createFighter({
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
            // Auto-select if requested
            if (pendingFighterSelect === 'fighter_a') setFighter1Id(newFighter.id);
            if (pendingFighterSelect === 'fighter_b') setFighter2Id(newFighter.id);
            setPendingFighterSelect(null);
        }

        alert('Lutador cadastrado!');
    };

    // Picks Management Logic (Moved to component)


    const navigateToPicks = () => {
        setViewMode('picks' as any);
        setEditingEventId(null);
    };

    const navigateToResults = () => {
        setViewMode('results');
        setEditingEventId(null);
    };

    const navigateToStory = () => {
        onNavigate('story');
    };

    const updateBannerSetting = (key: 'x' | 'y' | 'scale', value: number) => {
        setBannerSettings(prev => {
            const contextData = prev[activeContext] || {
                desktop: { ...defaultBannerConfig },
                mobile: { ...defaultBannerConfig, y: 20 }
            };
            const modeData = contextData[activeMode] || (activeMode === 'mobile' ? { ...defaultBannerConfig, y: 20 } : { ...defaultBannerConfig });

            return {
                ...prev,
                [activeContext]: {
                    ...contextData,
                    [activeMode]: {
                        ...modeData,
                        [key]: value
                    }
                }
            };
        });
    };

    // --- 🚨 INÍCIO DO CÓDIGO TEMPORÁRIO (APAGAR DEPOIS) ---
    const [seeding, setSeeding] = useState(false);

    // --- 🛠️ SCRIPT DE SEED (CORRIGIDO) ---
    // --- 🛠️ SCRIPT DE SEED (CORRIGIDO) ---
    // --- 🛠️ SCRIPT DE SEED (CORRIGIDO) ---
    const handleGenerateSeed = async () => {
        if (!confirm('Isso criará um evento de teste com 30 lutadores novos. Continuar?')) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Erro: Login necessário.');
            return;
        }

        setSeeding(true);
        const API_URL = 'http://localhost:3333';

        // ID único para o evento
        const UNIQUE_EVENT_ID = `evt_mega_${Date.now()}`;

        const adminFetch = async (endpoint: string, method: string, body?: any) => {
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`
            };
            const options: RequestInit = { method, headers };

            if (body) {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${API_URL}/admin${endpoint}`, options);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`${response.status} em ${endpoint}: ${text}`);
            }
            return response.json();
        };

        try {
            console.log(`🚀 Iniciando...`);

            // 1. CREATE EVENT
            await adminFetch('/events', 'POST', {
                id: UNIQUE_EVENT_ID,
                title: `UFC MEGA TEST ${new Date().toLocaleTimeString().slice(0, 5)}`,
                subtitle: "30 Lutadores • 15 Lutas",
                date: new Date(Date.now() + 172800000).toISOString(),
                location: "Las Vegas, NV",
                banner_url: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1600&q=80",
                status: "upcoming"
            });

            const fighterBaseNames = [
                "Jon Jones", "Stipe Miocic", "Alex Pereira", "Jamahal Hill", "Islam Makhachev",
                "Charles Oliveira", "Sean O'Malley", "Merab Dvalishvili", "Ilia Topuria", "Alex Volkanovski",
                "Leon Edwards", "Belal Muhammad", "Dricus Du Plessis", "Israel Adesanya", "Alexandre Pantoja",
                "Brandon Royval", "Sean Strickland", "Paulo Costa", "Gilbert Burns", "Jack Della Maddalena",
                "Justin Gaethje", "Max Holloway", "Dustin Poirier", "Benoit Saint Denis", "Robert Whittaker",
                "Khamzat Chimaev", "Shavkat Rakhmonov", "Colby Covington", "Kamaru Usman", "Conor McGregor"
            ];

            // 2. CREATE FIGHTERS & FIGHTS
            // Usamos um sufixo aleatório curto para garantir unicidade no Backend
            const suffix = Math.floor(Math.random() * 10000);

            for (let i = 0; i < 30; i += 2) {
                // Truque: Adiciona o sufixo ao nome para o Backend gerar IDs únicos (ex: jon_jones_4521)
                const nameA = `${fighterBaseNames[i]} ${suffix}`;
                const nameB = `${fighterBaseNames[i + 1]} ${suffix}`;

                // Cria Lutador A
                const fA = await adminFetch('/fighters', 'POST', {
                    name: nameA,
                    nickname: "Test",
                    image_url: `https://ui-avatars.com/api/?name=${fighterBaseNames[i].replace(' ', '+')}&background=0D8ABC&color=fff&size=512`,
                    wins: 10, losses: 2, draws: 0
                });

                // Cria Lutador B
                const fB = await adminFetch('/fighters', 'POST', {
                    name: nameB,
                    nickname: "Test",
                    image_url: `https://ui-avatars.com/api/?name=${fighterBaseNames[i + 1].replace(' ', '+')}&background=BC0D0D&color=fff&size=512`,
                    wins: 10, losses: 2, draws: 0
                });

                // Cria Luta
                await adminFetch('/fights', 'POST', {
                    event_id: UNIQUE_EVENT_ID,
                    fighter_a_id: fA.id, // O backend retorna o ID gerado (ex: jon_jones_4521)
                    fighter_b_id: fB.id,
                    category: i === 0 ? "Main Event" : (i < 10 ? "Main Card" : "Prelim"),
                    weight_class: "Leve",
                    rounds: 3,
                    status: "upcoming",
                    order: i + 1
                });

                console.log(`🥊 Luta ${i / 2 + 1} criada`);
            }

            alert('✅ AGORA VAI! Evento criado com sucesso.\n\nVolte para a Home.');
            window.location.href = '/';

        } catch (error: any) {
            console.error(error);
            alert(`Falha: ${error.message}`);
        } finally {
            setSeeding(false);
        }
    };


    // --- 🚨 FIM DO CÓDIGO TEMPORÁRIO ---

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

            {/* View Switching & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={navigateToList}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-neon-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Eventos
                    </button>
                    <button
                        onClick={navigateToPicks}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'picks' as any ? 'bg-primary text-white shadow-neon-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Palpites
                    </button>
                    <button
                        onClick={navigateToResults}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'results' ? 'bg-primary text-white shadow-neon-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Resultados
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* BOTÃO DE SEED */}
                    <button
                        onClick={handleGenerateSeed}
                        disabled={seeding}
                        className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 border border-yellow-500/50 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        {seeding ? 'Gerando...' : '⚡ Gerar Mega Card'}
                    </button>

                    <button
                        onClick={navigateToStory}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white/70 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">share</span>
                        📸 Testar Story Creator
                    </button>
                    <button
                        onClick={navigateToCreate}
                        className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded font-bold uppercase text-sm shadow-neon-sm transition-all active:scale-95"
                    >
                        Novo Evento
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            {viewMode === 'list' ? (
                // LIST VIEW
                <EventList
                    events={events}
                    fighters={availableFighters}
                    onNavigateToResults={navigateToResults}
                    onNavigateToPicks={navigateToPicks}
                    onNavigateToCreate={navigateToCreate}
                    onNavigateToEdit={navigateToEdit}
                    onDeleteEvent={handleDeleteEvent}
                    onCreateFighter={handleCreateFighter}
                    newFighterName={newFighterName} setNewFighterName={setNewFighterName}
                    newFighterNickname={newFighterNickname} setNewFighterNickname={setNewFighterNickname}
                    newWins={newWins} setNewWins={setNewWins}
                    newLosses={newLosses} setLosses={setNewLosses}
                    newDraws={newDraws} setDraws={setNewDraws}
                    newNc={newNc} setNc={setNewNc}
                    newFighterImage={newFighterImage} setNewFighterImage={setNewFighterImage}
                />
            ) : viewMode === 'picks' as any ? (
                <PicksManager
                    events={events}
                    fighters={availableFighters}
                    getAllPicksForEvent={getAllPicksForEvent}
                    getFightsForEvent={getFightsForEvent}
                    submitPick={submitPick}
                    onBack={navigateToList}
                />
            ) : viewMode === 'edit' ? (
                <>
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={navigateToList} className="flex items-center gap-1 text-gray-400 hover:text-white uppercase font-bold text-xs tracking-widest">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
                        </button>
                        <h1 className="text-3xl font-condensed font-bold text-white uppercase">
                            {editingEventId ? `Editando: ${title}` : 'Novo Evento'}
                        </h1>
                    </div>

                    <EventEditor
                        isEditing={!!editingEventId}
                        title={title} setTitle={setTitle}
                        subtitle={subtitle} setSubtitle={setSubtitle}
                        startDate={startDate} setStartDate={setStartDate}
                        startTime={startTime} setStartTime={setStartTime}
                        endDate={endDate} setEndDate={setEndDate}
                        endTime={endTime} setEndTime={setEndTime}
                        location={location} setLocation={setLocation}
                        bannerUrl={bannerUrl} setBannerUrl={setBannerUrl}
                        bannerSettings={bannerSettings}
                        updateBannerSetting={updateBannerSetting}
                        activeContext={activeContext}
                        setActiveContext={setActiveContext}
                        activeMode={activeMode}
                        setActiveMode={setActiveMode}
                        eventLockStatus={eventLockStatus}
                        setEventLockStatus={setEventLockStatus}
                        eventLockTime={eventLockTime}
                        setEventLockTime={setEventLockTime}
                        cascadeStartTime={cascadeStartTime}
                        setCascadeStartTime={setCascadeStartTime}
                        onSubmit={handleCreateOrUpdateEvent}
                    />

                    {editingEventId && (
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary">sports_mma</span>
                                <h2 className="text-xl font-condensed font-bold text-white uppercase tracking-wider">
                                    Card de Lutas
                                </h2>
                            </div>

                            <FightManager
                                editingEventId={editingEventId!}
                                fighters={availableFighters}
                                currentEventFights={currentEventFights}
                                setCurrentEventFights={setCurrentEventFights}
                                eventLockStatus={eventLockStatus}
                                cascadeStartTime={cascadeStartTime}
                                onOpenFighterModal={(target) => {
                                    setPendingFighterSelect(target);
                                    setIsFighterModalOpen(true);
                                }}
                                fighter1Id={fighter1Id}
                                setFighter1Id={setFighter1Id}
                                fighter2Id={fighter2Id}
                                setFighter2Id={setFighter2Id}
                            />
                        </div>
                    )}
                </>
            ) : viewMode === 'results' ? (
                <ResultsManager
                    events={events}
                    fighters={availableFighters}
                    getFightsForEvent={getFightsForEvent}
                    updateFight={updateFight}
                    onBack={navigateToList}
                />
            ) : null}

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
        </div >
    );
};

export default Admin;
