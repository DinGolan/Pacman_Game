/***********/
/* Game.js */
/***********/
'use strict';

// Global Variables //
const SIZE       = 10;
const POINT      = 1;
const WALL       = '&#8251;';
const FOOD       = '&middot;';
const SUPER_FOOD = '⭐';
const CHERRY     = '🍒';

var gBoard              = null;
var gGeneratedFoodCount = null;
var gEatenFoodCount     = null;
var gCherryInterval     = null;

const gGame = {
	score: 0,
	isOn: false
};

// Sounds //
const gAudioEat      = new Audio('sound/eat.mp3');
const gAudioCherry   = new Audio('sound/cherry.mp3');
const gAudioGameOver = new Audio('sound/game-over.mp3');
const gAudioVictory  = new Audio('sound/victory.mp3');

function init() {
    resetGameState();

    gBoard = buildBoard();

    createGhosts(gBoard);
    renderBoard(gBoard, '.board-container');

    createPacman(gBoard);

    gCherryInterval = setInterval(addRandomCherry, M_SECONDS * 15, gBoard);
    gGame.isOn = true;
}

function resetGameState() {
    resetIntervals();
    resetVariables();
    resetUI();
}

function resetIntervals() {
    if (gGhostInterval) {
        clearInterval(gGhostInterval);
        gGhostInterval = null;
    }

    if (gCherryInterval) {
        clearInterval(gCherryInterval);
        gCherryInterval = null;
    }

    if (gSuperTimeout) {
        clearTimeout(gSuperTimeout);
        gSuperTimeout = null;
    }
}

function resetVariables() {
    gEatenFoodCount     = 0;
    gGeneratedFoodCount = 0;

    gGame.score  = 0;
    gGhosts      = [];
    gGhostColors = [];
    gDeadGhosts  = [];
    gPacman      = null;
}

function resetUI() {
    const elEndScreen   = document.querySelector('.game-end-screen');
    const elGameOverMsg = document.querySelector('.game-over-msg');
    const elVictoryMsg  = document.querySelector('.victory-msg');

    elEndScreen.classList.add('hidden');
    elGameOverMsg.classList.add('hidden');
    elVictoryMsg.classList.add('hidden');
}

function buildBoard() {
    const board = [];

    for (let i = 0; i < SIZE; i++) {
        let row = [];
        board.push(row);

        for (let j = 0; j < SIZE; j++) {
            if (isSuperFood(i, j)) {
                board[i][j] = SUPER_FOOD;
            }
            else if (isWall(i, j)) {
                board[i][j] = WALL;
            } 
            else {
                board[i][j] = FOOD;
                gGeneratedFoodCount++;
            }
        }
    }

    return board;
};

function isSuperFood(i, j) {
    return (i === 1 && j === 1)        ||
           (i === 1 && j === SIZE - 2) ||
           (i === SIZE - 2 && j === 1) ||
           (i === SIZE - 2 && j === SIZE - 2);
}

/** 
 * Explanations :
 * - Vertical wall in column 3, from row 5 up to the second-to-last row.
 * - Used to create a central vertical barrier in the board layout.
 **/
function isWall(i, j) {
    if (i === 0 || i === SIZE - 1 || j === 0 || j === SIZE - 1) {
        return true;
    }
    
    if ((i > 4 && i < SIZE - 2) && (j === 3)) {
        return true;
    }

    return false;
}

function addRandomCherry(board) {
    if (!gGame.isOn || !gPacman) return;

    const randPos = getEmptyRandomFoodCell(board);
    if (!randPos) return;

    if (board[randPos.i][randPos.j] === FOOD) {
        gGeneratedFoodCount--;
    }

    board[randPos.i][randPos.j] = CHERRY;
    renderCell(randPos, CHERRY);
}

function updateScore(points) {
    // Model //
    gGame.score += points;

    // DOM //
    const elScore     = document.querySelector('.score span');
    elScore.innerText = gGame.score;
}

function getEmptyRandomFoodCell(board) {
    const ROWS = board.length;
    const COLS = board[0].length;
    const emptyCells = [];

    for (let i = 0; i < ROWS - 1; i++) {
        for (let j = 0; j < COLS - 1; j++) {
            const cellContent = board[i][j];
            if (cellContent === FOOD || cellContent === EMPTY) {
                emptyCells.push({ i: i, j: j });
            }
        }
    }

    if (!emptyCells.length) return null;

    const randIdx = getRandomIntInclusive(0, emptyCells.length - 1);
    return emptyCells[randIdx];
}

function onRestartGame() {
    init();
}

function gameOver(type) {
    gGame.isOn = false;
    resetIntervals();
    showGameEndScreen(type);
}

function showGameEndScreen(type) {
    const elEndScreen   = document.querySelector('.game-end-screen');
    const elGameOverMsg = document.querySelector('.game-over-msg');
    const elVictoryMsg  = document.querySelector('.victory-msg');
    const elButton      = document.querySelector('.btn-play-again');

    elEndScreen.classList.remove('hidden');
    elButton.classList.remove('victory-button', 'gameover-button');

    if (type === 'Game Over') {
        elGameOverMsg.classList.remove('hidden');
        elVictoryMsg.classList.add('hidden');
        elButton.classList.add('gameover-button');
        gAudioGameOver.play();
    } 
    else if (type === 'Victory') {
        elGameOverMsg.classList.add('hidden');
        elVictoryMsg.classList.remove('hidden');
        elButton.classList.add('victory-button');
        gAudioVictory.play();
    }
}