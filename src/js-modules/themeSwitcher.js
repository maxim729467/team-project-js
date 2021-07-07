
  
const body = document.querySelector('body');
const switcher = document.querySelector('.theme-switch__toggle');
const movieToggle = document.querySelector('.switch-button');
const footer = document.querySelector('#footer');
const footerModal = document.querySelector('.footer-modal');


const Theme = {
  LIGHT: 'light-theme',
  DARK: 'dark-theme',
};

body.classList.add(Theme.LIGHT);
footer.classList.add(Theme.LIGHT);
footerModal.classList.add(Theme.LIGHT);
switcher.addEventListener('change', setClassList);
switcher.addEventListener('change', saveData);


function setClassList(evt) {
  evt.preventDefault(evt);
  
  
  if (switcher.checked) {
    body.classList.add(Theme.DARK);
    footer.classList.add(Theme.DARK);
    footerModal.classList.add(Theme.DARK);
    body.classList.remove(Theme.LIGHT);
    footer.classList.remove(Theme.LIGHT);
    footerModal.classList.remove(Theme.LIGHT);
    movieToggle.classList.remove(Theme.DARK);
  } else {
    body.classList.add(Theme.LIGHT);
    footer.classList.add(Theme.LIGHT);
    footerModal.classList.add(Theme.LIGHT);
    body.classList.remove(Theme.DARK);
    footer.classList.remove(Theme.DARK);
    footerModal.classList.remove(Theme.DARK);
    movieToggle.classList.remove(Theme.DARK);
  }
}

function saveData(evt) {
  
  if (switcher.checked) {
    localStorage.setItem('theme', Theme.DARK);
  } else {
    localStorage.removeItem('theme');
    localStorage.setItem('theme', Theme.LIGHT);
  }
}

const currentTheme = localStorage.getItem('theme');

if (currentTheme === Theme.DARK) {
  body.classList.add(Theme.DARK);
  footer.classList.add(Theme.DARK);
  footerModal.classList.add(Theme.DARK);
  movieToggle.classList.add(Theme.DARK);
  switcher.checked = true;
}
