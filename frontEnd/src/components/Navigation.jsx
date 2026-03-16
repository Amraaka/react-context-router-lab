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
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#1a1a2e] shadow-lg shadow-black/30">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-[1.35rem] font-bold tracking-[0.08em] text-rose-500 no-underline"
        >
          PlaceShare
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {isLoggedIn ? (
            // ── Logged-in links ──────────────────────────────────────────
            <>
              <Link
                to={`/${userId}/places`}
                className="text-sm text-slate-300 no-underline transition-colors hover:text-rose-500"
              >
                My Places
              </Link>
              <Link
                to="/places/new"
                className="text-sm text-slate-300 no-underline transition-colors hover:text-rose-500"
              >
                Add Place
              </Link>
              <span className="hidden text-sm italic text-slate-400 sm:inline">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-600 bg-slate-800 px-4 py-1.5 text-sm text-slate-200 transition-opacity hover:opacity-90"
              >
                Logout
              </button>
            </>
          ) : (
            // ── Guest links ──────────────────────────────────────────────
            <>
              <Link
                to="/"
                className="text-sm text-slate-300 no-underline transition-colors hover:text-rose-500"
              >
                All Users
              </Link>
              <Link
                to="/authenticate"
                className="rounded-md bg-rose-500 px-4 py-1.5 text-sm text-white no-underline transition-opacity hover:opacity-90"
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
