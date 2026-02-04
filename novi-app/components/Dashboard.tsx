'use client';

type Props = {
  stats: any;
  isVideoEnabled: boolean;
  onClose: () => void;
};

export default function Dashboard({ stats, isVideoEnabled, onClose }: Props) {
  return (
    <div className="absolute right-6 bottom-24 w-80 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-semibold">Distraction Detection</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {!isVideoEnabled ? (
        <p className="text-gray-400 text-sm">Camera turned off</p>
      ) : !stats || stats === null ? (
        <p className="text-gray-400 text-sm">Initializing...</p>
      ) : stats.status === "NO FACE" ? (
        <p className="text-yellow-400 text-sm font-semibold">⚠️ No face detected</p>
      ) : stats.status === "ERROR" ? (
        <p className="text-red-400 text-sm font-semibold">❌ Detection error</p>
      ) : (
        <div className="space-y-3 text-sm">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Status:</span>
            <span className={`px-3 py-1 rounded-full font-semibold ${
              stats.status === "FOCUSED" 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            }`}>
              {stats.status === "FOCUSED" ? "✓ FOCUSED" : "⚠ DISTRACTED"}
            </span>
          </div>

          {/* Head Posture */}
          {stats.headPosture && (
            <div className="border-t border-gray-700 pt-2">
              <p className="text-gray-400 mb-1">Head Position:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded p-2">
                  <p className="text-gray-500 text-xs">Yaw</p>
                  <p className="text-white font-mono">{stats.headPosture.yaw?.toFixed(1)}°</p>
                </div>
                <div className="bg-gray-800 rounded p-2">
                  <p className="text-gray-500 text-xs">Pitch</p>
                  <p className="text-white font-mono">{stats.headPosture.pitch?.toFixed(1)}°</p>
                </div>
              </div>
            </div>
          )}

          {/* Gaze Direction (only when focused) */}
          {stats.gaze && (
            <div className="border-t border-gray-700 pt-2">
              <p className="text-gray-400 mb-1">Gaze Direction:</p>
              <div className="bg-gray-800 rounded p-2">
                <p className="text-white font-semibold text-center">{stats.gaze.gaze}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-gray-800 rounded p-2">
                  <p className="text-gray-500 text-xs">Horizontal</p>
                  <p className="text-white font-mono text-xs">{stats.gaze.horizontalRatio?.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800 rounded p-2">
                  <p className="text-gray-500 text-xs">Vertical</p>
                  <p className="text-white font-mono text-xs">{stats.gaze.verticalRatio?.toFixed(4)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

