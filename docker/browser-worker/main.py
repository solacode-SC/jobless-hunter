import os
import logging
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from playwright.async_api import async_playwright, Browser, Page

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("browser-worker")

app = FastAPI(title="JobHunter Browser Worker API")

TIMEOUT = int(os.getenv("BROWSER_TIMEOUT", 45000))

class ScrapeRequest(BaseModel):
    url: str
    wait_for_selector: Optional[str] = None
    timeout_ms: Optional[int] = None

class ScrapeResponse(BaseModel):
    url: str
    title: str
    content: str
    status: str

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "browser-worker"}

@app.post("/scrape", response_model=ScrapeResponse)
async def scrape_page(request: ScrapeRequest):
    logger.info(f"Scraping requested URL: {request.url}")
    timeout = request.timeout_ms or TIMEOUT
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-blink-features=AutomationControlled",
                ]
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            await page.goto(request.url, timeout=timeout, wait_until="domcontentloaded")
            
            if request.wait_for_selector:
                try:
                    await page.wait_for_selector(request.wait_for_selector, timeout=10000)
                except Exception as e:
                    logger.warning(f"Selector {request.wait_for_selector} wait timed out: {e}")

            title = await page.title()
            content = await page.content()
            await browser.close()
            return ScrapeResponse(url=request.url, title=title, content=content, status="success")
    except Exception as exc:
        logger.error(f"Error scraping {request.url}: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
