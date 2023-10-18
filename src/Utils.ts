import crypto from "crypto";

export default {
  hash: (txt: string) => crypto.createHash("md5").update(txt).digest("hex"),
  sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
};
