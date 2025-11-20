'use client';

import { Weather } from '@/types/flight';

interface WeatherDisplayProps {
    weather: Weather;
    location: string;
}

export default function WeatherDisplay({ weather, location }: WeatherDisplayProps) {
    // Get emoji for weather condition
    const getWeatherEmoji = (icon: string) => {
        const iconMap: Record<string, string> = {
            '01d': '☀️', // clear sky day
            '01n': '🌙', // clear sky night
            '02d': '⛅', // few clouds day
            '02n': '☁️', // few clouds night
            '03d': '☁️', // scattered clouds
            '03n': '☁️',
            '04d': '☁️', // broken clouds
            '04n': '☁️',
            '09d': '🌧️', // shower rain
            '09n': '🌧️',
            '10d': '🌦️', // rain day
            '10n': '🌧️', // rain night
            '11d': '⛈️', // thunderstorm
            '11n': '⛈️',
            '13d': '❄️', // snow
            '13n': '❄️',
            '50d': '🌫️', // mist
            '50n': '🌫️',
        };
        return iconMap[icon] || '🌤️';
    };

    return (
        <div className="mt-3 p-3 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-3xl" role="img" aria-label={weather.condition}>
                        {getWeatherEmoji(weather.icon)}
                    </span>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {weather.temp}°F
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            {weather.description}
                        </div>
                    </div>
                </div>

                <div className="text-right text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Feels like {weather.feelsLike}°F</div>
                    <div>💧 {weather.humidity}%</div>
                    <div>💨 {weather.windSpeed} mph</div>
                </div>
            </div>
        </div>
    );
}
