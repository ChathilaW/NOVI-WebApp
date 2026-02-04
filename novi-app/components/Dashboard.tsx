type Props = {
  stats: any;
  isVideoEnabled: boolean;
  onClose: () => void;
};

export default function Dashboard({ stats, isVideoEnabled, onClose }: Props) {
  return (
    <div className="absolute right-6 bottom-24 w-64 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold">Engagement</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      {!isVideoEnabled ? (
        <p className="text-gray-400 text-sm">Camera turned off</p>
      ) : !stats ? (
        <p className="text-gray-400 text-sm">No face detected</p>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-white">
            Gaze: <span className="text-purple-400">{stats.gaze}</span>
          </p>
          <p className="text-gray-300">
            Horizontal: {stats.horizontalRatio.toFixed(2)}
          </p>
          <p className="text-gray-300">
            Vertical: {stats.verticalRatio.toFixed(3)}
          </p>
        </div>
      )}
    </div>
  );
}
