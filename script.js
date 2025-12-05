const gameState = {
    liberte: 50,
    eco: 50,
    budget: 1000,
    completed: []
};

const missions = {
    'admin': {
        path: "/Administration",
        msg: "ERREUR CRITIQUE : Support_Windows_10 terminé.\nSystème vulnérable aux failles.\nLe vendeur suggère : 'Tout Racheter'.\n\nCommande :",
        choices: [
            {
                label: "sudo apt-get install linux-mint (Gratuit/Libre)",
                impact: { lib: +30, eco: +20, bud: -50 },
                feedback: ">> INSTALLATION LINUX...\n>> SUCCÈS. Matériel existant optimisé. Données sécurisées.",
                status: "[SÉCURISÉ: LINUX]"
            },
            {
                label: "buy_win11.exe (-900€)",
                impact: { lib: -20, eco: -40, bud: -900 },
                feedback: ">> TRANSACTION TERMINÉE...\n>> ATTENTION: Budget critique. Déchets électroniques générés.",
                status: "[BLOATWARE]"
            }
        ],
        next: 'classe'
    },
    'classe': {
        path: "/Salles_de_Classe",
        msg: "DÉTECTION : Fuite de données via 'Google_Classroom'.\nVie privée des élèves compromise.\n\nContre-mesure :",
        choices: [
            {
                label: "connect_google.sh (Facile)",
                impact: { lib: -30, eco: 0, bud: 0 },
                feedback: ">> CONNEXION...\n>> ALERTE: Données envoyées hors UE. Souveraineté perdue.",
                status: "[DÉPENDANT]"
            },
            {
                label: "docker up nextcloud (Local/NIRD)",
                impact: { lib: +25, eco: +10, bud: -20 },
                feedback: ">> DÉPLOIEMENT CLOUD LOCAL...\n>> SUCCÈS. Données hébergées sur place.",
                status: "[SOUVERAIN]"
            }
        ],
        next: 'server'
    },
    'server': {
        path: "/La_Forge_Technique",
        msg: "SCAN : 50 unités de Matériel_2015 trouvées à la poubelle.\nMarquées 'Obsolètes' par le fabricant.\n\nAction :",
        choices: [
            {
                label: "rm -rf /trash/* (Jeter)",
                impact: { lib: 0, eco: -30, bud: -50 },
                feedback: ">> SUPPRESSION...\n>> ERREUR: Impact environnemental trop élevé.",
                status: "[GASPILLÉ]"
            },
            {
                label: "./club_jerry.sh (Réemploi)",
                impact: { lib: +15, eco: +35, bud: +0 },
                feedback: ">> RÉPARATION...\n>> SUCCÈS. PC réparés.",
                status: "[RECYCLÉ]"
            }
        ],
        next: 'finish'
    }
};

function updateHUD() {
    const getBar = (val) => {
        let filled = Math.max(0, Math.min(10, Math.round(val / 10)));
        return "#".repeat(filled) + "-".repeat(10 - filled);
    };
    document.getElementById('bar-lib').innerText = getBar(gameState.liberte);
    document.getElementById('val-lib').innerText = gameState.liberte + "%";
    document.getElementById('bar-eco').innerText = getBar(gameState.eco);
    document.getElementById('val-eco').innerText = gameState.eco + "%";
    document.getElementById('val-bud').innerText = gameState.budget + "€";
    document.getElementById('val-bud').style.color = gameState.budget < 100 ? "#ff0055" : "#00ff41";
}

function typeWriter(text, elementId, speed = 5) {
    const element = document.getElementById(elementId);
    element.innerHTML = "";
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function openDir(id) {
    if (gameState.completed.includes(id)) return;
    const mission = missions[id];
    document.getElementById('active-terminal').classList.remove('hidden');
    document.getElementById('current-path').innerText = mission.path.substring(1);
    typeWriter(mission.msg, 'mission-output');
    const choicesDiv = document.getElementById('choices-area');
    choicesDiv.innerHTML = '';
    mission.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'cli-choice';
        btn.innerText = choice.label;
        btn.onclick = () => executeCommand(id, choice, mission.next);
        choicesDiv.appendChild(btn);
    });
}

function executeCommand(id, choice, nextId) {
    gameState.liberte += choice.impact.lib;
    gameState.eco += choice.impact.eco;
    gameState.budget += choice.impact.bud;
    gameState.liberte = Math.min(100, Math.max(0, gameState.liberte));
    gameState.eco = Math.min(100, Math.max(0, gameState.eco));
    updateHUD();

    gameState.completed.push(id);
    const dirElement = document.getElementById('dir-' + id);
    dirElement.classList.remove('blink-alert');
    dirElement.classList.add('resolved');
    dirElement.querySelector('.status-tag').innerText = choice.status;
    document.getElementById('active-terminal').classList.add('hidden');

    if (nextId === 'finish') {
        endGame();
    } else {
        const nextDir = document.getElementById('dir-' + nextId);
        nextDir.classList.add('blink-alert');
        nextDir.querySelector('.status-tag').innerText = "[ACTION REQUISE]";
    }
}

function endGame() {
    document.getElementById('modal-overlay').classList.remove('hidden');
    const desc = document.getElementById('end-desc');
    let report = `LIBERTÉ: ${gameState.liberte}%\nÉCOLOGIE: ${gameState.eco}%\nBUDGET: ${gameState.budget}€\n\n`;
    if (gameState.liberte >= 50 && gameState.eco >= 50 && gameState.budget >= 0) {
        document.getElementById('end-title').innerText = ">> MISSION RÉUSSIE";
        document.getElementById('end-title').style.color = "#00ff41";
        report += "RÉSULTAT : SYSTÈME SÉCURISÉ.\nGAFAM REPOUSSÉS.";
    } else {
        document.getElementById('end-title').innerText = ">> ÉCHEC MISSION";
        document.getElementById('end-title').style.color = "#ff0055";
        report += "RÉSULTAT : SYSTÈME CRITIQUE.";
    }
    desc.innerText = report;
}

function toggleHelp() {
    const modal = document.getElementById('help-overlay');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

let snakeGame = {
    canvas: null,
    ctx: null,
    interval: null,
    gridSize: 20,
    snake: [],
    food: {},
    direction: 'RIGHT',
    score: 0,
    running: false
};

const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiInput = [];

document.addEventListener('keydown', (e) => {
    konamiInput.push(e.key);
    if (konamiInput.length > konamiCode.length) konamiInput.shift();
    if (JSON.stringify(konamiInput) === JSON.stringify(konamiCode)) {
        startSnake();
    }

    if (snakeGame.running) {
        switch(e.key) {
            case 'ArrowUp': if(snakeGame.direction !== 'DOWN') snakeGame.direction = 'UP'; break;
            case 'ArrowDown': if(snakeGame.direction !== 'UP') snakeGame.direction = 'DOWN'; break;
            case 'ArrowLeft': if(snakeGame.direction !== 'RIGHT') snakeGame.direction = 'LEFT'; break;
            case 'ArrowRight': if(snakeGame.direction !== 'LEFT') snakeGame.direction = 'RIGHT'; break;
            case ' ': if(!snakeGame.running) startSnake(); break;
            case 'Escape': stopSnake(); break;
        }
    } else if (document.getElementById('snake-gameover').classList.contains('hidden') === false) {
        if(e.key === ' ') startSnake();
        if(e.key === 'Escape') stopSnake();
    }
});

function startSnake() {
    document.getElementById('snake-overlay').classList.remove('hidden');
    document.getElementById('snake-gameover').classList.add('hidden');
    snakeGame.canvas = document.getElementById('snake-canvas');
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
    snakeGame.snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    snakeGame.score = 0;
    snakeGame.direction = 'RIGHT';
    snakeGame.running = true;
    document.getElementById('snake-score').innerText = 0;
    spawnFood();
    if(snakeGame.interval) clearInterval(snakeGame.interval);
    snakeGame.interval = setInterval(updateSnake, 100);
}

function stopSnake() {
    snakeGame.running = false;
    clearInterval(snakeGame.interval);
    document.getElementById('snake-overlay').classList.add('hidden');
}

function spawnFood() {
    snakeGame.food = {
        x: Math.floor(Math.random() * (snakeGame.canvas.width / snakeGame.gridSize)),
        y: Math.floor(Math.random() * (snakeGame.canvas.height / snakeGame.gridSize))
    };
}

function updateSnake() {
    let head = { ...snakeGame.snake[0] };
    if (snakeGame.direction === 'UP') head.y--;
    if (snakeGame.direction === 'DOWN') head.y++;
    if (snakeGame.direction === 'LEFT') head.x--;
    if (snakeGame.direction === 'RIGHT') head.x++;

    if (head.x < 0 || head.x >= snakeGame.canvas.width / snakeGame.gridSize ||
        head.y < 0 || head.y >= snakeGame.canvas.height / snakeGame.gridSize ||
        snakeGame.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOverSnake();
        return;
    }

    snakeGame.snake.unshift(head);

    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        document.getElementById('snake-score').innerText = snakeGame.score;
        spawnFood();
    } else {
        snakeGame.snake.pop();
    }

    drawSnake();
}

function drawCube(ctx, x, y, size, colorBase, colorSide, colorTop) {
    const depth = size / 2;
    const px = x * size;
    const py = y * size;

    ctx.fillStyle = colorTop;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + depth, py - depth);
    ctx.lineTo(px + size + depth, py - depth);
    ctx.lineTo(px + size, py);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colorSide;
    ctx.beginPath();
    ctx.moveTo(px + size, py);
    ctx.lineTo(px + size + depth, py - depth);
    ctx.lineTo(px + size + depth, py + size - depth);
    ctx.lineTo(px + size, py + size);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colorBase;
    ctx.fillRect(px, py, size, size);
}

function drawSnake() {
    snakeGame.ctx.clearRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);

    drawCube(snakeGame.ctx, snakeGame.food.x, snakeGame.food.y, snakeGame.gridSize, '#ff0055', '#990033', '#ff6688');

    snakeGame.snake.forEach(segment => {
        drawCube(snakeGame.ctx, segment.x, segment.y, snakeGame.gridSize, '#00ff41', '#004d1a', '#66ff99');
    });
}

function gameOverSnake() {
    snakeGame.running = false;
    clearInterval(snakeGame.interval);
    document.getElementById('snake-gameover').classList.remove('hidden');
}

window.onload = updateHUD;
