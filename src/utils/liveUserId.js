export function getLiveUserId() {
  let id = localStorage.getItem("live_user_id");

  if (!id) {
    id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("live_user_id", id);
  }

  return id;
}