import { Rsp } from "./Types";

export default class DeepL {
  constructor(private apiKey: string) {}

  translate = (text: string, lang: string, sourceLang?: string) =>
    fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
      },
      body: JSON.stringify({
        text: [text],
        target_lang: lang,
        source_lang: sourceLang,
      }),
    })
      .then((x) => x.json<Rsp>())
      .then((x) => {
        if (!x.translations) {
          console.clear();
          console.error(JSON.stringify(x, null, 2));
          process.exit(1);
        }
        return x;
      });
}
