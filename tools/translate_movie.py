#!/usr/bin/env python3
"""Fill missing Russian translations in an exported movie.json using DeepL."""

import argparse
import json
import os
from pathlib import Path
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def translate(endpoint, key, lines, context):
    body = json.dumps(
        {"text": lines, "source_lang": "EN", "target_lang": "RU", "context": context},
        ensure_ascii=False,
    ).encode("utf-8")
    request = Request(
        endpoint,
        data=body,
        headers={"Authorization": f"DeepL-Auth-Key {key}", "Content-Type": "application/json"},
        method="POST",
    )
    for attempt in range(4):
        try:
            with urlopen(request, timeout=45) as response:
                translations = [item["text"] for item in json.load(response)["translations"]]
            if len(translations) != len(lines) or any(not text.strip() for text in translations):
                raise ValueError("DeepL returned incomplete translations.")
            return translations
        except HTTPError as error:
            if attempt == 3 or error.code not in (429, 500, 502, 503, 504):
                raise ValueError(f"DeepL returned HTTP {error.code}. Check your key, plan or quota.") from None
            time.sleep(2 ** attempt)


def fill_translations(phrases, endpoint, key):
    batch_size = 8
    for offset in range(0, len(phrases), batch_size):
        end = offset + batch_size
        missing = [phrase for phrase in phrases[offset:end] if not phrase.get("ru", "").strip()]
        if not missing:
            continue
        neighbors = phrases[max(offset - 2, 0):end + 2]
        context = "\n".join(phrase["en"] for phrase in neighbors)
        translations = translate(endpoint, key, [phrase["en"] for phrase in missing], context)
        for phrase, russian in zip(missing, translations):
            phrase["ru"] = russian


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="JSON exported by the movie player")
    parser.add_argument("output", type=Path, help="a new JSON file")
    parser.add_argument("--pro", action="store_true", help="use the DeepL API Pro endpoint")
    args = parser.parse_args()
    key = os.environ.get("DEEPL_AUTH_KEY")
    if not key:
        parser.error("set the DEEPL_AUTH_KEY environment variable first")
    if args.output.exists():
        parser.error("the output file already exists")
    host = "api.deepl.com" if args.pro else "api-free.deepl.com"
    try:
        data = json.loads(args.source.read_text(encoding="utf-8-sig"))
        phrases = data["phrases"]
        if not isinstance(phrases, list) or not phrases or any(
            not isinstance(phrase.get("en"), str) or not phrase["en"].strip()
            or not isinstance(phrase.get("ru", ""), str) for phrase in phrases
        ):
            raise ValueError("Expected a movie JSON exported by movie.html.")
        fill_translations(phrases, f"https://{host}/v2/translate", key)
        content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        with args.output.open("x", encoding="utf-8") as output:
            output.write(content)
    except (OSError, KeyError, AttributeError, TypeError, ValueError) as error:
        parser.exit(1, f"{error}\n")
    print(f"Saved {len(phrases)} phrases to {args.output}")


if __name__ == "__main__":
    main()
