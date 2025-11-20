'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { LatLngBounds, LatLngTuple, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { calculateFlightPath, calculateMapBounds, getAirportCoordinates } from '@/lib/mapUtils';

interface FlightMapProps {
    originCode: string;
    originCity: string;
    destinationCode: string;
    destinationCity: string;
}

// Fix Leaflet default icon issue with Next.js
const createCustomIcon = (color: string) => {
    return new Icon({
        iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
        <path fill="${color}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="5"/>
      </svg>
    `)}`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
};

const originIcon = createCustomIcon('#3B82F6'); // Blue
const destinationIcon = createCustomIcon('#A855F7'); // Purple

// Component to fit bounds
function FitBounds({ bounds }: { bounds: [[number, number], [number, number]] }) {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            const latLngBounds = new LatLngBounds(bounds);
            map.fitBounds(latLngBounds, { padding: [50, 50] });
        }
    }, [bounds, map]);

    return null;
}

export default function FlightMap({ originCode, originCity, destinationCode, destinationCity }: FlightMapProps) {
    const originCoords = getAirportCoordinates(originCode);
    const destinationCoords = getAirportCoordinates(destinationCode);

    if (!originCoords || !destinationCoords) {
        return (
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Map unavailable for these airports</p>
            </div>
        );
    }

    const flightPath = calculateFlightPath(originCoords, destinationCoords);
    const bounds = calculateMapBounds(originCoords, destinationCoords);

    return (
        <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <MapContainer
                center={originCoords}
                zoom={4}
                className="w-full h-full"
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds bounds={bounds} />

                {/* Origin Marker */}
                <Marker position={originCoords} icon={originIcon}>
                    <Popup>
                        <div className="text-center">
                            <div className="font-bold text-blue-600">{originCode}</div>
                            <div className="text-sm">{originCity}</div>
                        </div>
                    </Popup>
                </Marker>

                {/* Destination Marker */}
                <Marker position={destinationCoords} icon={destinationIcon}>
                    <Popup>
                        <div className="text-center">
                            <div className="font-bold text-purple-600">{destinationCode}</div>
                            <div className="text-sm">{destinationCity}</div>
                        </div>
                    </Popup>
                </Marker>

                {/* Flight Path */}
                <Polyline
                    positions={flightPath}
                    color="#8B5CF6"
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 10"
                />
            </MapContainer>
        </div>
    );
}
