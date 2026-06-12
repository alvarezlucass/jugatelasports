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
import { AdminNewsDashboard } from './pages/admin/AdminNewsDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import MatchDetail from './pages/MatchDetail';
import { IndustrialSim } from './pages/admin/IndustrialSim';
import { GenericLeagueHub } from './pages/GenericLeagueHub';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { TeamProfile } from './pages/TeamProfile';
import { TermsPage } from './pages/legal/TermsPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { RulesPage } from './pages/legal/RulesPage';
import { DisclaimerPage } from './pages/legal/DisclaimerPage';

import { TeamModalProvider } from './context/TeamModalContext';

import { ReferralRoute } from './pages/ReferralRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <UserProvider>
        <GameProvider>
          <TeamModalProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="r/:refId" element={<ReferralRoute />} />
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
              <Route path="admin/news" element={<AdminNewsDashboard />} />
              <Route path="admin/sim" element={<IndustrialSim />} />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="profile/:userId" element={<PublicProfile />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="terminos" element={<TermsPage />} />
              <Route path="privacidad" element={<PrivacyPage />} />
              <Route path="reglas" element={<RulesPage />} />
              <Route path="disclaimer" element={<DisclaimerPage />} />
              <Route path="notify" element={<NotifyMe />} />
              <Route path="worldcup" element={<WorldCupLayout />}>
                <Route index element={<WorldCup />} />
                <Route path="venues" element={<VenuesPage />} />
                <Route path="group/:id" element={<GroupFixturePage />} />
                <Route path="team/:teamName/squad" element={<TeamSquadPage />} />
              </Route>
              <Route path="groups" element={<GroupDashboard />} />
              <Route path="groups/:id" element={<GroupDetail />} />
              <Route path="groups/create" element={<><GroupDashboard /><GroupModal isOpen={true} onClose={() => window.history.back()} initialMode="create" /></>} />
              <Route path="groups/join" element={<><GroupDashboard /><GroupModal isOpen={true} onClose={() => window.history.back()} initialMode="join" /></>} />
              <Route path="predictions" element={<Predictions />} />
              <Route path="predictions/match/:matchId" element={<MatchPredictionPage />} />
              <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="match/:id" element={<MatchDetail />} />
              <Route path="team/:id" element={<TeamProfile />} />
            </Route>
            </Routes>
          </TeamModalProvider>
        </GameProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
