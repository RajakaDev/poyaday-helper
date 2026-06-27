export function getPlaceTimeStatus(openTime, closeTime) {
  if (!openTime || !closeTime) {
    return {
      type: "unknown",
      label: "Unknown",
      message: "Opening time unavailable",
    };
  }

  const now = new Date();

  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);

  const open = new Date(now);
  open.setHours(oh, om, 0, 0);

  const close = new Date(now);
  close.setHours(ch, cm, 0, 0);

  if (now < open) {
    const mins = Math.floor((open - now) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return {
      type: "soon",
      label: "Starts Soon",
      message: `Starts in ${h}h ${m}m`,
    };
  }

  if (now >= open && now <= close) {
    const mins = Math.floor((close - now) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return {
      type: "open",
      label: "Open Now",
      message: `Closes in ${h}h ${m}m`,
    };
  }

  return {
    type: "closed",
    label: "Closed",
    message: "Today's session ended",
  };
}