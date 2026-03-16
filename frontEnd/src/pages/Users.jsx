import { Link } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';

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
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 inline-block border-b-4 border-rose-500 pb-2 text-3xl font-semibold text-[#1a1a2e]">
        All Users
      </h1>

      {users.length === 0 ? (
        <p className="mt-10 text-center text-base italic text-slate-500">
          No users have shared places yet.{' '}
          <Link to="/authenticate" className="font-medium text-rose-500 no-underline">
            Sign up
          </Link>{' '}
          and be the first!
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {users.map((user) => (
            <li
              key={user.userId}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md sm:px-6"
            >
              {/* First letter of the name as an avatar */}
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-2xl font-bold text-rose-500">
                {user.userName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <h3 className="mb-1 text-base font-semibold text-[#1a1a2e]">
                  {user.userName}
                </h3>
                <p className="text-sm text-slate-500">
                  {user.placeCount} place{user.placeCount !== 1 ? 's' : ''}
                </p>
              </div>

              <Link
                to={`/${user.userId}/places`}
                className="inline-flex items-center rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
              >
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
