import { createContext, useState, useContext } from 'react';

// ─── PlacesContext ───────────────────────────────────────────────────────────
// Holds the global list of places and exposes full CRUD operations.
//
// Data shape for each place:
//   { id, title, description, imageUrl, address, creator, creatorName }
//
// How it connects to LocalStorage:
//   1. On first render, the lazy initializer reads 'places' from LocalStorage.
//   2. Every mutating action (add / update / delete) calls savePlaces() which
//      updates both React state AND LocalStorage atomically.
// ─────────────────────────────────────────────────────────────────────────────

export const PlacesContext = createContext();

// Custom hook for consuming the context
export function usePlaces() {
  return useContext(PlacesContext);
}

export function PlacesProvider({ children }) {
  // Read the persisted places array from LocalStorage on first render.
  const [places, setPlaces] = useState(() => {
    const stored = localStorage.getItem('places');
    return stored ? JSON.parse(stored) : [];
  });

  // Internal helper: update state and keep LocalStorage in sync
  const savePlaces = (updatedPlaces) => {
    setPlaces(updatedPlaces);
    localStorage.setItem('places', JSON.stringify(updatedPlaces));
  };

  // CREATE — adds a new place with a generated unique id
  const addPlace = (placeData) => {
    const newPlace = {
      ...placeData,
      // Combine timestamp + random string for a collision-resistant id
      id: `place_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
    savePlaces([...places, newPlace]);
    return newPlace;
  };

  // UPDATE — merge new fields into the matching place
  const updatePlace = (placeId, updatedFields) => {
    const updated = places.map((p) =>
      p.id === placeId ? { ...p, ...updatedFields } : p
    );
    savePlaces(updated);
  };

  // DELETE — remove the place with the given id
  const deletePlace = (placeId) => {
    savePlaces(places.filter((p) => p.id !== placeId));
  };

  return (
    <PlacesContext.Provider value={{ places, addPlace, updatePlace, deletePlace }}>
      {children}
    </PlacesContext.Provider>
  );
}
