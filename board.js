// A difficulty is stored as a dictionary, which has 3 main parts:
// - size: The size of the board as a NxN board
// - cars: The different cars of the board,
//
// Cars are stored as dictionaries with the following values:
// - type: Orientation of the car h/v
// - pos: The x y position of the top left most part of the car
// - size: The size of the car
// - color: The color of the car
const EASY = {
  size: 7,
  // board: [
  //   [0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, -1],
  //   [0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0],
  // ],
  cars: [
    {
      type: "h",
      pos: {
        x: 1,
        y: 2,
      },
      size: 2,
      color: "red",
    },
    {
      type: "v",
      pos: {
        x: 4,
        y: 1,
      },
      size: 3,
      color: "yellow",
    },
  ],
};

const CELL_SIZE = 50;

board_state = [];

// Creates a board of size nxn
function createBoard(n) {
  const parent = document.getElementById("board");
  parent.style.gridTemplateColumns = `repeat(${n}, ${CELL_SIZE}px)`;

  // Delete all childs
  parent.replaceChildren();

  for (i = 0; i < n * n; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    board.appendChild(cell);
  }
}

// Updates the game state on the client.
// Draws all the cars and handles dragging
function updateGameState() {
  const board = document.getElementById("board");

  for (i = 0; i < board_state.length; i++) {
    for (j = 0; j < board_state[i].length; j++) {
      if (board_state[i][j] != 0) {
        const cell = board.childNodes[i].childNodes[j];
      }
    }
  }
}

function drawCars(carList) {
  const board = document.getElementById("board");

  for (i = 0; i < carList.length; i++) {
    const carData = carList[i];

    const car = document.createElement("div");
    car.classList.add("car");
    if (carData.type == "h") {
      car.style.width = `${CELL_SIZE * carData.size}px`;
      car.style.height = `${CELL_SIZE}px`;
    } else if (carData.type == "v") {
      car.style.width = `${CELL_SIZE}px`;
      car.style.height = `${CELL_SIZE * carData.size}px`;
    }
    car.style.backgroundColor = carData.color;
    car.style.top = `${carData.pos.y * CELL_SIZE}px`;
    car.style.left = `${carData.pos.x * CELL_SIZE}px`;
    board.appendChild(car);
  }
}

// Loads a game based on the difficulty passed
function loadGame(difficulty) {
  createBoard(difficulty.size);
  board_state = difficulty.board;

  drawCars(difficulty.cars);

  updateGameState();
}
