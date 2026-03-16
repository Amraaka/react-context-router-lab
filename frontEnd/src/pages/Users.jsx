import { Link } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';
import './pages.css';

// ─── Users Page  (route: /) ───────────────────────────────────────────────
// Derives a unique list of users from the places stored in PlacesContext.
// Each user is shown as a card with their place count and a link to their
// places page.
function Users() {
  const { places } = usePlaces();

  // Build a map of userId → { userId, userName, placeCount }
  // by iterating over every place once.
  const usersMap = {};
  places.forEach((place) => {
    if (!usersMap[place.creator]) {
      usersMap[place.creator] = {
        userId: place.creator,
        userName: place.creatorName,
        placeCount: 0,
      };
    }
    usersMap[place.creator].placeCount++;
  });

  const users = Object.values(usersMap);

  return (
    <div className="page-container">
      <h1 className="page-title">All Users</h1>

      {users.length === 0 ? (
        <p className="empty-message">
          No users have shared places yet.{' '}
          <Link to="/authenticate" style={{ color: '#e94560' }}>
            Sign up
          </Link>{' '}
          and be the first!
        </p>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.userId} className="user-card">
              {/* First letter of the name as an avatar */}
              <div className="user-avatar">
                {user.userName.charAt(0).toUpperCase()}
              </div>

              <div className="user-info">
                <h3>{user.userName}</h3>
                <p>
                  {user.placeCount} place{user.placeCount !== 1 ? 's' : ''}
                </p>
              </div>

              <Link to={`/${user.userId}/places`} className="btn btn--primary">
                View Places
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
