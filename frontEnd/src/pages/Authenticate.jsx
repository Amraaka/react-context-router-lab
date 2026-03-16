import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Simple regex-based email validator
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

    // Read the users array from LocalStorage (defaults to empty array)
    const users = JSON.parse(localStorage.getItem('users') || '[]');

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

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10">
        {/* ── Tab switcher ───────────────────────────────────────────── */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              isLogin
                ? 'border-b-2 border-rose-500 bg-white text-rose-500'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
            onClick={() => switchMode(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              !isLogin
                ? 'border-b-2 border-rose-500 bg-white text-rose-500'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
            onClick={() => switchMode(false)}
          >
            Sign Up
          </button>
        </div>

        {/* ── Form ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-6 sm:px-7" noValidate>
          {globalError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {globalError}
            </p>
          )}

          {/* Name field — only shown on Signup */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 ${
                  errors.name ? 'border-red-700' : 'border-slate-300'
                }`}
              />
              {errors.name && (
                <span className="text-xs text-red-700">{errors.name}</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 ${
                errors.email ? 'border-red-700' : 'border-slate-300'
              }`}
            />
            {errors.email && (
              <span className="text-xs text-red-700">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 ${
                errors.password ? 'border-red-700' : 'border-slate-300'
              }`}
            />
            {errors.password && (
              <span className="text-xs text-red-700">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-md bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Authenticate;
