import * as THREE from './three.js/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Функция для создания ёлочки
function createTree() {
    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });

    // Создаем ствол
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = -2; // Опустим ствол ниже
    scene.add(trunk);

    // Создаем ветви ёлки
    const branchCount = 5; // Количество уровней ветвей
    const baseHeight = 0.5; // Фиксированная высота каждой ветви
    const heightIncrement = 0.5; // Увеличение высоты для каждой следующей ветви

    for (let i = 0; i < branchCount; i++) {
        const height = baseHeight; // Высота каждой ветви фиксирована
        const radius = 1.5 - i * 0.3; // Радиус каждой ветви (уменьшаем к верху)

        // Создаем конус
        const geometry = new THREE.ConeGeometry(radius, height, 8);
        const treePart = new THREE.Mesh(geometry, treeMaterial);
        
        // Устанавливаем позицию каждой ветви
        treePart.position.y = -1 + (i * heightIncrement); // Поднимаем каждую ветвь выше предыдущей
        scene.add(treePart);
    }
}

// Создание текстурированного снега
function createSnowGround() {
    const snowTextureLoader = new THREE.TextureLoader();
    const snowTexture = snowTextureLoader.load('./data/textures/1caba4af8810ec4796dfac8eab2c0119.jpg'); // Замените на путь к вашей текстуре

    const snowMaterial = new THREE.MeshBasicMaterial({ map: snowTexture });
    const snowGeometry = new THREE.PlaneGeometry(300, 300); // Размер плоскости

    const snowGround = new THREE.Mesh(snowGeometry, snowMaterial);
    snowGround.rotation.x = -Math.PI / 2; // Поворачиваем плоскость горизонтально
    snowGround.position.y = -2.5; // Устанавливаем ниже ёлочки
    scene.add(snowGround);
}

// Создаем огни
function createColorIterator(colors) {
    let index = 0; // Хранит текущий индекс цвета
    return function() {
        const color = colors[index]; // Получаем текущий цвет
        index = (index + 1) % colors.length; // Увеличиваем индекс и сбрасываем его при необходимости
        return color; // Возвращаем цвет
    };
}

function createLights() {
    const lightGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const lightPositions = []; // Массив для хранения позиций огней

    // Определяем позиции огней на ветвях
    const branchCount = 5; // Количество уровней ветвей
    const radiusStep = 1.48; // Начальный радиус для первой ветви
    const heightStep = 0.55; // Высота между ветвями
    const lightsPerBranch = 16; // Количество огней на каждой ветви

    // Массив цветов для огней
    const colors = [
        0x00FF00, // ярко-зелёный
        0xFF0000, // ярко-красный
        0x0000FF, // ярко-синий
        0xFFFF00, // жёлтый
        0x800080  // фиолетовый
    ];

    const getNextColor = createColorIterator(colors); // Создаем итератор цветов

    for (let i = 0; i < branchCount; i++) {
        const radius = radiusStep - i * 0.33; // Уменьшаем радиус для более плотного расположения
        const yPosition = -1 + (i * heightStep); // Высота текущей ветви

        // Определяем фиксированные позиции для огней
        for (let j = 0; j < lightsPerBranch; j++) {
            const angle = (j / lightsPerBranch) * Math.PI * 2; // Угол для равномерного распределения
            const xPosition = radius * Math.cos(angle); // X-координата
            const zPosition = radius * Math.sin(angle); // Z-координата

            lightPositions.push({ x: xPosition, y: yPosition - heightStep / 2, z: zPosition }); // Смещаем Y вниз на половину высоты ветви
        }
    }

    // Создаем огни на определенных позициях с цветами из списка
    lightPositions.forEach(position => {
        const lightMaterial = new THREE.MeshBasicMaterial({ color: getNextColor() }); // Получаем цвет от итератора
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        
        light.position.set(position.x, position.y, position.z);
        scene.add(light);

        // Функция для смены цвета огня
        function changeColor() {
            const newColor = getNextColor(); // Получаем новый цвет от итератора
            light.material.color.set(newColor); // Устанавливаем новый цвет огня
        }

        setInterval(changeColor, 1000); // Меняем цвет каждые 1000 мс (1 секунда)
    });
}

// Создание эффекта снежной бури с помощью частиц
function createSnowstorm() {
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3); // X, Y, Z для каждой частицы

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10; // Генерация случайных координат частиц в диапазоне [-5, +5]
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Загрузка текстуры снежинки
    const snowflakeTextureLoader = new THREE.TextureLoader();
    const snowflakeTexture = snowflakeTextureLoader.load('./data/textures/ice-pngrepo-com_white.png'); // Замените на путь к вашей текстуре

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.07,
        map: snowflakeTexture,
        alphaTest: 0.5, // Устанавливаем альфа-тест для прозрачности
        transparent: true // Делаем материал прозрачным
    });
    
    const particlesSystem = new THREE.Points(particlesGeometry, particleMaterial);
    
    scene.add(particlesSystem);

    function animateParticles() {
        particlesSystem.rotation.y += 0.001; // Плавная анимация вращения частиц
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i + 1] -= Math.random() * 0.02; // Движение частиц вниз
            
            if (positions[i + 1] < -3) { 
                positions[i + 1] = Math.random() * 4 + 2; // Возвращаем частицы в верхнюю часть сцены после выхода за пределы
            }
        }

        particlesGeometry.attributes.position.needsUpdate = true;

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

// Создаем снежинки
function createSnowflakes() {
    const snowflakeGeometry = new THREE.CircleGeometry(0.01, 6);
    
    for (let i = 0; i < 400; i++) {
        const snowflakeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const snowflake = new THREE.Mesh(snowflakeGeometry, snowflakeMaterial);

        snowflake.position.set(Math.random() * 60 - 30, Math.random() * 4 + 2, Math.random() * -1);
        scene.add(snowflake);

        // Анимация снежинок
        function fall() {
            if (snowflake.position.y > -2) {
                snowflake.position.y -= Math.random() * 0.01;
                requestAnimationFrame(fall);
            } else {
                snowflake.position.y = Math.random() * 4 + 2;
                requestAnimationFrame(fall);
            }
        }
        
        fall();
    }
}

// Инициализация сцены
createTree();
createSnowGround(); // Добавляем снег на землю
createLights();
createSnowstorm(); // Добавляем эффект снежной бури
createSnowflakes();

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
