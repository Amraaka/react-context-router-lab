import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sampleUsers from '../../db/users.json';

// Simple regex-based email validator
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ensureUsersSeeded = () => {
  const storedUsers = localStorage.getItem('users');

  if (!storedUsers) {
    localStorage.setItem('users', JSON.stringify(sampleUsers));
    return;
  }

  try {
    const parsed = JSON.parse(storedUsers);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid users payload');
    }

    const existingIds = new Set(parsed.map((user) => user.id));
    const existingEmails = new Set(parsed.map((user) => user.email));
    const missingSeedUsers = sampleUsers.filter(
      (user) => !existingIds.has(user.id) && !existingEmails.has(user.email)
    );

    if (missingSeedUsers.length > 0) {
      localStorage.setItem('users', JSON.stringify([...parsed, ...missingSeedUsers]));
    }
  } catch {
    localStorage.setItem('users', JSON.stringify(sampleUsers));
  }
};

const readUsers = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('users') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ─── Authenticate Page  (route: /authenticate) ───────────────────────────
// Dual Login / Signup form with tab switching.
//
// Signup flow:
//   1. Validate fields (name, email, password).
//   2. Check LocalStorage 'users' array for duplicate email.
//   3. Append new user to the array and call login().
//
// Login flow:
//   1. Validate fields.
//   2. Find user by email + password match in 'users' array.
//   3. Call login() with their id and name.
//
// NOTE: Passwords are stored in plain text here for simplicity in a lab
//       setting. A real application must hash passwords server-side.
function Authenticate() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  // Ensure there is at least one sample account for first-time login.
  useEffect(() => {
    ensureUsersSeeded();
  }, []);

  // Redirect already-authenticated users away from this page
  if (isLoggedIn) return <Navigate to="/" replace />;

  // Switch between Login and Signup tabs, clearing any stale errors
  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setErrors({});
    setGlobalError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Remove the per-field error as the user starts correcting it
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setGlobalError('');
  };

  // Returns an object of field-level error messages (empty = valid)
  const validate = () => {
    const errs = {};
    if (!isLogin && !formData.name.trim()) {
      errs.name = 'Name is required.';
    }
    if (!isValidEmail(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const users = readUsers();

    if (isLogin) {
      // ── LOGIN ──────────────────────────────────────────────────────────
      const existingUser = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      );
      if (!existingUser) {
        setGlobalError('Invalid email or password. Please try again.');
        return;
      }
      login(existingUser.id, existingUser.name);
    } else {
      // ── SIGNUP ─────────────────────────────────────────────────────────
      if (users.find((u) => u.email === formData.email)) {
        setGlobalError(
          'An account with this email already exists. Please log in instead.'
        );
        return;
      }
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      };
      // Persist the new user then log them in
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      login(newUser.id, newUser.name);
    }

    navigate('/');
  };

  const inputClass =
    'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500';
  const inputErrorClass = 'border-red-500';
  const sampleHint = sampleUsers
    .map((user) => `${user.email} / ${user.password}`)
    .join(' | ');

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="mb-4 text-center text-xl font-semibold text-slate-800">
          {isLogin ? 'Login' : 'Sign Up'}
        </h1>
        <p className="mb-4 text-center text-xs text-slate-500">
          Sample logins: {sampleHint}
        </p>

        {/* Simple mode switcher */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded border px-3 py-2 text-sm ${
              isLogin
                ? 'border-slate-700 bg-slate-700 text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
            onClick={() => switchMode(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded border px-3 py-2 text-sm ${
              !isLogin
                ? 'border-slate-700 bg-slate-700 text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
            onClick={() => switchMode(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {globalError && (
            <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {globalError}
            </p>
          )}

          {/* Name field — only shown on Signup */}
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm text-slate-700">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={`${inputClass} ${
                  errors.name ? inputErrorClass : ''
                }`}
              />
              {errors.name && (
                <span className="text-xs text-red-600">{errors.name}</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-slate-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`${inputClass} ${
                errors.email ? inputErrorClass : ''
              }`}
            />
            {errors.email && (
              <span className="text-xs text-red-600">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`${inputClass} ${
                errors.password ? inputErrorClass : ''
              }`}
            />
            {errors.password && (
              <span className="text-xs text-red-600">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Authenticate;
