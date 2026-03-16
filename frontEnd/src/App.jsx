import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ─── Context Providers ────────────────────────────────────────────────────
// AuthProvider   → wraps the whole app so every component can call useAuth()
// PlacesProvider → wraps the whole app so every component can call usePlaces()
import { AuthProvider } from './context/AuthContext';
import { PlacesProvider } from './context/PlacesContext';

// ─── Shared UI ────────────────────────────────────────────────────────────
import Navigation from './components/Navigation';

// ─── Page Components ──────────────────────────────────────────────────────
import Users        from './pages/Users';
import UserPlaces   from './pages/UserPlaces';
import Authenticate from './pages/Authenticate';
import NewPlace     from './pages/NewPlace';
import UpdatePlace  from './pages/UpdatePlace';

import './App.css';

function App() {
  return (
    // 1. AuthProvider reads/writes the 'auth' key in LocalStorage.
    // 2. PlacesProvider reads/writes the 'places' key in LocalStorage.
    // 3. BrowserRouter enables client-side routing via react-router-dom.
    // All three wrap <Navigation> and the <Routes> so every child can
    // access auth state, places data, and navigation hooks.
    <AuthProvider>
      <PlacesProvider>
        <BrowserRouter>
          <Navigation />

          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/"             element={<Users />} />
              <Route path="/:uid/places"  element={<UserPlaces />} />
              <Route path="/authenticate" element={<Authenticate />} />

              {/* Protected routes — redirect handled inside each component */}
              <Route path="/places/new"   element={<NewPlace />} />
              <Route path="/places/:pid"  element={<UpdatePlace />} />

              {/* Fallback: unknown URLs redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </PlacesProvider>
    </AuthProvider>
  );
}

export default App;
