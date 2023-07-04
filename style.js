/*Set the constants for all categories to show,
there will be a same number of carousels as
numbers of index in allCategories and allUrls if 
allCategories.length and allUrls.length are equals.
*/
const allCategories = ['best-movie', "top-rated", 'action', 'adventure', 'animation']
const urlBase = "http://localhost:8000/api/v1/titles/?";
const allUrls = [urlBase + 'sort_by=-votes,-imdb_score&page_size=1', urlBase + 'sort_by=-votes,-imdb_score&page_size=20', urlBase + 'genre=action&sort_by=-votes,-imdb_score&page_size=20', urlBase + 'genre=adventure&sort_by=-votes,-imdb_score&page_size=20', urlBase + 'genre=animation&sort_by=-votes,-imdb_score&page_size=20']

//Set the number of images to show in all carousels by size of window
const imgToShow = 5;


//Take all pictures from movies
async function fetchData(url) {
    const response = await fetch(url);
    let resultOfResponse = await response.json();
    return resultOfResponse.results;
}

async function setBestMovie(url, className) {
    //Display an Image and return all urls for details
    let bestMovie = await fetchData(url);
    //Take url of the best movie id
    let bestMovieURL = bestMovie[0].url;
    let bestMovieData = await fetch(bestMovieURL)
    const bestMovieSelector = document.getElementsByClassName(className)[0];
    let movieImg = document.createElement("img");
    movieImg.alt = bestMovieData.url;
    movieImg.src = bestMovie[0].image_url;
    movieImg.title = bestMovie[0].title;
    bestMovieSelector.appendChild(movieImg);
}

async function setButton() {
    let buttonDiv = document.createElement("div");
    let previousButton = document.createElement("button");
    previousButton.classList.add("prev-button");
    buttonDiv.appendChild(previousButton);
    previousButton.textContent = "Previous";

    let nextButton = document.createElement("button");
    nextButton.classList.add("next-button");
    nextButton.textContent = "Next";
    buttonDiv.appendChild(nextButton);
    return buttonDiv;
}

function displayImageError(unfoundImage) {
    unfoundImage.src = "https://www.escapestudio.hr/images/404-travolta.gif";
    unfoundImage.title = "Image not found";
    unfoundImage.onerror = null;
    return unfoundImage;
}

async function setImagesDivision(url, id) {
    let movies = await fetchData(url);
    const moviesSelector = document.getElementById(id);[0];
    //prepare for the carousel
    let carouselDiv = document.createElement("div");
    carouselDiv.classList.add('carousel__' + id);
    moviesSelector.appendChild(carouselDiv);
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
        movieImg.classList.add("modal-trigger")
        carouselDiv.appendChild(movieImg);
    }

    let buttonDiv = await setButton();
    moviesSelector.appendChild(carouselDiv);
    moviesSelector.appendChild(buttonDiv)
    console.log(moviesData)
    return moviesSelector
}

//Make a modal
const modalContainer = document.querySelector(".modal-container")

function createCloseButton() {
    const closeButton = document.createElement("button");
    closeButton.classList.add("modal-container__close");
    closeButton.textContent = "X";

    closeButton.addEventListener("click", () => {
        modalContainer.classList.remove("active");
    });

    return closeButton;
}

function createModal(movieData, completeModal) {
    const modalHeader = document.createElement("div");
    modalHeader.classList.add("modal-container__header");

    const modalBody = document.createElement("div");
    modalBody.classList.add("modal-container__body");

    let movieTitle = document.createElement("h2");
    movieTitle.textContent = movieData.original_title;
    modalHeader.appendChild(movieTitle);

    let movieImg = document.createElement("img");
    movieImg.src = movieData.image_url;
    movieImg.title = movieData.original_title;
    //If an error from image Url
    movieImg.onerror = () => displayImageError(movieImg);
    modalHeader.appendChild(movieImg);

    const importantKeys = ["year", "duration", "genres", "directors"]
    const keysToIgnore = ['id', 'budget', 'budget_currency', 'url', 'title', 'metascore', "reviews_from_users", 'long_description', 'image_url', "usa_gross_income", "original_title", 'votes', 'worldwide_gross_income', 'reviews_from_critics'];

    for (let key in movieData) {
        if (!keysToIgnore.includes(key) && !importantKeys.includes(key)) {
            let moviesData = document.createElement("p");
            let text = key.toUpperCase() + ": " + movieData[key];
            moviesData.textContent = text.replace("_", " ");
            modalBody.appendChild(moviesData);
        }
        else if (importantKeys.includes(key)) {
            let moviesImportantInfo = document.createElement("h3");
            moviesImportantInfo.textContent = key + ": " + movieData[key];
            modalHeader.appendChild(moviesImportantInfo);
        }
    };

    completeModal.appendChild(modalHeader);
    completeModal.appendChild(modalBody);
}

async function makeMovieDetailsModal(movieUrl) {
    const modal = document.querySelector(".modal-container__modal");
    // make empty modal
    modal.innerHTML = "";
    let movieData = await fetch(movieUrl);
    movieData = await movieData.json();

    createModal(movieData, modal);

    //Recreate the close button
    let closeButton = createCloseButton();
    modal.appendChild(closeButton);
}

async function toggleModal(event) {
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

async function setCarousel(url, id) {
    let division = await setImagesDivision(url, id);;
    let allElements = division.querySelectorAll("img");
    let previousButton = division.querySelector(".prev-button");
    let nextButton = division.querySelector(".next-button");
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
    if (allCategories.length === allUrls.length) {
        for (let i = 0; i < allCategories.length; i++) {
            if (i === 0) {
                await setBestMovie(allUrls[i], allCategories[i])
            } else {
                await setCarousel(allUrls[i], allCategories[i])
            }
        }
    } else {
        console.log("Les deux listes ne sont pas égales")
    }
}

async function initialize() {
    await setAllCarousel();
    const modalTriggers = document.querySelectorAll(".modal-trigger");

    modalTriggers.forEach(triggers => triggers.addEventListener("click", toggleModal));

}


initialize();
