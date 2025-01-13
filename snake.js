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
snakeHeadImage.src = 'bluesnakehead.png';

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];
var snakeColor = "blue";  // Default color

//food
var foodX;
var foodY;
var foodImages = [];
var currentFoodImage;
var imagesLoaded = 0;
var totalImages = 6; // 5 fruits + 1 snake head
var foodType = 'normal';
var foodPoints = 1;
var specialFoodImages = {
    golden: new Image(),
    rainbow: new Image(),
    toxic: new Image(),
    bonus: new Image()
};

var score = 0;
var highScore = 0;
var gameInterval;
var gameOver = false;
var gameStarted = false;

var gameSpeed = 100; // Default speed (normal)
var obstacles = [];  // Array to store obstacle positions

var colorLight = "white";
var colorDark = "#AFE1AF";

var settingsSelected = {
    size: false,
    boardColors: false,
    snakeColor: false
};

var currentGameMode = 'classic';
var timeLeft = 10;
var timer;
var timerDisplay;

function setGameMode(mode, button) {
    // Update button styling
    document.querySelectorAll('.mode-selection button').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
    
    // Reset high score for new mode
    highScore = 0;
    document.getElementById("highScoreDisplay").innerHTML = highScore;
    
    // Clear obstacles when switching modes
    obstacles = [];
    
    // Set new game mode
    currentGameMode = mode;
    settingsSelected.gameMode = true;
    checkAllSettings();
}

function setGameSpeed(speed, button) {
    document.querySelectorAll('.speed-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
    
    switch(speed) {
        case 'slow':
            gameSpeed = 150; // Slower update interval
            break;
        case 'normal':
            gameSpeed = 100; // Default speed
            break;
        case 'fast':
            gameSpeed = 50;  // Faster update interval
            break;
    }
}


function setColors(light, dark, button) {
    document.querySelectorAll('.color-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
    document.querySelectorAll('.color-buttons button').forEach(btn => {
        btn.classList.remove('selected-color');
    });
    button.classList.add('selected-color');
    colorLight = light;
    colorDark = dark;
    settingsSelected.boardColors = true;
    checkAllSettings();
}

function setSnakeColor(color, button) {
    document.querySelectorAll('.snake-colors button').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
    snakeColor = color;
    
    snakeHeadImage = new Image();
    snakeHeadImage.onload = function() {
        totalImages = 6;
        imagesLoaded = totalImages;
    };
    snakeHeadImage.src = color + "snakehead.png";
    
    settingsSelected.snakeColor = true;
    checkAllSettings();
}

function loadFoodImages() {
    const fruits = ['apple.png', 'banana.png', 'orange.png', 'strawberry.png', 'cherry.png'];
    fruits.forEach(fruit => {
        let img = new Image();
        img.onload = function() {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                currentFoodImage = foodImages[0];
            }
        };
        img.src = fruit;
        foodImages.push(img);
    });
}

function loadSpecialFoodImages() {
    specialFoodImages.golden.src = 'goldenapple.png';
    specialFoodImages.rainbow.src = 'rainbowfruit.png';
    specialFoodImages.toxic.src = 'toxicfruit.png';
    specialFoodImages.bonus.src = 'bonusfruit.png';
}

snakeHeadImage.onload = function() {
    imagesLoaded++;
};

window.onload = function() {
    board = document.getElementById("board");
    board.style.display = 'none';
    context = board.getContext("2d");
    loadFoodImages();
    loadSpecialFoodImages();
    document.addEventListener("keydown", changeDirection);
}

function setBoardSize(size, button) {
    document.querySelectorAll('.size-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
    document.querySelectorAll('.size-buttons button').forEach(btn => {
        btn.classList.remove('selected-color');
    });
    button.classList.add('selected-color');
    rows = size;
    cols = size;
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    settingsSelected.size = true;
    checkAllSettings();
}

function checkAllSettings() {
    if (settingsSelected.size && settingsSelected.boardColors && settingsSelected.snakeColor) {
        document.getElementById('startButtonContainer').style.display = 'block';
    }
}

function startTheGame() {
    if (imagesLoaded !== totalImages) {
        console.log("Waiting for images to load...");
        setTimeout(startTheGame, 100);
        return;
    }

    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('board').style.display = 'block';
    board = document.getElementById('board');
    context = board.getContext("2d");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    
    gameOver = false;
    gameStarted = false;
    score = 0;
    snakeBody = [];
    velocityX = 0;
    velocityY = 0;
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    
    if (currentGameMode === 'special') {
        startSpecialFoodMode();
    } else {
        placeFood();
    }
    update();
    gameInterval = setInterval(update, gameSpeed);

    switch(currentGameMode) {
        case 'classic':
            startClassicMode();
            placeFood();
            break;
        case 'special':
            startSpecialFoodMode();
            placeSpecialFood();
            break;
        case 'obstacle':
            startObstacleMode();
            break;
        case 'timeattack':
            startTimeAttackMode();
            break;
    }

}

function startClassicMode() {
    // Your existing game logic
}


function startSpecialFoodMode() {
    loadSpecialFoodImages();
    placeSpecialFood();
}

function startObstacleMode() {
    obstacles = [];  // Clear any existing obstacles
    placeFood();
}

function placeObstacle() {
    let validPosition = false;
    let obstacleX, obstacleY;
    
    while (!validPosition) {
        obstacleX = Math.floor(Math.random() * cols) * blockSize;
        obstacleY = Math.floor(Math.random() * rows) * blockSize;
        
        validPosition = true;
        
        // Check collision with snake
        if (obstacleX === snakeX && obstacleY === snakeY) {
            validPosition = false;
            continue;
        }
        
        // Check collision with food
        if (obstacleX === foodX && obstacleY === foodY) {
            validPosition = false;
            continue;
        }
        
        // Check collision with snake body
        for (let segment of snakeBody) {
            if (obstacleX === segment[0] && obstacleY === segment[1]) {
                validPosition = false;
                break;
            }
        }
        
        // Check collision with other obstacles
        for (let obstacle of obstacles) {
            if (obstacleX === obstacle[0] && obstacleY === obstacle[1]) {
                validPosition = false;
                break;
            }
        }
    }
    
    obstacles.push([obstacleX, obstacleY]);
}

function placeSpecialFood() {
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
    
    let random = Math.random();
    if (random < 0.6) { // 60% normal food
        foodType = 'normal';
        currentFoodImage = foodImages[Math.floor(Math.random() * foodImages.length)];
        foodPoints = 1;
    } else if (random < 0.75) { // 15% golden apple
        foodType = 'golden';
        currentFoodImage = specialFoodImages.golden;
        foodPoints = 3;
    } else if (random < 0.85) { // 10% rainbow fruit
        foodType = 'rainbow';
        currentFoodImage = specialFoodImages.rainbow;
        foodPoints = 1;
    } else if (random < 0.95) { // 10% bonus fruit
        foodType = 'bonus';
        currentFoodImage = specialFoodImages.bonus;
        foodPoints = 5;
    } else { // 5% toxic fruit
        foodType = 'toxic';
        currentFoodImage = specialFoodImages.toxic;
        foodPoints = -2;
    }
}

function handleSpecialFoodCollision() {
    if (snakeX == foodX && snakeY == foodY) {
        switch(foodType) {
            case 'golden':
                score += 3;
                break;
            case 'rainbow':
                score += 1;
                let colors = ['red', 'blue', 'green', 'purple', 'orange'];
                let newColor = colors[Math.floor(Math.random() * colors.length)];
                snakeColor = newColor;
                snakeHeadImage.src = newColor + 'snakehead.png';
                break;
            case 'toxic':
                score -= 2;
                if (snakeBody.length > 0) {
                    snakeBody.pop();
                }
                break;
            case 'bonus':
                score += 5;
                break;
            default:
                score += 1;
        }
        snakeBody.push([foodX, foodY]);
        placeSpecialFood(); // This places the next special food
        document.getElementById("scoreDisplay").innerHTML = score;
    }
}

const timerStyle = `
    position: fixed;
    top: 30%;
    font-size: 200px;
    color: red;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    z-index: 800;
    animation: flash 1s infinite;
`;

// Add this CSS for the flashing animation
const flashingAnimation = document.createElement('style');
flashingAnimation.textContent = `
    @keyframes flash {
        50% { opacity: 1; }
        75% { opacity: 0.3; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(flashingAnimation);

function createTimerDisplay() {
    // Left timer
    timerDisplay = document.createElement('div');
    timerDisplay.id = 'timerDisplayLeft';
    timerDisplay.style.cssText = timerStyle + 'left: 300px;';
    
    // Right timer
    const timerDisplayRight = document.createElement('div');
    timerDisplayRight.id = 'timerDisplayRight';
    timerDisplayRight.style.cssText = timerStyle + 'right: 300px;';
    
    document.body.appendChild(timerDisplay);
    document.body.appendChild(timerDisplayRight);
}

function startTimeAttackMode() {
    // Clear existing timers and displays
    if (timer) {
        clearInterval(timer);
    }
    if (document.getElementById('timerDisplayLeft')) {
        document.getElementById('timerDisplayLeft').remove();
    }
    if (document.getElementById('timerDisplayRight')) {
        document.getElementById('timerDisplayRight').remove();
    }
    
    // Create fresh timer display and start countdown
    createTimerDisplay();
    timeLeft = 10;
    updateTimer();
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            gameOver = true;
            document.getElementById('gameOverScreen').style.display = 'block';
            document.getElementById('finalScore').textContent = score;
            clearInterval(timer);
            clearInterval(gameInterval);
        }
    }, 1000);
}


function updateTimer() {
    if (timerDisplay) {
        document.getElementById('timerDisplayLeft').textContent = timeLeft;
        document.getElementById('timerDisplayRight').textContent = timeLeft;
    }
}


function update() {
    if (gameOver) {
        gameoverHandler();
        if (score > highScore) {
            highScore = score;
            document.getElementById("highScoreDisplay").innerHTML = highScore;
        }
        score = 0;   
        return;
    }

    // Draw checkerboard pattern
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Alternate colors based on position
            if ((row + col) % 2 === 0) {
                context.fillStyle = colorLight; // White
            } else {
                context.fillStyle = colorDark; // Green
            }
            context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            context.strokeStyle = "black"; // Choose your border color
            context.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
    }

    // Draw obstacles
    context.fillStyle = "black";
    for (let obstacle of obstacles) {
        context.fillRect(obstacle[0], obstacle[1], blockSize, blockSize);
    }
    
    // Add obstacle collision check
    for (let obstacle of obstacles) {
        if (snakeX === obstacle[0] && snakeY === obstacle[1]) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                document.getElementById("highScoreDisplay").innerHTML = highScore;
            }
            showGameOver();
        }
    }

    context.drawImage(currentFoodImage, foodX, foodY, blockSize, blockSize);


    if (snakeX == foodX && snakeY == foodY) {
        if (currentGameMode === 'special') {
            handleSpecialFoodCollision();
        } else {
            score += 1;
            snakeBody.push([foodX, foodY]);
            if (currentGameMode === 'timeattack') {
                timeLeft = 10;
                updateTimer();
            } else if (currentGameMode === 'obstacle') {
                placeObstacle();  // Place obstacle before new food
            }
            placeFood();
        }
        document.getElementById("scoreDisplay").innerHTML = score;
    }



    for (let i = snakeBody.length-1; i > 0; i--) {
        snakeBody[i] = snakeBody[i-1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    if (snakeBody.length > 0) {
        // Draw connection from head to first body segment
        context.beginPath();
        context.moveTo(snakeX + blockSize/2, snakeY + blockSize/2);
        context.lineTo(snakeBody[0][0] + blockSize/2, snakeBody[0][1] + blockSize/2);
        context.lineWidth = blockSize/1.5;  // Start with full width
        context.strokeStyle = snakeColor;
        context.lineCap = 'round';
        context.stroke();
    }
    
    for (let i = 0; i < snakeBody.length - 1; i++) {
        let current = snakeBody[i];
        let next = snakeBody[i + 1];
        
        let midX = (current[0] + next[0]) / 2;
        let midY = (current[1] + next[1]) / 2;
        
        context.beginPath();
        context.moveTo(current[0] + blockSize/2, current[1] + blockSize/2);
        context.quadraticCurveTo(
            midX + blockSize/2, 
            midY + blockSize/2,
            next[0] + blockSize/2, 
            next[1] + blockSize/2
        );
        
        // Calculate decreasing width with minimum size
            let sizeRange = (blockSize/1.5) - (blockSize/3);
            let segmentWidth = (blockSize/1.5) - ((i / snakeBody.length) * sizeRange);
        
        context.lineWidth = segmentWidth;
        context.strokeStyle = snakeColor;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.stroke();

    }

    // Draw snake head with rotation
    context.save();
    context.translate(snakeX + blockSize/2, snakeY + blockSize/2);
    context.rotate(Math.atan2(velocityY, velocityX));
    context.drawImage(snakeHeadImage, -blockSize/2, -blockSize/2, blockSize, blockSize);
    context.restore();

    document.getElementById("scoreDisplay").innerHTML = score;

    //game over conditions
    if (snakeX < 0 || snakeX >= cols*blockSize || snakeY < 0 || snakeY >= rows*blockSize) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            document.getElementById("highScoreDisplay").innerHTML = highScore;
        }
        showGameOver();
    }
    
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                document.getElementById("highScoreDisplay").innerHTML = highScore;
            }
            showGameOver();
        }
    }

    context.strokeStyle = "grey"; // Border color
    context.lineWidth = 1; // Border thickness
    context.strokeRect(0, 0, board.width, board.height);
}

function gameOverHandler() {
    if (currentGameMode === 'timeattack') {
        clearInterval(timer);
        if (timerDisplay) {
            timerDisplay.remove();
        }
    }
    clearInterval(gameInterval);
    
    // Show game over screen
    document.getElementById('board').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = score;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
        document.getElementById('highScoreDisplay').textContent = highScore;
    }

}

function changeDirection(e) {
    if (!gameStarted) {
        gameStarted = true;
    }
    
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
        
        // Check collision with snake head
        if (foodX === snakeX && foodY === snakeY) {
            validPosition = false;
            continue;
        }
        
        // Check collision with snake body
        for (let segment of snakeBody) {
            if (foodX === segment[0] && foodY === segment[1]) {
                validPosition = false;
                break;
            }
        }

        // Check collision with obstacles in obstacle mode
        if (currentGameMode === 'obstacle') {
            for (let obstacle of obstacles) {
                if (foodX === obstacle[0] && foodY === obstacle[1]) {
                    validPosition = false;
                    break;
                }
            }
        }
    }
    currentFoodImage = foodImages[Math.floor(Math.random() * foodImages.length)];
}

function showGameOver() {
    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").textContent = score;
}

function showSettings() {
    // Clear all intervals
    if (timer) {
        clearInterval(timer);
    }
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Remove timer display
    if (timerDisplay) {
        timerDisplay.remove();
    }
    if (document.getElementById('timerDisplayRight')) {
        document.getElementById('timerDisplayRight').remove();
    }
    
    // Reset game state
    gameOver = false;
    score = 0;
    snakeBody = [];
    velocityX = 0;
    velocityY = 0;
    
    // Show correct screens
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'block';
    document.getElementById('startButtonContainer').style.display = 'block';
    
    // Keep settings selected
    settingsSelected.size = true;
    settingsSelected.boardColors = true;
    settingsSelected.snakeColor = true;
    settingsSelected.gameMode = true;
    document.querySelector(`.mode-selection button[onclick="setGameMode('${currentGameMode}', this)"]`).classList.add('selected');
}

function startGame() {
    gameOver = false;
    score = 0;
    snakeBody = [];
    velocityX = 0;  // Add this line to make snake move right at start
    velocityY = 0;
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    placeFood();
}

function restartGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    
    // Clear existing interval before setting a new one
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Reset game state
    gameOver = false;
    score = 0;
    snakeBody = [];
    velocityX = 0;
    velocityY = 0;
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    obstacles = [];
    document.getElementById("scoreDisplay").innerHTML = score;
    
    // Start game with consistent speed
    if (currentGameMode === 'timeattack') {
        startTimeAttackMode();
    } else {
        placeFood();
    }
    
    // Set single game interval with current gameSpeed
    gameInterval = setInterval(update, gameSpeed);
}

