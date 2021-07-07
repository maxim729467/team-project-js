// Pagination plugin. See API below >>>>

// Exports: class "Pages"
//
// Usage:
//          'let pagination = new Pages(selector);'
//   [selector] is CSS selector to find pagination container in html
//   When created, pagination is not rendered to container immediately.
//
// Can receive:
//          current page => in case of current page change;
//          total pages => necessary in case of new query made;
//          array => array for pagination (custom realization for the aim of the current project);
//
// Main interaction should be in the following way:
//          'pagination.moveToPage(currPage, [tllPages]);'
//   `currPage` sets new current page
//   `tllPages` (optional) - sets new total pages number; if omitted, current total pages kept
//
// Can provide:
//   current page:
//        'const currentPage = pagination.page;'
//   ref to pagination container:
//        'const paginationContainerRef = pagination.container;'
//   current page saved in container data-property:
//        'const currentPage = pagination.container.dataset.page;'
//   method `listen` to set up callback invoked at page change; callback may be debounced, default time - 500ms:
//        'pagination.listen(callback, [debounceTime])'
//   method `unlisten` to remove page change callback:
//        'pagination.unlisten()'
//   methods `show` and `hide` removind or adding class `pagination-hidden` to pagination container;
//        'pagination.show()', 'pagination.hide()'
//   methods `defineLibraryCardsPerPage`, `paginateLibrary` methods for customs use for the current project.
//   see code for details, methods need to be made more universal to use.


// Visual interface:
//   `boxes with figures` - allow to change current page within +/- 1-2 offset range
//   `ellipsis (...)` - visual separators, no interaction
//   `<-`  /  `->` - shift current page f'wd and b'wd by one page
//   `<<-` / `->>` - shift current page f'wd and b'wd by 10 pages

import { camelToKebabCase } from './utilities';
import { debounce } from './utilities.js';

export default class Pages {
  #listener;

  #PAGE_CONTROLS = [
    'leftFastButton',
    'leftButton',
    'firstPage',
    'leftEllipsis',
    'rightEllipsis',
    'lastPage',
    'rightButton',
    'rightFastButton',
  ];

  #MOBILE_SCREEN_WIDTH = 320;
  #TABLET_SCREEN_WIDTH = 768;
  #DESKTOP_SCREEN_WIDTH = 1024;

  #MOBILE_LIBRARY_PERPAGE = 4;
  #TABLET_LIBRARY_PERPAGE = 8;
  #DESKTOP_LIBRARY_PERPAGE = 9;

  constructor(containerClass) {
    this._currentPage = 1;
    this._totalPages = 5;

    this._mapping = this.initMap();

    this._container = document.querySelector(containerClass);
    this._refs = this.getPaginationRefs();

    this.container.addEventListener('click', this.onPaginationClick.bind(this));
  }

  getPaginationRefs() {
    const controlRefs = this.#PAGE_CONTROLS.reduce((acc, controlItem) => {
      const controlItemRef = this.container.querySelector(
        `[data-action="${camelToKebabCase(controlItem)}"]`,
      );
      return { ...acc, [controlItem]: controlItemRef };
    }, {});

    const pageRefs = [...this.container.querySelectorAll('[data-action="page"]')];

    return { ...controlRefs, pages: pageRefs };
  }

  onPaginationClick(evt) {
    const target = evt.target.closest('.pagination-nav'); // closest used for the case if some deeper structure implemented

    if (!target) return;
    if (target.dataset.active === 'false') return;
    if (target.dataset.action.includes('ellipsis')) return;

    let page = target.textContent;

    switch (target.dataset.action) {
      case 'left-fast-button':
        this.shiftPageLeftFast();
        break;

      case 'right-fast-button':
        this.shiftPageRightFast();
        break;

      case 'left-button':
        this.shiftPageLeft();
        break;

      case 'right-button':
        this.shiftPageRight();
        break;

      default:
        page = Number(page);
        if (page !== this._currentPage) {
          this.moveToPage(page);
        } else return;
    }

    let pageEvent = new Event('pagechanged');
    this._container.dispatchEvent(pageEvent);
  }

  initMap() {
    return {
      ...this.#PAGE_CONTROLS.reduce((acc, controlItem) => {
        return /left|right/.test(controlItem) ? { ...acc, [controlItem]: true } : acc;
      }, {}),

      pages: Array.from({ length: 5 }, () => 0),

      firstPage: 1,
      lastPage: this._totalPages,
    };
  }

  refreshMap() {
    const disableLeftControls = () => {
      this._mapping.leftFastButton = false;
      this._mapping.leftButton = false;
      this._mapping.firstPage = 0;
      this._mapping.leftEllipsis = false;
    };

    const disableRightControls = () => {
      this._mapping.rightEllipsis = false;
      this._mapping.lastPage = 0;
      this._mapping.rightButton = false;
      this._mapping.rightFastButton = false;
    };

    this._mapping = this.initMap();

    let offset = 0;

    if (this._currentPage <= 3) {
      disableLeftControls();
      offset = 3 - this._currentPage;
    }

    if (this._currentPage >= this._totalPages - 2) {
      disableRightControls();
      offset = this._totalPages - this._currentPage - 2;
    }

    this._mapping.pages = this._mapping.pages.map((page, idx) => {
      const value = this._currentPage - 2 + idx + offset;
      return value < 1 || value > this._totalPages ? 0 : value;
    });

    if (Math.max(...this._mapping.pages) >= this._totalPages) {
      disableRightControls();
    }

    if (Math.min(...this._mapping.pages) <= 1) {
      disableLeftControls();
    }
  }

  refreshPaginationMarkup() {
    this.#PAGE_CONTROLS.forEach(controlItem => {
      this._refs[controlItem].dataset.active = Boolean(this._mapping[controlItem]);
    });

    this._refs.pages.forEach((page, idx) => {
      page.textContent = this._mapping.pages[idx];
      page.classList.remove('pagination-page-active');
      page.dataset.active = this._mapping.pages[idx] > 0;
    });

    this._refs.lastPage.textContent = this._totalPages;
    this._refs.pages
      .find(page => page.textContent === '' + this._currentPage)
      .classList.add('pagination-page-active');
    this._container.dataset.page = this._currentPage;
  }

  defineLibraryCardsPerPage() {
    const screenWidth = window.innerWidth;
    if (screenWidth < this.#TABLET_SCREEN_WIDTH) return this.#MOBILE_LIBRARY_PERPAGE;
    if (screenWidth < this.#DESKTOP_SCREEN_WIDTH) return this.#TABLET_LIBRARY_PERPAGE;
    return this.#DESKTOP_LIBRARY_PERPAGE;
  }

  paginateLibrary(arrayToPaginate, firstInvoke = true) {
    const cardsPerPage = this.defineLibraryCardsPerPage();
    const currentPage = firstInvoke ? 1 : this._currentPage;
    const totalCards = arrayToPaginate.length;
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    const firstFilmToRender = (currentPage - 1) * cardsPerPage;
    const lastFilmToRender = Math.min(firstFilmToRender + cardsPerPage, totalCards);
    const array = arrayToPaginate.slice(firstFilmToRender, lastFilmToRender);

    // console.log('----------------');
    // console.log('isFirstInvoke', firstInvoke);
    // console.log('cardsPerPage', cardsPerPage);
    // console.log('currentPage', currentPage);
    // console.log('totalCards', totalCards);
    // console.log('totalPages', totalPages);
    // console.log('firstFilmToRender', firstFilmToRender);
    // console.log('lastFilmToRender', lastFilmToRender);
    // console.log('array', array);

    return { array, currentPage, totalPages };
  }

  moveToPage(newPage, _totalPages = this._totalPages) {
    this._currentPage = newPage;
    this._totalPages = _totalPages;
    this.refreshMap();
    this.refreshPaginationMarkup();
    this.show();

    // console.log('----------------');
    // console.log('this after moveToPage', this);
  }

  shiftPage(offset) {
    let newPage = this._currentPage + offset;
    if (newPage < 1) {
      newPage = 1;
    }

    if (newPage > this._totalPages) {
      newPage = this._totalPages;
    }

    this.moveToPage(newPage);
  }

  shiftPageRight() {
    this.shiftPage(1);
  }

  shiftPageLeft() {
    this.shiftPage(-1);
  }

  shiftPageRightFast() {
    this.shiftPage(10);
  }

  shiftPageLeftFast() {
    this.shiftPage(-10);
  }

  get page() {
    return this._currentPage;
  }

  set page(newPage) {
    this._currentPage = newPage;
  }

  get container() {
    return this._container;
  }

  show() {
    this._container.classList.remove('pagination-hidden');
  }

  hide() {
    this._container.classList.add('pagination-hidden');
  }

  listen(callback, debounceTime = 500) {
    this.unlisten();

    // console.log('----------------');
    // console.log('*callback in page listener*', callback);

    this.#listener = debounce(() => {
      window.scrollTo({ top: 0, left: pageXOffset, behavior: 'smooth' });
      callback();
    }, debounceTime);

    this._container.addEventListener('pagechanged', this.#listener);
  }

  unlisten() {
    this._container.removeEventListener('pagechanged', this.#listener);
  }
}
