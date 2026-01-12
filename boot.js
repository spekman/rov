import * as THREE from 'three';

export function initBootScreen(renderer, onComplete) {
    const container = document.getElementById('boot-container');
    const text = document.getElementById('boot-text');

    const manager = new THREE.LoadingManager();
    manager.onLoad = function () {
        console.log('All assets loaded!');
        animate();
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    container.appendChild(renderer.domElement);

    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader(manager);
    audioLoader.load('src/startup.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        sound.play();
    });

    // Background
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const textureLoader = new THREE.TextureLoader(manager);
    const cloudTexture = textureLoader.load('src/smoke.png');
    const colors = [0x0a22ff, 0x5C6CFF, 0x000C75, 0xB8BFFF, 0x2E43FF, 0x0a22ff];
    const clouds = []; 

    for (let i = 0; i < 7; i++) { 
        const material = new THREE.SpriteMaterial({
            map: cloudTexture,
            color: new THREE.Color(colors[i % colors.length]),
            transparent: true,
            opacity: 0.08 - (i * 0.005),
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);

        // Spread them out more in 3D space
        sprite.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            -5 - (i * 5)
        );

        sprite.scale.set(35, 35, 1);

        sprite.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            driftSpeed: Math.random() * 0.01,
            offset: Math.random() * Math.PI * 2
        };

        cloudGroup.add(sprite);
        clouds.push(sprite);
    }

    // Cube 
    const cubeMat = new THREE.MeshPhysicalMaterial({
        color: 0x020409,
        shininess: 100,
        specular: 0x4466ff,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const mainCube = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), cubeMat);
    mainCube.position.y = 2.5;
    scene.add(mainCube);

    const sideCoords = [
        { x: -15, y: 3, z: -10 }, { x: 17, y: 13, z: -10 },
        { x: -10, y: -10, z: -18 }, { x: 18, y: -14, z: -18 },
        { x: 0, y: -16, z: -15 }
    ];

    sideCoords.forEach(coord => {
        const sideCube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), cubeMat);
        sideCube.position.set(coord.x, coord.y, coord.z);
        scene.add(sideCube);
    });

    // Dots
    const dots = [];
    const addDot = (color, radius, speed, offset) => {
        const group = new THREE.Group();
        const light = new THREE.PointLight(color, 10, 15); // Intense lights for better reflections
        group.add(light, new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color })));
        scene.add(group);
        dots.push({ group, radius, speed, angle: offset });
    };

    addDot(0x66ccff, 4, 0.7, 0);
    addDot(0xff66aa, 5, -0.5, Math.PI);
    addDot(0x9966ff, 6, 0.4, Math.PI / 2);
    addDot(0x5af542, 5, 0.3, Math.PI / 3);

    // Idk
    camera.position.z = 20;

    const clock = new THREE.Clock();
    let elapsed = 0;
    let currentSpeed = 0.001; // Initial slow crawl
    let targetRotationZ, currentRotationZ = 0;
    let isFading = false;

    function animate() {
        const delta = clock.getDelta();
        const safeDelta = Math.min(delta, 0.1);
        elapsed += safeDelta;
        const requestID = requestAnimationFrame(animate);

        const targetSpeed = (elapsed > 7.0) ? 0.4 : 0.012;
        currentSpeed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, 0.04);

        camera.position.z -= currentSpeed;

        targetRotationZ = elapsed * 0.06;
        currentRotationZ = THREE.MathUtils.lerp(currentRotationZ, targetRotationZ, 0.2);
        camera.rotation.z = currentRotationZ;
        cloudGroup.children.forEach(cloud => {
            cloud.material.rotation = -currentRotationZ;
        });

        mainCube.rotation.y += 0.003;
        mainCube.rotation.x += 0.002;

        dots.forEach(dot => {
            dot.angle += dot.speed * 0.02;
            dot.group.position.set(
                Math.cos(dot.angle) * dot.radius,
                Math.sin(dot.angle) * (dot.radius * 0.6),
                Math.sin(dot.angle * 1.5) * 3
            );
        });

        clouds.forEach((cloud, i) => {
            const data = cloud.userData;

            cloud.material.rotation += data.rotationSpeed - (currentRotationZ * 0.01);

            const pulse = 35 + Math.sin(elapsed * 0.5 + data.offset) * 5;
            cloud.scale.set(pulse, pulse, 1);
            cloud.position.x += Math.cos(elapsed * 0.2 + i) * 0.001;
            cloud.position.y += Math.sin(elapsed * 0.2 + i) * 0.001;
        });

        // UI
        if (elapsed > 1 && elapsed < 3.5) text.style.opacity = 1;
        if (elapsed > 3.5) text.style.opacity = 0;

        if (elapsed > 7.5 && !isFading) {
            isFading = true;
            document.getElementById('fade-overlay').style.opacity = '1';
        }


        if (elapsed > 8) {
            cancelAnimationFrame(requestID);
            setTimeout(() => {
                onComplete();
            }, 1000);
            return;
        }

        renderer.render(scene, camera);
    }

}