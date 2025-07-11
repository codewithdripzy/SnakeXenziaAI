let REWARD = 0; // Reward for eating food

let moveMap = {
    0: 'up',
    1: 'right',
    2: 'down',
    3: 'left'
};

function getSnakePerception(direction) {
    let constraints = [];

    if(direction === 'up') {
        constraints = [0, 1, 3];
    } else if(direction === 'right') {
        constraints = [1, 2, 0];
    } else if(direction === 'down') {
        constraints = [2, 3, 1];
    } else if(direction === 'left') {
        constraints = [3, 0, 2];
    }

    return { direction, movementConstraint: constraints };
}

function getSnakeSnapshot(snake, environment) {
    // crop a 3x3 grid around the snake head
    const snapshot = [];
    const head = snake[0];
    
    for (let y = head.y - 1; y <= head.y + 1; y++) {
        const row = [];
        for (let x = head.x - 1; x <= head.x + 1; x++) {
            if (environment[y] && environment[y][x]) {
                row.push(environment[y][x]);
            } else {
                row.push('wall'); // treat out of bounds as wall
            }
        }
        snapshot.push(row);
    }
    
    return snapshot;
}

let model = {
    highEpisode: 0, // High episode count
    highScore: 0,
    livingStreak: 0, // Count of consecutive lives
    deathCount: 0, // Count of deaths
    learningRate: 0.5,
    discountFactor: 0.9, // Discount factor for future rewards
    q: {
    },
    loadModel: function (model) {
        this.q = model;
    },
    setLearningRate: function(rate) {
        this.learningRate = rate;
    },
    setFutureFactor: function(factor) {
        this.discountFactor = factor;
    },
    setHighScore: function(score) {
        this.highScore = score;
    },
    setHighEpisode: function(episode) {
        this.highEpisode = episode;
    },
    setLivingStreak: function(streak) {
        this.livingStreak = streak;
    },
    setDeathCount: function(count) {
        this.deathCount = count;
    },
    chooseAction: function(state, epsilon, validActions = [0, 1, 2, 3]) {
        if (!this.q[state]) this.q[state] = [0.0, 0.0, 0.0, 0.0];

        if (Math.random() < epsilon) {
            // Explore randomly from valid options
            return validActions[Math.floor(Math.random() * validActions.length)];
        } else {
            // Exploit best valid option
            const qValues = this.q[state];
            let best = validActions[0];
            let max = qValues[best];

            for (let i = 1; i < validActions.length; i++) {
                const a = validActions[i];
                if (qValues[a] > max) {
                    max = qValues[a];
                    best = a;
                }
            }

            return best;
        }
    },
    encodeState: function(items){
        return items.join(",");
    },
    predict: function(snake, direction, feedback, previousState, previousAction) {
        // get the snake head position
        const head = snake[0];

        // Check for the snakes direction and movement constraints i.e the snake cannot move in the opposite direction
        const perception = getSnakePerception(direction);
        const state = this.encodeState([head.x, head.y, perception.direction]);
        // const snapshot = getSnakeSnapshot(snake, environment);

        // check if the state is not in the Q-table
        if (!this.q[state]) this.q[state] = [0.0, 0.0, 0.0, 0.0]; // Initialize Q-values for the state

        // Update Q-table from previous move
        if (previousState !== null && previousAction !== null) {
            // ensure previousState is added to the Q-table
            if (!this.q[previousState]) this.q[previousState] = [0.0, 0.0, 0.0, 0.0];

            // select the previous action
            const oldValue = this.q[previousState][previousAction];

            // check for the best future action in the current state
            const maxFuture = Math.max(...this.q[state]);

            // Q-learning update rule
            this.q[previousState][previousAction] = oldValue + this.learningRate * (
                feedback + this.discountFactor * maxFuture - oldValue
            );
        }

        // use epsilon-greedy action selection to choose the next action in the current state
        const bestMove = this.chooseAction(state, 0.1, perception.movementConstraint);

        // pass in the newState of the snake after making the action
        // const {head} = snake;
        // const newState = encodeState([head.x, head.y, perception.direction]);

        return bestMove;
    },
    saveState: function (modelId) {
        localStorage.setItem("snakeModelId", modelId);
        localStorage.setItem("snakeHighScore", this.highScore);
        localStorage.setItem("snakeNetEpisode", this.highEpisode);
        localStorage.setItem("snakeLearningRate", this.learningRate);
        localStorage.setItem("snakeDiscountFactor", this.discountFactor);
        localStorage.setItem("snakeModel", JSON.stringify(this.q));
    },
    save: function(modelId) {
        fetch(`https://snake-xenzia-ai.vercel.app/api/v1/model/save/${modelId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                modelId: modelId,
                model: {
                    highScore: this.highScore,
                    highEpisode: this.highEpisode,
                    livingStreak: this.livingStreak,
                    deathCount: this.deathCount,
                    learningRate: this.learningRate,
                    discountFactor: this.discountFactor,
                    q: this.q,
                }
            })
        }).then(() => alert("Changes successfully mode to model.")).catch(() => alert("Unable to make changes to model, Try again"));
        // can be, master, local, or branch
        // if (type === true) {
        //     const password = prompt("Enter the master model write password:");

        //     // Save to master
        //     fetch(`https://snake-xenzia-ai.vercel.app/api/v1/model/save/master`, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             "Authorization": `Basic ${btoa(password)}`
        //         },
        //         body: JSON.stringify({
        //             modelId: "snake-genesys",
        //             model: {
        //                 highScore: this.highScore,
        //                 learningRate: this.learningRate,
        //                 discountFactor: this.discountFactor,
        //                 q: this.q,
        //             },
        //         })
        //     }).then(() => alert("Changes successfully mode to master model.")).catch(() => alert("Unable to make changes to master model, Try again"));
        // }else {
        //     // Save to branch
        //     fetch(`https://snake-xenzia-ai.vercel.app/api/v1/model/save/${modelId}`, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({
        //             modelId: modelId,
        //             model: {
        //                 highScore: this.highScore,
        //                 learningRate: this.learningRate,
        //                 discountFactor: this.discountFactor,
        //                 q: this.q,
        //             }
        //         })
        //     }).then(() => alert("Changes successfully mode to model.")).catch(() => alert("Unable to make changes to model, Try again"));

        // }
    }
}