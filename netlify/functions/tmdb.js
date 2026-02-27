// Use global fetch if available (Node 18+), otherwise use node-fetch
const getFetch = async () => {
    if (typeof fetch !== 'undefined') return fetch;
    const { default: nodeFetch } = await import('node-fetch');
    return nodeFetch;
};

exports.handler = async function (event, context) {
    const { path, queryStringParameters } = event;
    const TMDB_API_KEY = process.env.TMDB_API_KEY;

    if (!TMDB_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'TMDB_API_KEY environment variable is missing on server.' })
        };
    }

    // Extract the relative path (everything after /api/tmdb/ or /.netlify/functions/tmdb/)
    // We handle both local dev and production paths
    let tmdbPath = path.replace('/.netlify/functions/tmdb', '');
    tmdbPath = tmdbPath.replace('/api/tmdb', '');

    // Reconstruct query parameters and add API Key
    const params = new URLSearchParams(queryStringParameters);
    params.set('api_key', TMDB_API_KEY);

    const url = `https://api.themoviedb.org/3${tmdbPath}?${params.toString()}`;

    try {
        const fetchFn = await getFetch();
        const response = await fetchFn(url);
        const data = await response.json();

        return {
            statusCode: response.status || 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Proxy Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed fetching data from TMDb', details: error.message })
        };
    }
}
