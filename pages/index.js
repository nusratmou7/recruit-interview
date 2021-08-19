import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Snake.module.css";

const Config = {
  height: 25,
  width: 25,
  cellSize: 32,
};

const CellType = {
  Snake: "snake",
  Food: "food",
  Empty: "empty",
};

const Direction = {
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Top: { x: 0, y: -1 },
  Bottom: { x: 0, y: 1 },
};

const Cell = ({ x, y, type }) => {
  const getStyles = () => {
    switch (type) {
      case CellType.Snake:
        return {
          backgroundColor: "yellowgreen",
          borderRadius: 8,
          padding: 2,
        };

      case CellType.Food:
        return {
          backgroundColor: "darkorange",
          borderRadius: 20,
          width: 32,
          height: 32,
        };

      default:
        return {};
    }
  };
  return (
    <div
      className={styles.cellContainer}
      style={{
        left: x * Config.cellSize,
        top: y * Config.cellSize,
        width: Config.cellSize,
        height: Config.cellSize,
      }}
    >
      <div className={styles.cell} style={getStyles()}></div>
    </div>
  );
};

const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
});

const Snake = () => {
  const getDefaultSnake = () => [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  const grid = useRef();

  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  let [direction, setDirection] = useState(Direction.Right);

  const [food, setFood] = useState([{ x: 4, y: 10 }]);
  const [score, setScore] = useState(0);
  const [scoreUp, setScoreUp]=useState(false);
  const [gameOver, setGameOver]=useState(false);
  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];
        //console.log(direction);
        let newHead = { x: head.x + direction.x, y: head.y + direction.y };
        if(isSnake(newHead)){
          setGameOver((gameOver)=>true)
          return snake;
        }

        if(newHead.x>24) newHead.x=0;
        if(newHead.x<0)  newHead.x=24;
        if(newHead.y>24) newHead.y=0;
        if(newHead.y<0)  newHead.y=24;
        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];

        // remove tail
        if(!scoreUp){
          newSnake.pop();
        }
        setScoreUp((scoreUp)=>false)
        return newSnake;
      });
    };

    runSingleStep();
    let timer = setInterval(runSingleStep, 500);

    return () => clearInterval(timer);
  }, [direction, food,scoreUp]);


  useEffect(()=>{
    if(gameOver){ 
      setSnake((snake)=>snake= getDefaultSnake())
      setFood((food)=>food=[{x:4,y:10}])
      setScore((score)=>0)
      setGameOver((gameOver)=>false)
    }
    
  },[gameOver])
  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];
    if (isFood(head)) {
      setScore((score) => {
        return score + 1;
      });
      setScoreUp((scoreUp)=>true)
      let newFood = getRandomCell();
      while (isSnake(newFood)) {
        newFood = getRandomCell();
      }
      let collideFoodPosition = collideFood(head);
      food.push(newFood)
      newFood=food.filter((point)=>{
        let abc = (point.x!=collideFoodPosition[0].x && point.y!=collideFoodPosition[0].y)
        return abc
      })
      console.log(newFood);
      setFood((food)=>{
        return food=newFood
      });
    }
  }, [snake]);

  useEffect(() => {
    const handleNavigation = (event) => {

      switch (event.key) {
        case "ArrowUp":
          setDirection(Direction.Top);
          break;

        case "ArrowDown":
          setDirection(Direction.Bottom);
          break;

        case "ArrowLeft":
          setDirection(Direction.Left);
          break;

        case "ArrowRight":
          setDirection(Direction.Right);
          break;
      }
    };
    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isFood = ({ x, y }) =>
      food.find((position)=>position.x === x && position.y === y);
  const collideFood = ({ x, y }) =>
     food.filter((position)=>position.x === x && position.y === y);
  const isSnake = ({ x, y }) =>
     snake.find((position) => position.x === x && position.y === y);

  const cells = [];
  for (let x = 0; x < Config.width; x++) {
    for (let y = 0; y < Config.height; y++) {
      let type = CellType.Empty;
      if (isFood({ x, y })) {
        type = CellType.Food;
      } else if (isSnake({ x, y })) {
        type = CellType.Snake;
      }
      cells.push(<Cell key={`${x}-${y}`} x={x} y={y} type={type} />);
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{ width: Config.width * Config.cellSize }}
      >
        Score: {score}
      </div>
      <div
        className={styles.grid}
        style={{
          height: Config.height * Config.cellSize,
          width: Config.width * Config.cellSize,
        }}
      >
        {cells}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Snake), {
  ssr: false,
});
