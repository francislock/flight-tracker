import { LatLngBounds, LatLngTuple } from 'leaflet';

/**
 * Calculate intermediate points for a curved flight path (great circle route)
 */
export function calculateFlightPath(
    from: LatLngTuple,
    to: LatLngTuple,
    numPoints: number = 100
): LatLngTuple[] {
    const points: LatLngTuple[] = [];

    for (let i = 0; i <= numPoints; i++) {
        const fraction = i / numPoints;
        const point = interpolateGreatCircle(from, to, fraction);
        points.push(point);
    }

    return points;
}

/**
 * Interpolate a point along the great circle route between two coordinates
 */
function interpolateGreatCircle(
    from: LatLngTuple,
    to: LatLngTuple,
    fraction: number
): LatLngTuple {
    const [lat1, lon1] = from;
    const [lat2, lon2] = to;

    // Convert to radians
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const λ1 = (lon1 * Math.PI) / 180;
    const λ2 = (lon2 * Math.PI) / 180;

    // Angular distance
    const Δφ = φ2 - φ1;
    const Δλ = λ2 - λ1;
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Interpolate
    const A = Math.sin((1 - fraction) * δ) / Math.sin(δ);
    const B = Math.sin(fraction * δ) / Math.sin(δ);

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);

    // Convert back to degrees
    const lat = (φ * 180) / Math.PI;
    const lon = (λ * 180) / Math.PI;

    return [lat, lon];
}

/**
 * Calculate bounds to fit both locations on the map
 */
export function calculateMapBounds(
    from: LatLngTuple,
    to: LatLngTuple
): [[number, number], [number, number]] {
    const minLat = Math.min(from[0], to[0]);
    const maxLat = Math.max(from[0], to[0]);
    const minLng = Math.min(from[1], to[1]);
    const maxLng = Math.max(from[1], to[1]);

    return [
        [minLat, minLng],
        [maxLat, maxLng]
    ];
}

/**
 * Get airport coordinates from IATA code
 * Comprehensive database of major airports worldwide
 */
export function getAirportCoordinates(iataCode: string): LatLngTuple | null {
    const airports: Record<string, LatLngTuple> = {
        // North America - United States
        'ATL': [33.6407, -84.4277],  // Atlanta
        'LAX': [33.9416, -118.4085], // Los Angeles
        'ORD': [41.9742, -87.9073],  // Chicago O'Hare
        'DFW': [32.8998, -97.0403],  // Dallas/Fort Worth
        'DEN': [39.8561, -104.6737], // Denver
        'JFK': [40.6413, -73.7781],  // New York JFK
        'SFO': [37.6213, -122.3790], // San Francisco
        'SEA': [47.4502, -122.3088], // Seattle
        'LAS': [36.0840, -115.1537], // Las Vegas
        'MCO': [28.4312, -81.3081],  // Orlando
        'EWR': [40.6895, -74.1745],  // Newark
        'CLT': [35.2140, -80.9431],  // Charlotte
        'PHX': [33.4373, -112.0078], // Phoenix
        'IAH': [29.9902, -95.3368],  // Houston
        'MIA': [25.7959, -80.2870],  // Miami
        'BOS': [42.3656, -71.0096],  // Boston
        'MSP': [44.8848, -93.2223],  // Minneapolis
        'DTW': [42.2125, -83.3534],  // Detroit
        'PHL': [39.8729, -75.2437],  // Philadelphia
        'LGA': [40.7769, -73.8740],  // New York LaGuardia
        'FLL': [26.0742, -80.1506],  // Fort Lauderdale
        'BWI': [39.1773, -76.6684],  // Baltimore
        'DCA': [38.8512, -77.0402],  // Washington Reagan
        'IAD': [38.9531, -77.4565],  // Washington Dulles
        'SLC': [40.7899, -111.9791], // Salt Lake City
        'SAN': [32.7338, -117.1933], // San Diego
        'TPA': [27.9775, -82.5350],  // Tampa
        'PDX': [45.5898, -122.5951], // Portland
        'STL': [38.7499, -90.3699],  // St. Louis
        'HNL': [21.3187, -157.9225], // Honolulu
        'AUS': [30.1945, -97.67],    // Austin
        'BNA': [36.1263, -86.6774],  // Nashville
        'OAK': [37.7213, -122.2208], // Oakland
        'SJC': [37.3639, -121.9289], // San Jose
        'DAL': [32.8472, -96.8517],  // Dallas Love Field
        'HOU': [29.6454, -95.2789],  // Houston Hobby
        'MDW': [41.7868, -87.7522],  // Chicago Midway
        'RDU': [35.8776, -78.7875],  // Raleigh-Durham
        'SMF': [38.6954, -121.5908], // Sacramento
        'SNA': [33.6762, -117.8681], // Orange County
        'MCI': [39.2976, -94.7139],  // Kansas City
        'SAT': [29.5337, -98.4698],  // San Antonio
        'PIT': [40.4915, -80.2329],  // Pittsburgh
        'CVG': [39.0533, -84.6630],  // Cincinnati
        'IND': [39.7173, -86.2944],  // Indianapolis
        'CLE': [41.4117, -81.8498],  // Cleveland
        'CMH': [39.9980, -82.8919],  // Columbus
        'MKE': [42.9472, -87.8966],  // Milwaukee
        'PBI': [26.6832, -80.0956],  // West Palm Beach
        'RSW': [26.5364, -81.7552],  // Fort Myers
        'BDL': [41.9389, -72.6832],  // Hartford
        'MEM': [35.0424, -89.9767],  // Memphis
        'ABQ': [35.0402, -106.6090], // Albuquerque
        'BUF': [42.9405, -78.7322],  // Buffalo
        'ONT': [34.0560, -117.6012], // Ontario CA
        'ANC': [61.1743, -149.9962], // Anchorage
        'BOI': [43.5644, -116.2228], // Boise

        // Canada
        'YYZ': [43.6777, -79.6248],  // Toronto
        'YVR': [49.1967, -123.1815], // Vancouver
        'YUL': [45.4657, -73.7455],  // Montreal
        'YYC': [51.1225, -114.0108], // Calgary
        'YEG': [53.3097, -113.5801], // Edmonton
        'YOW': [45.3192, -75.6692],  // Ottawa
        'YWG': [49.9100, -97.2399],  // Winnipeg
        'YHZ': [44.8808, -63.5086],  // Halifax

        // Mexico & Central America
        'MEX': [19.4363, -99.0721],  // Mexico City
        'CUN': [21.0365, -86.8771],  // Cancun
        'GDL': [20.5218, -103.3111], // Guadalajara
        'MTY': [25.7785, -100.1072], // Monterrey
        'PVR': [20.6801, -105.2544], // Puerto Vallarta
        'SJD': [23.1518, -109.7211], // Los Cabos
        'PTY': [9.0714, -79.3834],   // Panama City
        'SJO': [9.9939, -84.2088],   // San Jose CR

        // South America
        'GRU': [-23.4356, -46.4731], // São Paulo
        'GIG': [-22.8099, -43.2505], // Rio de Janeiro
        'EZE': [-34.8222, -58.5358], // Buenos Aires
        'BOG': [4.7016, -74.1469],   // Bogotá
        'LIM': [-12.0219, -77.1143], // Lima
        'SCL': [-33.3930, -70.7858], // Santiago
        'UIO': [-0.1292, -78.3575],  // Quito

        // Europe - UK & Ireland
        'LHR': [51.4700, -0.4543],   // London Heathrow
        'LGW': [51.1537, -0.1821],   // London Gatwick
        'LCY': [51.5048, 0.0495],    // London City
        'STN': [51.8850, 0.2389],    // London Stansted
        'MAN': [53.3537, -2.2750],   // Manchester
        'EDI': [55.9500, -3.3725],   // Edinburgh
        'DUB': [53.4213, -6.2701],   // Dublin
        'GLA': [55.8642, -4.4331],   // Glasgow

        // Europe - Western
        'CDG': [49.0097, 2.5479],    // Paris CDG
        'ORY': [48.7233, 2.3794],    // Paris Orly
        'AMS': [52.3105, 4.7683],    // Amsterdam
        'FRA': [50.0379, 8.5622],    // Frankfurt
        'MUC': [48.3537, 11.7750],   // Munich
        'BCN': [41.2974, 2.0833],    // Barcelona
        'MAD': [40.4983, -3.5676],   // Madrid
        'FCO': [41.8003, 12.2389],   // Rome
        'MXP': [45.6306, 8.7281],    // Milan Malpensa
        'VCE': [45.5053, 12.3519],   // Venice
        'LIS': [38.7742, -9.1342],   // Lisbon
        'BRU': [50.9010, 4.4856],    // Brussels
        'ZRH': [47.4582, 8.5556],    // Zurich
        'GVA': [46.2381, 6.1090],    // Geneva
        'VIE': [48.1103, 16.5697],   // Vienna
        'CPH': [55.6180, 12.6508],   // Copenhagen
        'OSL': [60.1939, 11.1004],   // Oslo
        'ARN': [59.6519, 17.9186],   // Stockholm
        'HEL': [60.3172, 24.9633],   // Helsinki

        // Europe - Eastern & Southern
        'ATH': [37.9364, 23.9445],   // Athens
        'IST': [41.2753, 28.7519],   // Istanbul
        'WAW': [52.1657, 20.9671],   // Warsaw
        'PRG': [50.1008, 14.2600],   // Prague
        'BUD': [47.4360, 19.2556],   // Budapest
        'OTP': [44.5711, 26.0850],   // Bucharest
        'SOF': [42.6952, 23.4114],   // Sofia

        // Middle East
        'DXB': [25.2532, 55.3657],   // Dubai
        'DOH': [25.2731, 51.6081],   // Doha
        'AUH': [24.4330, 54.6511],   // Abu Dhabi
        'CAI': [30.1219, 31.4056],   // Cairo
        'TLV': [32.0114, 34.8867],   // Tel Aviv
        'AMM': [31.7226, 35.9932],   // Amman
        'BEY': [33.8211, 35.4884],   // Beirut
        'JED': [21.6796, 39.1564],   // Jeddah
        'RUH': [24.9578, 46.6988],   // Riyadh

        // Asia - East
        'HND': [35.5494, 139.7798],  // Tokyo Haneda
        'NRT': [35.7720, 140.3929],  // Tokyo Narita
        'PEK': [40.0799, 116.6031],  // Beijing
        'PVG': [31.1443, 121.8083],  // Shanghai Pudong
        'ICN': [37.4602, 126.4407],  // Seoul Incheon
        'HKG': [22.3080, 113.9185],  // Hong Kong
        'TPE': [25.0797, 121.2342],  // Taipei
        'MNL': [14.5086, 121.0198],  // Manila
        'SIN': [1.3644, 103.9915],   // Singapore
        'KUL': [2.7456, 101.7099],   // Kuala Lumpur
        'BKK': [13.6900, 100.7501],  // Bangkok
        'CGK': [-6.1256, 106.6559],  // Jakarta

        // Asia - South & Central
        'DEL': [28.5562, 77.1000],   // Delhi
        'BOM': [19.0896, 72.8656],   // Mumbai
        'BLR': [13.1979, 77.7063],   // Bangalore
        'HYD': [17.2403, 78.4294],   // Hyderabad
        'MAA': [12.9941, 80.1709],   // Chennai
        'CCU': [22.6547, 88.4467],   // Kolkata
        'CMB': [7.1808, 79.8841],    // Colombo
        'KHI': [24.9065, 67.1608],   // Karachi
        'ISB': [33.6169, 73.0997],   // Islamabad

        // Oceania
        'SYD': [-33.9399, 151.1753], // Sydney
        'MEL': [-37.6733, 144.8433], // Melbourne
        'BNE': [-27.3942, 153.1218], // Brisbane
        'PER': [-31.9403, 115.9672], // Perth
        'AKL': [-37.0082, 174.7850], // Auckland
        'CHC': [-43.4894, 172.5319], // Christchurch
        'WLG': [-41.3272, 174.8049], // Wellington

        // Africa
        'JNB': [-26.1392, 28.2460],  // Johannesburg
        'CPT': [-33.9715, 18.6021],  // Cape Town
        'ADD': [8.9779, 38.7991],    // Addis Ababa
        'NBO': [-1.3192, 36.9278],   // Nairobi
        'LOS': [6.5774, 3.3213],     // Lagos
        'ACC': [5.6052, -0.1719],    // Accra
        'ALG': [36.6910, 3.2154],    // Algiers
        'TUN': [36.8510, 10.2272],   // Tunis
        'CMN': [33.3676, -7.5898],   // Casablanca
    };

    return airports[iataCode.toUpperCase()] || null;
}
