import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import './pages.css';

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
      <div className="page-container">
        <p className="empty-message">Place not found.</p>
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
    <div className="page-container page-container--narrow">
      <h1 className="page-title">Edit Place</h1>

      <form onSubmit={handleSubmit} className="place-form" noValidate>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title" name="title" type="text"
            value={formData.title} onChange={handleChange}
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description" name="description"
            value={formData.description} onChange={handleChange}
            rows={4}
            className={errors.description ? 'input-error' : ''}
          />
          {errors.description && (
            <span className="form-error">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl" name="imageUrl" type="url"
            value={formData.imageUrl} onChange={handleChange}
            className={errors.imageUrl ? 'input-error' : ''}
          />
          {errors.imageUrl && (
            <span className="form-error">{errors.imageUrl}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            id="address" name="address" type="text"
            value={formData.address} onChange={handleChange}
            className={errors.address ? 'input-error' : ''}
          />
          {errors.address && (
            <span className="form-error">{errors.address}</span>
          )}
        </div>

        <div className="form-row">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdatePlace;
