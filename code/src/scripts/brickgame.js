const canvas = document.getElementById("breakout");
const ctx = canvas.getContext("2d");

// 🎨 Couleurs avec fond transparent pour page blanche
const COLORS = {
  background: "transparent",
  paddle: "#1e90ff", // bleu CYU
  ball: "#ff6600", // orange CYU
  brick: "#38bdf8", // cyan clair
  scoreText: "#333333", // Texte foncé pour contraste sur fond clair
  scoreBackground: "rgba(255, 255, 255, 0.8)", // Fond blanc semi-transparent
  border: "rgba(0, 0, 0, 0.1)", // Bordure subtile
};

// 🔧 Dimensions
const paddleHeight = 15;
const paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;

const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 50;

// Définir une vitesse de base
const baseSpeed = 10;

// Initialisation aléatoire de la direction de la balle
function getRandomDirection() {
  // Angle aléatoire entre -45° et 45° (vers le haut)
  const angle = (Math.random() * 90 - 45) * Math.PI / 180;
  
  // Calcul des composantes dx et dy
  const speed = baseSpeed;
  let dx = Math.cos(angle) * speed;
  let dy = -Math.abs(Math.sin(angle) * speed); // Toujours négatif pour aller vers le haut
  
  // Assurer une vitesse minimale horizontale
  if (Math.abs(dx) < 1.5) {
    dx = (dx < 0 ? -1.5 : 1.5);
  }
  
  return { dx, dy };
}

// Initialiser avec une direction aléatoire
let { dx, dy } = getRandomDirection();

// 🎯 Bricks
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 80;
const brickHeight = 25;
const brickPadding = 10;
const brickOffsetTop = 70; // Augmenté pour laisser plus de place au score
const brickOffsetLeft = 35;

let score = 0;
let bricks = [];
let gameStarted = false;

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Ajout du contrôle à la souris
canvas.addEventListener("mousemove", mouseMoveHandler);

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.getBoundingClientRect().left;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
    
    // Limiter la raquette dans le canvas
    if (paddleX < 0) {
      paddleX = 0;
    }
    if (paddleX > canvas.width - paddleWidth) {
      paddleX = canvas.width - paddleWidth;
    }
  }
}

// Démarrer le jeu au clic
canvas.addEventListener("click", function() {
  if (!gameStarted) {
    gameStarted = true;
  }
});

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  else if (e.key === " " || e.key === "Spacebar") { // Espace pour démarrer
    if (!gameStarted) {
      gameStarted = true;
    }
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
  
  // Gradient pour la raquette
  const gradient = ctx.createLinearGradient(paddleX, canvas.height - paddleHeight - 10, paddleX + paddleWidth, canvas.height - 10);
  gradient.addColorStop(0, "#1e90ff");
  gradient.addColorStop(1, "#00bfff");
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Bordure subtile
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  
  // Gradient pour la balle
  const gradient = ctx.createRadialGradient(x, y, 2, x, y, ballRadius);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, COLORS.ball);
  gradient.addColorStop(1, "#cc5200");
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Bordure de la balle
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.closePath();

  // ✨ Ajout du logo "CYU" au centre de la balle
  ctx.font = "bold 10px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CYU", x, y);
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        
        // Gradient pour les briques
        const gradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeight);
        gradient.addColorStop(0, "#7dd3fc");
        gradient.addColorStop(1, COLORS.brick);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Bordure des briques
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          
          // Petite animation de score
          setTimeout(() => {
            if (score === brickRowCount * brickColumnCount) {
              alert("🎉 Bravo ! Tu as tout cassé !");
              document.location.reload();
            }
          }, 10);
        }
      }
    }
  }
}

function drawScore() {
  const scoreX = canvas.width / 2;
  const scoreY = 35;
  
  // Dessiner un fond arrondi pour le score (visible sur fond blanc)
  ctx.beginPath();
  ctx.roundRect(
    scoreX - 60, 
    scoreY - 20, 
    120, 
    40, 
    [20]
  );
  ctx.fillStyle = COLORS.scoreBackground;
  ctx.fill();
  
  // Bordure du score
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
  
  // Dessiner le texte du score
  ctx.font = "bold 22px 'Arial', sans-serif";
  ctx.fillStyle = COLORS.scoreText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`Score: ${score}`, scoreX, scoreY);
}

function drawInstructions() {
  if (!gameStarted) {
    ctx.font = "18px 'Arial', sans-serif";
    ctx.fillStyle = "#333333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Clique ou appuie sur ESPACE pour démarrer", canvas.width / 2, canvas.height / 2 + 100);
    
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = "#666666";
    ctx.fillText("Utilise les flèches ou la souris pour déplacer la raquette", canvas.width / 2, canvas.height / 2 + 130);
  }
}

function drawGameBorder() {
  // Dessiner un cadre subtil autour du jeu
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]); // Ligne pointillée
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  ctx.setLineDash([]); // Réinitialiser
}

function draw() {
  // Effacer le canvas avec transparence
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Pas de remplissage de fond pour la transparence
  // Le fond de la page blanche sera visible
  
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawGameBorder();
  drawInstructions();
  
  // Si le jeu n'a pas démarré, on ne bouge pas la balle
  if (gameStarted) {
    collisionDetection();

    // rebonds sur les murs
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > canvas.height - ballRadius - 10) {
      if (x > paddleX && x < paddleX + paddleWidth) {
        // Rebond sur la raquette avec variation
        const hitPosition = (x - paddleX) / paddleWidth;
        dx = 5 * (hitPosition - 0.5); // Variation selon où on frappe
        dy = -dy;
      } else {
        setTimeout(() => {
          alert("💥 Game Over ! Score : " + score);
          document.location.reload();
        }, 10);
      }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    x += dx;
    y += dy;
  } else {
    // Position initiale de la balle sur la raquette
    x = paddleX + paddleWidth / 2;
    y = canvas.height - paddleHeight - ballRadius - 15;
  }

  requestAnimationFrame(draw);
}

// Réinitialiser avec nouvelle direction aléatoire si on recharge
function resetGame() {
  x = canvas.width / 2;
  y = canvas.height - 50;
  ({ dx, dy } = getRandomDirection());
  gameStarted = false;
}

// Exposer la fonction de réinitialisation
window.resetBreakout = resetGame;

draw();