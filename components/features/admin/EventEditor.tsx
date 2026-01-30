import React from 'react';
import { BannerConfig, Event as UFCEvent } from '@/types';
import Panel from '../../Panel';
import BannerPositionEditor from './BannerPositionEditor';

interface EventEditorProps {
    isEditing: boolean;
    title: string; setTitle: (v: string) => void;
    subtitle: string; setSubtitle: (v: string) => void;

    // Date & Time
    startDate: string; setStartDate: (v: string) => void;
    startTime: string; setStartTime: (v: string) => void;
    endDate: string; setEndDate: (v: string) => void;
    endTime: string; setEndTime: (v: string) => void;

    location: string; setLocation: (v: string) => void;
    bannerUrl: string; setBannerUrl: (v: string) => void;

    // Banner Settings
    bannerSettings: {
        dashboard: { desktop: BannerConfig; mobile: BannerConfig };
        list: { desktop: BannerConfig; mobile: BannerConfig };
        summary: { desktop: BannerConfig; mobile: BannerConfig };
    };
    updateBannerSetting: (setting: keyof BannerConfig, value: number) => void;
    activeContext: keyof NonNullable<UFCEvent['banner_settings']>;
    setActiveContext: (ctx: keyof NonNullable<UFCEvent['banner_settings']>) => void;
    activeMode: 'desktop' | 'mobile';
    setActiveMode: (mode: 'desktop' | 'mobile') => void;

    // Locking
    eventLockStatus: 'open' | 'locked' | 'scheduled' | 'cascade';
    setEventLockStatus: (v: 'open' | 'locked' | 'scheduled' | 'cascade') => void;
    eventLockTime: string; setEventLockTime: (v: string) => void;
    cascadeStartTime: string; setCascadeStartTime: (v: string) => void;

    onSubmit: (e: React.FormEvent) => void;
}

const EventEditor: React.FC<EventEditorProps> = ({
    isEditing,
    title, setTitle, subtitle, setSubtitle,
    startDate, setStartDate, startTime, setStartTime,
    endDate, setEndDate, endTime, setEndTime,
    location, setLocation, bannerUrl, setBannerUrl,
    bannerSettings, updateBannerSetting, activeContext, setActiveContext, activeMode, setActiveMode,
    eventLockStatus, setEventLockStatus, eventLockTime, setEventLockTime, cascadeStartTime, setCascadeStartTime,
    onSubmit
}) => {

    // --- Internal Date/Time Logic (Moved from Admin.tsx) ---
    const updateEndDateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return;
        const start = new Date(`${dateStr}T${timeStr}`);
        const end = new Date(start.getTime() + 8 * 60 * 60 * 1000); // +8h

        // Handle invalid dates safe-guard
        if (isNaN(end.getTime())) return;

        const endDateStr = end.toISOString().split('T')[0];
        const endTimeStr = end.toTimeString().slice(0, 5); // HH:MM
        setEndDate(endDateStr);
        setEndTime(endTimeStr);
    };

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

    return (
        <Panel title="Informações do Evento" icon="info">
            <form onSubmit={onSubmit} className="p-4 space-y-4">
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

                {/* Advanced Banner Position Editor */}
                {bannerUrl && (
                    <BannerPositionEditor
                        bannerUrl={bannerUrl}
                        bannerSettings={bannerSettings}
                        updateBannerSetting={updateBannerSetting}
                        activeContext={activeContext}
                        setActiveContext={setActiveContext}
                        activeMode={activeMode}
                        setActiveMode={setActiveMode}
                    />
                )}

                {/* Locking Configuration */}
                <div className="pt-4 border-t border-white/10 mt-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">lock_clock</span>
                        Sistema de Travas (Palpites)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Status da Trava</label>
                            <select value={eventLockStatus} onChange={e => setEventLockStatus(e.target.value as any)} className="admin-input">
                                <option value="open">Aberto (Liberado)</option>
                                <option value="locked">Travado Total (Manual)</option>
                                <option value="scheduled">Agendado (Data/Hora)</option>
                                <option value="cascade">Cascata (Sequencial)</option>
                            </select>
                        </div>

                        {eventLockStatus === 'scheduled' && (
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Data/Hora Bloqueio</label>
                                <input
                                    type="datetime-local"
                                    value={eventLockTime}
                                    onChange={e => setEventLockTime(e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                        )}

                        {eventLockStatus === 'cascade' && (
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Início da Cascata (Luta #1)</label>
                                <input
                                    type="datetime-local"
                                    value={cascadeStartTime}
                                    onChange={e => setCascadeStartTime(e.target.value)}
                                    className="admin-input"
                                />
                                <p className="text-[10px] text-gray-500 mt-1 italic">Cada luta subsequente fechará 30min após a anterior baseada na Ordem.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold uppercase tracking-wide">
                        {isEditing ? 'Salvar Alterações' : 'Criar Evento'}
                    </button>
                </div>
            </form>
        </Panel>
    );
};

export default EventEditor;
