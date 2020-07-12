const canvas = document.querySelector('#canvas');
const c = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const font = 'Fritz';
const paddleWidth = 100;
const paddleHeight = 30;

const defaults = {
  ballX: centerX,
  ballY: centerY,
  paddleX: centerX - (paddleWidth / 2),
  paddleY: canvas.height - 100,
  cpuX: centerX - (paddleWidth / 2),
  cpuY: 100 - paddleHeight
};

const ball = {
  radius: 15,
  color: '#fff',
  x: defaults.ballX,
  y: defaults.ballY,
  dx: -7,
  dy: 10
};
const paddle = {
  x: defaults.paddleX,
  y: defaults.paddleY,
  width: paddleWidth,
  height: paddleHeight,
  color: 'coral'
};
const cpuPaddle = {
  x: defaults.cpuX,
  y: defaults.cpuY,
  width: paddleWidth,
  height: paddleHeight,
  speed: 6,
  color: 'cyan'
}; 
let pointer = {
  x: paddle.x / 2,
  y: paddle.y
};
const gameLength = 5;
let isPaused = false;
let playerScore = 0;
let cpuScore = 0;
let winner = null; // 'Player' or 'CPU' or null
let showIntro = true;

document.fonts.load('96px Fritz').then(() => main());

function main() {
  // set up mouse move event
  canvas.addEventListener('pointermove', e => {
    pointer = getMousePos(canvas, e);
  });

  // click event
  canvas.addEventListener('click', e => {
    // start game
    if (showIntro) {
      showIntro = false;
      draw();
      return;
    }

    // reset game
    if (winner) {
      resetGame();
    }
  });

  draw();
}

function draw() {
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (showIntro) {
    intro();
    return;
  }
  
  if (!isPaused) {
    updateBallState();
  }
  updatePaddleState();
  updateCpuState();

  drawPlayerScore();
  drawCpuScore();
  drawBall();
  drawPaddle(paddle);
  drawPaddle(cpuPaddle);

  checkForVictory();

  if (isPaused && !winner) {
    resetBall();
  }

  requestAnimationFrame(draw);
}

function intro() {
  c.moveTo(centerX, centerY);
  c.font = `96px ${font}`;
  c.fillStyle = 'white';
  c.textAlign = 'center';
  c.fillText('First to 5 wins', centerX, centerY);
  c.moveTo(centerX + 100, centerY);
  c.font = `48px ${font}`;
  c.fillStyle = 'gray';
  c.fillText('CLICK TO START', centerX, centerY + 100);
}

function drawPlayerScore() {
  const x = canvas.width - 100;
  const y = centerY + 100;
  c.moveTo(x, y);
  c.font = `96px ${font}`;
  c.textAlign = 'right';
  c.fillStyle = paddle.color;
  c.fillText(playerScore.toString(), x, y);
}

function drawCpuScore() {
  const x = canvas.width - 100;
  const y = centerY - 100;
  c.moveTo(x, y);
  c.font = `96px ${font}`;
  c.textAlign = 'right';
  c.fillStyle = cpuPaddle.color;
  c.fillText(cpuScore.toString(), x, y);
}

function updatePaddleState() {
  paddle.x = (pointer.x * 2) - (paddle.width / 2);

  // hits right wall
  if (paddle.x + paddle.width >= canvas.width) {
    console.log(paddle.x, paddle.width)
    paddle.x = canvas.width - paddle.width;
  }

  // hits left wall
  if (paddle.x <= 0) {
    paddle.x = 0;
  }
}

function updateCpuState() {
  if (isPaused) {
    return;
  }

  const centerOfPaddle = cpuPaddle.x + (cpuPaddle.width / 2);

  // ball is moving away, so recenter paddle
  if (ball.dy > 0) {
    if (centerOfPaddle > centerX) {
      cpuPaddle.x -= cpuPaddle.speed;
    }

    if (centerOfPaddle < centerX) {
      cpuPaddle.x += cpuPaddle.speed;
    }

    return;
  }

  // move left to hit ball
  if (ball.x < centerOfPaddle) {
    cpuPaddle.x -= cpuPaddle.speed;
  }

  // move right to hit ball
  if (ball.x > centerOfPaddle) {
    cpuPaddle.x += cpuPaddle.speed;
  }
}

function drawPaddle(paddle) {
  c.moveTo(paddle.x, paddle.y);
  c.fillStyle = paddle.color;
  c.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function updateBallState() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // passes through bottom
  if (ball.y > canvas.height + 100) {
    isPaused = true;
    cpuScore++;
    return;
  }

  // passes through top
  if (ball.y < 0 - 100) {
    isPaused = true;
    playerScore++;
    return;
  }

  // hits left wall
  if (ball.x - ball.radius <= 0) {
    ball.dx *= -1;
  }

  // hits right wall
  if (ball.x + ball.radius >= canvas.width) {
    ball.dx *= -1;
  }

  // this value gives us a little play in collision detection so that we don't miss detection
  // due to "framing past" the paddles.
  const yCushion = paddleHeight;
  const xCushion = 10;

  // hits player paddle
  const isWithinPaddleX = ball.x <= paddle.x + paddle.width + xCushion && ball.x >= paddle.x - xCushion;
  const isAtPaddleY = ball.y + ball.radius > paddle.y && ball.y + ball.radius < paddle.y + yCushion;
  const isGoingDown = ball.dy > 0;

  if (isWithinPaddleX && isAtPaddleY && isGoingDown) {
    ball.dy *= -1;
  }

  // hits cpu paddle
  const isWithinCpuX = ball.x <= cpuPaddle.x + cpuPaddle.width + xCushion && ball.x >= cpuPaddle.x - xCushion;
  const isAtCpuY = ball.y - ball.radius < cpuPaddle.y + cpuPaddle.height && ball.y - ball.radius > cpuPaddle.y - yCushion;
  const isGoingUp = ball.dy < 0;

  if (isWithinCpuX && isAtCpuY && isGoingUp) {
    ball.dy *= -1;
  }
}

function drawBall() {
  c.beginPath();
  c.moveTo(ball.x, ball.y);
  c.fillStyle = ball.color;
  c.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  c.fill();
}

function resetBall() {
  ball.x = centerX;
  ball.y = centerY;
  ball.dx *= -1;
  ball.dy = Math.abs(ball.dy);
  isPaused = false;
}

function checkForVictory() {
  if (playerScore >= gameLength) {
    winner = 'Player';
  } else if (cpuScore >= gameLength) {
    winner = 'CPU'
  }

  if (!winner) {
    return;
  }

  moveTo(centerX, centerY);
  c.fillStyle = 'white';
  c.font = `96px ${font}`;
  c.textAlign = 'center';
  c.fillText(`${winner} wins!`, centerX, centerY);
  c.moveTo(centerX, centerY + 100);
  c.fillStyle = 'gray';
  c.font = `48px ${font}`;
  c.fillText('CLICK TO PLAY AGAIN', centerX, centerY + 100);
}

function resetGame() {
  ball.x = defaults.ballX;
  ball.y = defaults.ballY;
  cpuPaddle.x = defaults.cpuX;
  cpuPaddle.y = defaults.cpuY;
  playerScore = 0;
  cpuScore = 0;
  winner = null;
  isPaused = false;
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}