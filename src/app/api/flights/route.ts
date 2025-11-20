import { NextResponse } from 'next/server';
import { Flight } from '@/types/flight';

const API_KEY = process.env.AVIATION_API_KEY || '0e919ba0bdfcfbe1932ece043c864153';
const API_URL = 'https://api.aviationstack.com/v1/flights';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const flightNumber = searchParams.get('flightNumber');

    if (!flightNumber) {
        return NextResponse.json([]);
    }

    try {
        const url = `${API_URL}?access_key=${API_KEY}&flight_iata=${flightNumber}`;

        const response = await fetch(url, {
            next: { revalidate: 60 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`API Error Response: ${text}`);
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            return NextResponse.json([]);
        }

        const flights: Flight[] = data.data.map((apiFlight: any) => {
            // Map status
            let status: Flight['status'] = 'On Time';
            if (apiFlight.flight_status === 'cancelled') {
                status = 'Cancelled';
            } else if (
                apiFlight.departure.delay > 15 ||
                apiFlight.arrival.delay > 15 ||
                apiFlight.flight_status === 'incident' ||
                apiFlight.flight_status === 'diverted'
            ) {
                status = 'Delayed';
            }

            return {
                flightNumber: apiFlight.flight.iata,
                airline: apiFlight.airline.name,
                origin: {
                    code: apiFlight.departure.iata,
                    city: apiFlight.departure.airport,
                    time: apiFlight.departure.scheduled,
                    timezone: apiFlight.departure.timezone,
                    terminal: apiFlight.departure.terminal || undefined,
                    gate: apiFlight.departure.gate || undefined,
                    estimatedTime: apiFlight.departure.estimated || undefined,
                    delayMinutes: apiFlight.departure.delay || undefined,
                },
                destination: {
                    code: apiFlight.arrival.iata,
                    city: apiFlight.arrival.airport,
                    time: apiFlight.arrival.scheduled,
                    timezone: apiFlight.arrival.timezone,
                    terminal: apiFlight.arrival.terminal || undefined,
                    gate: apiFlight.arrival.gate || undefined,
                    baggage: apiFlight.arrival.baggage || undefined,
                    estimatedTime: apiFlight.arrival.estimated || undefined,
                    delayMinutes: apiFlight.arrival.delay || undefined,
                },
                status: status,
                aircraft: apiFlight.aircraft?.iata ? {
                    type: apiFlight.aircraft.iata
                } : undefined,
            };
        });

        return NextResponse.json(flights);

    } catch (error: any) {
        console.error('Error fetching flight data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch flight data' },
            { status: 500 }
        );
    }
}
