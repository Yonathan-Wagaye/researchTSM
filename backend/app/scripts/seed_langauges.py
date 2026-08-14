"""
- A temporary script to add languages to the database
- In later version this will be handled through an admin role account that can add and remove langauegs globally
"""

import asyncio
import csv
from pathlib import Path

from app.database import AsyncSessionLocal
from app.models.language import Language


async def seed_langauges(file_path: str) -> None:
    async with AsyncSessionLocal() as db:
        with open(file_path, "r", encoding="utf-8", newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                language = Language(
                    code=row["code"],
                    name=row["name"],
                    native_name=row["native_name"],
                    direction=row["direction"],
                )
                db.add(language)
        await db.commit()


if __name__ == "__main__":
    csv_path = Path(__file__).with_name("languages.csv")
    asyncio.run(seed_langauges(csv_path))
