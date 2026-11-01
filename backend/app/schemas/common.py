"""Common schemas: pagination, filters, generic responses."""

from __future__ import annotations

from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Query parameters for paginated endpoints."""

    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def create(
        cls, items: list[T], total: int, page: int, page_size: int
    ) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=max(1, (total + page_size - 1) // page_size),
        )


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str
    detail: str | None = None


class ErrorResponse(BaseModel):
    """Standardised error response."""

    error: str
    detail: str | None = None
    code: str | None = None


class StatusResponse(BaseModel):
    """Generic status response."""

    status: str
    data: dict[str, Any] | None = None


class IDResponse(BaseModel):
    """Response containing a created resource ID."""

    id: UUID
    message: str = "Created successfully"
