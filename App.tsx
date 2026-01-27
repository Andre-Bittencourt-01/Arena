import React, { useState } from 'react';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventResults from './pages/EventResults'; // Import new page
import Picks from './pages/Picks';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import StoryCreator from './pages/StoryCreator';
import CardSummary from './pages/CardSummary';
import Admin from './pages/Admin';
import { DataProvider } from './contexts/DataContext';

// Define available screens
export type Screen = 'login' | 'register' | 'forgot-password' | 'dashboard' | 'events' | 'event-results' | 'picks' | 'ranking' | 'profile' | 'story' | 'summary' | 'admin';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const handleNavigateToResult = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentScreen('event-results');
    window.scrollTo(0, 0);
  };

  return (
    <DataProvider>
      {currentScreen === 'login' ? (
        <Login onLogin={() => handleNavigate('dashboard')} onNavigate={handleNavigate} />
      ) : currentScreen === 'register' ? (
        <Register onRegister={() => handleNavigate('dashboard')} onNavigate={handleNavigate} />
      ) : currentScreen === 'forgot-password' ? (
        <ForgotPassword onNavigate={handleNavigate} />
      ) : (
        <Layout currentScreen={currentScreen} onNavigate={handleNavigate}>
          {currentScreen === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentScreen === 'events' && <Events onNavigate={handleNavigate} onNavigateToResult={handleNavigateToResult} />}
          {currentScreen === 'event-results' && selectedEventId && <EventResults onNavigate={handleNavigate} eventId={selectedEventId} />}
          {currentScreen === 'picks' && <Picks onNavigate={handleNavigate} />}
          {currentScreen === 'ranking' && <Ranking />}
          {currentScreen === 'profile' && <Profile onNavigate={handleNavigate} />}
          {currentScreen === 'story' && <StoryCreator />}
          {currentScreen === 'summary' && <CardSummary onNavigate={handleNavigate} />}
          {currentScreen === 'admin' && <Admin />}
        </Layout>
      )}
    </DataProvider>
  );
};

export default App;