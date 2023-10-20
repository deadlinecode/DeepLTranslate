import { TranslateRsp, UsageRsp } from "./Types";

export default class DeepL {
  private readonly baseURL = "https://api-free.deepl.com/v2";
  constructor(private apiKey: string) {}

  private req = <T extends any>(
    url: `/${string}`,
    method: "POST" | "GET",
    body?: Record<string, any>
  ) =>
    fetch(`${this.baseURL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    }).then((x) => x.json<T>());

  usage = () => this.req<UsageRsp>("/usage", "GET");

  translate = (
    text: string,
    lang: string,
    sourceLang?: string,
    options?: {
      tag_handling?: "xml" | "html";
    }
  ) =>
    this.req<TranslateRsp>("/translate", "POST", {
      text: [text],
      target_lang: lang,
      source_lang: sourceLang,
      ...options,
    }).then((x) => {
      if (!x.translations) {
        console.clear();
        console.error(JSON.stringify(x, null, 2));
        process.exit(1);
      }
      return x;
    });
}
