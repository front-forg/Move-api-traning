
const toggleBtn = document.getElementById('themeToggle');
const filmInput = document.getElementById('film-input');
const searchBtn = document.getElementById('search-btn');
const resiltfilm = document.getElementById('Films-result');
const favoritesBtn = document.getElementById('favorites-btn');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let isShowingFavorites = false;

function updateFavButtonText() {
    if (!favoritesBtn) return;
    if (isShowingFavorites) {
        favoritesBtn.textContent = '← Назад к поиску';
    } else {
        favoritesBtn.textContent = `Избранное (${favorites.length})`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }

    updateFavButtonText();

    const savedQuery = localStorage.getItem('lastQuery');
    const savedMovies = localStorage.getItem('savedMovies');

    if (savedQuery) {
        filmInput.value = savedQuery;
    }
    if (savedMovies) {
        renderMovies(JSON.parse(savedMovies));
    }
});


//Кнопка смены темы
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
        isShowingFavorites = !isShowingFavorites;
        updateFavButtonText();

        if (isShowingFavorites) {
            if (favorites.length === 0) {
                resiltfilm.innerHTML = '<p>В избранном пока пусто</p>';
            } else {
                renderMovies(favorites);
            }
        } else {
            const savedMovies = JSON.parse(localStorage.getItem('savedMovies')) || [];
            if (savedMovies.length > 0) {
                renderMovies(savedMovies);
            } else {
                resiltfilm.innerHTML = '';
            }
        }
    });
}



//Кнопка найти
searchBtn.addEventListener('click', async () => {
    const query = filmInput.value.trim();
    if (!query) return;

    isShowingFavorites = false;
    updateFavButtonText();

    try {
        const data = await fetchMoves(query);

        if (data.Response === 'True') {
            renderMovies(data.Search);

            localStorage.setItem('lastQuery', query);
            localStorage.setItem('savedMovies', JSON.stringify(data.Search));
        } else {
            resiltfilm.innerHTML = `<p>Ничего не найдено ${data.Error}</p>`;
        }
    } catch (error) {
        console.error(error);
        resiltfilm.innerHTML = `<p>Ошибка загрузки данных</p>`;
    }
});

filmInput.addEventListener('keydown', (event) => {
    if(event.key === "Enter") {
        event.preventDefault();
        searchBtn.click();
    }
})


//Добавление и удаленние из избранного 
function toggleFavorite(movie, btn) {
    const index = favorites.findIndex(item => item.imdbID === movie.imdbID);

    if (index === -1) {
        favorites.push(movie);
        btn.textContent = '★ В избранном';
        btn.classList.add('active');
    } else {
        favorites.splice(index, 1);
        btn.textContent = '☆ В избранное';
        btn.classList.remove('active');

        if (isShowingFavorites) {
            if (favorites.length === 0) {
                resiltfilm.innerHTML = '<p>В избранном пока пусто</p>';
            } else {
                renderMovies(favorites);
            }
        }
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavButtonText();
}



//Карточки фильмов
function renderMovies(movies) {
    resiltfilm.innerHTML = '';

    movies.forEach(movie => {
        const card = document.createElement('article');
        const domain = 'https://www.kinopoisk' + '.ru';
        const path = '/index.php';
        const urlObj = new URL(domain + path);
        urlObj.searchParams.set('kp_query', movie.Title + ' ' + movie.Year);
        const kpUrl = urlObj.href;

        const isFav = favorites.some(item => item.imdbID === movie.imdbID);

        card.innerHTML = `
        <a href="${kpUrl}" target="_blank" rel="noopener noreferrer">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'no-poster.jpg'}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
        </a>
        <h3>${movie.Type}</h3>
        <p>Год: ${movie.Year}</p>
        <button class="fav-btn ${isFav ? 'active' : ''}">
            ${isFav ? '★ В избранном' : '☆ В избранное'}
        </button>
        `;

        const favBtn = card.querySelector('.fav-btn');
        favBtn.addEventListener('click', () => {
            toggleFavorite(movie, favBtn);
        });

        resiltfilm.appendChild(card);
    });
}