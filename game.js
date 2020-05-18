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

var imageMap = {
    [fieldValue.wall]: "images/Wall.png",
    [fieldValue.player]: "images/Katrina.png",
    [fieldValue.player | fieldValue.goal]: "images/KatrinaGoal.png",
    [fieldValue.box]: "images/Box.png",
    [fieldValue.box | fieldValue.goal]: "images/BoxGoal.png",
    [fieldValue.goal]: "images/Goal.png",
    [fieldValue.empty]: "images/Floor.png"
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.canvas.height = currentLevel.height * currentLevel.squareSize;
    refreshButtonsLocation();
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

function createElement(w, h, squareSize, source){
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, w * squareSize, h * squareSize, squareSize, squareSize);
    };
    img.src = source;
}

function drawChanges(fieldsChanged){
    currentBoard = currentLevel.board;
    squareSize = currentLevel.squareSize;
    for(var f = 0; f < fieldsChanged.length; f++){
        field = fieldsChanged[f];
        source = imageMap[currentBoard[field.row][field.column]];
        createElement(field.column, field.row, squareSize, source);
    }
}

function drawFullBoard(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentBoard = currentLevel.board;
    squareSize = currentLevel.squareSize;
    for(var h = 0; h < currentBoard.length; h++){
        for(var w = 0; w < currentBoard[h].length; w++){
            createElement(w, h, squareSize, imageMap[currentBoard[h][w]]);
        }
    }
}

var canvasControlLeft = 0,
    canvasControlTop = 0,
    buttons = [];

function refreshButtonsLocation(){
    canvasControlLeft = canvasControl.offsetLeft + canvasControl.clientLeft;
    canvasControlTop = canvasControl.offsetTop + canvasControl.clientTop;
}

refreshButtonsLocation();

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
                drawFullBoard();
            }
            else if (button.type === buttonType.giveCode){
                var code = prompt("Please enter level code:", "One");
                if (code !== null && code !== "") {
                    for (var i = 0; i < levels.length; i++){
                        if (code.toUpperCase() === levels[i].code.toUpperCase()){
                            currentLevelId = i;
                            setLevel();
                            drawFullBoard();
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
    direction: moveDirection.left,
    imageSrc: 'images/ArrowLeft.png'
});

buttons.push({
    colour: "#006600",
    width: 100,
    height: 100,
    top: 40,
    left: 120,
    type: buttonType.move,
    direction: moveDirection.up,
    imageSrc: 'images/ArrowUp.png'
});

buttons.push({
    colour: "#006600",
    width: 100,
    height: 100,
    top: 150,
    left: 120,
    type: buttonType.move,
    direction: moveDirection.down,
    imageSrc: 'images/ArrowDown.png'
});

buttons.push({
    colour: "#006600",
    width: 100,
    height: 100,
    top: 150,
    left: 230,
    type: buttonType.move,
    direction: moveDirection.right,
    imageSrc: 'images/ArrowRight.png'
});

buttons.push({
    colour: "#0095DD",
    width: 100,
    height: 100,
    top: 40,
    left: 400,
    type: buttonType.restart,
    direction: null,
    imageSrc: 'images/Refresh.png'
});

buttons.push({
    colour: "#000099",
    width: 100,
    height: 100,
    top: 150,
    left: 400,
    type: buttonType.giveCode,
    direction: null,
    imageSrc: 'images/Code.png'
});

buttons.forEach(function(element) {
    var img = new Image();
    img.onload = function() {
        ctxControl.drawImage(img, element.left, element.top, element.width, element.height);
    };
    img.src = element.imageSrc;
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
        return [];
    if (destinationFieldValue == fieldValue.empty || destinationFieldValue == fieldValue.goal)
    {
        currentBoard[playerPosition.row][playerPosition.column] &= ~fieldValue.player;
        currentBoard[destination.row][destination.column] |= fieldValue.player;
        return [playerPosition, destination];
    }
    else if ((destinationFieldValue & fieldValue.box) == fieldValue.box)
    {
        var valueBehind = currentBoard[behindDestination.row][behindDestination.column];
        if (valueBehind == fieldValue.wall || (valueBehind & fieldValue.box) == fieldValue.box)
            return [];
        currentBoard[behindDestination.row][behindDestination.column] |= fieldValue.box;
        currentBoard[playerPosition.row][playerPosition.column] &= ~fieldValue.player;
        currentBoard[destination.row][destination.column] = 
            (currentBoard[destination.row][destination.column] | fieldValue.player) & ~fieldValue.box;
        return [playerPosition, destination, behindDestination];
    }
    return [];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function movePlayer(move){
    moved = false;
    playerPosition = getPlayerPosition();
    switch (move) {
        case moveDirection.up:
            fieldsChanged = tryMove(playerPosition,
                new FieldLocation(playerPosition.column, playerPosition.row - 1),
                new FieldLocation(playerPosition.column, playerPosition.row - 2));
            break;
        case moveDirection.down:
            fieldsChanged = tryMove(playerPosition,
                new FieldLocation(playerPosition.column, playerPosition.row + 1),
                new FieldLocation(playerPosition.column, playerPosition.row + 2));
            break;
        case moveDirection.left:
            fieldsChanged = tryMove(playerPosition,
                new FieldLocation(playerPosition.column - 1, playerPosition.row),
                new FieldLocation(playerPosition.column - 2, playerPosition.row));
            break;
        case moveDirection.right:
            fieldsChanged = tryMove(playerPosition,
                new FieldLocation(playerPosition.column + 1, playerPosition.row),
                new FieldLocation(playerPosition.column + 2, playerPosition.row));
            break;
    }
    if (fieldsChanged.length > 0){
        drawChanges(fieldsChanged);
        if (won()){
            await sleep(200);
            currentLevelId++;
            if (currentLevelId >= levels.length){
                alert("That was last level, thank you for playing!");
            }
            else{
                alert("Well done! Code for next level is: " + levels[currentLevelId].code);
                setLevel();
                drawFullBoard();
            }
        }
    }
}

function keyDownHandler(e) {
    direction = null;
    switch (event.key) {
        case "Down": // IE/Edge specific value
        case "ArrowDown":
        case "s":
            direction = moveDirection.down;
            break;
        case "Up": // IE/Edge specific value
        case "ArrowUp":
        case "w":
            direction = moveDirection.up;
            break;
        case "Left": // IE/Edge specific value
        case "ArrowLeft":
        case "a":
            direction = moveDirection.left;
            break;
        case "Right": // IE/Edge specific value
        case "ArrowRight":
        case "d":
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

drawFullBoard();
