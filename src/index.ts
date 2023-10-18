import Config from "./Config";
import resx from "resx";
import fsp from "fs/promises";
import path from "path";
import DeepL from "./DeepL/DeepL";
import Queue from "./Queue";
import Utils from "./Utils";
import { TargetLanguageCode } from "./DeepL/Types";

console.clear();
console.log("Reading file...");
const file = await fsp.readFile(Config.file, "utf8");
console.log("Parsing file...");
const isJSON = Config.file.endsWith(".json"),
  rawParsed = isJSON ? JSON.parse(file) : await resx.resx2js(file);
var parsed: Record<string, string> = rawParsed;

await (async () => {
  if (await fsp.exists(path.join(Config.out, "deepl.hash")))
    try {
      console.log("Checking hashes...");
      const hashes = JSON.parse(
        await fsp.readFile(path.join(Config.out, "deepl.hash"), "utf8")
      );
      var hashSkip = 0;
      parsed = Object.fromEntries(
        Object.entries(parsed).filter(([k, v]) => {
          if (Utils.hash(v as any) !== hashes[k]) return true;
          hashSkip++;
          return false;
        })
      );
      if (!Object.keys(parsed).length) {
        if (Config.forceTranslation) return;
        console.log("Nothing to translate after filtering hashes!");
        process.exit(0);
      }
      console.log(
        `Skipping ${hashSkip} and translating ${
          Object.keys(parsed).length
        } thanks to hashes...`
      );
      await Utils.sleep(2000);
    } catch {}
})();

var langKeyMap = Object.fromEntries(
  Config.target_langs.map((x) => [x, parsed])
);

if (Config.forceTranslation) {
  const forceTranslation = Config.forceTranslation as
    | "*"
    | {
        [lang in TargetLanguageCode]: "*" | string[];
      };
  if (forceTranslation === "*") {
    langKeyMap = Object.fromEntries(
      Config.target_langs.map((x) => [x, rawParsed])
    );
    console.log("Forcing translation of all langs due to config...");
  } else
    Object.entries(forceTranslation).forEach(([lang, keys]) => {
      if (!langKeyMap[lang]) return;
      if (keys === "*") {
        langKeyMap[lang] = rawParsed;
        console.log(`Forcing translation of ${lang} due to config...`);
        return;
      }
      if (!Array.isArray(keys)) return;
      langKeyMap[lang] = {
        ...langKeyMap[lang],
        ...Object.fromEntries(
          keys
            .map((k) => [k, rawParsed[k]])
            .filter((x) => {
              x[1] &&
                console.log(
                  `Forcing translation of ${x[0]} for ${lang} due to config...`
                );
              return x[1] !== undefined;
            })
        ),
      };
    });
  await Utils.sleep(3000);
}

console.clear();
console.log("Translating...");
const deepl = new DeepL(Config.apiKey),
  timeLang: Record<string, number> = {};

Config.target_langs.forEach((x) =>
  console.log(`\x1b[2m${x}\t-\tLoading...\x1b[0m`)
);

var y = 1;
process.stdout.cursorTo(0, y);
process.stdout.clearLine(0);

const q = new Queue(2);

await Promise.all(
  Config.target_langs.map(
    (lang) =>
      new Promise(async (r) => {
        const _y = y++,
          log = (txt: string) => {
            process.stdout.cursorTo(0, _y);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0, _y);
            process.stdout.write(`\x1b[2m${lang}\t-\t\x1b[0m` + txt);
          };
        timeLang[lang] = Date.now();
        const sentences = Object.keys(langKeyMap[lang]);
        const filename = path.join(
          Config.out,
          Config.nameRewrite
            ? Config.nameRewrite
                .replaceAll("{{LANG}}", lang.toUpperCase())
                .replaceAll("{{lang}}", lang.toLowerCase())
            : path.basename(Config.file).slice(0, -5) +
                "." +
                lang +
                path.extname(Config.file)
        );
        var existingData: Record<string, string> = {};
        if (await fsp.exists(filename)) {
          const rawExistingData = await fsp.readFile(filename, "utf8");
          existingData = isJSON
            ? JSON.parse(rawExistingData)
            : await resx.resx2js(rawExistingData);
          const existingKeys = Object.keys(existingData);
          Object.keys(rawParsed).forEach(
            (k) => !existingKeys.includes(k) && sentences.push(k)
          );
        }
        var translated: any = {};
        for (let index = 0; index < sentences.length; index++) {
          const txtKey = sentences[index];
          const txt = rawParsed[txtKey];
          log(`[${index + 1}/${sentences.length}]`);
          translated[txtKey] = await q.x(() =>
            deepl
              .translate(txt, lang, Config.source_lang)
              .then((x) => x.translations[0].text)
          );
        }
        timeLang[lang] = Date.now() - timeLang[lang];
        log(`Saving to ${filename}...`);
        translated = Object.assign(existingData, translated);
        await fsp.writeFile(
          filename,
          isJSON ? JSON.stringify(translated) : await resx.js2resx(translated)
        );
        log(`Saved as \x1b[32m${filename}\x1b[0m`);
        r(0);
      })
  )
);

console.clear();
if (Config.out) {
  console.log("Saving hashes...\n");
  await fsp.writeFile(
    path.join(Config.out, "deepl.hash"),
    JSON.stringify(
      Object.fromEntries(
        Object.keys(rawParsed).map((k) => [k, Utils.hash(rawParsed[k])])
      )
    )
  );
}
console.log("Translation Done");
Object.entries(timeLang).forEach(([lang, time]) => {
  console.log(
    `\x1b[2m${lang} - \x1b[0m${
      time > 60000 ? `${(time / 1000 / 60).toFixed(2)}m` : `${time / 1000}s`
    }`
  );
});
