import React, { useState } from 'react';

// Imports verified after move to frontend/src
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
  const [selected_event_id, set_selected_event_id] = useState<string | null>(null);
  const [selected_league_id, set_selected_league_id] = useState<string | null>(null);
  const [invite_code, set_invite_code] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const join_code = params.get('join');
    if (join_code) {
      set_invite_code(join_code);
      setCurrentScreen('join-league');
    }
  }, []);



  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const handleNavigateToResult = (event_id: string) => {
    set_selected_event_id(event_id);
    setCurrentScreen('event-results');
    window.scrollTo(0, 0);
  };

  const handleSelectLeague = (league_id: string) => {
    set_selected_league_id(league_id);
    setCurrentScreen('league-details');
    window.scrollTo(0, 0);
  };

  const handleJoinSuccess = () => {
    setCurrentScreen('leagues');
    window.scrollTo(0, 0);
  };

  const handleEditLeague = (league_id: string) => {
    set_selected_league_id(league_id);
    setCurrentScreen('edit-league');
    window.scrollTo(0, 0);
  };


  return (
    <AuthProvider>
      <DataProvider>
        {currentScreen === 'login' ? (
          <Login on_login={() => handleNavigate('dashboard')} on_navigate={handleNavigate} />
        ) : currentScreen === 'register' ? (
          <Register on_register={() => handleNavigate('dashboard')} on_navigate={handleNavigate} />
        ) : currentScreen === 'forgot-password' ? (
          <ForgotPassword onNavigate={handleNavigate} />
        ) : (
          <Layout currentScreen={currentScreen} onNavigate={handleNavigate}>
            {currentScreen === 'dashboard' && <Dashboard on_navigate={handleNavigate} />}
            {currentScreen === 'events' && <Events onNavigate={handleNavigate} onNavigateToResult={handleNavigateToResult} />}
            {currentScreen === 'event-results' && selected_event_id && <EventResults onNavigate={handleNavigate} eventId={selected_event_id} />}
            {currentScreen === 'picks' && <Picks on_navigate={handleNavigate} />}
            {currentScreen === 'ranking' && <Ranking />}
            {currentScreen === 'profile' && <Profile onNavigate={handleNavigate} />}
            {currentScreen === 'story' && <StoryCreator onNavigate={handleNavigate} />}
            {currentScreen === 'summary' && <CardSummary on_navigate={handleNavigate} />}

            {currentScreen === 'admin' && <Admin onNavigate={handleNavigate} />}
            {currentScreen === 'leagues' && (
              <Leagues
                on_navigate={handleNavigate}
                on_select_league={handleSelectLeague}
                on_edit_league={handleEditLeague}
              />
            )}
            {currentScreen === 'league-details' && (
              <LeagueDetails
                league_id={selected_league_id || ''}
                onNavigate={handleNavigate}
                onBack={() => handleNavigate('leagues')}
              />
            )}
            {currentScreen === 'join-league' && (
              <JoinLeague
                invite_code={invite_code}
                onNavigate={handleNavigate}
                onJoinSuccess={handleJoinSuccess}
              />
            )}
            {currentScreen === 'edit-league' && selected_league_id && (
              <EditLeague
                league_id={selected_league_id}
                onBack={() => handleNavigate('leagues')}
              />
            )}

          </Layout>
        )}
      </DataProvider>
    </AuthProvider>
  );
};

export default App;