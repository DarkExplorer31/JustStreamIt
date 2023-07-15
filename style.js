/*If one of catogories or all needs to change,
only change the name of category of you want in allCategories.
Don't forget change same value in base.scss, in $id-name-list value.
*/

const allCategories = ["best-movie", "top-rated", 'action', 'adventure', 'animation'];
const urlBase = "http://localhost:8000/api/v1/titles/?";
const mainPage = document.querySelector("article");

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

//Set the number of images to show in all carousels by size of window
function manageResize() {
    let imgToShow = 5;
    if (window.innerWidth < 980) {
        imgToShow = 2;
    } else if (window.innerWidth > 980 && window.innerWidth < 1450) {
        imgToShow = 3;
    }
    return imgToShow;
}

async function createNav() {
    const header = document.querySelector("header");
    const navigator = document.createElement("nav");

    for (let category of allCategories) {
        if (category !== "best-movie") {
            let anchor = document.createElement("a");
            anchor.href = "#" + category;
            category = category.toUpperCase();
            anchor.textContent = category;
            navigator.appendChild(anchor);
        }
    }
    header.appendChild(navigator);
}

//Take all pictures from movies
async function fetchData(url) {
    const response = await fetch(url);
    let resultOfResponse = await response.json();
    return resultOfResponse.results;
}

//Create all section
async function setSection(id) {
    let sectionToAdd = document.createElement("section");
    let sectionTitle = document.createElement("h2");

    if (id !== allCategories[0]) {
        sectionToAdd.id = id;
        sectionToAdd.classList.add("existing");
        sectionTitle.textContent = id;
        sectionToAdd.appendChild(sectionTitle);
    } else {
        sectionToAdd.classList.add(id);
        sectionTitle.textContent = "Best Movie";
        sectionToAdd.appendChild(sectionTitle);
    }

    mainPage.appendChild(sectionToAdd);
    return sectionToAdd;
}

async function setBestMovie(url, className, section) {
    let bestMovie = await fetchData(url);
    //Take url of the best movie
    let bestMovieData = await fetch(bestMovie[0].url);
    bestMovieData = await bestMovieData.json();
    //Create a division for best movie
    const bestMovieDivision = document.createElement("div");
    bestMovieDivision.classList.add(className + '__division');
    //Create title
    const bestMovieTitle = document.createElement("h3");
    bestMovieTitle.textContent = bestMovieData.original_title;
    bestMovieDivision.appendChild(bestMovieTitle);
    //Create description
    const bestMovieDescription = document.createElement("p");
    bestMovieDescription.textContent = bestMovieData.description;
    bestMovieDivision.appendChild(bestMovieDescription);
    //Create button
    const bestMoviePlayButton = document.createElement("button");
    bestMovieDivision.appendChild(bestMoviePlayButton);
    //Create image
    const bestMovieImageDivision = document.createElement("div");
    bestMovieImageDivision.classList.add(className + '__image_division');
    let movieImg = document.createElement("img");
    movieImg.alt = bestMovie[0].url;
    movieImg.src = bestMovie[0].image_url;
    movieImg.classList.add("modal-trigger")
    movieImg.title = bestMovieData.original_title;
    bestMovieImageDivision.appendChild(movieImg);
    //Put this division in main page
    section.appendChild(bestMovieDivision);
    section.appendChild(bestMovieImageDivision);
}

async function setButtons() {
    let buttonDiv = document.createElement("div");
    let previousButton = document.createElement("button");
    previousButton.classList.add("prev-button");
    previousButton.textContent = "Previous";
    buttonDiv.appendChild(previousButton);

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

async function setImagesDivision(url, id, section) {
    let movies = await fetchData(url);
    //prepare for the carousel
    let carouselDiv = document.createElement("div");
    carouselDiv.classList.add('carousel__' + id);
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
    section.appendChild(carouselDiv);
    let buttonDiv = await setButtons();
    section.appendChild(buttonDiv);
    return section;
}

//Make a modal
async function createModalWindow() {
    const modalMainWindow = document.createElement("div");
    modalMainWindow.classList.add("modal-container");
    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("modal-container__overlay");
    modalOverlay.classList.add("modal-trigger");
    modalMainWindow.appendChild(modalOverlay);
    const container = document.createElement("div");
    container.classList.add("modal-container__modal");
    modalMainWindow.appendChild(container);
    mainPage.appendChild(modalMainWindow);
    return modalMainWindow;
}


function createCloseButton(mainModal) {
    const closeButton = document.createElement("button");
    closeButton.classList.add("modal-container__close");
    closeButton.textContent = "X";

    closeButton.addEventListener("click", () => {
        mainModal.classList.remove("active");
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
    const keysToIgnore = ['id', 'budget', 'budget_currency', 'url', 'title', 'metascore', "reviews_from_users", 'description', 'image_url', "usa_gross_income", "original_title", 'votes', 'worldwide_gross_income', 'reviews_from_critics'];

    for (let key in movieData) {
        if (!keysToIgnore.includes(key) && !importantKeys.includes(key)) {
            let moviesData = document.createElement("p");

            let keyElement = document.createElement("strong");
            keyElement.textContent = key.replace("_", " ");

            let textElement = document.createElement("span");
            textElement.textContent = ": " + movieData[key];

            moviesData.appendChild(keyElement);
            moviesData.appendChild(textElement);
            modalBody.appendChild(moviesData);
        }
        else if (importantKeys.includes(key)) {
            let moviesImportantInfo = document.createElement("h3");
            let keyElement = document.createElement("strong");
            keyElement.textContent = key.toUpperCase();

            let textElement = document.createElement("span");
            let text = ": " + movieData[key];
            text = text.replaceAll("  ", " ").replaceAll(",", ", ")
            textElement.textContent = text;

            moviesImportantInfo.appendChild(keyElement);
            moviesImportantInfo.appendChild(textElement);
            modalHeader.appendChild(moviesImportantInfo);
        }
    }

    completeModal.appendChild(modalHeader);
    completeModal.appendChild(modalBody);
}

async function makeMovieDetailsModal(movieUrl) {
    let modal = document.querySelector(".modal-container__modal");
    // make empty modal
    modal.innerHTML = "";
    let movieData = await fetch(movieUrl);
    movieData = await movieData.json();
    createModal(movieData, modal);
    //Recreate the close button
    let closeButton = createCloseButton(modal);
    modal.appendChild(closeButton);
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
    imgToShow = manageResize();
    allElements.forEach((image, index) => {
        if (index >= currentPosition && index < currentPosition + imgToShow) {
            image.style.display = "block";
        } else {
            image.style.display = "none";
        }
    });
}

async function setCarousel(url, id, section) {
    let division = await setImagesDivision(url, id, section);
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
    let section;
    for (let i = 0; i < allCategories.length; i++) {
        if (i === 0) {
            section = await setSection(allCategories[i]);
            await setBestMovie(allUrls[i], allCategories[i], section);
        } else {
            section = await setSection(allCategories[i]);
            await setCarousel(allUrls[i], allCategories[i], section);
        }
    }
}

async function responsive() {
    let allSection = document.querySelectorAll(".existing");
    let newNumberOfImg = manageResize();
    if (imgToShow !== newNumberOfImg) {
        imgToShow = newNumberOfImg;
        for (let section of allSection) {
            let allSectionElement = section.querySelectorAll("img");
            updateVisibility(allSectionElement, 0);
        }
    }
}

async function initialize() {
    await createNav();
    await createModalWindow();
    await setAllCarousel();
    const modalTriggers = document.querySelectorAll(".modal-trigger");

    modalTriggers.forEach(triggers => triggers.addEventListener("click", toggleModal));

    window.addEventListener("resize", responsive);

}


initialize();