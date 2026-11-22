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
  cars: [
    {
      type: "h",
      pos: {
        x: 4,
        y: 2,
      },
      size: 2,
      color: "red",
    },
    {
      type: "v",
      pos: {
        x: 2,
        y: 1,
      },
      size: 3,
      color: "yellow",
    },
  ],
};

const CELL_SIZE = 50;

const game_state = {
  board_size: 0,
  cars: [],
  board: [],
};

const drag_state = {
  start_x: 0,
  start_y: 0,

  original_x: 0,
  original_y: 0,

  hard_stop: false,
  hard_stop_type: "f", // The type of stop if it was going forward or backwards
  hard_stop_x: 0,
  hard_stop_y: 0,

  drag_index: -1,
};

// Creates a board of size nxn
function createBoard() {
  const n = game_state.board_size;
  const parent = document.getElementById("board");
  parent.style.gridTemplateColumns = `repeat(${n}, ${CELL_SIZE}px)`;

  // Delete all childs
  parent.replaceChildren();

  for (i = 0; i < n; i++) {
    game_state.board.push([]);

    for (j = 0; j < n; j++) {
      game_state.board[i].push(0);

      const cell = document.createElement("div");
      cell.classList.add("cell");
      board.appendChild(cell);
    }
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

// function to cap the drag to prevent going off the board or passing over other cars
function cap_drag(drag, orientation, carIndex) {
  let car = game_state.cars[carIndex];
  let board = game_state.board;

  if (drag < 0) {
    drag = 0;
  } else if (drag > (game_state.board_size - car.size) * CELL_SIZE) {
    drag = (game_state.board_size - car.size) * CELL_SIZE;
  }

  if (drag_state.hard_stop) {
    let cell_stop_forward =
      board[car.pos.y][
      Math.floor(drag_state.hard_stop_x / CELL_SIZE) + car.size
      ];
    let cell_stop_backwards =
      board[car.pos.y][Math.floor(drag_state.hard_stop_x / CELL_SIZE) - 1];

    if (drag > drag_state.hard_stop_x && cell_stop_forward == 0) {
      drag_state.hard_stop = false;
    } else if (drag < drag_state.hard_stop_x && cell_stop_backwards == 0) {
      drag_state.hard_stop = false;
    } else {
      drag = drag_state.hard_stop_x;
    }
  }

  let cell_forward = board[car.pos.y][Math.floor(drag / CELL_SIZE) + car.size];
  let cell_backwars = board[car.pos.y][Math.floor(drag / CELL_SIZE)];
  if (
    cell_forward != undefined &&
    cell_forward != 0 &&
    cell_forward != carIndex + 1
  ) {
    if (!drag_state.hard_stop) {
      drag_state.hard_stop = true;
      drag_state.hard_stop_x = Math.floor(drag / CELL_SIZE) * CELL_SIZE;
    }

    drag = drag_state.hard_stop_x;
  } else if (
    cell_backwars != undefined &&
    cell_backwars != 0 &&
    cell_backwars != carIndex + 1
  ) {
    if (!drag_state.hard_stop) {
      drag_state.hard_stop = true;
      drag_state.hard_stop_x = Math.floor(drag / CELL_SIZE + 1) * CELL_SIZE;
    }
  }

  return drag;
}

// Draws the cars on the screen also handles their dragging
function drawCars() {
  const carList = game_state.cars;
  const board = document.getElementById("board");

  for (i = 0; i < carList.length; i++) {
    const carData = carList[i];

    for (s = 0; s < carData.size; s++) {
      if (carData.type == "h") {
        game_state.board[carData.pos.y][carData.pos.x + s] = i + 1;
      } else if (carData.type == "v") {
        game_state.board[carData.pos.y + s][carData.pos.x] = i + 1;
      }
    }

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

    const index_copy = i;

    car.addEventListener("pointerdown", (e, index = index_copy) => {
      drag_state.start_x = e.x;
      drag_state.start_y = e.y;

      drag_state.original_x = car.offsetLeft;
      drag_state.original_y = car.offsetTop;

      drag_state.drag_index = index;

      car.setPointerCapture(e.pointerId);

      e.preventDefault();
    });

    car.addEventListener("pointermove", (e, index = index_copy) => {
      if (index != drag_state.drag_index) return;
      let carData = game_state.cars[index];

      if (carData.type == "h") {
        let drag_x = e.x - drag_state.start_x + drag_state.original_x;
        drag_x = cap_drag(drag_x, "h", index);

        car.style.left = `${drag_x}px`;
      } else if (carData.type == "v") {
        let drag_y = e.y - drag_state.start_y + drag_state.original_y;
        drag_y = cap_drag(drag_y, "v", index);

        car.style.top = `${drag_y}px`;
      }
    });

    car.addEventListener("pointerup", (e, index = index_copy) => {
      drag_state.drag_index = -1;
      let carData = game_state.cars[index];

      if (carData.type == "h") {
        let drag_x = e.x - drag_state.start_x + drag_state.original_x;
        drag_x = cap_drag(drag_x, "h", index);
        let drag_cell_x = Math.round(drag_x / CELL_SIZE);

        for (s = 0; s < carData.size; s++) {
          game_state.board[carData.pos.y][carData.pos.x + s] = 0;
        }

        for (s = 0; s < carData.size; s++) {
          game_state.board[carData.pos.y][drag_cell_x + s] = index + 1;
        }
        car.style.left = `${drag_cell_x * CELL_SIZE}px`;

        carData.pos.x = drag_cell_x;
      } else if (carData.type == "v") {
        let drag_y = e.y - drag_state.start_y + drag_state.original_y;
        drag_y = cap_drag(drag_y, "v", index);
        let drag_cell_y = Math.round(drag_y / CELL_SIZE);

        for (s = 0; s < carData.size; s++) {
          game_state.board[carData.pos.y + s][carData.pos.x] = 0;
        }

        for (s = 0; s < carData.size; s++) {
          game_state.board[drag_cell_y + s][carData.pos.x] = index + 1;
        }
        car.style.top = `${drag_cell_y * CELL_SIZE}px`;

        carData.pos.y = drag_cell_y;
      }
    });

    board.appendChild(car);
  }
}

// Loads a game based on the difficulty passed
function loadGame(difficulty) {
  game_state.board_size = difficulty.size;
  game_state.cars = difficulty.cars;

  createBoard();

  drawCars();
}
