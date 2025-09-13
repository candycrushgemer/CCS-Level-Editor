// Player script for rendering Candy Crush Saga level board

// Global variables
let currentLevelData = null;
let selectedTile = null;

// Element definitions (copied from editor script)
const colors = { "002": "random", "055": "red", "056": "yellow", "057": "blue", "058": "green", "059": "orange", "060": "purple" }
const coloredCandy = { "002": "random", "018": "pepper_candy", "036": "frog", "045": "striped_horizontal", "046": "striped_vertical", "047": "wrapped", "049": "jellyfish", "051": "key", "052": "lucky", "032": "mystery", "033": "chameleon", "050": "extra_time_and_moves", "091": "jellyfish_striped", "092": "jellyfish_wrapped", "093": "jellyfish_colorbomb" }
const candy = { "044": "bomb", "043": "coconut_wheel", "061": "ufo" }
const sugarCoats = { "134": "sugarcoat_1", "135": "sugarcoat_2", "136": "sugarcoat_3" }
const locks = { "008": "licorice", "025": "marmalade", "038": "mulock1", "039": "mulock2", "040": "mulock3", "041": "mulock4", "042": "mulock5" }
const glass = { "122": "glass_tile_1", "123": "glass_tile_2", "124": "glass_tile_3" }
const blockers = { "007": "block_frosting", "053": "chocolate_frog", "009": "chocolate", "017": "licorice_square", "019": "block_multi_frosting1", "020": "block_multi_frosting2", "021": "block_multi_frosting3", "022": "block_multi_frosting4", "023": "block_multi_frosting5", "024": "chocolate_spawner", "035": "cake_bomb", "054": "shell_1", "062": "magic_mixer", "066": "bobber", "079": "block_waffle1", "080": "block_waffle2", "081": "block_waffle3", "082": "block_waffle4", "083": "block_waffle5", "094": "dark_chocolate_1", "095": "dark_chocolate_2", "096": "dark_chocolate_3", "097": "dark_chocolate_4", "098": "dark_chocolate_5", "129": "chain_layer1_c", "130": "chain_layer2_c", "131": "chain_layer3_c", "132": "chain_layer4_c", "133": "chain_layer5_c", "157": "shell_3", "158": "shell_2", "159": "bubble_pop_1", "160": "bubble_pop_2", "161": "bubble_pop_3", "162": "bubble_pop_4", "163": "bubble_pop_5", "211": "dark_chocolate_spawner_1", "212": "dark_chocolate_spawner_2", "213": "dark_chocolate_spawner_3", "220": "jelly_jar_1", "221": "jelly_jar_2", "037": "toffee_tornado", "070": "pinata", "073": "pinata_crash", "074": "pinata_link1", "075": "pinata_link2", "076": "pinata_link3", "077": "pinata_unbreakable", "078": "pinata_empty", "156": "rainbow_rapid_mold", "222": "cobra_5", "223": "cobra_4", "224": "cobra_3", "225": "cobra_2", "226": "cobra_1", "227": "cobra_basket", "228": "gumball_machine_empty", "230": "gumball_machine" }
const bonbon = { "182": "bonbon_colorbomb_1", "183": "bonbon_colorbomb_2", "184": "bonbon_colorbomb_3", "185": "bonbon_colorbomb_4", "186": "bonbon_horizontal_1", "187": 'bonbon_horizontal_2', "188": "bonbon_horizontal_3", "189": "bonbon_horizontal_4", "190": "bonbon_vertical_1", "191": "bonbon_vertical_2", "192": "bonbon_vertical_3", "193": "bonbon_vertical_4", "194": "bonbon_fish_1", "195": "bonbon_fish_2", "196": "bonbon_fish_3", "197": "bonbon_fish_4", "198": "bonbon_wrapped_1", "199": "bonbon_wrapped_2", "200": "bonbon_wrapped_3", "201": "bonbon_wrapped_4" }
const tiles = { "empty": "empty", "000": "none", "001": "grid", "003": "jelly", "004": "jelly2", "064": "blue_tile", "065": "black_tile" }
const ingredients = { "125": "sprinks" }
const walldown = { "087": "wall_down", "165": "licorice_wall_down", "110": "destructible_wall_1_down", "114": "destructible_wall_2_down", "118": "destructible_wall_3_down", "169": "destructible_wall_lic_1_down", "173": "destructible_wall_lic_2_down", "177": "destructible_wall_lic_3_down" }
const wallup = { "086": "wall_up", "164": "licorice_wall_up", "109": "destructible_wall_1_up", "113": "destructible_wall_2_up", "117": "destructible_wall_3_up", "168": "destructible_wall_lic_1_up", "172": "destructible_wall_lic_2_up", "176": "destructible_wall_lic_3_up" }
const wallright = { "089": "wall_right", "167": "licorice_wall_right", "112": "destructible_wall_1_right", "116": "destructible_wall_2_right", "120": "destructible_wall_3_right", "171": "destructible_wall_lic_1_right", "175": "destructible_wall_lic_2_right", "179": "destructible_wall_lic_3_right" }
const wallleft = { "088": "wall_left", "166": "licorice_wall_left", "111": "destructible_wall_1_left", "115": "destructible_wall_2_left", "119": "destructible_wall_3_left", "170": "destructible_wall_lic_1_left", "174": "destructible_wall_lic_2_left", "178": "destructible_wall_lic_3_left" }
const rainbowcannontop = { "152": "rainbow_rapid_cannon_top" }
const rainbowcannonbottom = { "153": "rainbow_rapid_cannon_bottom" }
const rainbowcannonleft = { "154": "rainbow_rapid_cannon_left" }
const rainbowcannonright = { "155": "rainbow_rapid_cannon_right" }
const cannons = { "027": "cannon_ingredient", "028": "cannon_licorice", "029": "cannon_bomb", "030": "cannon_mulock_key", "031": "cannon_mystery", "067": "cannon_chameleon", "068": "cannon_lucky", "069": "cannon_extra_time_and_moves", "071": "cannon_striped", "072": "cannon_wrapped_candy", "090": "cannon_block_waffle", "107": "cannon_striped_horizontal", "108": "cannon_striped_vertical", "127": "cannon_colorbomb", "128": "cannon_fish", "137": "cannon_sugar_coat", "214": "cannon_blue", "215": "cannon_green", "216": "cannon_orange", "217": "cannon_purple", "218": "cannon_red", "219": "cannon_yellow" }
const path = { "140": "rainbow_stream_vertical", "141": "rainbow_stream_horizontal", "142": "rainbow_stream_BL", "143": "rainbow_stream_BR", "144": "rainbow_stream_TL", "145": "rainbow_stream_TR", "146": "rainbow_stream_TBL", "147": "rainbow_stream_TBR", "148": "rainbow_stream_TLR", "149": "rainbow_stream_BLR", "150": "rainbow_stream_all_directions", "151": "rainbow_stream_intersection_point" }
const leaflayer = { "063": 'leaf' }

// Conveyor belt elements
const conveyor = { 
    "conveyor_up": "conveyor_up", 
    "conveyor_down": "conveyor_down", 
    "conveyor_left": "conveyor_left", 
    "conveyor_right": "conveyor_right",
    "conveyor_corner_top_left": "conveyor_corner_top_left",
    "conveyor_corner_top_right": "conveyor_corner_top_right", 
    "conveyor_corner_bottom_left": "conveyor_corner_bottom_left",
    "conveyor_corner_bottom_right": "conveyor_corner_bottom_right"
}
const conveyorPortals = { 
    "conveyor_entrance_blue": "conveyor_entrance_blue", 
    "conveyor_entrance_green": "conveyor_entrance_green", 
    "conveyor_entrance_purple": "conveyor_entrance_purple",
    "conveyor_entrance_up": "conveyor_entrance_up",
    "conveyor_entrance_down": "conveyor_entrance_down", 
    "conveyor_entrance_left": "conveyor_entrance_left",
    "conveyor_entrance_right": "conveyor_entrance_right"
}

//014 and 015 are unused ids so i'm using them to designate invisible porta;s
const portalentrance = {'012':'portal_entrance','014':'portal_entrance_hidden'}
const portalexit = {'013':'portal_exit','015':'portal_exit_hidden'}

const elements_ids = Object.assign({}, rainbowcannontop, rainbowcannonbottom, rainbowcannonleft, rainbowcannonright, leaflayer, colors, cannons, walldown, wallup, bonbon, path, wallright, wallleft, coloredCandy, candy, blockers, tiles, ingredients, sugarCoats, locks, glass, portalentrance, portalexit, conveyor, conveyorPortals, { "010": "ingredients_exit", "026": "candy_entrance", "005": "candy_cannon" })

const stretched = ["009", "019", "020", "021", "022", "023", "025", "122", "123", "124", "134", "135", "136", "054", "157", "158", "024", "211", "212", "213", "220", "221", "159", "160", "161", "162", "163", "062"].concat(Object.keys(bonbon))
const small = [].concat(Object.keys(colors), Object.keys(coloredCandy), ["017", "002", "079", "080", "081", "082", "083", "044", "043", "125", "126"]);

const layers = [
    "tile",
    "conveyor",
    "path",
    "leaf",
    "portal_entrance",
    "portal_exit",
    "normal",
    "conveyor_portal",
    "bonbonoverlay",
    "sugarcoat",
    "lock",
    "glass",
    "wallup",
    "walldown",
    "wallleft",
    "wallright",
    'rainbow_cannon_top',
    "rainbow_cannon_bottom",
    "rainbow_cannon_left",
    "rainbow_cannon_right",
    "ingredients_exit",
    "candy_cannon",
    "candy_entrance",
    "cobra_basket",
    "selectimg"
]

const elementsFolder = "assets/bundled/tex/elements/"

// Function to get URL parameters
function getURLParameter(name) {
    console.log('Getting URL parameter:', name);
    
    // Try to get from parent window first (if embedded)
    let urlParams;
    if (window.parent && window.parent !== window) {
        console.log('Trying parent window URL');
        urlParams = new URLSearchParams(window.parent.location.search);
    } else {
        console.log('Using current window URL');
        urlParams = new URLSearchParams(window.location.search);
    }
    
    const value = urlParams.get(name);
    console.log('URL parameter value:', value);
    return value;
}

// Function to get layer from element ID
function getLayerFromId(id) {
    const layerElements = {
        "tile": [].concat(Object.keys(tiles)),
        "conveyor": [].concat(Object.keys(conveyor)),
        "path": [].concat(Object.keys(path)),
        "leaf": [].concat(Object.keys(leaflayer)),
        "normal": [].concat(Object.keys(colors), Object.keys(coloredCandy), Object.keys(candy), Object.keys(blockers), Object.keys(ingredients), Object.keys(bonbon)),
        "conveyor_portal": [].concat(Object.keys(conveyorPortals)),
        "sugarcoat": [].concat(Object.keys(sugarCoats)),
        "lock": [].concat(Object.keys(locks)),
        "glass": [].concat(Object.keys(glass)),
        "wallup": [].concat(Object.keys(wallup)),
        "walldown": [].concat(Object.keys(walldown)),
        "wallleft": [].concat(Object.keys(wallleft)),
        "wallright": [].concat(Object.keys(wallright)),
        "rainbow_cannon_top": [].concat(Object.keys(rainbowcannontop)),
        "rainbow_cannon_bottom": [].concat(Object.keys(rainbowcannonbottom)),
        "rainbow_cannon_left": [].concat(Object.keys(rainbowcannonleft)),
        "rainbow_cannon_right": [].concat(Object.keys(rainbowcannonright)),
        "ingredients_exit": ["010"],
        "candy_entrance": ["026"],
        "candy_cannon": ["005"].concat(Object.keys(cannons)),
        "cobra_basket": ["227"],
        "portal_entrance":[].concat(Object.keys(portalentrance)),
        "portal_exit":[].concat(Object.keys(portalexit))
    };

    for (let layer in layerElements) {
        if (layerElements[layer].includes(id)) {
            return layer;
        }
    }
    return undefined;
}

// Function to create the board table
function createBoardTable(size = 9) {
    const levelTable = document.getElementById('level');
    if (!levelTable) {
        console.error('Level table element not found');
        return;
    }
    
    levelTable.innerHTML = "";
    
    for (let i = 0; i < size; i++) {
        const row = document.createElement("tr");
        levelTable.appendChild(row);
        
        for (let g = 0; g < size; g++) {
            const object = document.createElement("td");
            object.setAttribute("style", "position: relative; left: 0; top: 0;");
            object.setAttribute("pos-row", i);
            object.setAttribute("pos-col", g);
            object.setAttribute("candy_cannon", '');

            // Add event listeners for tile interaction
            object.addEventListener('mouseover', function(event) {
                event.preventDefault();
                this.classList.add("selected");
            });

            object.addEventListener('mouseout', function(event) {
                event.preventDefault();
                try {
                    this.classList.remove("selected");
                } catch { }
            });

            object.addEventListener('click', function(event) {
                event.preventDefault();
                handleTileClick(this);
            });

            // Set default attributes
            object.setAttribute('normal', "002");
            object.setAttribute('color', "002");
            object.setAttribute('tile', "001");

            // Create ammo container
            let ammo = object.appendChild(document.createElement("div"));
            ammo.classList.add("ammocontainer");

            // Create image elements for all layers
            layers.forEach(function(layer) {
                let image = document.createElement("img");
                image.setAttribute('draggable', false);
                image.classList.add(layer);
                image.classList.add("default");
                object.appendChild(image);
            });

            // Set default tile image
            let image = object.querySelector(".tile");
            image.src = elementsFolder + 'grid.png';
            image.classList.remove("default");

            // Set default normal element
            image = object.querySelector(".normal");
            image.src = elementsFolder + elements_ids["002"] + ".png";
            image.classList.add("small");

            // Set select image (hidden by default)
            image = object.querySelector(".selectimg");
            image.src = elementsFolder + "select.png";
            image.style.display = "none";

            row.appendChild(object);
        }
    }
}

// Function to handle tile click
function handleTileClick(tile) {
    // Remove selection from previously selected tile
    if (selectedTile) {
        const prevSelectImg = selectedTile.querySelector('.selectimg');
        const prevNormalImg = selectedTile.querySelector('.normal');
        if (prevSelectImg) prevSelectImg.style.display = "none";
        if (prevNormalImg) prevNormalImg.style.filter = "";
    }
    
    // Select new tile
    selectedTile = tile;
    
    // Show selection image
    const selectImg = tile.querySelector('.selectimg');
    if (selectImg) {
        selectImg.style.display = "block";
    }
    
    // Increase brightness of normal element for 0.1s linear
    const normalImg = tile.querySelector('.normal');
    if (normalImg) {
        normalImg.style.transition = "filter 0.1s linear !important";
        normalImg.style.filter = "brightness(1.4)";
        setTimeout(() => {
            normalImg.style.filter = "";
        }, 100);
    }
}

// Function to update tile visual
function updateTileVisual(object, elementId, layer, color) {
    const image = object.querySelector("." + layer);
    if (!image) return;

    try {
        if (layer === "tile") {
            if (elementId === "empty") {
                // Clear all elements
                layers.forEach(function(layer) {
                    if (object.hasAttribute(layer) && layer != "tile") {
                        object.setAttribute(layer, "");
                    }
                });
                
                object.childNodes.forEach(function(node) {
                    if (!node.classList.contains("selectimg") && !node.classList.contains("tile")) {
                        node.src = "";
                        if (node.style) {
                            node.style.transform = "";
                        }
                    }
                });
                object.setAttribute("color", "");
                return;
            }
            
            object.setAttribute("tile", elementId);
            image.src = elementsFolder + elements_ids[elementId] + ".png";

            if (elementId === "000") {
                // Clear all if empty
                layers.forEach(function(layer) {
                    if (object.hasAttribute(layer)) {
                        object.setAttribute(layer, "");
                    }
                });
                
                object.childNodes.forEach(function(node) {
                    if (!node.classList.contains("selectimg") && !node.classList.contains("tile")) {
                        node.src = "";
                        if (node.style) {
                            node.style.transform = "";
                        }
                    }
                });
                object.setAttribute("color", "");
            }
        } else if (layer === "normal") {
            if (elementId in coloredCandy) {
                // Handle colored candy
                let colorName = elements_ids[color];
                let elementName = "";
                let name = "";

                console.log('Processing colored candy:', elementId, 'with color:', color, 'colorName:', colorName);

                if (color === "002" && elementId === "002") {
                    name = "random";
                } else if (color !== "002" && elementId === "002") {
                    name = colorName;
                } else {
                    elementName = elements_ids[elementId] + "_";
                    name = elementName + colorName;
                }

                console.log('Final image name:', name);
                image.src = elementsFolder + name + ".png";
                object.setAttribute("normal", elementId);
                object.setAttribute("color", color);
            } else {
                // Handle non-colored candy
                image.src = elementsFolder + elements_ids[elementId] + ".png";
                object.setAttribute("normal", elementId);
                object.setAttribute("color", "");
            }
        } else {
            // Handle other layers
            object.setAttribute(layer, elementId);
            image.src = elementsFolder + elements_ids[elementId] + ".png";
        }

        // Apply size classes
        if (small.includes(elementId)) {
            if (!image.classList.contains("small")) {
                image.classList.add("small");
            }
        } else {
            try {
                image.classList.remove("small");
            } catch { }
        }

        if (stretched.includes(elementId)) {
            if (!image.classList.contains("stretched")) {
                image.classList.add("stretched");
            }
        } else {
            try {
                image.classList.remove("stretched");
            } catch { }
        }

    } catch (error) {
        console.warn('Error updating tile visual:', error);
    }
}

// Function to import level data
function importLevel(levelData) {
    if (!levelData || !levelData.tileMap) {
        console.error('Invalid level data');
        return;
    }
    
    const levelArray = levelData.tileMap;
    const gridSize = levelArray.length;
    
    // Create the board table
    createBoardTable(gridSize);
    
    const levelObject = document.getElementById("level");
    const childrenRows = [].slice.call(levelObject.children);
    
    let blacklistedCake = [];

    childrenRows.forEach(function(row, rIndex) {
        let objects = [].slice.call(row.children);
        let color = "002";

        objects.forEach(function(object, cIndex) {
            try {
                // Parse the tile data
                let textObject = levelArray[rIndex][cIndex].match(/.{1,3}/g);
                
                if (!textObject) {
                    console.warn('No tile data at position:', rIndex, cIndex);
                    return;
                }

                // Extract color information
                textObject.forEach(function(objectId, index) {
                    if (objectId in colors) {
                        color = objectId;
                        console.log('Found color:', objectId, 'at index:', index, 'in tile data:', levelArray[rIndex][cIndex]);
                        if (objectId != "002") {
                            textObject.splice(index, 1);
                        }
                    }
                });

                // Process each element
                textObject.forEach(function(objectId) {
                    if (objectId.length !== 3) {
                        console.warn('Invalid object ID length:', objectId);
                        return;
                    }

                    if (objectId == "002" && object.getAttribute("normal") != undefined) {
                        return;
                    }

                    // Handle special cases
                    if (objectId === "085") objectId = "069";
                    if (objectId === '084') objectId = '050';

                    // Skip portals for now
                    if (objectId === '011' || objectId === '012' || objectId === '013' || objectId === '014' || objectId === '015') {
                        return;
                    }

                    // Handle cake bomb
                    if (objectId == "035") {
                        if (blacklistedCake.includes(String(rIndex) + String(cIndex))) {
                            return;
                        } else {
                            if (cIndex >= gridSize - 1 || rIndex >= gridSize - 1) {
                                return;
                            } else {
                                blacklistedCake.push(String(rIndex) + String(cIndex + 1));
                                blacklistedCake.push(String(rIndex + 1) + String(cIndex));
                                blacklistedCake.push(String(rIndex + 1) + String(cIndex + 1));
                            }
                        }
                    }

                    // Get layer and update tile
                    let layer = getLayerFromId(objectId);
                    
                    console.log('Processing element:', objectId, 'layer:', layer, 'color:', color, 'at position:', rIndex, cIndex);
                    
                    if (layer) {
                        updateTileVisual(object, objectId, layer, color);
                    }
                });
            } catch (error) {
                console.error('Error processing tile at position:', rIndex, cIndex, error);
            }
        });
    });
}

// Function to load level data from URL
function loadLevelFromURL() {
    console.log('Current URL:', window.location.href);
    console.log('Current URL search params:', window.location.search);
    
    if (window.parent && window.parent !== window) {
        console.log('Parent URL:', window.parent.location.href);
        console.log('Parent URL search params:', window.parent.location.search);
    }
    
    const levelDataParam = getURLParameter('data');
    console.log('Level data parameter:', levelDataParam);
    
    if (!levelDataParam) {
        console.log('No level data found in URL parameters');
        // Create empty board as fallback
        createBoardTable(9);
        return;
    }
    
    try {
        // Decode the level data
        const decodedData = decodeURIComponent(levelDataParam);
        const levelData = JSON.parse(decodedData);
        
        console.log('Loading level data:', levelData);
        currentLevelData = levelData;
        
        // Import the level
        importLevel(levelData);
        
    } catch (error) {
        console.error('Error loading level data:', error);
        // Create empty board as fallback
        createBoardTable(9);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Player script initialized');
    
    // Load level data from URL
    loadLevelFromURL();
    
    // Add test function to window for debugging
    window.testLevel = function() {
        // Create a simple test level with colored candy
        const testLevelData = {
            tileMap: [
                ["001002", "001002057", "001002", "001002", "001002", "001002", "001002", "001002", "001002"],
                ["001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002"],
                ["001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002"],
                ["001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002"],
                ["001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002"],
                ["001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002"],
                ["001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002"],
                ["001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002"],
                ["001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002", "001002"]
            ]
        };
        
        console.log('Loading test level:', testLevelData);
        currentLevelData = testLevelData;
        importLevel(testLevelData);
    };
    
    // Auto-load test level if no URL data (for testing)
    if (!getURLParameter('data')) {
        console.log('No URL data found, loading test level...');
        setTimeout(() => {
            window.testLevel();
        }, 1000);
    }
});

// Export functions for debugging
window.playerScript = {
    loadLevelFromURL,
    importLevel,
    createBoardTable,
    handleTileClick
};

// Loading and scene transition logic

function showScene(sceneName) {
    // Hide all scenes
    document.querySelectorAll('[scene]').forEach(el => {
        el.classList.add('none');
        el.style.display = 'none';
    });
    // Show the requested scene
    const el = document.querySelector(`[scene="${sceneName}"]`);
    if (el) {
        el.classList.remove('none');
        el.style.display = 'flex';
    }
}

// Initial loading sequence
document.addEventListener('DOMContentLoaded', function() {
    // On page load, show ccsloading, hide kingload
    setTimeout(() => {
        showScene('ccsloading');
        showScene('kingload'); // This will hide kingload
        // After 2.5s, fade out #placeholderloadingtext, then show mainmenu
        setTimeout(() => {
            const loadingText = document.getElementById('placeholderloadingtext');
            if (loadingText) {
                loadingText.style.transition = 'opacity 0.5s';
                loadingText.style.opacity = '0';
                setTimeout(() => {
                    loadingText.style.display = 'none';
                    showScene('mainmenu');
                }, 500);
            } else {
                showScene('mainmenu');
            }
        }, 2500);
    }, 4000);
});

// Handle #levelOpen click
document.addEventListener('DOMContentLoaded', function() {
    const levelOpenBtn = document.getElementById('levelOpen');
    if (levelOpenBtn) {
        levelOpenBtn.addEventListener('click', function() {
            // Hide mainmenu, show ccsloading
            levelOpenBtn.style.display = 'none';
            showScene('ccsloading');
            // Fade out loading text after 2s, then show mainLevel
            setTimeout(() => {
                const loadingText = document.getElementById('placeholderloadingtext');
                if (loadingText) {
                    loadingText.style.transition = 'opacity 0.5s';
                    loadingText.style.opacity = '0';
                    setTimeout(() => {
                        loadingText.style.display = 'none';
                        showScene('mainLevel');
                    }, 500);
                } else {
                    showScene('mainLevel');
                }
            }, 2000);
        });
    }
});
