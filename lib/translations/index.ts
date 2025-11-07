import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ja } from "./ja";

export type Language = "en" | "es" | "fr" | "ja";

export const translations = {
  en,
  es,
  fr,
  ja,
};

export type TranslationKey = keyof typeof en;
