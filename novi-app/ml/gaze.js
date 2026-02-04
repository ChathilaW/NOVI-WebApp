import {
  FaceLandmarker,
  FilesetResolver
} from "@mediapipe/tasks-vision";

/* ------------------------------
   Internal state
------------------------------ */

let landmarker = null;

/* ------------------------------
   Landmark indices
------------------------------ */

const LEFT_EYE_CORNERS = [33, 133];
const RIGHT_EYE_CORNERS = [362, 263];
const LEFT_IRIS = [468, 469, 470, 471, 472];
const RIGHT_IRIS = [473, 474, 475, 476, 477];

/* ------------------------------
   Utils
------------------------------ */

function lmPx(lm, i, w, h) {
  return { x: lm[i].x * w, y: lm[i].y * h };
}

function irisCenter(lm, ids, w, h) {
  let x = 0, y = 0;
  ids.forEach(i => {
    const p = lmPx(lm, i, w, h);
    x += p.x;
    y += p.y;
  });
  return { x: x / ids.length, y: y / ids.length };
}

/* ------------------------------
   Init MediaPipe
------------------------------ */

export async function initGaze() {
  if (landmarker) return landmarker;

  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
  );

  landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: "/assets/ml-models/face_landmarker.task"
    },
    runningMode: "VIDEO",
    numFaces: 1
  });

  return landmarker;
}

/* ------------------------------
   Run gaze per frame
------------------------------ */

export function runGaze(video) {
  if (!landmarker || video.readyState < 2) return null;

  try {
    const res = landmarker.detectForVideo(video, performance.now());
    if (!res.faceLandmarks?.length) return null;

    const lm = res.faceLandmarks[0];
    const w = video.videoWidth;
    const h = video.videoHeight;

    const lO = lmPx(lm, LEFT_EYE_CORNERS[0], w, h);
    const lI = lmPx(lm, LEFT_EYE_CORNERS[1], w, h);
    const rO = lmPx(lm, RIGHT_EYE_CORNERS[0], w, h);
    const rI = lmPx(lm, RIGHT_EYE_CORNERS[1], w, h);

    const lIris = irisCenter(lm, LEFT_IRIS, w, h);
    const rIris = irisCenter(lm, RIGHT_IRIS, w, h);

    const hRatio =
      ((lIris.x - lO.x) / (lI.x - lO.x) +
        (rIris.x - rO.x) / (rI.x - rO.x)) / 2;

    const vRatio =
      ((lIris.y - (lO.y + lI.y) / 2) +
        (rIris.y - (rO.y + rI.y) / 2)) / 2 / h;

    let gaze = "CENTER";
    if (hRatio < 0.42) gaze = "RIGHT";
    else if (hRatio > 0.7) gaze = "LEFT";
    else if (vRatio < -0.0075) gaze = "UP";
    else if (vRatio > 0.0) gaze = "DOWN";

    return {
      gaze,
      horizontalRatio: hRatio,
      verticalRatio: vRatio,
      timestamp: Date.now()
    };
  } catch (err) {
    // Silently ignore errors (e.g., video not fully ready yet)
    return null;
  }
}
