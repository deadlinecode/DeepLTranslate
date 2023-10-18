export interface Rsp {
  translations: Translation[];
}

export interface Translation {
  detected_source_language: string;
  text: string;
}

export const CommonLanguageCodes = [
  "bg",
  "cs",
  "da",
  "de",
  "el",
  "es",
  "et",
  "fi",
  "fr",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "lt",
  "lv",
  "nb",
  "nl",
  "pl",
  "ro",
  "ru",
  "sk",
  "sl",
  "sv",
  "tr",
  "uk",
  "zh",
  "en",
  "pt",
  "BG",
  "CS",
  "DA",
  "DE",
  "EL",
  "ES",
  "ET",
  "FI",
  "FR",
  "HU",
  "ID",
  "IT",
  "JA",
  "KO",
  "LT",
  "LV",
  "NB",
  "NL",
  "PL",
  "RO",
  "RU",
  "SK",
  "SL",
  "SV",
  "TR",
  "UK",
  "ZH",
  "EN",
  "PT",
] as const;

export type CommonLanguageCode = (typeof CommonLanguageCodes)[number];

export const SourceLanguageCodes = CommonLanguageCodes;

export type SourceLanguageCode = (typeof SourceLanguageCodes)[number];

export const TargetLanguageCodes = [
  ...CommonLanguageCodes,
  "en-GB",
  "en-US",
  "pt-BR",
  "pt-PT",
  "EN-GB",
  "EN-US",
  "PT-BR",
  "PT-PT",
] as const;

export type TargetLanguageCode = (typeof TargetLanguageCodes)[number];
