// 1. Gameboard Module (IIFE) - Manages the board state
const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => [...board];

  const placeMark = (index, marker) => {
    if (index < 0 || index > 8 || board[index] !== "") {
      return false;
    }
    board[index] = marker;
    return true;
  };

  const reset = () => {
    board = ["", "", "", "", "", "", "", "", ""];
  };

  return { getBoard, placeMark, reset };
})();

// 2. Player Factory - Creates player objects
const createPlayer = (name, marker) => {
  return { name, marker };
};

// 3. GameController Module (IIFE) - Controls game flow and win/tie rules
const GameController = (() => {
  let players = [];
  let activePlayerIndex = 0;
  let gameOver = false;
  let statusMessage = "";

  const winningCombinations = Array.of(
    Array.of(0, 1, 2),
    Array.of(3, 4, 5),
    Array.of(6, 7, 8),
    Array.of(0, 3, 6),
    Array.of(1, 4, 7),
    Array.of(2, 5, 8),
    Array.of(0, 4, 8),
    Array.of(2, 4, 6)
  );

  const startGame = (player1Name = "Player 1", player2Name = "Player 2") => {
    players = [
      createPlayer(player1Name.trim() || "Player 1", "X"),
      createPlayer(player2Name.trim() || "Player 2", "O")
    ];
    activePlayerIndex = 0;
    gameOver = false;
    Gameboard.reset();
    statusMessage = `${players[activePlayerIndex].name}'s turn (${players[activePlayerIndex].marker})`;
  };

  const getActivePlayer = () => players[activePlayerIndex];

  const switchTurn = () => {
    activePlayerIndex = activePlayerIndex === 0 ? 1 : 0;
  };

  const checkWin = (board, marker) => {
    return winningCombinations.some(combination =>
      combination.every(index => board[index] === marker)
    );
  };

  const checkTie = (board) => {
    return board.every(cell => cell !== "");
  };

  const playRound = (index) => {
    if (gameOver || players.length === 0) return;

    const currentPlayer = getActivePlayer();
    const moveSuccessful = Gameboard.placeMark(index, currentPlayer.marker);

    if (!moveSuccessful) return;

    const currentBoard = Gameboard.getBoard();

    if (checkWin(currentBoard, currentPlayer.marker)) {
      gameOver = true;
      statusMessage = `${currentPlayer.name} wins!`;
      return;
    }

    if (checkTie(currentBoard)) {
      gameOver = true;
      statusMessage = "It's a tie!";
      return;
    }

    switchTurn();
    const nextPlayer = getActivePlayer();
    statusMessage = `${nextPlayer.name}'s turn (${nextPlayer.marker})`;
  };

  const getStatusMessage = () => statusMessage;
  const isGameOver = () => gameOver;

  return { startGame, playRound, getStatusMessage, isGameOver };
})();

// 4. DisplayController Module (IIFE) - Handles DOM rendering and events
const DisplayController = (() => {
  const boardElement = document.getElementById("gameboard");
  const statusElement = document.getElementById("status-message");
  const startBtn = document.getElementById("start-btn");
  const player1Input = document.getElementById("player1-input");
  const player2Input = document.getElementById("player2-input");

  const render = () => {
    const board = Gameboard.getBoard();
    boardElement.innerHTML = "";

    board.forEach((mark, index) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (mark) cell.classList.add(mark.toLowerCase());
      cell.textContent = mark;

      cell.addEventListener("click", () => {
        GameController.playRound(index);
        render();
      });

      boardElement.appendChild(cell);
    });

    statusElement.textContent = GameController.getStatusMessage();
  };

  const init = () => {
    startBtn.addEventListener("click", () => {
      GameController.startGame(player1Input.value, player2Input.value);
      render();
    });

    GameController.startGame();
    render();
  };

  return { init };
})();

DisplayController.init();
