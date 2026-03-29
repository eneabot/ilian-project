import { useState } from 'react';
import useStore from '../store/useStore';
import { generateMenu } from '../utils/menuGenerator';
import { buildShoppingList } from '../utils/shoppingList';

const CUISINES = [
  'française', 'italienne', 'asiatique', 'japonaise',
  'mexicaine', 'américaine', 'végétarienne', 'végane', 'flexitarienne'
];

const MEAL_TYPES = ['sain', 'équilibré', 'calorique'];

export default function Onboarding() {
  const { preferences, setPreferences, setGeneratedMenu, setShoppingList, setActiveScreen } = useStore();
  const [form, setForm] = useState(preferences);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setPreferences(form);
    const menu = generateMenu(form);
    setGeneratedMenu(menu);
    const { grouped, groupedDaily } = buildShoppingList(menu, form);
    // flatten to array
    const allItems = [
      ...Object.values(grouped).flat(),
      ...Object.values(groupedDaily).flat(),
    ];
    setShoppingList(allItems);
    setActiveScreen('menu');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-8 max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-400 mb-1">🥗 Menu Planner</h1>
        <p className="text-gray-400 text-sm">Configurez vos préférences pour générer votre planning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Durée */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-2">
            📅 Durée du planning — <span className="text-white">{form.days} jours</span>
          </label>
          <input
            type="range" min="1" max="30" value={form.days}
            onChange={(e) => update('days', +e.target.value)}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 jour</span><span>30 jours</span>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-2">
            💶 Budget total
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min="10" max="2000" value={form.budget}
              onChange={(e) => update('budget', +e.target.value)}
              className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-2 border border-gray-700 focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-gray-400">€</span>
          </div>
        </div>

        {/* Type de repas */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-3">
            🥦 Type de repas
          </label>
          <div className="flex gap-2">
            {MEAL_TYPES.map((t) => (
              <button
                key={t} type="button"
                onClick={() => update('mealType', t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all
                  ${form.mealType === t
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Nombre de repas */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-3">
            🍽️ Repas par jour
          </label>
          <div className="flex gap-3">
            {[2, 3].map((n) => (
              <button
                key={n} type="button"
                onClick={() => update('mealsPerDay', n)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all
                  ${form.mealsPerDay === n
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Nombre de personnes */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-2">
            👥 Nombre de personnes — <span className="text-white">{form.people}</span>
          </label>
          <input
            type="range" min="1" max="10" value={form.people}
            onChange={(e) => update('people', +e.target.value)}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span><span>10</span>
          </div>
        </div>

        {/* Style de cuisine */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-3">
            🍴 Style de cuisine
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => (
              <button
                key={c} type="button"
                onClick={() => update('cuisineStyle', c)}
                className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all
                  ${form.cuisineStyle === c
                    ? 'bg-emerald-500 text-white font-semibold'
                    : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Rayon */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-2">
            📍 Rayon de recherche — <span className="text-white">{form.radius} km</span>
          </label>
          <input
            type="range" min="5" max="50" step="5" value={form.radius}
            onChange={(e) => update('radius', +e.target.value)}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 km</span><span>50 km</span>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-2">
            🏙️ Votre ville
          </label>
          <input
            type="text" placeholder="Ex: Paris, Lyon, Bordeaux..."
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-2 border border-gray-700 focus:border-emerald-500 focus:outline-none placeholder-gray-600"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          ✨ Générer mon menu
        </button>
      </form>
    </div>
  );
}
