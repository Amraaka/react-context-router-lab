import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ─── UpdatePlace Page  (route: /places/:pid)  [PROTECTED] ────────────────
// Pre-fills the form with the existing place's data.
// Only accessible to logged-in users.
function UpdatePlace() {
  // All hooks must be called unconditionally (React rules of hooks)
  const { pid } = useParams();
  const { isLoggedIn } = useAuth();
  const { places, updatePlace } = usePlaces();
  const navigate = useNavigate();

  const place = places.find((p) => p.id === pid);

  // Initialise form with the existing values (or empty strings if not found)
  const [formData, setFormData] = useState({
    title:       place?.title       || '',
    description: place?.description || '',
    imageUrl:    place?.imageUrl    || '',
    address:     place?.address     || '',
  });
  const [errors, setErrors] = useState({});

  // ── Protected route guard ────────────────────────────────────────────
  if (!isLoggedIn) return <Navigate to="/authenticate" replace />;

  // Edge case: place id not found in LocalStorage
  if (!place) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="mt-10 text-center text-base italic text-slate-500">Place not found.</p>
      </div>
    );
  }

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

    // updatePlace() merges changes and persists to LocalStorage via context
    updatePlace(pid, formData);
    navigate(`/${place.creator}/places`);
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <h1 className="mb-6 inline-block border-b-4 border-rose-500 pb-2 text-3xl font-semibold text-[#1a1a2e]">
        Edit Place
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl bg-white px-6 py-6 shadow-xl shadow-slate-900/10 sm:px-7"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-semibold text-slate-700">Title</label>
          <input
            id="title" name="title" type="text"
            value={formData.title} onChange={handleChange}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 ${
              errors.title ? 'border-red-700' : 'border-slate-300'
            }`}
          />
          {errors.title && <span className="text-xs text-red-700">{errors.title}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</label>
          <textarea
            id="description" name="description"
            value={formData.description} onChange={handleChange}
            rows={4}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 ${
              errors.description ? 'border-red-700' : 'border-slate-300'
            }`}
          />
          {errors.description && (
            <span className="text-xs text-red-700">{errors.description}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="imageUrl" className="text-sm font-semibold text-slate-700">Image URL</label>
          <input
            id="imageUrl" name="imageUrl" type="url"
            value={formData.imageUrl} onChange={handleChange}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 ${
              errors.imageUrl ? 'border-red-700' : 'border-slate-300'
            }`}
          />
          {errors.imageUrl && (
            <span className="text-xs text-red-700">{errors.imageUrl}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className="text-sm font-semibold text-slate-700">Address</label>
          <input
            id="address" name="address" type="text"
            value={formData.address} onChange={handleChange}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100 ${
              errors.address ? 'border-red-700' : 'border-slate-300'
            }`}
          />
          {errors.address && (
            <span className="text-xs text-red-700">{errors.address}</span>
          )}
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-md border border-slate-600 bg-[#1a1a2e] px-4 py-2 text-sm font-medium text-slate-200 transition-opacity hover:opacity-90"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdatePlace;
