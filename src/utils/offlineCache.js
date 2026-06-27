export function saveOfflinePlaces(places) {
  localStorage.setItem("offline_places", JSON.stringify(places));
}

export function getOfflinePlaces() {
  try {
    return JSON.parse(localStorage.getItem("offline_places") || "[]");
  } catch {
    return [];
  }
}

export function saveOfflineEmergency(data) {
  localStorage.setItem("offline_emergency", JSON.stringify(data));
}

export function getOfflineEmergency() {
  try {
    return JSON.parse(localStorage.getItem("offline_emergency") || "[]");
  } catch {
    return [];
  }
}