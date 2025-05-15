/*************/
/* Pacman.js */
/*************/
'use strict';

const EMPTY  = '';
const PACMAN = '🧐';

var gPacman       = null;
var gSuperTimeout = null;

function createPacman(board) {
    const pacmanPos = getEmptyRandomFoodCell(board);
    if (!pacmanPos) return;

    if (board[pacmanPos.i][pacmanPos.j] === FOOD) {
        gGeneratedFoodCount--;
    }

    gPacman = {
        currPosition: pacmanPos,
        currFacing: 'left',
        isSuper: false
    };

    board[gPacman.currPosition.i][gPacman.currPosition.j] = PACMAN;
    renderCell(gPacman.currPosition, getPacmanHTML());
}

function movePacman(eventKeyBoard) {
    if (!gGame.isOn || !gPacman) return;

    const nextPacmanPosition = getNextPacmanLocation(eventKeyBoard);
    if (nextPacmanPosition.i < 0 || nextPacmanPosition.i >= SIZE ||
        nextPacmanPosition.j < 0 || nextPacmanPosition.j >= SIZE) return;

    const nextCellContent = gBoard[nextPacmanPosition.i][nextPacmanPosition.j];

    if (nextCellContent === WALL) return;

    let isGameOver = handleGhostCollision(nextPacmanPosition, nextCellContent);
    if (isGameOver) return;

    let isPacmanSuper = handleSuperFood(nextCellContent);
    if (isPacmanSuper) {
        isGameOver = handleFood(nextCellContent); // Check for food completion even during super mode   //
        if (isGameOver) return;                    
        return;                                   // Stop further movement, do not eat SUPER_FOOD again //
    }

    handleCherry(nextCellContent);

    isGameOver = handleFood(nextCellContent);
    if (isGameOver) return;

    updatePacmanPosition(nextPacmanPosition);
}

function getNextPacmanLocation(eventKeyBoard) {
    var nextPacmanPosition = {
        i: gPacman.currPosition.i,
        j: gPacman.currPosition.j
    };

    switch (eventKeyBoard.key) {
        case 'ArrowUp':
            nextPacmanPosition.i -= 1;
            gPacman.currFacing    = 'up';
            break;

        case 'ArrowDown':
            nextPacmanPosition.i += 1;
            gPacman.currFacing    = 'down';
            break;

        case 'ArrowLeft':
            nextPacmanPosition.j -= 1;
            gPacman.currFacing    = 'left';
            break;
        
        case 'ArrowRight':
            nextPacmanPosition.j += 1;
            gPacman.currFacing    = 'right';
            break;
    }

    return nextPacmanPosition;
}

function handleGhostCollision(nextPacmanPosition, nextCellContent) {
    if (nextCellContent === GHOST) {
        if (gPacman.isSuper) {
            removeGhost(nextPacmanPosition);
        } else {
            gameOver('Game Over');
            return true;
        }
    }

    return false;
}

function handleSuperFood(nextCellContent) {
    if (nextCellContent === SUPER_FOOD) {
        if (gPacman.isSuper) return true;

        gPacman.isSuper = true;
        setGhostsToEdible();

        if (gSuperTimeout) clearTimeout(gSuperTimeout);
        gSuperTimeout = setTimeout(() => {
            gPacman.isSuper = false;
            reviveGhosts();
            renderCell(gPacman.currPosition, getPacmanHTML()); // Update Pacman's image after super mode ends //
        }, M_SECONDS * 5);
    }

    return false;
}

function handleCherry(nextCellContent) {
    if (nextCellContent === CHERRY) {
        updateScore(POINT * 10);
        gAudioCherry.play();
    }
}

function handleFood(nextCellContent) {
    if (nextCellContent === FOOD) {
        updateScore(POINT);
        gEatenFoodCount++;
        gAudioEat.play();

        if (gEatenFoodCount >= gGeneratedFoodCount) {
            gameOver('Victory');
            return true;
        }
    }

    return false;
}

function updatePacmanPosition(nextPacmanPosition) {
    // Remove the Previous Content //
    gBoard[gPacman.currPosition.i][gPacman.currPosition.j] = EMPTY;
    renderCell(gPacman.currPosition, EMPTY);

    // Update the Model (With new content) //
    gPacman.currPosition = nextPacmanPosition;
    gBoard[gPacman.currPosition.i][gPacman.currPosition.j] = PACMAN;

    // Update the DOM (With new content) //
    renderCell(gPacman.currPosition, getPacmanHTML());
}

function getPacmanHTML() {
    const direction = gPacman.currFacing;
    const state     = gPacman.isSuper ? 'super' : 'regular';
    const pacmanImg = `img/pacman_${state}_player_${direction}.jpg`;
    return `<img src="${pacmanImg}" class="pacman-img" />`;
}