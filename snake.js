
//board
var blockSize = 25;
var rows = 20;
var cols = 20;
var board;
var context; 

//snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];

//food
var foodX;
var foodY;

var score = 0;
var highScore = 0;
var gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); //used for drawing on the board

    placeFood();
    document.addEventListener("keydown", changeDirection);
    // update();
    setInterval(update, 1000/10); //100 milliseconds
}

function update() {
    if (gameOver) {
        if (score > highScore) {
            highScore = score;
            document.getElementById("highScoreDisplay").innerHTML = highScore;
        }
        score = 0;
        document.getElementById("scoreDisplay").innerHTML = score;    
        return;
    }

    // Draw checkerboard pattern
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Alternate colors based on position
            if ((row + col) % 2 === 0) {
                context.fillStyle = "white"; // White
            } else {
                context.fillStyle = "#AFE1AF"; // Green
            }
            context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            context.strokeStyle = "black"; // Choose your border color
            context.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
    }

    context.fillStyle="red";
    context.fillRect(foodX, foodY, blockSize, blockSize);

    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
        score++;
        document.getElementById("scoreDisplay").innerHTML = score;
        if (score > highScore){
            highScore = score;
            document.getElementById("highScoreDisplay").innerHTML = highScore;
        }
    }

    for (let i = snakeBody.length-1; i > 0; i--) {
        snakeBody[i] = snakeBody[i-1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    context.fillStyle="blue";
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    //game over conditions
    if (snakeX < 0 || snakeX > cols*blockSize || snakeY < 0 || snakeY > rows*blockSize) {
        gameOver = true;
        showGameOver();
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOver = true;
            showGameOver();
        }
    }

    context.strokeStyle = "grey"; // Border color
    context.lineWidth = 1; // Border thickness
    context.strokeRect(0, 0, board.width, board.height);
}

function changeDirection(e) {
    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    }
    else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }
    else if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    }
    else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}


function placeFood() {
    let validPosition = false;
    
    while (!validPosition) {
        foodX = Math.floor(Math.random() * cols) * blockSize;
        foodY = Math.floor(Math.random() * rows) * blockSize;
        
        validPosition = true;
        
        // Check if food spawns on snake head
        if (foodX === snakeX && foodY === snakeY) {
            validPosition = false;
            continue;
        }
        
        // Check if food spawns on snake body
        for (let segment of snakeBody) {
            if (foodX === segment[0] && foodY === segment[1]) {
                validPosition = false;
                break;
            }
        }
    }
}

function showGameOver() {
    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").textContent = score;
}

function restartGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    gameOver = false;
    score = 0;
    snakeBody = [];
    velocityX = 0;
    velocityY = 0;
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    document.getElementById("scoreDisplay").innerHTML = score;
    placeFood();
}