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

var buttonType = {
    move: 1,
    restart: 2,
    giveCode: 3
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
  constructor(levelId, board, code, squareSize, height, width) {
    this.levelId = levelId;
    this.board = board;
    this.code = code;
    this.squareSize = squareSize;
    this.height = height;
    this.width = width;
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
currentLevel = null;

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
        levels.push(new Level(levelId, board, code, squareSize, height, width));
        levelId++;
    }
}

function setLevel(){
    level = levels[currentLevelId];
    boardToCopy = level.board;
    copyBoard = [];
    for(var h = 0; h < boardToCopy.length; h++){
        copyBoard.push([]);
        for(var w = 0; w < boardToCopy[h].length; w++){
            copyBoard[h].push(boardToCopy[h][w]);
        }
    }
    currentLevel = new Level(level.levelId, copyBoard, level.code, level.squareSize, level.height, level.width);
}

function getPlayerPosition(){
    currentBoard = currentLevel.board;
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
    ctx.canvas.height = currentLevel.height * currentLevel.squareSize;
    currentBoard = currentLevel.board;
    squareSize = currentLevel.squareSize;
    for(var h = 0; h < currentBoard.length; h++){
        for(var w = 0; w < currentBoard[h].length; w++){
            ctx.beginPath();
            ctx.rect(w * squareSize, h * squareSize, squareSize, squareSize);
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

    buttons.forEach(function(button) {
        if (y > button.top && y < button.top + button.height
            && x > button.left && x < button.left + button.width) {
            if (button.type === buttonType.move){
                movePlayer(button.direction);
            }
            else if (button.type === buttonType.restart){
                setLevel();
                draw();
            }
            else if (button.type === buttonType.giveCode){
                var code = prompt("Please enter level code:", "One");
                if (code !== null && code !== "") {
                    for (var i = 0; i < levels.length; i++){
                        if (code.toUpperCase() === levels[i].code.toUpperCase()){
                            currentLevelId = i;
                            setLevel();
                            draw();
                        }
                    }
                }
            }
        }
    });
}, false);

buttons.push({
    colour: "#006600",
    width: 100,
    height: 100,
    top: 150,
    left: 10,
    type: buttonType.move,
    direction: moveDirection.left
});

buttons.push({
    colour: "#006600",
    width: 100,
    height: 100,
    top: 40,
    left: 120,
    type: buttonType.move,
    direction: moveDirection.up
});

buttons.push({
    colour: "#006600",
    width: 100,
    height: 100,
    top: 150,
    left: 120,
    type: buttonType.move,
    direction: moveDirection.down
});

buttons.push({
    colour: "#006600",
    width: 100,
    height: 100,
    top: 150,
    left: 230,
    type: buttonType.move,
    direction: moveDirection.right
});

buttons.push({
    colour: "#0095DD",
    width: 100,
    height: 100,
    top: 40,
    left: 400,
    type: buttonType.restart,
    direction: null
});

buttons.push({
    colour: "#000099",
    width: 100,
    height: 100,
    top: 150,
    left: 400,
    type: buttonType.giveCode,
    direction: null
});

buttons.forEach(function(element) {
    ctxControl.fillStyle = element.colour;
    ctxControl.fillRect(element.left, element.top, element.width, element.height);
});

function won(){
    currentBoard = currentLevel.board;
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
    currentBoard = currentLevel.board;
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
                setLevel();
                alert("Well done! Code for next level is: " + currentLevel.code);
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
