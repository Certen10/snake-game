
//board
var blockSize = 30;
var rows = 20;
var cols = 20;
var board;
var context; 

//snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;
var snakeHeadImage = new Image();
snakeHeadImage.src = 'snakehead.png';

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];

//food
var foodX;
var foodY;
var foodImages = [];
var currentFoodImage;

var score = 0;
var highScore = 0;
var gameOver = false;

function loadFoodImages() {
    const fruits = ['apple.png', 'banana.png', 'orange.png', 'strawberry.png', 'cherry.png'];
    fruits.forEach(fruit => {
        let img = new Image();
        img.src = fruit;
        foodImages.push(img);
    });
}

window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); //used for drawing on the board

    loadFoodImages();
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

    context.drawImage(currentFoodImage, foodX, foodY, blockSize, blockSize);



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

    
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    
    // Draw snake body with connected rectangular segments
    for (let i = snakeBody.length-1; i >= 0; i--) {
        let segment = snakeBody[i];
        let nextSegment = i > 0 ? snakeBody[i-1] : [snakeX, snakeY];
        
        // Calculate angle between segments
        let angle = Math.atan2(
            nextSegment[1] - segment[1],
            nextSegment[0] - segment[0]
        );
        
        // Calculate decreasing size with minimum
        let segmentWidth = Math.max(blockSize - (i * 0.5), blockSize * 0.6);
        let segmentHeight = Math.max((blockSize/1.5) - (i * 0.3), (blockSize/1.5) * 0.6);
        
        // Calculate distance to next segment
        let distance = Math.sqrt(
            Math.pow(nextSegment[0] - segment[0], 2) + 
            Math.pow(nextSegment[1] - segment[1], 2)
        );
        
        // Adjust position to close gaps
        let adjustedX = segment[0];
        let adjustedY = segment[1];
        
        if (distance > segmentWidth) {
            let moveX = (distance - segmentWidth) * Math.cos(angle);
            let moveY = (distance - segmentWidth) * Math.sin(angle);
            adjustedX += moveX;
            adjustedY += moveY;
        }
        
        context.save();
        context.translate(adjustedX + blockSize/2, adjustedY + blockSize/2);
        context.rotate(angle);
        
        context.fillStyle = "blue";
        context.fillRect(-segmentWidth/2, -segmentHeight/2, segmentWidth, segmentHeight);
        
        context.restore();
    }

    // Draw snake head with rotation
    context.save();
    context.translate(snakeX + blockSize/2, snakeY + blockSize/2);
    context.rotate(Math.atan2(velocityY, velocityX));
    context.drawImage(snakeHeadImage, -blockSize/2, -blockSize/2, blockSize, blockSize);
    context.restore();

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
        
        if (foodX === snakeX && foodY === snakeY) {
            validPosition = false;
            continue;
        }
        
        for (let segment of snakeBody) {
            if (foodX === segment[0] && foodY === segment[1]) {
                validPosition = false;
                break;
            }
        }
    }
    // Pick random fruit from array
    currentFoodImage = foodImages[Math.floor(Math.random() * foodImages.length)];
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

