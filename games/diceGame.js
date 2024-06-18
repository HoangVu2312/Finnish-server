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
  { question: "To be is olla", answer: true },
  { question: "Is this correct: Minä olemme kotoisin Vietnamista", answer: false },
  { question: "koulu is school", answer: true },
  { question: "matikka is math", answer: true },
  { question: "opettaja is student", answer: false },
  { question: "ruokala is restaurant", answer: false },
  { question: "edessä is behind", answer: false },
  { question: "Suomessa on neljä vuodenaikaa", answer: true },
  { question: "Suomi sijaitsee Aasiassa", answer: false },
  { question: "Ikkuna ja ovi ovat sama asia", answer: false },
  { question: "Vietnam on kaunis maa", answer: true },
  { question: "Hanoi on lähellä Ho Chi Minhiä", answer: false },
  { question: "Vietnaim pääkaupunki on Ho Chi Minh", answer: false },
  { question: "Pasta on peräisin Vietnamista", answer: false },
  { question: "Suomi on Vietnamin naapurimaa", answer: false },
  { question: "Suomessa puhutaan ruotsia ja suomea", answer: true },
  { question: "Vietnamissa autot ovat halpoja", answer: false },
  { question: "Vietnamin liikenne on vaarallinen", answer: true },
  { question: "Taylor Swift on kotoisin Ruotsista", answer: false },
  { question: "Suomen presidentti on Elon Musk", answer: false },
  { question: "Suomi on aina ollut itsenäinen maa", answer: false },
  { question: "Vietnamilaiset ovat ahkeria", answer: true },
  { question: "Joulupukki on kotoisin Suomesta", answer: true },
  { question: "Suomessa voi usein törmätä hirveen", answer: true },
  { question: "Thich Minh Tue munkki on vaikutusvaltainen", answer: true },
  { question: "Kierrättäminen on hyväksi luonnolle", answer: true },
  { question: "Suomen hätänumero on 112", answer: true },
  { question: "Tupakoiminen on hyväksi terveydelle", answer: false },
  { question: "Aurinko on pienempi kuin kuu", answer: false },
  { question: "Intia on Euroopassa", answer: false },
  { question: "BTS yhtye on kotoisin Japanista", answer: false },
  { question: "Tấm Cám on kuuluisa Vietnamilainen tarina", answer: true },
  { question: "Suomen pääkaupunki on Turku", answer: false },
  { question: "Kirja, kynä ja imuri ovat koulutarvikkeita", answer: false },
  { question: "Kesällä sataa lunta", answer: false },
  { question: "Puut tuottavat happea", answer: true },
  { question: "Veden kiehumispiste on 100 astetta", answer: true },
  { question: "numero 160 on satakuusitoista", answer: false },
  { question: "SON TUNG-MTP on kuuluisa ympäri maailmaa", answer: true },
  { question: "Ilmansuunnat ovat pohjoinen, etelä, itä ja vasen", answer: false },
  { question: "Kylmiä ruokia säilytetään kirjahyllyssä", answer: false },
  { question: "Ennen musiikkia kuunneltiin radiosta", answer: true },
  { question: "Aamulla mennään nukkumaan", answer: false },
  { question: "Aurinko nousee etelästä", answer: false },
  { question: "Suomen kielen opiskelu on vaikeaa mutta hauskaa", answer: true },
  { question: "Talo on suurempi kuin auto", answer: true },
  { question: "Suomessa pelataan paljon jääkiekkoa", answer: true },
  { question: "Aamulla syödään illallista", answer: false },
  { question: "Nuha on flunssan oire", answer: true },
  { question: "Kiina on suurempi kuin Vietnam", answer: true },
  { question: "Jää on liukasta", answer: true },
  { question: "Vietnamilaisilla on usein vaaleat hiukset", answer: false },
  { question: "Covid pandemia alkoi vuonna 2017", answer: false },
  { question: "Afrikka on Australian vieressä", answer: false },
  { question: "Kissat ovat lintuja", answer: false },
  { question: "Ihminen on nisäkäs", answer: true },
  { question: "Pannulla kokataan ja kirjalla kirjoitetaan", answer: false },
  { question: "Keittiössä peseydytään", answer: false },
  { question: "Is this correct: Sinä puhun suomea", answer: false },
  { question: "Miksi means what", answer: false },
  { question: "Is this correct: Olet sinä kotona?", answer: false },
  { question: "Suomessa aurinko ei laske kesäisin", answer: true },
  { question: "Is this correct: Minulla ei ole auton", answer: false },
  { question: "Is this correct: Hän soittaa kitaraa", answer: true },
  { question: "Is this correct: Te menette Suomeen", answer: true },
  { question: "Suuri is the opposite of pieni", answer: true },
  { question: "Teetä syödään", answer: false },
  { question: "Leipää juodaan", answer: false },
  { question: "Is this past tense: Minä kävelin kotiin.", answer: true },
  { question: "Is this present tense: Minä olin koulussa.", answer: false },
  { question: "Is this correct: Minun täytyy opiskelen", answer: false },
  { question: "Is this correct: He menevät ravintolaan syömään", answer: true },
  { question: "Onko lause perfektissä: En ole vielä syönyt", answer: true },
  { question: "Onko lause imperfektissä: Olin ollut sairas", answer: false },
  { question: "Onko lause pluskvanperfektissä: Söin leipää", answer: false },
  { question: "Viikossa on kahdeksan päivää", answer: false },
  { question: "Vuodessa on 256 päivää", answer: false },
  { question: "Tết Nguyên Đán on Vietnamin suurin juhla", answer: true },
  { question: "Joulu on Suomen suurin juhla", answer: true },
  { question: "Sushi on peräisin Koreasta", answer: false },
  { question: "Pho on kuuluisin Vietnamilainen ruoka", answer: true },
  { question: "Pohjoismaihin kuuluu Suomi, Ruotsi ja Ranska", answer: false },
  { question: "Aasia on suurin maanosa", answer: true },
  { question: "Passiivi tarkoittaa ettei lauseessa ole tekijää", answer: true },
  { question: "Is this correct: Doraemon olla kuuluisa anime", answer: false },
  { question: "Pelata, soittaa ja lukea ovat harrastamisen verbejä", answer: true },
  { question: "Is this correct: Minä olen kotoisin Vietnamissa", answer: false },
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

      // Re-join player to the game
      const playersToRejoin = gameState.players.slice(); // Copy the current players

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
      io.emit('force-rejoin', playersToRejoin); // Emit force-rejoin event with current players
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
