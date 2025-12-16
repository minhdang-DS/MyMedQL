import httpx


class APIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    async def send_vitals(self, payload: list[dict]) -> None:
        async with httpx.AsyncClient() as client:
            response = await client.post(self.base_url, json=payload, timeout=10)
            response.raise_for_status()
import os
from typing import Any, Dict

import httpx
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
TOKEN = os.getenv("SIMULATOR_TOKEN", "")


class ApiClient:
    def __init__(self, base_url: str = BACKEND_URL, token: str = TOKEN) -> None:
        self.base_url = base_url.rstrip("/")
        self.token = token
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=10)

    async def close(self) -> None:
        await self._client.aclose()

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def post_vital(self, payload: Dict[str, Any]) -> httpx.Response:
        return await self._client.post("/api/v1/vitals", json=payload, headers=self._headers())



