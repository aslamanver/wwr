import "./App.css";
import React, { useEffect, useState, useRef, useMemo } from "react";
import * as PIXI from "pixi.js";
import io from "socket.io-client";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";

const socket = io("wss://wrongway-racer-api.spls.ae");

const scale = 1;

const app = new PIXI.Application({
  width: 1024 * scale,
  height: 768 * scale,
});

const ticker = PIXI.Ticker.shared;
ticker.autoStart = false;

let sky = PIXI.Sprite.from("resources/backgrounds/sky.png");
let road = PIXI.Sprite.from("resources/backgrounds/road.png");
let mountainLeft = PIXI.Sprite.from("resources/backgrounds/mountain_left.png");
let mountainRight = PIXI.Sprite.from(
  "resources/backgrounds/mountain_right.png"
);
let mountainFade = PIXI.Sprite.from("resources/backgrounds/mountain_fade.png");
let sideRoadLeft = PIXI.Sprite.from("resources/backgrounds/sideroad_left.png");
let sideRoadRight = PIXI.Sprite.from(
  "resources/backgrounds/sideroad_right.png"
);
let enemyCenter = PIXI.Sprite.from("resources/cars/enemy_center.png");
let enemyRight = PIXI.Sprite.from("resources/cars/enemy_right.png");
let enemyLeft = PIXI.Sprite.from("resources/cars/enemy_left.png");
let carCenter = PIXI.Sprite.from("resources/cars/car_center.png");
let carRight = PIXI.Sprite.from("resources/cars/car_right.png");
let carLeft = PIXI.Sprite.from("resources/cars/car_left.png");

let texture = new PIXI.BaseTexture(
  "resources/animations/explosion_spritesheet.avif"
);

let spriteSheet = [
  new PIXI.Texture(
    texture,
    new PIXI.Rectangle(
      texture.width * 0.8,
      0,
      texture.width / 5,
      texture.height
    )
  ),
  new PIXI.Texture(
    texture,
    new PIXI.Rectangle(
      texture.width * 0.5,
      0,
      texture.width / 5,
      texture.height
    )
  ),
];

let player = new PIXI.AnimatedSprite(spriteSheet);

let carDirectionIndex = 1;
let carDirection = "center";
let carPosition = {};

window.addEventListener("keydown", (e) => {
  //
  carCenter.visible = false;
  carRight.visible = false;
  carLeft.visible = false;

  if (e.key === "ArrowRight") {
    if (carDirectionIndex !== 2) {
      carDirectionIndex++;
    }
  }

  if (e.key === "ArrowLeft") {
    if (carDirectionIndex !== 0) {
      carDirectionIndex--;
    }
  }

  if (carDirectionIndex === 1) {
    carCenter.visible = true;
    carDirection = "center";
    carPosition = {
      y: carCenter.y,
    };
  }

  if (carDirectionIndex === 2) {
    carLeft.visible = true;
    carDirection = "right";
    carPosition = {
      y: carLeft.y,
    };
  }

  if (carDirectionIndex === 0) {
    carRight.visible = true;
    carDirection = "left";
    carPosition = {
      y: carRight.y,
    };
  }
});

function App() {
  //
  const [animation, setAnimation] = useState(1);
  const pixiElem = useRef();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [chats, setChats] = useState([]);
  const [players, setPlayers] = useState([]);

  let enemyDirection = "gone";
  let enemyPosition = {};

  const getDefaultSky = () => {
    sky.width = app.renderer.width;
    sky.height = app.renderer.height * 0.6;
    return sky;
  };

  const getDefaultRoad = () => {
    road.width = app.renderer.width + scale * 200;
    road.height = app.renderer.height * 0.4 * 1.03;
    road.x = scale * -120;
    road.y = app.renderer.height - road.height + road.height * 0.02;
    return road;
  };

  const getDefaultMountainLeft = () => {
    mountainLeft.scale.set(scale * 0.001);
    mountainLeft.y = app.renderer.height * 0.59;
    mountainLeft.x = app.renderer.width * 0.4;
    return mountainLeft;
  };

  const getDefaultMountainRight = () => {
    mountainRight.scale.set(scale * 0.01);
    mountainRight.y = app.renderer.height * 0.59;
    mountainRight.x = app.renderer.width * 0.5;
    return mountainRight;
  };

  const getDefaultMountainFade = () => {
    // mountainFade.scale.set(1);
    mountainFade.y = scale * 180;
    mountainFade.width = app.renderer.width + scale * 10;
    return mountainFade;
  };

  const getDefaultEnemyCenter = () => {
    enemyCenter.visible = false;
    enemyCenter.scale.set(scale * 0.2);
    enemyCenter.y = app.renderer.height * 0.59;
    enemyCenter.x = app.renderer.width * 0.5 - scale * 80;
    return enemyCenter;
  };

  const getDefaultEnemyRight = () => {
    enemyRight.visible = false;
    enemyRight.scale.set(scale * 0.2);
    enemyRight.y = app.renderer.height * 0.59;
    enemyRight.x = app.renderer.width * 0.5 - scale * 80;
    return enemyRight;
  };

  const getDefaultEnemyLeft = () => {
    enemyLeft.visible = false;
    enemyLeft.scale.set(scale * 0.2);
    enemyLeft.y = app.renderer.height * 0.59;
    enemyLeft.x = app.renderer.width * 0.5 - scale * 80;
    return enemyLeft;
  };

  const getDefaultCarCenter = () => {
    carCenter.visible = true;
    carCenter.scale.set(scale * 0.4);
    carCenter.y = app.renderer.height * 0.7;
    carCenter.x = app.renderer.width * 0.39;
    carPosition = { y: carCenter.y };
    return carCenter;
  };

  const getDefaultCarRight = () => {
    carRight.visible = false;
    carRight.scale.set(scale * 0.5);
    carRight.y = app.renderer.height * 0.7;
    carRight.x = app.renderer.width * 0.15;
    return carRight;
  };

  const getDefaultCarLeft = () => {
    carLeft.visible = false;
    carLeft.scale.set(scale * 0.5);
    carLeft.y = app.renderer.height * 0.7;
    carLeft.x = app.renderer.width * 0.6;
    return carLeft;
  };

  const getDefaultSideRoadLeft = () => {
    sideRoadLeft.scale.set(scale * 0.01);
    sideRoadLeft.y = app.renderer.height * 0.6;
    sideRoadLeft.x = app.renderer.width * 0.39;
    return sideRoadLeft;
  };

  const getDefaultSideRoadRight = () => {
    sideRoadRight.scale.set(scale * 0.01);
    sideRoadRight.y = app.renderer.height * 0.6;
    sideRoadRight.x = app.renderer.width * 0.5;
    return sideRoadRight;
  };

  const animateEnemyCenter = (speed) => {
    if (enemyDirection === "center" && enemyCenter.y < app.renderer.height) {
      // console.log("enemyCenter", enemyCenter.x, enemyCenter.y);
      enemyPosition = {
        x: enemyCenter.x,
        y: enemyCenter.y,
        w: enemyCenter.width,
        h: enemyCenter.height,
        a: enemyCenter.x * enemyCenter.y,
        yh: enemyCenter.y + enemyCenter.height,
      };
      enemyCenter.visible = true;
      enemyCenter.y += 1;
      enemyCenter.x += -0.3;
      let scale = 0.002;
      enemyCenter.scale.set(
        enemyCenter.scale.x + scale,
        enemyCenter.scale.y + scale
      );
    } else {
      if (enemyDirection === "center") {
        enemyDirection = "gone";
        enemyPosition = {};
      }
      enemyCenter = getDefaultEnemyCenter();
    }
  };

  const animateEnemyRight = (speed) => {
    if (enemyDirection === "right" && enemyRight.y < app.renderer.height) {
      // console.log("enemyRight", enemyRight.x, enemyRight.y);
      enemyPosition = {
        x: enemyRight.x,
        y: enemyRight.y,
        w: enemyRight.width,
        h: enemyRight.height,
        a: enemyRight.x * enemyRight.y,
        yh: enemyRight.y + enemyRight.height,
      };
      enemyRight.visible = true;
      enemyRight.y += 1;
      enemyRight.x += 1;
      let scale = 0.002;
      enemyRight.scale.set(
        enemyRight.scale.x + scale,
        enemyRight.scale.y + scale
      );
    } else {
      if (enemyDirection === "right") {
        enemyDirection = "gone";
        enemyPosition = {};
      }
      enemyRight = getDefaultEnemyRight();
    }
  };

  const animateEnemyLeft = (speed) => {
    if (enemyDirection === "left" && enemyLeft.y < app.renderer.height) {
      // console.log("enemyLeft", enemyLeft.x, enemyLeft.y);
      enemyPosition = {
        x: enemyLeft.x,
        y: enemyLeft.y,
        w: enemyLeft.width,
        h: enemyLeft.height,
        a: enemyLeft.x * enemyLeft.y,
        yh: enemyLeft.y + enemyLeft.height,
      };
      enemyLeft.visible = true;
      enemyLeft.y += 1;
      enemyLeft.x += -1.6;
      let scale = 0.002;
      enemyLeft.scale.set(enemyLeft.scale.x + scale, enemyLeft.scale.y + scale);
    } else {
      if (enemyDirection === "left") {
        enemyDirection = "gone";
        enemyPosition = {};
      }
      enemyLeft = getDefaultEnemyLeft();
    }
  };

  const animateCar = (delta, car) => {
    const defY = app.renderer.height * 0.7;
    car.y = defY + (Math.floor(delta * 100) % 5);
  };

  const animateMountainLeft = (speed) => {
    if (mountainLeft.x + mountainLeft.width > 0) {
      let scale = speed * 0.005;
      mountainLeft.y += speed * -2;
      mountainLeft.x += speed * -20;
      mountainLeft.scale.set(
        mountainLeft.scale.x + scale,
        mountainLeft.scale.y + scale
      );
    } else {
      mountainLeft = getDefaultMountainLeft();
    }
  };

  const animateSideRoadLeft = (speed) => {
    if (sideRoadLeft.x + sideRoadLeft.width > 0) {
      let scale = speed * 0.004;
      sideRoadLeft.y += speed * -1;
      sideRoadLeft.x += speed * -10;
      sideRoadLeft.scale.set(
        sideRoadLeft.scale.x + scale,
        sideRoadLeft.scale.y + scale
      );
    } else {
      sideRoadLeft = getDefaultSideRoadLeft();
      mountainLeft = getDefaultMountainLeft();
    }
  };

  const animateSideRoadRight = (speed) => {
    if (sideRoadRight.x < app.renderer.width) {
      let scale = speed * 0.004;
      sideRoadRight.y += speed * 1;
      sideRoadRight.x += speed * 4;
      sideRoadRight.scale.set(
        sideRoadRight.scale.x + scale,
        sideRoadRight.scale.y + scale
      );
    } else {
      sideRoadRight = getDefaultSideRoadRight();
      mountainRight = getDefaultMountainRight();
    }
  };

  const animateMountainRight = (speed) => {
    if (mountainRight.x < app.renderer.width) {
      let scale = speed * 0.005;
      mountainRight.y += speed * 1;
      mountainRight.x += speed * 15;
      mountainRight.scale.set(
        mountainRight.scale.x + scale,
        mountainRight.scale.y + scale
      );
    } else {
      mountainRight = getDefaultMountainRight();
    }
  };

  const getDefaultPlayer = () => {
    player.loop = true;
    player.animationSpeed = 0.1;
    player.x = 0;
    player.y = 0;
    return player;
  };

  const restart = () => {
    enemyCenter = getDefaultEnemyCenter();
    enemyRight = getDefaultEnemyRight();
    enemyLeft = getDefaultEnemyLeft();
    player.visible = false;
    ticker.start();
  };

  useEffect(() => {
    //
    console.log("useEffect");
    pixiElem.current.innerHTML = "";
    pixiElem.current.append(app.view);

    app.stage.removeChildren();
    app.stage.addChild(getDefaultSky());
    app.stage.addChild(getDefaultRoad());
    app.stage.addChild(getDefaultSideRoadLeft());
    app.stage.addChild(getDefaultSideRoadRight());
    app.stage.addChild(getDefaultEnemyCenter());
    app.stage.addChild(getDefaultEnemyRight());
    app.stage.addChild(getDefaultEnemyLeft());
    app.stage.addChild(getDefaultCarCenter());
    app.stage.addChild(getDefaultCarRight());
    app.stage.addChild(getDefaultCarLeft());
    app.stage.addChild(getDefaultMountainLeft());
    app.stage.addChild(getDefaultMountainRight());
    app.stage.addChild(getDefaultMountainFade());
    app.stage.addChild(getDefaultPlayer());

    player.play();
    player.visible = false;

    ticker.add((delta) => {
      //
      animateMountainLeft(0.1);
      animateMountainRight(0.1);
      animateSideRoadLeft(0.5);
      animateSideRoadRight(0.5);
      animateCar(delta, carCenter);
      animateCar(delta, carRight);
      animateCar(delta, carLeft);
      animateEnemyCenter(1);
      animateEnemyRight(1);
      animateEnemyLeft(1);

      if (enemyDirection === carDirection) {
        // console.log(enemyPosition.y, carPosition.y);
        if (enemyPosition.y > carPosition.y) {
          player.visible = true;
          ticker.stop();
          setTimeout(() => {
            restart();
          }, 2000);
        }
      }

      // console.log(enemyPosition, carPosition);
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("newEnemy", (message) => {
      //
      console.log(message);
      enemyDirection = message;
    });

    socket.on("newChat", (message) => {
      //
      // console.log(message);
      setChats((oldArray) => [...oldArray, message]);
    });

    socket.on("players", (message) => {
      //
      // console.log(message);
      setPlayers(message);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("newChat");
      socket.off("players");
      socket.off("newEnemy");
    };
    //
  }, []);

  useEffect(() => {
    //
    if (animation === 1) {
      ticker.start();
    } else {
      ticker.stop();
    }
    //
  }, [animation]);

  return (
    <div className="App" id="app">
      <div ref={pixiElem}></div>
      <Grid container spacing={2}>
        <Grid item sm={4} xs={12}>
          <div className="chat-box">
            <Button
              style={{ marginRight: "10px" }}
              variant="contained"
              color="success"
              onClick={() => {
                restart();
              }}
            >
              Restart
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setAnimation(animation === 1 ? 0 : 1);
              }}
            >
              {animation === 1 ? "Pause" : "Play"}
            </Button>
            <div>
              <p>Connected: {"" + isConnected}</p>
            </div>
          </div>
        </Grid>
        <Grid item sm={4} xs={12}>
          <div className="chat-box">
            <h4>Messages</h4>
            {chats.map((e) => (
              <div key={Math.random()}>{e}</div>
            ))}
          </div>
        </Grid>
        <Grid item sm={4} xs={12}>
          <div className="chat-box">
            <h4>Players</h4>
            {players.map((e) => (
              <div className="player-li" key={Math.random()}>
                {/* <Avatar src={e.avatar} /> */}
                <span>{e.name}</span>
              </div>
            ))}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
