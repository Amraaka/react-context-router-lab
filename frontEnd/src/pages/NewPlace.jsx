import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import './pages.css';

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

  return (
    <div className="page-container page-container--narrow">
      <h1 className="page-title">Add New Place</h1>

      <form onSubmit={handleSubmit} className="place-form" noValidate>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title" name="title" type="text"
            value={formData.title} onChange={handleChange}
            placeholder="e.g. Central Park"
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description" name="description"
            value={formData.description} onChange={handleChange}
            placeholder="What makes this place special?"
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
            placeholder="https://example.com/photo.jpg"
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
            placeholder="123 Main St, New York, NY"
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
            Add Place
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewPlace;
