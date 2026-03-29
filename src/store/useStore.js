import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // === PREFERENCES ===
      preferences: {
        days: 7,
        budget: 100,
        mealTypes: ['équilibré'],      // array, multi-select
        mealsPerDay: 3,
        people: 2,
        cuisineStyles: ['française'],  // array, multi-select
        radius: 20,
        city: { name: '', country: '', postcode: '', lat: null, lon: null },
      },
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // === GENERATED MENU ===
      generatedMenu: null,
      setGeneratedMenu: (menu) => set({ generatedMenu: menu }),
      clearMenu: () => set({ generatedMenu: null }),

      // Replace a single recipe in the menu
      replaceRecipe: (day, mealSlot, newRecipe) =>
        set((state) => {
          if (!state.generatedMenu) return state;
          const updated = state.generatedMenu.map((d) => {
            if (d.day === day) {
              return { ...d, [mealSlot]: newRecipe };
            }
            return d;
          });
          return { generatedMenu: updated };
        }),

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
