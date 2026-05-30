export function drinksNeededForLevel(level) {
  if (level <= 1) return 3;
  if (level < 5) return 5;
  if (level < 10) return 7;
  return 10 + Math.floor(level / 5) * 3;
}

export function getLevelProgress(level, segmentCount) {
  const needed = drinksNeededForLevel(level);
  return Math.min(segmentCount / needed, 1);
}

export function calculateLevelChange(currentLevel, currentSegments, isCorrect) {
  const needed = drinksNeededForLevel(currentLevel);
  let newLevel = currentLevel;
  let newSegments = currentSegments + (isCorrect ? 1 : -1);

  if (newSegments >= needed) {
    newLevel++;
    newSegments = 0;
  } else if (newSegments < 0) {
    if (newLevel > 1) {
      newLevel--;
      const prevNeeded = drinksNeededForLevel(newLevel);
      newSegments = prevNeeded - 1;
    } else {
      newSegments = 0;
    }
  }

  return { level: newLevel, segments: newSegments };
}
