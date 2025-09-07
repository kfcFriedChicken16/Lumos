"use client";

interface LevelPickerProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  setLevel: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  unlockedLevels: number[];
  onNavigateToLevel?: (level: number) => void;
}

export default function LevelPicker({ level, setLevel, unlockedLevels, onNavigateToLevel }: LevelPickerProps) {
  return (
    <div className="rounded-xl border border-orange-200 bg-white/80 backdrop-blur-sm p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
        Choose Difficulty
      </h3>
      <div className="grid grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((l) => {
          const isUnlocked = unlockedLevels.includes(l);
          const isCurrentLevel = level === l;
          
          return (
            <button
              key={l}
              onClick={() => isUnlocked && setLevel(l as 1 | 2 | 3 | 4 | 5 | 6)}
              disabled={!isUnlocked}
              className={`py-2 px-3 rounded-lg border transition-all duration-200 font-medium text-sm ${
                isCurrentLevel
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-500 shadow-lg'
                  : isUnlocked
                  ? 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        {level === 1 && "Beginner"}
        {level === 2 && "Easy"}
        {level === 3 && "Medium"}
        {level === 4 && "Hard"}
        {level === 5 && "Expert"}
        {level === 6 && "Master"}
      </div>
      
      {/* Navigation Buttons */}
      {unlockedLevels.length > 1 && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              const prevLevel = level - 1;
              if (prevLevel >= 1 && unlockedLevels.includes(prevLevel)) {
                setLevel(prevLevel as 1 | 2 | 3 | 4 | 5 | 6);
                onNavigateToLevel?.(prevLevel);
              }
            }}
            disabled={level === 1 || !unlockedLevels.includes(level - 1)}
            className="flex-1 py-2 px-3 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous Level
          </button>
          <button
            onClick={() => {
              const nextLevel = level + 1;
              if (nextLevel <= 6 && unlockedLevels.includes(nextLevel)) {
                setLevel(nextLevel as 1 | 2 | 3 | 4 | 5 | 6);
                onNavigateToLevel?.(nextLevel);
              }
            }}
            disabled={level === 6 || !unlockedLevels.includes(level + 1)}
            className="flex-1 py-2 px-3 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next Level →
          </button>
        </div>
      )}
    </div>
  );
}
