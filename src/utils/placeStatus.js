export function getPlaceTimeStatus(date, openTime, closeTime) {
  if (!date || !openTime) {
    return {
      type: "unknown",
      label: "Unknown",
      message: "",
    };
  }

  const now = new Date();

  const open = new Date(`${date}T${openTime}:00`);
  const close = closeTime
    ? new Date(`${date}T${closeTime}:00`)
    : null;

  // Coming Soon
  if (now < open) {
    const diff = open - now;

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const mins = Math.floor((diff / 1000 / 60) % 60);

    return {
      type: "coming",
      label: "🔵 Coming Soon",
      message: `Starts in ${hours}h ${mins}m`,
    };
  }

  // Open
  if (!close || now <= close) {
    if (close) {
      const diff = close - now;

      const hours = Math.floor(diff / 1000 / 60 / 60);
      const mins = Math.floor((diff / 1000 / 60) % 60);

      return {
        type: "open",
        label: "🟢 Open Now",
        message: `Closes in ${hours}h ${mins}m`,
      };
    }

    return {
      type: "open",
      label: "🟢 Open",
      message: "",
    };
  }

  // Closed
  return {
    type: "closed",
    label: "🔴 Closed",
    message: "Finished",
  };
}