const io = require('socket.io');

let gameState = {
  positions: [],
  currentPlayer: 0,
  message: '',
  diceValue: 1,
  players: [],
  triggerQuestion: false,
  question: {},
  triggerSpinWheel: false,
};

const questions = [
  { question: "sininen is blue", answer: true },
  { question: "talo is home.", answer: false },
  { question: "Is this correct: Me olen suomalainen", answer: false },
  { question: "sata is a thousand.", answer: false },
  { question: "kissa is a cat.", answer: true },
  { question: "Is this correct: Viikonloppu on maanantai ja tiistai.", answer: false },
  { question: "peruna is potato", answer: true },
  { question: "Is this correct: mummu is mom", answer: false },
  { question: "Preesens on mennyt aikamuoto", answer: false },
  { question: "Laukkusi on sama kuin sinun laukku", answer: true },
  { question: "suu is mouth.", answer: true },
  { question: "orava is bear.", answer: false },
  { question: "Joulu on marraskuussa.", answer: false },
  { question: "Euro on 27 Vietnamin Dongia.", answer: true },
  { question: "Bussi on nopeampi kuin juna.", answer: false },
  { question: "Tämä kurssi on paras!.", answer: true },
  { question: "Does the answer match the question: Mikä päivä tänään on? Nyt on keskipäivä.", answer: false },
  { question: "Genetiivi vastaa kysymyksiin kenen, keiden ja minkä.", answer: true },
  { question: "Mennään on passiivi muoto.", answer: true },
  { question: "peili is mirror", answer: true },
  { question: "Minä on puhekielessä mä", answer: true },
  { question: "Suomessa tervehtiessä kätellään", answer: true },
  { question: "Onnellinen is happy", answer: true },
  { question: "How are you? is Mitä kuuluu?", answer: true },
  { question: "Kissa, koira ja kukka ovat eläimiä", answer: false },
  { question: "Congratulations is Onnea!", answer: true },
  { question: "Opiskelen suomea", answer: true },
  { question: "Sinä olet kaunis", answer: true },
];

const initializeGame = (io) => {
  io.on('connection', (socket) => {

    socket.on('join-game', (user) => {
      console.log(`A player joined dice game: ${socket.id}`);
      if (!gameState.players.some(p => p._id === user._id)) {
        gameState.players.push(user);
        gameState.positions.push(0);
      }
      gameState.message = 'Hello, welcome to online dice game ^^ !';
      io.emit('game-state', gameState);
    });

    socket.on('roll-dice', () => {
      if (gameState.triggerQuestion) {
        gameState.message = 'You must answer the question to move up!';
        gameState.positions[gameState.currentPlayer] = Math.max(0, gameState.positions[gameState.currentPlayer] - gameState.diceValue);
        gameState.triggerQuestion = false
        io.emit('game-state', gameState);
        return;
      }

      const roll = Math.floor(Math.random() * 6) + 1;
      gameState.diceValue = roll;
      gameState.message = `Player ${gameState.currentPlayer + 1} rolled a ${roll}`;

      // Check if all players have won
      if (gameState.positions.every(position => position > 65)) {
        gameState.message = 'All players have won!';
        io.emit('game-state', gameState);
        return;
      }

      // Check if the current player has already won
      if (gameState.positions[gameState.currentPlayer] > 65) {
        gameState.message = `Player ${gameState.currentPlayer + 1} has already won and cannot roll.`;
        io.emit('game-state', gameState);
        return;
      }

      const nextPosition = gameState.positions[gameState.currentPlayer] + roll;

      if (nextPosition > 65) {
        gameState.positions[gameState.currentPlayer] = 66;
        gameState.message = `Player ${gameState.currentPlayer + 1} wins!`;
      } else {
        gameState.positions[gameState.currentPlayer] = nextPosition;

        const spinWheelCells = [20, 46];
        if (spinWheelCells.includes(nextPosition)) {
          gameState.triggerSpinWheel = true;
          io.emit('game-state', gameState);
          return;
        }

        const questionCells = Array.from({ length: 65 }, (_, i) => i + 1);
        if (questionCells.includes(nextPosition)) {
          gameState.triggerQuestion = true;
          gameState.question = questions[Math.floor(Math.random() * questions.length)];
          io.emit('game-state', gameState);
          return;
        }
      }

      // Update current player
      let allPlayersWon = true;
      let startPlayer = gameState.currentPlayer;
      do {
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        if (gameState.positions[gameState.currentPlayer] <= 65) {
          allPlayersWon = false;
        }
        // If we circle back to the starting player, stop the loop
        if (gameState.currentPlayer === startPlayer) {
          break;
        }
      } while (gameState.positions[gameState.currentPlayer] > 65);

      if (allPlayersWon) {
        gameState.message = 'All players have won!';
      }

      io.emit('game-state', gameState);
    });

    socket.on('answer-question', (answer) => {
      if (gameState.triggerQuestion) {
        const correct = gameState.question.answer === answer;
        gameState.message = correct ? `Player ${gameState.currentPlayer + 1} answered correctly! :D` : `Player ${gameState.currentPlayer + 1} answered wrong :(`;
        gameState.triggerQuestion = false;

        if (!correct) {
          gameState.positions[gameState.currentPlayer] = Math.max(0, gameState.positions[gameState.currentPlayer] - gameState.diceValue); // Move back if incorrect
        }
      }

      // Update current player
      let allPlayersWon = true;
      let startPlayer = gameState.currentPlayer;
      do {
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        if (gameState.positions[gameState.currentPlayer] <= 65) {
          allPlayersWon = false;
        }
        // If we circle back to the starting player, stop the loop
        if (gameState.currentPlayer === startPlayer) {
          break;
        }
      } while (gameState.positions[gameState.currentPlayer] > 65);

      if (allPlayersWon) {
        gameState.message = 'All players have won!';
      }

      io.emit('game-state', gameState);
    });

    socket.on('spin-result', (spinValue) => {
      gameState.positions[gameState.currentPlayer] += spinValue;
      gameState.message = `Player ${gameState.currentPlayer + 1} got bonus ${spinValue} steps`;
      gameState.triggerSpinWheel = false;

      // Update current player
      let allPlayersWon = true;
      let startPlayer = gameState.currentPlayer;
      do {
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        if (gameState.positions[gameState.currentPlayer] <= 65) {
          allPlayersWon = false;
        }
        // If we circle back to the starting player, stop the loop
        if (gameState.currentPlayer === startPlayer) {
          break;
        }
      } while (gameState.positions[gameState.currentPlayer] > 65);

      if (allPlayersWon) {
        gameState.message = 'All players have won!';
      }

      io.emit('game-state', gameState);
    });

    socket.on('reset-game', () => {
      gameState = {
        positions: [],
        currentPlayer: 0,
        message: '',
        diceValue: 1,
        players: [],
        triggerQuestion: false,
        question: {},
        triggerSpinWheel: false,
      };
      io.emit('game-state', gameState);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Remove the player from the game
      const playerIndex = gameState.players.findIndex(p => p._id === socket.id);
      if (playerIndex !== -1) {
        gameState.players.splice(playerIndex, 1);
        gameState.positions.splice(playerIndex, 1);
      }

      if (gameState.players.length === 0) {
        gameState = {
          positions: [],
          currentPlayer: 0,
          message: '',
          diceValue: 1,
          players: [],
          triggerQuestion: false,
          question: {},
          triggerSpinWheel: false,
        };
      }

      io.emit('game-state', gameState);
    });
  });
};

module.exports = { initializeGame };
