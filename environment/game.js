let modelId;

let EPISODE = 0;  // Current episode number
let SCORE = 0; // Initial score

let HIGH_SCORE = 0; // High score
let NET_EPISODE = 0;
let HIGHEST_LIVING_STREAK = 0; // High score for living streak

let DEATH_COUNT = 0; // Count of deaths
let LIVING_STREAK = 0; // Count of consecutive lives

let GAME_OVER = false; // Game over flag
let GAME_STARTED = false; // Game started flag
let GAME_PAUSED = false; // Game paused flag

let GAME_SPEED_MAX = 500; // Maximum game speed in milliseconds
let GAME_SPEED_MIN = 100; // Minimum game speed in milliseconds

let GAME_SPEED_INCREASE = 50; // Speed increase in milliseconds
let GAME_SPEED_DECREASE = 50; // Speed decrease in milliseconds

let GAME_SPEED_STEP = 50; // Step to increase/decrease game speed

let ENVIRONMENT_SIZE = 20; // Size of the environment (20x20 grid)
let SNAKE_LENGTH = 3; // Default length of the snake
let GAME_SPEED = 5; // Game speed in milliseconds

let PREFERENCES = {
    SOUND: true, // Sound effects enabled
    MUSIC: true, // Background music enabled
    DIFFICULTY: 'normal', // Game difficulty
    ENABLE_WALLS: true, // Enable walls in the environment
    THEME: 'default', // Game theme
}

let gameLoop;

// build the environment
let snake = [];
let environment = [];
let foodSizes = [1, 2, 3]; // Possible sizes of food
let direction = ["up", "down", "left", "right"][Math.floor(Math.random() * 4)];
let turnCells = []; // Cells where the snake should turn

let previousState = null;
let previousAction = null;

// get user fingerprint
const getFingerprint = async () => {
  const fp = await FingerprintJS.load();
  const result = await fp.get();

  return result.visitorId;
};

// loads the q-table and other configurationss
async function loadModel() {
    try {
        modelId = await getFingerprint();

        const res = await fetch(`https://snake-xenzia-ai.vercel.app/api/v1/model/master`, {
            method: "GET",
        });
        const { data: modelData } = await res.json();

        // Load the model data into the AI
        const { data } = modelData;

        model.setHighScore(modelData.highScore);
        model.setHighEpisode(modelData.highEpisode);
        model.setLivingStreak(modelData.livingStreak);
        model.setDeathCount(modelData.deathCount);
        model.setLearningRate(modelData.learningRate);
        model.setFutureFactor(modelData.discountFactor)
        model.loadModel(JSON.parse(data));

        HIGH_SCORE = modelData.highScore;
        NET_EPISODE = modelData.highEpisode;
        HIGHEST_LIVING_STREAK = modelData.livingStreak;

        let highScore = document.getElementById("hi-score");
        let highEpisode = document.getElementById("hi-episode");
        let highLivingStreak = document.getElementById("hi-living-streak");

        console.log("Model loaded with data:", JSON.parse(data));

        highScore.innerHTML = modelData.highScore;
        highEpisode.innerHTML = modelData.highEpisode;
        highLivingStreak.innerHTML = modelData.livingStreak;

        startGame();
    } catch (error) {
        console.log("Error loading model:", error);
        
        console.warn("Error loading model, Creating a new default model");
        startGame();
    }
}

// creates a 2D array to represent the environment
function createEnvironment(size) {
    if(PREFERENCES.ENABLE_WALLS){
        size += 2; // Increase size by 2 to account for walls
    }
    
    let env = [];

    for (let i = 0; i < size; i++) {
        env[i] = [];
        for (let j = 0; j < size; j++) {
            env[i][j] = 0; // 0 represents an empty cell
        }
    }

    if(PREFERENCES.ENABLE_WALLS){
        // make the edges of the environment walls
        for (let i = 0; i < size; i++) {
            env[0][i] = -1; // Top wall
            env[i][0] = -1; // Left wall

            env[size - 1][i] = -1; // Bottom wall
            env[i][size - 1] = -1; // Right wall
        }
    }

    return env;
}

// Function to reset the environment
function resetEnvironment() {
    SCORE = 0; // Reset score
    HIGH_SCORE = Math.max(HIGH_SCORE, SCORE); // Update high score
    environment = createEnvironment(ENVIRONMENT_SIZE);
    snake = createSnake();
    addSnakeToEnvironment(snake, environment);
}

// Function to create food in the environment
function createFood(environment, foodSize = 1) {
    if (foodSize < 1 || foodSize > 3) {
        foodSize = 1; // Default to size 1 if invalid size is provided
    }
    
    let foodX, foodY;

    do {
        foodX = Math.floor(Math.random() * ENVIRONMENT_SIZE);
        foodY = Math.floor(Math.random() * ENVIRONMENT_SIZE);
    } while (environment[foodX][foodY] !== 0); // Ensure food is placed in an empty cell

    // console.log(`Placing food at (${foodX}, ${foodY}) with size ${foodSize}`);
    
    environment[foodX][foodY] = 1; // 1 represents food
    return environment;
}

// Function to create the initial snake
function createSnake() {
    let snake = [];

    for (let i = 0; i < SNAKE_LENGTH; i++) {
        snake.push({ x: i, y: 0, head: i === 0 }); // Initialize snake segments, head is the first segment
    }

    return snake;
}

function addSnakeToEnvironment(snake, environment) {
    const length = SNAKE_LENGTH || 3;
    const directions = ["up", "down", "left", "right"];
    const maxAttempts = 100; // Prevent infinite loops

    let min = PREFERENCES.ENABLE_WALLS ? 1 : 0;
    let max = ENVIRONMENT_SIZE - (PREFERENCES.ENABLE_WALLS ? 2 : 1);

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < maxAttempts) {
        attempts++;

        // Pick a random direction
        const direction = directions[Math.floor(Math.random() * directions.length)];

        // Choose a head position that allows the full body to fit in bounds
        let headX = Math.floor(Math.random() * (max - min + 1)) + min;
        let headY = Math.floor(Math.random() * (max - min + 1)) + min;

        let valid = true;
        let tempSnake = [];

        for (let i = 0; i < length; i++) {
            let x = headX;
            let y = headY;

            if (direction === "up") x += i;
            else if (direction === "down") x -= i;
            else if (direction === "left") y += i;
            else if (direction === "right") y -= i;

            // Check bounds
            if (x < min || x > max || y < min || y > max) {
                valid = false;
                break;
            }

            // Check for collisions with wall or food
            if (environment[x][y] !== 0) {
                valid = false;
                break;
            }

            tempSnake.push({ x, y, head: i === 0 });
        }

        if (valid) {
            snake.length = 0;
            for (const seg of tempSnake) snake.push(seg);
            placed = true;
        }
    }

    if (!placed) {
        console.error("Failed to place snake after multiple attempts.");
    } else {
        // console.log(`Snake placed at direction: ${snake[0].x}, ${snake[0].y}`);
        renderSnake(snake[0].x, snake[0].y);
    }
}

function clearSnake() {
    for (let segment of snake) {
        environment[segment.x][segment.y] = 0;
    }
}

function renderSnake(headX, headY) {
    for (let segment of snake) {
        environment[segment.x][segment.y] = 7;
    }

    // set snake head to 8
    environment[headX][headY] = 8; // 8 represents the snake head
}

function resetGame() {
    resetEnvironment();
    environment = createFood(environment, foodSizes[Math.floor(Math.random() * foodSizes.length)]);
    // console.log("Game reset. Environment and snake reinitialized.");

    // start the game loop again
    if (gameLoop) {
        clearInterval(gameLoop); // Clear the previous game loop if it exists
    }
    gameLoop = setInterval(loop, GAME_SPEED); // Start the game loop again
    GAME_OVER = false; // Reset game over flag
    GAME_PAUSED = false; // Reset game paused flag
    // console.log("Game loop restarted.");
}

function hasEatenFood(snake, environment) {
    let head = snake[0]; // The head of the snake
    return environment[head.x][head.y] === 1; // Check if the head is on food
}

function hasHitWall(snake, environment) {
    const head = snake[0];

    // Check if head is out of bounds
    if (
        head.x < 0 || head.x >= environment.length ||
        head.y < 0 || head.y >= environment[0].length
    ) {
        return true; // Snake went outside the grid
    }

    // Check if the cell is marked as a wall (e.g., -1)
    return environment[head.x][head.y] === -1;
}

function hasHitSelf(snake) {
    let head = snake[0]; // The head of the snake

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true; // The snake has hit itself
        }
    }
    return false; // The snake has not hit itself
}

function addNewTailSegment(snake) {
    // Add a new segment to the tail of the snake
    let tail = snake[snake.length - 1]; // Get the last segment of the snake
    let newSegment = { x: tail.x, y: tail.y, head: false }; // Create a new segment at the tail's position
    snake.push(newSegment); // Add the new segment to the snake
    
    console.log("New tail segment added:", newSegment);
    render(); // Render the updated snake
}

function saveGameState() {
    // Save the current game state to local storage or a file
    const gameState = {
        score: SCORE,
        highScore: HIGH_SCORE,
        environment: environment,
        snake: snake,
        gameOver: GAME_OVER,
        gamePaused: GAME_PAUSED,
        gameSpeed: GAME_SPEED,
    };
    // localStorage.setItem('snakeGameState', JSON.stringify(gameState));
    // console.log("Game state saved:", gameState);
}

function render() {
    // console.log("Rendering game state:", environment);

    const board = document.getElementById('board');
    board.innerHTML = ''; // Clear the board
    
    // render the food
    for (let i = 0; i < environment.length; i++) {
        for (let j = 0; j < environment[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (environment[i][j] === -1) {
                cell.classList.add('wall'); // Add wall class
            } else if (environment[i][j] === 1) {
                cell.classList.add('food'); // Add food class
            } else if (environment[i][j] === 7) {
                cell.classList.add('snake'); // Add snake head class
            } else if (environment[i][j] === 8) {
                cell.classList.add('snake-head'); // Add snake head class
            }
            board.appendChild(cell);
        }
    }

    const score = document.getElementById("score");
    score.innerHTML = SCORE;

    const highScoreElement = document.getElementById("hi-score");
    highScoreElement.innerHTML = HIGH_SCORE; // Update the high score display
}

function loop() {
    if (GAME_OVER || GAME_PAUSED) return;

    EPISODE++; // Increment episode count
    let episodeElement = document.getElementById("episode");

    episodeElement.innerHTML = EPISODE
    let feedback = 0;

    // console.log("Previous action:", previousAction);
    // console.log("Previous state:", previousState);

    // 1️⃣ Apply previous action to move the snake
    predictAndTriggerAction(interpretPrediction(previousAction));
    clearSnake();

    // 2️⃣ Move snake forward and get new head position
    const { headX, headY } = moveSnakeForward(direction);

    if (headX === null || headY === null) {
        // console.log("Snake cannot move, it smashed into a wall.");
        feedback = -1;
        GAME_OVER = true;
        // console.log("Game Over!");

        DEATH_COUNT += 1; // Increment death count
        model.setDeathCount(DEATH_COUNT);
        document.getElementById("death-count").innerHTML = DEATH_COUNT; // Update death count display

        if(LIVING_STREAK > HIGHEST_LIVING_STREAK) {
            HIGHEST_LIVING_STREAK = LIVING_STREAK; // Update highest living streak
            const highLivingStreak = document.getElementById("hi-living-streak");
            
            highLivingStreak.innerHTML = HIGHEST_LIVING_STREAK; // Update the display
            // console.log("New High Living Streak:", HIGHEST_LIVING_STREAK);
        }

        model.setLivingStreak(HIGHEST_LIVING_STREAK); // Update the model
        LIVING_STREAK = 0; // Reset living streak

        resetGame(); // Reset the game
        return;
    }

    // 3️⃣ Check if food is eaten
    if (hasEatenFood(snake, environment)) {
        feedback = +1;
        SCORE += 10;
        // console.log("Food eaten! Score:", SCORE);
        environment = createFood(environment, foodSizes[Math.floor(Math.random() * foodSizes.length)]);
        addNewTailSegment(snake);

        if (SCORE > HIGH_SCORE) {
            // Update high score if current score is higher
            HIGH_SCORE = SCORE;

            const highScoreElement = document.getElementById("hi-score");
            highScoreElement.innerHTML = SCORE; // Update the high score display

            // console.log("New High Score:", HIGH_SCORE);
            model.setHighScore(HIGH_SCORE); // Update the model's high score
        }

        if (EPISODE > NET_EPISODE) {
            NET_EPISODE = EPISODE;

            const highEpisode = document.getElementById("hi-episode");
            highEpisode.innerHTML = EPISODE; // Update the high score display

            model.setHighEpisode(NET_EPISODE);
        }
    }

    // 4️⃣ Check for collisions (wall or self)
    if (hasHitSelf(snake)) {
        feedback = -1;
        GAME_OVER = true;
        // console.log("Game Over!");

        DEATH_COUNT += 1; // Increment death count
        model.setDeathCount(DEATH_COUNT);
        document.getElementById("death-count").innerHTML = DEATH_COUNT; // Update death count display

        if(LIVING_STREAK > HIGHEST_LIVING_STREAK) {
            HIGHEST_LIVING_STREAK = LIVING_STREAK; // Update highest living streak
            const highLivingStreak = document.getElementById("hi-living-streak");
            
            highLivingStreak.innerHTML = HIGHEST_LIVING_STREAK; // Update the display
            
            // console.log("New High Living Streak:", HIGHEST_LIVING_STREAK);
        }

        model.setLivingStreak(HIGHEST_LIVING_STREAK); // Update the model
        LIVING_STREAK = 0; // Reset living streak
        resetGame(); // Reset the game
        // clearInterval(gameLoop);
        return;
    }

    feedback += 0.1 // for surviving the move
    LIVING_STREAK += 1; // Increment living streak

    document.getElementById("living-streak").innerHTML = LIVING_STREAK; // Update living streak display

    // 5️⃣ Update Q-table & get next action
    const predictedAction = model.predict(
        snake,             // new state after previous move
        direction,         // current direction
        feedback,          // reward from previous move
        previousState,     // where the last action started from
        previousAction     // what the last action was
    );

    // 6️⃣ Save current state and action for next update
    previousState = model.encodeState([snake[0].x, snake[0].y, direction]);
    previousAction = predictedAction;

    if (previousAction === null) {
        console.log("First action selected by model:", predictedAction);
    } else {
        console.log("Next action selected by model:", predictedAction);
    }
    
    // 7️⃣ Render current game state
    renderSnake(headX, headY);
    render();
}

function isMovingInDirection(cdirection) {
    if (snake.length === 0) {
        return false; // No snake segments to check
    }

    if(cdirection == direction) {
        return true; // The snake is moving in the specified direction
    }

    return false; // Invalid direction
}

function moveSnakeForward(currentDirection) {
    if (GAME_OVER || GAME_PAUSED) {
        return; // Exit the loop if the game is over or paused
    }

    let head = snake[0]; // The head of the snake
    let newHead = { x: 0, y: 0, rotate: 0, head: true };

    // Move the snake along the path of the turn cells
    if (turnCells.length > 0) {
        // Get the next turn cell
        let nextTurnCell = turnCells[0];

        // Check if the snake is at the turn cell
        if (head.x === nextTurnCell.x && head.y === nextTurnCell.y) {
            // Change the direction of the snake to the turn cell direction
            currentDirection = nextTurnCell.direction;

            // Only remove the turn cell if the tail has reached it
            let tail = snake[snake.length - 1];
            if (tail.x === nextTurnCell.x && tail.y === nextTurnCell.y) {
                turnCells.shift();
                // console.log(`Turn cell at (${nextTurnCell.x}, ${nextTurnCell.y}) removed after tail passed.`);
            } else {
                // console.log(`Snake turned to ${currentDirection} at (${head.x}, ${head.y}), waiting for tail to pass turn cell.`);
            }
        }
    }

    // check if the position of the next position of the head is on the wall
    if (currentDirection === "up") {
        if (environment[head.x - 1][head.y] === -1) {
            // console.log("Snake is on a wall, cannot move.");
            return { headX: null, headY: null }; // Exit if the snake is on a wall
        }

        newHead = { x: head.x - 1, y: head.y, head: true }; // Move up
    }
    else if (currentDirection === "down") {
        if (environment[head.x + 1][head.y] === -1) {
            // console.log("Snake is on a wall, cannot move.");
            return { headX: null, headY: null }; // Exit if the snake is on a wall
        }

        newHead = { x: head.x + 1, y: head.y, head: true }; // Move down
    }
    else if (currentDirection === "left") {
        if (environment[head.x][head.y - 1] === -1) {
            // console.log("Snake is on a wall, cannot move.");
            return { headX: null, headY: null }; // Exit if the snake is on a wall
        }

        newHead = { x: head.x, y: head.y - 1, head: true }; // Move left
    }
    else if (currentDirection === "right") {
        if (environment[head.x][head.y + 1] === -1) {
            // console.log("Snake is on a wall, cannot move.");
            return { headX: null, headY: null }; // Exit if the snake is on a wall
        }
        newHead = { x: head.x, y: head.y + 1, head: true }; // Move right
    }

    snake.unshift(newHead); // Add the new head to the front of the snake
    snake.pop(); // Remove the last segment of the snake

    return { headX: newHead.x, headY: newHead.y }
}

function changeSnakeDirection(changeDirection){
    // Move the snake towards the current direction
    if (GAME_OVER || GAME_PAUSED) {
        return; // Exit the loop if the game is over or paused
    }

    // the snake is constrained to centain directions, e.g snake cannot move up if it is moving down
    // or left if it is moving right, so we need to check the current direction of the snake
    // and move the snake in that direction,  the direction is determined by the head of the snake
    let head = snake[0]; // The head of the snake

    // constrained to move up or down only if the direction is left or right
    if (changeDirection === "up" || changeDirection === "down") {
        if (isMovingInDirection("up") || isMovingInDirection("down")) {
            // do not move up or down if the snake is already moving in that direction
            // console.log("Snake is already moving in this direction, no change made.");
            return; // Exit if the snake is already moving in this direction
        }

        direction = changeDirection; // Update the current direction of the snake
    } else if (changeDirection === "left" || changeDirection === "right") {
        if (isMovingInDirection("left") || isMovingInDirection("right")) {
            // do not move down if the snake is already moving left or right
            // console.log("Snake is already moving in this direction, no change made.");
            return; // Exit if the snake is already moving in this direction
        }
        direction = changeDirection; // Update the current direction of the snake
    }

    // Create a turn cell at the current head position
    turnCells.push({ x: head.x, y: head.y, direction: changeDirection });

    // console.log(`Changing snake direction to ${changeDirection}`);
}

function interpretPrediction(predictionCode) {
    // console.log(`Interpreting prediction code: ${predictionCode}`);
    
    const map = {
        0: 'ArrowUp',
        1: 'ArrowRight',
        2: 'ArrowDown',
        3: 'ArrowLeft',
    };
    return map[predictionCode] || null;
}

function predictAndTriggerAction(predictedKey) {
    if (GAME_OVER) return; // Just like in keydown

    switch (predictedKey) {
        case 'ArrowUp':
            changeSnakeDirection("up");
            break;
        case 'ArrowDown':
            changeSnakeDirection("down");
            break;
        case 'ArrowLeft':
            changeSnakeDirection("left");
            break;
        case 'ArrowRight':
            changeSnakeDirection("right");
            break;
        // case 'r': // Reset
        //     resetGame();
        //     break;
        // case 'p': // Pause
        //     GAME_PAUSED = !GAME_PAUSED;
        //     console.log(GAME_PAUSED ? "Game paused." : "Game resumed.");
        //     console.log("Environment State:", environment);
        //     break;
        default:
            // console.log(`Predicted key: ${predictedKey}`);
            console.log("Invalid predicted action.");
    }
}

function startGame() {
    environment = createEnvironment(ENVIRONMENT_SIZE);
    snake = createSnake();
    environment = createFood(environment, foodSizes[Math.floor(Math.random() * foodSizes.length)]);

    // add the snake to the environment
    addSnakeToEnvironment(snake, environment);

    // Start the game loop
    console.log("Game running...");
    render(); // Initial render of the game state

    // add event listeners for keyboard input for testing purposes
    document.addEventListener('keydown', (event) => {
        if (GAME_OVER) {
            return; // Exit if the game is over or paused
        }

        switch (event.key) {        
            // case 'ArrowUp':
            //     changeSnakeDirection("up");
            //     break;
            // case 'ArrowDown':
            //     changeSnakeDirection("down");
            //     break;
            // case 'ArrowLeft':
            //     changeSnakeDirection("left");
            //     break;
            // case 'ArrowRight':
            //     changeSnakeDirection("right");
            //     break;
            // case 'r': // Reset game
            //     resetGame();
            //     break;
            case 'p': // Pause game
                GAME_PAUSED = !GAME_PAUSED; // Toggle pause state
                console.log(GAME_PAUSED ? "Game paused." : "Game resumed.");
                console.log("Model State:", model.q);

                if(GAME_PAUSED) {
                    const save = confirm("Do you want to save the current game state?");
                    if (save === true) {
                        // should be branch for every other model
                        model.save("master", modelId);
                    }
                }
                
                break;
            default:
                console.log(`Key pressed: ${event.key}`);
                // console.log("Invalid key pressed.");
        }
    });
}

loadModel().then(() => {
    console.log("Model loaded successfully.");
    gameLoop = setInterval(loop, GAME_SPEED); // Run the game loop every second
}).catch((error) => {
    GAME_OVER = true; // Set game over flag if model loading fails
    console.error("Error loading model:", error);
})