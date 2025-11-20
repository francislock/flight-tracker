'use client';

import { useState } from 'react';

interface FlightSearchFormProps {
    onSearch: (flightNumber: string) => void;
    isLoading: boolean;
}

export default function FlightSearchForm({ onSearch, isLoading }: FlightSearchFormProps) {
    const [flightNumber, setFlightNumber] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (flightNumber.trim()) {
            onSearch(flightNumber.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto relative z-10">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-gray-900 rounded-xl p-2 shadow-2xl ring-1 ring-gray-900/5">
                    <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        placeholder="Enter Flight Number (e.g., AA123)"
                        className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-0 font-medium"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !flightNumber.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <span className="animate-spin">✈️</span>
                        ) : (
                            <span>Search</span>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
