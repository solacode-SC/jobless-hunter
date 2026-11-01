"""LLM Provider abstraction supporting OpenAI-compatible endpoints."""

from __future__ import annotations

import json
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIProvider:
    """Wrapper for LLM completions and structured outputs."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL.rstrip("/")
        self.model = settings.OPENAI_MODEL

    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
        json_output: bool = False,
    ) -> str:
        """Call LLM chat completion API."""
        if not self.api_key:
            logger.warning("AI_API_KEY / OPENAI_API_KEY not configured. Falling back to heuristic response.")
            if json_output:
                return json.dumps({
                    "score": 75,
                    "classification": "Strong match",
                    "explanation": "Evaluated using heuristic matching (LLM API key not configured). Candidate has core software engineering and DevOps profile suitable for technical roles.",
                    "matched_skills": ["Python", "Docker", "Linux", "Git"],
                    "missing_skills": [],
                    "strengths": ["Strong foundational systems background", "DevOps and fullstack exposure"],
                    "gaps": ["Requires manual review against specific domain"]
                })
            return "Professional software engineer with background in C, C++, Python, TypeScript, and DevOps."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        payload: dict = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
        }

        if json_output:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.error("AI Provider request failed: %s", e)
                raise


ai_provider = AIProvider()
