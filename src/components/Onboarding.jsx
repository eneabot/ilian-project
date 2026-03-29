import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { generateMenu } from '../utils/menuGenerator';
import { buildShoppingList } from '../utils/shoppingList';

const CUISINES = [
  'française', 'italienne', 'asiatique', 'japonaise',
  'mexicaine', 'américaine', 'végétarienne', 'végane', 'flexitarienne'
];

const MEAL_TYPES = ['sain', 'équilibré', 'calorique'];

function CityAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    // Reset city object when typing
    onChange({ name: q, country: '', postcode: '', lat: null, lon: null });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&featuretype=city`;
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'fr', 'User-Agent': 'MenuPlannerApp/1.0' },
        });
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const selectSuggestion = (item) => {
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || item.display_name.split(',')[0];
    const country = addr.country || '';
    const state = addr.state || addr.region || '';
    const postcode = addr.postcode || '';
    const displayLabel = [city, state, country].filter(Boolean).join(', ') + (postcode ? ` — ${postcode}` : '');

    setQuery(displayLabel);
    setOpen(false);
    onChange({
      name: city,
      country,
      postcode,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder="Ex: Paris, Lyon, Bordeaux..."
        value={query}
        onChange={handleInput}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-2 border border-gray-700 focus:border-emerald-500 focus:outline-none placeholder-gray-600"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-gray-500 text-xs">⏳</div>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((item) => {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.village || addr.municipality || item.display_name.split(',')[0];
            const country = addr.country || '';
            const state = addr.state || addr.region || '';
            const postcode = addr.postcode || '';
            const label = [city, state, country].filter(Boolean).join(', ') + (postcode ? ` — ${postcode}` : '');
            return (
              <button
                key={item.place_id}
                type="button"
                onMouseDown={() => selectSuggestion(item)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-emerald-500/20 hover:text-white transition-colors border-b border-gray-800 last:border-0"
              >
                📍 {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Onboarding() {
  const { preferences, setPreferences, setGeneratedMenu, setShoppingList, setActiveScreen } = useStore();

  // Migrate old string preferences to new array/object format
  const initPrefs = {
    ...preferences,
    mealTypes: Array.isArray(preferences.mealTypes)
      ? preferences.mealTypes
      : preferences.mealType
        ? [preferences.mealType]
        : ['équilibré'],
    cuisineStyles: Array.isArray(preferences.cuisineStyles)
      ? preferences.cuisineStyles
      : preferences.cuisineStyle
        ? [preferences.cuisineStyle]
        : ['française'],
    city: typeof preferences.city === 'object' && preferences.city !== null
      ? preferences.city
      : { name: preferences.city || '', country: '', postcode: '', lat: null, lon: null },
  };

  const [form, setForm] = useState(initPrefs);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleMealType = (type) => {
    setForm((f) => {
      const current = f.mealTypes || [];
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...f, mealTypes: next.length > 0 ? next : [type] };
    });
  };

  const toggleCuisineStyle = (style) => {
    setForm((f) => {
      const current = f.cuisineStyles || [];
      const next = current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style];
      return { ...f, cuisineStyles: next.length > 0 ? next : [style] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPreferences(form);
    const menu = generateMenu(form);
    setGeneratedMenu(menu);
    const { grouped, groupedDaily } = buildShoppingList(menu, form);
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

        {/* Type de repas — multi-select */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-1">
            🥦 Types de repas
          </label>
          <p className="text-xs text-gray-500 mb-3">Sélectionnez un ou plusieurs types (mix)</p>
          <div className="flex gap-2">
            {MEAL_TYPES.map((t) => {
              const active = (form.mealTypes || []).includes(t);
              return (
                <button
                  key={t} type="button"
                  onClick={() => toggleMealType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all
                    ${active
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-400'
                      : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}
                >
                  {t}
                </button>
              );
            })}
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

        {/* Styles de cuisine — multi-select chips */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-1">
            🍴 Styles de cuisine
          </label>
          <p className="text-xs text-gray-500 mb-3">Sélectionnez un ou plusieurs styles</p>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => {
              const active = (form.cuisineStyles || []).includes(c);
              return (
                <button
                  key={c} type="button"
                  onClick={() => toggleCuisineStyle(c)}
                  className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all
                    ${active
                      ? 'bg-emerald-500 text-white font-semibold ring-2 ring-emerald-400'
                      : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}
                >
                  {c}
                </button>
              );
            })}
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

        {/* Localisation — autocomplete */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-emerald-400 mb-2">
            🏙️ Votre ville
          </label>
          {form.city?.lat && (
            <div className="mb-2 text-xs text-emerald-400 flex items-center gap-1">
              ✅ {form.city.name}, {form.city.country}
              {form.city.postcode && ` — ${form.city.postcode}`}
            </div>
          )}
          <CityAutocomplete
            value={form.city}
            onChange={(city) => update('city', city)}
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
