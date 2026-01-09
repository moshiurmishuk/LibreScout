import os
import json
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()


def _parse_origins(value: str | None) -> list[str]:
    """
    Accepts:
      - empty / missing -> ["*"]
      - JSON list string -> ["http://localhost:3000", ...]
      - comma-separated -> "http://a,http://b"
    """
    if not value:
        return ["*"]

    v = value.strip()

    # JSON list
    if v.startswith("["):
        try:
            data = json.loads(v)
            if isinstance(data, list) and all(isinstance(x, str) for x in data):
                return data
        except Exception:
            pass

    # Comma-separated
    parts = [p.strip() for p in v.split(",") if p.strip()]
    return parts or ["*"]


@dataclass(frozen=True)
class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SERPAPI_API_KEY: str = os.getenv("SERPAPI_API_KEY", "")

    CORS_ALLOW_ORIGINS: list[str] = field(
        default_factory=lambda: _parse_origins(os.getenv("CORS_ALLOW_ORIGINS"))
    )


settings = Settings()
