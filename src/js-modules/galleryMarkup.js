import trendingFilmsMarkupFc from '../hbs-templates/trending-films.hbs';
import api from './apiService.js'
import './btnListener.js';
import variables from './variables.js';
import { pagination } from './initialMarkup.js';




export function appendGalleryMarkup(fetchMovies) {

  const films = fetchMovies;


  if (films.updatedFilmData.length !== 0) {
    variables.preloader.classList.add('preloader-hidden');
    variables.filmGrid.innerHTML = trendingFilmsMarkupFc(films.updatedFilmData);
    variables.searchError.textContent = '';
    pagination.moveToPage(1, films.totalPages);
  }

  if (films.updatedFilmData.length === 0) {
    variables.preloader.classList.add('preloader-hidden');
    variables.searchError.textContent =
      'Search result is not successful. Please enter the correct movie name and try again!';

    setTimeout(() => {
      variables.searchError.innerText = '';
    }, 5000);

  }
  if (films.error !== undefined) {
    variables.searchError.innerText = 'Some server issue has occured';
    return;
  }

  pagination.listen(onLoadMore);
};
export function updateGalleryMarkup(fetchMovies) {

  const films = fetchMovies;

  if (films.updatedFilmData.length !== 0) {
    variables.preloader.classList.add('preloader-hidden');
    variables.filmGrid.innerHTML = trendingFilmsMarkupFc(films.updatedFilmData);
    variables.searchError.textContent = '';
  }

  pagination.listen(onLoadMore);
};

function onLoadMore(e) {
  const nextPage = pagination.page;
  api.fetchMovies(nextPage).then(updateGalleryMarkup);
}
function onSearch(e) {
  e.preventDefault();

  api.searchQuery = e.currentTarget.elements.query.value.trim();
  if (api.searchQuery === '') {
    return;
  }
  e.currentTarget.elements.query.value = '';
  variables.preloader.classList.remove('preloader-hidden');
  api.fetchMovies().then(appendGalleryMarkup)
}

variables.searchInput.addEventListener('submit', onSearch);