import variables from "./variables";

const isChecked = localStorage.getItem('trendingMoviesToggleChecked');

if (isChecked === 'false' || isChecked === null) {
    variables.fetchTrendingMoviesBtn.checked = false;
}

if (isChecked === 'true') {
    variables.fetchTrendingMoviesBtn.checked = true;
}


