export function computeMixColor(playerMix, ingredients) {
  let r = 0, g = 0, b = 0, totalPercent = 0;

  for (const [id, percent] of Object.entries(playerMix)) {
    const ing = ingredients[id];
    if (ing && percent > 0) {
      const color = ing.color;
      r += ((color >> 16) & 0xff) * percent;
      g += ((color >> 8) & 0xff) * percent;
      b += (color & 0xff) * percent;
      totalPercent += percent;
    }
  }

  if (totalPercent === 0) return 0x88cc88;

  r = Math.min(255, Math.round(r / totalPercent));
  g = Math.min(255, Math.round(g / totalPercent));
  b = Math.min(255, Math.round(b / totalPercent));

  const avg = (r + g + b) / 3;
  r = Math.min(255, Math.round(r + (r - avg) * 0.6));
  g = Math.min(255, Math.round(g + (g - avg) * 0.6));
  b = Math.min(255, Math.round(b + (b - avg) * 0.6));

  return (r << 16) | (g << 8) | b;
}

export function computeTotalPercent(playerMix) {
  return Object.values(playerMix).reduce((sum, v) => sum + v, 0);
}
