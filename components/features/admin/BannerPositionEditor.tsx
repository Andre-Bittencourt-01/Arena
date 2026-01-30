import React, { useRef, useEffect } from 'react';
import { BannerConfig, Event as UFCEvent } from '@/types';

interface BannerPositionEditorProps {
    bannerUrl: string;
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
}

const BannerPositionEditor: React.FC<BannerPositionEditorProps> = ({
    bannerUrl,
    bannerSettings,
    updateBannerSetting,
    activeContext,
    setActiveContext,
    activeMode,
    setActiveMode
}) => {
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const currentScale = bannerSettings[activeContext][activeMode].scale;
            const newScale = Math.min(3, Math.max(0.5, parseFloat((currentScale + delta).toFixed(1))));
            updateBannerSetting('scale', newScale);
        };

        viewport.addEventListener('wheel', handleWheel, { passive: false });
        return () => viewport.removeEventListener('wheel', handleWheel);
    }, [bannerSettings, activeContext, activeMode, updateBannerSetting]);

    // --- Mouse Drag Logic for Banner ---
    const handleBannerDrag = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startPosX = bannerSettings[activeContext][activeMode].x;
        const startPosY = bannerSettings[activeContext][activeMode].y;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            // Sensitivity factor (slower for precision)
            const sensitivity = 0.2;

            const newX = Math.min(100, Math.max(0, startPosX - (dx * sensitivity)));
            const newY = Math.min(100, Math.max(0, startPosY - (dy * sensitivity)));

            updateBannerSetting('x', parseFloat(newX.toFixed(1)));
            updateBannerSetting('y', parseFloat(newY.toFixed(1)));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (!bannerUrl) return null;

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

                {/* Context Selector Tabs */}
                <div className="flex bg-black/40 rounded p-1 border border-white/10">
                    {(['dashboard', 'list', 'summary'] as const).map(ctx => (
                        <button
                            type="button"
                            key={ctx}
                            onClick={() => setActiveContext(ctx)}
                            className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all ${activeContext === ctx
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
                {/* Editor Area */}
                <div className="flex-1 space-y-4">
                    {/* Mode Toggle (Desktop/Mobile) */}
                    <div className="flex gap-4 border-b border-white/5 pb-4">
                        <button
                            type="button"
                            onClick={() => setActiveMode('desktop')}
                            className={`flex items-center gap-2 text-xs uppercase font-bold pb-2 border-b-2 transition-colors ${activeMode === 'desktop' ? 'text-white border-primary' : 'text-gray-600 border-transparent hover:text-gray-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">desktop_windows</span> Desktop
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveMode('mobile')}
                            className={`flex items-center gap-2 text-xs uppercase font-bold pb-2 border-b-2 transition-colors ${activeMode === 'mobile' ? 'text-white border-primary' : 'text-gray-600 border-transparent hover:text-gray-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">smartphone</span> Mobile
                        </button>
                    </div>

                    {/* The Viewport */}
                    <div className="relative bg-[#0a0a0a] border border-white/10 rounded overflow-hidden flex items-center justify-center p-8 min-h-[400px]">
                        {/* Simulated Container */}
                        <div
                            ref={viewportRef}
                            className={`relative overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-300 cursor-move group ${activeMode === 'desktop'
                                ? activeContext === 'list' ? 'w-[300px] h-[400px]' : 'w-[480px] aspect-video'
                                : 'w-[200px] h-[350px]'
                                }`}
                            onMouseDown={handleBannerDrag}
                        >
                            <img
                                src={bannerUrl}
                                className="w-full h-full object-cover pointer-events-none will-change-transform"
                                style={{
                                    objectPosition: `${bannerSettings[activeContext][activeMode].x}% ${bannerSettings[activeContext][activeMode].y}%`,
                                    transform: `scale(${bannerSettings[activeContext][activeMode].scale})`
                                }}
                                alt="Editor Preview"
                            />

                            {/* Grid Overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>

                            {/* Guidelines */}
                            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-x-0 top-1/2 h-px bg-primary/50 dashed"></div>
                                <div className="absolute inset-y-0 left-1/2 w-px bg-primary/50 dashed"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls / Stats Side */}
                <div className="w-full lg:w-64 space-y-6 pt-14">
                    <div className="bg-white/5 rounded p-4 space-y-4">
                        <h4 className="text-xs uppercase font-bold text-gray-400">Configurações Atuais</h4>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Posição X</span>
                                <span className="text-white font-mono">{bannerSettings[activeContext][activeMode].x}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={bannerSettings[activeContext][activeMode].x}
                                onChange={(e) => updateBannerSetting('x', parseFloat(e.target.value))}
                                className="w-full accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Posição Y</span>
                                <span className="text-white font-mono">{bannerSettings[activeContext][activeMode].y}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={bannerSettings[activeContext][activeMode].y}
                                onChange={(e) => updateBannerSetting('y', parseFloat(e.target.value))}
                                className="w-full accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-1 pt-2 border-t border-white/10">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Zoom (Scale)</span>
                                <span className="text-white font-mono">{bannerSettings[activeContext][activeMode].scale}x</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = bannerSettings[activeContext][activeMode].scale;
                                        updateBannerSetting('scale', Math.max(0.5, parseFloat((current - 0.1).toFixed(1))));
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white"
                                >
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                </button>
                                <input
                                    type="range"
                                    min="0.5" max="3" step="0.1"
                                    value={bannerSettings[activeContext][activeMode].scale}
                                    onChange={(e) => updateBannerSetting('scale', parseFloat(e.target.value))}
                                    className="flex-1 accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = bannerSettings[activeContext][activeMode].scale;
                                        updateBannerSetting('scale', Math.min(3, parseFloat((current + 0.1).toFixed(1))));
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                        </div>

                        <div className="text-[10px] text-gray-500 leading-relaxed">
                            <strong>Dica:</strong> Customize como o banner aparece em cada seção. O "Card (Lista)" usa um formato vertical no Desktop, enquanto "Hero" é wide.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerPositionEditor;
