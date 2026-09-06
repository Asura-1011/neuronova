/**
 * NeuroNova GameDifficultyService (Part 11)
 * Gradual game difficulty adaptation based on patient level (Levels 1 to 5)
 */

const GameDifficultyService = {
  getDifficultyForGame(gameId, level = 1) {
    const safeLevel = Math.max(1, Math.min(5, level));

    switch (gameId) {
      case 'game1': // Memory Match
        return {
          pairsCount: safeLevel === 1 ? 4 : (safeLevel === 2 ? 6 : 8),
          gridCols: safeLevel === 1 ? 4 : (safeLevel === 2 ? 4 : 4)
        };

      case 'game2': // Sequence Recall
        return {
          maxRounds: safeLevel === 1 ? 3 : (safeLevel === 2 ? 4 : 5),
          flashSpeedMs: Math.max(600, 900 - (safeLevel - 1) * 100)
        };

      case 'game3': // Picture Recall
        return {
          itemCount: safeLevel === 1 ? 3 : (safeLevel === 2 ? 4 : 5),
          previewTimeMs: Math.max(3000, 5000 - (safeLevel - 1) * 500)
        };

      case 'game4': // Pattern Memory
        return {
          tilesCount: safeLevel === 1 ? 3 : (safeLevel === 2 ? 4 : 5),
          previewTimeMs: Math.max(2500, 3500 - (safeLevel - 1) * 300)
        };

      case 'game5': // What Changed?
        return {
          gridSize: safeLevel <= 2 ? 9 : 12,
          previewTimeMs: Math.max(2500, 4000 - (safeLevel - 1) * 500)
        };

      default:
        return {};
    }
  }
};
