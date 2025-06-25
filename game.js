document.addEventListener("DOMContentLoaded", function () {
    const cells = document.querySelectorAll('.cell');
    const statusDiv = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const aiBtn = document.getElementById('ai-btn');
    const humanBtn = document.getElementById('human-btn');
    const modeStatusDiv = document.getElementById('mode-status');
    const aiAlgoSelect = document.getElementById('ai-algo-select');

    let board = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;
    let mode = 'ai'; // default to AI mode

    const human = 'X';
    const ai = 'O';
    let aiAlgorithm = 'minimax'; // default

    function checkWinner(b) {
        const winPatterns = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (const pattern of winPatterns) {
            const [a, b1, c] = pattern;
            if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
                return b[a];
            }
        }
        return b.includes('') ? null : 'draw';
    }

    function handleCellClick(e) {
        const idx = e.target.dataset.index;
        if (!gameActive || board[idx]) return;

        board[idx] = currentPlayer;
        e.target.textContent = currentPlayer;

        const result = checkWinner(board);
        if (result) {
            endGame(result);
            return;
        }

        if (mode === 'ai') {
            if (currentPlayer === human) {
                currentPlayer = ai;
                statusDiv.textContent = "AI's turn";
                setTimeout(() => {
                    let aiMove;
                    if (aiAlgorithm === 'minimax') {
                        aiMove = findBestMove(board);
                    } else {
                        aiMove = findBestMoveAlphaBeta(board);
                    }
                    board[aiMove] = ai;
                    cells[aiMove].textContent = ai;
                    const resultAfterAI = checkWinner(board);
                    if (resultAfterAI) {
                        endGame(resultAfterAI);
                    } else {
                        currentPlayer = human;
                        statusDiv.textContent = `Player ${human}'s turn`;
                    }
                }, 300);
            }
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusDiv.textContent = `Player ${currentPlayer}'s turn`;
        }
    }

    function endGame(result) {
        gameActive = false;
        if (result === 'draw') {
            statusDiv.textContent = "It's a draw!";
        } else {
            statusDiv.textContent = `Player ${result} wins!`;
        }
    }

    function resetGame() {
        board = Array(9).fill('');
        currentPlayer = 'X';
        gameActive = true;
        statusDiv.textContent = "Player X's turn";
        cells.forEach(cell => cell.textContent = '');
    }

    function findBestMove(boardState) {
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = ai;
                let score = minimax(boardState, 0, false);
                boardState[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function minimax(b, depth, isMaximizing) {
        const result = checkWinner(b);
        if (result === ai) return 10 - depth;
        if (result === human) return depth - 10;
        if (result === 'draw') return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === '') {
                    b[i] = ai;
                    let score = minimax(b, depth + 1, false);
                    b[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === '') {
                    b[i] = human;
                    let score = minimax(b, depth + 1, true);
                    b[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function findBestMoveAlphaBeta(boardState) {
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = ai;
                let score = alphabeta(boardState, 0, false, -Infinity, Infinity);
                boardState[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function alphabeta(b, depth, isMaximizing, alpha, beta) {
        const result = checkWinner(b);
        if (result === ai) return 10 - depth;
        if (result === human) return depth - 10;
        if (result === 'draw') return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === '') {
                    b[i] = ai;
                    let score = alphabeta(b, depth + 1, false, alpha, beta);
                    b[i] = '';
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, bestScore);
                    if (beta <= alpha) break;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === '') {
                    b[i] = human;
                    let score = alphabeta(b, depth + 1, true, alpha, beta);
                    b[i] = '';
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, bestScore);
                    if (beta <= alpha) break;
                }
            }
            return bestScore;
        }
    }

    function setMode(newMode) {
        mode = newMode;
        resetGame();
        statusDiv.textContent = "Player X's turn";
        modeStatusDiv.textContent = mode === 'ai' ? "Mode: Human vs AI" : "Mode: Human vs Human";
    }

    // Set initial mode status on load
    modeStatusDiv.textContent = mode === 'ai' ? "Mode: Human vs AI" : "Mode: Human vs Human";

    aiBtn.addEventListener('click', () => setMode('ai'));
    humanBtn.addEventListener('click', () => setMode('human'));
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
    aiAlgoSelect.addEventListener('change', function () {
        aiAlgorithm = aiAlgoSelect.value;
    });
});
