import { config, type Day } from "./config";
import { bookedSlotIds } from "./store";
import {
  addDays,
  ottawaNoon,
  dateKey,
  formatSlotTime,
  isPastSlot,
  slotId,
  weekdayIndex,
} from "./time";

export async function availableDays(): Promise<Day[]> {
  const taken = await bookedSlotIds();
  const days: Day[] = [];
  let cursor = dateKey();

  while (days.length < config.daysAhead) {
    if (!config.closedWeekdays.includes(weekdayIndex(cursor))) {
      const sample = ottawaNoon(cursor);
      days.push({
        date: cursor,
        weekday: new Intl.DateTimeFormat("en-CA", {
          weekday: "short",
          timeZone: config.timezone,
        }).format(sample),
        dayNumber: cursor.slice(8),
        month: new Intl.DateTimeFormat("en-CA", {
          month: "short",
          timeZone: config.timezone,
        }).format(sample),
        slots: hoursForDay(cursor).map((hour) => {
          const id = slotId(cursor, hour);
          return {
            id,
            date: cursor,
            hour,
            label: formatSlotTime(hour),
            available: !taken.has(id) && !isPastSlot(cursor, hour),
          };
        }),
      });
    }
    cursor = addDays(cursor, 1);
  }

  return days;
}

function hoursForDay(date: string) {
  const weekday = weekdayIndex(date);
  return weekday === 0 || weekday === 6 ? config.weekendHours : config.weekdayHours;
}
