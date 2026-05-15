const STORAGE_KEY = "mi-vehiculo-favorites";

export const getFavorites = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setFavorites = (favorites) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
};

export const isFavorite = (id) => {
  const favorites = getFavorites();
  return favorites.includes(id);
};

export const toggleFavorite = (id) => {
  const favorites = getFavorites();

  const next = favorites.includes(id)
    ? favorites.filter((item) => item !== id)
    : [...favorites, id];

  setFavorites(next);
  window.dispatchEvent(new Event("favorites-updated"));
  return next;
};

export const removeFavorite = (id) => {
  const favorites = getFavorites().filter((item) => item !== id);
  setFavorites(favorites);
  window.dispatchEvent(new Event("favorites-updated"));
  return favorites;
};

export const clearFavorites = () => {
  setFavorites([]);
  window.dispatchEvent(new Event("favorites-updated"));
};