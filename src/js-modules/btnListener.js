import variables from "./variables.js";
import renderQueueAndWatched from '../hbs-templates/queue-and-watched-films.hbs';
import { renderTrendingFilms,  renderFilmsSortedByGenre} from '../js-modules/render-service.js';
import { renderGenres, slideDown, slideUp } from '../js-modules/isOpenGenre.js'
import { initMainMarkup, updateTrendingMarkup, pagination } from './initialMarkup.js';


variables.homeBtn.addEventListener('click', onHomeBtnClick);
variables.libraryBtn.addEventListener('click', onLibraryBtnClick);
variables.btnWatched.addEventListener('click', onWatchedBtnClick);
variables.btnQueue.addEventListener('click', onQueueBtnClick);
variables.headerWatchedBtn.addEventListener('click', onHeaderWatchedButtonClick);
variables.headerQueueBtn.addEventListener('click', onHeaderQueueButtonClick);
variables.fetchTrendingMoviesBtn.addEventListener('input', onTrendingMoviesBtnClick);
variables.genreSorter.addEventListener('click', onGenreBtnClick);
variables.genresBtn.addEventListener('click', onGenresBtnClick);
let activeGenre = '';

function onHomeBtnClick(e) {
    e.preventDefault();
    variables.headerHome.classList.add('section__header');    // headerLibrary amended to headerHome
    variables.headerHome.classList.remove('my__library');  // headerLibrary amended to headerHome
    variables.libraryBtn.classList.remove('current');
    variables.homeBtn.classList.add('current');
    variables.searchInput.classList.remove('hidden');
    variables.libraryBtns.classList.add('visually-hidden');
    variables.searchNav.classList.remove('visually-hidden');
    variables.searchError.classList.remove('visually-hidden');
    variables.fetchTrendingMoviesToggle.classList.remove('switch-button--is-hidden');
    variables.switchersContainer.classList.remove('one-switcher')
    
    initMainMarkup();

    variables.genreSorter.addEventListener('click', onGenreBtnClick);
    variables.genreSorter.removeEventListener('click', renderLibraryFilmsSortedByGenre);
}

function onLibraryBtnClick(e) {
    e.preventDefault();
    variables.headerHome.classList.add('my__library');
    variables.libraryBtn.classList.add('current');
    variables.homeBtn.classList.remove('current');
    variables.headerHome.classList.remove('section__header');
    variables.libraryBtns.classList.remove('visually-hidden');
    variables.searchNav.classList.add('visually-hidden')
    variables.searchInput.classList.add('hidden');
    variables.searchError.classList.add('visually-hidden');
    variables.fetchTrendingMoviesToggle.classList.add('switch-button--is-hidden');
    variables.switchersContainer.classList.add('one-switcher')
    variables.genreSorter.removeEventListener('click', onGenreBtnClick);
    variables.genreSorter.addEventListener('click', renderLibraryFilmsSortedByGenre);
    

    if (variables.btnQueue.classList.contains('checked')) {           // needed to do this way to immediately initialize library pagination
        variables.headerQueueBtn.dispatchEvent(new Event('click'));   // but this will make unnecessary all the code commented below  
      } else {
        variables.headerWatchedBtn.dispatchEvent(new Event('click')); // commented by Krokodil, delete all the comments if agree
    } 

}

function onWatchedBtnClick(e) {
    variables.btnWatched.classList.add('checked');
    variables.btnQueue.classList.remove('checked');
}

function onQueueBtnClick(e) {
    variables.btnQueue.classList.add('checked');
    variables.btnWatched.classList.remove('checked');
}

function onHeaderWatchedButtonClick(e) {
    if (variables.filmGrid.innerHTML.length !== 0) { variables.filmGrid.innerHTML = "" }

    const watchedFilmsArr = localStorage.getItem('watchedFilms');
    const parsedArray = JSON.parse(watchedFilmsArr);

        if (parsedArray === null || parsedArray.length === 0) {
        const notification = '<p class="film__notification">No added movies yet</p>';
        variables.filmGrid.insertAdjacentHTML('beforeend', notification);
        pagination.moveToPage(1, 1);
        return;
    }

    const isFirstInvoke = Boolean(e);
    const {array: paginatedArray, currentPage, totalPages} = pagination.paginateLibrary(parsedArray, isFirstInvoke);
    
    pagination.moveToPage(currentPage, totalPages);
    pagination.listen(onHeaderWatchedButtonClick);

    variables.filmGrid.insertAdjacentHTML('beforeend', renderQueueAndWatched(paginatedArray));
}

function onHeaderQueueButtonClick(e) {
    if (variables.filmGrid.innerHTML.length !== 0) { variables.filmGrid.innerHTML = "" }

    const queueFilmsArr = localStorage.getItem('queueFilms');
    const parsedArray = JSON.parse(queueFilmsArr);

        if (parsedArray === null || parsedArray.length === 0) {
        const notification = '<p class="film__notification">No added movies yet</p>';
        variables.filmGrid.insertAdjacentHTML('beforeend', notification);
            pagination.moveToPage(1, 1);
        return;
    }

    const isFirstInvoke = Boolean(e);
    const {array: paginatedArray, currentPage, totalPages} = pagination.paginateLibrary(parsedArray, isFirstInvoke);
    
    pagination.moveToPage(currentPage, totalPages);
    pagination.listen(onHeaderQueueButtonClick);

    variables.filmGrid.insertAdjacentHTML('beforeend', renderQueueAndWatched(paginatedArray));
}


function onTrendingMoviesBtnClick() {
    let timeFrame;
    if (variables.fetchTrendingMoviesBtn.checked) {
        timeFrame = true;
        localStorage.setItem('trendingMoviesToggleChecked', timeFrame);
    }
    else {
        timeFrame = false;
        localStorage.setItem('trendingMoviesToggleChecked', timeFrame);
    }

    const resetMainMarkup = async function () {
        const totalPages = await renderTrendingFilms(variables.filmGrid, variables.preloader);
        pagination.moveToPage(1, totalPages);
    };

    const updateTrendingMarkup = async function () {
        const newPage = pagination.page;
        await renderTrendingFilms(variables.filmGrid, variables.preloader, newPage);
    };
    pagination.listen(updateTrendingMarkup);

    resetMainMarkup();

}

async function onGenreBtnClick(e) {
    if (e.target.nodeName !== 'BUTTON') {
        return;
    }

    const allBtns = document.querySelectorAll('.genreBtn')
    const allBtnsArr = Array.from(allBtns) 
    const activeBtn = allBtnsArr.find(btn => btn.classList.value === 'genreBtn is-active')
        if (activeBtn) {
            e.target.classList.add('is-active')
            activeBtn.classList.remove('is-active')
        } 
    
    const localGenres = localStorage.getItem('genres');
    const genres = JSON.parse(localGenres);
    const genreName = e.target.innerText;

     

    if (genreName.toLowerCase() === "all genres") {
        pagination.listen(updateTrendingMarkup);
        initMainMarkup();
        variables.fetchTrendingMoviesToggle.classList.remove('switch-button--is-hidden');
        variables.switchersContainer.classList.remove('one-switcher');
        return;
    }
    

    variables.switchersContainer.classList.add('one-switcher')
    variables.fetchTrendingMoviesToggle.classList.add('switch-button--is-hidden');
    const genre = genres.find((el) => el.name === genreName);
    const genreId = genre.id;
    
    
    const resetMainMarkup = async function () {
        const totalPages = await renderFilmsSortedByGenre(variables.filmGrid, variables.preloader, genreId);
        pagination.moveToPage(1, totalPages);
    };

    const sortedMoviesMarkup = async function () {
        const newPage = pagination.page;
        await renderFilmsSortedByGenre(variables.filmGrid, variables.preloader, genreId, newPage);
    };
    pagination.listen(sortedMoviesMarkup);

    resetMainMarkup();
    
    }

function renderLibraryFilmsSortedByGenre(e) {

    if (e && e.target.nodeName !== 'BUTTON') {
        return;
    }

    variables.filmGrid.innerHTML = '';
    const genreName = Boolean(e) ? e.target.innerText: activeGenre;
    activeGenre = genreName;

    if (variables.headerWatchedBtn.classList.contains('checked')) {

        if (genreName.toLowerCase() === "all genres") {
            variables.headerWatchedBtn.dispatchEvent(new Event('click'));
            return;
        }
    
        const watchedFilmsArr = localStorage.getItem('watchedFilms');
        const parsedArray = JSON.parse(watchedFilmsArr);

        if (parsedArray === null || parsedArray.length === 0) {
            const notification = '<p class="film__notification">No added movies yet</p>';
            variables.filmGrid.insertAdjacentHTML('beforeend', notification);
            pagination.moveToPage(1, 1);
            return;
        }
        
        const sortedFilms = parsedArray.filter(el => el.genres.includes(genreName));

        if (sortedFilms.length === 0) {
            const notification = `<p class="film__notification">No added movies with this genre</p>`;
            variables.filmGrid.insertAdjacentHTML('beforeend', notification);
            return;
        }

        const isFirstInvoke = Boolean(e);
        const {array: paginatedArray, currentPage, totalPages} = pagination.paginateLibrary(sortedFilms, isFirstInvoke);
    
        pagination.moveToPage(currentPage, totalPages);
        pagination.listen(renderLibraryFilmsSortedByGenre);

        variables.filmGrid.insertAdjacentHTML('beforeend', renderQueueAndWatched(paginatedArray));
        return;
    }
    
    if (variables.headerQueueBtn.classList.contains('checked')) {
        if (genreName.toLowerCase() === "all genres") {
            variables.headerQueueBtn.dispatchEvent(new Event('click'));
            return;
        }
    
        const queueFilmsArr = localStorage.getItem('queueFilms');

        const parsedArray = JSON.parse(queueFilmsArr);

        if (parsedArray === null || parsedArray.length === 0) {
            const notification = '<p class="film__notification">No added movies yet</p>';
            variables.filmGrid.insertAdjacentHTML('beforeend', notification);
            pagination.moveToPage(1, 1);   
            return;
        }
        
        const sortedFilms = parsedArray.filter(el => el.genres.includes(genreName));

        if (sortedFilms.length === 0) {
            const notification = `<p class="film__notification">No added movies with this genre</p>`;
            variables.filmGrid.insertAdjacentHTML('beforeend', notification);
            return;
        }

        const isFirstInvoke = Boolean(e);
        const {array: paginatedArray, currentPage, totalPages} = pagination.paginateLibrary(sortedFilms, isFirstInvoke);
    
        pagination.moveToPage(currentPage, totalPages);
        pagination.listen(renderLibraryFilmsSortedByGenre);

        variables.filmGrid.insertAdjacentHTML('beforeend', renderQueueAndWatched(paginatedArray));
        return;
    }
}

async function onGenresBtnClick(e) {
    variables.genresBtn.classList.toggle('is-open');

    if (variables.genresList.children.length === 0) {
        renderGenres(variables.genresList)
    }
    

    if (variables.genresBtn.classList.contains('is-open')) {
        slideDown(variables.genresSection)
    } else {
        slideUp(variables.genresSection)
    }
    
}