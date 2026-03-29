import useStore from '../store/useStore';

const NAV_ITEMS = [
  { id: 'menu', label: 'Menu', icon: '📅' },
  { id: 'shopping', label: 'Courses', icon: '🛒' },
  { id: 'stores', label: 'Magasins', icon: '🏪' },
  { id: 'email', label: 'Email', icon: '📧' },
];

export default function BottomNav() {
  const { activeScreen, setActiveScreen } = useStore();

  if (activeScreen === 'onboarding') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-gray-800 z-50">
      <div className="flex max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all ${
              activeScreen === item.id
                ? 'text-emerald-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
            {activeScreen === item.id && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
