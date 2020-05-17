var canvas = document.getElementById("boardCanvas");
var ctx = canvas.getContext("2d");

var canvasControl = document.getElementById("controlCanvas");
var ctxControl = canvasControl.getContext("2d");

var fieldValue = {
    empty: 0,
    wall: 1,
    player: 2,
    box: 4,
    goal: 8
}

var moveDirection = {
    up: 1,
    down: 2,
    left: 3,
    right: 4
}

var fieldMap = {
    '#': fieldValue.wall,
    '@': fieldValue.player,
    '+': fieldValue.player | fieldValue.goal,
    '$': fieldValue.box,
    '*': fieldValue.box | fieldValue.goal,
    '.': fieldValue.goal,
    ' ': fieldValue.empty
}

var colourMap = {
    [fieldValue.wall]: "#006600",
    [fieldValue.player]: "#0095DD",
    [fieldValue.player | fieldValue.goal]: "#000099",
    [fieldValue.box]: "#996633",
    [fieldValue.box | fieldValue.goal]: "#663300",
    [fieldValue.goal]: "#ff0000",
    [fieldValue.empty]: "#ffbf00"
}

class Level{
  constructor(levelId, board, code, squareSize) {
    this.levelId = levelId;
    this.board = board;
    this.code = code;
    this.squareSize = squareSize;
  }
}

class FieldLocation{
    constructor(column, row) {
        this.column = column;
        this.row = row;
    }
}

levels = [];
currentLevelId = 0;
currentBoard = [0][0];
squareSize = 50;

function loadLevels(){
    mapsLines = maps.split('\n');
    var lineNumber = 0;
    var levelId = 0;
    while(lineNumber < mapsLines.length){
        code = mapsLines[lineNumber];
        lineNumber++;
        size = mapsLines[lineNumber].split(' ');
        lineNumber++;
        board=[];
        width = parseInt(size[0]);
        height = parseInt(size[1]);
        squareSize = Math.round(Math.min(canvas.width/width, canvas.height/height));
        for(var h = 0; h < height; h++){
            line = mapsLines[lineNumber];
            lineFields = [];
            for(var w = 0; w < width; w++){
                lineFields.push(fieldMap[line[w]]);
            }
            board.push(lineFields);
            lineNumber++;
        }
        levels.push(new Level(levelId, board, code, squareSize));
        levelId++;
    }
}

function setLevel(){
    level = levels[currentLevelId];
    boardToCopy = level.board;
    squareSize = level.squareSize;
    currentBoard = [];
    for(var h = 0; h < boardToCopy.length; h++){
        currentBoard.push([]);
        for(var w = 0; w < boardToCopy[h].length; w++){
            currentBoard[h].push(boardToCopy[h][w]);
        }
    }
}

function getPlayerPosition(){
    for(var h = 0; h < currentBoard.length; h++){
        for(var w = 0; w < currentBoard[h].length; w++){
            if ((currentBoard[h][w] & fieldValue.player) == fieldValue.player){
                return new FieldLocation(w, h);
            }
        }
    }
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var h = 0; h < currentBoard.length; h++){
        for(var w = 0; w < currentBoard[h].length; w++){
            ctx.beginPath();
            ctx.rect(w*squareSize, h*squareSize, squareSize, squareSize);
            ctx.fillStyle = colourMap[currentBoard[h][w]];
            ctx.fill();
            ctx.closePath();
        }
    }
}

var canvasControlLeft = canvasControl.offsetLeft + canvasControl.clientLeft,
canvasControlTop = canvasControl.offsetTop + canvasControl.clientTop,
    buttons = [];

canvasControl.addEventListener('click', function(event) {
    var x = event.pageX - canvasControlLeft,
        y = event.pageY - canvasControlTop;

    // Collision detection between clicked offset and element.
    buttons.forEach(function(button) {
        if (y > button.top && y < button.top + button.height
            && x > button.left && x < button.left + button.width) {
            movePlayer(button.direction);
        }
    });

}, false);

// Add element.
buttons.push({
    colour: '#05EFFF',
    width: 100,
    height: 100,
    top: 150,
    left: 90,
    direction: moveDirection.left
});

buttons.push({
    colour: '#05EFFF',
    width: 100,
    height: 100,
    top: 40,
    left: 200,
    direction: moveDirection.up
});

buttons.push({
    colour: '#05EFFF',
    width: 100,
    height: 100,
    top: 150,
    left: 200,
    direction: moveDirection.down
});

buttons.push({
    colour: '#05EFFF',
    width: 100,
    height: 100,
    top: 150,
    left: 310,
    direction: moveDirection.right
});

// Render elements.
buttons.forEach(function(element) {
    ctxControl.fillStyle = element.colour;
    ctxControl.fillRect(element.left, element.top, element.width, element.height);
});

function won(){
    for(var h = 0; h < currentBoard.length; h++){
        for(var w = 0; w < currentBoard[h].length; w++){
            if (currentBoard[h][w] == fieldValue.box){
                return false;
            }
        }
    }
    return true;
}

function tryMove(playerPosition, destination, behindDestination){
    var destinationFieldValue = currentBoard[destination.row][destination.column];
    if (destinationFieldValue == fieldValue.wall)
        return false;
    if (destinationFieldValue == fieldValue.empty || destinationFieldValue == fieldValue.goal)
    {
        currentBoard[playerPosition.row][playerPosition.column] &= ~fieldValue.player;
        currentBoard[destination.row][destination.column] |= fieldValue.player;
        return true;
    }
    else if ((destinationFieldValue & fieldValue.box) == fieldValue.box)
    {
        var valueBehind = currentBoard[behindDestination.row][behindDestination.column];
        if (valueBehind == fieldValue.wall || (valueBehind & fieldValue.box) == fieldValue.box)
            return false;
        currentBoard[behindDestination.row][behindDestination.column] |= fieldValue.box;
        currentBoard[playerPosition.row][playerPosition.column] &= ~fieldValue.player;
        currentBoard[destination.row][destination.column] = 
            (currentBoard[destination.row][destination.column] | fieldValue.player) & ~fieldValue.box;
        return true;
    }
    return false;
}

function movePlayer(move){
    moved = false;
    playerPosition = getPlayerPosition();
    switch (move) {
        case moveDirection.up:
            moved = tryMove(playerPosition,
                            new FieldLocation(playerPosition.column, playerPosition.row - 1),
                            new FieldLocation(playerPosition.column, playerPosition.row - 2));
            break;
        case moveDirection.down:
            moved = tryMove(playerPosition,
                            new FieldLocation(playerPosition.column, playerPosition.row + 1),
                            new FieldLocation(playerPosition.column, playerPosition.row + 2));
            break;
        case moveDirection.left:
            moved = tryMove(playerPosition,
                            new FieldLocation(playerPosition.column - 1, playerPosition.row),
                            new FieldLocation(playerPosition.column - 2, playerPosition.row));
            break;
        case moveDirection.right:
            moved = tryMove(playerPosition,
                            new FieldLocation(playerPosition.column + 1, playerPosition.row),
                            new FieldLocation(playerPosition.column + 2, playerPosition.row));
            break;
    }
    if (moved){
        draw();
        if (won()){
            currentLevelId++;
            if (currentLevelId >= levels.length){
                alert("That was last level, thank you for playing!");
            }
            else{
                alert("Well done!");
                setLevel();
                draw();
            }
        }
    }
}

function keyDownHandler(e) {
    direction = null;
    switch (event.key) {
        case "Down": // IE/Edge specific value
        case "ArrowDown":
            direction = moveDirection.down;
            break;
        case "Up": // IE/Edge specific value
        case "ArrowUp":
            direction = moveDirection.up;
            break;
        case "Left": // IE/Edge specific value
        case "ArrowLeft":
            direction = moveDirection.left;
            break;
        case "Right": // IE/Edge specific value
        case "ArrowRight":
            direction = moveDirection.right;
            break;
    }
    if (direction !== null) {
        movePlayer(direction);
    }
}

loadLevels();
setLevel();

document.addEventListener("keydown", keyDownHandler, false);

draw();
