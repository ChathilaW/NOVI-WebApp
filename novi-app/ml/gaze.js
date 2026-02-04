import {
  FaceLandmarker,
  FilesetResolver
} from "@mediapipe/tasks-vision";

/* ------------------------------------
   Landmark indices
------------------------------------ */

const LEFT_EYE_CORNERS = [33, 133];
const RIGHT_EYE_CORNERS = [362, 263];

const LEFT_IRIS = [468, 469, 470, 471, 472];
const RIGHT_IRIS = [473, 474, 475, 476, 477];

/* ------------------------------------
   Utilities
------------------------------------ */

function lmPx(landmarks, idx, w, h) {
  return {
    x: landmarks[idx].x * w,
    y: landmarks[idx].y * h
  };
}

function irisCenter(landmarks, indices, w, h) {
  let x = 0, y = 0;
  indices.forEach(i => {
    const p = lmPx(landmarks, i, w, h);
    x += p.x;
    y += p.y;
  });
  return {
    x: x / indices.length,
    y: y / indices.length
  };
}

/* ------------------------------------
   Gaze estimation
------------------------------------ */

function getEyeGaze(landmarks, w, h) {
  const leftOuter = lmPx(landmarks, LEFT_EYE_CORNERS[0], w, h);
  const leftInner = lmPx(landmarks, LEFT_EYE_CORNERS[1], w, h);

  const rightOuter = lmPx(landmarks, RIGHT_EYE_CORNERS[0], w, h);
  const rightInner = lmPx(landmarks, RIGHT_EYE_CORNERS[1], w, h);

  const leftIris = irisCenter(landmarks, LEFT_IRIS, w, h);
  const rightIris = irisCenter(landmarks, RIGHT_IRIS, w, h);

  const leftRatio =
    (leftIris.x - leftOuter.x) / (leftInner.x - leftOuter.x);

  const rightRatio =
    (rightIris.x - rightOuter.x) / (rightInner.x - rightOuter.x);

  const horizontalRatio = (leftRatio + rightRatio) / 2;

  const leftEyeCenterY = (leftOuter.y + leftInner.y) / 2;
  const rightEyeCenterY = (rightOuter.y + rightInner.y) / 2;

  const leftVertical = leftIris.y - leftEyeCenterY;
  const rightVertical = rightIris.y - rightEyeCenterY;

  const verticalRatio = (leftVertical + rightVertical) / 2 / h;

  let gaze = "CENTER";

  if (horizontalRatio < 0.42) gaze = "RIGHT";
  else if (horizontalRatio > 0.70) gaze = "LEFT";
  else if (verticalRatio < -0.0075) gaze = "UP";
  else if (verticalRatio > 0.0) gaze = "DOWN";

  return { gaze, horizontalRatio, verticalRatio };
}

/* ------------------------------------
   Main
------------------------------------ */

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function init() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 👇 WASM from installed package
  const fileset = await FilesetResolver.forVisionTasks(
    "/node_modules/@mediapipe/tasks-vision/wasm"
  );

  const landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      // 👇 NEW model path (spaces encoded)
      modelAssetPath: "/assets/ml-models/face_landmarker.task"
    },
    runningMode: "VIDEO",
    numFaces: 1
  });

  function loop() {
    const now = performance.now();
    const results = landmarker.detectForVideo(video, now);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.faceLandmarks?.length) {
      const landmarks = results.faceLandmarks[0];

      const { gaze, horizontalRatio, verticalRatio } =
        getEyeGaze(landmarks, canvas.width, canvas.height);

      ctx.fillStyle = "lime";
      ctx.font = "30px Arial";
      ctx.fillText(`Gaze: ${gaze}`, 30, 40);

      ctx.fillStyle = "yellow";
      ctx.font = "20px Arial";
      ctx.fillText(`H Ratio: ${horizontalRatio.toFixed(3)}`, 30, 80);

      ctx.fillStyle = "magenta";
      ctx.fillText(`V Ratio: ${verticalRatio.toFixed(4)}`, 30, 110);
    }

    requestAnimationFrame(loop);
  }

  loop();
}

init();


