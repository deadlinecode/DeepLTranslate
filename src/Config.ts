import { Static, Type } from "@sinclair/typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import fs from "fs";
import path from "path";
import { SourceLanguageCodes, TargetLanguageCodes } from "./DeepL/Types";

const configSchema = Type.Object({
    apiKey: Type.String(),
    file: Type.String(),
    source_lang: Type.Union(SourceLanguageCodes.map((x) => Type.Literal(x))),
    target_langs: Type.Array(
      Type.Union(SourceLanguageCodes.map((x) => Type.Literal(x))),
      { minItems: 1 }
    ),
    nameRewrite: Type.Optional(Type.String()),
    out: Type.Optional(Type.String()),
    forceTranslation: Type.Optional(Type.Any()),
  }),
  validator = TypeCompiler.Compile(configSchema),
  quit = (txt: string) => {
    console.error(txt);
    process.exit(1);
  },
  configFile = process.argv.slice(2)[0] || "./config.json";

if (!fs.existsSync(configFile) || fs.lstatSync(configFile).isDirectory())
  quit("config.json not found");
const raw = fs.readFileSync(configFile, "utf8");
var parsed: Static<typeof configSchema> = null as any;
try {
  parsed = JSON.parse(raw);
} catch {
  quit("config.json is not valid JSON");
}

const err = [...validator.Errors(parsed)];
if (err.length) {
  console.error("config.json is not valid:");
  err.forEach((e) => console.error(e.path, " ".repeat(10), e.message));
  quit("Please correct your config.json");
}

if (parsed.forceTranslation) {
  console.log(
    Object.entries(parsed.forceTranslation).every(
      ([k, v]) =>
        TargetLanguageCodes.includes(k as any) &&
        (v === "*" || Array.isArray(v))
    )
  );
  if (
    !(
      parsed.forceTranslation === "*" ||
      (typeof parsed.forceTranslation === "object" &&
        !Array.isArray(parsed.forceTranslation) &&
        Object.entries(parsed.forceTranslation).every(
          ([k, v]) =>
            TargetLanguageCodes.includes(k as any) &&
            (v === "*" || Array.isArray(v))
        ))
    )
  )
    quit("Invalid forceTranslation config");
}

if (!fs.existsSync(parsed.file) || fs.lstatSync(parsed.file).isDirectory())
  quit("File not found");

if (!(parsed.file.endsWith(".json") || parsed.file.endsWith(".resx")))
  quit("File must be a .json or .resx file");

if (parsed.out)
  fs.existsSync(parsed.out) && !fs.lstatSync(parsed.out).isDirectory()
    ? quit("Invalid out directory")
    : fs.mkdirSync(parsed.out, { recursive: true });

parsed.source_lang = parsed.source_lang.toUpperCase() as any;
parsed.target_langs = parsed.target_langs.map((x) => x.toUpperCase() as any);

export default {
  ...parsed,
  out: parsed.out
    ? parsed.out.startsWith("/")
      ? parsed.out
      : path.join(
          process.argv.slice(2)[0]
            ? path.dirname(process.argv.slice(2)[0])
            : process.cwd(),
          parsed.out
        )
    : process.argv.slice(2)[0]
    ? path.dirname(process.argv.slice(2)[0])
    : process.cwd(),
};
