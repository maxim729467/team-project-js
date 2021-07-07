import variables from './variables.js';
import { renderDataForModal, renderTrailerMarkup } from "./render-service.js";

let titleRubrics = '';
const body = document.querySelector('body');
const popapBox = document.querySelector('.popap__content')

variables.filmGrid.addEventListener('click', onClickFilm);
// функция клика по карточке фильма
async function onClickFilm(e) {

    if (e.target.nodeName === "UL") {
        return;
    }

    // отключаем скролл на body при открытии модалки
    body.classList.add('body-overflow');

    const id = e.target.closest(".film__item").dataset.id;

    await renderDataForModal(id);
    openModal();
    themeSwitcherPopap();

    const trailerBtn = document.querySelector('.trailer-btn');
    trailerBtn.addEventListener('click', renderTrailer);

    async function renderTrailer() {
        const res = await renderTrailerMarkup(id);
        const videoSection = document.querySelector('.popap__video-div');
        const trailerBtnClose = document.querySelector('.trailer-btn__close');
        variables.btnCloseModal.classList.add('disabled')

        videoSection.insertAdjacentHTML('beforeend', res.markup);
        trailerBtn.disabled = 'true';
        trailerBtn.classList.add('trailer-btn--disabled');

        trailerBtnClose.classList.remove('visually-hidden');
        trailerBtnClose.addEventListener('click', onClickTrailerBtnClose);
        
        // функция закрытия трейлера по клику на модалку
        popapBox.addEventListener('click', (e) => {
            if (e.currentTarget.nodeName === 'DIV') {
                onClickTrailerBtnClose()
            }
        })
        // функция закрытия трейлера
        function onClickTrailerBtnClose() {
            videoSection.innerHTML = '';
            trailerBtn.classList.remove('trailer-btn--disabled');
            trailerBtn.removeAttribute('disabled');
            trailerBtnClose.classList.add('visually-hidden');
            variables.btnCloseModal.classList.remove('disabled')
        }
    }

    // ...находим кнопки в модалке
    const addToWatchedBtn = document.querySelector('.js-watched-btn');
    const addToQueueBtn = document.querySelector('.js-queue-btn');

    // ...создаем переменные для фильмов в просмотренных, в очереди и текущего фильма
    const existingWatchedFilmsArray = JSON.parse(localStorage.getItem('watchedFilms'));
    const existingFilmsInQueueArray = JSON.parse(localStorage.getItem('queueFilms'));
    const filmObjFromSessionStorage = JSON.parse(sessionStorage.getItem('modalMovieInfo'));

    // ...проверка: добавлен ли фильм ранеее в просмотренные
    if (existingWatchedFilmsArray) {
        const searchedFilm = existingWatchedFilmsArray.find((el) => el.id === filmObjFromSessionStorage.id);

        if (searchedFilm) {
        addToWatchedBtn.textContent = 'remove from watched';
        addToWatchedBtn.addEventListener('click', removeFromWatchedFilmsInLocalStorage);
        }

        if (!searchedFilm) {
            addToWatchedBtn.addEventListener('click', addToWatchedFilmsInLocalStorage);
        }
    }

    if (existingWatchedFilmsArray === null) {
        addToWatchedBtn.addEventListener('click', addToWatchedFilmsInLocalStorage);
    };

    // ...проверка: добавлен ли фильм ранее в очередь
    if (existingFilmsInQueueArray) {
        const searchedFilm = existingFilmsInQueueArray.find((el) => el.id === filmObjFromSessionStorage.id);

        if (searchedFilm) {
        addToQueueBtn.textContent = 'remove from queue';
        addToQueueBtn.addEventListener('click', removeFilmFromQueueInLocalStorage);
        }

        if (!searchedFilm) {
            addToQueueBtn.addEventListener('click', addFilmToQueueInLocalStorage);
        }
    }
  
    if (existingFilmsInQueueArray === null) {
        addToQueueBtn.addEventListener('click', addFilmToQueueInLocalStorage);
    };

    // ...функция добавления фильма в Watched массив в Local Storage
    function addToWatchedFilmsInLocalStorage() {

        const existingWatchedFilmsArray = JSON.parse(localStorage.getItem('watchedFilms'));
        const filmObjFromSessionStorage = JSON.parse(sessionStorage.getItem('modalMovieInfo'));
        
        dataCheck(filmObjFromSessionStorage)

        // ...если уже есть фильмы в watchedFilms
        if (existingWatchedFilmsArray) {

            const searchedFilm = existingWatchedFilmsArray.find((el) => el.id === filmObjFromSessionStorage.id);
            if (searchedFilm) {
                return;
            }

            existingWatchedFilmsArray.unshift(filmObjFromSessionStorage);
            localStorage.setItem('watchedFilms', JSON.stringify(existingWatchedFilmsArray));

        };


        // ...если ещё нет фильмов в watchedFilms
        if (existingWatchedFilmsArray === null) {
            const watchedFilmsArray = [];
            watchedFilmsArray.push(filmObjFromSessionStorage);
            localStorage.setItem('watchedFilms', JSON.stringify(watchedFilmsArray));
        }

        // ...убираем слушателя с кнопки addToWatchedBtn
        addToWatchedBtn.removeEventListener('click', addToWatchedFilmsInLocalStorage);

        // ...меняем текстовый контент на кнопке
        addToWatchedBtn.textContent = 'remove from watched';

        // ...добавляем нового слушателя с функцией удаления фильма из просмотренных
        addToWatchedBtn.addEventListener('click', removeFromWatchedFilmsInLocalStorage);
    }

    // ...функция удаления фильма из Watched массива в Local Storage
    function removeFromWatchedFilmsInLocalStorage() {
        const existingWatchedFilmsArray = JSON.parse(localStorage.getItem('watchedFilms'));
        const filmObjFromSessionStorage = JSON.parse(sessionStorage.getItem('modalMovieInfo'));

        const searchedFilm = existingWatchedFilmsArray.find((el) => el.id === filmObjFromSessionStorage.id);
        if (searchedFilm) {
            existingWatchedFilmsArray.splice(existingWatchedFilmsArray.indexOf(searchedFilm), 1);
            localStorage.setItem('watchedFilms', JSON.stringify(existingWatchedFilmsArray));
        }

        addToWatchedBtn.textContent = 'add to watched';
        addToWatchedBtn.removeEventListener('click', removeFromWatchedFilmsInLocalStorage);
        addToWatchedBtn.addEventListener('click', addToWatchedFilmsInLocalStorage);
    }

    // ...функция добавления фильма в Queue массив в Local Storage
    function addFilmToQueueInLocalStorage() {

        const existingFilmsInQueueArray = JSON.parse(localStorage.getItem('queueFilms'));
        const filmObjFromSessionStorage = JSON.parse(sessionStorage.getItem('modalMovieInfo'));

        dataCheck(filmObjFromSessionStorage)

        // ...если уже есть фильмы в queueFilms
        if (existingFilmsInQueueArray) {

            const searchedFilm = existingFilmsInQueueArray.find((el) => el.id === filmObjFromSessionStorage.id);
            if (searchedFilm) {
                return;
            }

            existingFilmsInQueueArray.unshift(filmObjFromSessionStorage);
            localStorage.setItem('queueFilms', JSON.stringify(existingFilmsInQueueArray));

        };


        // ...если ещё нет фильмов в queueFilms
        if (existingFilmsInQueueArray === null) {
            const queueFilmsArray = [];
            queueFilmsArray.push(filmObjFromSessionStorage);
            localStorage.setItem('queueFilms', JSON.stringify(queueFilmsArray));
        }

        // ...убираем слушателя с кнопки addToQueueBtn 
        addToQueueBtn.removeEventListener('click', addFilmToQueueInLocalStorage);

        // ...меняем текстовый контент на кнопке
        addToQueueBtn.textContent = 'remove from queue';

        // ...добавляем нового слушателя с функцией удаления фильма из просмотренных
        addToQueueBtn.addEventListener('click', removeFilmFromQueueInLocalStorage);
    }

    // ...функция удаления фильма из Queue массива в Local Storage
    function removeFilmFromQueueInLocalStorage() {
        const existingFilmsInQueueArray = JSON.parse(localStorage.getItem('queueFilms'));
        const filmObjFromSessionStorage = JSON.parse(sessionStorage.getItem('modalMovieInfo'));
        
        const searchedFilm = existingFilmsInQueueArray.find((el) => el.id === filmObjFromSessionStorage.id);
        if (searchedFilm) {
            existingFilmsInQueueArray.splice(existingFilmsInQueueArray.indexOf(searchedFilm), 1);
            localStorage.setItem('queueFilms', JSON.stringify(existingFilmsInQueueArray));
        }

        addToQueueBtn.textContent = 'add to queue';
        addToQueueBtn.removeEventListener('click', removeFilmFromQueueInLocalStorage);
        addToQueueBtn.addEventListener('click', addFilmToQueueInLocalStorage);
    }
}



// открытие модалки по клику
function openModal() {
    window.addEventListener('keydown', onEscKeyPress);
    variables.backdropBox.classList.remove('is-hidden');
}

// добавляю класс dark-theme для модалки и её элементов
function themeSwitcherPopap() {
    if(body.classList.contains('dark-theme')) {
        titleRubrics = document.querySelectorAll('.popap__film-info');

        titleRubrics.forEach(el => el.classList.add('dark-theme'));
        popapBox.classList.add('dark-theme');
        variables.btnCloseSvg.classList.add('dark-theme');
    }
}

// зыкрытие модалки по клику backdrop
variables.backdropBox.addEventListener('click', onBackdropClick);
function onBackdropClick(ev) {
    if (ev.currentTarget === ev.target) {
        closeModal();
    }
}

// зыкрытие модалки по клику на кнопку "закрыть"
variables.btnCloseModal.addEventListener('click', closeModal);

// зыкрытие модалки по клавише Esc
function onEscKeyPress(event) {
    if (event.code === 'Escape') {
        closeModal();
    }
}
//   зыкрытие модалки
function closeModal() {
    variables.backdropBox.classList.add('is-hidden');
    window.removeEventListener('keydown', onEscKeyPress);
    variables.modalContentBox.innerHTML = '';
    body.classList.remove('body-overflow');
    
    if(popapBox.nodeName==='DIV' && popapBox.classList.contains('dark-theme')){
        popapBox.classList.remove('dark-theme');
        variables.btnCloseSvg.classList.remove('dark-theme');
    }
}

function dataCheck(arr) {
    if (arr.release_date.length === 0 || arr.release_date === undefined) {
        arr.release_date = 'Unknown release date';
    }
    else {
        arr.release_date = arr.release_date.slice(0, 4);
    }

    if (arr.genres.length === 0 || arr.genres === undefined) {
        arr.genres = "Unspecified genre";
    }
}