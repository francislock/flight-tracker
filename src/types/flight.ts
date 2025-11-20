export interface Weather {
    temp: number;
    feelsLike: number;
    condition: string;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
}

export interface Location {
    code: string;
    city: string;
    time: string;
    timezone: string;
    terminal?: string;
    gate?: string;
    estimatedTime?: string;
    delayMinutes?: number;
    baggage?: string;
    weather?: Weather;
}

export interface Aircraft {
    type: string;
}

export interface Flight {
    flightNumber: string;
    airline: string;
    origin: Location;
    destination: Location;
    status: 'On Time' | 'Delayed' | 'Cancelled';
    aircraft?: Aircraft;
}
