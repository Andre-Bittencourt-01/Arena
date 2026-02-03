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
import Leagues from './pages/Leagues';
import LeagueDetails from './pages/LeagueDetails';
import JoinLeague from './pages/JoinLeague';
import EditLeague from './pages/EditLeague';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';


// Define available screens
export type Screen = 'login' | 'register' | 'forgot-password' | 'dashboard' | 'events' | 'event-results' | 'picks' | 'ranking' | 'profile' | 'story' | 'summary' | 'admin' | 'leagues' | 'league-details' | 'join-league' | 'edit-league';


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setInviteCode(joinCode);
      setCurrentScreen('join-league');
    }
  }, []);



  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const handleNavigateToResult = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentScreen('event-results');
    window.scrollTo(0, 0);
  };

  const handleSelectLeague = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setCurrentScreen('league-details');
    window.scrollTo(0, 0);
  };

  const handleJoinSuccess = () => {
    setCurrentScreen('leagues');
    window.scrollTo(0, 0);
  };

  const handleEditLeague = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setCurrentScreen('edit-league');
    window.scrollTo(0, 0);
  };


  return (
    <AuthProvider>
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
            {currentScreen === 'story' && <StoryCreator onNavigate={handleNavigate} />}
            {currentScreen === 'summary' && <CardSummary onNavigate={handleNavigate} />}

            {currentScreen === 'admin' && <Admin onNavigate={handleNavigate} />}
            {currentScreen === 'leagues' && <Leagues onNavigate={handleNavigate} onSelectLeague={handleSelectLeague} onEditLeague={handleEditLeague} />}
            {currentScreen === 'league-details' && <LeagueDetails leagueId={selectedLeagueId || ''} onNavigate={handleNavigate} onBack={() => handleNavigate('leagues')} />}
            {currentScreen === 'join-league' && <JoinLeague inviteCode={inviteCode} onNavigate={handleNavigate} onJoinSuccess={handleJoinSuccess} />}
            {currentScreen === 'edit-league' && selectedLeagueId && <EditLeague leagueId={selectedLeagueId} onBack={() => handleNavigate('leagues')} />}

          </Layout>
        )}
      </DataProvider>
    </AuthProvider>
  );
};

export default App;