import { useState, useEffect } from 'react';
import useStore from '../store/useStore';

const FAKE_MARKETS = [
  {
    id: 'fake-1',
    name: 'Marché central',
    address: 'Place du centre',
    days: 'Mardi, Vendredi, Dimanche',
    hours: '7h – 13h',
  },
  {
    id: 'fake-2',
    name: 'Marché bio du quartier',
    address: 'Rue des fleurs',
    days: 'Samedi',
    hours: '8h – 14h',
  },
  {
    id: 'fake-3',
    name: 'Marché fermier',
    address: 'Avenue de la gare',
    days: 'Mercredi, Samedi',
    hours: '6h30 – 12h30',
  },
  {
    id: 'fake-4',
    name: 'Marché des producteurs',
    address: 'Esplanade du commerce',
    days: 'Voir sur place',
    hours: 'Se renseigner',
  },
];

function MarketCard({ market }) {
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    (market.name || 'marché') + (market.address ? ', ' + market.address : '')
  )}`;

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-white text-base">{market.name || 'Marché'}</h3>
          {market.address && (
            <p className="text-xs text-gray-400 mt-0.5">📍 {market.address}</p>
          )}
        </div>
        <span className="text-2xl ml-2">🛒</span>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-emerald-400 text-xs">📅</span>
          <span className="text-gray-300 text-xs">
            <span className="text-gray-500">Jours :</span> {market.days || 'Voir sur place'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-emerald-400 text-xs">⏰</span>
          <span className="text-gray-300 text-xs">
            <span className="text-gray-500">Horaires :</span> {market.hours || 'Se renseigner'}
          </span>
        </div>
      </div>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 py-2 rounded-xl transition-colors"
      >
        📍 Voir sur Google Maps
      </a>
    </div>
  );
}

export default function Markets() {
  const { preferences } = useStore();
  const { city, radius } = preferences;

  // city can be object or legacy string
  const cityObj = typeof city === 'object' && city !== null ? city : { name: city || '', lat: null, lon: null };
  const hasCoords = !!cityObj.lat && !!cityObj.lon;
  const cityName = cityObj.name || '';

  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedFake, setUsedFake] = useState(false);

  useEffect(() => {
    if (hasCoords) {
      fetchOverpassMarkets();
    } else {
      setUsedFake(true);
      setMarkets(FAKE_MARKETS);
    }
  }, [cityObj.lat, cityObj.lon, radius]);

  const fetchOverpassMarkets = async () => {
    setLoading(true);
    setError(null);
    setUsedFake(false);
    try {
      const radiusM = (radius || 20) * 1000;
      const query = `[out:json];node["amenity"="marketplace"](around:${radiusM},${cityObj.lat},${cityObj.lon});out;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      const elements = data.elements || [];

      if (elements.length === 0) {
        // Fallback to fake with city name
        setUsedFake(true);
        const fakesWithCity = FAKE_MARKETS.map((m) => ({
          ...m,
          address: `${m.address}, ${cityName}`,
        }));
        setMarkets(fakesWithCity);
      } else {
        const parsed = elements.map((el) => {
          const tags = el.tags || {};
          const name = tags.name || tags['name:fr'] || 'Marché';
          const addrParts = [
            tags['addr:housenumber'],
            tags['addr:street'],
            tags['addr:city'],
          ].filter(Boolean);
          const address = addrParts.length > 0 ? addrParts.join(' ') : null;

          // OSM opening hours
          const oh = tags.opening_hours;
          let days = 'Voir sur place';
          let hours = 'Se renseigner';
          if (oh) {
            // Try to split days from hours (basic heuristic)
            hours = oh;
            days = 'Voir sur place';
          }
          if (tags['market:days']) {
            days = tags['market:days'];
          }
          if (tags['market:times']) {
            hours = tags['market:times'];
          }

          return {
            id: `osm-${el.id}`,
            name,
            address,
            days,
            hours,
            lat: el.lat,
            lon: el.lon,
          };
        });
        setMarkets(parsed);
      }
    } catch (err) {
      setError('Impossible de charger les marchés via Overpass API.');
      setUsedFake(true);
      setMarkets(FAKE_MARKETS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-400">🏬 Marchés</h2>
        {cityName ? (
          <p className="text-gray-400 text-sm">
            Marchés à ~{radius} km de <span className="text-white font-medium">{cityName}</span>
          </p>
        ) : (
          <p className="text-gray-400 text-sm">Marchés à proximité</p>
        )}
      </div>

      {/* No city warning */}
      {!cityName && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
          <p className="text-amber-400 text-sm">
            💡 Configurez votre ville dans les préférences pour trouver des marchés réels à proximité.
          </p>
        </div>
      )}

      {/* No coords warning */}
      {cityName && !hasCoords && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
          <p className="text-blue-400 text-sm">
            ℹ️ Sélectionnez votre ville via l'autocomplétion pour activer la recherche géolocalisée de marchés.
          </p>
        </div>
      )}

      {/* Fake data notice */}
      {usedFake && cityName && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-3 mb-4">
          <p className="text-gray-400 text-xs">
            📋 Données illustratives. Activez l'autocomplétion ville pour des résultats réels.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Recherche des marchés...</p>
        </div>
      )}

      {/* Markets list */}
      {!loading && markets.length > 0 && (
        <div className="space-y-3">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}

      {!loading && markets.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">🔍</p>
          <p className="text-gray-400">Aucun marché trouvé dans ce rayon.</p>
          <p className="text-gray-600 text-sm mt-1">Essayez d'augmenter le rayon dans vos préférences.</p>
        </div>
      )}

      {/* Refresh button when coords available */}
      {hasCoords && !loading && (
        <button
          onClick={fetchOverpassMarkets}
          className="mt-6 w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-emerald-400 py-3 rounded-2xl text-sm transition-colors border border-emerald-500/20 flex items-center justify-center gap-2"
        >
          🔄 Actualiser les marchés
        </button>
      )}
    </div>
  );
}
