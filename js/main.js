/**
 * main.js
 * 포즈 인식과 게임 로직을 초기화하고 서로 연결하는 진입점
 *
 * PoseEngine, GameEngine, Stabilizer를 조합하여 애플리케이션을 구동
 */

// 전역 변수
let poseEngine;
let gameEngine;
let stabilizer;
let ctx;
let labelContainer;

/**
 * 애플리케이션 초기화
 */
async function init() {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  startBtn.disabled = true;

  // RESTART LOGIC: If engines exist, just restart them
  if (poseEngine && gameEngine) {
    poseEngine.start();
    gameEngine.start();
    stopBtn.disabled = false;
    startBtn.innerText = "Start"; // Reset text
    return;
  }

  try {
    // 1. PoseEngine 초기화
    poseEngine = new PoseEngine("./my_model/");
    const { maxPredictions, webcam } = await poseEngine.init({
      size: 200,
      flip: true
    });

    // 2. Stabilizer 초기화
    stabilizer = new PredictionStabilizer({
      threshold: 0.7,
      smoothingFrames: 3
    });

    // 3. GameEngine 초기화
    gameEngine = new GameEngine();

    // GameEngine Callbacks
    gameEngine.setGameEndCallback((finalScore, finalLevel) => {
      // 1. UI Status Update (Start -> Restart)
      stop();

      const startBtn = document.getElementById("startBtn");
      startBtn.disabled = true;

      // Alert and Ranking
      setTimeout(() => {
        alert(`Game Over! 🎮\nYour Score: ${finalScore}`);
        // 3. Show Ranking & Re-enable Button after alert is closed
        if (gameEngine) {
          gameEngine.showRanking = true;

          // Force render loop for Ranking Screen
          function renderRanking() {
            if (gameEngine && gameEngine.showRanking) {
              ctx.clearRect(0, 0, 800, 600); // Clear before drawing
              gameEngine.draw(ctx);
              requestAnimationFrame(renderRanking);
            }
          }
          renderRanking();
        }
        startBtn.disabled = false;
      }, 50);
    });

    // 4. 캔버스 설정
    const canvas = document.getElementById("canvas");
    canvas.width = 800; // Updated Width
    canvas.height = 600; // Updated Height
    ctx = canvas.getContext("2d");

    // 5. Label Container 설정
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // 초기화
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }

    // 6. PoseEngine 콜백 설정
    poseEngine.setPredictionCallback(handlePrediction);
    poseEngine.setDrawCallback(drawPose);

    // 7. 웹캠 캔버스 배치 (왼쪽)
    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.innerHTML = "";
    webcamContainer.appendChild(poseEngine.webcam.canvas);

    // 8. 시작
    poseEngine.start();
    gameEngine.start(); // 게임 시작

    stopBtn.disabled = false;
  } catch (error) {
    console.error("초기화 중 오류 발생:", error);
    alert("초기화에 실패했습니다. 콘솔을 확인하세요.");
    startBtn.disabled = false;
  }
}

/**
 * 애플리케이션 중지
 */
/**
 * 애플리케이션 중지
 */
function stop() {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  // const restartBtn = document.getElementById("restartBtn"); // Removed

  if (poseEngine) {
    poseEngine.stop();
  }

  if (gameEngine) {
    gameEngine.stop();
  }

  if (stabilizer) {
    stabilizer.reset();
  }

  startBtn.disabled = false;
  stopBtn.disabled = true;

  // Show Restart Button when stopped
  startBtn.innerText = "Restart";
}



/**
 * 예측 결과 처리 콜백
 * @param {Array} predictions - TM 모델의 예측 결과
 * @param {Object} pose - PoseNet 포즈 데이터
 */
function handlePrediction(predictions, pose) {
  // 1. Stabilizer로 예측 안정화
  const stabilized = stabilizer.stabilize(predictions);

  // 2. Label Container 업데이트
  for (let i = 0; i < predictions.length; i++) {
    const classPrediction =
      predictions[i].className + ": " + predictions[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }

  // 3. 최고 확률 예측 표시
  const maxPredictionDiv = document.getElementById("max-prediction");
  maxPredictionDiv.innerHTML = stabilized.className || "감지 중...";

  // 4. GameEngine에 포즈 전달
  if (gameEngine && gameEngine.isGameActive && stabilized.className) {
    gameEngine.onPoseDetected(stabilized.className);
  }
}

/**
 * 포즈 그리기 콜백 (매 프레임 호출됨)
 * @param {Object} pose - PoseNet 포즈 데이터
 */
function drawPose(pose) {
  // 1. 게임 캔버스 초기화
  if (ctx) {
    // FIX: 800x600 해상도에 맞춰 지우기
    ctx.clearRect(0, 0, 800, 600);

    // 2. 게임 엔진 업데이트 및 그리기
    if (gameEngine) {
      if (gameEngine.isGameActive) {
        gameEngine.update();
      }
      // Draw always (GameEngine handles what to draw: game or ranking)
      gameEngine.draw(ctx);
    }
  }
}
