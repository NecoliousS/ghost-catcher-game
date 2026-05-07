const GRID_SIZE = 10;
let grid = [];
let playerPos = { x: 0, y: 0 };
let ghosts = [];
let exitPos = { x: 0, y: 0 };
let walls = [];
let moves = 0;
let currentDifficulty = 'easy';
let gameActive = false;

const levels = {
    easy: {
        walls: [
            [1,1],[1,2],[1,3],[2,1],[3,1],
            [5,5],[5,6],[5,7],[6,5],[7,5],
            [3,8],[4,8],[5,8],
            [8,2],[8,3],[8,4]
        ],
        ghosts: [{x: 7, y: 2}, {x: 2, y: 7}],
        player: {x: 0, y: 0},
        exit: {x: 9, y: 9}
    },
    medium: {
        walls: [
            [1,1],[1,2],[1,3],[1,4],[2,1],[3,1],[4,1],
            [3,3],[3,4],[3,5],[4,3],[5,3],
            [5,5],[5,6],[5,7],[6,5],[7,5],[8,5],
            [2,7],[2,8],[3,7],[4,7],
            [7,2],[7,3],[8,2],
            [6,8],[7,8],[8,8],[8,7]
        ],
        ghosts: [{x: 6, y: 2}, {x: 2, y: 6}, {x: 7, y: 7}],
        player: {x: 0, y: 0},
        exit: {x: 9, y: 9}
    },
    hard: {
        walls: [
            [1,1],[1,2],[1,3],[1,4],[1,5],[2,1],[3,1],[4,1],[5,1],
            [2,3],[2,4],[3,3],[4,3],
            [3,5],[3,6],[4,5],[5,5],[6,5],
            [5,3],[6,3],[7,3],[8,3],
            [6,7],[6,8],[7,6],[7,7],[8,6],
            [1,7],[1,8],[2,7],[2,8],
            [4,8],[5,8],[5,7],
            [8,1],[8,2],[9,1],
            [7,9],[8,9],[9,8]
        ],
        ghosts: [{x: 4, y: 2}, {x: 2, y: 5}, {x: 6, y: 6}, {x: 8, y: 8}],
        player: {x: 0, y: 0},
        exit: {x: 9, y: 9}
    }
};

// DOM elements
const menuEl = document.getElementById('menu');
const gameAreaEl = document.getElementById('gameArea');
const gridEl = document.getElementById('grid');
const levelBadgeEl = document.getElementById('levelBadge');
const movesCountEl = document.getElementById('movesCount');
const gameMessageEl = document.getElementById('gameMessage');

// Button event listeners
document.getElementById('btnEasy').addEventListener('click', function() {
    startGame('easy');
});

document.getElementById('btnMedium').addEventListener('click', function() {
    startGame('medium');
});

document.getElementById('btnHard').addEventListener('click', function() {
    startGame('hard');
});

document.getElementById('btnUp').addEventListener('click', function() {
    movePlayer('up');
});

document.getElementById('btnDown').addEventListener('click', function() {
    movePlayer('down');
});

document.getElementById('btnLeft').addEventListener('click', function() {
    movePlayer('left');
});

document.getElementById('btnRight').addEventListener('click', function() {
    movePlayer('right');
});

document.getElementById('btnRestart').addEventListener('click', function() {
    restartGame();
});

document.getElementById('btnBack').addEventListener('click', function() {
    backToMenu();
});

function startGame(difficulty) {
    currentDifficulty = difficulty;
    const level = levels[difficulty];
    
    // Reset state
    grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j] = 'empty';
        }
    }
    
    playerPos = { x: level.player.x, y: level.player.y };
    ghosts = [];
    for (let i = 0; i < level.ghosts.length; i++) {
        ghosts.push({ x: level.ghosts[i].x, y: level.ghosts[i].y });
    }
    exitPos = { x: level.exit.x, y: level.exit.y };
    walls = [];
    for (let i = 0; i < level.walls.length; i++) {
        walls.push([level.walls[i][0], level.walls[i][1]]);
    }
    moves = 0;
    gameActive = true;

    // Place walls
    for (let i = 0; i < walls.length; i++) {
        const x = walls[i][0];
        const y = walls[i][1];
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            grid[x][y] = 'wall';
        }
    }

    // Place exit
    grid[exitPos.x][exitPos.y] = 'exit';

    // Update UI
    menuEl.style.display = 'none';
    gameAreaEl.classList.add('active');
    levelBadgeEl.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    movesCountEl.textContent = moves;
    gameMessageEl.textContent = '';
    gameMessageEl.className = 'game-message';

    renderGrid();
}

function renderGrid() {
    gridEl.innerHTML = '';

    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (playerPos.x === x && playerPos.y === y) {
                cell.classList.add('cell-player');
                cell.textContent = 'P';
            } else if (ghosts.some(function(g) { return g.x === x && g.y === y; })) {
                cell.classList.add('cell-ghost');
                cell.textContent = 'G';
            } else if (exitPos.x === x && exitPos.y === y) {
                cell.classList.add('cell-exit');
                cell.textContent = 'E';
            } else if (grid[x][y] === 'wall') {
                cell.classList.add('cell-wall');
                cell.textContent = 'W';
            } else {
                cell.classList.add('cell-empty');
            }

            gridEl.appendChild(cell);
        }
    }
}

function movePlayer(direction) {
    if (!gameActive) return;

    let newX = playerPos.x;
    let newY = playerPos.y;

    if (direction === 'up') {
        newX--;
    } else if (direction === 'down') {
        newX++;
    } else if (direction === 'left') {
        newY--;
    } else if (direction === 'right') {
        newY++;
    }

    // Check bounds
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        showMessage('Cannot move there!', 'info');
        return;
    }

    // Check wall
    if (grid[newX][newY] === 'wall') {
        showMessage('That is a wall!', 'info');
        return;
    }

    // Move player
    playerPos.x = newX;
    playerPos.y = newY;
    moves++;
    movesCountEl.textContent = moves;

    // Move ghosts
    moveGhosts();

    // Check win
    if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
        gameActive = false;
        showMessage('You escaped! You win!', 'win');
        renderGrid();
        return;
    }

    // Check lose
    if (ghosts.some(function(g) { return g.x === playerPos.x && g.y === playerPos.y; })) {
        gameActive = false;
        showMessage('A ghost caught you! Game Over!', 'lose');
        renderGrid();
        return;
    }

    renderGrid();
}

function moveGhosts() {
    for (let i = 0; i < ghosts.length; i++) {
        const ghost = ghosts[i];
        const dx = playerPos.x - ghost.x;
        const dy = playerPos.y - ghost.y;
        let possibleMoves = [];

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) possibleMoves.push({x: ghost.x + 1, y: ghost.y});
            if (dx < 0) possibleMoves.push({x: ghost.x - 1, y: ghost.y});
            if (dy > 0) possibleMoves.push({x: ghost.x, y: ghost.y + 1});
            if (dy < 0) possibleMoves.push({x: ghost.x, y: ghost.y - 1});
        } else {
            if (dy > 0) possibleMoves.push({x: ghost.x, y: ghost.y + 1});
            if (dy < 0) possibleMoves.push({x: ghost.x, y: ghost.y - 1});
            if (dx > 0) possibleMoves.push({x: ghost.x + 1, y: ghost.y});
            if (dx < 0) possibleMoves.push({x: ghost.x - 1, y: ghost.y});
        }

        let moved = false;
        for (let j = 0; j < possibleMoves.length; j++) {
            const move = possibleMoves[j];
            if (isValidGhostMove(move.x, move.y, ghost)) {
                ghost.x = move.x;
                ghost.y = move.y;
                moved = true;
                break;
            }
        }

        if (!moved) {
            const allMoves = [
                {x: ghost.x + 1, y: ghost.y},
                {x: ghost.x - 1, y: ghost.y},
                {x: ghost.x, y: ghost.y + 1},
                {x: ghost.x, y: ghost.y - 1}
            ];
            for (let j = 0; j < allMoves.length; j++) {
                const move = allMoves[j];
                if (isValidGhostMove(move.x, move.y, ghost)) {
                    ghost.x = move.x;
                    ghost.y = move.y;
                    break;
                }
            }
        }
    }
}

function isValidGhostMove(x, y, currentGhost) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    if (grid[x][y] === 'wall') return false;
    if (x === exitPos.x && y === exitPos.y) return false;
    for (let i = 0; i < ghosts.length; i++) {
        if (ghosts[i] !== currentGhost && ghosts[i].x === x && ghosts[i].y === y) {
            return false;
        }
    }
    return true;
}

function showMessage(text, type) {
    gameMessageEl.textContent = text;
    gameMessageEl.className = 'game-message message-' + type;
}

function restartGame() {
    startGame(currentDifficulty);
}

function backToMenu() {
    gameAreaEl.classList.remove('active');
    menuEl.style.display = 'block';
    gameActive = false;
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
    if (!gameActive) return;
    
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        movePlayer('up');
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        movePlayer('down');
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        movePlayer('left');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        movePlayer('right');
    }
});
