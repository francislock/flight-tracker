'use client';

import { useState } from 'react';
import Image from 'next/image';
import FlightSearchForm from '@/components/FlightSearchForm';
import FlightResults from '@/components/FlightResults';
import { Flight } from '@/types/flight';

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (flightNumber: string) => {
    setIsLoading(true);
    setError('');
    setHasSearched(true);
    setFlights([]);

    try {
      const response = await fetch(`/api/flights?flightNumber=${encodeURIComponent(flightNumber)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }
      const data = await response.json();
      setFlights(data);
    } catch (err) {
      setError('Failed to find flight information. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
              src="/logo-v4.png"
              alt="Francis Flight Tracker Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tight">
            Francis Flight Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-lg mx-auto">
            Real-time flight status and tracking at your fingertips.
          </p>
        </div>

        <FlightSearchForm onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/50 animate-fade-in">
            {error}
          </div>
        )}

        {hasSearched && !isLoading && flights.length === 0 && !error && (
          <div className="text-gray-500 dark:text-gray-400 animate-fade-in">
            No flights found with that number.
          </div>
        )}

        <FlightResults flights={flights} />
      </div>
    </main>
  );
}
