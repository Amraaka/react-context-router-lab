/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import samplePlaces from '../../db/places.json';

export const PlacesContext = createContext();

export function usePlaces() {
  return useContext(PlacesContext);
}

const ensurePlacesSeeded = () => {
  const readUsersMap = () => {
    try {
      const parsedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (!Array.isArray(parsedUsers)) return {};
      return parsedUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
    } catch {
      return {};
    }
  };

  const applyCreatorProfile = (placesList) => {
    const usersMap = readUsersMap();
    return placesList.map((place) => {
      const creator = usersMap[place.creator];
      if (!creator) return place;
      return {
        ...place,
        creatorName: creator.name || place.creatorName,
        creatorImageUrl: creator.imageUrl || place.creatorImageUrl || '',
      };
    });
  };

  const storedPlaces = localStorage.getItem('places');

  if (!storedPlaces) {
    const enrichedSamplePlaces = applyCreatorProfile(samplePlaces);
    localStorage.setItem('places', JSON.stringify(enrichedSamplePlaces));
    return enrichedSamplePlaces;
  }

  try {
    const parsed = JSON.parse(storedPlaces);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid places payload');
    }

    const existingIds = new Set(parsed.map((place) => place.id));
    const missingSeedPlaces = samplePlaces.filter(
      (place) => !existingIds.has(place.id)
    );

    if (missingSeedPlaces.length > 0) {
      const merged = [...parsed, ...missingSeedPlaces];
      const normalized = applyCreatorProfile(merged);
      localStorage.setItem('places', JSON.stringify(normalized));
      return normalized;
    }

    const normalized = applyCreatorProfile(parsed);
    localStorage.setItem('places', JSON.stringify(normalized));
    return normalized;
  } catch {
    const enrichedSamplePlaces = applyCreatorProfile(samplePlaces);
    localStorage.setItem('places', JSON.stringify(enrichedSamplePlaces));
    return enrichedSamplePlaces;
  }
};

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState(() => ensurePlacesSeeded());

  const savePlaces = (updatedPlaces) => {
    setPlaces(updatedPlaces);
    localStorage.setItem('places', JSON.stringify(updatedPlaces));
  };

  const addPlace = (placeData) => {
    const newPlace = {
      ...placeData,
      id: `place_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
    savePlaces([...places, newPlace]);
    return newPlace;
  };

  const updatePlace = (placeId, updatedFields) => {
    const updated = places.map((p) =>
      p.id === placeId ? { ...p, ...updatedFields } : p
    );
    savePlaces(updated);
  };

  const deletePlace = (placeId) => {
    savePlaces(places.filter((p) => p.id !== placeId));
  };

  return (
    <PlacesContext.Provider value={{ places, addPlace, updatePlace, deletePlace }}>
      {children}
    </PlacesContext.Provider>
  );
}
