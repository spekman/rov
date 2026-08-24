import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { initBrowser } from './browser.js';
import { initWhiteSpace } from './whitespace.js';
// For those who don't know the PS2 menu's orbs actually function as a clock!
// They move with slightly different speeds, like a pendulum, and  get 
// grouped together at specific parts of a minute. Worth reading about! 

export function initMainMenu(renderer) {
    const menu = document.getElementById('menu');
    const fadeOverlay = document.getElementById('fade-overlay');
    fadeOverlay.style.opacity = '1';
    document.getElementById('menu').style.display = 'block';


    // Scene setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4.5;


    const container = document.body;
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    window.activeCamera = camera;
    window.activeComposer = composer;

    // Audio
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('src/select.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
    });


    // Browser redirect
    const browserBtn = document.querySelector('.menu-item:first-child');
    browserBtn.onclick = () => {
        sound.play();
        const fadeOverlay = document.getElementById('fade-overlay');
        fadeOverlay.style.opacity = '1';

        setTimeout(() => {
            menu.style.display = 'none';
            // FIX: Pass the renderer here!
            initBrowser(renderer,
                () => initMainMenu(renderer), // Back callback
                () => initWhiteSpace(renderer, () => initBrowser(renderer, () => initMainMenu(renderer))) // Launch callback
            );
        }, 1500);
    };

    // Assets
    const glowMap = new THREE.TextureLoader().load('src/orb.png');

    // Orb system
    const orbCount = 7;

    // Integer harmonic ratios
    const ORB_RATIOS = [0, 1, 2, 3, 4, 5, 6];
    const ORBIT_RADIUS = 0.8;

    const globalPivot = new THREE.Group();
    scene.add(globalPivot);

    const orbs = [];

    for (let i = 0; i < orbCount; i++) {
        const mat = new THREE.SpriteMaterial({
            map: glowMap,
            color: 0xffffff,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(0.45, 0.45, 1);
        sprite.position.set(0, 0, 0);

        globalPivot.add(sprite);

        orbs.push({ sprite });
    }

    // Time helper
    function getMinutePhase(t) {
        return (t % 60) / 60;
    }

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.001;

        // Pendulum
        const baseAngle = getMinutePhase(time) * Math.PI * 2;

        // Global 3D rotation
        globalPivot.rotation.x += 0.006;
        globalPivot.rotation.y += 0.01;
        globalPivot.rotation.z += 0.015;

        orbs.forEach((orb, i) => {
            const ratio = ORB_RATIOS[i];

            const angle = baseAngle * ratio;

            orb.sprite.position.set(
                Math.cos(angle) * ORBIT_RADIUS,
                Math.sin(angle) * ORBIT_RADIUS,
                0
            );
        });

        composer.render();
    }

    // Fade in
    requestAnimationFrame(() => {
        setTimeout(() => {
            fadeOverlay.style.opacity = '0';
        }, 500);
    });



    animate();
}
