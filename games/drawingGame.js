const io = require('socket.io');

let drawGameState = {
    players: [],
    message: '',
    currentPlayer: 0,
    currentDrawer: null, // New state to keep track of the current drawing player
    currentQuestion: '',
    drawings: [],
    scores: {},
    showDrawing: false,  // show player's drawing or not
    currentDrawing: null,
    isWon: false,
    answeredPlayers: [],
};

const words = [
    "kissa",
    "koira",
    "talo",
    "puu",
    "auto",
    "aiti",
    "isa",
    "aurinko",
    "koulu",
    "sairaala",
    "omena",
    "peruna",
    "banani",
    "juna",
    "Bussi",
    "lippu",
    "kahvila",
    "pyörä",
    "laiva",
    "poliisi",
    "sade",
    "lumi",
    "pilvi",
    "jääkääppi",
    "kirija",
    "pöytä",
    "kynä",
    "ikkuna",
    "olvi",
    "ananas",
    "räntä",
    "metsa",
    "puisto",
    "kessa",
    "joulu",
    "talvi",
    "talvi",
    "lintu",
    "tuoli",
    "kukka",
    "mökki",
    "opettaja",
    "opiskelja",
    "vessa",
    "lusikka",
    "kulho",
];

const initializeDrawingGame = (io) => {
    io.on('connection', (socket) => {

        socket.on('join-drawing-game', (user) => {
            console.log(`A player joined drawing game: ${socket.id}`);
            if (!drawGameState.players.some(p => p._id === user._id)) {
                drawGameState.players.push(user);
                drawGameState.scores[user._id] = 0;
                drawGameState.scores[user._id] = 0; // Initialize score for the user (how to access player's score)
                console.log("new player initial score = ", drawGameState.scores[user._id])
                drawGameState.message = 'Hello, welcome to online draw game ^^ !';
            }

            // Start the game if there are at least 2 players and game hasn't started yet
            if (drawGameState.players.length > 1 && !drawGameState.currentDrawer) {
                startGame();
            }

            io.emit('draw-game-state', drawGameState);
        });

        socket.on('submit-drawing', (drawing) => {
            drawGameState.drawings.push(drawing);
            drawGameState.currentDrawing = drawing;
            drawGameState.showDrawing = true;
            console.log(`player just drawed named, ${drawGameState.players[drawGameState.currentPlayer].name}`)
            drawGameState.message = `Here is what player ${drawGameState.players[drawGameState.currentPlayer].name} drawed, time to guess...!`;
            io.emit('draw-game-state', drawGameState);
        });


        // this should handle for only player who just send answer
        socket.on('submit-guess', ({ guess, userId }) => { // get the guess + user._id here
            const guessingPlayerIndex = drawGameState.players.findIndex(player => player._id === userId);

            // get the guessing player
            const player = drawGameState.players[guessingPlayerIndex];

            // check if player already answered
            if (drawGameState.answeredPlayers.includes(userId) && player) {
                drawGameState.message = `Player ${player.name} can not answer again !`;
                io.emit('draw-game-state', drawGameState);
                return;
            } else {
                // Store the user ID of the player who has submitted the guess
                drawGameState.answeredPlayers.push(userId);
            }



            if (guessingPlayerIndex === -1) {
                // console.error(`Player with ID ${userId} not found.`);
                return;
            }
            // console.log("Current index of this guessing player: ", guessingPlayerIndex);


            const currentWord = drawGameState.currentQuestion.toLowerCase();
            if (guess.toLowerCase() === currentWord) {
                // console.log("player answering named", player.name);
                drawGameState.scores[player._id] += 1; // Add 1 points for a correct guess => access the score
                
                // check if this player won or not (after this bonus point)
                if (drawGameState.scores[player._id] > 3) {
                    drawGameState.isWon = true; 
                    drawGameState.message = `${player.name} won !! Congrat ^^". Reset to play again.`;
                    io.emit('draw-game-state', drawGameState);
                    return;
                }
                // console.log("Current player's total score after bonus", drawGameState.scores[player._id]);
                drawGameState.message = `${player.name} guessed correctly :) `;
                io.emit('draw-game-state', drawGameState);
            } else {
                // console.log("play who just answered wrong named ", (drawGameState.currentPlayer + 1) % drawGameState.players.length)
                drawGameState.message = `${player.name} guessed incorrectly :C`;
                // console.log("current player's total score after minus", drawGameState.scores[player._id]);
                io.emit('draw-game-state', drawGameState);
            }


            // Logic for the next  player/drawer (only do when all players had answered)
            if (drawGameState.answeredPlayers.length === drawGameState.players.length - 1) {
                if(guess.toLowerCase() === currentWord){
                drawGameState.message = `${player.name} guessed correctly :) ! The word was "${drawGameState.currentQuestion}", ${drawGameState.players[(drawGameState.currentPlayer + 1) % drawGameState.players.length].name}'s turn to draw ^^! `; // add turn to draw => this this last player
                } else{
                drawGameState.message = `${player.name} guessed incorrectly :c The word was "${drawGameState.currentQuestion}, ${drawGameState.players[(drawGameState.currentPlayer + 1) % drawGameState.players.length].name}'s turn to draw ^^!".`; //
                }
                drawGameState.currentPlayer = (drawGameState.currentPlayer + 1) % drawGameState.players.length;
                drawGameState.currentDrawer = drawGameState.players[drawGameState.currentPlayer];
                drawGameState.currentQuestion = words[Math.floor(Math.random() * words.length)];
                drawGameState.showDrawing = false;
                drawGameState.currentDrawing = null;
                drawGameState.answeredPlayers = [];
                console.log(`drawGameState after player ${drawGameState.currentPlayer} answer`, drawGameState);
                io.emit('draw-game-state', drawGameState);
            }

        });

        const startGame = () => {
            drawGameState.currentPlayer = 0; // start by player 0 turn to draw
            drawGameState.currentDrawer = drawGameState.players[0]; // Initial drawer (player)
            console.log("current drawing player: ", drawGameState.players[0].name);
            console.log("current drawing player initial score =  ", drawGameState.scores[0]); // starter point for first player
            drawGameState.message = `Alright we got enough players, player ${drawGameState.players[0].name}'s turn to draw!`; // how to access the whole playing person
            drawGameState.currentQuestion = words[Math.floor(Math.random() * words.length)];
            drawGameState.showDrawing = false;
            io.emit('draw-game-state', drawGameState);
        };

        const nextTurn = () => {
            // Logic for the next player
            drawGameState.currentPlayer = (drawGameState.currentPlayer + 1) % drawGameState.players.length;
            drawGameState.currentDrawer = drawGameState.players[drawGameState.currentPlayer];
            drawGameState.currentQuestion = words[Math.floor(Math.random() * words.length)];
            drawGameState.showDrawing = false;
            drawGameState.currentDrawing = null;
            drawGameState.answeredPlayers = [];
            io.emit('draw-game-state', drawGameState);
        };

        const resetGame = () => {
            // Re-join player to the game
            const playersToRejoin = drawGameState.players.slice(); // Copy the current players

            drawGameState = {
                players: [],
                message: '',
                currentPlayer: 0,
                currentDrawer: null, // New state to keep track of the current drawing player
                currentQuestion: '',
                drawings: [],
                scores: {},
                showDrawing: false,  // show player's drawing or not
                currentDrawing: null,
                isWon: false,
                answeredPlayers:[],
            };
            io.emit('force-rejoin', playersToRejoin); // Emit force-rejoin event with current players
            // io.emit('draw-game-state', drawGameState);
        };

        socket.on('reset-draw-game', () => {
            resetGame();
            io.emit('draw-game-state', drawGameState);
        });


        socket.on('disconnect', () => {
            drawGameState.players = drawGameState.players.filter(p => p._id !== socket.id);
            delete drawGameState.scores[socket.id];
            if (drawGameState.players.length === 0) {
                resetGame();
            } else if (drawGameState.currentDrawer && drawGameState.currentDrawer._id === socket.id) {
                nextTurn(); // Ensure the game continues correctly if the drawer disconnects
            }
            io.emit('draw-game-state', drawGameState);
        });
    });
};

module.exports = { initializeDrawingGame };




