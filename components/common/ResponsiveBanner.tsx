import React from 'react';
import { Event } from '../../types';

interface ResponsiveBannerProps {
    event: Event;
    context: 'list' | 'dashboard' | 'summary';
    className?: string;
    overlayClassName?: string;
}

const ResponsiveBanner: React.FC<ResponsiveBannerProps> = ({
    event,
    context,
    className = '',
    overlayClassName = ''
}) => {
    const settings = event.banner_settings?.[context];

    const style = {
        '--pos-mobile': settings?.mobile ? `${settings.mobile.x}% ${settings.mobile.y}%` : (event.banner_position_mobile || '50% 20%'),
        '--pos-desktop': settings?.desktop ? `${settings.desktop.x}% ${settings.desktop.y}%` : (event.banner_position_desktop || '50% 50%'),
        '--scale-mobile': settings?.mobile?.scale || 1,
        '--scale-desktop': settings?.desktop?.scale || 1,
    } as React.CSSProperties;

    return (
        <>
            <img
                className={`w-full h-full object-cover transition-transform duration-700 banner-img-responsive ${className}`}
                src={event.banner_url}
                alt={event.title}
                style={style}
            />
            <div className={`absolute inset-0 ${overlayClassName}`}></div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .banner-img-responsive {
                        object-position: var(--pos-mobile);
                        transform: scale(var(--scale-mobile));
                    }
                    @media (min-width: 768px) {
                        .banner-img-responsive {
                            object-position: var(--pos-desktop) !important;
                            transform: scale(var(--scale-desktop)) !important;
                        }
                    }
                `
            }} />
        </>
    );
};

export default ResponsiveBanner;
