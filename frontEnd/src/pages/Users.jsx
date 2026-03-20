import { Link } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';

const getStoredUsers = () => {
  try {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

function Users() {
  const { places } = usePlaces();
  const storedUsers = getStoredUsers();

  const usersMap = {};
  
  storedUsers.forEach((user) => {
    usersMap[user.id] = {
      userId: user.id,
      userName: user.name,
      userImageUrl: user.imageUrl || '',
      placeCount: 0,
    };
  });

  // Then, count places for each user
  places.forEach((place) => {
    if (usersMap[place.creator]) {
      usersMap[place.creator].placeCount++;
    }
  });

  const users = Object.values(usersMap);
  console.log(users);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">
        Бүх хэрэглэгч
      </h1>

      {users.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">
          Одоогоор хэн ч газар нийтлээгүй байна.{' '}
          <Link to="/authenticate" className="underline">
            Бүртгүүлэх
          </Link>{' '}
          хийгээд анхны нь болоорой!
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {users.map((user) => (
            <li
              key={user.userId}
              className="flex items-center gap-3 rounded border border-slate-200 bg-white p-4"
            >
              {user.userImageUrl ? (
                <img
                  src={user.userImageUrl}
                  alt={user.userName}
                  className="h-10 w-10 shrink-0 rounded-full border border-slate-300 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://i.pravatar.cc/100?img=1';
                  }}
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-sm font-semibold text-slate-700">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-base font-medium text-slate-800">
                  {user.userName}
                </h3>
                <p className="text-sm text-slate-500">
                  {user.placeCount} газар
                </p>
              </div>

              <Link
                to={`/${user.userId}/places`}
                className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white no-underline hover:bg-slate-700"
              >
                Газруудыг харах
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
