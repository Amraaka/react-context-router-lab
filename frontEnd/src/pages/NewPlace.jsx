import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
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

function NewPlace() {
  const { isLoggedIn, userId, userName, userAvatarUrl } = useAuth();
  const { addPlace } = usePlaces();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState({});

  if (!isLoggedIn) return <Navigate to="/authenticate" replace />;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim())       errs.title = 'Гарчиг оруулах шаардлагатай.';
    if (!formData.description.trim()) errs.description = 'Тайлбар оруулах шаардлагатай.';
    if (!formData.imageUrl.trim()) {
      errs.imageUrl = 'Зургийн холбоос оруулах шаардлагатай.';
    } else if (!isValidUrl(formData.imageUrl)) {
      errs.imageUrl = 'Зөв холбоос оруулна уу (жишээ: https://example.com/photo.jpg).';
    }
    if (!formData.address.trim())     errs.address = 'Хаяг оруулах шаардлагатай.';

    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (formData.latitude.trim() === '') {
      errs.latitude = 'Өргөрөг оруулах шаардлагатай.';
    } else if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      errs.latitude = 'Өргөрөг -90-аас 90 хооронд байх ёстой.';
    }

    if (formData.longitude.trim() === '') {
      errs.longitude = 'Уртраг оруулах шаардлагатай.';
    } else if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      errs.longitude = 'Уртраг -180-аас 180 хооронд байх ёстой.';
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

    addPlace({
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      address: formData.address,
      location: {
        lat: Number(formData.latitude),
        lng: Number(formData.longitude),
      },
      creator: userId,
      creatorName: userName,
      creatorImageUrl: userAvatarUrl,
    });

    navigate(`/${userId}/places`);
  };

  const inputClass =
    'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500';
  const inputErrorClass = 'border-red-500';

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">
        Шинэ газар нэмэх
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5"
        noValidate
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm text-slate-700">Гарчиг</label>
          <input
            id="title" name="title" type="text"
            value={formData.title} onChange={handleChange}
            placeholder="Жишээ: Үндэсний цэцэрлэгт хүрээлэн"
            className={`${inputClass} ${
              errors.title ? inputErrorClass : ''
            }`}
          />
          {errors.title && <span className="text-xs text-red-600">{errors.title}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-slate-700">Тайлбар</label>
          <textarea
            id="description" name="description"
            value={formData.description} onChange={handleChange}
            placeholder="Энэ газрын онцлог юу вэ?"
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
          <label htmlFor="imageUrl" className="text-sm text-slate-700">Зургийн холбоос</label>
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
          <label htmlFor="address" className="text-sm text-slate-700">Хаяг</label>
          <input
            id="address" name="address" type="text"
            value={formData.address} onChange={handleChange}
            placeholder="Жишээ: СБД, 1-р хороо"
            className={`${inputClass} ${
              errors.address ? inputErrorClass : ''
            }`}
          />
          {errors.address && (
            <span className="text-xs text-red-600">{errors.address}</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="latitude" className="text-sm text-slate-700">Өргөрөг (Latitude)</label>
            <input
              id="latitude" name="latitude" type="number" step="any"
              value={formData.latitude} onChange={handleChange}
              placeholder="47.9184"
              className={`${inputClass} ${
                errors.latitude ? inputErrorClass : ''
              }`}
            />
            {errors.latitude && (
              <span className="text-xs text-red-600">{errors.latitude}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="longitude" className="text-sm text-slate-700">Уртраг (Longitude)</label>
            <input
              id="longitude" name="longitude" type="number" step="any"
              value={formData.longitude} onChange={handleChange}
              placeholder="106.9177"
              className={`${inputClass} ${
                errors.longitude ? inputErrorClass : ''
              }`}
            />
            {errors.longitude && (
              <span className="text-xs text-red-600">{errors.longitude}</span>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => navigate(-1)}
          >
            Болих
          </button>
          <button
            type="submit"
            className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
          >
            Газар нэмэх
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewPlace;
