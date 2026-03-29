import useStore from './store/useStore';
import Onboarding from './components/Onboarding';
import MenuView from './components/MenuView';
import ShoppingList from './components/ShoppingList';
import Stores from './components/Stores';
import EmailRecap from './components/EmailRecap';
import BottomNav from './components/BottomNav';

export default function App() {
  const { activeScreen } = useStore();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'onboarding': return <Onboarding />;
      case 'menu': return <MenuView />;
      case 'shopping': return <ShoppingList />;
      case 'stores': return <Stores />;
      case 'email': return <EmailRecap />;
      default: return <Onboarding />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {renderScreen()}
      <BottomNav />
    </div>
  );
}
