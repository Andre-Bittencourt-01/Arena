export const getEventMonth = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

export const getEventMonthLong = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();

export const getEventDay = (dateStr: string) =>
    new Date(dateStr).getDate();

export const getEventTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const getLocationCity = (loc: string) =>
    loc.split(',')[0].toUpperCase();

export const formatTimeLeft = (targetDate: number) => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }
    return null;
};
