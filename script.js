let scene, camera, renderer, controls;
let shipModel;
let water;
let clock = new THREE.Clock();

// Coordenadas dos hotspots
const hotspotsData = [
    {
        name: "CLP - Cérebro da Automação",
        position: { x: 0, y: 1, z: 4 },
        content: {
            title: "CLP - Controlador Lógico Programável",
            body: `
                <br><br>
                <strong>Aplicações no Navio:</strong> Automação da sala de máquinas, Sistema de controle de lastro, Controle de geração de energia.
                <br><br>
                <strong>Benefícios:</strong> Operação automática 24/7, Detecção rápida de falhas, Registro de eventos.
                <br><br>
                <strong>Produto WEG:</strong> PLC300 / PLC500 (certificado naval)
                <br><br>
                <strong>Curiosidade:</strong> Exigem certificação naval e grau de proteção IP55+.
            `
        }
    },

    {
        name: "IHM - Ponte de Comando",
        position: { x: 0, y: 3, z: 4 },
        content: {
            title: "Interface Homem-Máquina (IHM)",
            body: `
                <br><br>
                <strong>Aplicações no Navio:</strong> Ponte de comando, Sala de controle de máquinas, Monitoramento de tanques.
                <br><br>
                <strong>Benefícios:</strong> Visualização em tempo real, Operação intuitiva, Alarmes visuais.
                <br><br>
                <strong>Produto WEG:</strong> TPW03 / TPW04 (linha marítima)
                <br><br>
                <strong>Curiosidade:</strong> Resistem a vibrações e ambiente salino.
            `
        }
    },

    {
        name: "SCADA - Sistema de Supervisão",
        position: { x: 0, y: 1, z: -2 },
        content: {
            title: "SCADA / Sistema de Supervisão",
            body: `
                <br><br>
                <strong>Aplicações no Navio:</strong> Visão geral de todos sistemas, Análise de performance, Central de alarmes.
                <br><br>
                <strong>Benefícios:</strong> Controle centralizado, Dashboards personalizados, Diagnóstico avançado.
                <br><br>
                <strong>Produto WEG:</strong> WEG Automation Suite (IAS)
                <br><br>
                <strong>Curiosidade:</strong> Integra até 1000+ pontos de monitoramento.
            `
        }
    },

    {
        name: "Soft-Starter - Bombas Principais",
        position: { x: 0, y: 2, z: -4 },
        content: {
            title: "Soft-Starter",
            body: `
                <br><br>
                <strong>Aplicações no Navio:</strong> Guindastes de carga, Bombas principais, Compressores de refrigeração.
                <br><br>
                <strong>Benefícios:</strong> Reduz pico de corrente em 70%, Menos stress mecânico, Aumenta vida útil.
                <br><br>
                <strong>Produto WEG:</strong> SSW900 (ambiente marinho)
                <br><br>
                <strong>Curiosidade:</strong> Economia de até 30% na energia de partida.
            `
        }
    },

    {
        name: "Inversor de Frequência",
        position: { x: 0, y: 1, z: 1 },
        content: {
            title: "Inversores de Frequência",
            body: `
                <br><br>
                <strong>Aplicações no Navio:</strong> Bombas de água de resfriamento, Ventiladores do sistema HVAC, Bombas de lastro e porão, Compressores de ar.
                <br><br>
                <strong>Benefícios:</strong> Economia de energia até 60%, Redução de manutenção, Controle preciso.
                <br><br>
                <strong>Produto WEG:</strong> CFW11 / CFW500 (uso naval)
                <br><br>
                <strong>Curiosidade:</strong> Reduzem consumo em aplicações com carga variável.
            `
        }
    }
];

// ============= FUNÇÕES DE CRIAÇÃO DO CENÁRIO =============
function createSky() {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);

    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x0077ff) },
            bottomColor: { value: new THREE.Color(0xffffff) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        },

        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,

        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;

            void main() {
                float h = normalize(vWorldPosition + offset).y;

                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,

        side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

function createClouds() {
    const cloudGroup = new THREE.Group();

    for (let i = 0; i < 25; i++) {
        const cloudGeometry = new THREE.SphereGeometry(3, 7, 7);

        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            emissive: 0xffffff,
            emissiveIntensity: 0.2
        });

        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

        cloud.position.set(
            Math.random() * 200 - 100,
            Math.random() * 30 + 40,
            Math.random() * 200 - 100
        );

        cloud.scale.set(
            Math.random() * 2 + 1,
            Math.random() * 0.5 + 0.5,
            Math.random() * 2 + 1
        );

        cloudGroup.add(cloud);
    }
   
    scene.add(cloudGroup);
}

function createSun() {
    const sunPosition = new THREE.Vector3(100, 100, -100);
    
    const sunGeometry = new THREE.CircleGeometry(8, 100);
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Gradiente radial do centro para as bordas (efeito esfera)
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#ffff99');    // Centro mais claro
    gradient.addColorStop(0.5, '#ffff00');  // Meio amarelo vivo
    gradient.addColorStop(0.8, '#ffcc00');  // Bordas mais escuras
    gradient.addColorStop(1, '#ff9900');    // Extremidade alaranjada
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    const gradientTexture = new THREE.CanvasTexture(canvas);
    
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: gradientTexture,
        emissive: 0xffff00,
        emissiveIntensity: 0.8,
        side: THREE.DoubleSide
    });

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(sunPosition);
    scene.add(sun);

    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
        'rosto_sol.png',
        
        function(texture) {
            console.log('Textura do rosto carregada com sucesso!');
            
            const faceGeometry = new THREE.CircleGeometry(7.5, 64);
            const faceMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                opacity: 0.9
            });

            const face = new THREE.Mesh(faceGeometry, faceMaterial);
            face.position.copy(sunPosition);
            face.position.z += 0.1;
            
            scene.add(face);
            
            console.log('Rosto adicionado ao sol!');
        },
        
        function(xhr) {
            console.log('Carregando textura: ' + (xhr.loaded / xhr.total * 100).toFixed(0) + '%');
        },
        
        function(error) {
            console.error('Erro ao carregar a textura:', error);
        }
    );

    for (let i = 0; i < 3; i++) {
        const glowGeometry = new THREE.CircleGeometry(12 + i * 2, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.15 - i * 0.04,
            side: THREE.DoubleSide
        });

        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(sunPosition);
        glow.position.z -= 0.1 + i * 0.05;
        scene.add(glow);
    }
}

function createEnhancedWater() {
    const waterGeometry = new THREE.PlaneGeometry(500, 500, 128, 128);

    const positions = waterGeometry.attributes.position;
    const originalPositions = [];

    for (let i = 0; i < positions.count; i++) {
        originalPositions.push({
            x: positions.getX(i),
            y: positions.getY(i),
            z: positions.getZ(i)
        });
    }

    waterGeometry.userData.originalPositions = originalPositions;

    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x006994,
        roughness: 0.3,
        metalness: 0.5,
        transparent: true,
        opacity: 0.9
    });

    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    water.receiveShadow = true;
    scene.add(water);
}

// ============= CARREGAMENTO DO KRAKEN =============
function loadKraken() {
    const loader = new THREE.GLTFLoader();

    loader.load(
        'kraken.glb',

        function(gltf) {
            console.log("Kraken carregado com sucesso!");
            const krakenModel = gltf.scene;

            const box = new THREE.Box3().setFromObject(krakenModel);
            const size = box.getSize(new THREE.Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z);
            const targetSize = 20;
            const scaleFactor = targetSize / maxDimension;

            krakenModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

            krakenModel.position.set(-80, -40, -150);
            krakenModel.rotation.y = Math.PI / 4;

            krakenModel.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(krakenModel);

            // Salva referências para animação
            const initialY = krakenModel.position.y;
            const initialRotation = krakenModel.rotation.y;

            krakenModel.userData.animate = function(elapsedTime) {
                krakenModel.position.y = initialY + Math.sin(elapsedTime * 0.3) * 0.8;
                krakenModel.rotation.y = initialRotation + Math.sin(elapsedTime * 0.2) * 0.1;
                krakenModel.rotation.z = Math.sin(elapsedTime * 0.25) * 0.05;
            };
        },

        function(xhr) {
            const percentComplete = (xhr.loaded / xhr.total * 100).toFixed(0);
            console.log('Carregando Kraken: ' + percentComplete + '%');
        },

        function(error) {
            console.error('Erro ao carregar o Kraken:', error);
            console.log('Verifique se o arquivo "kraken.glb" está na pasta correta.');
        }
    );
}

// ============= INICIALIZAÇÃO =============
function init() {
    console.log("Iniciando aplicação...");

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 50, 400);

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(0, 5, 25);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('ship-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 80;

    createSky();
    createSun();
    createEnhancedWater();
    loadKraken(); // KRAKEN ADICIONADO AQUI

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
    sunLight.position.set(100, 80, -100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x006994, 0.6);
    scene.add(hemisphereLight);

    const loader = new THREE.GLTFLoader();

    loader.load(
        'ship.glb',

        function(gltf) {
            console.log("Modelo carregado com sucesso!");
            shipModel = gltf.scene;

            const box = new THREE.Box3().setFromObject(shipModel);
            const size = box.getSize(new THREE.Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z);
            const targetSize = 15;
            const scaleFactor = targetSize / maxDimension;

            shipModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

            const center = box.getCenter(new THREE.Vector3());

            shipModel.position.x = -center.x * scaleFactor;
            shipModel.position.y = -center.y * scaleFactor + 2.5;
            shipModel.position.z = -center.z * scaleFactor;

            shipModel.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(shipModel);
            createHotspots();
        },

        function(xhr) {
            const percentComplete = (xhr.loaded / xhr.total * 100).toFixed(0);
            console.log('Carregando modelo: ' + percentComplete + '%');
        },

        function(error) {
            console.error('Erro ao carregar o modelo 3D:', error);
            alert('Falha ao carregar o modelo 3D.\n\nVerifique:\n1. O arquivo "ship.glb" está na mesma pasta?\n2. Você está usando um servidor local?\n3. O caminho do arquivo está correto?');
        }
    );

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('click', onHotspotClick, false);
}

// ============= GESTÃO DOS HOTSPOTS =============
function createHotspots() {
    console.log("Criando " + hotspotsData.length + " hotspots...");

    hotspotsData.forEach(function(data, index) {
        const element = document.createElement('div');
        element.className = 'hotspot';
        element.id = 'hotspot-' + index;
        element.dataset.index = index;
        element.title = data.name;

        document.getElementById('ship-container').appendChild(element);

        data.element = element;
        data.point3D = new THREE.Object3D();
        data.point3D.position.set(data.position.x, data.position.y, data.position.z);
        scene.add(data.point3D);
    });
}

// ============= LÓGICA DO MODAL =============
function onHotspotClick(event) {
    const target = event.target;

    if (target.classList.contains('hotspot')) {
        const index = parseInt(target.dataset.index);
        const data = hotspotsData[index];

        document.getElementById('modal-title').innerText = data.content.title;
        document.getElementById('modal-body').innerHTML = data.content.body;
        document.getElementById('info-modal').style.display = 'block';

        console.log('Abrindo modal: ' + data.name);
    }
}

const modal = document.getElementById('info-modal');
const closeButton = document.querySelector('.close-button');

closeButton.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// ============= ANIMAÇÃO E POSICIONAMENTO =============
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (water) {
        const positions = water.geometry.attributes.position;
        const originalPositions = water.geometry.userData.originalPositions;

        for (let i = 0; i < positions.count; i++) {
            const x = originalPositions[i].x;
            const y = originalPositions[i].y;
            const wave1 = Math.sin(x * 0.3 + elapsedTime * 0.6) * 0.4;
            const wave2 = Math.cos(y * 0.3 + elapsedTime * 0.6) * 0.3;
            const wave3 = Math.sin((x + y) * 0.2 + elapsedTime) * 0.2;

            positions.setZ(i, wave1 + wave2 + wave3);
        }

        positions.needsUpdate = true;
        water.geometry.computeVertexNormals();
    }

    if (shipModel) {
        const swayAmount = 0.05;
        const swaySpeed = 0.8;

        shipModel.rotation.z = Math.sin(elapsedTime * swaySpeed) * swayAmount;
        shipModel.rotation.x = Math.cos(elapsedTime * swaySpeed * 0.7) * swayAmount * 0.5;

        const currentBaseY = shipModel.userData.baseY || shipModel.position.y;

        if (!shipModel.userData.baseY) {
            shipModel.userData.baseY = shipModel.position.y;
        }

        shipModel.position.y = currentBaseY + Math.sin(elapsedTime * swaySpeed) * 0.15;
    }

    // ANIMAÇÃO DO KRAKEN
    scene.traverse(function(object) {
        if (object.userData.animate) {
            object.userData.animate(elapsedTime);
        }
    });

    controls.update();
    renderer.render(scene, camera);
    updateHotspotsPosition();
}

function updateHotspotsPosition() {
    hotspotsData.forEach(function(data) {
        if (!data.point3D || !data.element) return;

        const vector = data.point3D.position.clone().project(camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

        if (vector.z < 1) {
            data.element.style.display = 'block';
            data.element.style.left = (x - 10) + 'px';
            data.element.style.top = (y - 10) + 'px';

        } else {
            data.element.style.display = 'none';
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============= INICIA A APLICAÇÃO =============
window.addEventListener('DOMContentLoaded', function() {
    init();
    animate();
    console.log("Aplicação iniciada com paisagem imersiva!");
});