import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import af from "./locales/af.json";
import zu from "./locales/zu.json";
import sw from "./locales/sw.json";
import rw from "./locales/rw.json";
import fr from "./locales/fr.json";

const LANGUAGE_KEY = "ogera_language";

export const defaultLanguage = "en";
export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "af", label: "Afrikaans" },
  { code: "zu", label: "isiZulu" },
  { code: "sw", label: "Kiswahili" },
  { code: "rw", label: "Kinyarwanda" },
  { code: "fr", label: "Français" },
] as const;

export type SupportedLanguageCode = (typeof supportedLanguages)[number]["code"];
const validCodes: SupportedLanguageCode[] = ["en", "af", "zu", "sw", "rw", "fr"];
const savedLanguage: SupportedLanguageCode = validCodes.includes(
  (localStorage.getItem(LANGUAGE_KEY) as SupportedLanguageCode) || ""
)
  ? (localStorage.getItem(LANGUAGE_KEY) as SupportedLanguageCode)
  : defaultLanguage;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    af: { translation: af },
    zu: { translation: zu },
    sw: { translation: sw },
    rw: { translation: rw },
    fr: { translation: fr },
  },
  lng: savedLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;
