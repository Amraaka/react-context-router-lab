import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';

// Checks that the string is a well-formed absolute URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ─── NewPlace Page  (route: /places/new)  [PROTECTED] ────────────────────
// Only accessible to logged-in users.
// Validates all fields before calling addPlace() from PlacesContext.
function NewPlace() {
  // All hooks must be called before any early return
  const { isLoggedIn, userId, userName } = useAuth();
  const { addPlace } = usePlaces();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  // ── Protected route guard ────────────────────────────────────────────
  // <Navigate> renders a redirect without calling navigate() during render,
  // which avoids a React warning about side-effects in the render phase.
  if (!isLoggedIn) return <Navigate to="/authenticate" replace />;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim())       errs.title = 'Title is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    if (!formData.imageUrl.trim()) {
      errs.imageUrl = 'Image URL is required.';
    } else if (!isValidUrl(formData.imageUrl)) {
      errs.imageUrl = 'Please enter a valid URL (e.g. https://example.com/photo.jpg).';
    }
    if (!formData.address.trim())     errs.address = 'Address is required.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // addPlace() is provided by PlacesContext; it persists to LocalStorage
    addPlace({ ...formData, creator: userId, creatorName: userName });

    // Go to the creator's places page after saving
    navigate(`/${userId}/places`);
  };

  const inputClass =
    'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500';
  const inputErrorClass = 'border-red-500';

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">
        Add New Place
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5"
        noValidate
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm text-slate-700">Title</label>
          <input
            id="title" name="title" type="text"
            value={formData.title} onChange={handleChange}
            placeholder="e.g. Central Park"
            className={`${inputClass} ${
              errors.title ? inputErrorClass : ''
            }`}
          />
          {errors.title && <span className="text-xs text-red-600">{errors.title}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-slate-700">Description</label>
          <textarea
            id="description" name="description"
            value={formData.description} onChange={handleChange}
            placeholder="What makes this place special?"
            rows={4}
            className={`${inputClass} ${
              errors.description ? inputErrorClass : ''
            }`}
          />
          {errors.description && (
            <span className="text-xs text-red-600">{errors.description}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="imageUrl" className="text-sm text-slate-700">Image URL</label>
          <input
            id="imageUrl" name="imageUrl" type="url"
            value={formData.imageUrl} onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className={`${inputClass} ${
              errors.imageUrl ? inputErrorClass : ''
            }`}
          />
          {errors.imageUrl && (
            <span className="text-xs text-red-600">{errors.imageUrl}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm text-slate-700">Address</label>
          <input
            id="address" name="address" type="text"
            value={formData.address} onChange={handleChange}
            placeholder="123 Main St, New York, NY"
            className={`${inputClass} ${
              errors.address ? inputErrorClass : ''
            }`}
          />
          {errors.address && (
            <span className="text-xs text-red-600">{errors.address}</span>
          )}
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
          >
            Add Place
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewPlace;
