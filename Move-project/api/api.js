const url_api = '7a14ea12';
const Base_url = 'https://omdbapi.com';

async function fetchMoves(title) {
    const url = `${Base_url}?apikey=${url_api}&s=${encodeURIComponent(title)}`;

    const response = await fetch(url);
    if(!response.ok) {
        throw new Error('Ошибка сети при запросе');
    }
    return await response.json();
}
