const allCategories = ["best-movie", "top-rated", 'history', 'adventure', 'action'];
const urlBase = "http://localhost:8000/api/v1/titles/?";
const mainPage = document.querySelector("main")
const imgToShow = 5;

function defineAllUrls(categories) {
    let allUrlRecover = [];
    for (category of categories) {
        if (category === categories[0]) {
            allUrlRecover.push(urlBase + 'sort_by=-votes,-imdb_score&page_size=1');
        } else if (category === categories[1]) {
            allUrlRecover.push(urlBase + 'sort_by=-votes,-imdb_score&page_size=20');
        } else {
            allUrlRecover.push(urlBase + 'genre=' + category + '&sort_by=-votes,-imdb_score&page_size=20');
        }
    }
    return allUrlRecover;
}

let allUrls = defineAllUrls(allCategories);

//Take all pictures from movies
async function fetchData(url) {
    const response = await fetch(url);
    let resultOfResponse = await response.json();
    return resultOfResponse.results;
}

async function setBestMovie(url) {
    bestMovieSection = document.querySelector(".best-movie")
    let bestMovie = await fetchData(url);
    //Take url of the best movie
    let bestMovieData = await fetch(bestMovie[0].url);
    bestMovieData = await bestMovieData.json();
    const bestMovieDescription = document.querySelector(".movie-details")
    bestMovieDescription.textContent = bestMovieData.long_description;
    const bestMovieImage = document.querySelector(".best-movie__image");
    bestMovieImage.alt = bestMovie[0].url;
    bestMovieImage.src = bestMovie[0].image_url;
    bestMovieImage.classList.add("modal-trigger")
    bestMovieImage.title = bestMovieData.original_title;
    bestMovieSection.appendChild(bestMovieDescription);
    bestMovieSection.appendChild(bestMovieImage);
}

function displayImageError(unfoundImage) {
    unfoundImage.src = "https://www.escapestudio.hr/images/404-travolta.gif";
    unfoundImage.title = "Image not found";
    unfoundImage.onerror = null;
    return unfoundImage;
}

async function modifiedSection(url, category) {
    let section = document.querySelector("." + category);
    const allButton = section.querySelector(".buttons");
    let movies = await fetchData(url);
    let carouselDiv = section.querySelector(".carousel");
    let moviesData = [];
    for (let result of movies) {
        moviesData.push(result);
    }
    for (let movie of moviesData) {
        let movieImg = document.createElement("img");
        movieImg.src = movie.image_url;
        movieImg.alt = movie.url;
        //If an error from image Url
        movieImg.onerror = () => displayImageError(movieImg);
        movieImg.classList.add("modal-trigger");
        carouselDiv.appendChild(movieImg);
    }
    section.appendChild(allButton);
    return section;
}

//Make a modal
function createModal(movieData, completeModal) {
    const modalHeader = completeModal.querySelector(".modal-container__header");
    const modalBody = completeModal.querySelector(".modal-container__body");
    let movieTitle = modalHeader.querySelector("h3");
    movieTitle.textContent = movieData.original_title;
    modalHeader.appendChild(movieTitle);

    let movieImg = modalHeader.querySelector("img");
    movieImg.src = movieData.image_url;
    movieImg.title = movieData.original_title;
    //If an error from image Url
    movieImg.onerror = () => displayImageError(movieImg);
    modalHeader.appendChild(movieImg);

    const importantKeys = ["year", "duration", "genres", "directors"]
    const keysToIgnore = ['id', 'budget', 'budget_currency', 'url', 'title', 'metascore', "reviews_from_users", 'description', 'image_url', "usa_gross_income", "original_title", 'votes', 'worldwide_gross_income', 'reviews_from_critics'];

    const moviesImportantInfo = document.querySelector(".best-info");
    moviesImportantInfo.innerHTML = "";
    const moviesData = document.querySelector(".other_info");
    moviesData.innerHTML = "";


    for (let key in movieData) {
        if (!keysToIgnore.includes(key) && !importantKeys.includes(key)) {

            let keyElement = document.createElement("dt");
            keyElement.textContent = key.replace("_", " ") + ": ";

            let textElement = document.createElement("dd");
            textElement.textContent = movieData[key];

            moviesData.appendChild(keyElement);
            moviesData.appendChild(textElement);
        }
        else if (importantKeys.includes(key)) {
            let keyElement = document.createElement("dt");
            keyElement.textContent = key.toUpperCase() + ": ";

            let textElement = document.createElement("dd");
            textElement.textContent = movieData[key];;

            moviesImportantInfo.appendChild(keyElement);
            moviesImportantInfo.appendChild(textElement);
        }
    }

    modalBody.appendChild(moviesData);
    modalHeader.appendChild(moviesImportantInfo);
    completeModal.appendChild(modalHeader);
    completeModal.appendChild(modalBody);
}

async function makeMovieDetailsModal(movieUrl) {
    const mainModal = document.querySelector(".modal-container");
    const modal = mainModal.querySelector(".modal-container__modal");
    const closeButton = modal.querySelector(".modal-container__close");
    let movieData = await fetch(movieUrl);
    movieData = await movieData.json();
    createModal(movieData, modal);
    closeButton.addEventListener("click", () => {
        mainModal.classList.remove("active");
    });
}

async function toggleModal(event) {
    const modalContainer = document.querySelector(".modal-container");
    const clickedImage = event.target;
    if (clickedImage.tagName === 'IMG') {
        const movieUrl = clickedImage.alt;
        await makeMovieDetailsModal(movieUrl);
        modalContainer.classList.toggle("active");
    } else {
        modalContainer.classList.remove("active");
    }
}

//make a carousel
function updateVisibility(allElements, currentPosition) {
    allElements.forEach((image, index) => {
        if (index >= currentPosition && index < currentPosition + imgToShow) {
            image.style.display = "block";
        } else {
            image.style.display = "none";
        }
    });
}

async function setCarousel(url, category) {
    let carourselImages = await modifiedSection(url, category);
    let allElements = carourselImages.querySelectorAll("img");
    let section = document.querySelector("." + category)
    let previousButton = section.querySelector(".prev-button");
    let nextButton = section.querySelector(".next-button");
    let currentPosition = 0;

    previousButton.addEventListener("click", () => {
        currentPosition -= imgToShow;
        if (currentPosition < 0) {
            currentPosition = allElements.length - imgToShow;
        }
        updateVisibility(allElements, currentPosition);
    });
    nextButton.addEventListener("click", () => {
        currentPosition += imgToShow;
        if (currentPosition >= allElements.length) {
            currentPosition = 0;
        }
        updateVisibility(allElements, currentPosition);
    });

    updateVisibility(allElements, currentPosition);
}

async function setAllCarousel() {
    for (let i = 0; i < allCategories.length; i++) {
        if (i === 0) {
            await setBestMovie(allUrls[i]);
        } else {
            await setCarousel(allUrls[i], allCategories[i]);
        }
    }
}

async function initialize() {
    await setAllCarousel();
    const modalTriggers = document.querySelectorAll(".modal-trigger");

    modalTriggers.forEach(triggers => triggers.addEventListener("click", toggleModal));

}


initialize();