export type InternshipOfferInput = {
  label: string;
  stipend: number;
  transportAid: number;
  mealAid: number;
  hoursPerDay: number;
  daysPerWeek: number;
};

export type InternshipOfferResult = InternshipOfferInput & {
  totalMonthly: number;
  hoursPerWeek: number;
  hoursPerMonth: number;
  valuePerHour: number;
};

const WEEKS_PER_MONTH = 4.345;

export function compareInternshipOffers(
  offers: InternshipOfferInput[]
): InternshipOfferResult[] {
  return offers.map((offer) => {
    const totalMonthly = offer.stipend + offer.transportAid + offer.mealAid;
    const hoursPerWeek = offer.hoursPerDay * offer.daysPerWeek;
    const hoursPerMonth = hoursPerWeek * WEEKS_PER_MONTH;
    const valuePerHour = hoursPerMonth > 0 ? totalMonthly / hoursPerMonth : 0;

    return {
      ...offer,
      totalMonthly,
      hoursPerWeek,
      hoursPerMonth,
      valuePerHour,
    };
  });
}
