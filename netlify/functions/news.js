// Use global fetch if available (Node 18+), otherwise use node-fetch
const getFetch = async () => {
    if (typeof fetch !== 'undefined') return fetch;
    const { default: nodeFetch } = await import('node-fetch');
    return nodeFetch;
};

exports.handler = async function (event, context) {
    const { queryStringParameters } = event;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    if (!NEWS_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'NEWS_API_KEY environment variable is missing on server.' })
        };
    }

    const params = new URLSearchParams(queryStringParameters);
    params.set('apikey', NEWS_API_KEY);

    const url = `https://gnews.io/api/v4/search?${params.toString()}`;

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
        console.error('News Proxy Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed fetching news', details: error.message })
        };
    }
}
