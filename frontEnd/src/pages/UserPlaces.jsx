import { useParams, Link } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';

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
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 inline-block border-b-4 border-rose-500 pb-2 text-3xl font-semibold text-[#1a1a2e]">
        {ownerName}'s Places
      </h1>

      {userPlaces.length === 0 ? (
        <p className="mt-10 text-center text-base italic text-slate-500">
          No places found for this user.
          {isOwner && (
            <>
              {' '}<Link to="/places/new" className="font-medium text-rose-500 no-underline">
                Add your first place!
              </Link>
            </>
          )}
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
          {userPlaces.map((place) => (
            <li
              key={place.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <img
                src={place.imageUrl}
                alt={place.title}
                className="h-44 w-full object-cover"
                // Fallback if the URL is broken
                onError={(e) => {
                  e.target.src =
                    'https://placehold.co/400x180/1a1a2e/e94560?text=No+Image';
                }}
              />

              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-1 text-lg font-semibold text-[#1a1a2e]">{place.title}</h3>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-rose-500">
                  {place.address}
                </p>
                <p className="mb-4 flex-1 text-sm leading-6 text-slate-600">
                  {place.description}
                </p>

                {/* Edit / Delete are only rendered for the owner */}
                {isOwner && (
                  <div className="mt-auto flex gap-2">
                    <Link
                      to={`/places/${place.id}`}
                      className="inline-flex items-center rounded-md bg-[#1a1a2e] px-4 py-2 text-sm font-medium text-slate-200 no-underline transition-opacity hover:opacity-90"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePlace(place.id)}
                      className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
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
