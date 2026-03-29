import { recipes } from '../data/recipes';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterRecipes(mealType, cuisineStyle, mealSlot) {
  return recipes.filter((r) => {
    const matchType = r.type.includes(mealType);
    const matchCuisine =
      cuisineStyle === 'toutes' || r.style.includes(cuisineStyle);
    const matchMeal = r.meal.includes(mealSlot);
    return matchType && matchCuisine && matchMeal;
  });
}

function pickRecipe(pool, usedIds) {
  const available = pool.filter((r) => !usedIds.has(r.id));
  if (available.length === 0) {
    // reset if exhausted
    usedIds.clear();
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const shuffled = shuffle(available);
  return shuffled[0];
}

export function generateMenu(preferences) {
  const { days, mealType, mealsPerDay, cuisineStyle } = preferences;

  const breakfastPool = filterRecipes(mealType, cuisineStyle, 'breakfast');
  const lunchPool = filterRecipes(mealType, cuisineStyle, 'lunch');
  const dinnerPool = filterRecipes(mealType, cuisineStyle, 'dinner');

  // Fallback to wider pool if filtered is empty
  const bfFallback = recipes.filter((r) => r.meal.includes('breakfast'));
  const lunchFallback = recipes.filter((r) => r.meal.includes('lunch'));
  const dinnerFallback = recipes.filter((r) => r.meal.includes('dinner'));

  const bfList = breakfastPool.length >= 3 ? breakfastPool : bfFallback;
  const lunchList = lunchPool.length >= 3 ? lunchPool : lunchFallback;
  const dinnerList = dinnerPool.length >= 3 ? dinnerPool : dinnerFallback;

  const usedBf = new Set();
  const usedLunch = new Set();
  const usedDinner = new Set();

  const today = new Date();
  const menu = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = DAYS_FR[date.getDay()];

    const dayMenu = {
      day: i + 1,
      dayName,
      date: date.toLocaleDateString('fr-FR'),
    };

    if (mealsPerDay === 3) {
      const bf = pickRecipe(bfList, usedBf);
      usedBf.add(bf.id);
      dayMenu.breakfast = bf;
    }

    const lunch = pickRecipe(lunchList, usedLunch);
    usedLunch.add(lunch.id);
    dayMenu.lunch = lunch;

    const dinner = pickRecipe(dinnerList, usedDinner);
    usedDinner.add(dinner.id);
    dayMenu.dinner = dinner;

    menu.push(dayMenu);
  }

  return menu;
}

export function getVeganAlternative(recipe) {
  if (!recipe.isAnimal) return null;
  if (recipe.veganAlternative) return recipe.veganAlternative;
  return null;
}
