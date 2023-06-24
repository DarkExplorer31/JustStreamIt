async function fetchData(url) {
    const response = await fetch(url);
    let resultOfResponse = await response.json();
    let allResult = resultOfResponse.results;
    return allResult;
}

async function setBestMovie() {
    let bestMovie = await fetchData('http://localhost:8000//api/v1/titles/?sort_by=-votes,-imdb_score&page_size=1');
    //Take url of the best movie id
    bestMovie = bestMovie[0]
    let bestMovieURL = bestMovie.url;
    let bestMovieData = await fetch(bestMovieURL)
    const bestMovieSelector = document.querySelector("#best-movie");
    let movieImg = document.createElement("img");
    movieImg.src = bestMovie.image_url;
    bestMovieSelector.appendChild(movieImg);
}

async function setMain(url, id) {
    let topRated = await fetchData(url);
    let id_name = "#" + id;
    const topRatedSelector = document.querySelector(id_name);
    let topRatedData = [];
    let topRatedImg = [];
    for (let result of topRated) {
        topRatedData.push(result.url);
        topRatedImg.push(result.image_url);
    }
    for (let img of topRatedImg) {
        let movieImg = document.createElement("img");
        movieImg.src = img;
        topRatedSelector.appendChild(movieImg);
    }
}



//Excecution from functions
setBestMovie();
setMain('http://localhost:8000//api/v1/titles/?sort_by=-votes,-imdb_score&page_size=7', "top-rated");
setMain('http://localhost:8000//api/v1/titles/?genre=action&sort_by=-votes,-imdb_score&page_size=7', 'action')
setMain('http://localhost:8000//api/v1/titles/?genre=adventure&sort_by=-votes,-imdb_score&page_size=7', 'adventure')
setMain('http://localhost:8000//api/v1/titles/?genre=animation&sort_by=-votes,-imdb_score&page_size=7', 'animation')