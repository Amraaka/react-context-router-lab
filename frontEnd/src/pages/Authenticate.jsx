import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import sampleUsers from '../../db/users.json';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

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
    const existingGmails = new Set(parsed.map((user) => user.gmail || user.email));
    const missingSeedUsers = sampleUsers.filter(
      (user) => !existingIds.has(user.id) && !existingGmails.has(user.gmail)
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

function Authenticate() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    gmail: '',
    password: '',
    imageUrl: '',
    age: null,  
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    ensureUsersSeeded();
  }, []);

  if (isLoggedIn) return <Navigate to="/" replace />;

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setErrors({});
    setGlobalError('');
    setFormData({ name: '', gmail: '', password: '', imageUrl: '', age: null });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'age' ? (value ? Number(value) : '') : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const validate = () => {
    const errs = {};
    if (!isLogin && !formData.name.trim()) {
      errs.name = 'Нэр оруулах шаардлагатай.';
    }
    if (!isValidEmail(formData.gmail)) {
      errs.gmail = 'Зөв gmail хаяг оруулна уу.';
    }
    if (formData.password.length < 6) {
      errs.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.';
    }
    if (!isLogin) {
      if (!formData.imageUrl.trim()) {
        errs.imageUrl = 'Профайл зургийн холбоос оруулах шаардлагатай.';
      } else if (!isValidUrl(formData.imageUrl)) {
        errs.imageUrl = 'Зөв холбоос оруулна уу (жишээ: https://example.com/photo.jpg).';
      }
      if (!formData.age || formData.age < 1 || formData.age > 120) {
        errs.age = 'Нас 1-120 хооронд байх ёстой.';
      }
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
      const existingUser = users.find(
        (u) => (u.gmail || u.email) === formData.gmail && u.password === formData.password
      );
      if (!existingUser) {
        setGlobalError('Имэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу.');
        return;
      }
      login(existingUser.id, existingUser.name, existingUser.imageUrl || '');
    } else {
      if (users.find((u) => (u.gmail || u.email) === formData.gmail)) {
        setGlobalError(
          'Энэ gmail-ээр бүртгэл аль хэдийн байна. Нэвтэрнэ үү.'
        );
        return;
      }
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: formData.name.trim(),
        gmail: formData.gmail,
        password: formData.password,
        imageUrl: formData.imageUrl,
        age: formData.age,
      };
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      login(newUser.id, newUser.name, newUser.imageUrl);
    }

    navigate('/');
  };

  const inputClass =
    'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500';
  const inputErrorClass = 'border-red-500';
  const sampleHint = sampleUsers
    .map((user) => `${user.gmail} / ${user.password}`)
    .join(' | ');

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h1 className="mb-4 text-center text-xl font-semibold text-slate-800">
          {isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
        </h1>
        <p className="mb-4 text-center text-xs text-slate-500">
          {sampleHint}
        </p>

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
            Нэвтрэх
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
            Бүртгүүлэх
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {globalError && (
            <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {globalError}
            </p>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm text-slate-700">Нэр</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Бүтэн нэрээ оруулна уу"
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
            <label htmlFor="gmail" className="text-sm text-slate-700">Gmail</label>
            <input
              id="gmail"
              name="gmail"
              type="email"
              value={formData.gmail}
              onChange={handleChange}
              placeholder="ner@gmail.com"
              className={`${inputClass} ${
                errors.gmail ? inputErrorClass : ''
              }`}
            />
            {errors.gmail && (
              <span className="text-xs text-red-600">{errors.gmail}</span>
            )}
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="imageUrl" className="text-sm text-slate-700">Профайл зургийн холбоос</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                className={`${inputClass} ${
                  errors.imageUrl ? inputErrorClass : ''
                }`}
              />
              {errors.imageUrl && (
                <span className="text-xs text-red-600">{errors.imageUrl}</span>
              )}
            </div>
          )}
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="age" className="text-sm text-slate-700">Нас</label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="Таны нас"
                className={`${inputClass} ${
                  errors.age ? inputErrorClass : ''
                }`}
              />
              {errors.age && (
                <span className="text-xs text-red-600">{errors.age}</span>
              )}
            </div>
          )}
         

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-slate-700">Нууц үг</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Хамгийн багадаа 6 тэмдэгт"
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
            {isLogin ? 'Нэвтрэх' : 'Бүртгэл үүсгэх'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Authenticate;
