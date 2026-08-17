import csv
import io
from pathlib import Path

import openpyxl

KEY_HEADER = "KEY"


def read_csv(content: bytes) -> list[dict]:
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")))
    return list(reader)


def read_excel(content: bytes) -> list[dict]:
    workbook = openpyxl.load_workbook(
        io.BytesIO(content),
        read_only=True,
        data_only=True,
    )
    sheet = workbook.active
    rows = sheet.iter_rows(values_only=True)
    headers = [
        str(header).strip() if header is not None else "" for header in next(rows)
    ]
    records = []
    for row in rows:
        records.append(
            {
                header: ("" if value is None else str(value))
                for header, value in zip(headers, row)
                if header
            }
        )
    return records


def parse_phrase_file(filename: str, content: bytes) -> list[dict]:
    suffix = Path(filename).suffix.lower()
    if suffix in {".xlsx", ".xls"}:
        return read_excel(content)
    if suffix == ".csv":
        return read_csv(content)
    raise ValueError(f"Unsupported file type: {suffix}")


def extract_language_codes(headers: list[str]) -> list[str]:
    return [
        header.strip().upper()
        for header in headers
        if header.strip() and header.strip().upper() != KEY_HEADER
    ]


def unsupported_language_codes(
    language_codes: list[str],
    supported_codes: set[str],
) -> list[str]:
    supported = {code.upper() for code in supported_codes}
    return sorted({code for code in language_codes if code not in supported})


def get_row_key(row: dict) -> str:
    for header, value in row.items():
        if header.strip().upper() == KEY_HEADER:
            return (value or "").strip()
    return ""


def get_row_translation(row: dict, language_code: str) -> str:
    normalized_code = language_code.strip().upper()
    for header, value in row.items():
        if header.strip().upper() == normalized_code:
            return (value or "").strip()
    return ""


def analyze_phrase_rows(
    rows: list[dict],
    language_codes: list[str],
    preview_limit: int = 5,
) -> tuple[list[dict], list[str], int, dict[str, int]]:
    key_counts: dict[str, int] = {}
    duplicate_keys: set[str] = set()
    empty_key_count = 0
    translation_counts = dict.fromkeys(language_codes, 0)
    preview: list[dict] = []

    for row in rows:
        key = get_row_key(row)
        if not key:
            empty_key_count += 1
            continue

        key_counts[key] = key_counts.get(key, 0) + 1
        if key_counts[key] > 1:
            duplicate_keys.add(key)

        for code in language_codes:
            if get_row_translation(row, code):
                translation_counts[code] += 1

    for row in rows[:preview_limit]:
        preview.append(
            {
                "key": get_row_key(row),
                "translations": {
                    code: get_row_translation(row, code) for code in language_codes
                },
            }
        )

    return preview, sorted(duplicate_keys), empty_key_count, translation_counts


def keep_supported_columns(
    rows: list[dict],
    supported_codes: set[str],
) -> tuple[list[dict], list[str], list[str]]:
    if not rows:
        return [], [], []

    language_codes = extract_language_codes(list(rows[0].keys()))
    unsupported = unsupported_language_codes(language_codes, supported_codes)
    unsupported_set = set(unsupported)
    allowed = {KEY_HEADER} | {code.upper() for code in supported_codes}
    filtered_rows = [
        {key: value for key, value in row.items() if key.strip().upper() in allowed}
        for row in rows
    ]
    kept = [code for code in language_codes if code not in unsupported_set]
    return filtered_rows, kept, unsupported
