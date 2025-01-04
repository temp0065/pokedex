const pokemonInfo = {
    "caughtPokemon": [],
    "nextPokemon": "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20",
    "selectedPokemonId": "1",
};

// Colours to be used in type/weakness items
const pokeTypeColors = {
    "normal": "#9FA19F",
    "fire": "#E62829",
    "fighting": "#FF8000",
    "water": "#2980EF",
    "flying": "#81B9EF",
    "grass": "#3FA129",
    "poison": "#9141CB",
    "electric": "#FAC000",
    "ground": "#915121",
    "psychic": "#EF4179",
    "rock": "#AFA981",
    "ice": "#3DCEF3",
    "bug": "#91A119",
    "dragon": "#5060E1",
    "ghost": "#704170",
    "dark": "#624D4E",
    "steel": "#60A1B8",
    "fairy": "#EF70EF"
};

// If there is not already a pokemon selected, prevents no pokemon from showing
if (!localStorage.getItem("pokeId")) {
    localStorage.setItem("pokeId", pokemonInfo.selectedPokemonId);
}

// If there are already Pokemon caught get the array as an object
if (localStorage.getItem("caughtPokemon")) {
    pokemonInfo.caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon"));
}

// Makes request to PokeAPI
async function fetchPokeData() {
    try {
        // Retrieve the list of Pokemon from PokeAPI
        const response = await fetch(pokemonInfo.nextPokemon);
        // Parse the response
        const pokeData = await response.json();
        // Display Pokemon data to the console
        console.log(pokeData);
        // Set what will be the next Pokemon to display
        pokemonInfo.nextPokemon = pokeData.next
        // HTML template for home pokemon
        const pokeHomeHTMLTemplate = [];
        // Only runs if page is the homepage
        if (getPageTitle() === "index.html") {
            pokeData.results.forEach(poke => {
                // Display the Pokémon to the poke grid
                displayPokemonToHome(poke, pokeHomeHTMLTemplate);
            });
            // Get pokedex grid element
            const $pokedex_grid = document.getElementById("pokedex_grid");
            // Display the HTML template to the poke grid
            $pokedex_grid.innerHTML += pokeHomeHTMLTemplate.join("");
        }
        // Only runs if page is the detailed view page
        else if (getPageTitle() === "pokemon.html") {
            // Set up catch and release button
            getPokemonInfo();
            setUpCatchAndRelease();
        }
    }
    catch(error) {
        console.error("An error occured while fetching the pokemon", error);
    }
}

// parseURL
// Will return the pokemon's id from the provided url
function parseUrl(url) {
    return url.substring(url.substring(0, url.length - 2).lastIndexOf('/') + 1, url.length - 1);
}

// Function to get the title of the page
function getPageTitle() {
    const pageTitle = window.location.href;
    return pageTitle.substring(pageTitle.lastIndexOf("/") + 1, pageTitle.length);
}

function capitalizeText(text) {
    return (text[0]).toUpperCase() + (text).slice(1);
}

function getImageSize(img) {
    return [img.width, img.height];
}

// Function to display Pokémon on home
function displayPokemonToHome(pokemon, htmlTemplate) {
    // Get the Pokémon ID from the URL
    const pokemonId = parseUrl(pokemon.url)

    htmlTemplate.push(`<article class="pokedex_card" aria-label="A Pokémon">
                                    <a href="pokemon.html" aria-label="View detailed information on Pokémon">
                                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" alt="Image of the Pokémon ${pokemon.name}" width="105" height="98" class="pokedex_card_img" data-poke-id="${pokemonId}">
                                    </a>
                                    <div class="pokedex_card_info">
                                        <p>#${pokemonId.padStart(4, "0")}</p>
                                        <h2>${capitalizeText(pokemon.name)}</h2>
                                    </div>
                                </article>`);
}

// Displays detailed information about the Pokemon
async function getPokemonInfo() {
    // Get the Pokémon ID from the URL
    const pokemonId = localStorage.getItem("pokeId");
    pokemonInfo.selectedPokemonId = pokemonId;
    try {
        // Gets info on pokemon
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
        const pokeData = await response.json();
        console.log(pokeData);
        displayPokemonInfo(pokeData, pokemonId);
    }
    catch(error) {
        console.log("An error occured while fetching the pokemon", error);
    }

}

function displayPokemonInfo(pokemon, pokeId) {
    // Pokemon name
    const pokeName = capitalizeText(pokemon.name);

    // Get pokemon header img location
    const $pokedexCardImgLg = document.getElementById("pokedex_card_img_lg");
    // Change img to specific pokemon
    changePokeHeaderImg(pokeName, pokeId, $pokedexCardImgLg);

    // Changes title
    changePokeTitle(pokeName, pokeId);

    // Changing poke stats
    getPokeStats(pokemon);
    

    // Changing type
    const $type = document.getElementById("type");
    getType(pokemon, $type);    

    // Changing oak's analysis
    changeOakAnalysisContent(pokemon);
}

// Changes the pokemon header image
function changePokeHeaderImg(pokeName, pokeId, location) {
    // Change img to specific pokemon
    location.setAttribute("src", `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`);
    location.setAttribute("alt", `Image of ${pokeName}`);
    const imgWidthHeight = getImageSize(location)
    location.setAttribute("width", imgWidthHeight[0]);
    location.setAttribute("height", imgWidthHeight[1]);
}

// Changes the pokemon header title
function changePokeTitle(pokeName, pokeId) {
    // Changes the text content to be pokemon ID 
    document.getElementById("poke_id").textContent = "#" + pokeId.padStart(4, "0");
    // Changes the title of the Pokemon
    document.getElementById("poke_title").textContent = pokeName;
}

// Change the html text of the stats section to the stats associated with the pokemon
function getPokeStats(pokemon) {
    // Changes height
    document.getElementById("height_info").textContent = pokemon.height + " dm"
    // Changes weight
    document.getElementById("weight_info").textContent = pokemon.weight + " lbs";
    // Changes base exp
    document.getElementById("base_exp_info").textContent = pokemon.base_experience + " exp";
    // Array to fill abilities with
    const abilityNames = [];
    // Abilities
    pokemon.abilities.forEach(ability => {
        abilityNames.push(capitalizeText(ability["ability"]["name"]));
    });
    document.getElementById("ability_info").textContent = abilityNames.join(" ");
} 

// Change text content of the Oak's Analysis section
function changeOakAnalysisContent(pokemon) {
    const games = getPokemonGame(pokemon);
    const stats = getPokemonStats(pokemon); 
    const $analysisText = document.getElementById("analysis_text");
    $analysisText.textContent = `Stats: ${stats.join(", ")}. It appears in Pokémon ${games.join(", ")}`;
}

// Sets up catch and release btn
function setUpCatchAndRelease() {
    const $catchReleaseBtn = document.getElementById("catch_release_btn");
    const $caught = document.getElementById("caught_item");
    if (pokemonInfo.caughtPokemon.includes(pokemonInfo.selectedPokemonId)) {
        $catchReleaseBtn.textContent = "Release";
        $caught.innerHTML = "Caught: <span class='material-symbols-outlined'>check</span>";
        $caught.classList.add("caught");
        $caught.classList.remove("not_caught");
    }
    else {
        $catchReleaseBtn.textContent = "Catch";
        $caught.innerHTML = "Caught: <span class='material-symbols-outlined'>close</span>";
        $caught.classList.add("not_caught");
        $caught.classList.remove("caught");
    }
}

// Release or catch a pokemon
function catchAndRelease() {
    const $catchReleaseBtn = document.getElementById("catch_release_btn");
    const $caught = document.getElementById("caught_item");
    // If already caught
    if (pokemonInfo.caughtPokemon.includes(pokemonInfo.selectedPokemonId)) {
        // Change btn text to appropriate title
        $catchReleaseBtn.textContent = "Catch";
        // Remove pokemon from array
        pokemonInfo.caughtPokemon.splice(pokemonInfo.caughtPokemon.indexOf(pokemonInfo.selectedPokemonId), 1);
        $caught.innerHTML = "Caught: <span class='material-symbols-outlined'>close</span>";
        $caught.classList.add("not_caught");
        $caught.classList.remove("caught");
    }
    else {
        // Change btn text to appropriate title
        $catchReleaseBtn.textContent = "Release";
        // Add pokemon to array
        pokemonInfo.caughtPokemon.push(pokemonInfo.selectedPokemonId);
        $caught.innerHTML = "Caught: <span class='material-symbols-outlined'>check</span>";
        $caught.classList.add("caught");
        $caught.classList.remove("not_caught");
    }
    localStorage.setItem("caughtPokemon", JSON.stringify(pokemonInfo.caughtPokemon));
}

// Add types to html
function getType(pokemon, $location) {
    const typeNames = [];
    pokemon["types"].forEach(type => {
        typeNames.push(
            `<p class="type" style="background-color: ${pokeTypeColors[type["type"]["name"]]}">${capitalizeText(type["type"]["name"])}</p>`
        );
    });
    $location.innerHTML = typeNames.join("");
}

// Returns an array with all the game a pokemon has been in
function getPokemonGame(pokemon) {
    const gameArr = [];
    // Get each game and add it to the gameArr
    pokemon.game_indices.forEach((poke, key, arr) => {
        // iff last item in the array is equal to the current key add an and to the beginning 
        if (arr.length - 1 === key) {
            gameArr.push("and " + capitalizeText(poke["version"]["name"]));
        }
        // if not the last item in the array
        else {
            gameArr.push(capitalizeText(poke["version"]["name"]));
        }
    })
    return gameArr;
}

// Returns an object with all pokemon stats
function getPokemonStats(pokemon) {
    const stats = []
    // Get each stat and add it to the stats array
    pokemon.stats.forEach(stat => {
        stats.push(`${(stat.stat.name).toUpperCase()}: ${stat["base_stat"]}`);
    });
    return stats;
}


// Call the fetchData function to initiate the process
fetchPokeData();

// Checks for events on homepage
if (getPageTitle() === "index.html") {
    // Checks to see if more Pokemon are requested
    const $moreBtn = document.getElementById("more_btn");
    $moreBtn.addEventListener("click", fetchPokeData);
    // Finds out which Pokemon was selected
    const $pokedexGrid = document.getElementById("pokedex_grid");
    $pokedexGrid.addEventListener("click", e => {
        if (e.target.tagName === "IMG") {
            pokemonInfo.selectedPokemonId = e.target.dataset.pokeId;
            localStorage.setItem("pokeId", pokemonInfo.selectedPokemonId);
        }
    });
}
else if (getPageTitle() === "pokemon.html") {
    // Gets catch btn
    const $CatchReleaseBtn = document.getElementById("catch_release_btn");
    // If not caught change page to match
    if (!pokemonInfo.caughtPokemon.includes(pokemonInfo.selectedPokemonId)) {
        $CatchReleaseBtn.textContent = "Catch";
    }
    // When catch btn is clicked
    $CatchReleaseBtn.addEventListener("click", catchAndRelease);

}