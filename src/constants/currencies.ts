export interface SupportedCurrency {
  code: string;
  label: string;
}

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  { code: "RWF", label: "Rwandan Franc" },
  { code: "KES", label: "Kenyan Shilling" },
  { code: "UGX", label: "Ugandan Shilling" },
  { code: "TZS", label: "Tanzanian Shilling" },
  { code: "NGN", label: "Nigerian Naira" },
  { code: "GHS", label: "Ghanaian Cedi" },
  { code: "ZAR", label: "South African Rand" },
  { code: "EGP", label: "Egyptian Pound" },
  { code: "MAD", label: "Moroccan Dirham" },
  { code: "DZD", label: "Algerian Dinar" },
  { code: "TND", label: "Tunisian Dinar" },
  { code: "XOF", label: "West African CFA Franc" },
  { code: "XAF", label: "Central African CFA Franc" },
  { code: "ETB", label: "Ethiopian Birr" },
  { code: "ZMW", label: "Zambian Kwacha" },
  { code: "BWP", label: "Botswana Pula" },
  { code: "NAD", label: "Namibian Dollar" },
  { code: "MUR", label: "Mauritian Rupee" },
  { code: "SCR", label: "Seychellois Rupee" },
  { code: "SDG", label: "Sudanese Pound" },
  { code: "SSP", label: "South Sudanese Pound" },
  { code: "MWK", label: "Malawian Kwacha" },
  { code: "MZN", label: "Mozambican Metical" },
  { code: "AOA", label: "Angolan Kwanza" },
  { code: "SZL", label: "Eswatini Lilangeni" },
  { code: "LSL", label: "Lesotho Loti" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "EUR Dollar" },

];

export const formatBudgetWithCurrency = (
  budget?: number,
  currency = "USD",
): string => {
  if (budget == null || Number.isNaN(Number(budget))) {
    return "N/A";
  }

  return `${currency} ${Number(budget).toLocaleString()}`;
};
