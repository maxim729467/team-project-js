import trendingFilmsMarkupFc from "../hbs-templates/trending-films.hbs";
import popapFilmMarkup from "../hbs-templates/modal-film-card.hbs";
import { getTrendingFilms, fetchMovieForModal, fetchTrailerByMovieId, getSortedFilms } from "./apiService.js";
import variables from "./variables.js";

export const renderTrendingFilms = async function (container, preloader, page) {

  const fetchInfo = await getTrendingFilms(preloader, page);
  const renderResult = renderUtilFunc(container, fetchInfo, preloader);

  return renderResult;
};


export async function renderDataForModal(movieId) {
  const movieInfo = await fetchMovieForModal(movieId);

  if (movieInfo.error !== undefined) {
    variables.modalContentBox.innerText = "Some server issue has occured";
    return;
  }

  const dataForRendering = movieInfo.data;


  if (dataForRendering.poster_path === null) {
    dataForRendering.poster_path = "http://lexingtonvenue.com/media/poster-placeholder.jpg";
  }

  else {
    dataForRendering.poster_path = `https://image.tmdb.org/t/p/original${dataForRendering.poster_path}`;
  }


  dataForRendering.popularity = parseFloat(dataForRendering.popularity).toFixed(2);


  if (dataForRendering.overview.length === 0) {
    dataForRendering.overview = 'Overview is not provided.';
  }


  if (dataForRendering.genres.length === 0 || dataForRendering.genres === undefined) {
    dataForRendering.genres = "Unspecified genre";
  }

  else {
    const filmGenres = dataForRendering.genres.map((genre) => genre.name);
    dataForRendering.genres = filmGenres.join(', ');
  }

  sessionStorage.setItem('modalMovieInfo', JSON.stringify(dataForRendering));
  variables.modalContentBox.insertAdjacentHTML('beforeend', popapFilmMarkup(dataForRendering));
}

export const renderTrailerMarkup = async function (id) {
  const res = await fetchTrailerByMovieId(id);
  const key = res.trailerKey;
  const markup = `<iframe class="popap__video" src="https://www.youtube.com/embed/${key}" title="YouTube video player"
    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`;
  return { markup };
};

export const renderFilmsSortedByGenre = async function (container, preloader, genre, page) {
  const movies = await getSortedFilms(preloader, genre, page);
  const renderResult = renderUtilFunc(container, movies, preloader);
  
  return renderResult;
}

const renderUtilFunc = async function (container, fetchInfo, preloader) {

  if (fetchInfo.error !== undefined) {
    variables.searchError.innerText = "Some server issue has occured";
    preloader.classList.add('preloader-hidden');
    
    setTimeout(() => {
      variables.searchError.innerText = '';
    }, 5000);
    return;
  }

  if (container.innerText.length !== 0) {
    container.innerHTML = '';
  }

  container.insertAdjacentHTML('afterbegin', trendingFilmsMarkupFc(fetchInfo.updatedFilmData));
  preloader.classList.add('preloader-hidden');
  return fetchInfo.totalPages;
}
