export const config = {
  businessName: "Ottawa Undercoating",
  city: "Ottawa",
  timezone: "America/Toronto",
  phoneDisplay: "613-447-5428",
  twilioFrom: "+13658161392",
  tagline: "Premium vehicle undercoating with premium products",
  daysAhead: 14,
  closedWeekdays: [] as number[],
  weekdayHours: [18, 19, 20, 21],
  weekendHours: [7, 8, 9, 10, 11, 12, 13],
  slotMinutes: 0,
  vehicleTypes: {
    sedan: { label: "Sedan", price: 150 },
    truck: { label: "Truck", price: 200 },
  },
};

export type VehicleType = keyof typeof config.vehicleTypes;

export function startingPrice(type: VehicleType) {
  return config.vehicleTypes[type].price;
}

export function priceLine(type: VehicleType) {
  return `$${startingPrice(type)} cash starting price`;
}

export type Booking = {
  id: string;
  slotId: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleType?: VehicleType;
  startingPrice?: number;
  address?: string;
  notes: string;
  status?: "pending" | "confirmed" | "cancelled";
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
