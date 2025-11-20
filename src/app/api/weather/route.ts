import { NextResponse } from 'next/server';

const API_KEY = process.env.WEATHER_API_KEY || 'efefd246c7e49fcec2ed4e419ee321a4';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json(
            { error: 'Latitude and longitude are required' },
            { status: 400 }
        );
    }

    try {
        const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

        const response = await fetch(url, {
            next: { revalidate: 1800 }, // Cache for 30 minutes
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 401) {
                console.log('Weather API key not activated yet. This is normal for new API keys and can take up to 2 hours.');
                return NextResponse.json(
                    { error: 'API key pending activation' },
                    { status: 401 }
                );
            }

            throw new Error(`Weather API responded with status: ${response.status}`);
        }

        const data = await response.json();

        const weather = {
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed),
            pressure: data.main.pressure,
        };

        return NextResponse.json(weather);

    } catch (error: any) {
        console.error('Error fetching weather data:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch weather data' },
            { status: 500 }
        );
    }
}
