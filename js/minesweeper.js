/*
This program is a Javascript based,
GUI implementation of the classic game Minesweeper.

Symbol Legend:
integers 0-8: a blank square with number corresponding to the # of adjacent mines
M: a square occupied by a mine


@author Daniel Gilbert
@date started: October 6, 2017
@date finished: October 11, 2017
 */

//global variables
var y = 0; //size of y axis of array
var x = 0; //size of x axis of array
var total = 0; //total number of squares on the board
var mines = 0; //number of mines

var mineSquares; //holds Square objects which identify mine locations
var mineLocs; //holds Square numbers where mines need to be placed

var f = []; //2D arrays that defines the grid
var flags = []; //2D array that keeps track of flag locations

var clearedTiles = []; //2D array to keep track of cleared tiles
var tilesToClear = 0; //number of tiles left to clear before victory

var grid; //holds tiles for GUI
var params = new Array(); //holds parameters for game setup. Different for easy/med/hard
var flagCounter; //keeps track of flags placed

/*
sets/resets the board for a new game
all variables and images reset
 */
function startGame() {

    flagCounter = 0;
    faceReset();
    // Fetch grid and clear out old elements.
    grid = document.getElementById("minefield");
    grid.innerHTML = "";
    mineSquares = []; //holds Square objects which identify mine locations
    mineLocs = new Set(); //holds Square numbers where mines need to be placed
    //get parameters set by difficultySelection
    total = params.pop();
    mines = params.pop();
    x = params.pop();
    y = params.pop();
    f = buildBackBoard(x,y,mines,total); //build back-end board representation
    buildGrid(x,y, grid); //build GUI board representation
    startTimer(); //start timer
    tilesToClear = leftToClear();
    updateMines();

    //refill params array so user's selection is preserved until they make a new one
    params = new Array();
    params.push(y,x,mines,total);

}

/*
defines a Square object with references
to coordinates of the 2D array.
takes in coordinates and
contains functions to return y and x values.
 */
function Square (y, x) {
    this.y = y;
    this.x = x;
    this.getY = function() {
        return this.y;
    };

    this.getX = function() {
        return this.x;
    };
}
/*
displays ASCII representation of the Board in console
takes in array f
used for debugging purposes
 */
function displayASCII(f){

    for (i=0;i<y;i++) {
        var temp = "";
        for (j=0;j<x;j++) {
            temp += " " + f[i][j];
        }
        console.log(temp);
    }
}

/*
takes in 2D array, a Square within the 2D array and the maximum bounds of board.
for every Square in array, finds all adjacent squares.
if an adjacent square is not outside the bounds of the board,
adds it to a new array of Squares, which is then returned.
 */
function findAdjacent(f, s, yMax, xMax){

    var adjSquares = []; //stores adjacent squares

    //get Y and X values
    var i = s.getY();
    var j = s.getX();

    //check if adjacent squares are within bounds
    //
    //checks square up and to the left
    if(i-1>= 0 && j-1 >=0){
        var temp = new Square(i-1,j-1);
        adjSquares.push(temp);
    }
    //checks square up and centered
    if(i-1>= 0 && j >=0){
        var temp = new Square(i-1,j);
        adjSquares.push(temp);
    }
    //checks square up and to the right
    if(i-1>= 0 && j+1 <xMax){
        var temp = new Square(i-1,j+1);
        adjSquares.push(temp);
    }
    //checks square centered and to the left
    if(i>= 0 && j-1 >=0){
        var temp = new Square(i,j-1);
        adjSquares.push(temp);
    }
    //checks square centred and to the right
    if(i>= 0 && j+1 <xMax){
        var temp = new Square(i,j+1);
        adjSquares.push(temp);
    }
    //checks square down and to the left
    if(i+1< yMax && j-1 >=0){
        var temp = new Square(i+1,j-1);
        adjSquares.push(temp);
    }
    //checks square down and centred
    if(i+1< yMax && j >=0){
        var temp = new Square(i+1,j);
        adjSquares.push(temp);
    }
    //checks square down and to the right
    if(i+1< yMax && j+1 <xMax){
        var temp = new Square(i+1,j+1);
        adjSquares.push(temp);
    }

    return adjSquares;
}

/*
checks adjacent squares
if none contain bombs, returns true
otherwise returns false
 */
function largeClear(f,s,yMax,xMax){

    var returnVal = true;
    var adjSquares = findAdjacent(f, s, yMax, xMax);//get all adjacent squares

    adjSquares.forEach(function(item, index, array){
        //get coordinates
        var y = item.getY();
        var x = item.getX();
        //get value at coordinates
        var val = f[y][x];
        var val2 = flags[y][x];

        //if location is not occupied by a mine or a flag, do nothing
        if(val != 'M' && val2 != 'F'){

        }
        else{ //otherwise, return false
            returnVal = false;
        }
    });

    return returnVal;

}

/*
functions takes in 2D array, an array of Squares within the 2D array
and the boundary limits of the graph.
For each element in the array of Squares, calls findAdjacent function to get an array
of squares within the bounds adjacent to the specified square.
Then each adjacent square not occupied by another mine is incremented by 1
 */
function updateBoard(f, s, yMax, xMax){

    //for each Square object in the s array
    s.forEach(function(item, index, array){
        var adjSquares = findAdjacent(f, item, yMax, xMax);
        //for each Square object in the adjacent array
        adjSquares.forEach(function(item, index, array){
            //get coordinates
            var y = item.getY();
            var x = item.getX();
            //get value at coordinates
            var val = f[y][x];

            //if location is not occupied by a mine, increments the value there
            if(val != 'M'){
                var newVal = val +1;
                f[y][x] = newVal;

            }
        });
    });
    return f;
}

/*
Fills the 2D array with mines and stores the squares which contain mines in their own array.
Also builds 2D array to keep track of tiles that have been cleared.
 */
function buildBackBoard(x,y,mines,total){

    /*
    randomly generates number between 0 and the max number of squares.
    if number generated is not in the set, add it.
    continue until desired # of mines is reached
    */
    for(i=0; i<mines; i++){

        var temp = Math.floor((Math.random() * total) + 0);
        //if number has already been selected, don't add to set
        //subtract one from i so proper number of mines are created
        if(mineLocs.has(temp)){
            i--;
        }
        else{ //otherwise, add number to Set
            mineLocs.add(temp);
        }

    }


    var counter = 0;

    //creates 2D array for cleared tiles
    for (i=0;i<y;i++) {
        clearedTiles[i] = [];
        for (j = 0; j < x; j++) {
            clearedTiles[i][j] = 0;
        }
    }

    /*
    creates array of arrays using nested for loops.
    uses counter to keep track of number of squares created.
    if a square picked out as a mine location is reached,
    adjusts the symbol accordingly, and creates a new square object
    to represent the mine loc. Stores this in mineSquares array
     */

    for (i=0;i<y;i++) {
        f[i]=[];
        for (j=0;j<x;j++) {

            //checks current square number against set of Mine locations
            if(mineLocs.has(counter)){
                f[i][j] = 'M'; //M representes mine
                clearedTiles[i][j] = 'C'; //mine squares don't need to be cleared
                var s = new Square(i,j); //creates a Square representing current location
                mineSquares.push(s); //adds square to array of Squares representing mine locations
            }
            else{
                f[i][j]= 0; //zero used as initial placeholder
            }

            counter++;
        }
    }

    //call to updateBoard function to number non-mined squares
    f = updateBoard(f, mineSquares, y, x);

    //creates 2D array for flag board
    for (i=0;i<y;i++) {
        flags[i] = [];
        for (j = 0; j < x; j++) {
            flags[i][j] = 0;
        }
    }


    return f;
}

/*
checks array that keeps track of how many tiles have been cleared
and returns number corresponding to the # left to be cleared
 */
function leftToClear(){

    var returnVal = 0;
    for (i=0;i<y;i++) {
        for (j = 0; j < x; j++) {

            if(clearedTiles[i][j] === 0){
                returnVal++;
            }
        }
    }

    return returnVal;

}

//checks whether specified location contains a flag or not
function flagCheck(x,y){

    var val = flags[y][x];
    var returnVal = false;

    if(val == 'F'){
        returnVal = true;
    }

    return returnVal;

}

//switches the flag state of a square on the flag board
function updateFlags(x,y){

    if(flags[y][x] == 0){
        flags[y][x] = 'F';
        flagCounter++;
        updateMines();//update counter of remaining mines
    }
    else{
        flags[y][x] = 0;
        flagCounter--;
        updateMines();//update counter of remaining mines
    }
}

/*
checks adjacent squares for flags
returns a count of all flags in adjacent squares
 */
function flagCheckLarge(f,s){

    var returnVal = 0;
    var adjSquares = findAdjacent(f, s, y, x);//get all adjacent squares

    adjSquares.forEach(function(item, index, array){
        //get coordinates
        var y = item.getY();
        var x = item.getX();
        //get value at coordinates
        var val = flags[y][x];

        //if location has a flag
        if(val == 'F'){

            returnVal++; //add to returnVal

        }
        else{ //otherwise, do nothing

        }
    });

    return returnVal;

}

/*
checks the value of the backBoard located at the specified location
returns img key word associated with value in specified location
 */
function boardVal(x,y,f){

    var val = f[y][x];
    var returnVal = "";

    if(val == 'M'){
        returnVal = "mine_hit";
    }
    if(val == 0){
        returnVal = "clear";
    }
    if(val == 1){
        returnVal = "tile_1";
    }
    if(val == 2){
        returnVal = "tile_2";
    }
    if(val == 3){
        returnVal = "tile_3";
    }
    if(val == 4){
        returnVal = "tile_4";
    }
    if(val == 5){
        returnVal = "tile_5";
    }
    if(val == 6){
        returnVal = "tile_6";
    }
    if(val == 7){
        returnVal = "tile_7";
    }
    if(val == 8){
        returnVal = "tile_8";
    }

    return returnVal;
}


/*
builds grid of tiles that functions as GUI for the game.
tiles are equipped with event handler to respond to users moves.
back-end and front-end are then updated to correspond to new board state.
 */
function buildGrid(x,y, grid) {


    var columns = x;
    var rows = y;

    // Build DOM Grid
    var tile;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {
            tile = createTile(x,y);
            grid.appendChild(tile);
        }
    }
    
    var style = window.getComputedStyle(tile);

    var width = parseInt(style.width.slice(0, -2));
    var height = parseInt(style.height.slice(0, -2));
    
    grid.style.width = (columns * width) + "px";
    grid.style.height = (rows * height) + "px";

}

/*
creates the tiles for the GUI.
tiles are equipped with event handlers to respond to input.
x and y variables are stored so tile can be paired to
corresponding square on back-end board
 */
function createTile(x,y) {
    var tile = document.createElement("div");
    tile.classList.add("tile");

    tile.x = x;
    tile.y = y;

    tile.classList.add("hidden");

    tile.addEventListener("mousedown", faceLimbo);
    tile.addEventListener("auxclick", function(e) { e.preventDefault(); }); // Middle Click
    tile.addEventListener("contextmenu", function(e) { e.preventDefault(); }); // Right Click
    tile.addEventListener("mouseup", handleTileClick ); // All Clicks

    return tile;
}


//functions to update smiley face
function smileyDown() {
    smiley = document.getElementById("smiley");
    smiley.classList.add("face_down");
}

function smileyUp() {
    smiley = document.getElementById("smiley");
    smiley.classList.remove("face_down");
}

function faceLose(){
    smiley = document.getElementById("smiley");
    smiley.classList.add("face_lose");
}

function faceWin(){
    smiley = document.getElementById("smiley");
    smiley.classList.add("face_win");
}
//resets face after win or lose
function faceReset(){
    smiley = document.getElementById("smiley");
    var lose = smiley.classList.contains("face_lose");
    if(lose == true) {
        smiley.classList.remove("face_lose");
    }
    else{
        smiley.classList.remove("face_win");
    }
}
function faceLimbo(){
    smiley = document.getElementById("smiley");
    smiley.classList.add("face_limbo");
}
function faceLimboOver(){
    smiley = document.getElementById("smiley");
    smiley.classList.remove("face_limbo");
}

/*
removes actions listeners from all tiles so user can't continue
to click after game has ended
 */
function remLis(){

    var tile = grid.firstElementChild;

    while(tile.nextElementSibling !== null) {

        tile.removeEventListener("mouseup", handleTileClick);

        tile = tile.nextElementSibling;
    }
}

//for each square that contains a mine
//find and reveal them along the board
function revealMines(x1,y1){

    mineSquares.forEach(function(item, index, array) {

        var square = item; //holder for current square
        var x = square.getX(); //x val of square
        var y = square.getY(); //y val of square


        var found = false; //used to manage while loop

        var tile = grid.firstElementChild;

        while(found == false){

            //get coords of current tile
            var tileX = tile.x;
            var tileY = tile.y;

            //if coords match x,y of current mine square
            //update the square
            //break out of while loop
            if(x==tileX && y == tileY){

                //don't update the square where the mine was hit
                if(x == x1 && y == y1){
                    found = true;
                }
                else {
                    tile.classList.remove("hidden");

                    var flagBool = flagCheck(tileX, tileY); //check if flagged

                    if(flagBool === true){ //if so, show marked mine
                        tile.classList.add("mine_marked")
                    }
                    else { //otherwise show regular mine
                        tile.classList.add("mine");
                    }
                    found = true;
                }
            }
            else{
                tile = tile.nextElementSibling;
            }

        }
    });
}

/*
updates the game state in response to a left click.
Returns values based on resulting situation:
"Flag": flag was clicked, do nothing.
"Game Over": mine was clicked, end game.
"Large Clear": square was clicked who's adjacent squares are all mine free,
clear all of them.
"Continue": reveal single tile
 */
function results(x1,y1,f){

    var sym = f[y1][x1];
    var returnVal;

    var flags = flagCheck(x1,y1);
    //if spot has a flag
    if(flags === true){
        //do nothing
        returnVal = "Flag";
    }
    else{ //otherwise, continue normal board update

        //if a mine was hit
        if(sym == 'M'){

            returnVal = "Game Over";
            revealMines(x1,y1); //reveal mines

        }
        else { //if spot is not occupied by a mine

            clearedTiles[y1][x1] = 'C'; //update clearedTiles Board
            //checks all adjacent squares
            //if none are mines, do a largeClear
            var square = new Square(y1,x1);
            var lrgClear = largeClear(f,square,y,x);
            if(lrgClear === true){
                returnVal = "Large Clear";

            }
            else { //otherwise, just continue
                returnVal = "Continue";
            }
        }

    }

    return returnVal;

}
/*
takes in coordinates and 2D array for the backend board
finds all adjacent squares
and then reveals them on the GUI
 */
function doLargeClear(x1,y1,f){

    //find adjacent squares
    var square = new Square(y1,x1);
    var adjSquares = findAdjacent(f,square,y,x);


    adjSquares.forEach(function(item, index, array) {

        var square = item; //holder for current square
        var x = square.getX(); //x val of square
        var y = square.getY(); //y val of square


        var found = false; //used to manage while loop

        var tile = grid.firstElementChild;

        while(found == false){

            //get coords of current tile
            var tileX = tile.x;
            var tileY = tile.y;

            //if coords match x,y of current adjacent square
            //update the tile
            //break out of while loop
            if(x==tileX && y == tileY){

                var newSym = boardVal(x,y,f);
                tile.classList.remove("hidden");
                tile.classList.add(newSym);
                found = true;
                clearedTiles[y][x] = 'C';
                tilesToClear = leftToClear();

            }
            else{
                tile = tile.nextElementSibling;
            }

        }
    });
}

/*
does large clear for a middle click,
ignoring flags and keeping track of mines
if a mine was found, returns true
 */
function doLargeClearMiddle(x1,y1,f){

    //find adjacent squares
    var square = new Square(y1,x1);
    var adjSquares = findAdjacent(f,square,y,x);
    var returnVal = false;


    adjSquares.forEach(function(item, index, array) {

        var square = item; //holder for current square
        var x = square.getX(); //x val of square
        var y = square.getY(); //y val of square


        var found = false; //used to manage while loop

        var tile = grid.firstElementChild; //gets first tile in grid

        while(found == false){

            //get coords of current tile
            var tileX = tile.x;
            var tileY = tile.y;

            //if coords match x,y of current adjacent square
            //update the tile
            //break out of while loop
            if(x==tileX && y == tileY){

                var flags = flagCheck(x,y); //check if square is flagged

                //don't update the square if flagged
                if(flags === true){
                    found = true;
                }
                else {
                    var newSym = boardVal(x,y,f);
                    tile.classList.remove("hidden");
                    tile.classList.add(newSym);
                    found = true;
                    //if spot contains a mine, update returnVal
                    if(f[y][x] == 'M'){
                        returnVal = true;
                    }
                    else{
                        clearedTiles[y][x] = 'C'; //update tile as "cleared"
                        tilesToClear = leftToClear();
                    }
                }
            }
            else{
                tile = tile.nextElementSibling; //gets next tile
            }

        }
    });

    return returnVal;
}

/*
Event handler for users click of a tile on the board
 */
function handleTileClick(event) {

    faceLimboOver(); //reset the limbo face
    // Left Click
    if (event.which === 1) {

        var x1 = this.x;
        var y1 = this.y;
        var newSym = boardVal(x1,y1,f); //get symbol that corresponds to value under specified tile
        var res = results(x1,y1,f);

        //if left-clicked spot was already flagged, do nothing
        if(res == "Flag"){


        }
        else{ //otherwise, update board as per usual

            this.classList.remove("hidden");
            this.classList.add(newSym);

            if(res == "Game Over"){//initiate end game behaviours if game is over

                faceLose();
                stopTimer();
                remLis();
            }
            else if(res == "Large Clear"){ //clears all adjacent tiles if none contain a mine

                doLargeClear(x1,y1,f);

            }
            else{
                //keep playing
                tilesToClear = leftToClear();
            }

        }

        //win check
        if(tilesToClear == 0){

            faceWin();
            stopTimer();
            remLis();
            alert("You Win! Final Score: " + timeValue);

        }

    }
    // Middle Click, tries to do large clear if appropriate flags are around
    else if (event.which === 2) {

        var bool = this.classList.contains("hidden"); //check if tile is hidden
        var bool2 = this.classList.contains("flag"); //check if tile is flagged

        //if spot is hidden or flagged
        if(bool === true || bool2 === true){
            //do nothing
        }
        else{

            //get Symbol of tile
            var x1 = this.x;
            var y1 = this.y;
            var s = new Square(y1,x1);
            var sym = f[y1][x1];

            var numFlags = flagCheckLarge(f,s); //check how many adjacent squares are flagged

            //if flagged squares matches number on this tile
            if(numFlags === sym){

                var mineRes = doLargeClearMiddle(x1,y1,f); //do large clear on adjacent tiles

                //if a mine was revealed, game over
                if(mineRes === true){

                    stopTimer();
                    revealMines(x1,y1);
                    faceLose();
                    remLis();
                }

            }
            else{
                //do nothing;
            }

        }

        //win check
        if(tilesToClear == 0){

            faceWin();
            stopTimer();
            remLis();
            alert("You Win! Final Score: " + timeValue);

        }

    }
    // Right Click, flag/unflag
    else if (event.which === 3) {

        var x = this.x;
        var y = this.y;

        var result = flagCheck(x,y); //check if spot already contains a flag

        //if alreadys has flag, remove
        //update flagboard
        if(result === true){

            this.classList.remove("flag");
            this.classList.add("hidden");
            updateFlags(x,y);

        }
        else{
            this.classList.remove("hidden");
            this.classList.add("flag");
            updateFlags(x,y);

        }

    }
}

/*
takes input from dropdown menu
sets parameters for board setup
 */
function setDifficulty() {
    var difficultySelector = document.getElementById("difficulty");
    var difficulty = difficultySelector.selectedIndex;

    var y;
    var x;
    var mines;
    var total;
    if(difficulty == "0"){
        y =0;
        x =0;
        mines = 0;
    }
    if(difficulty == "1"){
        y =9;
        x =9;
        mines = 10;
    }
    else if(difficulty == "2"){
        y =16;
        x =16;
        mines = 40;
    }
    else if( difficulty == "3"){
        y =16;
        x =30;
        mines = 99;
    }
    total = y*x;
    params = new Array();
    params.push(y,x,mines,total);

}

//initiates timer
function startTimer() {
    timeValue = 0;
    timerID = setInterval(onTimerTick, 1000);
}
//updates timer value
function onTimerTick() {
    timeValue++;
    updateTimer();
}
//updates timer display
function updateTimer() {
    document.getElementById("timer").innerHTML = timeValue;
}
//stops timer
function stopTimer(){
    clearInterval(timerID);
}
//updates display of remaining mines
function updateMines(){
    var remMines = mines - flagCounter;
    document.getElementById("flagCount").innerHTML = remMines;
}