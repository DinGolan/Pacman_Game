/************/
/* Ghost.js */
/************/
'use strict';

const GHOST        = '&#9760';
const M_SECONDS    = 1000;
const GHOST_NUMBER = 3;
const EATABLE_GHOST_COLOR = '#7FDBFF';

var gGhosts        = [];
var gDeadGhosts    = [];
var gGhostColors   = [];
var gGhostInterval = null;

function createGhosts(board) {
    for (let i = 0; i < GHOST_NUMBER; i++) {
        createGhost(board);
    }

    gGhostInterval = setInterval(moveGhosts, M_SECONDS, board);
}

function createGhost(board) {
    const randPos = getEmptyRandomFoodCell(board);
    if (!randPos) return;

    const randomColor = getUniqueRandomColor();

    const ghost = {
        currPosition: randPos,
        prevCellContent: board[randPos.i][randPos.j],
        currColor: randomColor,
        originalColor: randomColor
    };

    gGhosts.push(ghost);
    board[ghost.currPosition.i][ghost.currPosition.j] = GHOST;
}

function moveGhosts(board) {
    for (let i = 0; i < gGhosts.length; i++) {
        moveGhost(gGhosts[i], board);
    }
}

function moveGhost(ghost, board) {
    const moveDiff = getMoveDiff();
    const nextPosition = {
        i: ghost.currPosition.i + moveDiff.i,
        j: ghost.currPosition.j + moveDiff.j
    };

    if (nextPosition.i < 0 || nextPosition.i >= SIZE ||
        nextPosition.j < 0 || nextPosition.j >= SIZE) return;

    const nextCellContent = board[nextPosition.i][nextPosition.j];
    if (nextCellContent === WALL || nextCellContent === GHOST) return;

    if (nextCellContent === PACMAN) {
        gameOver('Game Over');
        return;
    }

    // Remove the Previous Content //
    board[ghost.currPosition.i][ghost.currPosition.j] = ghost.prevCellContent;
    renderCell(ghost.currPosition, ghost.prevCellContent);

    // Update the Model (With new content) //
    ghost.currPosition    = nextPosition;
    ghost.prevCellContent = nextCellContent;
    board[ghost.currPosition.i][ghost.currPosition.j] = GHOST;

    // Update the DOM (With new content) //
    renderCell(ghost.currPosition, getGhostHTML(ghost));
}

function getMoveDiff() {
    const min     = 1;
    const max     = 4;
    const randNum = getRandomIntInclusive(min, max);

    switch(randNum) {
        case 1: return { i:  0, j:  1 }; // Right //
        case 2: return { i:  1, j:  0 }; // Down  //
        case 3: return { i:  0, j: -1 }; // Left  //
        case 4: return { i: -1, j:  0 }; // Up    //
    }
}

function getGhostHTML(ghost) {
    const style = `color: ${ghost.currColor}` + (gPacman.isSuper ? '; opacity: 0.6' : '');
    return `<span style="${style}">${GHOST}</span>`;
}

function getUniqueRandomColor() {
    let color = undefined;

    do {
        color = getRandomColor();
    } while(gGhostColors.includes(color));

    gGhostColors.push(color);

    return color;
}

function removeGhost(nextPacmanPosition) {
    for (let i = 0; i < gGhosts.length; i++) {
        const currGhost = gGhosts[i];

        if (currGhost.currPosition.i === nextPacmanPosition.i &&
            currGhost.currPosition.j === nextPacmanPosition.j) {
            const deadGhost = gGhosts.splice(i, 1)[0];
            gDeadGhosts.push(deadGhost);
            return;
        }
    }
}

function setGhostsToEdible() {
    for (let i = 0; i < gGhosts.length; i++) {
        const currGhost     = gGhosts[i];
        currGhost.currColor = EATABLE_GHOST_COLOR;
        renderCell(currGhost.currPosition, getGhostHTML(currGhost));
    }
}

function reviveGhosts() {    
    for (let i = 0; i < gDeadGhosts.length; i++) {
        const deadGhost = gDeadGhosts[i];
        gGhosts.push(deadGhost);
    }

    for (let i = 0; i < gGhosts.length; i++) {
        const currGhost     = gGhosts[i];
        currGhost.currColor = currGhost.originalColor;
        renderCell(currGhost.currPosition, getGhostHTML(currGhost));
    }

    // Clear the list of dead ghosts after reviving them to prevent duplicates on future revives //
    gDeadGhosts = [];
}