export const FILTER_PRESETS = [
  { id: "ALL_TIME", label: "Tất cả" },
  { id: "TODAY", label: "Hôm nay" },
  { id: "THIS_WEEK", label: "Tuần" },
  { id: "THIS_MONTH", label: "Tháng" },
  { id: "THIS_YEAR", label: "Năm" },
  { id: "CUSTOM", label: "Tùy chọn" },
] as const;

export type FilterType = (typeof FILTER_PRESETS)[number]["id"];
