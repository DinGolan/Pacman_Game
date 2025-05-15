/************/
/* Utils.js */
/************/
'use strict';

function renderBoard(mat, selector) {
    const ROWS = mat.length;
    const COLS = mat[0].length;

    let strHTML = '<table><tbody>';
    
    for (let i = 0; i < ROWS; i++) {
        strHTML += '<tr>';
        
        for (let j = 0; j < COLS; j++) {
            const currCell  = mat[i][j];
            const className = `cell cell-${i}-${j}`;
            strHTML += `<td class="${className}">${currCell}</td>`;
        }

        strHTML += '</tr>';
    }

    strHTML += '</tbody></table>';

    const elContainer     = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function renderCell(position, value) {
    const elCell = document.querySelector(`.cell-${position.i}-${position.j}`);
    if (elCell.innerHTML !== value) elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) {
	const range = (max - min + 1);
    return Math.floor(Math.random() * range) + min;
}

function getRandomColor() {
    const SIZE    = 6;
    const RANGE   = 16;
    const letters = '0123456789ABCDEF';

    let color = undefined;

    do {
        color = '#';
        for (var i = 0; i < SIZE; i++) {
            color += letters[Math.floor(Math.random() * RANGE)];
        }
    } while (color === EATABLE_GHOST_COLOR);

    return color;
}