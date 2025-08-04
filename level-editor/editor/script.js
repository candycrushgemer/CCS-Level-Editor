// Global utility functions
function isMobile() {
    return window.innerWidth <= 860 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const colors = { "002": "random", "055": "red", "056": "yellow", "057": "blue", "058": "green", "059": "orange", "060": "purple" }
const coloredCandy = { "002": "random", "018": "pepper_candy", "036": "frog", "045": "striped_horizontal", "046": "striped_vertical", "047": "wrapped", "049": "jellyfish", "051": "key", "052": "lucky", "032": "mystery", "033": "chameleon", "050": "extra_time_and_moves", "091": "jellyfish_striped", "092": "jellyfish_wrapped", "093": "jellyfish_colorbomb" }
const candy = { "044": "bomb", "043": "coconut_wheel", "061": "ufo" }
const sugarCoats = { "134": "sugarcoat_1", "135": "sugarcoat_2", "136": "sugarcoat_3" }
const locks = { "008": "licorice", "025": "marmalade", "038": "mulock1", "039": "mulock2", "040": "mulock3", "041": "mulock4", "042": "mulock5" }
const glass = { "122": "glass_tile_1", "123": "glass_tile_2", "124": "glass_tile_3", }
const blockers = { "007": "block_frosting", "053": "chocolate_frog", "009": "chocolate", "017": "licorice_square", "019": "block_multi_frosting1", "020": "block_multi_frosting2", "021": "block_multi_frosting3", "022": "block_multi_frosting4", "023": "block_multi_frosting5", "024": "chocolate_spawner", "035": "cake_bomb", "054": "shell_1", "062": "magic_mixer", "066": "bobber", "079": "block_waffle1", "080": "block_waffle2", "081": "block_waffle3", "082": "block_waffle4", "083": "block_waffle5", "094": "dark_chocolate_1", "095": "dark_chocolate_2", "096": "dark_chocolate_3", "097": "dark_chocolate_4", "098": "dark_chocolate_5", "129": "chain_layer1_c", "130": "chain_layer2_c", "131": "chain_layer3_c", "132": "chain_layer4_c", "133": "chain_layer5_c", "157": "shell_3", "158": "shell_2", "159": "bubble_pop_1", "160": "bubble_pop_2", "161": "bubble_pop_3", "162": "bubble_pop_4", "163": "bubble_pop_5", "211": "dark_chocolate_spawner_1", "212": "dark_chocolate_spawner_2", "213": "dark_chocolate_spawner_3", "220": "jelly_jar_1", "221": "jelly_jar_2", "037": "toffee_tornado", "070": "pinata", "073": "pinata_crash", "074": "pinata_link1", "075": "pinata_link2", "076": "pinata_link3", "077": "pinata_unbreakable", "078": "pinata_empty", "156": "rainbow_rapid_mold", "222": "cobra_5", "223": "cobra_4", "224": "cobra_3", "225": "cobra_2", "226": "cobra_1", "227": "cobra_basket", "228": "gumball_machine_empty", "229": "gumball_machine" }
const bonbon = { "182": "bonbon_colorbomb_1", "183": "bonbon_colorbomb_2", "184": "bonbon_colorbomb_3", "185": "bonbon_colorbomb_4", "186": "bonbon_horizontal_1", "187": 'bonbon_horizontal_2', "188": "bonbon_horizontal_3", "189": "bonbon_horizontal_4", "190": "bonbon_vertical_1", "191": "bonbon_vertical_2", "192": "bonbon_vertical_3", "193": "bonbon_vertical_4", "194": "bonbon_fish_1", "195": "bonbon_fish_2", "196": "bonbon_fish_3", "197": "bonbon_fish_4", "198": "bonbon_wrapped_1", "199": "bonbon_wrapped_2", "200": "bonbon_wrapped_3", "201": "bonbon_wrapped_4" }
const tiles = { "empty": "empty", "000": "none", "001": "grid", "003": "jelly", "004": "jelly2", "064": "blue_tile", "065": "black_tile" }
const ingredients = { "125": "cherry", "126": "hazelnut" }
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
const conveyor = { "conveyor_up": "conveyor_up", "conveyor_down": "conveyor_down", "conveyor_left": "conveyor_left", "conveyor_right": "conveyor_right" }
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
const elements_names = _.invert(elements_ids)

const stretched = ["009", "019", "020", "021", "022", "023", "025", "122", "123", "124", "134", "135", "136", "054", "157", "158", "024", "211", "212", "213", "220", "221", "159", "160", "161", "162", "163", "062"].concat(Object.keys(bonbon))
const small = [].concat(Object.keys(colors), Object.keys(coloredCandy), ["017", "002", "079", "080", "081", "082", "083", "044", "043", "125", "126"]);

const sugarCoatable = ["044", "017", "079", "080", "081", "082", "083", "125", "126", "043", "061"]

const elementsFolder = "elements/"
var selectedColor = "002"
var selectedElement = "002"
var elementLayer = "normal"
var currentMode = "Classic moves"

// Candy cobra tracking variables
var lastCobraTile = null
var lastCobraLayer = null
var waitingForCobraBasket = false
var lastCobraElement = null

// Conveyor belt grouping variables
var conveyorGroups = []
var currentConveyorGroup = []
var isConveyorGroupingMode = false

// Conveyor belt direction mapping
const conveyorDirections = {
    "conveyor_up": 0,
    "conveyor_right": 1, 
    "conveyor_down": 2,
    "conveyor_left": 3
}

// Conveyor portal color mapping
const conveyorPortalColors = {
    "conveyor_entrance_blue": 2,
    "conveyor_entrance_green": 3,
    "conveyor_entrance_purple": 1,
    "conveyor_entrance_up": 0,
    "conveyor_entrance_down": 2,
    "conveyor_entrance_left": 3,
    "conveyor_entrance_right": 1
}

// Candy cobra layer mapping
const cobraLayerMapping = {
    "cobra_1": 1,
    "cobra_2": 2,
    "cobra_3": 3,
    "cobra_4": 4,
    "cobra_5": 5
}

const orderItems = { "1": "red", "2": "blue", "3": "yellow", "4": "orange", "5": "purple", "6": "green", "7": "wrapped", "8": "striped", "9": "colorbomb", "10": "striped + striped", "11": "striped + wrapped", "12": "striped + colorbomb", "13": "colorbomb + colorbomb", "14": "wrapped + colorbomb", "15": "wrapped + wrapped", "16": "chocolate", "17": "frosting", "18": "licorice shell", "19": "licorice", "20": "pepper bomb", "21": "jellyfish", "22": "cake bomb", "23": "mystery candy", "24": "magic mixer", "25": "waffle", "26": "dark chocolate", "27": "candy cane curl", "28": "crystal candy", "29": "rainbow twist", "30": "frog", "31": "sugar coat", "32": "bubblegum", "33": "licorice curl", "34": "sour skull", "35": "bonbon blitz", "36": "jelly jar", "37": "candy cobra", "37": "wonderful wrapper" }

const magicMixerItems = { "0": "All Blockers", "1": "pepper bomb", "2": "licorice", "3": "frosting (1 layer)", "4": "frosting (2 layers)", "5": "frosting (3 layers)", "6": "frosting (4 layers)", "7": "frosting (5 layers)", "8": "chocolate", "9": "licorice lock", "10": "marmalade", "11": "dark chocolate (1 layer)", "12": "dark chocolate (2 layers)", "13": "dark chocolate (3 layers)", "14": "crystal candy (1 layer)", "15": "crystal candy (2 layers)", "16": "crystal candy (3 layers)", "17": "toffee swirl (1 layer)", "18": "toffee swirl (2 layers)", "19": "toffee swirl (3 layers)", "20": "toffee swirl (4 layers)", "21": "toffee swirl (5 layers)", "22": "rainbow twist (1 layer)", "23": "rainbow twist (2 layers)", "24": "rainbow twist (3 layer)", "25": "rainbow twist (4 layer)", "26": "rainbow twist (5 layer)", "27": "sugar coat (1 layer)", "28": "sugar coat (2 layers)", "29": "sugar coat (3 layers)", "30": "bubblegum pop (1 layer)", "31": "bubblegum pop (2 layers)", "32": "bubblegum pop (3 layers)", "33": "bubblegum pop (4 layers)", "34": "bubblegum pop (5 layers)", "35": "color bomb bonbon blitz (one-charged)", "36": "color bomb bonbon blitz (two-charged)", "37": "color bomb bonbon blitz (three-charged)", "38": "color bomb bonbon blitz (four-charged)", "39": "horizontal striped candy bonbon blitz (one-charged)", "40": "horizontal striped candy bonbon blitz (two-charged)", "41": "horizontal striped candy bonbon blitz (three-charged)", "42": "horizontal striped candy bonbon blitz (four-charged)", "43": "vertical striped candy bonbon blitz (one-charged)", "44": "vertical striped candy bonbon blitz (two-charged)", "45": "vertical striped candy bonbon blitz (three-charged)", "46": "vertical striped candy bonbon blitz (four-charged)", "47": "jelly fish bonbon blitz (one charged)", "48": "jelly fish bonbon blitz (two charged)", "49": "jelly fish bonbon blitz (three charged)", "50": "jelly fish bonbon blitz (four charged)", "51": "wrapped candy bonbon blitz (one-charged)", "52": "wrapped candy bonbon blitz (two-charged)", "53": "wrapped candy bonbon blitz (three-charged)", "54": "wrapped candy bonbon blitz (four-charged)" }

const cannonCodes = [["fallingIcing", "Level"], ["licorice"], ["luckyCandy"], ["mulockCandy"], ["pepperCandy", "ExplosionTurns"], ["stripedCandy"], ["stripedRowCandy"], ["stripedColumnCandy"], ["timeCandy"], ["wrappedCandy"], ["colorBomb"], ["fish"], ["shield", "Level"], ["extraMoves"]]

//Order of the layers
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
}

var preferredColors = [0, 1, 2, 3, 4]

var isDown = false

var lastPortalObject = undefined
var isPortalTimeout

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1 / ++count)
            result = prop;
    return result;
}

// Conveyor belt grouping functions
function finishConveyorGroup() {
    if (currentConveyorGroup.length > 0) {
        conveyorGroups.push([...currentConveyorGroup])
        currentConveyorGroup = []
        isConveyorGroupingMode = false
        
        // Hide the button after grouping is done
        const btn = document.getElementById('done-conveyor-btn')
        if (btn) {
            btn.style.display = 'none'
        }
        
        console.log('Conveyor group finished:', conveyorGroups)
    } else if (conveyorGroups.length === 0) {
        // If no manual groups were created, the export will use auto-grouping
        console.log('No manual groups created, will use auto-grouping during export')
        
        // Hide the button even if no groups were created
        const btn = document.getElementById('done-conveyor-btn')
        if (btn) {
            btn.style.display = 'none'
        }
    }
}

function startConveyorGrouping() {
    isConveyorGroupingMode = true
    currentConveyorGroup = []
    
    // Update button text
    const btn = document.getElementById('done-conveyor-btn')
    if (btn) {
        btn.innerHTML = '<md-icon slot="start">group_work</md-icon>Finish current group'
    }
}

function addToConveyorGroup(belt) {
    if (isConveyorGroupingMode) {
        currentConveyorGroup.push(belt)
        console.log('Added to current group:', belt)
    }
}

// Function to check if there are any conveyor belts on the board
function checkConveyorBeltsOnBoard() {
    const level = document.getElementById('level')
    let hasConveyorBelts = false
    
    level.childNodes.forEach(function (row) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            if (object.hasAttribute('conveyor') && object.getAttribute('conveyor') !== '') {
                hasConveyorBelts = true
                break
            }
        }
        if (hasConveyorBelts) return
    })
    
    // Show/hide the button based on whether there are conveyor belts
    const btn = document.getElementById('done-conveyor-btn')
    if (btn) {
        btn.style.display = hasConveyorBelts ? 'block' : 'none'
    }
    
    return hasConveyorBelts
}

// Function to detect if conveyor belts are adjacent and should be grouped
function shouldGroupConveyorBelts(belt1, belt2) {
    // Check if belts are adjacent
    const rowDiff = Math.abs(belt1.row - belt2.row)
    const colDiff = Math.abs(belt1.col - belt2.col)
    
    // Adjacent if they share a row or column and are next to each other
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

// Function to automatically detect and group conveyor belts
function autoGroupConveyorBelts() {
    // This will be called when the user clicks "Done putting conveyor belt"
    // to automatically group any ungrouped belts
    if (conveyorGroups.length === 0) {
        // Auto-group any remaining belts
        finishConveyorGroup()
    }
}

function getLayerFromId(id) {
    let layer = undefined

    keys = Object.keys(layerElements)
    for (var i = 0; i < keys.length; i++) {
        key = keys[i]
        if (layerElements[key].includes(id)) {
            layer = key
            break
        }
    }
    return layer
}

function toggleDreamworld(object) {
    document.getElementById("dreamworldoptions").style.display = object.checked ? "block" : "none"
}


function removePortal(object,isExit) {
    let level = document.getElementById("level")
    let objToDelete
    //console.log('removing portal ' + isExit)
    if (isExit) {
        object.setAttribute('portal_exit','')
        object.querySelector(".portal_exit").src = ''
        object.querySelector(".portal_exit").setAttribute("class", "portal_exit default small")
        try {
            objToDelete = level.children[object.getAttribute('portalentrancerow')].children[object.getAttribute('portalentrancecol')]
            objToDelete.setAttribute('portal_entrance','')
            objToDelete.querySelector(".portal_entrance").src = ''
            objToDelete.setAttribute('portalexitrow','')
            objToDelete.setAttribute('portalexitcol','')
        } catch (err) {}
        object.setAttribute('portalentrancerow','')
        object.setAttribute('portalentrancecol','')
    } else {
        object.setAttribute('portal_entrance','')
        object.querySelector(".portal_entrance").src = ''
        object.querySelector(".portal_entrance").setAttribute("class", "portal_entrance default small")
        try {
            objToDelete = level.children[object.getAttribute('portalexitrow')].children[object.getAttribute('portalexitcol')]
            objToDelete.setAttribute('portal_exit','')
            objToDelete.querySelector(".portal_exit").src = ''
            objToDelete.setAttribute('portalentrancerow','')
            objToDelete.setAttribute('portalentrancecol','')
        } catch (err) {}
        object.setAttribute('portalexitrow','')
        object.setAttribute('portalexitcol','')
    }

}

function switchedRequirement(object) {
    document.getElementById("requirementwarning").style.display = "none"
    let requirement = object.value
    let image = object.parentNode.querySelector("img")
    image.src = "ui/hud/" + orderItems[requirement] + ".png"
}

function switchedRequirementIngredient(object) {
    document.getElementById("requirementwarning").style.display = "none"
    let requirement = object.value
    let image = object.parentNode.querySelector("img")
    image.src = "ui/hud/" + requirement + ".png"
}

function removeRequirement(object) {
    object.parentNode.remove()
    document.getElementById("requirementwarning").style.display = "none"
}

function addRequirement(isIngredient = false, ignoreLimit = false) {
    let requirementsObj = document.getElementById("requirements")

    if (!ignoreLimit) {
        if (requirementsObj.childNodes.length > 3) {
            document.getElementById("requirementwarning").style.display = "block"
            return
        }
        else {
            document.getElementById("requirementwarning").style.display = "none"
        }
    }

    section = document.createElement("div")
    section.classList.add("sideoptions")
    section.style.display = "flex";
    section.style.alignItems = "center";
    section.style.justifyContent = "center";
    let typeText = "Order"
    section.setAttribute("reqtype", "order")
    if (isIngredient) {
        typeText = "Ingredient"
        section.setAttribute("reqtype", "ingredient")
    }
    section.innerHTML = '<button style="position: relative; border-radius: 50px; border: none; background-color: #ffffff00; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;" onclick="removeRequirement(this)"><md-icon>􀆄</md-icon></button> <br> <br> <img src="ui/hud/red.png" style="max-width: 30px; max-height: 30px; padding-right: 5px;"><select onchange="switchedRequirement(this)"> </select> <div class="break"></div> <p  style="margin: 10px; display: block; text-align: center;">Amount:</p> <input style="margin-top: 10px;height: 20px;width: 50px; padding: 10px;" placeholder="0" type="number">'

    select = section.querySelector("select")
    if (!isIngredient) {
        Object.keys(orderItems).forEach(function (key) {
            option = document.createElement("option")
            option.value = key
            option.innerHTML = orderItems[key]
            select.appendChild(option)
        })
    }
    else {
        select.setAttribute("onchange", "switchedRequirementIngredient(this)")
        section.querySelector("img").src = "ui/hud/cherry.png"

        let option
        option = document.createElement("option")
        option.value = "cherry"
        option.innerHTML = "cherry"
        select.appendChild(option)

        option = document.createElement("option")
        option.value = "hazelnut"
        option.innerHTML = "hazelnut"
        select.appendChild(option)
    }
    requirementsObj.prepend(section)
}

function switchedMixerOption(object) {
    document.getElementById("requirementwarning").style.display = "none"
    let requirement = object.value
    let image = object.parentNode.querySelector("img")
    image.src = "ui/hud/" + magicMixerItems[requirement] + ".png"
}

function addMixerOption() {
    let requirementsObj = document.getElementById("mixeroptions")

    section = document.createElement("div")
    section.classList.add("sideoptions")
    section.setAttribute("reqtype", "mixeroption")
    section.innerHTML = '<md-icon-button style="position: relative; border-radius: 50px; border: none; background-color: #ffffff00; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;" onclick="removeRequirement(this)"><md-icon>􀆄</md-icon></md-icon-button> <div class="break"></div> <img src="ui/hud/All Blockers.png" style="max-width: 30px; max-height: 30px;"> <p style="margin: 10px; display: block; text-align: center;">Blocker:</p> <select onchange="switchedMixerOption(this)" style="width: 100%;"> </select> <div class="break"></div>'

    select = section.querySelector("select")

    Object.keys(magicMixerItems).forEach(function (key) {
        option = document.createElement("option")
        option.value = key
        option.innerHTML = magicMixerItems[key]
        select.appendChild(option)
    })

    requirementsObj.prepend(section)
}

function selectMode() {
    mode = document.querySelector('input[name="leveltype"]:checked').value
    if (mode === "Classic" || mode == "Jelly Time") {
        document.getElementById("moves-section").style.display = "none"
        document.getElementById("time-section").style.display = "block"
    }
    else {
        document.getElementById("moves-section").style.display = "block"
        document.getElementById("time-section").style.display = "none"
    }

    document.getElementById("requirements-options-section").style.display = "none"

    if (mode.includes('Drop down') || mode.includes('Drop Down')) {
        document.getElementById("requirements-options-section").style.display = "flex"
        document.getElementById("addingredient").style.display = "inherit"
    } else {
        document.getElementById("addingredient").style.display = "none"
        let requirementsContainer = document.getElementById("requirements")
        Array.from(requirementsContainer.children).forEach(function (child) {
            if (child.getAttribute("reqtype") == "ingredient") {
                child.remove()
            }
        })
    }

    if (mode.includes('Order')) {
        document.getElementById("requirements-options-section").style.display = "flex"
        document.getElementById("addorder").style.display = "inherit"
    } else {
        document.getElementById("addorder").style.display = "none"
        let requirementsContainer = document.getElementById("requirements")
        Array.from(requirementsContainer.children).forEach(function (child) {
            if (child.getAttribute("reqtype") == "order") {
                child.remove()
            }
        })
    }
    /*
    if (mode === "Drop down"){
        document.getElementById("requirements-options-section").style.display = "block"
        document.getElementById("addingredient").style.display = "block"

        let requirementsContainer = document.getElementById("requirements")
        Array.from(requirementsContainer.children).forEach(function(child){
            element = child

            if (element.getAttribute("reqtype") == "order"){
                element.remove()
            }
        })
    }
    else{
        if (mode != "Order"){
            document.getElementById("requirements-options-section").style.display = "none"
        }
        document.getElementById("addingredient").style.display = "none"
    }

    if (mode == "Order"){
        document.getElementById("requirements-options-section").style.display = "block"
        document.getElementById("addorder").style.display = "block"

        let requirementsContainer = document.getElementById("requirements")
        Array.from(requirementsContainer.children).forEach(function(child){
            element = child

            if (element.getAttribute("reqtype") == "ingredient"){
                element.remove()
            }
        })
    }
    else {
        if (mode != "Drop down"){
            document.getElementById("requirements-options-section").style.display = "none"
        }
        document.getElementById("addorder").style.display = "none"
    }
    */
    currentMode = mode
}

function togglePreferred(object) {
    color = Number(object.getAttribute("value"))

    if (!preferredColors.includes(color)) {
        if (!(object.classList.contains("preferredselected"))) {
            object.classList.add("preferredselected")
        }

        preferredColors.push(color)
    }
    else {
        object.classList.remove("preferredselected")

        preferredColors.splice(preferredColors.indexOf(color), 1)
    }
}

function toggleDropdown(object) {
    let dropped = document.getElementById(object.getAttribute("associd"))
    let p = object.querySelector(".arrow")

    if (dropped.style.display == "none") {
        dropped.style.display = "block"
        p.style.transform = "rotate(" + 0 + "deg)"
    }
    else {
        dropped.style.display = "none"
        p.style.transform = "rotate(" + 90 + "deg)"
    }
}

function updateColor(object, color) {
    try {
        document.querySelector(".colorselected").classList.remove("colorselected")
    }
    catch { }
    object.classList.add("colorselected")
    selectedColor = elements_names[color]
}

function removeCake(object) {
    let cake = object.getAttribute("cake")
    let tiles = []
    let row = Number(object.getAttribute("pos-row"))
    let column = Number(object.getAttribute("pos-col"))
    let level = document.getElementById("level")

    object.setAttribute("normal", "002")
    object.setAttribute("color", "002")
    object.setAttribute("cake", "")
    object.querySelector(".normal").src = elementsFolder + "random.png"
    object.querySelector(".normal").setAttribute("class", "normal default small")

    if (cake == "1") {
        tiles = [[row, column + 1], [row + 1, column], [row + 1, column + 1]]
    }
    else if (cake == "2") {
        tiles = [[row, column - 1], [row + 1, column - 1], [row + 1, column]]
    }
    else if (cake == "3") {
        tiles = [[row - 1, column], [row - 1, column + 1], [row, column + 1]]
    }
    else if (cake == "4") {
        tiles = [[row - 1, column - 1], [row - 1, column], [row, column - 1]]
    }

    tiles.forEach(function (pos) {
        let otherObject = level.children[pos[0]].children[pos[1]]
        otherObject.setAttribute("normal", "002")
        otherObject.setAttribute("color", "002")
        otherObject.setAttribute("cake", "")
        otherObject.querySelector(".normal").src = elementsFolder + "random.png"
        otherObject.querySelector(".normal").setAttribute("class", "normal default small")
    })
}

function updateTile(object) {
    if (elementLayer !== "tile" && object.getAttribute("tile") === "000") {
        //Do not update tile if its empty
        return
    }
    
    if (isPortalTimeout) {return}
    
    // Prevent placing multiple cobras when waiting for basket
    if (waitingForCobraBasket && elementLayer == "normal" && (selectedElement === "222" || selectedElement === "223" || selectedElement === "224" || selectedElement === "225" || selectedElement === "226")) {
        return
    }

    let level = document.getElementById("level")

    let row = Number(object.getAttribute("pos-row"))
    let column = Number(object.getAttribute("pos-col"))

    isCake = object.getAttribute("cake")
    if (isCake !== undefined && isCake !== "" && elementLayer === "normal") {
        removeCake(object)
    }

    let isPortalEntrance = object.getAttribute('portal_entrance')
    let isPortalExit = object.getAttribute('portal_exit')

    let image = object.querySelector("." + elementLayer)

    try {

        if (elementLayer == "portal_entrance") {
            //remove existing portal and its coresponding one
            if (isPortalEntrance) {
                //console.log('removing portal entrance')
                removePortal(object,false)
            }
            lastPortalObject = object
        }
        else if (elementLayer == "portal_exit") {
            //remove existing portal and its corresponding one
            if (isPortalExit) {
                //console.log('removing portal exit')
                removePortal(object,true)
            }

            //set corresponding portal rows/cols
            object.setAttribute('portalentrancerow',lastPortalObject.getAttribute('pos-row'))
            object.setAttribute('portalentrancecol',lastPortalObject.getAttribute('pos-col'))
            lastPortalObject.setAttribute('portalexitrow',row)
            lastPortalObject.setAttribute('portalexitcol',column)
            lastPortalObject = undefined
        }

        if (elementLayer == "wallup") {
            let otherObject = level.children[row - 1].children[column]
            let hasWall = otherObject.getAttribute("walldown")
            if (hasWall !== null && hasWall !== "") {
                otherObject.setAttribute("walldown", "")
                otherObject.querySelector("img.walldown").src = ""
            }
        }
        else if (elementLayer == "walldown") {
            let otherObject = level.children[row + 1].children[column]
            let hasWall = otherObject.getAttribute("wallup")
            if (hasWall !== null && hasWall !== "") {
                otherObject.setAttribute("wallup", "")
                otherObject.querySelector("img.wallup").src = ""
            }
        }
        else if (elementLayer == "wallleft") {
            let otherObject = level.children[row].children[column - 1]
            let hasWall = otherObject.getAttribute("wallright")
            if (hasWall !== null && hasWall !== "") {
                otherObject.setAttribute("wallright", "")
                otherObject.querySelector("img.wallright").src = ""
            }
        }
        else if (elementLayer == "wallright") {
            let otherObject = level.children[row].children[column + 1]
            let hasWall = otherObject.getAttribute("wallleft")
            if (hasWall !== null && hasWall !== "") {
                otherObject.setAttribute("wallleft", "")
                otherObject.querySelector("img.wallleft").src = ""
            }
        }
    } catch { }

    if (elementLayer == "tile") {
        if (selectedElement === "empty") {
            if (isCake !== undefined && isCake !== "") {
                removeCake(object)
            }
            if (isPortalEntrance) {
                try {
                    removePortal(object,false)
                } catch (err) {}
            }
            if (isPortalExit) {
                try {
                    removePortal(object,true)
                } catch(err) {}
            }
            //Make space empty if empty selected
            layers.forEach(function (layer) {
                if (object.hasAttribute(layer) && layer != "tile") {
                    object.setAttribute(layer, "")
                }
            })
            
            // Check if conveyor belts were removed and hide button if none remain
            setTimeout(() => checkConveyorBeltsOnBoard(), 0)
            object.childNodes.forEach(function (node) {
                if (!node.classList.contains("selectimg") && !node.classList.contains("tile")) {
                    node.src = ""
                }
            })
            object.setAttribute("color", "")
            return
        }
        object.setAttribute("tile", selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"

        //Remove all if empty
        if (selectedElement === "000") {
            if (isCake !== undefined && isCake !== "") {
                removeCake(object)
            }

            if (isPortalEntrance) {
                removePortal(object,false)
            }

            if (isPortalExit) {
                removePortal(object,true)
            }

            layers.forEach(function (layer) {
                if (object.hasAttribute(layer)) {
                    object.setAttribute(layer, "")
                }
            })
            
            // Check if conveyor belts were removed and hide button if none remain
            setTimeout(() => checkConveyorBeltsOnBoard(), 0)
            object.childNodes.forEach(function (node) {
                if (!node.classList.contains("selectimg") && !node.classList.contains("tile")) {
                    node.src = ""
                }
            })
            object.setAttribute("color", "")
        }
    }
    if (elementLayer == "sugarcoat") {
        if (object.getAttribute("normal") in coloredCandy || sugarCoatable.includes(object.getAttribute("normal"))) {
            object.setAttribute(elementLayer, selectedElement)
            image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        }
        else {
            return
        }
    }
    else if (selectedElement == "035") {
        let level = document.getElementById("level")

        if (row >= 8 || column >= 8) {
            return
        }

        //Set this tile as cakebomb
        let isCake = object.getAttribute("cake")
        if (isCake !== undefined && isCake !== "") {
            removeCake(object)
        }
        image.src = elementsFolder + "cake_top_left" + ".png"
        image.setAttribute("class", "normal default stretch")
        object.setAttribute("normal", selectedElement)
        object.setAttribute("color", "")
        object.setAttribute("cake", "1")

        let tileList = [[row, column + 1, "cake_top_right", "2"], [row + 1, column, "cake_bottom_left", "3"], [row + 1, column + 1, "cake_bottom_right", "4"]]

        tileList.forEach(function (info) {
            try {
                let otherObject = level.children[info[0]].children[info[1]]
                let otherImage = otherObject.querySelector("img.normal")

                isCake = otherObject.getAttribute("cake")
                if (isCake !== undefined && isCake !== "") {
                    removeCake(otherObject)
                }

                otherImage.src = elementsFolder + info[2] + ".png"
                otherImage.setAttribute("class", "normal default stretch")
                otherObject.setAttribute("normal", selectedElement)
                otherObject.setAttribute("sugarcoat", "")
                otherObject.querySelector("img.sugarcoat").src = ""
                otherObject.setAttribute("color", "")
                otherObject.setAttribute("cake", info[3])
                if (otherObject.getAttribute("tile") === "000") {
                    otherObject.setAttribute("tile", "001")
                    otherObject.querySelector("img.tile").src = elementsFolder + "grid.png"
                }
            } catch { }
        })
    }
    else if (selectedElement == "036") {
        try {
            let prevElm = document.querySelector(".frog")
            prevElm.classList.remove("frog")

            if (prevElm.getAttribute("normal") === "036" || prevElm.getAttribute("normal") === "053") {
                prevElm.setAttribute("normal", "002")
                prevElm.setAttribute("color", selectedColor)
                prevElm.querySelector(".normal").src = elementsFolder + "random.png"
                prevElm.querySelector(".normal").setAttribute("class", "normal default small")
            }
        } catch { }

        //Set colored Candy
        let colorName = elements_ids[selectedColor]
        let elementName = ""
        let name = ""

        if (selectedColor === "002" && selectedElement === "002") {
            name = "random"
        }
        else if (selectedColor !== "002" && selectedElement === "002") {
            name = colorName
        }
        else {
            elementName = elements_ids[selectedElement] + "_"
            name = elementName + colorName
        }

        object.setAttribute(elementLayer, selectedElement)
        object.classList.add("frog")
        image.src = elementsFolder + name + ".png"
    }
    else if (selectedElement == "053") {
        try {
            let prevElm = document.querySelector(".frog")
            console.log(prevElm)
            prevElm.classList.remove("frog")

            if (prevElm.getAttribute("normal") === "036" || prevElm.getAttribute("normal") === "053") {
                prevElm.setAttribute("normal", "002")
                prevElm.setAttribute("color", selectedColor)
                prevElm.querySelector(".normal").src = elementsFolder + "random.png"
                prevElm.querySelector(".normal").setAttribute("class", "normal default small")
            }
        } catch { }

        object.classList.add("frog")
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        object.setAttribute("normal", selectedElement)
        object.setAttribute("color", "")
    }
    else if (elementLayer == "candy_cannon" && selectedElement != "005") {
        let cannonElements = JSON.parse(object.getAttribute("candy_cannon") || '[]')

        if (!cannonElements.includes(selectedElement)) {
            if (!cannonElements.includes("005")) {

                cannonElements.push("005")
            }

            cannonElements.push(selectedElement)

            object.setAttribute("candy_cannon", JSON.stringify(cannonElements))

            let ammocontainer = object.querySelector(".ammocontainer")

            Array.from(ammocontainer.children).forEach(function (element) {
                if (!cannonElements.includes(element.getAttribute("element"))) {
                    element.remove()
                }
            })

            ammoimage = ammocontainer.appendChild(document.createElement("img"))

            ammoimage.setAttribute("element", selectedElement)

            ammoimage.src = elementsFolder + elements_ids[selectedElement] + ".png"
        }
    }
    else if (selectedElement == "026") {
        let cannonElements = JSON.parse(object.getAttribute("candy_cannon") || '[]')

        if (!cannonElements.includes("005")) {

            cannonElements.push("005")
        }

        object.setAttribute("candy_cannon", JSON.stringify(cannonElements))

        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
    }
    else if (selectedElement == "005") {
        let cannonElements = JSON.parse(object.getAttribute("candy_cannon") || '[]')

        if (!cannonElements.includes("005")) {

            cannonElements.push("005")
        }

        let ammocontainer = object.querySelector(".ammocontainer")

        Array.from(ammocontainer.children).forEach(function (element) {
            if (!cannonElements.includes(element.getAttribute("element"))) {
                element.remove()
            }
        })

        object.setAttribute("candy_cannon", JSON.stringify(cannonElements))
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
    }
    else if (elementLayer == "normal" && (selectedElement === "222" || selectedElement === "223" || selectedElement === "224" || selectedElement === "225" || selectedElement === "226")) {
        // Handle candy cobra placement
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        
        // Store cobra information for basket placement
        lastCobraTile = [row, column]
        lastCobraLayer = cobraLayerMapping[elements_ids[selectedElement]]
        waitingForCobraBasket = true
        
        // Store the original cobra element for switching back
        lastCobraElement = elements_ids[selectedElement]
        
        // Switch to cobra basket selection
        updateSelection(false, 'cobra_basket', 'cobra_basket')
        return // Prevent function from continuing
    }
    else if (elementLayer == "normal") {
        image = object.querySelector(".normal")
        if (selectedElement in coloredCandy) {
            //Set colored Candy
            let colorName = elements_ids[selectedColor]
            let elementName = ""
            let name = ""

            if (selectedColor === "002" && selectedElement === "002") {
                name = "random"
            }
            else if (selectedColor !== "002" && selectedElement === "002") {
                name = colorName
            }
            else {
                elementName = elements_ids[selectedElement] + "_"
                name = elementName + colorName
            }

            image.src = elementsFolder + name + ".png"
            object.setAttribute("normal", selectedElement)
            object.setAttribute("color", selectedColor)
        }
        else {
            //Set non colored candy
            image.src = elementsFolder + elements_ids[selectedElement] + ".png"
            object.setAttribute("normal", selectedElement)
            object.setAttribute("color", "")
        }
        
    } else if (elementLayer=='portal_entrance' || elementLayer=='portal_exit') {
        //set image
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"

        //switch to other portal if one is placed
        if (selectedElement=='012') {
            updateSelection(false,'portal_exit','portal_exit')
        } else if (selectedElement == '014') {
            updateSelection(false,'portal_exit_hidden','portal_exit')
        } else if (selectedElement=='013') {
            isPortalTimeout=true
            updateSelection(false,'portal_entrance','portal_entrance')
        } else if (selectedElement == '015') {
            isPortalTimeout=true
            updateSelection(false,'portal_entrance_hidden','portal_entrance')
        }
    }
    else if (elementLayer == "conveyor") {
        // Handle conveyor belt placement
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        
        // Show the "Done putting conveyor belt" button
        const btn = document.getElementById('done-conveyor-btn')
        if (btn) {
            btn.style.display = 'block'
        }
        
        // Start conveyor grouping mode if not already active
        if (!isConveyorGroupingMode) {
            startConveyorGrouping()
        }
        
        // Add this belt to the current group
        const belt = {
            row: parseInt(object.getAttribute('pos-row')),
            col: parseInt(object.getAttribute('pos-col')),
            type: selectedElement,
            direction: conveyorDirections[selectedElement]
        }
        addToConveyorGroup(belt)
    }
    else if (elementLayer == "conveyor_portal") {
        // Handle conveyor portal placement
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        
        // Show the "Done putting conveyor belt" button
        const btn = document.getElementById('done-conveyor-btn')
        if (btn) {
            btn.style.display = 'block'
        }
        
        // Switch to appropriate directional conveyor entrance based on the portal color
        if (selectedElement === "conveyor_entrance_blue") {
            updateSelection(false, 'conveyor_entrance_down', 'conveyor_portal')
        } else if (selectedElement === "conveyor_entrance_green") {
            updateSelection(false, 'conveyor_entrance_left', 'conveyor_portal')
        } else if (selectedElement === "conveyor_entrance_purple") {
            updateSelection(false, 'conveyor_entrance_right', 'conveyor_portal')
        } else if (selectedElement === "conveyor_entrance_down" || selectedElement === "conveyor_entrance_left" || selectedElement === "conveyor_entrance_right" || selectedElement === "conveyor_entrance_up") {
            // These are the directional entrances - they should be placed directly
            // No need to switch selection
        }
    }

    else if (elementLayer == "cobra_basket" && selectedElement === "227" && waitingForCobraBasket) {
        // Handle cobra basket placement
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        
        // Reset cobra tracking
        waitingForCobraBasket = false
        lastCobraTile = null
        lastCobraLayer = null
        
        // Switch back to normal layer with the same cobra element
        updateSelection(false, lastCobraElement, 'normal')
        lastCobraElement = null
        return // Prevent function from continuing
    }
    else {
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
    }

    if (small.includes(selectedElement)) {
        if (!image.classList.contains("small")) {
            image.classList.add("small")
        }
    }
    else {
        try {
            image.classList.remove("small")
        } catch { }
    }

    if (stretched.includes(selectedElement)) {
        if (!image.classList.contains("stretched")) {
            image.classList.add("stretched")
        }
    }
    else {
        try {
            image.classList.remove("stretched")
        } catch { }
    }

    if (!(object.getAttribute("normal") in coloredCandy) && !(sugarCoatable.includes(object.getAttribute("normal")))) {
        object.setAttribute("sugarcoat", "")
        object.querySelector(".sugarcoat").src = elementsFolder + "none.png"
    }
}

function updateSelection(object, element, layer) {
    try {
        document.querySelector(".elementselected").classList.remove("elementselected")
    }
    catch { }
    
    // Only add class if object is a valid DOM element
    if (object && object.classList) {
        object.classList.add("elementselected")
    }
    
    selectedElement = elements_names[element]
    elementLayer = layer
    //console.log(layer)
    if (lastPortalObject && layer!=='portal_exit' && layer!=='portal_entrance') {
        removePortal(lastPortalObject)
    }
}

function updateElmState(object) {
    if (object.getAttribute("normal") in coloredCandy) {
        colorId = object.getAttribute("color")
        objectId = object.getAttribute("normal")

        if (colorId === "002") {
            colorId = "055"
        }
        else if (colorId === "055") {
            colorId = "056"
        }
        else if (colorId === "056") {
            colorId = "057"
        }
        else if (colorId === "057") {
            colorId = "058"
        }
        else if (colorId === "058") {
            colorId = "059"
        }
        else if (colorId === "059") {
            colorId = "060"
        }
        else if (colorId === "060") {
            colorId = "002"
        }


        object.setAttribute("color", colorId)

        let colorName = elements_ids[colorId]
        let elementName = ""
        let name = ""

        if (colorId === "002" && objectId === "002") {
            name = "random"
        }
        else if (colorId !== "002" && objectId === "002") {
            name = colorName
        }
        else {
            elementName = elements_ids[objectId] + "_"
            name = elementName + colorName
        }
        object.querySelector(".normal").src = elementsFolder + name + ".png"
    }
}

function importLevel(levelData) {
    let originalLevel = document.getElementById("level")
    let levelParent = originalLevel.parentElement;
    originalLevel.id = "levelold"
    originalLevel.style.display = "none"

    let origColor = selectedColor
    let origLayer = elementLayer
    let origElement = selectedElement

    let newLevel = levelParent.appendChild(document.createElement("table"))
    newLevel.id = "level"
    newLevel.setAttribute("cellspacing", "0")
    createNewTable(true)

    levelArray = levelData['tileMap']

    try {
        let levelObject = newLevel
        let childrenRows = [].slice.call(levelObject.children)

        let blacklistedCake = []

        childrenRows.forEach(function (row, rIndex) {
            let objects = [].slice.call(row.children)
            let color = "002"

            objects.forEach(function (object, cIndex) {
                //Split object into array of parts of 3
                try {
                    textObject = levelArray[rIndex][cIndex].match(/.{1,3}/g)
                }
                catch {
                    throw "This level has a grid bigger than 9x9"
                }

                textObject.forEach(function (objectId, index) {
                    if (objectId in colors) {
                        color = objectId
                        if (objectId != "002")
                            textObject.splice(index, 1)
                    }
                })

                textObject.forEach(function (objectId) {
                    if (objectId.length !== 3) {
                        throw "An object ID is not 3 characters long."
                    }

                    if (objectId == "002" && object.getAttribute("normal") != undefined) {
                        return
                    }

                    if (objectId === "085") objectId = "069"
                    if (objectId === '084') objectId = '050'

                    //portals are dealt with later
                    if (objectId === '011' || objectId==='012'||objectId==='013'||objectId==='014'||objectId==='015') {
                        return
                    }

                    if (objectId == "035") {
                        if (blacklistedCake.includes(String(rIndex) + String(cIndex))) {
                            return
                        }
                        else {
                            if (cIndex == 8 || rIndex == 8) {
                                return
                            }
                            else {
                                blacklistedCake.push(String(rIndex) + String(cIndex + 1))
                                blacklistedCake.push(String(rIndex + 1) + String(cIndex))
                                blacklistedCake.push(String(rIndex + 1) + String(cIndex + 1))
                            }
                        }
                    }

                    let layer = getLayerFromId(objectId)
                    selectedColor = color
                    elementLayer = layer
                    selectedElement = objectId

                    try {
                        updateTile(object)
                    }
                    catch {
                        elementLayer = "tile"
                        selectedElement = "none"
                    }
                })
            })
        })
        if (levelData.portals) {
            for (let portal of levelData.portals) {
                //console.log(portal)
                elementLayer = 'portal_entrance'
                if (portal[0][2]==14) {
                    selectedElement = '012'
                } else {
                    selectedElement = '014'
                }
                
                try {
                    updateTile([].slice.call(childrenRows[portal[0][1]].children)[portal[0][0]])
                    isPortalTimeout=false
                }
                catch (err) {
                    console.warn(err)
                    elementLayer = "tile"
                    selectedElement = "none"
                }

                elementLayer = 'portal_exit'
                if (portal[1][2]==14) {
                    selectedElement = '013'
                } else {
                    selectedElement = '015'
                }
                
                try {
                    updateTile([].slice.call(childrenRows[portal[1][1]].children)[portal[1][0]])
                    isPortalTimeout=false
                }
                catch (err) {
                    console.warn(err)
                    elementLayer = "tile"
                    selectedElement = "none"
                }
            }
        }
        originalLevel.remove()
        newLevel.style.display = "block"
    }
    catch (err) {
        //alert(err.stack)
        console.log(err)
        newLevel.remove()
        originalLevel.id = "level"
        originalLevel.style.display = "block"
        throw (err)
    }

    //Set game mode
    let wantedMode = levelData['gameModeName']
    let wantedModeInput = document.getElementById("modeselection").querySelector('input[value="' + String(wantedMode) + '"]')
    if (wantedModeInput != null) {
        wantedModeInput.click()
    }

    //Set moves & time
    document.getElementById("moves").value = levelData.moveLimit || ""
    document.getElementById("time").value = levelData.timeLimit || ""

    //Set preferred colors
    let colorspref = document.getElementById("colorspref-section")
    preferredColors = levelData.preferredColors || [0, 1, 2, 3, 4]
    for (let i = 0; i < 6; i++) {
        let prefbutton = colorspref.querySelector('button[value="' + String(i) + '"]')
        if (preferredColors.includes(i)) {
            if (!prefbutton.classList.contains("preferredselected")) {
                prefbutton.classList.add("preferredselected")
            }
        }
        else {
            if (prefbutton.classList.contains("preferredselected")) {
                prefbutton.classList.remove("preferredselected")
            }
        }
    }

    //Add requirements
    let requirementsContainer = document.getElementById("requirements")

    Array.from(requirementsContainer.children).forEach(function (child) {
        child.remove()
    })

    //Set Pre Level Booster
    try {
        document.getElementById("disablebooster").checked = levelData.disablePreLevelBoosters || false
    }
    catch {
        document.getElementById("disablebooster").checked = false
    }

    //Set score targets
    let scoreTargets = levelData.scoreTargets || []
    document.getElementById("star1").value = scoreTargets[0] || ''
    document.getElementById("star2").value = scoreTargets[1] || ''
    document.getElementById("star3").value = scoreTargets[2] || ''


    let ingredientOrder = { 0: "hazelnut", 1: "cherry" }
    if (wantedMode.includes('Drop down') || wantedMode.includes('Drop Down')) {
        (levelData.ingredients || []).forEach(function (quantity, index) {
            try {
                if (quantity == 0) {
                    return
                }
                let item = ingredientOrder[index]

                addRequirement(true, true)

                let requirementNode = requirementsContainer.children[0]
                let selectNode = requirementNode.querySelector("select")
                selectNode.value = item
                switchedRequirementIngredient(selectNode)

                requirementNode.querySelector("input").value = quantity
            } catch { }
        })
    }
    if (wantedMode.includes('Order')) {
        (levelData._itemsToOrder || []).forEach(function (itemDict) {
            try {
                let item = itemDict['item']
                let quantity = itemDict['quantity']

                addRequirement(false, true)

                let requirementNode = requirementsContainer.children[0]
                let selectNode = requirementNode.querySelector("select")
                selectNode.value = item
                switchedRequirement(selectNode)

                requirementNode.querySelector("input").value = quantity
            } catch { }
        })
    }

    let mixerElementsContainer = document.getElementById("mixeroptions");

    Array.from(mixerElementsContainer.children).forEach(function (child) {
        child.remove()
    });

    (levelData.evilSpawnerElements || []).forEach(function (item) {
        try {

            addMixerOption()

            let requirementNode = mixerElementsContainer.children[0]
            let selectNode = requirementNode.querySelector("select")
            selectNode.value = item
            switchedMixerOption(selectNode)
        } catch { }
    })

    //Set cannon preferences
    cannonCodes.forEach(function (nameArray) {
        let elm = nameArray[0]

        let cannonSettingAddons = ["Max", "Spawn"]

        cannonSettingAddons.push(nameArray[1])

        cannonSettingAddons.forEach(function (setting) {
            let inputElement = document.getElementById(elm + setting)

            if (inputElement != null) {
                inputElement.value = levelData[elm + setting] || ""
            }
        })
    })

    //Set element selection back
    selectedColor = origColor
    elementLayer = origLayer
    selectedElement = origElement

    //set dreamworld settings
    //set it to the opposite then click it so it applies the hide or show part of the menu
    document.getElementById('isOwlModeEnabled').checked = levelData.isOwlModeEnabled
    document.getElementById("dreamworldoptions").style.display = levelData.isOwlModeEnabled ? "block" : "none"
    document.getElementById("initialMovesUntilMoonStruck").value = levelData.initialMovesUntilMoonStruck || ''
    document.getElementById("initialMovesDuringMoonStruck").value = levelData.initialMovesDuringMoonStruck || ''
    document.getElementById('maxAllowedScaleDiff').value = levelData.maxAllowedScaleDiff || ''

    lastPortalObject = undefined

}

function displayImportLevelUI() {
    document.getElementById("importmenu").style.display = "block"
}

function importLevelUI() {
    try {
        let importField = document.getElementById("importfield")
        importLevel(JSON.parse(importField.value))
        document.getElementById("importerror").style.display = "none"
        importField.value = ""
        document.getElementById("importmenu").style.display = "none"
    }
    catch (err) {
        let importField = document.getElementById("importfield")
        let errorPara = document.getElementById("importerror")
        // Create error attributes
        importField.setAttribute("error", "true");
        importField.setAttribute("error-text", "Failed to import level! Double check and try again.");

        // Use custom error messages
        if (err instanceof SyntaxError) {
            errorPara.textContent = ERROR_MESSAGES.JSON_PARSE;
        } else {
            errorPara.textContent = ERROR_MESSAGES.IMPORT_FAILED;
        }

        // If you still want to log the original error for debugging:
        console.error(err);
    }
}

const ERROR_MESSAGES = {
    JSON_PARSE: "Failed to import level! Double-check your code, then try again.",
    IMPORT_FAILED: "Failed to import level! Double-check your code, then try again.",
    // Add more custom error messages as needed
};

// Select the upload area and file input
const uploadArea = document.querySelector('.uploadfiles-area');
const fileInput = document.getElementById('fileInput');
const quickOpenbtn = document.querySelector('.openlvl');
const bigOpenbtn = document.querySelector('.openlevelbigbtn');

// Add click event listener to the upload area
uploadArea.addEventListener('click', () => {
    fileInput.click(); // Trigger the file input click
});

quickOpenbtn.addEventListener('click', () => {
    fileInput.click(); // Trigger the file input click
});

bigOpenbtn.addEventListener('click', () => {
    fileInput.click(); // Trigger the file input click
});

// Add keydown event listener for CTRL + O
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'o') { // Check if CTRL + O is pressed
        event.preventDefault(); // Prevent the default action (like opening a new tab)
        fileInput.click(); // Trigger the file input click
    }
});

// Add change event listener to the file input
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Get the selected file

    // Check if a file is selected and if it's a .txt file
    if (file && file.type === 'text/plain') {
        const reader = new FileReader(); // Create a FileReader object

        // Define the onload event for the FileReader
        reader.onload = function (e) {
            const fileContent = e.target.result; // Get the file content
            try {
                const levelData = JSON.parse(fileContent); // Parse the content as JSON
                importLevel(levelData); // Call the importLevel function with the parsed data
                importLevelUI(); // Trigger the importLevelUI function
            } catch (error) {
                console.error("Error parsing file content:", error);
                alert("Import level successfully! ^_^");
            }
        };

        reader.readAsText(file); // Read the file as text
    } else {
        alert("Please select a valid .txt file."); // Alert if the file is not valid
    }
});

function exportLevel() {
    let levelArray = []
    let levelObject = document.getElementById("level")
    let level = {}
    if (currentMode.includes("Rainbow Rapids")) {
        level.rainbowRapidsTargets = 0
    }
    levelObject.childNodes.forEach(function (row) {
        rowArray = []
        for (var i = 0; i < row.childNodes.length; i++) {
            let object = row.childNodes[i]

            if (object.getAttribute("tile") == "000") {
                rowArray.push("000")
                continue
            }
            let candyCannon = JSON.parse(object.getAttribute("candy_cannon") || '[]')
            if (currentMode !== "Classic" && currentMode !== "Jelly Time" && candyCannon.includes('069')) {
                let i = 0
                for (let cannon of candyCannon) {
                    if (cannon === '069') {
                        candyCannon[i] = '085'
                    }
                    i++
                }
            }
            console.log(candyCannon)
            let totalCode = [].concat(candyCannon)

            let toLoopThrough = [].concat(layers, ["color"])

            toLoopThrough.splice(toLoopThrough.indexOf("candy_cannon"), 1)

            toLoopThrough.forEach(function (layer) {
                let element = ""
                if (object.hasAttribute(layer)) {
                    element = object.getAttribute(layer)
                }
                else {
                    return
                }

                // Skip conveyor belts and conveyor portals - they will be handled separately in gates array
                if (layer === "conveyor" || layer === "conveyor_portal") {
                    return
                }

                if (currentMode.includes("Rainbow Rapids") && element == "156") {
                    level.rainbowRapidsTargets++
                }

                if (currentMode !== "Classic" && currentMode !== "Jelly Time") {
                    if (element === '050') {
                        element = '084'
                    }
                }

                if (element=="013" || element=="015") {
                    //element="011013"
                }

                if (element=="012" || element=="014") {
                    let row2 = parseInt(object.getAttribute('portalexitrow'))
                    let col2 = parseInt(object.getAttribute('portalexitcol'))
                    let portal = [[i,levelArray.length],[col2,row2]]
                    if (element=='012') {
                        portal[0][2]=14
                        portal[1][2]=14
                    }
                    if (!level.portals) {
                        level.portals = []
                    }
                    level.portals.push(portal)
                }

                if (!totalCode.includes(element) && element != "") {
                    totalCode.push(element)
                }
            })

            if (object.getAttribute("normal") !== "002" && object.getAttribute("color") == "002") {
                totalCode.splice(totalCode.indexOf("002"), 1)
            }

            if (totalCode.includes("001") && totalCode.length != 1) {
                totalCode.splice(totalCode.indexOf("001"), 1)
            }

            rowArray.push(totalCode.join(""))
        }
        levelArray.push(rowArray)
    })
    level['tileMap'] = levelArray
    level['numberOfColours'] = preferredColors.length
    level['preferredColors'] = preferredColors

    level['disablePreLevelBoosters'] = document.getElementById("disablebooster").checked
    level['colorWeightAdjustments'] = [0]

    let star1 = Number(document.getElementById("star1").value) || 1000
    let star2 = Number(document.getElementById("star2").value) || 2000
    let star3 = Number(document.getElementById("star3").value) || 3000

    level['scoreTargets'] = [star1, star2, star3]

    level['protocolVersion'] = "0.3"
    level['randomSeed'] = 0

    // Detect portal_entrance and portal_exit tiles and add to portals array
    level['portals'] = []
    
    // Scan through all tiles to find portal entrances and their linked exits
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            
            if (object.getAttribute("tile") == "000") {
                continue
            }
            
            // Check for portal_entrance and get its linked exit
            if (object.hasAttribute('portal_entrance') && object.getAttribute('portal_entrance') !== '') {
                let exitRow = object.getAttribute('portalexitrow')
                let exitCol = object.getAttribute('portalexitcol')
                
                if (exitRow !== '' && exitCol !== '') {
                    let exitRowIndex = parseInt(exitRow)
                    let exitColIndex = parseInt(exitCol)
                    
                    // Add the portal pair to the array
                    level['portals'].push([[colIndex, rowIndex, 14], [exitColIndex, exitRowIndex, 14]])
                }
            }
        }
    })
    
    // Detect conveyor belts and generate gates array
    level['gates'] = []
    let conveyorBelts = []
    let conveyorPortals = []
    
    // First pass: collect all conveyor belts and portals
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            
            if (object.getAttribute("tile") == "000") {
                continue
            }
            
            // Check for conveyor belts
            if (object.hasAttribute('conveyor') && object.getAttribute('conveyor') !== '') {
                let conveyorType = object.getAttribute('conveyor')
                conveyorBelts.push({
                    row: rowIndex,
                    col: colIndex,
                    type: conveyorType,
                    direction: conveyorDirections[conveyorType]
                })
            }
            
            // Check for conveyor portals
            if (object.hasAttribute('conveyor_portal') && object.getAttribute('conveyor_portal') !== '') {
                let portalType = object.getAttribute('conveyor_portal')
                // Only count the base portal types (not directional ones) for color mapping
                if (portalType === "conveyor_entrance_blue" || portalType === "conveyor_entrance_green" || portalType === "conveyor_entrance_purple") {
                    conveyorPortals.push({
                        row: rowIndex,
                        col: colIndex,
                        type: portalType,
                        color: conveyorPortalColors[portalType]
                    })
                    
                    // Also add a conveyor belt for this portal if it doesn't already exist
                    let beltExists = false
                    for (let belt of conveyorBelts) {
                        if (belt.row === rowIndex && belt.col === colIndex) {
                            beltExists = true
                            break
                        }
                    }
                    
                    if (!beltExists) {
                        // Determine direction based on portal type
                        let direction = 0 // default up
                        if (portalType === "conveyor_entrance_blue") direction = 2 // down
                        else if (portalType === "conveyor_entrance_green") direction = 3 // left
                        else if (portalType === "conveyor_entrance_purple") direction = 1 // right
                        
                        conveyorBelts.push({
                            row: rowIndex,
                            col: colIndex,
                            type: "conveyor_" + (direction === 0 ? "up" : direction === 1 ? "right" : direction === 2 ? "down" : "left"),
                            direction: direction
                        })
                    }
                } else if (portalType === "conveyor_entrance_down" || portalType === "conveyor_entrance_left" || portalType === "conveyor_entrance_right" || portalType === "conveyor_entrance_up") {
                    // These are directional entrances - map them to their base colors
                    let baseType = ""
                    if (portalType === "conveyor_entrance_down") baseType = "conveyor_entrance_blue"
                    else if (portalType === "conveyor_entrance_left") baseType = "conveyor_entrance_green"
                    else if (portalType === "conveyor_entrance_right") baseType = "conveyor_entrance_purple"
                    else if (portalType === "conveyor_entrance_up") baseType = "conveyor_entrance_blue" // Default to blue for up
                    
                    conveyorPortals.push({
                        row: rowIndex,
                        col: colIndex,
                        type: baseType,
                        color: conveyorPortalColors[baseType]
                    })
                    
                    // Also add a conveyor belt for this portal if it doesn't already exist
                    let beltExists = false
                    for (let belt of conveyorBelts) {
                        if (belt.row === rowIndex && belt.col === colIndex) {
                            beltExists = true
                            break
                        }
                    }
                    
                    if (!beltExists) {
                        // Determine direction based on portal type
                        let direction = 0 // default up
                        if (portalType === "conveyor_entrance_down") direction = 2 // down
                        else if (portalType === "conveyor_entrance_left") direction = 3 // left
                        else if (portalType === "conveyor_entrance_right") direction = 1 // right
                        else if (portalType === "conveyor_entrance_up") direction = 0 // up
                        
                        conveyorBelts.push({
                            row: rowIndex,
                            col: colIndex,
                            type: "conveyor_" + (direction === 0 ? "up" : direction === 1 ? "right" : direction === 2 ? "down" : "left"),
                            direction: direction
                        })
                    }
                }
            }
        }
    })
    
    // Generate gates array from conveyor belts with improved grouping and ordering
    if (conveyorBelts.length > 0) {
        console.log("Conveyor belts found:", conveyorBelts)
        console.log("Conveyor portals found:", conveyorPortals)
        
        // Use manual groups if available, otherwise auto-group by rows/columns
        let groupsToProcess = conveyorGroups.length > 0 ? conveyorGroups : []
        
        console.log("Manual conveyor groups:", conveyorGroups)
        console.log("Groups to process initially:", groupsToProcess)
        
        if (groupsToProcess.length === 0) {
            // Auto-group by rows and columns
            let rowGroups = {}
            let colGroups = {}
            
            // Group by rows
            conveyorBelts.forEach(belt => {
                if (!rowGroups[belt.row]) rowGroups[belt.row] = []
                rowGroups[belt.row].push(belt)
            })
            
            // Group by columns
            conveyorBelts.forEach(belt => {
                if (!colGroups[belt.col]) colGroups[belt.col] = []
                colGroups[belt.col].push(belt)
            })
            
            console.log("Row groups:", rowGroups)
            console.log("Column groups:", colGroups)
            
            // Add row groups with more than 1 belt
            Object.values(rowGroups).forEach(group => {
                if (group.length > 1) {
                    // Sort by column for consistent ordering
                    group.sort((a, b) => a.col - b.col)
                    groupsToProcess.push(group)
                }
            })
            
            // Add column groups with more than 1 belt
            Object.values(colGroups).forEach(group => {
                if (group.length > 1) {
                    // Sort by row for consistent ordering
                    group.sort((a, b) => a.row - b.row)
                    groupsToProcess.push(group)
                }
            })
            
            // Add individual belts that aren't in any group
            let groupedBelts = new Set()
            groupsToProcess.forEach(group => {
                group.forEach(belt => {
                    groupedBelts.add(`${belt.row},${belt.col}`)
                })
            })
            
            conveyorBelts.forEach(belt => {
                if (!groupedBelts.has(`${belt.row},${belt.col}`)) {
                    groupsToProcess.push([belt])
                }
            })
        }
        
        console.log("Groups to process:", groupsToProcess)
        
        // Process each group
        groupsToProcess.forEach(group => {
            if (group.length === 0) return
            
            // Sort belts in the group by their visual order (following the flow)
            let sortedGroup = [...group]
            
            // For groups with multiple belts, try to determine the flow order
            if (group.length > 1) {
                // Start with the first belt and find the next one based on direction
                let orderedGroup = [group[0]]
                let remaining = group.slice(1)
                
                while (remaining.length > 0) {
                    let currentBelt = orderedGroup[orderedGroup.length - 1]
                    let nextBelt = null
                    let nextIndex = -1
                    
                    // Find the next belt based on current belt's direction
                    for (let i = 0; i < remaining.length; i++) {
                        let candidate = remaining[i]
                        let isNext = false
                        
                        // Check if this belt is in the direction of the current belt
                        switch (currentBelt.direction) {
                            case 0: // up
                                isNext = candidate.row === currentBelt.row - 1 && candidate.col === currentBelt.col
                                break
                            case 1: // right
                                isNext = candidate.row === currentBelt.row && candidate.col === currentBelt.col + 1
                                break
                            case 2: // down
                                isNext = candidate.row === currentBelt.row + 1 && candidate.col === currentBelt.col
                                break
                            case 3: // left
                                isNext = candidate.row === currentBelt.row && candidate.col === currentBelt.col - 1
                                break
                        }
                        
                        if (isNext) {
                            nextBelt = candidate
                            nextIndex = i
                            break
                        }
                    }
                    
                    if (nextBelt) {
                        orderedGroup.push(nextBelt)
                        remaining.splice(nextIndex, 1)
                    } else {
                        // If no next belt found, just add the remaining ones
                        orderedGroup.push(...remaining)
                        break
                    }
                }
                
                sortedGroup = orderedGroup
            }
            
            // Create gates for this group
            for (let i = 0; i < sortedGroup.length; i++) {
                let belt = sortedGroup[i]
                let nextBelt = sortedGroup[i + 1]
                
                // Check if this belt has a portal
                let hasPortal = false
                let portalColor = 0
                for (let portal of conveyorPortals) {
                    if (portal.row === belt.row && portal.col === belt.col) {
                        hasPortal = true
                        portalColor = portal.color
                        break
                    }
                }
                
                if (nextBelt) {
                    // Create gate entry: [[start_tile], [next_tile], [direction], [color]]
                    console.log("Creating gate from", belt, "to", nextBelt)
                    let gate = [
                        [belt.col, belt.row],
                        [nextBelt.col, nextBelt.row],
                        [belt.direction],
                        [hasPortal ? portalColor : 0]
                    ]
                    level['gates'].push(gate)
                } else {
                    // This is the last belt in the group - create loop-back to first belt
                    let firstBelt = sortedGroup[0]
                    
                    // Check if the last belt has a portal
                    let lastBeltHasPortal = false
                    let lastBeltPortalColor = 0
                    for (let portal of conveyorPortals) {
                        if (portal.row === belt.row && portal.col === belt.col) {
                            lastBeltHasPortal = true
                            lastBeltPortalColor = portal.color
                            break
                        }
                    }
                    
                    // Create loop-back gate from last belt to first belt
                    let loopBackGate = [
                        [belt.col, belt.row],
                        [firstBelt.col, firstBelt.row],
                        [belt.direction],
                        [lastBeltHasPortal ? lastBeltPortalColor : 0]
                    ]
                    level['gates'].push(loopBackGate)
                }
            }
        })
        
        console.log("Generated gates:", level['gates'])
        
        // Debug: Show the expected format for the image example
        console.log("Expected format for C-shaped conveyor:", [
            [[8,5],[7,5],[3],[2]],
            [[7,5],[6,5],[3],[0]],
            [[6,5],[6,4],[0],[0]],
            [[6,4],[6,3],[0],[0]],
            [[6,3],[7,3],[1],[0]],
            [[7,3],[8,3],[1],[0]],
            [[8,3],[8,5],[1],[2]]
        ])
    }
    
    // Detect candy cobras and generate candyCobras array
    level['candyCobras'] = []
    let cobraPairs = []
    
    // First pass: collect all cobra elements and baskets
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            
            if (object.getAttribute("tile") == "000") {
                continue
            }
            
            // Check for cobra elements (not baskets) - they are in the normal layer as blockers
            if (object.hasAttribute('normal') && (object.getAttribute('normal') === '222' || object.getAttribute('normal') === '223' || object.getAttribute('normal') === '224' || object.getAttribute('normal') === '225' || object.getAttribute('normal') === '226')) {
                let cobraType = elements_ids[object.getAttribute('normal')]
                let cobraLayer = cobraLayerMapping[cobraType]
                
                cobraPairs.push({
                    type: 'cobra',
                    row: rowIndex,
                    col: colIndex,
                    layer: cobraLayer
                })
            }
            
            // Check for cobra baskets
            if (object.hasAttribute('cobra_basket') && object.getAttribute('cobra_basket') === '227') {
                cobraPairs.push({
                    type: 'basket',
                    row: rowIndex,
                    col: colIndex
                })
            }
        }
    })
    
    // Match cobras with baskets (assuming they are placed in order)
    let cobras = cobraPairs.filter(pair => pair.type === 'cobra')
    let baskets = cobraPairs.filter(pair => pair.type === 'basket')
    
    // Create candyCobras entries: [from_tile, layer, to_tile]
    for (let i = 0; i < Math.min(cobras.length, baskets.length); i++) {
        let cobra = cobras[i]
        let basket = baskets[i]
        
        let candyCobra = [
            cobra.col, cobra.row,  // from_tile
            cobra.layer,            // layer
            basket.col, basket.row  // to_tile
        ]
        
        level['candyCobras'].push(candyCobra)
    }
    
    console.log("Candy cobras found:", cobraPairs)
    console.log("Generated candyCobras:", level['candyCobras'])
    
    level['orlocks'] = []
    level['skulls'] = []

    if (currentMode === "Classic" || currentMode === "Jelly Time") {
        let time = document.getElementById("time").value
        if (time === '') {
            time = 30
        }
        else {
            time = Number(time)
        }
        level['timeLimit'] = time
    }
    else {
        let moves = document.getElementById("moves").value
        if (moves === '') {
            moves = 20
        }
        else {
            moves = Number(moves)
        }

        level['moveLimit'] = moves
    }

    if (currentMode.includes('Drop down') || currentMode.includes('Drop Down')) {
        let hazelnuts = 0
        let cherries = 0

        let requirementsContainer = document.getElementById("requirements")
        for (var i = 0; i < requirementsContainer.children.length; i++) {
            element = requirementsContainer.children[i]

            if (element.getAttribute("reqtype") !== "ingredient") {
                continue
            }

            let item = element.querySelector("select").value

            let quantity = element.querySelector("input").value
            if (quantity === '') {
                quantity = 0
            }
            else {
                quantity = Number(quantity)
            }

            console.log(item)

            if (item == "cherry") {
                cherries = quantity
            }
            else if (item == "hazelnut") {
                hazelnuts = quantity
            }
        }

        level.numIngredientsOnScreen = 1
        level.maxNumIngredientsOnScreen = parseInt(document.getElementById('maxNumIngredientsOnScreen').value) || 0
        level.ingredientSpawnDensity = parseInt(document.getElementById('ingredientSpawnDensity').value) || 0

        level['ingredients'] = [hazelnuts, cherries]
    }

    if (currentMode.includes('Order')) {
        let orders = []
        let requirementsContainer = document.getElementById("requirements")
        for (var i = 0; i < requirementsContainer.children.length; i++) {
            element = requirementsContainer.children[i]

            if (element.getAttribute("reqtype") !== "order") {
                continue
            }

            let item = Number(element.querySelector("select").value)

            let quantity = element.querySelector("input").value
            if (quantity === '') {
                quantity = 0
            }
            else {
                quantity = Number(quantity)
            }

            orders.push({ "item": item, "quantity": quantity })
        }

        level['_itemsToOrder'] = orders
    }

    level['gameModeName'] = currentMode

    level['episodeId'] = 0

    level["evilSpawnerAmount"] = parseInt(document.getElementById('evilSpawnerAmount').value) || 3

    let magicMixerElements = []
    let mixerElementsContainer = document.getElementById("mixeroptions")
    for (var i = 0; i < mixerElementsContainer.children.length; i++) {
        element = mixerElementsContainer.children[i]

        let item = Number(element.querySelector("select").value)

        magicMixerElements.push(item)
    }

    level["evilSpawnerElements"] = magicMixerElements
    level["evilSpawnerInterval"] = parseInt(document.getElementById('evilSpawnerInterval').value) || 3

    //Add cannon preferences
    cannonCodes.forEach(function (nameArray) {
        let elm = nameArray[0]

        let cannonSettingAddons = ["Max", "Spawn", ""]

        cannonSettingAddons.push(nameArray[1])

        cannonSettingAddons.forEach(function (setting) {
            //console.log(elm + setting)
            let inputElement = document.getElementById(elm + setting)
            if (inputElement != null && inputElement.value != "") {
                level[elm + setting] = Number(inputElement.value) || 0
            }
        })
    })

    //dreamworld
    if (document.getElementById("isOwlModeEnabled").checked) {
        level.isOwlModeEnabled = true
        level.initialMovesUntilMoonStruck = parseInt(document.getElementById("initialMovesUntilMoonStruck").value) || 5
        level.initialMovesDuringMoonStruck = parseInt(document.getElementById("initialMovesDuringMoonStruck").value) || 3
        level.maxAllowedScaleDiff = parseInt(document.getElementById('maxAllowedScaleDiff').value) || 10
        level.leftWeightToTriggerMoonStruck = 0
        level.rightWeightToTriggerMoonStruck = 0
        level.totalWeightToTriggerMoonStruck = 0
        level.useSplitWeightConditionToTriggerMoonStruck = false
        level.useTotalWeightConditionToTriggerMoonstruck = false
    }
    return level
}

function exportLevelUI() {
    let level = exportLevel()
    document.getElementById("exportfield").value = JSON.stringify(level)
    document.getElementById("exportmenu").style.display = "block"
}

function resized() {
    let container = document.getElementById("level")
    let width = window.innerWidth * .00078
    let height = window.innerHeight * .00078

    document.documentElement.style.setProperty("--scaleWidth", width)
    document.documentElement.style.setProperty("--scaleHieght", height)
}

window.onresize = function () {
    resized()
}

resized()

function createNewTable(clear = false) {
    var levelTable = document.getElementById('level')
    levelTable.innerHTML = ""
    
    // Reset conveyor belt groups
    conveyorGroups = []
    currentConveyorGroup = []
    isConveyorGroupingMode = false
    
    // Hide the conveyor belt button since there are no conveyor belts
    const btn = document.getElementById('done-conveyor-btn')
    if (btn) {
        btn.style.display = 'none'
    }
    for (let i = 0; i < 9; i++) {
        var row = document.createElement("tr")
        levelTable.appendChild(row)
        for (let g = 0; g < 9; g++) {
            var object = document.createElement("td")
            object.setAttribute("style", "position: relative; left: 0; top: 0;")

            object.setAttribute("pos-row", i)
            object.setAttribute("pos-col", g)

            object.setAttribute("candy_cannon", '')

            object.addEventListener('contextmenu', function (ev) {
                ev.preventDefault()
                let object = ev.target
                if (object.nodeType != "td") {
                    object = object.parentNode
                }
                updateElmState(object)
            }, false)

            object.onmouseover = function (event) {
                event.preventDefault();
                this.classList.add("selected")
                if (isDown) {
                    updateTile(this)
                }
            }

            object.onmousedown = function (event) {
                event.preventDefault()
                if (event.button === 0) {
                    event.preventDefault()
                    isDown = true
                    updateTile(this)

                }
            }
            object.onmouseout = function (event) {
                event.preventDefault();
                try {
                    this.classList.remove("selected")
                }
                catch { }
            }


            if (!clear) {
                object.setAttribute('normal', "002")
                object.setAttribute('color', "002")
            }
            object.setAttribute('tile', "001")

            let ammo = object.appendChild(document.createElement("div"))
            ammo.classList.add("ammocontainer")

            layers.forEach(function (layer) {
                let image = document.createElement("img")
                image.setAttribute('draggable', false)
                // image.style.display = "block"
                image.classList.add(layer)
                image.classList.add("default")
                object.appendChild(image)
            })

            image = object.querySelector(".tile")
            image.src = 'elements/grid.png'
            image.classList.remove("default")

            if (!clear) {
                if (i === 0) {
                    image = object.querySelector(".candy_entrance")
                    image.src = elementsFolder + "candy_entrance.png"
                    object.setAttribute("candy_entrance", "026")
                    object.setAttribute("candy_cannon", '["005"]')
                }

                image = object.querySelector(".normal")
                image.src = elementsFolder + elements_ids["002"] + ".png"
                image.classList.add("small")
            }

            image = object.querySelector(".selectimg")
            image.src = elementsFolder + "select.png"
            image.style.display = "none"

            row.appendChild(object)
        }
    }
}

createNewTable()

document.addEventListener('mouseup', function () {
    isDown = false;
    isPortalTimeout = false;
}, true);

//Auto set up left GUI colors
document.querySelectorAll(".selectcolor").forEach(function (element) {
    let color = element.getAttribute("color")
    let parent = element.parentElement

    let button = document.createElement('button')
    let image = button.appendChild(document.createElement("img"))
    image.classList.add("selectionimage")
    image.src = elementsFolder + color + ".png"

    button.setAttribute("onclick", "updateColor(this, \"" + color + "\")")

    element.remove()
    parent.appendChild(button)
})

//Auto set up left GUI colored elements
document.querySelectorAll(".selectcoloredelement").forEach(function (element) {
    let elementName = element.getAttribute('element')
    let parent = element.parentElement

    let button = document.createElement('button')
    let image = button.appendChild(document.createElement("img"))
    image.classList.add("selectionimage")
    image.src = elementsFolder + elementName + "_random.png"

    button.setAttribute("onclick", "updateSelection(this, '" + elementName + "', 'normal')")

    element.remove()
    parent.appendChild(button)
})

//Auto set up left GUI elements
document.querySelectorAll(".selectelement").forEach(function (element) {
    let elementName = element.getAttribute('element')
    let parent = element.parentElement

    let button = document.createElement('button')
    let layer = element.getAttribute("gamelayer")

    if (layer == "candy_cannon" && element.getAttribute('element') != "candy_cannon") {
        let ammoImage = button.appendChild(document.createElement("img"))
        ammoImage.setAttribute("style", "max-width: 40px; position: absolute; height: 40px; pointer-events: none;")
        ammoImage.src = elementsFolder + "/ammo.png"
    }

    let image = button.appendChild(document.createElement("img"))
    image.classList.add("selectionimage")
    image.src = elementsFolder + elementName + ".png"


    button.setAttribute("onclick", "updateSelection(this, \"" + elementName + "\", '" + layer + "')")

    element.remove()
    parent.appendChild(button)
})

//Auto set up cannon preference elements
document.querySelectorAll(".cannonpref").forEach(function (element) {
    let elm = element.getAttribute("elm")
    let imageSrc = element.getAttribute("image")
    let tick = element.getAttribute("tick")

    element.innerHTML = '<td> <img class="elmimg" style="max-width: 70%;"> </td> <td> <div class="text-field"> <input class="max" style="width: 50px; text-align: center;" placeholder="0" type="number"> </div> </td> <td> <div class="text-field"> <input class="spawn" style="width: 50px; text-align: center;" placeholder="0" type="number"> </div> </td> <td> <div class="text-field"> <input class="tick" style="width: 50px; text-align: center;" placeholder="0" type="number"> </div> </td>'

    element.querySelector(".elmimg").src = imageSrc
    element.querySelector(".max").id = elm + "Max"
    element.querySelector(".spawn").id = elm + "Spawn"
    if (tick != "") {
        element.querySelector(".tick").id = elm + tick
    }
    else {
        element.querySelector(".tick").style.display = "none"
    }
})

function injectDialogOpenKeyframes(shadowRoot) {
    // Check if already injected
    if (shadowRoot.querySelector('style[data-dialogopen]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-dialogopen', 'true');
    style.textContent = `
        @keyframes dialogOpen {
            0% {
                opacity: 0;
                transform: scale(1.2);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    shadowRoot.appendChild(style);
}

// For all current and future mdui-dialogs
function patchAllDialogs() {
    document.querySelectorAll('mdui-dialog').forEach(dialog => {
        if (dialog.shadowRoot) {
            injectDialogOpenKeyframes(dialog.shadowRoot);
        } else {
            // Wait for upgrade if not yet available
            customElements.whenDefined('mdui-dialog').then(() => {
                if (dialog.shadowRoot) {
                    injectDialogOpenKeyframes(dialog.shadowRoot);
                }
            });
        }
    });
}

// Patch on DOMContentLoaded and when new dialogs are added
document.addEventListener('DOMContentLoaded', patchAllDialogs);
new MutationObserver(patchAllDialogs).observe(document.body, { childList: true, subtree: true });

function removeDialogPseudoElements(shadowRoot) {
    // Prevent duplicate injection
    if (shadowRoot.querySelector('style[data-remove-pseudo]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-remove-pseudo', 'true');
    style.textContent = `
        :host::before, :host::after,
        [part="panel"]::before, [part="panel"]::after {
            display: none !important;
            content: none !important;
        }
    `;
    shadowRoot.appendChild(style);
}

function patchAllDialogsForPseudo() {
    document.querySelectorAll('mdui-dialog').forEach(dialog => {
        if (dialog.shadowRoot) {
            removeDialogPseudoElements(dialog.shadowRoot);
        } else {
            customElements.whenDefined('mdui-dialog').then(() => {
                if (dialog.shadowRoot) {
                    removeDialogPseudoElements(dialog.shadowRoot);
                }
            });
        }
    });
}

// Run on DOMContentLoaded and when new dialogs are added
document.addEventListener('DOMContentLoaded', patchAllDialogsForPseudo);
new MutationObserver(patchAllDialogsForPseudo).observe(document.body, { childList: true, subtree: true });

// Script to remove md-ripple opacity from all md-icon-button elements
function removeMdRippleOpacity() {
    // Select all md-icon-button elements
    document.querySelectorAll('md-icon-button').forEach(iconButton => {
        // Check if shadow root exists
        if (iconButton.shadowRoot) {
            applyRippleOpacity(iconButton.shadowRoot);
        } else {
            // Wait for the component to be upgraded if shadow root is not yet available
            customElements.whenDefined('md-icon-button').then(() => {
                if (iconButton.shadowRoot) {
                    applyRippleOpacity(iconButton.shadowRoot);
                }
            });
        }
    });
}

function applyRippleOpacity(shadowRoot) {
    // Find all md-ripple elements inside the shadow root
    const rippleElements = shadowRoot.querySelectorAll('md-ripple');
    rippleElements.forEach(ripple => {
        ripple.style.opacity = '0';
    });
}

// Run on DOMContentLoaded and when new elements are added
document.addEventListener('DOMContentLoaded', removeMdRippleOpacity);
new MutationObserver(removeMdRippleOpacity).observe(document.body, {
    childList: true,
    subtree: true
});

// Utility to patch all custom checkboxes with <md-icon> checkmarks
function patchAllCustomCheckboxes() {
    // Find all custom checkboxes (label.checkbox with input[type=checkbox] and md-icon)
    document.querySelectorAll('label.checkbox').forEach(label => {
        const input = label.querySelector('input[type="checkbox"]');
        const checkmark = label.querySelector('md-icon');
        const span = label.querySelector('.checkmark');
        if (!input || !checkmark) return;

        // Only add the event listener once
        if (!input._customCheckboxPatched) {
            function updateCheck() {
                checkmark.style.display = input.checked ? "flex" : "none";
                span.style.backgroundColor = input.checked ? "#2469ff" : "#eeeeee00";
                span.style.borderColor = input.checked ? "#2469ff00" : "#ccc";
            }
            input.addEventListener('change', updateCheck);
            // Initial state
            updateCheck();
            input._customCheckboxPatched = true;
        }
    });
}

// Run on DOMContentLoaded and when new checkboxes are added
document.addEventListener('DOMContentLoaded', patchAllCustomCheckboxes);
new MutationObserver(patchAllCustomCheckboxes).observe(document.body, { childList: true, subtree: true });

/* 
HTML structure (Material 3 style):

<div class="slider-container">
    <button class="zoom-out md-icon-button" title="Zoom out">
        <md-icon>zoom_out</md-icon>
    </button>
    <div class="slider">
        <div class="slider-track"></div>      <!-- background bar -->
        <div class="slider-active"></div>     <!-- filled/active bar -->
        <div class="slider-thumb"></div>      <!-- thumb/handle -->
    </div>
    <button class="zoom-in md-icon-button" title="Zoom in">
        <md-icon>zoom_in</md-icon>
    </button>
</div>

CSS (injects automatically if not present):


*/

(function() {
    // Helper: clamp value between min and max
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    // Settings
    const minScale = 0.5;
    const maxScale = 2.0;
    const step = 0.05;

    // --- HTML structure creation/patch ---
    // Find or create slider container
    let sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) {
        sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        // Insert into DOM as needed, e.g. document.body.appendChild(sliderContainer);
        // You may want to insert this at a specific place in your layout
        document.body.appendChild(sliderContainer);
    }

    // Find or create zoom out button
    let zoomOutBtn = sliderContainer.querySelector('.zoom-out');
    if (!zoomOutBtn) {
        zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'zoom-out md-icon-button';
        zoomOutBtn.title = 'Zoom out';
        zoomOutBtn.innerHTML = '<md-icon>zoom_out</md-icon>';
        sliderContainer.appendChild(zoomOutBtn);
    }

    // Find or create slider root
    let slider = sliderContainer.querySelector('.slider');
    if (!slider) {
        slider = document.createElement('div');
        slider.className = 'slider';
        sliderContainer.appendChild(slider);
    }

    // Find or create track bar (background)
    let sliderTrack = slider.querySelector('.slider-track');
    if (!sliderTrack) {
        sliderTrack = document.createElement('div');
        sliderTrack.className = 'slider-track';
        slider.appendChild(sliderTrack);
    }

    // Find or create filled track (active bar)
    let sliderActive = slider.querySelector('.slider-active');
    if (!sliderActive) {
        sliderActive = document.createElement('div');
        sliderActive.className = 'slider-active';
        slider.appendChild(sliderActive);
    }

    // Find or create thumb
    let sliderThumb = slider.querySelector('.slider-thumb');
    if (!sliderThumb) {
        sliderThumb = document.createElement('div');
        sliderThumb.className = 'slider-thumb';
        slider.appendChild(sliderThumb);
    }

    // Find or create zoom in button
    let zoomInBtn = sliderContainer.querySelector('.zoom-in');
    if (!zoomInBtn) {
        zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'zoom-in md-icon-button';
        zoomInBtn.title = 'Zoom in';
        zoomInBtn.innerHTML = '<md-icon>zoom_in</md-icon>';
        sliderContainer.appendChild(zoomInBtn);
    }

    // Find vertical center target
    const verticalCenter = document.querySelector('.vertical-center');
    if (!slider || !sliderTrack || !sliderThumb || !verticalCenter) return;

    // --- JS logic for slider ---
    window.scale = 1.0;

    // Use global isMobile function

    // Unified scale limits for all devices
    function getScaleLimits() {
        return { min: 0.3, max: 2.0 }; // Same range for all devices
    }

    function setScale(newScale) {
        const limits = getScaleLimits();
        window.scale = clamp(newScale, limits.min, limits.max);
        
        // Get current translation from the transform
        const currentTransform = verticalCenter.style.transform;
        const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
        let translateX = 0, translateY = 0;
        
        if (translateMatch) {
            const translateValues = translateMatch[1].split(',');
            translateX = parseInt(translateValues[0]) || 0;
            translateY = parseInt(translateValues[1]) || 0;
        }
        
        // Apply unified scaling
        verticalCenter.style.transform = `translate(${translateX}px, ${translateY}px) scale(${window.scale})`;
        
        updateSliderThumb();
    }

    // Function to update scale without affecting position
    function updateScaleOnly(newScale) {
        const limits = getScaleLimits();
        window.scale = clamp(newScale, limits.min, limits.max);
        
        // Get current translation from the transform
        const currentTransform = verticalCenter.style.transform;
        const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
        let translateX = 0, translateY = 0;
        
        if (translateMatch) {
            const translateValues = translateMatch[1].split(',');
            translateX = parseInt(translateValues[0]) || 0;
            translateY = parseInt(translateValues[1]) || 0;
        }
        
        // Apply scale while preserving position
        verticalCenter.style.transform = `translate(${translateX}px, ${translateY}px) scale(${window.scale})`;
        
        updateSliderThumb();
    }

    function updateSliderThumb() {
        const sliderWidth = slider.offsetWidth;
        const thumbWidth = sliderThumb.offsetWidth;
        const limits = getScaleLimits();
        const range = limits.max - limits.min;
        const percent = (window.scale - limits.min) / range;
        const pos = percent * (sliderWidth - thumbWidth);

        // Thumb position
        sliderThumb.style.left = `${pos}px`;

        // Active track width
        sliderActive.style.width = `${pos + thumbWidth/2}px`;
    }

    function getScaleFromX(x) {
        const rect = slider.getBoundingClientRect();
        const sliderWidth = slider.offsetWidth;
        const thumbWidth = sliderThumb.offsetWidth;
        const limits = getScaleLimits();
        const range = limits.max - limits.min;
        let relX = clamp(x - rect.left - thumbWidth/2, 0, sliderWidth - thumbWidth);
        let percent = relX / (sliderWidth - thumbWidth);
        return limits.min + percent * range;
    }

    // Drag logic
    let dragging = false;
    function onPointerDown(e) {
        dragging = true;
        document.body.style.userSelect = 'none';
        onPointerMove(e);
    }
    function onPointerMove(e) {
        if (!dragging) return;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setScale(getScaleFromX(clientX));
    }
    function onPointerUp() {
        dragging = false;
        document.body.style.userSelect = '';
    }

    sliderThumb.addEventListener('mousedown', onPointerDown);
    sliderThumb.addEventListener('touchstart', onPointerDown, {passive: false});
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, {passive: false});
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Clicking on track moves thumb
    slider.addEventListener('mousedown', function(e) {
        if (e.target === sliderThumb) return;
        setScale(getScaleFromX(e.clientX));
    });
    slider.addEventListener('touchstart', function(e) {
        if (e.target === sliderThumb) return;
        setScale(getScaleFromX(e.touches[0].clientX));
    }, {passive: false});

    // Zoom in/out buttons
    zoomInBtn.addEventListener('click', function() {
        setScale(scale + step);
    });
    zoomOutBtn.addEventListener('click', function() {
        setScale(scale - step);
    });

    // Initial UI update
    setScale(scale);

    // Responsive: update thumb on resize
    window.addEventListener('resize', function() {
        updateSliderThumb();
        // Don't reset position or scale on resize - just update the slider thumb
    });
})();

// Mode switching functionality
// Use existing currentMode variable for drag/normal mode
let dragMode = 'normal'; // 'normal' or 'drag'

function toggleMode(mode) {
    const normalBtn = document.getElementById('normal-mode-btn');
    const dragBtn = document.getElementById('drag-mode-btn');
    const body = document.body;
    
    // Check if buttons exist before using them
    if (!normalBtn || !dragBtn) return;
    
    // Update button states
    if (mode === 'normal') {
        normalBtn.classList.add('active');
        dragBtn.classList.remove('active');
        body.classList.remove('drag-mode');
        body.classList.add('normal-mode');
        dragMode = 'normal';
    } else if (mode === 'drag') {
        normalBtn.classList.remove('active');
        dragBtn.classList.add('active');
        body.classList.remove('normal-mode');
        body.classList.add('drag-mode');
        dragMode = 'drag';
    }
}

// Initialize mode (start with normal mode)
document.addEventListener('DOMContentLoaded', function() {
    toggleMode('normal');
});

    // Unified drag and scale system for all screen sizes
    (function() {
        const verticalCenter = document.querySelector('.vertical-center');
        if (!verticalCenter) return;

        let isDragging = false;
        let startX, startY;
        let currentX = 0, currentY = 0;
        let lastX = 0, lastY = 0;

        // Initialize transform
        verticalCenter.style.transform = 'translate(0px, 0px) scale(1)';

        // Reset function
        function resetDrag() {
            currentX = 0;
            currentY = 0;
            lastX = 0;
            lastY = 0;
            window.scale = 1.0;
            verticalCenter.style.transform = 'translate(0px, 0px) scale(1)';
            updateSliderThumb();
        }

        // Make resetDrag function globally available
        window.resetDrag = resetDrag;

    function startDragging(e) {
        if (dragMode !== 'drag') return;
        
        // Don't drag on interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
            return;
        }
        
        isDragging = true;
        startX = e.clientX || e.touches[0].clientX;
        startY = e.clientY || e.touches[0].clientY;
        
        // Remove transition for immediate response
        verticalCenter.style.transition = 'none';
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
        
        e.preventDefault();
        e.stopPropagation();
    }

    function drag(e) {
        if (!isDragging || dragMode !== 'drag') return;
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        currentX = lastX + deltaX;
        currentY = lastY + deltaY;
        
        // Apply transform immediately using current scale
        verticalCenter.style.transform = `translate(${currentX}px, ${currentY}px) scale(${window.scale})`;
        
        e.preventDefault();
        e.stopPropagation();
    }

    function stopDragging() {
        if (!isDragging) return;
        
        isDragging = false;
        lastX = currentX;
        lastY = currentY;
        
        // Restore transition
        verticalCenter.style.transition = 'transform 0.2s ease';
        
        // Restore text selection
        document.body.style.userSelect = '';
    }

    // Unified event listeners for all devices
    verticalCenter.addEventListener('mousedown', startDragging);
    verticalCenter.addEventListener('touchstart', startDragging, { passive: false });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);
    document.addEventListener('touchcancel', stopDragging);

    // Prevent default behaviors
    verticalCenter.addEventListener('dragstart', e => e.preventDefault());
    verticalCenter.addEventListener('contextmenu', e => {
        if (dragMode === 'drag') e.preventDefault();
    });
})();


// Force remove 'fullscreen' attribute from all <forge-dialog> elements at all times
function removeForgeDialogFullscreen() {
    const dialogs = document.querySelectorAll('forge-dialog[fullscreen]');
    dialogs.forEach(dialog => {
        dialog.removeAttribute('fullscreen');
    });
}

// Initial removal
removeForgeDialogFullscreen();

// Listen for window resize to keep removing the attribute
window.addEventListener('resize', removeForgeDialogFullscreen);

// Tab switching functionality
function switchTab(tabName) {
    // Hide all content sections
    document.querySelectorAll('.content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show the selected content
    const selectedContent = document.querySelector('.content.' + tabName);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Update tab styling (optional - you can add active states here)
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector('.tab.' + tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Initialize tab functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listeners to tabs
    const configTab = document.querySelector('.tab.config');
    const elementsTab = document.querySelector('.tab.elements');
    const minimizeTab = document.querySelector('.tab.minimize');
    
    if (configTab) {
        configTab.addEventListener('click', function() {
            switchTab('config');
        });
    }
    
    if (elementsTab) {
        elementsTab.addEventListener('click', function() {
            switchTab('elements');
        });
    }
    
    if (minimizeTab) {
        minimizeTab.addEventListener('click', function() {
            const bottomAppBar = document.querySelector('.bottom-side-bar');
            if (bottomAppBar) {
                // Toggle between minimized and normal state
                if (bottomAppBar.style.height === '30px') {
                    // Restore to normal height
                    bottomAppBar.style.height = '';
                } else {
                    // Minimize to 30px
                    bottomAppBar.style.height = '30px';
                }
            }
        });
    }
    
    // Set initial state - show config by default
    switchTab('config');
});

// Responsive behavior for mobile screens
function handleResponsiveLayout() {
    const configElement = document.getElementById('config');
    const elementsElement = document.getElementById('elements');
    const configContent = document.querySelector('.content.config');
    const elementsContent = document.querySelector('.content.elements');
    
    if (!configElement || !elementsElement || !configContent || !elementsContent) {
        return;
    }
    
    const isMobile = window.innerWidth <= 860;
    
    if (isMobile) {
        // Move #config to .content.config
        if (configElement.parentElement !== configContent) {
            configContent.appendChild(configElement);
            configElement.style.height = '85%';
        }
        
        // Move #elements to .content.elements
        if (elementsElement.parentElement !== elementsContent) {
            elementsContent.appendChild(elementsElement);
            elementsElement.style.height = '85%';
        }
    } else {
        // Restore original positions when screen width increases
        const sideselectionright = document.querySelector('.sideselectionright md-list');
        const sideselection = document.querySelector('.sideselection md-list');
        const elementsTopabRight = document.querySelector('.sideselectionright .elements-topab');
        const elementsTopabLeft = document.querySelector('.sideselection .elements-topab');
        
        if (sideselectionright && configElement.parentElement === configContent) {
            // Insert #config after the elements-topab div in sideselectionright
            if (elementsTopabRight) {
                elementsTopabRight.parentNode.insertBefore(configElement, elementsTopabRight.nextSibling);
            } else {
                sideselectionright.appendChild(configElement);
            }
            configElement.style.height = '';
        }
        
        if (sideselection && elementsElement.parentElement === elementsContent) {
            // Insert #elements after the elements-topab div in sideselection
            if (elementsTopabLeft) {
                elementsTopabLeft.parentNode.insertBefore(elementsElement, elementsTopabLeft.nextSibling);
            } else {
                sideselection.appendChild(elementsElement);
            }
            elementsElement.style.height = '';
        }
    }
}

// Call responsive function on load and resize
document.addEventListener('DOMContentLoaded', handleResponsiveLayout);
window.addEventListener('resize', handleResponsiveLayout);

// Page navigation functionality
function handlePageNavigation() {
    // Add click event listeners to all page list items
    const pageItems = document.querySelectorAll('.list-item.page');
    
    if (pageItems.length === 0) {
        // Try alternative selectors
        const altPageItems = document.querySelectorAll('.list-item.document-li-itm.page');
        
        if (altPageItems.length > 0) {
            altPageItems.forEach(function(pageItem, index) {
                setupPageItemClick(pageItem);
            });
            
            // Check URL parameter first, then default to first page
            const urlDoc = getPageFromURL();
            if (urlDoc) {
                showPage(urlDoc);
            } else {
                // Set initial state
                const firstPageItem = altPageItems[0];
                if (firstPageItem) {
                    firstPageItem.click();
                }
            }
        }
    } else {
        pageItems.forEach(function(pageItem, index) {
            setupPageItemClick(pageItem);
        });
        
        // Check URL parameter first, then default to first page
        const urlDoc = getPageFromURL();
        if (urlDoc) {
            showPage(urlDoc);
        } else {
            // Set initial state
            const firstPageItem = pageItems[0];
            if (firstPageItem) {
                firstPageItem.click();
            }
        }
    }
}

// Function to show a specific page
function showPage(targetPage) {
    // Hide all main-content elements
    const allContents = document.querySelectorAll('.main-content');
    allContents.forEach(function(content) {
        content.style.display = 'none';
    });
    
    // Show the corresponding main-content element
    const targetContent = document.querySelector('.main-content#' + targetPage);
    if (targetContent) {
        targetContent.style.display = 'block';
    }
}

// Function to update URL parameter
function updateURLParameter(doc) {
    const url = new URL(window.location);
    url.searchParams.set('doc', doc);
    window.history.pushState({}, '', url);
}

// Function to get page from URL parameter
function getPageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('doc');
}

function setupPageItemClick(pageItem) {
    pageItem.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the page class from the element
        const pageClasses = this.className.split(' ');
        let targetPage = null;
        
        // Find the page class (starts with 'pg_')
        for (let className of pageClasses) {
            if (className.startsWith('pg_')) {
                targetPage = className.replace('pg_', ''); // Remove 'pg_' prefix
                break;
            }
        }
        
        if (targetPage) {
            // Show the page
            showPage(targetPage);
            
            // Update URL parameter
            updateURLParameter(targetPage);
        }
    });
}

// Initialize page navigation on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // First, hide all main-content elements
    document.querySelectorAll('.main-content').forEach(function(content) {
        content.style.display = 'none';
    });
    
    handlePageNavigation();
});

