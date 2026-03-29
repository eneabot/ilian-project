import useStore from '../store/useStore';

const STORES = [
  { name: 'Lidl',         icon: '⚡', color: 'text-yellow-500', budget: '€',    tag: 'lidl',           coeff: 0.85 },
  { name: 'Aldi',         icon: '⚡', color: 'text-orange-400', budget: '€',    tag: 'aldi',           coeff: 0.87 },
  { name: 'Leclerc',      icon: '🔵', color: 'text-blue-300',   budget: '€',    tag: 'E.+Leclerc',     coeff: 0.90 },
  { name: 'Intermarché',  icon: '🔴', color: 'text-red-400',    budget: '€€',   tag: 'intermarche',    coeff: 0.92 },
  { name: 'Hyper U',      icon: '🟡', color: 'text-yellow-300', budget: '€€',   tag: 'hyper+u',        coeff: 0.93 },
  { name: 'Super U',      icon: '🟡', color: 'text-yellow-400', budget: '€€',   tag: 'super+u',        coeff: 0.95 },
  { name: 'Carrefour',    icon: '🔵', color: 'text-blue-400',   budget: '€€',   tag: 'carrefour',      coeff: 1.00 },
  { name: 'Franprix',     icon: '🟢', color: 'text-green-400',  budget: '€€€',  tag: 'franprix',       coeff: 1.10 },
  { name: 'Monoprix',     icon: '🟣', color: 'text-purple-400', budget: '€€€',  tag: 'monoprix',       coeff: 1.20 },
];

export default function Stores() {
  const { preferences } = useStore();
  const { city, radius, budget } = preferences;

  // city can be object or string (legacy)
  const cityName = typeof city === 'object' ? city?.name : city;

  const getOSMUrl = (storeName) => {
    if (cityName) {
      const query = `${storeName} near ${cityName}`;
      return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
    }
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(storeName)}`;
  };

  const getGoogleMapsUrl = (storeName) => {
    if (cityName) {
      return `https://www.google.com/maps/search/${encodeURIComponent(storeName + ' ' + cityName)}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(storeName)}`;
  };

  // Sort by price (cheapest first)
  const sortedByPrice = [...STORES].sort((a, b) => a.coeff - b.coeff);
  const cheapestCoeff = sortedByPrice[0].coeff;

  const estimatedPrice = (coeff) => Math.round(budget * coeff);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-400">🏪 Points de vente</h2>
        {cityName ? (
          <p className="text-gray-400 text-sm">
            Magasins à ~{radius} km de <span className="text-white font-medium">{cityName}</span>
          </p>
        ) : (
          <p className="text-gray-400 text-sm">Classement par budget estimé</p>
        )}
      </div>

      {!cityName && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
          <p className="text-amber-400 text-sm">
            💡 Configurez votre ville dans les préférences pour afficher les magasins à proximité.
          </p>
        </div>
      )}

      {/* Prix estimés — always visible */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          💰 Prix estimés pour votre budget ({budget}€)
        </h3>
        <div className="space-y-2">
          {sortedByPrice.map((store) => {
            const price = estimatedPrice(store.coeff);
            const isBest = store.coeff === cheapestCoeff;
            return (
              <div
                key={store.name}
                className={`flex items-center justify-between rounded-xl px-4 py-3
                  ${isBest ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-[#1a1a1a]'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{store.icon}</span>
                  <span className={`font-semibold ${store.color}`}>{store.name}</span>
                  {isBest && (
                    <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                      🏆 Meilleur prix
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-bold ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                    ~{price}€
                  </div>
                  <div className="text-xs text-gray-500">estimé</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recap band */}
        <div className="mt-3 bg-[#1a1a1a] rounded-xl p-3 text-xs text-gray-400 border border-gray-800">
          <span className="font-semibold text-gray-300">Si budget {budget}€ → </span>
          {sortedByPrice.slice(0, 3).map((s, i) => {
            const p = estimatedPrice(s.coeff);
            const ok = p <= budget;
            return (
              <span key={s.name}>
                {i > 0 && ' | '}
                <span className={ok ? 'text-emerald-400' : 'text-red-400'}>
                  {s.name}: ~{p}€ {ok ? '✅' : '❌'}
                </span>
              </span>
            );
          })}
          {' | '}
          {sortedByPrice.slice(-1).map((s) => {
            const p = estimatedPrice(s.coeff);
            const ok = p <= budget;
            return (
              <span key={s.name} className={ok ? 'text-emerald-400' : 'text-red-400'}>
                {s.name}: ~{p}€ {ok ? '✅' : '❌'}
              </span>
            );
          })}
        </div>
      </div>

      {cityName ? (
        /* Store list with map links */
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Localiser les magasins
          </h3>
          {STORES.map((store) => {
            const price = estimatedPrice(store.coeff);
            const isBest = store.coeff === cheapestCoeff;
            return (
              <div key={store.name} className="bg-[#1a1a1a] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{store.icon}</span>
                    <div>
                      <div className={`font-bold flex items-center gap-2 ${store.color}`}>
                        {store.name}
                        {isBest && (
                          <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                            🏆
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ~{price}€ estimé · {store.budget}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">~{radius} km</span>
                </div>
                <div className="flex gap-2 mt-3">
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
            );
          })}
        </div>
      ) : (
        /* Budget ranking (no city) */
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Classement par prix
          </h3>
          {sortedByPrice.map((store, index) => {
            const price = estimatedPrice(store.coeff);
            const isBest = index === 0;
            return (
              <div key={store.name} className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-700 w-8">#{index + 1}</span>
                <span className="text-2xl">{store.icon}</span>
                <div className="flex-1">
                  <div className={`font-bold flex items-center gap-2 ${store.color}`}>
                    {store.name}
                    {isBest && (
                      <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                        🏆 Meilleur
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Budget moyen · {store.budget}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                    ~{price}€
                  </div>
                  <div className="text-xs text-gray-500">estimé</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget tip */}
      <div className="mt-6 bg-[#1a1a1a] rounded-2xl p-4 border border-emerald-500/20">
        <h3 className="font-semibold text-emerald-400 mb-2">💡 Astuce budget</h3>
        <p className="text-gray-400 text-sm">
          Budget configuré : <span className="text-white font-bold">{budget}€</span> pour {preferences.people} personne{preferences.people > 1 ? 's' : ''}.
          Soit <span className="text-emerald-400 font-bold">
            ~{Math.round(budget / preferences.people / preferences.days)}€/personne/jour
          </span>.
        </p>
      </div>
    </div>
  );
}
