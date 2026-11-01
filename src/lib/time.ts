import { config } from "./config";

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options);
  const existing = formatterCache.get(key);
  if (existing) {
    return existing;
  }
  const created = new Intl.DateTimeFormat("en-CA", {
    timeZone: config.timezone,
    ...options,
  });
  formatterCache.set(key, created);
  return created;
}

export function ottawaParts(date = new Date()) {
  const parts = formatter({
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday"),
  };
}

export function dateKey(date = new Date()) {
  const { year, month, day } = ottawaParts(date);
  return `${year}-${month}-${day}`;
}

export function addDays(dateKeyValue: string, days: number) {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days, 12));
  return dateKey(utc);
}

export function ottawaNoon(dateKeyValue: string) {
  return new Date(`${dateKeyValue}T17:00:00.000Z`);
}

export function weekdayIndex(dateKeyValue: string) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: config.timezone,
  }).format(ottawaNoon(dateKeyValue));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

export function slotId(date: string, hour: number) {
  return `${date}T${String(hour).padStart(2, "0")}:${String(config.slotMinutes).padStart(2, "0")}`;
}

export function formatSlotTime(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}:00 ${suffix}`;
}

export function formatSlotLong(slot: string) {
  const [date, time] = slot.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const hour = Number(time.slice(0, 2));
  const when = ottawaNoon(date);
  const weekday = new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    timeZone: config.timezone,
  }).format(when);
  const monthName = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    timeZone: config.timezone,
  }).format(when);
  return `${weekday}, ${monthName} ${day} at ${formatSlotTime(hour)}`;
}

export function isPastSlot(date: string, hour: number) {
  const now = ottawaParts();
  const today = `${now.year}-${now.month}-${now.day}`;
  if (date < today) {
    return true;
  }
  if (date > today) {
    return false;
  }
  return hour <= now.hour;
}
