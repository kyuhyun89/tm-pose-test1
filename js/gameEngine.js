/**
 * gameEngine.js
 * Fruit Catcher Game Logic
 * 
 * Rules:
 * - 3 Lanes: Left, Center, Right
 * - Control: Head Tilt (Left/Right/Center)
 * - Items: Apple(+10), Orange(+20), Banana(+30), Bomb(-50)
 * - Time: 30 seconds
 */

const GAME_CONFIG = {
  LANES: 3, // 0: Left, 1: Center, 2: Right
  LANE_WIDTH: 800 / 3, // Canvas Width / 3
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PLAYER_Y: 520, // Player vertical position (Scaled)
  PLAYER_SIZE: 120, // Scaled size
  ITEM_SPEED_BASE: 5, // Scaled speed
  ITEM_SPEED_MAX: 15,
  SPAWN_RATE: 60, // frames
  TIME_LIMIT: 30, // seconds
};

const ITEMS = {
  APPLE: { type: 'apple', score: 10, color: 'red', icon: '🍎' },
  ORANGE: { type: 'orange', score: 20, color: 'orange', icon: '🍊' },
  BANANA: { type: 'banana', score: 30, color: 'yellow', icon: '🍌' },
  BOMB: { type: 'bomb', score: -50, color: 'black', icon: '💣' },
};

class GameEngine {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.timeLimit = GAME_CONFIG.TIME_LIMIT;
    this.isGameActive = false;
    this.gameTimer = null;

    // Game State
    this.basketPos = 1; // 0: Left, 1: Center, 2: Right
    this.items = []; // Array of { x, y, type, lane }
    this.frameCount = 0;
    this.speedMultiplier = 1.0;

    this.onScoreChange = null;
    this.onGameEnd = null;

    // Background Image Load
    this.backgroundImage = new Image();
    this.backgroundImage.src = "./images/background.png";
  }

  /**
   * Start Game
   */
  start() {
    this.isGameActive = true;
    this.showRanking = false; // Reset Ranking View
    this.score = 0;
    this.level = 1;
    this.timeLimit = GAME_CONFIG.TIME_LIMIT;
    this.items = [];
    this.frameCount = 0;
    this.speedMultiplier = 1.0;
    this.basketPos = 1; // Start at Center

    // Start Timer
    this.clearTimer();
    this.gameTimer = setInterval(() => {
      this.timeLimit--;
      if (this.timeLimit <= 0) {
        this.stop();
      }
    }, 1000);
  }

  /**
   * Stop Game
   */
  stop() {
    if (!this.isGameActive) return; // Prevent double calling

    this.isGameActive = false;
    this.clearTimer();

    // Save Score
    this.saveHighScore(this.score);

    // Note: showRanking is handled by main.js after alert

    if (this.onGameEnd) {
      this.onGameEnd(this.score, this.level);
    }
  }

  clearTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  /**
   * Update Game Logic (Called every frame)
   */
  update() {
    if (!this.isGameActive) return;

    this.frameCount++;

    // 1. Spawn Items
    // As time goes, spawn faster and move faster
    const currentSpawnRate = Math.max(20, GAME_CONFIG.SPAWN_RATE - (30 - this.timeLimit));
    if (this.frameCount % currentSpawnRate === 0) {
      this.spawnItem();
    }

    // 2. Update Items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      // Speed detection based on time
      const speed = GAME_CONFIG.ITEM_SPEED_BASE + (30 - this.timeLimit) * 0.1;
      item.y += speed;

      // 3. Collision Detection
      if (this.checkCollision(item)) {
        this.handleItemCollection(item);
        this.items.splice(i, 1);
        continue;
      }

      // 4. Remove if out of bounds
      if (item.y > GAME_CONFIG.CANVAS_HEIGHT) {
        this.items.splice(i, 1);
      }
    }
  }

  spawnItem() {
    const lane = Math.floor(Math.random() * GAME_CONFIG.LANES); // 0, 1, 2
    const rand = Math.random();
    let type = ITEMS.APPLE;

    // Adjusted Probabilities for better gameplay balance
    if (rand < 0.35) type = ITEMS.BOMB;    // 35% (Increased from 20%)
    else if (rand < 0.6) type = ITEMS.BANANA; // 25%
    else if (rand < 0.8) type = ITEMS.ORANGE; // 20%
    else type = ITEMS.APPLE;             // 20%

    this.items.push({
      lane: lane,
      x: lane * GAME_CONFIG.LANE_WIDTH + GAME_CONFIG.LANE_WIDTH / 2,
      y: -20,
      type: type
    });
  }

  checkCollision(item) {
    // Simple Box/Distance Collision
    // Item is roughly at item.y, Lane is distinct
    // Collision happens if item is close to player Y and in the same lane
    // Adjusted for larger size (90px player -> approx +/- 45~60 collision box)
    const hitY = item.y >= GAME_CONFIG.PLAYER_Y - 60 && item.y <= GAME_CONFIG.PLAYER_Y + 60;
    const hitLane = item.lane === this.basketPos;

    return hitY && hitLane;
  }

  handleItemCollection(item) {
    // Update Score
    this.score += item.type.score;

    if (this.onScoreChange) {
      this.onScoreChange(this.score, this.level);
    }
  }


  saveHighScore(score) {
    const highScores = this.getHighScores();
    highScores.push({ score: score, date: new Date().toLocaleString() });
    highScores.sort((a, b) => b.score - a.score);
    const topScores = highScores.slice(0, 5); // Keep top 5
    localStorage.setItem('fruitCatcherHighScores', JSON.stringify(topScores));
  }

  getHighScores() {
    const stored = localStorage.getItem('fruitCatcherHighScores');
    return stored ? JSON.parse(stored) : [];
  }

  drawRanking(ctx) {
    // Overlay Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = 'gold';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("🏆 HALL OF FAME 🏆", GAME_CONFIG.CANVAS_WIDTH / 2, 80);

    // Current Score
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(`Your Score: ${this.score}`, GAME_CONFIG.CANVAS_WIDTH / 2, 140);

    // Ranking List
    const highScores = this.getHighScores();
    ctx.font = '24px Arial';
    let y = 200;
    highScores.forEach((entry, index) => {
      const color = index === 0 ? 'yellow' : 'white';
      ctx.fillStyle = color;
      ctx.fillText(`${index + 1}. ${entry.score} pts (${entry.date})`, GAME_CONFIG.CANVAS_WIDTH / 2, y);
      y += 40;
    });

    // Restart Hint
    if (this.frameCount % 60 < 30) { // Blink effect
      ctx.fillStyle = '#00FF00';
      ctx.font = '20px Arial';
      ctx.fillText("Press Restart Button to Play Again", GAME_CONFIG.CANVAS_WIDTH / 2, 500);
    }
  }

  /**
   * Handle Pose Input
   * @param {string} detectedPose - 'left', 'right', 'center' (case insensitive)
   */
  onPoseDetected(detectedPose) {
    if (!this.isGameActive) return;

    const pose = detectedPose.toLowerCase();

    if (pose === 'left' || pose.includes('left')) {
      this.basketPos = 0;
    } else if (pose === 'right' || pose.includes('right')) {
      this.basketPos = 2;
    } else if (pose === 'center' || pose.includes('center')) {
      this.basketPos = 1;
    }
  }


  /**
   * Draw Game Elements
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    // 0. Draw Background (Always)
    if (this.backgroundImage.complete) {
      ctx.drawImage(this.backgroundImage, 0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    } else {
      // Fallback color if not loaded
      ctx.fillStyle = '#87CEEB'; // Sky Blue
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }

    if (this.showRanking) {
      this.drawRanking(ctx);
      return;
    }

    if (!this.isGameActive) return;

    // 1. Draw Lanes (Subtle lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // More visible on image
    ctx.lineWidth = 1;
    for (let i = 1; i < GAME_CONFIG.LANES; i++) {
      const x = i * GAME_CONFIG.LANE_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONFIG.CANVAS_HEIGHT);
      ctx.stroke();
    }

    // 2. Draw Items
    ctx.font = '60px Arial'; // Increased 3x
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this.items.forEach(item => {
      ctx.fillText(item.type.icon, item.x, item.y);
    });

    // 3. Draw Basket (Player)
    const basketX = this.basketPos * GAME_CONFIG.LANE_WIDTH + GAME_CONFIG.LANE_WIDTH / 2;
    ctx.font = '90px Arial'; // Increased 3x
    ctx.fillText('🧺', basketX, GAME_CONFIG.PLAYER_Y);

    // 4. Draw HUD (Score & Time)
    // Draw background for HUD to make it readable
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, 40); // Slightly taller

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial'; // Increased for readability
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 10, 25);

    ctx.textAlign = 'right';
    // Change color if time is low
    if (this.timeLimit <= 5) ctx.fillStyle = 'red';
    ctx.fillText(`Time: ${this.timeLimit}`, GAME_CONFIG.CANVAS_WIDTH - 10, 25);
  }

  // Setters for callbacks
  setScoreChangeCallback(callback) { this.onScoreChange = callback; }
  setGameEndCallback(callback) { this.onGameEnd = callback; }
}

window.GameEngine = GameEngine;
