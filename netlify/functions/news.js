const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async function (event, context) {
    const { queryStringParameters } = event;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    const params = new URLSearchParams(queryStringParameters);
    params.set('apikey', NEWS_API_KEY);

    const url = `https://gnews.io/api/v4/search?${params.toString()}`;

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
            body: JSON.stringify({ error: 'Failed fetching news' })
        };
    }
}
