const STORAGE_KEY = "coveredDansals";

export function getCoveredDansals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function isDansalCovered(id) {
  return getCoveredDansals().some((item) => item.id === id);
}

export function markDansalCovered(dansal) {
  const current = getCoveredDansals();

  if (current.some((item) => item.id === dansal.id)) return current;

  const newItem = {
    id: dansal.id,
    name: dansal.name || "",
    foodType: dansal.foodType || "",
    location: dansal.location || "",
    customLocation: dansal.customLocation || "",
    lat: dansal.lat || null,
    lng: dansal.lng || null,
    coveredAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeCoveredDansal(id) {
  const updated = getCoveredDansals().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}