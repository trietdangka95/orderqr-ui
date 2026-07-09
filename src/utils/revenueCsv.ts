import type { TranslationSchema } from "@/locales/types";

interface RevenueCsvOrderItem {
  productId?: string;
  quantity: number;
  priceAtTime: number | string;
  originalPriceAtTime?: string | number | null;
  product?: {
    id?: string;
    name?: string;
    price?: number;
    description?: string;
  };
}

interface RevenueCsvOrder {
  orderItems: RevenueCsvOrderItem[];
}

interface RevenueCsvRecord {
  orders: RevenueCsvOrder[];
}

interface RevenueCsvGroup {
  productId: string;
  name: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  quantity: number;
}

const FIRST_DATA_ROW = 4;

const formatCSVField = (field: string | number) => {
  const stringVal = String(field);
  if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
};

const formatFormula = (formula: string) => formatCSVField(formula);

export function buildRevenueCSV(records: RevenueCsvRecord[], from: string, to: string, t: TranslationSchema) {
  const sep = ",";

  const groupMap: Record<string, RevenueCsvGroup> = {};

  records.forEach((inv) => {
    inv.orders.forEach((ord) => {
      ord.orderItems.forEach((it) => {
        const productId = it.productId || it.product?.id || "";
        const name = it.product?.name || t.revenue.unknownItem;
        const description = it.product?.description || "";
        const salePrice = Number(it.priceAtTime !== undefined ? it.priceAtTime : (it.product?.price || 0));
        const originalPrice = Number(
          it.originalPriceAtTime !== null && it.originalPriceAtTime !== undefined
            ? it.originalPriceAtTime
            : (it.product?.price || salePrice)
        );

        const key = `${productId}_${originalPrice}_${salePrice}`;

        if (!groupMap[key]) {
          groupMap[key] = {
            productId,
            name,
            description,
            originalPrice,
            salePrice,
            quantity: 0,
          };
        }

        groupMap[key].quantity += it.quantity;
      });
    });
  });

  const groupRows = Object.values(groupMap);

  const headers = [
    t.revenue.csvProductCode,
    t.revenue.csvProductName,
    t.revenue.csvProductDescription,
    t.revenue.csvPrice,
    t.revenue.csvSalePrice,
    t.revenue.csvQuantity,
    t.revenue.csvTotal,
    t.revenue.csvDiscount,
    t.revenue.csvTotalDiscount,
    t.revenue.csvActualRevenue,
  ];

  const rows = groupRows.map((it, index) => {
    const rowNumber = FIRST_DATA_ROW + index;
    const shortCode = it.productId ? it.productId.slice(-6).toUpperCase() : "";

    return [
      formatCSVField(shortCode),
      formatCSVField(it.name),
      formatCSVField(it.description),
      it.originalPrice,
      it.salePrice,
      it.quantity,
      formatFormula(`=D${rowNumber}*F${rowNumber}`),
      formatFormula(`=I${rowNumber}/G${rowNumber}*100`),
      formatFormula(`=G${rowNumber}-J${rowNumber}`),
      formatFormula(`=E${rowNumber}*F${rowNumber}`),
    ].join(sep);
  });

  const totalRowNumber = FIRST_DATA_ROW + groupRows.length;
  const firstDataRow = FIRST_DATA_ROW;
  const lastDataRow = totalRowNumber - 1;
  const hasRows = groupRows.length > 0;

  const totalRow = [
    "",
    formatCSVField(t.revenue.receiptTotal.replace(":", "")),
    "",
    "",
    "",
    hasRows ? formatFormula(`=SUM(F${firstDataRow}:F${lastDataRow})`) : 0,
    hasRows ? formatFormula(`=SUM(G${firstDataRow}:G${lastDataRow})`) : 0,
    "",
    hasRows ? formatFormula(`=SUM(I${firstDataRow}:I${lastDataRow})`) : 0,
    hasRows ? formatFormula(`=SUM(J${firstDataRow}:J${lastDataRow})`) : 0,
  ].join(sep);

  const period = from && to
    ? `${from} - ${to}`
    : from
      ? `${t.revenue.fromDate} ${from}`
      : to
        ? `${t.revenue.toDate} ${to}`
        : t.revenue.reportAllPeriod;

  const titleText = t.revenue.reportTitle.replace("{period}", period);

  return [
    formatCSVField(titleText),
    "",
    headers.map(formatCSVField).join(sep),
    ...rows,
    totalRow,
  ].join("\n");
}
