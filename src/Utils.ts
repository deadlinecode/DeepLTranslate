import crypto from "crypto";

const Utils = {
  hash: (txt: string) => crypto.createHash("md5").update(txt).digest("hex"),
  sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
  numF: new Intl.NumberFormat("de-DE").format,
  centerText: (text: string, char = "#", padding = 2) => {
    const textLength = text.replace(/\x1b\[[0-9;]*m/gm, "").length,
      columns = process.stdout.columns || 80;
    if (columns < textLength) return text;
    var terminalWidth = Math.floor((columns - textLength) / 2) - padding;
    terminalWidth < 0 && (terminalWidth *= -1);
    return `${char.repeat(terminalWidth)}${" ".repeat(
      padding
    )}${text}${" ".repeat(padding)}${char.repeat(
      terminalWidth + ((columns - textLength) % 2)
    )}`;
  },
  header: (text: string) =>
    console.log(
      [
        "\n\n",
        "#".repeat(process.stdout.columns || 80),
        Utils.centerText(`\x1b[36m${text}\x1b[0m`),
        "#".repeat(process.stdout.columns || 80),
      ].join("\n")
    ),
  path: {
    isAbsolute: (path: string) => /^(?:[A-Za-z]:\\)|(\/)/.test(path),
  },
};

export default Utils;
