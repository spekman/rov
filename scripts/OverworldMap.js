class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.configObjects = config.configObjects; // Configuration content
    this.gameObjects = {}; // Starts empty, live object instances in the map get added here
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(9.5) - cameraPerson.x, 
      utils.withGrid(5) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(9.5) - cameraPerson.x, 
      utils.withGrid(5) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    // Check for objects that match
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y) { return true; }
      if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
        return true;
      }
      return false;
    })
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach(key => {

      let config = this.configObjects[key];
      config.id = key;

      let obj;
      if (config.type === "Person") {
        obj = new Person(config);
      }
      this.gameObjects[key] = obj;
      this.gameObjects[key].id = key;
      obj.mount(this);
    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }
    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    const player = this.gameObjects["player"];
    const nextCoords = utils.nextPosition(player.x, player.y, player.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const player = this.gameObjects["player"];
    const match = this.cutsceneSpaces[ `${player.x},${player.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }


}

window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/demoL.png",
    upperSrc: "/images/maps/demoU.png",
    configObjects: {
      player: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(15),
        y: utils.withGrid(12),
      },
      sans: {
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/sans.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 500, },
          { type: "stand", direction: "down", time: 500, },
          { type: "stand", direction: "right", time: 500, },
          { type: "stand", direction: "up", time: 500, },
          { type: "walk", direction: "left",  },
          { type: "walk", direction: "down",  },
          { type: "walk", direction: "right",  },
          { type: "walk", direction: "up",  },
        ],
        talking: [
          {
            required: ["USED_PC"],
            events: [
              { type: "textMessage", text: "I hope you haven't written anything stupid.", facePlayer: "sans" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "What do you mean this is not a game?", facePlayer: "sans" },
               //{ who: "npcB", type: "walk",  direction: "up" },
            ]
          }
        ]
      },
      notebook: {
        type: "Person",
        x: utils.withGrid(16),
        y: utils.withGrid(11),
        src: "/images/blank.png",
        talking: [
          {
            events: [
              { type: "loadPC"},
              { type: "addStoryFlag", flag: "USED_PC"}
            ]
          }
        ]
      },
      samara: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(18),
        src: "/images/characters/mari.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Oi meu nome é Samara, tenho 14 anos (Teria se estivesse viva), morri aos 13 em Cascavel-PR. Eu andava de bicicleta Quando não pude desviar de um arame farpado."},
              { type: "textMessage", text: "O pior foi que o dono do lote não quis me ajudar, riu bastante mim após agonizar por 2 horas enroscada no arame eu faleci, através dessa mensagem eu peço que façam com que eu possa descançar em paz."},
              { type: "textMessage", text: "Envie isso para 20 comunidades e minha alma estara sendo salva por você e pelos outros 20 que receberão. Caso não repasse essa mensagem vou visitar-lhe hoje a noite assim vc poderá conhecer o tal arame bem de pertinho."},
              { type: "textMessage", text: "Dia 15 de Julho Mariana resolveu rir dessa mensagem, uma noite depois ela sumiu sem deixar vestigios. O mesmo aconteceu com Kare dia 18 de Outubro. Não Quebre essa corrente por favor, a não ser que queira sentir a minha presença."}
            ]
          }
        ]
      },
      box: {
        type: "Person",
        x: utils.withGrid(16),
        y: utils.withGrid(13),
        src: "/images/blank.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Você assoa o nariz, em português."},
            ]
          }
        ]
      },
    },
    walls: {
      [utils.asGridCoord(12,8)] : true,
      [utils.asGridCoord(20,10)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(20,11)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "Neighbour",
              x: utils.withGrid(15),
              y: utils.withGrid(22), 
              direction: "up"
            }
          ]
      }],
      [utils.asGridCoord(12,9)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "Bathroom",
              x: utils.withGrid(7),
              y: utils.withGrid(8), 
              direction: "up"
            }
          ]
      }]
    }
  },
  Neighbour: {
    id: "Neighbour",
    lowerSrc: "/images/maps/neighbour.png",
    upperSrc: "",
    configObjects: {
      player: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(15),
        y: utils.withGrid(12),
      },
    caitlyn: {
      type: "Person",
      x: utils.withGrid(11),
      y: utils.withGrid(15),
      src: "/images/characters/caitlyn.png",
      behaviorLoop: [
        { type: "walk", direction: "left", },
        { type: "walk", direction: "down", },
        { type: "walk", direction: "right", },
        { type: "walk", direction: "up", },
        { type: "stand", direction: "up", time: 400, },
      ],
      talking: [{
        events: [{type: 'textMessage', text: "I don't know why I'm here either..."}]
      }]
    },
    sans: {
      type: "Person",
      x: utils.withGrid(19),
      y: utils.withGrid(21),
      src: "/images/characters/sans.png",
      talking: [{
        required: ["WATCHED_TV"],
        events: [
          { type: "textMessage", text: "What do you mean it sucks?", facePlayer: "sans" },
        ]
      },
      {
        events: [{type: 'textMessage', text: 'Check this TV out!'}]
      }]
    },
    tv: {
      type: "Person",
      x: utils.withGrid(20),
      y: utils.withGrid(21),
      src: "/images/blank.png",
      talking: [
        {
          events: [
            { type: "textMessage", text: "You turn the TV on."},
            { type: "addStoryFlag", flag: "WATCHED_TV"},
            { type: "tv"}
          ]
        }
      ]
    },
    },
    walls: {
      [utils.asGridCoord(21,23)] : true,
      [utils.asGridCoord(20,23)] : true,
      [utils.asGridCoord(19,23)] : true,
      [utils.asGridCoord(18,23)] : true,
      [utils.asGridCoord(17,23)] : true,
      [utils.asGridCoord(16,23)] : true,
      [utils.asGridCoord(15,23)] : true,
      [utils.asGridCoord(14,23)] : true,
      [utils.asGridCoord(13,23)] : true,
      [utils.asGridCoord(12,23)] : true,
      [utils.asGridCoord(11,23)] : true,
      [utils.asGridCoord(10,23)] : true,
      [utils.asGridCoord(9,23)] : true,
      [utils.asGridCoord(8,23)] : true,
      [utils.asGridCoord(7,22)] : true,
      [utils.asGridCoord(7,21)] : true,
      [utils.asGridCoord(7,20)] : true,
      [utils.asGridCoord(7,19)] : true,
      [utils.asGridCoord(7,18)] : true,
      [utils.asGridCoord(7,17)] : true,
      [utils.asGridCoord(7,16)] : true,
      [utils.asGridCoord(7,15)] : true,
      [utils.asGridCoord(7,14)] : true,
      [utils.asGridCoord(22,22)] : true,
      [utils.asGridCoord(22,21)] : true,
      [utils.asGridCoord(22,20)] : true,
      [utils.asGridCoord(22,19)] : true,
      [utils.asGridCoord(22,18)] : true,
      [utils.asGridCoord(22,17)] : true,
      [utils.asGridCoord(22,16)] : true,
      [utils.asGridCoord(22,15)] : true,
      [utils.asGridCoord(22,14)] : true,
      [utils.asGridCoord(21,13)] : true,
      [utils.asGridCoord(21,12)] : true,
      [utils.asGridCoord(21,11)] : true,
      [utils.asGridCoord(18,13)] : true,
      [utils.asGridCoord(18,12)] : true,
      [utils.asGridCoord(18,11)] : true,
      [utils.asGridCoord(17,13)] : true,
      [utils.asGridCoord(16,13)] : true,
      [utils.asGridCoord(15,13)] : true,
      [utils.asGridCoord(14,13)] : true,
      [utils.asGridCoord(13,13)] : true,
      [utils.asGridCoord(12,13)] : true,
      [utils.asGridCoord(11,13)] : true,
      [utils.asGridCoord(10,13)] : true,
      [utils.asGridCoord(9,13)] : true,
      [utils.asGridCoord(8,13)] : true,
      [utils.asGridCoord(11,17)] : true,
      [utils.asGridCoord(10,17)] : true,
      [utils.asGridCoord(9,17)] : true,
      [utils.asGridCoord(11,18)] : true,
      [utils.asGridCoord(10,18)] : true,
      [utils.asGridCoord(9,18)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(19,10)]: [{
        events: [
          { 
            type: "changeMap", 
            map: "DemoRoom",
            x: utils.withGrid(15),
            y: utils.withGrid(12), 
            direction: "down"
          }
    ]}],
      [utils.asGridCoord(20,10)]: [{
          events: [
            { 
              type: "changeMap", 
              map: "DemoRoom",
              x: utils.withGrid(15),
              y: utils.withGrid(12), 
              direction: "down"
            }
      ]}]
    }
  },
  Bathroom: {
    id: "Bathroom",
    lowerSrc: "/images/maps/bathroom.png",
    upperSrc: "",
    configObjects: {
      player: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(7),
        y: utils.withGrid(4),
      },
    oneko: {
      type: "Person",
      x: utils.withGrid(0),
      y: utils.withGrid(0),
      src: "/images/characters/oneko.png",
      behaviorLoop: [
        { type: "walk", direction: "right", },
        { type: "stand", direction: "down", time: 600, },
        { type: "walk", direction: "right", },
        { type: "stand", direction: "down", time: 600, },
        { type: "walk", direction: "left", },
        { type: "stand", direction: "down", time: 600, },
        { type: "walk", direction: "left", },
        { type: "stand", direction: "down", time: 600, },
      ],
      talking: [
        {
        
          required: ["background"],
          events: [
            { type: "textMessage", text: "Hope Everyone Likes Pancakes!" },
            { type: "removeStoryFlag", flag: "background"},
            { type: "removeBg"},
            { 
              type: "changeMap", 
              map: "DemoRoom",
              x: utils.withGrid(15),
              y: utils.withGrid(12), 
              direction: "down"
            }
          ]
        },
        {
       events: [
          { type: "textMessage", text: "I've been here since forever."},
          { type: "addStoryFlag", flag: "background"},
          { type: "bg"},
        ]   
        },
      ]
    },
    },
    walls: {
      [utils.asGridCoord(9,18)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,3)]: [
        {
          events: [
            { type: "textMessage", text:"Too cold!"},
            { who: "player", type: "walk",  direction: "down" },
          ]
        }
      ],
      [utils.asGridCoord(19,10)]: [{
        events: [
          { 
            type: "changeMap", 
            map: "DemoRoom",
            x: utils.withGrid(15),
            y: utils.withGrid(12), 
            direction: "down"
          }
    ]}],
    }
  }
}