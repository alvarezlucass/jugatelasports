const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = import.meta.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const fetchFootballData = async (endpoint: string, params: Record<string, string> = {}, forceUpdate: boolean = false) => {
    const cacheKey = `api_cache_${endpoint}_${JSON.stringify(params)}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData && !forceUpdate) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_TTL) {
            console.log(`Using cached data for ${endpoint}`);
            return data;
        }
    }

    if (!API_KEY || API_KEY === 'MOCK_KEY') {
        console.warn(`API Key not configured or running in secure production mode. Skipping client-side external API fetch for ${endpoint}.`);
        return null;
    }

    // Protection: If suspended, don't fetch unless forceUpdate is true
    const isSuspended = import.meta.env.VITE_API_SUSPENDED === 'true' || localStorage.getItem('api_suspended') === 'true';

    if (isSuspended && !forceUpdate) {
        console.warn(`API call to ${endpoint} blocked: Manual mode active.`);
        return { suspended: true, cacheKey };
    }

    const url = new URL(`${BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Only cache if the response is successful and contains data
        if (data && data.response) {
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        }

        return data;
    } catch (error) {
        console.error("Error fetching football data:", error);
        return null;
    }
};
