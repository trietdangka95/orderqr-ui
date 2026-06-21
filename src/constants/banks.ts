export const BANK_OPTIONS = [
  { id: "MB", name: "MB Bank (Ngân hàng Quân đội)" },
  { id: "VCB", name: "Vietcombank (Ngoại thương)" },
  { id: "CTG", name: "VietinBank (Công thương)" },
  { id: "TCB", name: "Techcombank (Kỹ thương)" },
  { id: "BIDV", name: "BIDV (Đầu tư & Phát triển)" },
  { id: "ACB", name: "ACB (Á Châu)" },
  { id: "VPB", name: "VPBank (Việt Nam Thịnh Vượng)" },
  { id: "TPB", name: "TPBank (Tiên Phong)" },
  { id: "STB", name: "Sacombank (Sài Gòn Thương Tín)" },
  { id: "HDB", name: "HDBank (Phát triển TP.HCM)" },
  { id: "VBA", name: "Agribank (Nông nghiệp)" },
  { id: "VIB", name: "VIB (Quốc tế)" },
  { id: "SHB", name: "SHB (Sài Gòn - Hà Nội)" },
  { id: "OCB", name: "OCB (Phương Đông)" },
] as const;

export type BankId = (typeof BANK_OPTIONS)[number]["id"];
