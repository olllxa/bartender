export const COCKTAILS = [
  {
    id: 'mojito',
    name: 'Мохито',
    ingredients: [
      { id: 'white_rum',   percent: 40 },
      { id: 'lime_juice',  percent: 20 },
      { id: 'mint_syrup',  percent: 10 },
      { id: 'sugar_syrup', percent: 10 },
      { id: 'soda',        percent: 20 },
    ],
  },
  {
    id: 'margarita',
    name: 'Маргарита',
    ingredients: [
      { id: 'tequila',    percent: 50 },
      { id: 'lime_juice', percent: 25 },
      { id: 'triple_sec', percent: 25 },
    ],
  },
  {
    id: 'martini',
    name: 'Мартини',
    ingredients: [
      { id: 'gin',          percent: 70 },
      { id: 'dry_vermouth', percent: 30 },
    ],
  },
  {
    id: 'old_fashioned',
    name: 'Олд Фешен',
    ingredients: [
      { id: 'whiskey',     percent: 70 },
      { id: 'sugar_syrup', percent: 15 },
      { id: 'bitters',     percent: 15 },
    ],
  },
  {
    id: 'negroni',
    name: 'Негрони',
    ingredients: [
      { id: 'gin',            percent: 34 },
      { id: 'campari',        percent: 33 },
      { id: 'sweet_vermouth', percent: 33 },
    ],
  },
  {
    id: 'daiquiri',
    name: 'Дайкири',
    ingredients: [
      { id: 'white_rum',  percent: 60 },
      { id: 'lime_juice', percent: 40 },
    ],
  },
  {
    id: 'whiskey_sour',
    name: 'Виски Сауэр',
    ingredients: [
      { id: 'whiskey',     percent: 50 },
      { id: 'lemon_juice', percent: 25 },
      { id: 'sugar_syrup', percent: 25 },
    ],
  },
  {
    id: 'pina_colada',
    name: 'Пина Колада',
    ingredients: [
      { id: 'white_rum',       percent: 30 },
      { id: 'coconut_cream',   percent: 30 },
      { id: 'pineapple_juice', percent: 40 },
    ],
  },
  {
    id: 'cosmopolitan',
    name: 'Космополитен',
    ingredients: [
      { id: 'vodka',          percent: 40 },
      { id: 'cranberry_juice', percent: 30 },
      { id: 'lime_juice',     percent: 20 },
      { id: 'triple_sec',     percent: 10 },
    ],
  },
  {
    id: 'bloody_mary',
    name: 'Кровавая Мэри',
    ingredients: [
      { id: 'vodka',        percent: 30 },
      { id: 'tomato_juice', percent: 50 },
      { id: 'lemon_juice',  percent: 10 },
      { id: 'bitters',      percent: 10 },
    ],
  },
];

export function getCocktail(id) {
  return COCKTAILS.find(c => c.id === id);
}

export function getRandomCocktail() {
  return COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)];
}

export function getCocktailColor(cocktail, ingredients) {
  if (!cocktail || !cocktail.ingredients || cocktail.ingredients.length === 0) return 0xffffff;
  let r = 0, g = 0, b = 0, total = 0;
  for (const ing of cocktail.ingredients) {
    const ingredient = ingredients[ing.id];
    if (ingredient) {
      const color = ingredient.color;
      r += ((color >> 16) & 0xff) * ing.percent;
      g += ((color >> 8) & 0xff) * ing.percent;
      b += (color & 0xff) * ing.percent;
      total += ing.percent;
    }
  }
  if (total === 0) return 0xffffff;
  r = Math.round(r / total);
  g = Math.round(g / total);
  b = Math.round(b / total);
  return (r << 16) | (g << 8) | b;
}
