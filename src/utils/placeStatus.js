export function getPlaceTimeStatus(date, openTime, closeTime) {
  if (!date || !openTime) {
    return {
      type: "unknown",
      label: "⚪ Time Unknown",
      message: "Opening time unavailable",
    };
  }

  const now = new Date();
  const open = new Date(`${date}T${openTime}:00`);
  const close = closeTime ? new Date(`${date}T${closeTime}:00`) : null;

  const formatDuration = (ms) => {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (now < open) {
    return {
      type: "coming",
      label: "🔵 Coming Soon",
      message: `Starts in ${formatDuration(open - now)}`,
    };
  }

  if (!close || now <= close) {
    return {
      type: "open",
      label: "🟢 Open Now",
      message: close ? `Closes in ${formatDuration(close - now)}` : "",
    };
  }

  return {
    type: "closed",
    label: "🔴 Closed",
    message: "Finished",
  };
}