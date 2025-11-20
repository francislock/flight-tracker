'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Flight, Weather } from '@/types/flight';
import WeatherDisplay from './WeatherDisplay';
import { generateGoogleCalendarLink } from '@/lib/calendarUtils';

// Dynamically import FlightMap to avoid SSR issues with Leaflet
const FlightMap = dynamic(() => import('./FlightMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
        </div>
    ),
});

interface FlightResultsProps {
    flights: Flight[];
}


function FlightCard({ flight }: { flight: Flight }) {
    const [showMap, setShowMap] = useState(false);
    const [originWeather, setOriginWeather] = useState<Weather | null>(null);
    const [destinationWeather, setDestinationWeather] = useState<Weather | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
            setWeatherLoading(true);
            try {
                // Import mapUtils to get coordinates
                const { getAirportCoordinates } = await import('@/lib/mapUtils');

                const originCoords = getAirportCoordinates(flight.origin.code);
                const destCoords = getAirportCoordinates(flight.destination.code);

                // Fetch weather for origin
                if (originCoords) {
                    const originRes = await fetch(`/api/weather?lat=${originCoords[0]}&lon=${originCoords[1]}`);
                    if (originRes.ok) {
                        const data = await originRes.json();
                        setOriginWeather(data);
                    }
                }

                // Fetch weather for destination
                if (destCoords) {
                    const destRes = await fetch(`/api/weather?lat=${destCoords[0]}&lon=${destCoords[1]}`);
                    if (destRes.ok) {
                        const data = await destRes.json();
                        setDestinationWeather(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching weather:', error);
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, [flight.origin.code, flight.destination.code]);

    const calendarLink = generateGoogleCalendarLink(flight);

    return (
        <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block no-underline"
        >
            <div
                className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{flight.airline}</h3>
                        <p className="text-sm text-gray-500 font-mono">{flight.flightNumber}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${flight.status === 'On Time' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {flight.status}
                    </span>
                </div>

                <div className="flex justify-between items-start relative">
                    {/* Origin */}
                    <div className="text-left flex-1">
                        <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">{flight.origin.code}</div>
                        <div className="text-sm text-gray-500 font-medium">{flight.origin.city}</div>

                        {/* Terminal & Gate */}
                        {(flight.origin.terminal || flight.origin.gate) && (
                            <div className="mt-1 flex gap-2 text-xs">
                                {flight.origin.terminal && (
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                                        Terminal {flight.origin.terminal}
                                    </span>
                                )}
                                {flight.origin.gate && (
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                                        Gate {flight.origin.gate}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Times */}
                        <div className="mt-2">
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {new Date(flight.origin.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {flight.origin.estimatedTime && flight.origin.estimatedTime !== flight.origin.time && (
                                <div className="text-sm text-orange-600 dark:text-orange-400">
                                    Est: {new Date(flight.origin.estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                            <div className="text-xs text-gray-400">{flight.origin.timezone}</div>
                            {flight.origin.delayMinutes != null && flight.origin.delayMinutes > 0 && (
                                <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
                                    Delayed {flight.origin.delayMinutes} min
                                </div>
                            )}
                        </div>

                        {/* Origin Weather */}
                        {!weatherLoading && originWeather && (
                            <WeatherDisplay weather={originWeather} location={flight.origin.city} />
                        )}
                    </div>

                    {/* Flight Path Visual */}
                    <div className="flex-1 flex flex-col items-center px-4 pt-4">
                        {flight.aircraft && (
                            <div className="text-xs text-gray-400 mb-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {flight.aircraft.type}
                            </div>
                        )}
                        <div className="w-full h-[2px] bg-gray-200 dark:bg-gray-700 relative flex items-center">
                            <div className="absolute w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20"></div>
                            <div className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
                                ✈️
                            </div>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="text-right flex-1">
                        <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">{flight.destination.code}</div>
                        <div className="text-sm text-gray-500 font-medium">{flight.destination.city}</div>

                        {/* Terminal, Gate & Baggage */}
                        {(flight.destination.terminal || flight.destination.gate || flight.destination.baggage) && (
                            <div className="mt-1 flex gap-2 justify-end text-xs flex-wrap">
                                {flight.destination.terminal && (
                                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                                        Terminal {flight.destination.terminal}
                                    </span>
                                )}
                                {flight.destination.gate && (
                                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                                        Gate {flight.destination.gate}
                                    </span>
                                )}
                                {flight.destination.baggage && (
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                        Baggage {flight.destination.baggage}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Times */}
                        <div className="mt-2">
                            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                {new Date(flight.destination.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {flight.destination.estimatedTime && flight.destination.estimatedTime !== flight.destination.time && (
                                <div className="text-sm text-orange-600 dark:text-orange-400">
                                    Est: {new Date(flight.destination.estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                            <div className="text-xs text-gray-400">{flight.destination.timezone}</div>
                            {flight.destination.delayMinutes != null && flight.destination.delayMinutes > 0 && (
                                <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
                                    Delayed {flight.destination.delayMinutes} min
                                </div>
                            )}
                        </div>

                        {/* Destination Weather */}
                        {!weatherLoading && destinationWeather && (
                            <WeatherDisplay weather={destinationWeather} location={flight.destination.city} />
                        )}
                    </div>
                </div>

                {/* Map Toggle Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMap(!showMap);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <span>{showMap ? '🗺️ Hide Map' : '🗺️ View Flight Path'}</span>
                    </button>
                </div>

                {/* Map */}
                {showMap && (
                    <div className="mt-6">
                        <FlightMap
                            originCode={flight.origin.code}
                            originCity={flight.origin.city}
                            destinationCode={flight.destination.code}
                            destinationCity={flight.destination.city}
                        />
                    </div>
                )}
            </div>
        </a>
    );
}

export default function FlightResults({ flights }: FlightResultsProps) {
    if (flights.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
            {flights.map((flight) => (
                <FlightCard key={flight.flightNumber} flight={flight} />
            ))}
        </div>
    );
}

