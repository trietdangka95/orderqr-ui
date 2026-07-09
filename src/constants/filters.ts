export const FILTER_PRESETS = [
  { id: "ALL_TIME" },
  { id: "TODAY" },
  { id: "THIS_WEEK" },
  { id: "THIS_MONTH" },
  { id: "THIS_YEAR" },
  { id: "CUSTOM" },
] as const;

export type FilterType = (typeof FILTER_PRESETS)[number]["id"];
