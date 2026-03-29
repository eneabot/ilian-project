import { useState } from 'react';
import useStore from '../store/useStore';

const MEAL_LABELS = {
  breakfast: { label: 'Petit-déjeuner', icon: '☀️' },
  lunch: { label: 'Déjeuner', icon: '🌤️' },
  dinner: { label: 'Dîner', icon: '🌙' },
};

function RecipeCard({ recipe, mealSlot, onVeganAlt }) {
  const [showAlt, setShowAlt] = useState(false);
  const isDiscovery = recipe.tags?.includes('découverte');

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{recipe.icon || '🍽️'}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{recipe.name}</span>
              {isDiscovery && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  ✨ Découverte
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 capitalize">{recipe.style?.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full transition-colors"
        >
          📖 Voir la recette
        </a>

        {recipe.isAnimal && recipe.veganAlternative && (
          <button
            onClick={() => setShowAlt(!showAlt)}
            className="text-xs text-green-400 hover:text-green-300 bg-green-500/10 px-3 py-1 rounded-full transition-colors"
          >
            🌿 Alternative végétale
          </button>
        )}
      </div>

      {showAlt && recipe.veganAlternative && (
        <div className="mt-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
          <p className="text-sm text-green-300">
            <span className="font-semibold">🌿 Alternative : </span>
            {recipe.veganAlternative}
          </p>
        </div>
      )}
    </div>
  );
}

export default function MenuView() {
  const { generatedMenu, currentDay, setCurrentDay, preferences, setActiveScreen } = useStore();

  if (!generatedMenu || generatedMenu.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-gray-400 mb-4">Aucun menu généré.</p>
        <button
          onClick={() => setActiveScreen('onboarding')}
          className="bg-emerald-500 text-white px-6 py-2 rounded-xl"
        >
          Configurer mes préférences
        </button>
      </div>
    );
  }

  const day = generatedMenu[currentDay];
  const total = generatedMenu.length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-400">📅 Menu généré</h2>
        <p className="text-gray-400 text-sm">{preferences.people} personne{preferences.people > 1 ? 's' : ''} · {total} jours</p>
      </div>

      {/* Day navigation */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
            disabled={currentDay === 0}
            className="w-10 h-10 rounded-xl bg-[#2a2a2a] text-white flex items-center justify-center disabled:opacity-30 hover:bg-emerald-500 transition-colors"
          >
            ←
          </button>

          <div className="text-center">
            <div className="text-lg font-bold text-white">Jour {day.day}</div>
            <div className="text-emerald-400 font-medium">{day.dayName}</div>
            <div className="text-xs text-gray-500">{day.date}</div>
          </div>

          <button
            onClick={() => setCurrentDay(Math.min(total - 1, currentDay + 1))}
            disabled={currentDay === total - 1}
            className="w-10 h-10 rounded-xl bg-[#2a2a2a] text-white flex items-center justify-center disabled:opacity-30 hover:bg-emerald-500 transition-colors"
          >
            →
          </button>
        </div>

        {/* Day dots */}
        <div className="flex gap-1 justify-center flex-wrap mt-2">
          {generatedMenu.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentDay(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentDay ? 'bg-emerald-400 w-4' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {preferences.mealsPerDay === 3 && day.breakfast && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{MEAL_LABELS.breakfast.icon}</span>
              <h3 className="font-bold text-gray-300">{MEAL_LABELS.breakfast.label}</h3>
            </div>
            <RecipeCard recipe={day.breakfast} mealSlot="breakfast" />
          </div>
        )}

        {day.lunch && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{MEAL_LABELS.lunch.icon}</span>
              <h3 className="font-bold text-gray-300">{MEAL_LABELS.lunch.label}</h3>
            </div>
            <RecipeCard recipe={day.lunch} mealSlot="lunch" />
          </div>
        )}

        {day.dinner && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{MEAL_LABELS.dinner.icon}</span>
              <h3 className="font-bold text-gray-300">{MEAL_LABELS.dinner.label}</h3>
            </div>
            <RecipeCard recipe={day.dinner} mealSlot="dinner" />
          </div>
        )}
      </div>

      {/* Reconfigure */}
      <button
        onClick={() => setActiveScreen('onboarding')}
        className="mt-6 w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 py-3 rounded-2xl text-sm transition-colors border border-gray-800"
      >
        ⚙️ Modifier les préférences
      </button>
    </div>
  );
}
