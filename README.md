# DeepLTranslate

> A script to translate text using DeepL API supporting json and resx files as well as hashing comparision to prevent unnecessary translations

## Installation

1. Install [Bun](https://bun.sh) or [Node JS](https://nodejs.org)
2. Clone the Repo
3. Run `bun install` or `npm install`

## Usage

### General

To start the script run `bun run src/index.ts` or `npx ts-node src/index.ts`
<br/>
<br/>
You will also need config.json to be in the scripts root directory.
<br/>
Alternatively you can specify the path to the config file by passing it as an argument to the script like so:

```bash
npx ts-node src/index.ts path/to/config.json
# or
bun run src/index.ts path/to/config.json
```

Be aware that if you do so the script will also take the configs path as the root path for calculating the config paths.

### Config

#### Examples

Here are some examples for the config.json file

```json
{
  "apiKey": "XXX-XXX-XXX:fx",
  "file": "./de.json",
  "out": "./out",
  "source_lang": "DE",
  "target_langs": ["EN", "FR", "NL"],
  "nameRewrite": "{{lang}}.json",
  "forceTranslation": {
    "EN": "*"
  }
}
```

This config will translate the file `de.json` to `en.json`, `fr.json` and `nl.json` and save them in the `out` directory. For the english file the script will translate every key no matter if it already got translated (according to the hash file)
<br/>
<br/>

```json
{
  "apiKey": "XXX-XXX-XXX:fx",
  "file": "./de.json",
  "source_lang": "DE",
  "target_langs": ["EN", "FR", "NL"]
}
```

This config will translate the file `de.json` to `en.json`, `fr.json` and `nl.json` and save them in the same directory as the `config.json` file.
<br/>
<br/>

```json
{
  "apiKey": "XXX-XXX-XXX:fx",
  "file": "C:/Projects/TestCSharp/Properties/Resources.de.resx",
  "target_langs": ["EN", "NL", "FR"],
  "nameRewrite": "Resources.{{lang}}.resx",
  "forceTranslation": {
    "NL": ["key1", "key2"]
  }
}
```

When executing this via `npx ts-node src/index.ts C:/Projects/TestCSharp/Properties/config.json` the script will translate the file `Resources.de.resx` to `Resources.en.resx`, `Resources.nl.resx` and `Resources.fr.resx` and save them in the same directory as the `config.json` file. It will also force translation of the keys `key1` and `key2` for the dutch file.

#### Definitions

`apiKey`, `file`, `source_lang` and `target_langs` are required while `nameRewrite`, `out` and `forceTranslation` are optional.
<br/>
<br/>
More infos:
| Key | Required | Description |
| --- | --- | --- |
| apiKey | Yes | The API key for DeepL |
| file | Yes | The path to the file to translate<br/>This should be either a JSON file with key value string pairs or a ResX File |
| source_lang | Yes | The case<b>in</b>sensitive 2 letter language code of the file to translate |
| target_langs | Yes | An array of case<b>in</b>sensitive 2 letter language codes to translate the file to |
| nameRewrite | No | A string that will be used to rewrite the name of the translated files<br/>The string can contain the following placeholders:<br/>`{{lang}}` - The lowercase language code of the translated file<br/>`{{LANG}}` - The uppercase language code of the translated file<br/>If not supplied the translated files will have the same name as the source file with the uppercase language code between the file name and the file ending |
| out | No | The path to the directory where the translated files and hash file should be saved<br/>If not supplied the translated files will be saved in the same directory as the config file |
| forceTranslation | No | Use this to force translation for specific target languages<br/><br/>You can force translation of all target languages like this<br/>`"forceTranslation": "*"`<br/><br/>You can force translation of a specific language like this<br/>`"forceTranslation": { "EN": "*" }`<br/><br/>You can force translation of a specific language and one or more specific keys like this<br/>`"forceTranslation": { "EN": ["key1", "key2"] }`

## About hashing and other functions

The script will create a `deepl.hash` file in the same directory as the translated files.
<br/>
This file contains the hashes of the source file and will be used on reruns to only translate new content.
<br/>
<br/>
Further more the script will also detect if some keys are missing in one of the already existing translated files and will also translate the missing keys so that you always have everything translated.
