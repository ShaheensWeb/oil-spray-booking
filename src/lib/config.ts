export const config = {
  businessName: "Ottawa Oil Spray",
  city: "Ottawa",
  timezone: "America/Toronto",
  phoneDisplay: "613-447-5428",
  shopAddress: "11 Sweetnam Drive, Ottawa",
  mapsUrl: "https://maps.google.com/?q=11+Sweetnam+Drive,+Ottawa",
  daysAhead: 14,
  closedWeekdays: [0], // Sunday
  slotHours: [8, 10, 12, 14],
  slotMinutes: 0,
};

export type Booking = {
  id: string;
  slotId: string;
  name: string;
  phone: string;
  vehicle: string;
  address?: string;
  notes: string;
  createdAt: string;
};

export type Slot = {
  id: string;
  date: string;
  hour: number;
  label: string;
  available: boolean;
};

export type Day = {
  date: string;
  weekday: string;
  dayNumber: string;
  month: string;
  slots: Slot[];
};
