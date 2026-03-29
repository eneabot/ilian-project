import { useState } from 'react';
import useStore from '../store/useStore';
import { buildShoppingList, exportShoppingList, CATEGORY_ORDER } from '../utils/shoppingList';
import { dailyProducts } from '../data/dailyProducts';

const CATEGORY_ICONS = {
  'Fruits & Légumes': '🥬',
  'Viandes & Poissons': '🥩',
  'Produits Laitiers': '🧀',
  'Épicerie': '🛒',
  'Snacks & Compléments': '🍿',
  'Hygiène / Entretien': '🧼',
};

export default function ShoppingList() {
  const { generatedMenu, preferences, shoppingList, setShoppingList, toggleShoppingItem } = useStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');

  if (!generatedMenu) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">🛒</p>
          <p>Générez d'abord un menu !</p>
        </div>
      </div>
    );
  }

  // Build fresh from menu
  const { grouped, groupedDaily } = buildShoppingList(generatedMenu, preferences);

  // Merge checked state from store
  const checkedMap = {};
  shoppingList.forEach((item) => {
    checkedMap[item.id] = item.checked;
  });

  const toggle = (id) => toggleShoppingItem(id);

  const handleExport = () => {
    // Rebuild with checked state
    const enrichedGrouped = {};
    CATEGORY_ORDER.forEach((cat) => {
      enrichedGrouped[cat] = (grouped[cat] || []).map((item) => ({
        ...item,
        checked: checkedMap[item.id] || false,
      }));
    });

    const enrichedDaily = {};
    Object.keys(groupedDaily).forEach((cat) => {
      enrichedDaily[cat] = (groupedDaily[cat] || []).map((item) => ({
        ...item,
        checked: checkedMap[item.id] || false,
      }));
    });

    const text = exportShoppingList(enrichedGrouped, enrichedDaily);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const totalItems = Object.values(grouped).flat().length;
  const checkedItems = Object.values(grouped).flat().filter((i) => checkedMap[i.id]).length;
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-emerald-400">🛒 Liste de courses</h2>
        <p className="text-gray-400 text-sm">{checkedItems}/{totalItems} articles · {progress}%</p>
        <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        className={`w-full py-3 rounded-2xl font-semibold mb-5 transition-all ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'bg-emerald-500 hover:bg-emerald-400 text-white'
        }`}
      >
        {copied ? '✅ Copié !' : '📋 Exporter la liste'}
      </button>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['courses', 'quotidien'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-emerald-500 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
            }`}
          >
            {tab === 'courses' ? '🛒 Courses' : '🗓️ Quotidien'}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <div className="space-y-4">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat] || [];
            if (items.length === 0) return null;
            return (
              <div key={cat} className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                  <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                  <span className="font-semibold text-gray-200">{cat}</span>
                  <span className="ml-auto text-xs text-gray-500">{items.length}</span>
                </div>
                {items.map((item) => {
                  const isChecked = checkedMap[item.id] || false;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 last:border-0 hover:bg-[#222] transition-colors"
                    >
                      <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'
                      }`}>
                        {isChecked && <span className="text-white text-xs">✓</span>}
                      </span>
                      <span className={`flex-1 text-left text-sm ${isChecked ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {item.quantity} {item.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Local producers section */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-emerald-500/20">
            <h3 className="font-semibold text-emerald-400 mb-2">🌾 Producteurs locaux</h3>
            <p className="text-gray-400 text-sm">
              Favorisez les marchés locaux et AMAP pour vos fruits, légumes et fromages !
            </p>
            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span>🥕</span> Légumes de saison — marché du jeudi
              </div>
              <div className="flex items-center gap-2">
                <span>🧀</span> Fromages fermiers — fromagerie locale
              </div>
              <div className="flex items-center gap-2">
                <span>🥚</span> Œufs de poules élevées en plein air
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quotidien' && (
        <div className="space-y-4">
          {Object.entries(groupedDaily).map(([cat, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={cat} className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                  <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                  <span className="font-semibold text-gray-200">{cat}</span>
                </div>
                {items.map((item) => {
                  const isChecked = checkedMap[item.id] || false;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 last:border-0 hover:bg-[#222] transition-colors"
                    >
                      <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'
                      }`}>
                        {isChecked && <span className="text-white text-xs">✓</span>}
                      </span>
                      <span className="flex-shrink-0 text-base">{item.icon}</span>
                      <span className={`flex-1 text-left text-sm ${isChecked ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {item.quantity} × {item.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
