"""Schemas module index."""

from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.job import JobBase, JobCreate, JobResponse, JobSummary, JobFilters, JobStats, JobEvaluateRequest, JobEvaluateResponse
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate, ApplicationUpdate, ApplicationSummary, PipelineResponse, PipelineStage
from app.schemas.document import DocumentGenerateCV, DocumentGenerateCoverLetter, DocumentUpdate, DocumentResponse, DocumentSummary
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateResponse
from app.schemas.common import PaginationParams, PaginatedResponse, MessageResponse, ErrorResponse, StatusResponse, IDResponse

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "JobBase",
    "JobCreate",
    "JobResponse",
    "JobSummary",
    "JobFilters",
    "JobStats",
    "JobEvaluateRequest",
    "JobEvaluateResponse",
    "ApplicationCreate",
    "ApplicationResponse",
    "ApplicationStatusUpdate",
    "ApplicationUpdate",
    "ApplicationSummary",
    "PipelineResponse",
    "PipelineStage",
    "DocumentGenerateCV",
    "DocumentGenerateCoverLetter",
    "DocumentUpdate",
    "DocumentResponse",
    "DocumentSummary",
    "CandidateCreate",
    "CandidateUpdate",
    "CandidateResponse",
    "PaginationParams",
    "PaginatedResponse",
    "MessageResponse",
    "ErrorResponse",
    "StatusResponse",
    "IDResponse",
]

