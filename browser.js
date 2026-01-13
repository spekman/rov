import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initBrowser(renderer, onBack, onLaunchGame) {
    const scene = new THREE.Scene();
    const fadeOverlay = document.getElementById('fade-overlay');
    const label = document.getElementById('browser-label');
    const manager = new THREE.LoadingManager();

    // 1. Background Gradient (Preserved from your code)
    const bgGeometry = new THREE.PlaneGeometry(50, 30);
    const bgMaterial = new THREE.ShaderMaterial({
        uniforms: {
            colorTop: { value: new THREE.Color(0xffffff) },
            colorBottom: { value: new THREE.Color(0x111111) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform vec3 colorTop;
            uniform vec3 colorBottom;
            void main() {
                gl_FragColor = vec4(mix(colorBottom, colorTop, vUv.y), 1.0);
            }
        `,
        depthWrite: false
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    background.position.z = -10;
    scene.add(background);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    window.activeCamera = camera;

    if (renderer.domElement.parentElement !== document.body) {
        document.body.appendChild(renderer.domElement);
    }

    // 2. Lights (Preserved intensities from your code)
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    scene.add(ambientLight);
    const selectionLight = new THREE.PointLight(0xffffff, 100, 2, 3);
    const selectionLight2 = new THREE.PointLight(0xffffff, 400, 1.5, 2);
    scene.add(selectionLight);
    scene.add(selectionLight2);

    // 3. Icon Data
    const items = [];
    const itemInfo = [
        { name: "Memory Card (PS2) / 1", type: "model" },
        { name: "Realm of Vignette", type: "gif" }
    ];

    // Load GLTF Model (Slot 1)
    const loader = new GLTFLoader(manager);
    loader.load('src/tiger.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(-1.5, -0.5, 0);
        // Tilt forward slightly (approx 15 degrees)
        model.rotation.x = 0.25;
        model.rotation.y = Math.PI;
        scene.add(model);
        items[0] = model;
    });

    // Create Video Texture Plane (Slot 2)
    const video = document.createElement('video');
    video.src = 'src/mewo.mp4';
    video.loop = true;
    video.muted = true;
    video.play();
    const videoTex = new THREE.VideoTexture(video);

    const discGeom = new THREE.BoxGeometry(1, 1, 1);
    const discMat = new THREE.MeshStandardMaterial({ map: videoTex, roughness: 0.8 });
    const discMesh = new THREE.Mesh(discGeom, discMat);
    discMesh.position.set(1.5, 0, 0);
    discMesh.rotation.x = 0.25; // Tilt forward
    scene.add(discMesh);
    items[1] = discMesh;

    let selectedIndex = 0;

    manager.onLoad = () => {
        fadeOverlay.style.opacity = '0';
        label.style.opacity = '1';
        updateLabel();
    };

    const updateLabel = () => {
        if (label) label.innerText = itemInfo[selectedIndex].name;
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowRight' && selectedIndex < 1) selectedIndex++;
        if (e.key === 'ArrowLeft' && selectedIndex > 0) selectedIndex--;
        if (e.key === 'Enter' || e.key === 'x') {
            if (selectedIndex === 1) { // If "Your Game / Disc" is selected
                const fadeOverlay = document.getElementById('fade-overlay');
                fadeOverlay.style.opacity = '1';

                setTimeout(() => {
                    // Hide browser UI
                    document.getElementById('browser-label').style.opacity = '0';
                    // Clean up browser listener
                    window.removeEventListener('keydown', onKeyDown);

                    // Launch the game
                    onLaunchGame();
                }, 1000);
            }
        }
        updateLabel();
    };
    window.addEventListener('keydown', onKeyDown);

    function animate() {
        requestAnimationFrame(animate);

        if (items[selectedIndex]) {
            const targetPos = items[selectedIndex].position;
            // Position light BELOW icons (Y - 1.5) and slightly in front (Z 1.5)
            const lightTarget = new THREE.Vector3(targetPos.x, targetPos.y - 1, 1.5);

            selectionLight.position.lerp(lightTarget, 0.1);
            selectionLight2.position.lerp(lightTarget, 0.1);
        }

        renderer.render(scene, camera);
    }

    animate();
}