class OverworldEvent {
  constructor({ map, event}) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];

    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
    
    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];

    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }

  textMessage(resolve) {

    if (this.event.facePlayer) {
      const obj = this.map.gameObjects[this.event.facePlayer];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["player"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    })
    message.init( document.querySelector(".game-container") )
  }

  changeMap(resolve) {
    //Stop all Person things
    Object.values(this.map.gameObjects).forEach(obj => {
      obj.isMounted = false;
    })

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( window.OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();
      sceneTransition.fadeOut();
    })
  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      }
    });
    menu.init(document.querySelector(".game-container"));
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }

  removeStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = false;
    resolve();
  }

  bg(resolve) {
    document.querySelector(".game-container").style.backgroundImage="url(/game/images/maps/samatha.gif)";       
    resolve();
  }

  removeBg(resolve) {
    document.querySelector(".game-container").style.background="black";       
    resolve();
  }

  loadPC(resolve) {
    const menu = new PC({
      onComplete: () => {
        resolve();
      }
    })
    menu.init(document.querySelector(".game-container"))
  }

  tv(resolve) {
    const menu = new tv({
      onComplete: () => {
        resolve();
      }
    })
    menu.init(document.querySelector(".game-container"))
  }

  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)      
    })
  }

}