import React from 'react';
import { BannerConfig, Event as UFCEvent } from '../../../types';
import Panel from '../../Panel';
import BannerPositionEditor from './BannerPositionEditor';

interface EventEditorProps {
    is_editing: boolean;
    title: string; set_title: (v: string) => void;
    subtitle: string; set_subtitle: (v: string) => void;

    // Date & Time
    start_date: string; set_start_date: (v: string) => void;
    start_time: string; set_start_time: (v: string) => void;
    end_date: string; set_end_date: (v: string) => void;
    end_time: string; set_end_time: (v: string) => void;

    location: string; set_location: (v: string) => void;
    banner_url: string; set_banner_url: (v: string) => void;

    // Banner Settings
    banner_settings: {
        dashboard: { desktop: BannerConfig; mobile: BannerConfig };
        list: { desktop: BannerConfig; mobile: BannerConfig };
        summary: { desktop: BannerConfig; mobile: BannerConfig };
    };
    update_banner_setting: (setting: keyof BannerConfig, value: number) => void;
    active_context: keyof NonNullable<UFCEvent['banner_settings']>;
    set_active_context: (ctx: keyof NonNullable<UFCEvent['banner_settings']>) => void;
    active_mode: 'desktop' | 'mobile';
    set_active_mode: (mode: 'desktop' | 'mobile') => void;

    // Locking
    event_lock_status: 'open' | 'locked' | 'scheduled' | 'cascade';
    set_event_lock_status: (v: 'open' | 'locked' | 'scheduled' | 'cascade') => void;
    event_lock_time: string; set_event_lock_time: (v: string) => void;
    cascade_start_time: string; set_cascade_start_time: (v: string) => void;

    on_submit: (e: React.FormEvent) => void;
}

const EventEditor: React.FC<EventEditorProps> = ({
    is_editing,
    title, set_title, subtitle, set_subtitle,
    start_date, set_start_date, start_time, set_start_time,
    end_date, set_end_date, end_time, set_end_time,
    location, set_location, banner_url, set_banner_url,
    banner_settings, update_banner_setting, active_context, set_active_context, active_mode, set_active_mode,
    event_lock_status, set_event_lock_status, event_lock_time, set_event_lock_time, cascade_start_time, set_cascade_start_time,
    on_submit
}) => {

    const update_end_date_time = (date_str: string, time_str: string) => {
        if (!date_str || !time_str) return;
        const start = new Date(`${date_str}T${time_str}`);
        const end = new Date(start.getTime() + 8 * 60 * 60 * 1000); // +8h

        if (isNaN(end.getTime())) return;

        const end_date_str = end.toISOString().split('T')[0];
        const end_time_str = end.toTimeString().slice(0, 5); // HH:MM
        set_end_date(end_date_str);
        set_end_time(end_time_str);
    };

    const handle_start_date_change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const new_start_date = e.target.value;
        set_start_date(new_start_date);
        update_end_date_time(new_start_date, start_time);
    };

    const handle_start_time_change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const new_start_time = e.target.value;
        set_start_time(new_start_time);
        update_end_date_time(start_date, new_start_time);
    };

    return (
        <Panel title="Informações do Evento" icon="info">
            <form onSubmit={on_submit} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Título</label>
                        <input type="text" value={title} onChange={e => set_title(e.target.value)} className="admin-input" placeholder="Ex: UFC 300" required />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Subtítulo</label>
                        <input type="text" value={subtitle} onChange={e => set_subtitle(e.target.value)} className="admin-input" placeholder="Ex: Pereira vs Hill" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-primary mb-1">Início do Evento</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={start_date}
                                onChange={handle_start_date_change}
                                className="admin-input"
                                required
                            />
                            <input
                                type="time"
                                value={start_time}
                                onChange={handle_start_time_change}
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
                                value={end_date}
                                onChange={e => set_end_date(e.target.value)}
                                className="admin-input text-gray-400"
                                required
                            />
                            <input
                                type="time"
                                value={end_time}
                                onChange={e => set_end_time(e.target.value)}
                                className="admin-input text-gray-400"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Local</label>
                        <input type="text" value={location} onChange={e => set_location(e.target.value)} className="admin-input" placeholder="Las Vegas, NV" required />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-gray-500 mb-1">URL do Banner</label>
                        <input type="text" value={banner_url} onChange={e => set_banner_url(e.target.value)} className="admin-input" placeholder="http://..." required />
                    </div>
                </div>

                {banner_url && (
                    <BannerPositionEditor
                        banner_url={banner_url}
                        banner_settings={banner_settings}
                        update_banner_setting={update_banner_setting}
                        active_context={active_context}
                        set_active_context={set_active_context}
                        active_mode={active_mode}
                        set_active_mode={set_active_mode}
                    />
                )}

                <div className="pt-4 border-t border-white/10 mt-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">lock_clock</span>
                        Sistema de Travas (Palpites)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Status da Trava</label>
                            <select value={event_lock_status} onChange={e => set_event_lock_status(e.target.value as any)} className="admin-input">
                                <option value="open">Aberto (Liberado)</option>
                                <option value="locked">Travado Total (Manual)</option>
                                <option value="scheduled">Agendado (Data/Hora)</option>
                                <option value="cascade">Cascata (Sequencial)</option>
                            </select>
                        </div>

                        {event_lock_status === 'scheduled' && (
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Data/Hora Bloqueio</label>
                                <input
                                    type="datetime-local"
                                    value={event_lock_time}
                                    onChange={e => set_event_lock_time(e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                        )}

                        {event_lock_status === 'cascade' && (
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Início da Cascata (Luta #1)</label>
                                <input
                                    type="datetime-local"
                                    value={cascade_start_time}
                                    onChange={e => set_cascade_start_time(e.target.value)}
                                    className="admin-input"
                                />
                                <p className="text-[10px] text-gray-500 mt-1 italic">Cada luta subsequente fechará 30min após a anterior baseada na Ordem.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold uppercase tracking-wide">
                        {is_editing ? 'Salvar Alterações' : 'Criar Evento'}
                    </button>
                </div>
            </form>
        </Panel>
    );
};

export default EventEditor;
