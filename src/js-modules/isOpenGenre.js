import genresMarkup from "../hbs-templates/genres.hbs";

export async function renderGenres(list) {
  const genresArr = await JSON.parse(localStorage.getItem('genres'))
  
  const newGenresMarkup = list.insertAdjacentHTML('beforeend', genresMarkup(genresArr));

  const allGenresBtn = document.querySelector('[data-action="genres"]')
        const allBtns = document.querySelectorAll('.genreBtn')
        const allBtnsArr = Array.from(allBtns)
        const activeBtn = allBtnsArr.find(btn => btn.classList ==='genreBtn is-active')
        if (!activeBtn) {
        allGenresBtn.classList.add('is-active')
    }

  return  newGenresMarkup
}

export function slideDown(element) {
  return element.style.height = `${element.scrollHeight}px`;
}

export function slideUp(element) {
  return element.style.height = '0px';
}