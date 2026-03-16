import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

// Navigation reads the isLoggedIn flag from AuthContext and renders
// a different set of links depending on the user's session state.
function Navigation() {
  const { isLoggedIn, userName, userId, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears state + LocalStorage via AuthContext
    navigate('/');
  };

  return (
    <header className="nav-header">
      <div className="nav-brand">
        <Link to="/" className="nav-logo">PlaceShare</Link>
      </div>

      <nav className="nav-links">
        {isLoggedIn ? (
          // ── Logged-in links ──────────────────────────────────────────
          <>
            <Link to={`/${userId}/places`} className="nav-link">My Places</Link>
            <Link to="/places/new" className="nav-link">Add Place</Link>
            <span className="nav-username">{userName}</span>
            <button onClick={handleLogout} className="nav-btn nav-btn--logout">
              Logout
            </button>
          </>
        ) : (
          // ── Guest links ──────────────────────────────────────────────
          <>
            <Link to="/" className="nav-link">All Users</Link>
            <Link to="/authenticate" className="nav-btn nav-btn--login">
              Login / Signup
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navigation;
