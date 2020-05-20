import React, { useState, useRef, useEffect } from "react";

const BOARD_SIZE = 20;
const CELL_SIZE = 25;
const BORDER = 1;
const BASE_SPEED = 1000;

interface ISquare {
  x: number;
  y: number;
}

enum IDirection {
  Up,
  Down,
  Right,
  Left,
}

function getDirectionFromKeyCode(keyCode: number): IDirection | null {
  switch (keyCode) {
    case 40:
      return IDirection.Down;
    case 38:
      return IDirection.Up;
    case 37:
      return IDirection.Left;
    case 39:
      return IDirection.Right;
    default:
      return null;
  }
}

function random<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function flatten<T>(arrays: T[][]) {
  const flat: T[] = [];
  return flat.concat.apply([], arrays);
}

const equal = (sq1: ISquare, sq2: ISquare) =>
  sq1.x === sq2.x && sq1.y === sq2.y;

function includesSquare(snake: ISquare[], square: ISquare) {
  return snake.some((el) => equal(el, square));
}

function last<T>(arr: T[]) {
  return arr[arr.length - 1];
}

const nextSquare = (
  snake: ISquare[],
  direction: IDirection,
  boardSize: number
): ISquare => {
  const lastCell = last(snake);
  switch (direction) {
    case IDirection.Down:
      return {
        x: lastCell.x + 1 === boardSize ? 0 : lastCell.x + 1,
        y: lastCell.y,
      };
    case IDirection.Up:
      return {
        x: lastCell.x - 1 < 0 ? boardSize - 1 : lastCell.x - 1,
        y: lastCell.y,
      };
    case IDirection.Left:
      return {
        x: lastCell.x,
        y: lastCell.y - 1 < 0 ? boardSize - 1 : lastCell.y - 1,
      };
    case IDirection.Right:
      return {
        x: lastCell.x,
        y: lastCell.y + 1 === boardSize ? 0 : lastCell.y + 1,
      };
  }
};

function Square({ occupied, treat }: { occupied: boolean; treat: boolean }) {
  return (
    <div
      style={{
        height: CELL_SIZE,
        width: CELL_SIZE,
        border: `${BORDER}px solid black`,
        backgroundColor: occupied ? "black" : treat ? "red" : "white",
      }}
    />
  );
}

function App() {
  const [direction, setDirection] = useState<IDirection>(IDirection.Right);
  const [snake, setSnake] = useState<ISquare[]>([{ x: 0, y: 5 }]);
  const [treat, setTreat] = useState<ISquare>({ x: 0, y: 10 });
  const [speedDivider, setSpeedDivider] = useState(1);
  const [isDead, setIsDead] = useState<boolean>(false);
  const boardRef = useRef<ISquare[][] | null>(null);

  const reset = () => {
    setSnake([
      {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      },
    ]);
    setIsDead(false);
    setTreat({
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    });
  };

  useEffect(() => {
    window.onkeydown = (event: any) => {
      const newDirection = getDirectionFromKeyCode(event.keyCode);
      if (newDirection !== null) {
        setDirection(newDirection);
      }
    };
  }, []);

  useEffect(() => {
    const speed = BASE_SPEED / speedDivider;
    setTimeout(move, speed);
  }, [snake]); // eslint-disable-line react-hooks/exhaustive-deps

  if (boardRef.current === null) {
    boardRef.current = Array(BOARD_SIZE)
      .fill(null)
      .map((_, row) =>
        Array(BOARD_SIZE)
          .fill(null)
          .map((_, col) => ({ x: row, y: col }))
      );
  }

  const getNewTreat = () => {
    const full = flatten(boardRef.current!);
    const withoutSnake = full.filter((el) => !includesSquare(snake, el));
    const location = random(withoutSnake);
    return location;
  };

  const move = () => {
    const square = nextSquare(snake, direction, BOARD_SIZE);
    if (includesSquare(snake, square)) {
      setIsDead(true);
    } else {
      const isCapture = equal(square, treat);
      if (isCapture) {
        setTreat(getNewTreat);
      }
      const newSnake = isCapture
        ? [...snake, square]
        : [...snake.slice(1), square];
      setSnake(newSnake);
    }
  };

  return (
    <div>
      <div
        style={{
          width: (CELL_SIZE + BORDER) * BOARD_SIZE,
          display: "grid",
          gridTemplateColumns: "repeat(20, 1fr)",
        }}
      >
        {boardRef.current.map((row) =>
          row.map((sq) => (
            <Square
              key={sq.x + sq.y}
              occupied={includesSquare(snake, sq)}
              treat={equal(sq, treat)}
            />
          ))
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 200,
          alignItems: "center",
        }}
      >
        <button
          style={{ height: CELL_SIZE, width: 200 }}
          onClick={() => setSpeedDivider((s) => s + 1)}
        >
          Faster
        </button>
        {speedDivider}
        <button
          style={{ height: CELL_SIZE, width: 200 }}
          onClick={() => setSpeedDivider((s) => s - 1)}
        >
          Slower
        </button>
      </div>
      {isDead && (
        <div>
          You Died, <button onClick={reset}>reset</button>
        </div>
      )}
    </div>
  );
}

export default App;
