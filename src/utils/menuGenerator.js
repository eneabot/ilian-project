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

/**
 * Filter recipes by:
 * - mealTypes: array of types (OR logic)
 * - cuisineStyles: array of styles (OR logic)
 * - mealSlot: 'breakfast' | 'lunch' | 'dinner'
 */
function filterRecipes(mealTypes, cuisineStyles, mealSlot) {
  // Normalize to arrays
  const types = Array.isArray(mealTypes) ? mealTypes : [mealTypes];
  const styles = Array.isArray(cuisineStyles) ? cuisineStyles : [cuisineStyles];

  return recipes.filter((r) => {
    const matchType = types.some((t) => r.type.includes(t));
    const matchCuisine =
      styles.includes('toutes') ||
      styles.some((s) => r.style.includes(s));
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
  // Support both old (mealType/cuisineStyle) and new (mealTypes/cuisineStyles) shapes
  const mealTypes = preferences.mealTypes ?? (preferences.mealType ? [preferences.mealType] : ['équilibré']);
  const cuisineStyles = preferences.cuisineStyles ?? (preferences.cuisineStyle ? [preferences.cuisineStyle] : ['française']);
  const { days, mealsPerDay } = preferences;

  const breakfastPool = filterRecipes(mealTypes, cuisineStyles, 'breakfast');
  const lunchPool = filterRecipes(mealTypes, cuisineStyles, 'lunch');
  const dinnerPool = filterRecipes(mealTypes, cuisineStyles, 'dinner');

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

/**
 * Get a replacement recipe compatible with the original's style/type/slot.
 * excludeId: the current recipe id to avoid returning same one.
 */
export function getReplacementRecipe(originalRecipe, mealSlot, excludeId) {
  const styles = originalRecipe.style || [];
  const types = originalRecipe.type || [];

  // Try to find matching recipe
  let candidates = recipes.filter((r) => {
    if (r.id === excludeId) return false;
    const matchMeal = r.meal.includes(mealSlot);
    const matchType = types.some((t) => r.type.includes(t));
    const matchStyle = styles.some((s) => r.style.includes(s));
    return matchMeal && (matchType || matchStyle);
  });

  if (candidates.length === 0) {
    // Wider fallback: just same meal slot
    candidates = recipes.filter((r) => r.id !== excludeId && r.meal.includes(mealSlot));
  }

  if (candidates.length === 0) return originalRecipe;

  const shuffled = shuffle(candidates);
  return shuffled[0];
}

export function getVeganAlternative(recipe) {
  if (!recipe.isAnimal) return null;
  if (recipe.veganAlternative) return recipe.veganAlternative;
  return null;
}
