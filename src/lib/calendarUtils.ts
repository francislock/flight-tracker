import { Flight } from '@/types/flight';

/**
 * Generates a Google Calendar link for a flight
 * @param flight - Flight object with all details
 * @returns Google Calendar URL
 */
export function generateGoogleCalendarLink(flight: Flight): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';

    // Format dates to Google Calendar format (YYYYMMDDTHHmmssZ)
    const formatDateForCalendar = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startTime = formatDateForCalendar(flight.origin.time);
    const endTime = formatDateForCalendar(flight.destination.time);

    // Create event title
    const title = `✈️ ${flight.flightNumber} - ${flight.airline}`;

    // Create location string
    const location = `${flight.origin.code} (${flight.origin.city}) → ${flight.destination.code} (${flight.destination.city})`;

    // Create detailed description
    const descriptionParts = [
        `Flight: ${flight.flightNumber}`,
        `Airline: ${flight.airline}`,
        `Status: ${flight.status}`,
        '',
        '📍 DEPARTURE',
        `Airport: ${flight.origin.city} (${flight.origin.code})`,
        `Time: ${new Date(flight.origin.time).toLocaleString()}`,
        `Timezone: ${flight.origin.timezone}`,
    ];

    if (flight.origin.terminal) {
        descriptionParts.push(`Terminal: ${flight.origin.terminal}`);
    }
    if (flight.origin.gate) {
        descriptionParts.push(`Gate: ${flight.origin.gate}`);
    }
    if (flight.origin.estimatedTime && flight.origin.estimatedTime !== flight.origin.time) {
        descriptionParts.push(`Estimated: ${new Date(flight.origin.estimatedTime).toLocaleString()}`);
    }
    if (flight.origin.delayMinutes && flight.origin.delayMinutes > 0) {
        descriptionParts.push(`⚠️ Delay: ${flight.origin.delayMinutes} minutes`);
    }

    descriptionParts.push(
        '',
        '🎯 ARRIVAL',
        `Airport: ${flight.destination.city} (${flight.destination.code})`,
        `Time: ${new Date(flight.destination.time).toLocaleString()}`,
        `Timezone: ${flight.destination.timezone}`,
    );

    if (flight.destination.terminal) {
        descriptionParts.push(`Terminal: ${flight.destination.terminal}`);
    }
    if (flight.destination.gate) {
        descriptionParts.push(`Gate: ${flight.destination.gate}`);
    }
    if (flight.destination.baggage) {
        descriptionParts.push(`Baggage: ${flight.destination.baggage}`);
    }
    if (flight.destination.estimatedTime && flight.destination.estimatedTime !== flight.destination.time) {
        descriptionParts.push(`Estimated: ${new Date(flight.destination.estimatedTime).toLocaleString()}`);
    }
    if (flight.destination.delayMinutes && flight.destination.delayMinutes > 0) {
        descriptionParts.push(`⚠️ Delay: ${flight.destination.delayMinutes} minutes`);
    }

    if (flight.aircraft) {
        descriptionParts.push('', `Aircraft: ${flight.aircraft.type}`);
    }

    const description = descriptionParts.join('\n');

    // Build URL parameters
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${startTime}/${endTime}`,
        details: description,
        location: location,
        trp: 'false', // Don't show guests
    });

    return `${baseUrl}?${params.toString()}`;
}
