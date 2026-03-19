import { createContext, useState, useEffect, useContext } from 'react';

// ─── AuthContext ─────────────────────────────────────────────────────────────
// This context holds the global authentication state (isLoggedIn, userId,
// userName) and exposes two actions: login() and logout().
//
// How it connects to LocalStorage:
//   1. On first render, we read the 'auth' key from LocalStorage so the
//      session survives a page refresh.
//   2. Whenever the state changes (login / logout), a useEffect writes the
//      new state back to LocalStorage.
// ─────────────────────────────────────────────────────────────────────────────

export const AuthContext = createContext();

// Custom hook — components call useAuth() instead of importing both
// useContext and AuthContext every time.
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const emptyAuthState = {
    isLoggedIn: false,
    userId: null,
    userName: null,
    userAvatarUrl: '',
  };

  // Lazy initializer: read from LocalStorage once on mount.
  // localStorage stores strings, so we JSON.parse it back to an object.
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem('auth');

    if (!stored) {
      return emptyAuthState;
    }

    try {
      const parsed = JSON.parse(stored);
      return {
        ...emptyAuthState,
        ...parsed,
        userAvatarUrl: parsed?.userAvatarUrl || '',
      };
    } catch {
      return emptyAuthState;
    }
  });

  // Sync to LocalStorage every time authState changes.
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(authState));
  }, [authState]);

  // Called after a successful login or signup
  const login = (userId, userName, userAvatarUrl = '') => {
    setAuthState({ isLoggedIn: true, userId, userName, userAvatarUrl });
  };

  // Clears the session from state (LocalStorage is updated via the effect)
  const logout = () => {
    setAuthState(emptyAuthState);
  };

  // Spread authState so consumers get isLoggedIn, userId, userName directly,
  // plus the two action functions.
  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
