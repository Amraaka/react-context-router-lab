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
  const ownerName = userPlaces[0]?.creatorName || 'Хэрэглэгч';

  // Only the owner can modify their places
  const isOwner = isLoggedIn && userId === uid;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">
        {ownerName} хэрэглэгчийн газрууд
      </h1>

      {userPlaces.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">
          Энэ хэрэглэгчийн газар олдсонгүй.
          {isOwner && (
            <>
              {' '}<Link to="/places/new" className="underline">
                Анхны газраа нэмээрэй!
              </Link>
            </>
          )}
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {userPlaces.map((place) => (
            <li
              key={place.id}
              className="flex flex-col overflow-hidden rounded border border-slate-200 bg-white"
            >
              <img
                src={place.imageUrl}
                alt={place.title}
                className="h-40 w-full object-cover"
                // Fallback if the URL is broken
                onError={(e) => {
                  e.target.src =
                    'https://placehold.co/400x180/1a1a2e/e94560?text=Zurag+alga';
                }}
              />

              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-medium text-slate-800">{place.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {place.address}
                </p>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  {place.description}
                </p>

                {/* Edit / Delete are only rendered for the owner */}
                {isOwner && (
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/places/${place.id}`}
                      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 no-underline hover:bg-slate-50"
                    >
                      Засах
                    </Link>
                    <button
                      onClick={() => deletePlace(place.id)}
                      className="rounded border border-red-300 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Устгах
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
