import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="text-lg font-semibold text-slate-800 no-underline"
        >
          PlaceShare
        </Link>

        <nav className="flex items-center gap-3">
          {isLoggedIn ? (
            // ── Logged-in links ──────────────────────────────────────────
            <>
              <Link
                to={`/${userId}/places`}
                className="text-sm text-slate-700 no-underline hover:underline"
              >
                My Places
              </Link>
              <Link
                to="/places/new"
                className="text-sm text-slate-700 no-underline hover:underline"
              >
                Add Place
              </Link>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            // ── Guest links ──────────────────────────────────────────────
            <>
              <Link
                to="/"
                className="text-sm text-slate-700 no-underline hover:underline"
              >
                All Users
              </Link>
              <Link
                to="/authenticate"
                className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white no-underline hover:bg-slate-700"
              >
                Login / Signup
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navigation;
