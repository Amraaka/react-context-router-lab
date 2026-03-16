import { useParams, Link } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import './pages.css';

// ─── UserPlaces Page  (route: /:uid/places) ──────────────────────────────
// Shows all places that belong to the user identified by :uid.
// If the logged-in user is the owner, Edit and Delete actions are visible.
function UserPlaces() {
  const { uid } = useParams();
  const { places, deletePlace } = usePlaces();
  const { userId, isLoggedIn } = useAuth();

  // Filter the global places list to only this user's entries
  const userPlaces = places.filter((p) => p.creator === uid);
  const ownerName = userPlaces[0]?.creatorName || 'User';

  // Only the owner can modify their places
  const isOwner = isLoggedIn && userId === uid;

  return (
    <div className="page-container">
      <h1 className="page-title">{ownerName}'s Places</h1>

      {userPlaces.length === 0 ? (
        <p className="empty-message">
          No places found for this user.
          {isOwner && (
            <>
              {' '}
              <Link to="/places/new" style={{ color: '#e94560' }}>
                Add your first place!
              </Link>
            </>
          )}
        </p>
      ) : (
        <ul className="place-list">
          {userPlaces.map((place) => (
            <li key={place.id} className="place-card">
              <img
                src={place.imageUrl}
                alt={place.title}
                className="place-image"
                // Fallback if the URL is broken
                onError={(e) => {
                  e.target.src =
                    'https://placehold.co/400x180/1a1a2e/e94560?text=No+Image';
                }}
              />

              <div className="place-body">
                <h3 className="place-title">{place.title}</h3>
                <p className="place-address">{place.address}</p>
                <p className="place-description">{place.description}</p>

                {/* Edit / Delete are only rendered for the owner */}
                {isOwner && (
                  <div className="place-actions">
                    <Link
                      to={`/places/${place.id}`}
                      className="btn btn--secondary"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePlace(place.id)}
                      className="btn btn--danger"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserPlaces;
