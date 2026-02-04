import React, { useRef, useEffect } from 'react';
import { BannerConfig, Event as UFCEvent } from '../../../frontend/src/types';

interface BannerPositionEditorProps {
    banner_url: string;
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
}

const BannerPositionEditor: React.FC<BannerPositionEditorProps> = ({
    banner_url,
    banner_settings,
    update_banner_setting,
    active_context,
    set_active_context,
    active_mode,
    set_active_mode
}) => {
    const viewport_ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = viewport_ref.current;
        if (!viewport) return;

        const handle_wheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const current_scale = banner_settings[active_context][active_mode].scale;
            const new_scale = Math.min(3, Math.max(0.5, parseFloat((current_scale + delta).toFixed(1))));
            update_banner_setting('scale', new_scale);
        };

        viewport.addEventListener('wheel', handle_wheel, { passive: false });
        return () => viewport.removeEventListener('wheel', handle_wheel);
    }, [banner_settings, active_context, active_mode, update_banner_setting]);

    const handle_banner_drag = (e: React.MouseEvent) => {
        e.preventDefault();
        const start_x = e.clientX;
        const start_y = e.clientY;
        const start_pos_x = banner_settings[active_context][active_mode].x;
        const start_pos_y = banner_settings[active_context][active_mode].y;

        const handle_mouse_move = (move_event: MouseEvent) => {
            const dx = move_event.clientX - start_x;
            const dy = move_event.clientY - start_y;
            const sensitivity = 0.2;

            const new_x = Math.min(100, Math.max(0, start_pos_x - (dx * sensitivity)));
            const new_y = Math.min(100, Math.max(0, start_pos_y - (dy * sensitivity)));

            update_banner_setting('x', parseFloat(new_x.toFixed(1)));
            update_banner_setting('y', parseFloat(new_y.toFixed(1)));
        };

        const handle_mouse_up = () => {
            document.removeEventListener('mousemove', handle_mouse_move);
            document.removeEventListener('mouseup', handle_mouse_up);
        };

        document.addEventListener('mousemove', handle_mouse_move);
        document.addEventListener('mouseup', handle_mouse_up);
    };

    if (!banner_url) return null;

    return (
        <div className="bg-surface-dark border border-white/5 rounded-lg p-6 mt-4 select-none">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">crop_free</span>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase leading-none">Ajuste Fino de Banner</h3>
                        <p className="text-[10px] text-gray-500 mt-1">Arraste para mover • Role para aumentar (Zoom)</p>
                    </div>
                </div>

                <div className="flex bg-black/40 rounded p-1 border border-white/10">
                    {(['dashboard', 'list', 'summary'] as const).map(ctx => (
                        <button
                            type="button"
                            key={ctx}
                            onClick={() => set_active_context(ctx)}
                            className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all ${active_context === ctx
                                ? 'bg-surface-highlight text-white shadow shadow-black/50'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {ctx === 'dashboard' && 'Hero (Topo)'}
                            {ctx === 'list' && 'Card (Lista)'}
                            {ctx === 'summary' && 'Detalhes'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    <div className="flex gap-4 border-b border-white/5 pb-4">
                        <button
                            type="button"
                            onClick={() => set_active_mode('desktop')}
                            className={`flex items-center gap-2 text-xs uppercase font-bold pb-2 border-b-2 transition-colors ${active_mode === 'desktop' ? 'text-white border-primary' : 'text-gray-600 border-transparent hover:text-gray-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">desktop_windows</span> Desktop
                        </button>
                        <button
                            type="button"
                            onClick={() => set_active_mode('mobile')}
                            className={`flex items-center gap-2 text-xs uppercase font-bold pb-2 border-b-2 transition-colors ${active_mode === 'mobile' ? 'text-white border-primary' : 'text-gray-600 border-transparent hover:text-gray-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">smartphone</span> Mobile
                        </button>
                    </div>

                    <div className="relative bg-[#0a0a0a] border border-white/10 rounded overflow-hidden flex items-center justify-center p-8 min-h-[400px]">
                        <div
                            ref={viewport_ref}
                            className={`relative overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-300 cursor-move group ${active_mode === 'desktop'
                                ? active_context === 'list' ? 'w-[300px] h-[400px]' : 'w-[480px] aspect-video'
                                : 'w-[200px] h-[350px]'
                                }`}
                            onMouseDown={handle_banner_drag}
                        >
                            <img
                                src={banner_url}
                                className="w-full h-full object-cover pointer-events-none will-change-transform"
                                style={{
                                    objectPosition: `${banner_settings[active_context][active_mode].x}% ${banner_settings[active_context][active_mode].y}%`,
                                    transform: `scale(${banner_settings[active_context][active_mode].scale})`
                                }}
                                alt="Editor Preview"
                            />
                            <div className="absolute inset-x-0 top-1/2 h-px bg-primary/50 dashed opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute inset-y-0 left-1/2 w-px bg-primary/50 dashed opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-64 space-y-6 pt-14">
                    <div className="bg-white/5 rounded p-4 space-y-4">
                        <h4 className="text-xs uppercase font-bold text-gray-400">Configurações Atuais</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Posição X</span>
                                <span className="text-white font-mono">{banner_settings[active_context][active_mode].x}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={banner_settings[active_context][active_mode].x}
                                onChange={(e) => update_banner_setting('x', parseFloat(e.target.value))}
                                className="w-full accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Posição Y</span>
                                <span className="text-white font-mono">{banner_settings[active_context][active_mode].y}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={banner_settings[active_context][active_mode].y}
                                onChange={(e) => update_banner_setting('y', parseFloat(e.target.value))}
                                className="w-full accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1 pt-2 border-t border-white/10">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Zoom (Scale)</span>
                                <span className="text-white font-mono">{banner_settings[active_context][active_mode].scale}x</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = banner_settings[active_context][active_mode].scale;
                                        update_banner_setting('scale', Math.max(0.5, parseFloat((current - 0.1).toFixed(1))));
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white"
                                >
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                </button>
                                <input
                                    type="range"
                                    min="0.5" max="3" step="0.1"
                                    value={banner_settings[active_context][active_mode].scale}
                                    onChange={(e) => update_banner_setting('scale', parseFloat(e.target.value))}
                                    className="flex-1 accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = banner_settings[active_context][active_mode].scale;
                                        update_banner_setting('scale', Math.min(3, parseFloat((current + 0.1).toFixed(1))));
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerPositionEditor;
