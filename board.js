// A difficulty is stored as a dictionary, which has 3 main parts:
// - size: The size of the board as a NxN board
// - exit: The coordinates of the exit
// - cars: The different cars of the board,
//
// The exit should be a coordinate pair inside the board,
// if the first car manages to reach said coordinates it completes the level
//
// Cars are stored as dictionaries with the following values:
// - type: Orientation of the car h/v
// - pos: The x y position of the top left most part of the car
// - size: The size of the car
// - color: The color of the car
//
// The first car is the one that needs to reach the exit.
const EASY = {
  size: 6,
  exit: {
    x: 5,
    y: 2,
  },
  cars: [
    {
      type: "h",
      pos: {
        x: 0,
        y: 2,
      },
      size: 2,
      color: "red",
    },
    {
      type: "v",
      pos: {
        x: 3,
        y: 0,
      },
      size: 3,
      color: "yellow",
    },
    {
      type: "h",
      pos: {
        x: 3,
        y: 3,
      },
      size: 3,
      color: "orange",
    },
    {
      type: "v",
      pos: {
        x: 0,
        y: 3,
      },
      size: 3,
      color: "green",
    },
  ],
};
const CAR_SCALE_OFFSET = 4;

const game_state = {
  board_size: 0,
  cars: [],
  board: [],
  exit: {
    x: 0,
    y: 0,
  },
  moves: 0,
};

const drag_state = {
  start_x: 0,
  start_y: 0,

  original_x: 0,
  original_y: 0,

  hard_stop: false,
  hard_stop_x: 0,
  hard_stop_y: 0,

  drag_index: -1,
};
var cellSize = 50;

function updateMoves() {
  try {
    const moveText = document.getElementById("moveCount");
    moveText.innerText = `Moves: ${game_state.moves}`;
  } catch { }
}

// Creates a board of size nxn
function createBoard(boardID) {
  const n = game_state.board_size;
  const board = document.getElementById(boardID);

  // Delete all childs
  board.replaceChildren();

  for (let i = 0; i < n; i++) {
    game_state.board.push([]);

    const row = document.createElement("div");
    row.classList.add("row");
    board.appendChild(row);

    for (let j = 0; j < n; j++) {
      game_state.board[i].push(0);

      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;

      row.appendChild(cell);
    }
  }

  board.style.borderWidth = `${cellSize}px`;

  // Create the exit

  const exit = document.createElement("div");
  exit.id = "exit";
  exit.style.width = `${cellSize}px`;
  exit.style.height = `${cellSize}px`;

  if (game_state.cars[0].type == "h") {
    exit.style.left = `${game_state.exit.x * cellSize + cellSize + 1}px`;
    exit.style.top = `${game_state.exit.y * cellSize}px`;
  } else if (game_state.cars[0].type == "v") {
    exit.style.top = `${game_state.exit.y * cellSize + cellSize}px`;
    exit.style.left = `${game_state.exit.x * cellSize}px`;
  }

  board.appendChild(exit);
}

// Checks if the player has won
function check_for_victory() {
  let car = game_state.cars[0];

  let inFinish = false;
  for (let s = 0; s < car.size; s++) {
    if (car.pos.x + s == game_state.exit.x) {
      inFinish = true;
      break;
    }
  }
  if (!inFinish) return;

  inFinish = false;
  for (let s = 0; s < car.size; s++) {
    if (car.pos.y + s == game_state.exit.y) {
      inFinish = true;
      break;
    }
  }
  if (!inFinish) return;
  alert("You have WON !!!");
}

// function to cap the drag to prevent going off the board or passing over other cars
function cap_drag(drag, orientation, carIndex) {
  let car = game_state.cars[carIndex];
  let board = game_state.board;

  if (drag < 0) {
    drag = 0;
  } else if (drag > (game_state.board_size - car.size) * cellSize) {
    drag = (game_state.board_size - car.size) * cellSize;
  }

  if (orientation == "h") {
    // This handles going through another car
    let target_cell_x = Math.floor(drag / cellSize);
    let end_target_cell_x = Math.ceil(drag / cellSize) + car.size;

    const step = car.pos.x <= target_cell_x ? 1 : -1;

    let blockedCell = -1;
    for (let i = car.pos.x; i != target_cell_x + step; i += step) {
      if (board[car.pos.y][i] != 0 && board[car.pos.y][i] != carIndex + 1) {
        blockedCell = i;
        if (car.pos.x < target_cell_x) {
          target_cell_x -= car.size;
        }
        break;
      }
    }

    if (blockedCell != -1) {
      if (car.pos.x > target_cell_x) {
        drag = blockedCell * cellSize + cellSize;
      } else {
        drag = blockedCell * cellSize - car.size * cellSize;
      }
    }
    // This handles ending up on top of another car
    for (let i = target_cell_x; i < end_target_cell_x; i++) {
      if (board[car.pos.y][i] != 0 && board[car.pos.y][i] != carIndex + 1) {
        blockedCell = i;
        break;
      }
    }
    if (blockedCell != -1) {
      if (car.pos.x > target_cell_x) {
        drag = blockedCell * cellSize + cellSize;
      } else {
        drag = blockedCell * cellSize - car.size * cellSize;
      }
    }
  } else if (orientation == "v") {
    // This handles going through another car
    let target_cell_y = Math.floor(drag / cellSize);
    let end_target_cell_y = Math.ceil(drag / cellSize) + car.size;

    const step = car.pos.y <= target_cell_y ? 1 : -1;

    let blockedCell = -1;
    for (let i = car.pos.y; i != target_cell_y + step; i += step) {
      if (board[i][car.pos.x] != 0 && board[i][car.pos.x] != carIndex + 1) {
        blockedCell = i;
        if (car.pos.y < target_cell_y) {
          target_cell_y -= car.size;
        }
        break;
      }
    }

    if (blockedCell != -1) {
      if (car.pos.y > target_cell_y) {
        drag = blockedCell * cellSize + cellSize;
      } else {
        drag = blockedCell * cellSize - car.size * cellSize;
      }
    }
    // This handles ending up on top of another car
    for (let i = target_cell_y; i < end_target_cell_y; i++) {
      if (board[i][car.pos.x] != 0 && board[i][car.pos.x] != carIndex + 1) {
        blockedCell = i;
        break;
      }
    }
    if (blockedCell != -1) {
      if (car.pos.y > target_cell_y) {
        drag = blockedCell * cellSize + cellSize;
      } else {
        drag = blockedCell * cellSize - car.size * cellSize;
      }
    }
  }

  return drag;
}

// Draws the cars on the screen also handles their dragging
// canDrag can choose if you want the cars to drag around or not, useful for main menu
function createCars(boardID, canDrag) {
  const carList = game_state.cars;
  const board = document.getElementById(boardID);

  for (let i = 0; i < carList.length; i++) {
    const carData = carList[i];

    for (let s = 0; s < carData.size; s++) {
      if (carData.type == "h") {
        game_state.board[carData.pos.y][carData.pos.x + s] = i + 1;
      } else if (carData.type == "v") {
        game_state.board[carData.pos.y + s][carData.pos.x] = i + 1;
      }
    }

    const car = document.createElement("div");
    car.classList.add("car");

    if (carData.type == "h") {
      car.style.width = `${cellSize * carData.size - CAR_SCALE_OFFSET}px`;
      car.style.height = `${cellSize - CAR_SCALE_OFFSET}px`;
    } else if (carData.type == "v") {
      car.style.width = `${cellSize - CAR_SCALE_OFFSET}px`;
      car.style.height = `${cellSize * carData.size - CAR_SCALE_OFFSET}px`;
    }

    car.style.backgroundColor = carData.color;
    car.style.top = `${carData.pos.y * cellSize + CAR_SCALE_OFFSET / 2}px`;
    car.style.left = `${carData.pos.x * cellSize + CAR_SCALE_OFFSET / 2}px`;

    const index_copy = i;

    if (!canDrag) {
      board.appendChild(car);
      continue;
    }

    car.addEventListener("pointerdown", (e, index = index_copy) => {
      drag_state.start_x = e.x;
      drag_state.start_y = e.y;

      drag_state.original_x = car.offsetLeft;
      drag_state.original_y = car.offsetTop;

      drag_state.drag_index = index;

      car.setPointerCapture(e.pointerId);

      game_state.moves += 1;

      updateMoves();

      e.preventDefault();
    });

    car.addEventListener("pointermove", (e, index = index_copy) => {
      if (index != drag_state.drag_index) return;
      let carData = game_state.cars[index];

      if (carData.type == "h") {
        let drag_x = e.x - drag_state.start_x + drag_state.original_x;
        drag_x = cap_drag(drag_x, "h", index);

        car.style.left = `${drag_x + CAR_SCALE_OFFSET / 2}px`;
      } else if (carData.type == "v") {
        let drag_y = e.y - drag_state.start_y + drag_state.original_y;
        drag_y = cap_drag(drag_y, "v", index);

        car.style.top = `${drag_y + CAR_SCALE_OFFSET / 2}px`;
      }
    });

    car.addEventListener("pointerup", (e, index = index_copy) => {
      drag_state.drag_index = -1;
      let carData = game_state.cars[index];

      if (carData.type == "h") {
        let drag_x = e.x - drag_state.start_x + drag_state.original_x;
        drag_x = cap_drag(drag_x, "h", index);
        let drag_cell_x = Math.round(drag_x / cellSize);

        for (let s = 0; s < carData.size; s++) {
          game_state.board[carData.pos.y][carData.pos.x + s] = 0;
        }

        for (let s = 0; s < carData.size; s++) {
          game_state.board[carData.pos.y][drag_cell_x + s] = index + 1;
        }
        car.style.left = `${drag_cell_x * cellSize + CAR_SCALE_OFFSET / 2}px`;

        carData.pos.x = drag_cell_x;
      } else if (carData.type == "v") {
        let drag_y = e.y - drag_state.start_y + drag_state.original_y;
        drag_y = cap_drag(drag_y, "v", index);
        let drag_cell_y = Math.round(drag_y / cellSize);

        for (let s = 0; s < carData.size; s++) {
          game_state.board[carData.pos.y + s][carData.pos.x] = 0;
        }

        for (let s = 0; s < carData.size; s++) {
          game_state.board[drag_cell_y + s][carData.pos.x] = index + 1;
        }
        car.style.top = `${drag_cell_y * cellSize + CAR_SCALE_OFFSET / 2}px`;

        carData.pos.y = drag_cell_y;
      }

      drag_state.hard_stop = false;
      check_for_victory();
    });

    board.appendChild(car);
  }
}

// Resets the game state to 0
function resetGameState(difficulty) {
  game_state.board_size = difficulty.size;
  game_state.cars = structuredClone(difficulty.cars);
  game_state.exit = difficulty.exit;
  game_state.board = [];
  game_state.moves = 0;

  updateMoves();
}

// Loads a game based on the difficulty passed
function loadGame(
  difficulty,
  _cellSize = cellSize,
  canDrag = true,
  boardID = "board",
) {
  resetGameState(difficulty);

  cellSize = _cellSize;

  createBoard(boardID);

  createCars(boardID, canDrag);
}
