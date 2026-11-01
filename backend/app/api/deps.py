"""Common API dependencies."""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User

__all__ = ["get_db", "get_current_user", "get_current_admin_user", "User", "AsyncSession", "Depends"]
