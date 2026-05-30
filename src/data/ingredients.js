export const INGREDIENTS = {
  white_rum:        { id: 'white_rum',        name: 'Белый ром',        color: 0xe8d8b0 },
  vodka:            { id: 'vodka',            name: 'Водка',            color: 0xe0e8f0 },
  gin:              { id: 'gin',              name: 'Джин',             color: 0xe8f0e8 },
  whiskey:          { id: 'whiskey',          name: 'Виски',            color: 0xcc7722 },
  tequila:          { id: 'tequila',          name: 'Текила',           color: 0xf5deb3 },
  triple_sec:       { id: 'triple_sec',       name: 'Трипл Сек',        color: 0xffd700 },
  dry_vermouth:     { id: 'dry_vermouth',     name: 'Сухой Вермут',     color: 0xf0e8d8 },
  sweet_vermouth:   { id: 'sweet_vermouth',   name: 'Сладкий Вермут',   color: 0x8b4513 },
  campari:          { id: 'campari',          name: 'Кампари',          color: 0xdc143c },
  lime_juice:       { id: 'lime_juice',       name: 'Сок лайма',        color: 0x90ee90 },
  lemon_juice:      { id: 'lemon_juice',      name: 'Сок лимона',       color: 0xffff99 },
  cranberry_juice:  { id: 'cranberry_juice',  name: 'Клюквенный сок',   color: 0xcd5c5c },
  tomato_juice:     { id: 'tomato_juice',     name: 'Томатный сок',     color: 0xff6347 },
  pineapple_juice:  { id: 'pineapple_juice',  name: 'Ананасовый сок',   color: 0xffd700 },
  coconut_cream:    { id: 'coconut_cream',    name: 'Кокосовое молоко', color: 0xfff5ee },
  mint_syrup:       { id: 'mint_syrup',       name: 'Мятный сироп',     color: 0x00ff7f },
  sugar_syrup:      { id: 'sugar_syrup',      name: 'Сахарный сироп',   color: 0xfffff0 },
  soda:             { id: 'soda',             name: 'Содовая',          color: 0xddeeff },
  bitters:          { id: 'bitters',          name: 'Биттер',           color: 0x8b0000 },
};

export function getIngredientList() {
  return Object.values(INGREDIENTS);
}

export function getIngredient(id) {
  return INGREDIENTS[id];
}
