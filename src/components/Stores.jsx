import useStore from '../store/useStore';

const STORES = [
  { name: 'Carrefour', icon: '🔵', color: 'text-blue-400', budget: '€€', tag: 'carrefour' },
  { name: 'Leclerc', icon: '🔵', color: 'text-blue-300', budget: '€', tag: 'E.+Leclerc' },
  { name: 'Intermarché', icon: '🔴', color: 'text-red-400', budget: '€€', tag: 'intermarche' },
  { name: 'Super U', icon: '🟡', color: 'text-yellow-400', budget: '€€', tag: 'super+u' },
  { name: 'Hyper U', icon: '🟡', color: 'text-yellow-300', budget: '€€', tag: 'hyper+u' },
  { name: 'Franprix', icon: '🟢', color: 'text-green-400', budget: '€€€', tag: 'franprix' },
  { name: 'Monoprix', icon: '🟣', color: 'text-purple-400', budget: '€€€', tag: 'monoprix' },
  { name: 'Lidl', icon: '⚡', color: 'text-yellow-500', budget: '€', tag: 'lidl' },
  { name: 'Aldi', icon: '⚡', color: 'text-orange-400', budget: '€', tag: 'aldi' },
];

const BUDGET_ORDER = [...STORES].sort((a, b) => a.budget.length - b.budget.length);

export default function Stores() {
  const { preferences } = useStore();
  const { city, radius } = preferences;

  const getOSMUrl = (storeName) => {
    if (city) {
      const query = `${storeName} near ${city}`;
      return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
    }
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(storeName)}`;
  };

  const getGoogleMapsUrl = (storeName) => {
    if (city) {
      return `https://www.google.com/maps/search/${encodeURIComponent(storeName + ' ' + city)}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(storeName)}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-400">🏪 Points de vente</h2>
        {city ? (
          <p className="text-gray-400 text-sm">
            Magasins à ~{radius} km de <span className="text-white font-medium">{city}</span>
          </p>
        ) : (
          <p className="text-gray-400 text-sm">Classement par budget estimé</p>
        )}
      </div>

      {!city && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
          <p className="text-amber-400 text-sm">
            💡 Configurez votre ville dans les préférences pour afficher les magasins à proximité.
          </p>
        </div>
      )}

      {city ? (
        /* Store list with OSM links */
        <div className="space-y-3">
          {STORES.map((store) => (
            <div key={store.name} className="bg-[#1a1a1a] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{store.icon}</span>
                  <div>
                    <div className={`font-bold ${store.color}`}>{store.name}</div>
                    <div className="text-xs text-gray-500">Budget estimé : {store.budget}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-600">~{radius} km</span>
              </div>
              <div className="flex gap-2">
                <a
                  href={getOSMUrl(store.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 py-2 rounded-xl transition-colors"
                >
                  🗺️ OpenStreetMap
                </a>
                <a
                  href={getGoogleMapsUrl(store.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 py-2 rounded-xl transition-colors"
                >
                  📍 Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Budget ranking */
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Classement par budget
          </h3>
          {BUDGET_ORDER.map((store, index) => (
            <div key={store.name} className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-700 w-8">#{index + 1}</span>
              <span className="text-2xl">{store.icon}</span>
              <div className="flex-1">
                <div className={`font-bold ${store.color}`}>{store.name}</div>
                <div className="text-xs text-gray-500">Budget moyen</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white">{store.budget}</div>
                {[...store.budget].map((_, i) => (
                  <span key={i} className="text-emerald-400 text-xs">●</span>
                ))}
                {[...Array(3 - store.budget.length)].map((_, i) => (
                  <span key={i} className="text-gray-700 text-xs">●</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget tip */}
      <div className="mt-6 bg-[#1a1a1a] rounded-2xl p-4 border border-emerald-500/20">
        <h3 className="font-semibold text-emerald-400 mb-2">💡 Astuce budget</h3>
        <p className="text-gray-400 text-sm">
          Budget configuré : <span className="text-white font-bold">{preferences.budget}€</span> pour {preferences.people} personne{preferences.people > 1 ? 's' : ''}.
          Soit <span className="text-emerald-400 font-bold">
            ~{Math.round(preferences.budget / preferences.people / preferences.days)}€/personne/jour
          </span>.
        </p>
      </div>
    </div>
  );
}
