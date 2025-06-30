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
    const playerPickContainer = document.getElementById('player-pick-container');
    const pickXBtn = document.getElementById('pick-x-btn');
    const pickOBtn = document.getElementById('pick-o-btn');

    let board = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;
    let mode = 'ai'; 
    let aiVsAiActive = false;

    let human = 'X';
    let ai = 'O';
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
        // Prevent clicks in AI vs AI mode or when it's AI's turn in Human vs AI mode
        if (!gameActive || mode === 'aivai' || (mode === 'ai' && currentPlayer === ai)) return;

        const idx = e.target.dataset.index;
        if (board[idx]) return;

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
                    setTimeout(() => { // <-- Add delay before AI move calculation
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
                    }, 300); // <-- 300ms delay before AI move calculation
                }, 0);
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
        aiVsAiActive = false;
        aiAlgoSelect.disabled = false; // Enable algorithm choice on reset
    }

    function findBestMove(boardState) {
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === '') {
                boardState[i] = ai;
                let score = minimax(boardState, 0, false, ai, human);
                boardState[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function minimax(b, depth, isMaximizing, aiPlayer, humanPlayer) {
        const result = checkWinner(b);
        if (result) {
            if (result.winner === aiPlayer) return 10 - depth;
            if (result.winner === humanPlayer) return depth - 10;
            if (result.winner === 'draw') return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === '') {
                    b[i] = aiPlayer;
                    let score = minimax(b, depth + 1, false, aiPlayer, humanPlayer);
                    b[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === '') {
                    b[i] = humanPlayer;
                    let score = minimax(b, depth + 1, true, aiPlayer, humanPlayer);
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
                let score = alphabeta(boardState, 0, false, -Infinity, Infinity, ai, human);
                boardState[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function alphabeta(b, depth, isMaximizing, alpha, beta, aiPlayer, humanPlayer) {
        const result = checkWinner(b);
        if (result) {
            if (result.winner === aiPlayer) return 10 - depth;
            if (result.winner === humanPlayer) return depth - 10;
            if (result.winner === 'draw') return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === '') {
                    b[i] = aiPlayer;
                    let score = alphabeta(b, depth + 1, false, alpha, beta, aiPlayer, humanPlayer);
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
                    b[i] = humanPlayer;
                    let score = alphabeta(b, depth + 1, true, alpha, beta, aiPlayer, humanPlayer);
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
        // Always reset human/ai to X/O for AI vs AI and Human vs Human
        if (mode === 'ai') {
            modeStatusDiv.textContent = "Mode: Human vs AI";
            aiVsAiActive = false;
            aiAlgoSelect.disabled = false;
            playerPickContainer.style.display = 'flex';
            // Do not force human/ai here, allow player to pick
        } else if (mode === 'human') {
            modeStatusDiv.textContent = "Mode: Human vs Human";
            aiVsAiActive = false;
            aiAlgoSelect.disabled = false;
            playerPickContainer.style.display = 'none';
            human = 'X';
            ai = 'O';
        } else if (mode === 'aivai') {
            modeStatusDiv.textContent = "Mode: AI vs AI";
            aiVsAiActive = true;
            aiAlgoSelect.disabled = true;
            playerPickContainer.style.display = 'none';
            human = 'X';
            ai = 'O';
            setTimeout(aiVsAiTurn, 500);
        }
    }

    function aiVsAiTurn() {
        if (!gameActive || !aiVsAiActive) return;
        setTimeout(() => {
            if (!aiVsAiActive) return;
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
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                statusDiv.textContent = `Player ${currentPlayer}'s turn`;
                aiVsAiTurn();
            }
        }, 500);
    }

    // --- Randomize title colors and matching glow ---
    function getRandomColorHSL() {
        const h = Math.floor(Math.random() * 360);
        const s = 70 + Math.floor(Math.random() * 30); // 70-100%
        const l = 50 + Math.floor(Math.random() * 20); // 50-70%
        return { h, s, l, hsl: `hsl(${h},${s}%,${l}%)` };
    }
    function setTitleColorAndGlow(element) {
        if (!element) return;
        const { h, s, l, hsl } = getRandomColorHSL();
        element.style.color = hsl;
        // Use a strong glow with the same hue, slightly lighter and more transparent
        const glow = `0 0 18px hsl(${h},${s}%,85%), 2px 2px 8px rgba(0,0,0,0.25)`;
        element.style.textShadow = glow;
    }
    setTitleColorAndGlow(document.querySelector('.tic'));
    setTitleColorAndGlow(document.querySelector('.tac'));
    setTitleColorAndGlow(document.querySelector('.toe'));

    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    resetBtn.addEventListener('click', resetGame);

    aiBtn.addEventListener('click', () => {
        setMode('ai');
        aiAlgorithm = aiAlgoSelect.value;
    });

    humanBtn.addEventListener('click', () => {
        setMode('human');
    });

    aivaiBtn.addEventListener('click', () => {
        setMode('aivai');
    });

    aiAlgoSelect.addEventListener('change', (e) => {
        aiAlgorithm = e.target.value;
        if (mode === 'ai') {
            resetGame();
            statusDiv.textContent = "Player X's turn";
        }
    });

    pickXBtn.addEventListener('click', function () {
        human = 'X';
        ai = 'O';
        resetGame();
        playerPickContainer.style.display = 'none';
    });

    pickOBtn.addEventListener('click', function () {
        human = 'O';
        ai = 'X';
        resetGame();
        playerPickContainer.style.display = 'none';
        // If AI is X, let AI start
        if (currentPlayer === ai && mode === 'ai') {
            statusDiv.textContent = "AI's turn";
            setTimeout(() => {
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
            }, 0);
        }
    });
});
