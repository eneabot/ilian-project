import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // === PREFERENCES ===
      preferences: {
        days: 7,
        budget: 100,
        mealType: 'équilibré',
        mealsPerDay: 3,
        people: 2,
        cuisineStyle: 'française',
        radius: 20,
        city: '',
      },
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // === GENERATED MENU ===
      generatedMenu: null,
      setGeneratedMenu: (menu) => set({ generatedMenu: menu }),
      clearMenu: () => set({ generatedMenu: null }),

      // === CURRENT DAY (navigation) ===
      currentDay: 0,
      setCurrentDay: (day) => set({ currentDay: day }),

      // === SHOPPING LIST ===
      shoppingList: [],
      setShoppingList: (list) => set({ shoppingList: list }),
      toggleShoppingItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),

      // === ACTIVE SCREEN ===
      activeScreen: 'onboarding',
      setActiveScreen: (screen) => set({ activeScreen: screen }),

      // === NOTIFICATIONS ===
      notificationBadge: false,
      setNotificationBadge: (val) => set({ notificationBadge: val }),
    }),
    {
      name: 'menu-planner-storage',
    }
  )
);

export default useStore;
