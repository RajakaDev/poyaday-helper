export const DEFAULT_FOOD_TYPES = [
  "Rice",
  "Noodles",
  "Tea",
  "Coffee",
  "Ice Cream",
  "Drinks",
  "Soup",
  "Bread",
  "Milk Rice",
  "Fruits",
  "Other",
];

export function getSavedFoodTypes() {
  try {
    return JSON.parse(localStorage.getItem("custom_food_types") || "[]");
  } catch {
    return [];
  }
}

export function saveCustomFoodType(foodType) {
  const value = foodType.trim();
  if (!value) return [];

  const current = getSavedFoodTypes();
  const exists = current.some(
    (x) => x.toLowerCase() === value.toLowerCase()
  );

  if (exists) return current;

  const updated = [...current, value];
  localStorage.setItem("custom_food_types", JSON.stringify(updated));
  return updated;
}

export function getAllFoodTypes() {
  return [...DEFAULT_FOOD_TYPES, ...getSavedFoodTypes()];
}