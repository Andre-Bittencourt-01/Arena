import { Event } from '../types';

export type NormalizedStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

/**
 * Determina o status real do evento baseado no RELÓGIO.
 * Ignora o status textual do banco de dados se ele contradizer a data.
 */
export const getEventStatus = (event: Event): NormalizedStatus => {
    if (!event || !event.date) return 'COMPLETED'; // Fallback seguro

    const now = new Date().getTime();
    const start = new Date(event.date).getTime();

    // Calcula fim real ou assume 6h de duração
    const end = event.end_date
        ? new Date(event.end_date).getTime()
        : start + (6 * 60 * 60 * 1000);

    if (now > end) {
        return 'COMPLETED';
    } else if (now >= start && now <= end) {
        return 'LIVE';
    } else {
        return 'UPCOMING';
    }
};

/**
 * Helper para saber o prazo final real de apostas
 */
export const getEventEndTime = (event: Event): number => {
    const start = new Date(event.date).getTime();
    return event.end_date
        ? new Date(event.end_date).getTime()
        : start + (6 * 60 * 60 * 1000);
};
