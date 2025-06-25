document.addEventListener("DOMContentLoaded", function () {
    const cells = document.querySelectorAll('.cell');
    const statusDiv = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const aiBtn = document.getElementById('ai-btn');
    const humanBtn = document.getElementById('human-btn');
    const aivaiBtn = document.getElementById('aivai-btn');
    const modeStatusDiv = document.getElementById('mode-status');
    const aiAlgoSelect = document.getElementById('ai-algo-select');
    const aiTimerDiv = document.getElementById('ai-timer');

    let board = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;
    let mode = 'ai'; 

    const human = 'X';
    const ai = 'O';
    let aiAlgorithm = 'minimax'; 

    function checkWinner(b) {
        const winPatterns = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (const pattern of winPatterns) {
            const [a, b1, c] = pattern;
            if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
                // Return both winner and winning pattern
                return { winner: b[a], pattern };
            }
        }
        return b.includes('') ? null : { winner: 'draw', pattern: null };
    }

    function handleCellClick(e) {
        const idx = e.target.dataset.index;
        if (!gameActive || board[idx]) return;

        board[idx] = currentPlayer;
        e.target.textContent = currentPlayer;
        e.target.classList.add(currentPlayer.toLowerCase());

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
                    const start = performance.now();
                    let aiMove;
                    if (aiAlgorithm === 'minimax') {
                        aiMove = findBestMove(board);
                    } else {
                        aiMove = findBestMoveAlphaBeta(board);
                    }
                    const end = performance.now();
                    aiTimerDiv.textContent = `AI move time: ${(end - start).toFixed(2)} ms`;
                    board[aiMove] = ai;
                    cells[aiMove].textContent = ai;
                    cells[aiMove].classList.add(ai.toLowerCase());
                    const resultAfterAI = checkWinner(board);
                    if (resultAfterAI) {
                        endGame(resultAfterAI);
                    } else {
                        currentPlayer = human;
                        statusDiv.textContent = `Player ${human}'s turn`;
                    }
                }, 300);
            }
        } else if (mode === 'aivai') {
            setTimeout(aiVsAiTurn, 500);
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusDiv.textContent = `Player ${currentPlayer}'s turn`;
        }
    }

    function endGame(result) {
        gameActive = false;
        if (result.winner === 'draw') {
            statusDiv.textContent = "It's a draw!";
        } else {
            statusDiv.textContent = `Player ${result.winner} wins!`;
            if (result.pattern) {
                result.pattern.forEach(idx => {
                    cells[idx].classList.add('highlight');
                });
            }
        }
    }

    function resetGame() {
        board = Array(9).fill('');
        currentPlayer = 'X';
        gameActive = true;
        statusDiv.textContent = "Player X's turn";
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
            cell.classList.remove('highlight');
        });
        aiTimerDiv.textContent = "AI move time: -- ms";
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
        if (result) {
            if (result.winner === ai) return 10 - depth;
            if (result.winner === human) return depth - 10;
            if (result.winner === 'draw') return 0;
        }

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
        if (result) {
            if (result.winner === ai) return 10 - depth;
            if (result.winner === human) return depth - 10;
            if (result.winner === 'draw') return 0;
        }

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
        if (mode === 'ai') {
            modeStatusDiv.textContent = "Mode: Human vs AI";
        } else if (mode === 'human') {
            modeStatusDiv.textContent = "Mode: Human vs Human";
        } else if (mode === 'aivai') {
            modeStatusDiv.textContent = "Mode: AI vs AI";
            setTimeout(aiVsAiTurn, 500);
        }
    }

    function aiVsAiTurn() {
        if (!gameActive) return;
        const start = performance.now();
        let aiMove;
        if (aiAlgorithm === 'minimax') {
            aiMove = findBestMove(board);
        } else {
            aiMove = findBestMoveAlphaBeta(board);
        }
        const end = performance.now();
        aiTimerDiv.textContent = `AI move time: ${(end - start).toFixed(2)} ms`;
        board[aiMove] = currentPlayer;
        cells[aiMove].textContent = currentPlayer;
        cells[aiMove].classList.add(currentPlayer.toLowerCase());
        const result = checkWinner(board);
        if (result) {
            endGame(result);
            return;
        }
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDiv.textContent = `Player ${currentPlayer}'s turn`;
        setTimeout(aiVsAiTurn, 500);
    }

    // Set initial mode status on load
    modeStatusDiv.textContent = mode === 'ai' ? "Mode: Human vs AI" : "Mode: Human vs Human";

    // Randomize title colors and glow
    function getRandomColor() {
        const h = Math.floor(Math.random() * 360);
        const s = 70 + Math.floor(Math.random() * 30); // 70-100%
        const l = 50 + Math.floor(Math.random() * 20); // 50-70%
        return `hsl(${h},${s}%,${l}%)`;
    }
    function setTitleColorAndGlow(element) {
        if (!element) return;
        const color = getRandomColor();
        element.style.color = color;
        // Use a strong glow with the same color, plus a subtle black shadow
        element.style.textShadow = `0 0 18px ${color}, 2px 2px 8px rgba(0,0,0,0.25)`;
    }
    setTitleColorAndGlow(document.querySelector('.tic'));
    setTitleColorAndGlow(document.querySelector('.tac'));
    setTitleColorAndGlow(document.querySelector('.toe'));

    aiBtn.addEventListener('click', () => setMode('ai'));
    humanBtn.addEventListener('click', () => setMode('human'));
    aivaiBtn.addEventListener('click', () => setMode('aivai'));
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetGame);
    aiAlgoSelect.addEventListener('change', function () {
        aiAlgorithm = aiAlgoSelect.value;
    });
});
