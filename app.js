
// Get DOM elements
const blackOverlay = document.getElementById('blackOverlay');
const crosshair = document.getElementById('crosshair');
const backgroundLayer = document.querySelector('.background-layer');
//Audio
// const Hit = new Audio('../Sounds/Team Fortress 2 Critical Hit sound effects.wav');

// Variables for scope positioning
let mouseX = 0;
let mouseY = 0;
let score = 0;
let shot = 5;
let reloading = false;
const maxTargets = 8;
const spawnIntervalMs = 1500;
const targetLifetimeMs = 10000;

let backgroundAudio;
let backgroundStarted = false;
let gameStarted = false;
let spawnInterval = null;
let timeRemaining = 30;
let timerInterval = null;

function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const maskPosition = `radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, transparent 100px, black 100px)`;
    blackOverlay.style.mask = maskPosition;
    
    crosshair.style.left = `${mouseX}px`;
    crosshair.style.top = `${mouseY}px`;
}

function handleShoot(){
    if (!gameStarted) return;

    if (!backgroundStarted && backgroundAudio) {
        backgroundAudio.play();
        backgroundStarted = true;
    }

    if (reloading) return; 
    
    if (shot <= 0) return; 

    shot -= 1;
    document.getElementById('shot').textContent = `Bullets left: ${shot}`;
    document.getElementById('reload').textContent = '';
    
    const prevPointer = blackOverlay.style.pointerEvents;
    blackOverlay.style.pointerEvents = 'none'; //sets the mouse pointer to "empty"
    const elementUnderCrosshair = document.elementFromPoint(mouseX, mouseY); //grabs the mouses position
    blackOverlay.style.pointerEvents = prevPointer || 'auto';

    if (elementUnderCrosshair && elementUnderCrosshair.classList && elementUnderCrosshair.classList.contains('target')) {
        const value = Number(elementUnderCrosshair.dataset.value) || 10;
        score += value;
        new Audio("../Sounds/Team Fortress 2 Critical Hit sound effects.wav").play();
        elementUnderCrosshair.remove();
        document.getElementById('score').textContent = `Score: ${score}`;
    }

    console.log("shoot");

    if (shot === 0) {
        reloading = true;
        //call reload sound
        new Audio("../Sounds/Reloading.wav").play();

        document.getElementById('shot').textContent = "Reloading...";
        document.getElementById('reload').textContent = `Reloading...`;
        setTimeout(() => {
            shot = 5;
            reloading = false;
            document.getElementById('shot').textContent = `Bullets left: ${shot}`;
            document.getElementById('reload').textContent = '';
        }, 2000);
    }
}

function spawnTarget() {
    if (!gameStarted) return;

    const currentTargets = document.querySelectorAll('.target').length;
    if (currentTargets >= maxTargets) return;


    const size = Math.floor(Math.random() * 50) + 30;
    const type = Math.random() < 0.5 ? 'circle' : 'square';
    const target = document.createElement('div');
    target.className = `target ${type}`;
    target.style.width = `${size}px`;
    target.style.height = `${size}px`;

    const x = Math.random() * (window.innerWidth - size);
    const y = Math.random() * (window.innerHeight - size);
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    const value = Math.max(5, Math.round((90 - size) / 5) * 5);
    target.dataset.value = value;
    backgroundLayer.appendChild(target);
    setTimeout(() => {
        if (document.body.contains(target)) target.remove();
    }, targetLifetimeMs);
}

function updateTimer() {
    timeRemaining--;
    document.getElementById('timer').textContent = `Time: ${timeRemaining}`;

    if (timeRemaining <= 0) {
        endGame();
    }
}

function endGame() {
    gameStarted = false;

    // Clear intervals
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Stop background audio
    if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
        backgroundStarted = false;
    }

    // Remove all remaining targets
    const targets = document.querySelectorAll('.target');
    targets.forEach(target => target.remove());

    // Show game over screen with final score
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function resetGame() {
    // Reset all variables
    score = 0;
    shot = 5;
    timeRemaining = 30;
    reloading = false;

    // Update UI
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('shot').textContent = `Bullets left: ${shot}`;
    document.getElementById('timer').textContent = `Time: ${timeRemaining}`;
    document.getElementById('reload').textContent = '';

    // Hide game over screen
    document.getElementById('gameOverScreen').classList.add('hidden');
}

function startGame() {
    gameStarted = true;

    // Hide start screen
    const startScreen = document.getElementById('startScreen');
    startScreen.classList.add('hidden');

    // Start spawning targets
    spawnInterval = setInterval(spawnTarget, spawnIntervalMs);

    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;

    backgroundAudio = new Audio("../Sounds/Background.wav");
    backgroundAudio.volume = 0.3;
    backgroundAudio.loop = true;

    const maskPosition = `radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, transparent 100px, black 100px)`;
    blackOverlay.style.mask = maskPosition;
    blackOverlay.style.webkitMask = maskPosition; // add for Safari

    crosshair.style.left = `${mouseX}px`;
    crosshair.style.top = `${mouseY}px`;

    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('shot').textContent = `Bullets left: ${shot}`;

    // Add click event listener to start button
    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', startGame);

    // Add click event listener to play again button
    const playAgainButton = document.getElementById('playAgainButton');
    playAgainButton.addEventListener('click', () => {
        resetGame();
        startGame();
    });
});


document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mousedown', handleShoot);