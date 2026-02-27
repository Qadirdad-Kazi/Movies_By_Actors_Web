const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async function (event, context) {
    const { path, queryStringParameters } = event;
    const TMDB_API_KEY = process.env.TMDB_API_KEY;

    // Extract the relative path (everything after /api/tmdb/)
    const tmdbPath = path.replace('/.netlify/functions/tmdb', '');

    // Reconstruct query parameters and add API Key
    const params = new URLSearchParams(queryStringParameters);
    params.set('api_key', TMDB_API_KEY);

    const url = `https://api.themoviedb.org/3${tmdbPath}?${params.toString()}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed fetching data from TMDb' })
        };
    }
}
