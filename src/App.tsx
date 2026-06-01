import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { GameProvider } from './contexts/GameContext';
import { Layout } from './components/layout/Layout';
import { WorldCupLayout } from './components/layout/WorldCupLayout';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { NotifyMe } from './pages/NotifyMe';
import { WorldCup } from './pages/WorldCup';
import { Predictions } from './pages/Predictions';
import { Rankings } from './pages/Rankings';
import { GroupFixturePage } from './pages/GroupFixturePage';
import { TeamSquadPage } from './pages/TeamSquadPage';
import { VenuesPage } from './pages/VenuesPage';
import { LeaguesTeaserPage } from './pages/LeaguesTeaserPage';
import { BasketballHub } from './pages/BasketballHub';
import { TennisHub } from './pages/TennisHub';
import { F1Hub } from './pages/F1Hub';
import { GroupDashboard } from './pages/GroupDashboard';
import { GroupDetail } from './pages/GroupDetail';
import { GroupModal } from './components/groups/GroupModal';
import { History } from './pages/History';
import { MatchPredictionPage } from './pages/MatchPredictionPage';
import { LineupsPage } from './pages/LineupsPage';
import { MarketPage } from './pages/MarketPage';
import { StorePage } from './pages/StorePage';
import { StoreAdminPage } from './pages/admin/StoreAdminPage';
import MatchDetail from './pages/MatchDetail';
import { IndustrialSim } from './pages/admin/IndustrialSim';
import { GenericLeagueHub } from './pages/GenericLeagueHub';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { TeamModalProvider } from './context/TeamModalContext';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <GameProvider>
          <TeamModalProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="leagues" element={<LeaguesTeaserPage />} />
              <Route path="leagues/:leagueId" element={<GenericLeagueHub />} />
              <Route path="basketball" element={<BasketballHub />} />
              <Route path="tennis" element={<TennisHub />} />
              <Route path="f1" element={<F1Hub />} />
              <Route path="market" element={<MarketPage />} />
              <Route path="lineups" element={<LineupsPage />} />
              <Route path="rankings" element={<Rankings />} />
              <Route path="store" element={<StorePage />} />
              <Route path="admin/store" element={<StoreAdminPage />} />
              <Route path="admin/sim" element={<IndustrialSim />} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="profile/:userId" element={<PublicProfile />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="notify" element={<NotifyMe />} />
              <Route path="worldcup" element={<WorldCupLayout />}>
                <Route index element={<WorldCup />} />
                <Route path="venues" element={<VenuesPage />} />
                <Route path="group/:id" element={<GroupFixturePage />} />
                <Route path="team/:teamName/squad" element={<TeamSquadPage />} />
              </Route>
              <Route path="groups" element={<ProtectedRoute><GroupDashboard /></ProtectedRoute>} />
              <Route path="groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
              <Route path="groups/create" element={<ProtectedRoute><GroupDashboard /><GroupModal isOpen={true} onClose={() => window.history.back()} initialMode="create" /></ProtectedRoute>} />
              <Route path="groups/join" element={<ProtectedRoute><GroupDashboard /><GroupModal isOpen={true} onClose={() => window.history.back()} initialMode="join" /></ProtectedRoute>} />
              <Route path="predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
              <Route path="predictions/match/:matchId" element={<ProtectedRoute><MatchPredictionPage /></ProtectedRoute>} />
              <Route path="match/:id" element={<MatchDetail />} />
              <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            </Route>
            </Routes>
          </TeamModalProvider>
        </GameProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
