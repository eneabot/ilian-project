import { dailyProducts } from '../data/dailyProducts';

const CATEGORY_LABELS = {
  légumes: 'Fruits & Légumes',
  viandes: 'Viandes & Poissons',
  poissons: 'Viandes & Poissons',
  laitiers: 'Produits Laitiers',
  épicerie: 'Épicerie',
  snacks: 'Snacks & Compléments',
  hygiène: 'Hygiène / Entretien',
  entretien: 'Hygiène / Entretien',
};

const CATEGORY_ORDER = [
  'Fruits & Légumes',
  'Viandes & Poissons',
  'Produits Laitiers',
  'Épicerie',
  'Snacks & Compléments',
  'Hygiène / Entretien',
];

export function buildShoppingList(menu, preferences) {
  const { people, days } = preferences;
  const ingredientMap = {};

  menu.forEach((dayMenu) => {
    const meals = [dayMenu.breakfast, dayMenu.lunch, dayMenu.dinner].filter(Boolean);
    meals.forEach((recipe) => {
      if (!recipe) return;
      recipe.ingredients.forEach((ing) => {
        const key = `${ing.name}__${ing.unit}__${ing.category}`;
        const qty = recipe.perPerson ? ing.quantity * people : ing.quantity;
        if (ingredientMap[key]) {
          ingredientMap[key].quantity += qty;
        } else {
          ingredientMap[key] = {
            id: key,
            name: ing.name,
            quantity: qty,
            unit: ing.unit,
            category: CATEGORY_LABELS[ing.category] || 'Épicerie',
            checked: false,
          };
        }
      });
    });
  });

  // Round quantities
  const items = Object.values(ingredientMap).map((item) => ({
    ...item,
    quantity: Math.ceil(item.quantity * 10) / 10,
  }));

  // Group by category
  const grouped = {};
  CATEGORY_ORDER.forEach((cat) => {
    grouped[cat] = [];
  });

  items.forEach((item) => {
    const cat = item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  // Add daily products (scaled by days/7)
  const dailyItems = dailyProducts.map((p) => ({
    id: `daily_${p.id}`,
    name: p.name,
    quantity: Math.ceil(p.defaultQty * (days / 7) * people * 0.5),
    unit: p.unit,
    category: CATEGORY_LABELS[p.category] || p.category,
    checked: false,
    isDaily: true,
    icon: p.icon,
  }));

  const groupedDaily = {};
  dailyItems.forEach((item) => {
    const cat = item.category;
    if (!groupedDaily[cat]) groupedDaily[cat] = [];
    groupedDaily[cat].push(item);
  });

  return { grouped, groupedDaily };
}

export function exportShoppingList(grouped, groupedDaily) {
  let text = '🛒 LISTE DE COURSES\n\n';

  Object.entries(grouped).forEach(([cat, items]) => {
    if (items.length === 0) return;
    text += `📦 ${cat}\n`;
    items.forEach((item) => {
      const check = item.checked ? '✅' : '⬜';
      text += `  ${check} ${item.name} — ${item.quantity} ${item.unit}\n`;
    });
    text += '\n';
  });

  text += '🗓️ QUOTIDIEN\n';
  Object.entries(groupedDaily).forEach(([cat, items]) => {
    if (items.length === 0) return;
    text += `  📦 ${cat}\n`;
    items.forEach((item) => {
      text += `    ⬜ ${item.name} — ${item.quantity} ${item.unit}\n`;
    });
  });

  return text;
}

export { CATEGORY_ORDER };
