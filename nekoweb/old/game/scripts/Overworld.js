class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }

  gameLoopStepWork(delta) {
    //Clear off the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //Establish the camera person
    const cameraPerson = this.map.gameObjects.player;

    //Update all objects
    Object.values(this.map.gameObjects).forEach(object => {
      object.update({
        delta,
        arrow: this.directionInput.direction,
        map: this.map,
      })
    })

    //Draw Lower layer
    this.map.drawLowerImage(this.ctx, cameraPerson);

    //Draw Game Objects
    Object.values(this.map.gameObjects).sort((a, b) => {
      return a.y - b.y;
    }).forEach(object => {
      object.sprite.draw(this.ctx, cameraPerson);
    })

    //Draw Upper layer
    this.map.drawUpperImage(this.ctx, cameraPerson);
  }

  startGameLoop() {
    let previousMs;
    const step = 1 / 60;

    const stepFn = (timestampMs) => {
      // Stop here if paused
      if (this.map.isPaused) {
        return;
      }
      if (previousMs === undefined) {
        previousMs = timestampMs;
      }

      let delta = (timestampMs - previousMs) / 1000;
      while (delta >= step) {
        this.gameLoopStepWork(delta);
        delta -= step;
      }
      previousMs = timestampMs - delta * 1000; // Make sure we don't lose unprocessed (delta) time

      // Business as usual tick
      requestAnimationFrame(stepFn)
    }

    // First tick
    requestAnimationFrame(stepFn)
  }

  bindActionInput() {
    new KeyPressListener("Enter", () => {
      //Is there a person here to talk to?
      this.map.checkForActionCutscene()
    })
    new KeyPressListener("Escape", () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([
          { type: "pause" }
        ])
      }
    })
  }

  bindPlayerPositionCheck() {
    document.addEventListener("PersonWalkingComplete", e => {
      if (e.detail.whoId === "player") {
        //Player's position has changed
        this.map.checkForFootstepCutscene()
      }
    })
  }

  startMap(mapConfig, playerInitialState = null) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();

    if (playerInitialState) {
      const { player } = this.map.gameObjects;
      player.x = playerInitialState.x;
      player.y = playerInitialState.y;
      player.direction = playerInitialState.direction;
    }

  }

  async init() {

    const container = document.querySelector(".game-container");

    //Show the title screen
    this.titleScreen = new TitleScreen();
    await this.titleScreen.init(container);

    //Start the first map
    this.startMap(window.OverworldMaps["DemoRoom"], null);

    //Create controls
    this.bindActionInput();
    this.bindPlayerPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    //Kick off the game!
    this.startGameLoop();



  }
}