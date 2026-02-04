import React from 'react';

interface PanelProps {
    title: string;
    icon?: string;
    className?: string;
    children: React.ReactNode;
    headerAction?: React.ReactNode;
    subtitle?: string;
}

const Panel: React.FC<PanelProps> = ({
    title,
    icon,
    className = '',
    children,
    headerAction,
    subtitle
}) => {
    return (
        <div className={`bg-surface-dark border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
            <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-condensed text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        {icon && <span className={`material-symbols-outlined text-primary`}>{icon}</span>}
                        {title}
                    </h3>
                    {headerAction}
                </div>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {children}
            </div>
        </div>
    );
};

export default Panel;
