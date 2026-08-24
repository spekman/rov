import * as THREE from "three";

export function initWhiteSpace(renderer, onExit) {
  const fadeOverlay = document.getElementById('fade-overlay');
    fadeOverlay.style.opacity = '1';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  window.activeCamera = camera;

  const container = document.body;
  container.appendChild(renderer.domElement);

  // Lights & BG
  scene.background = new THREE.Color(0xffffff);

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight.position.set(1, 2, 1);
  scene.add(dirLight);

  // Floor

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Carpet

  const rectSizeX = 4;
  const rectSizeZ = 3;

  const rectPoints = [
    new THREE.Vector3(-rectSizeX, 0, -rectSizeZ),
    new THREE.Vector3(rectSizeX, 0, -rectSizeZ),
    new THREE.Vector3(rectSizeX, 0, rectSizeZ),
    new THREE.Vector3(-rectSizeX, 0, rectSizeZ),
    new THREE.Vector3(-rectSizeX, 0, -rectSizeZ),
  ];

  const rectGeometry = new THREE.BufferGeometry().setFromPoints(rectPoints);

  const rectLine = new THREE.Line(
    rectGeometry,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );

  scene.add(rectLine);

  // Grid

  const grid = new THREE.GridHelper(
    100,
    100,
    0x000000,
    0x000000
  );
  grid.material.opacity = 0.03;
  grid.material.transparent = true;
  scene.add(grid);
  grid.visible = false;

  const keys = {};
  const onKeyDown = (e) => {
    keys[e.code] = true;
    if (e.code === "KeyG") grid.visible = !grid.visible;
    if (e.code === "Escape") { // Back to browser
      stopGame();
      onExit();
    }
  };
  const onKeyUp = (e) => keys[e.code] = false;

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // Player 
  const player = {
    position: new THREE.Vector3(0, 1.6, 5),
    rotationY: 0,
  };

  camera.position.copy(player.position);

  // Sprites

  const loader = new THREE.TextureLoader();

  function loadSprite(path) {
    const tex = loader.load(path);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
  }

  function createWorldSprite(texture, width, height) {
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      mat
    );

    return mesh;
  }

  const catTex = loadSprite("/src/mewo.webp");
  const cat = createWorldSprite(catTex, 1.5, 1.5);
  cat.position.set(2, 0.5, 0);
  scene.add(cat);

  const bulbTex = loadSprite("/src/bulb.webp");
  const bulb = createWorldSprite(bulbTex, 1, 1);
  bulb.position.set(1, 3.5, -1);
  scene.add(bulb);

  const cordHeight = 50;
  const cordPoints = [
    new THREE.Vector3(0, cordHeight, 0),
    new THREE.Vector3(0, bulb.position.y, bulb.position.z),
  ];
  const cordGeometry = new THREE.BufferGeometry().setFromPoints(cordPoints);
  const cord = new THREE.Line(
    cordGeometry,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );
  scene.add(cord);
  cord.geometry.setFromPoints([
    new THREE.Vector3(
      bulb.position.x,
      cordHeight,
      bulb.position.z
    ),
    new THREE.Vector3(
      bulb.position.x + 0.015,
      bulb.position.y + 0.5,
      bulb.position.z
    ),
  ]);
  cord.material.depthWrite = false;

  const doorTex = loadSprite("/src/door.webp");
  const door = createWorldSprite(doorTex, 2, 2.5);
  door.position.set(-3, 1.2, -6);
  scene.add(door);

  const laptopWidth = 1.2;
  const laptopDepth = 0.8;
  const laptopScreenHeight = 0.8;
  const laptopBase = new THREE.Mesh(
    new THREE.PlaneGeometry(laptopWidth, laptopDepth),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  laptopBase.rotation.x = -Math.PI / 2;
  laptopBase.position.set(-1.5, 0.01, 0.5);
  scene.add(laptopBase);
  const laptopScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(laptopWidth, laptopScreenHeight),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  laptopScreen.position.set(
    laptopBase.position.x,
    laptopBase.position.y + laptopScreenHeight / 2,
    laptopBase.position.z - laptopDepth / 2
  );
  laptopScreen.rotation.x = -0.2;
  scene.add(laptopScreen);
  const laptop = new THREE.Group();
  laptop.add(laptopBase);
  laptop.add(laptopScreen);
  scene.add(laptop);



  // Loop
  const clock = new THREE.Clock();

  function update() {
    const dt = clock.getDelta();

    const moveSpeed = 5;
    const turnSpeed = 3;

    if (keys["KeyA"] || keys["ArrowLeft"]) player.rotationY += turnSpeed * dt;
    if (keys["KeyD"] || keys["ArrowRight"]) player.rotationY -= turnSpeed * dt;

    const forward = new THREE.Vector3(
      Math.sin(player.rotationY),
      0,
      Math.cos(player.rotationY)
    );

    if (keys["KeyW"] || keys["ArrowUp"]) player.position.addScaledVector(forward, -moveSpeed * dt);
    if (keys["KeyS"] || keys["ArrowDown"]) player.position.addScaledVector(forward, moveSpeed * dt);

    // Camera sync
    camera.position.copy(player.position);
    camera.rotation.set(0, player.rotationY, 0);

    // Sprite
    cat.rotation.y = player.rotationY
    bulb.rotation.y = player.rotationY

    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }

  requestAnimationFrame(() => {
        setTimeout(() => {
            fadeOverlay.style.opacity = '0';
        }, 500);
    });

  function stopGame() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  }


  update();

}