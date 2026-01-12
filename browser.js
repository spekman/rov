import * as THREE from 'three';

export function initBrowser(renderer, onBack) {
    const scene = new THREE.Scene();
    const fadeOverlay = document.getElementById('fade-overlay');
    fadeOverlay.style.opacity = '1';

    // 1. Background Gradient
    const bgGeometry = new THREE.PlaneGeometry(50, 50);
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
    camera.position.set(0, 0, 20);

    // FIX: Ensure renderer.domElement is appended correctly
    if (renderer.domElement.parentElement !== document.body) {
        document.body.appendChild(renderer.domElement);
    }

    // 2. The Selection Light (The Glow)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);
    const selectionLight = new THREE.PointLight(0xffffff, 100, 2);
    const selectionLight2 = new THREE.PointLight(0xffffff, 400, 1.5, 2)
    scene.add(selectionLight);
    scene.add(selectionLight2)

    // 3. Grid
    const items = [];
    const gridCols = 4;
    const spacing = 3;
    const geometry = new THREE.BoxGeometry(1.5, 1.8, 0.4);
    const material = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });

    for (let i = 0; i < 8; i++) {
        const mesh = new THREE.Mesh(geometry, material.clone());
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);
        mesh.position.x = (col - (gridCols - 1) / 2) * spacing;
        mesh.position.y = -(row - 0.5) * spacing;
        scene.add(mesh);
        items.push(mesh);
    }

    let selectedIndex = 0;

    const onKeyDown = (e) => {
        if (e.key === 'ArrowRight' && selectedIndex < items.length - 1) selectedIndex++;
        if (e.key === 'ArrowLeft' && selectedIndex > 0) selectedIndex--;
        if (e.key === 'Backspace') {
            window.removeEventListener('keydown', onKeyDown);
            onBack();
        }
    };
    window.addEventListener('keydown', onKeyDown);

    function animate() {
        requestAnimationFrame(animate);
        const targetPos = items[selectedIndex].position;
        selectionLight.position.lerp(new THREE.Vector3(targetPos.x, targetPos.y, 1.5), 0.1);
         selectionLight2.position.lerp(new THREE.Vector3(targetPos.x, targetPos.y, 1.5), 0.1);

        renderer.render(scene, camera);
    }
    requestAnimationFrame(() => {
        setTimeout(() => {
            fadeOverlay.style.opacity = '0';
        }, 500);
    });

    animate();
}