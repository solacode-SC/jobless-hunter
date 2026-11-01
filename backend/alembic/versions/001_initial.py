"""Initial migration creating all tables.

Revision ID: 001_initial
Revises: 
Create Date: 2026-11-01 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=320), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=1024), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Candidate Profiles
    op.create_table(
        'candidate_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=300), nullable=False),
        sa.Column('email', sa.String(length=320), nullable=False, unique=True),
        sa.Column('professional_title', sa.String(length=300), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('education', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('experience', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('portfolio_url', sa.String(length=500), nullable=True),
        sa.Column('github_url', sa.String(length=500), nullable=True),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('original_cv_path', sa.String(length=500), nullable=True),
        sa.Column('cv_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('preferences', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Jobs
    op.create_table(
        'jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(length=500), nullable=False, index=True),
        sa.Column('company', sa.String(length=300), nullable=False, index=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=300), nullable=True),
        sa.Column('remote_status', sa.String(length=50), nullable=False, server_default='unknown'),
        sa.Column('employment_type', sa.String(length=50), nullable=True),
        sa.Column('salary_min', sa.Float(), nullable=True),
        sa.Column('salary_max', sa.Float(), nullable=True),
        sa.Column('salary_currency', sa.String(length=10), nullable=True),
        sa.Column('required_skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('experience_years_min', sa.Integer(), nullable=True),
        sa.Column('experience_years_max', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=False, server_default='other', index=True),
        sa.Column('source_url', sa.String(length=2000), nullable=True),
        sa.Column('source_job_id', sa.String(length=300), nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('discovered_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('application_deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('fingerprint', sa.String(length=64), unique=True, nullable=False, index=True),
        sa.Column('match_score', sa.Float(), nullable=True),
        sa.Column('match_explanation', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='discovered', index=True),
        sa.Column('raw_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Documents
    op.create_table(
        'documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('jobs.id', ondelete='SET NULL'), nullable=True),
        sa.Column('candidate_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('candidate_profiles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('is_approved', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('metadata_', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Applications
    op.create_table(
        'applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('candidate_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('candidate_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='discovered', index=True),
        sa.Column('cv_document_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('cover_letter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('submission_method', sa.String(length=100), nullable=True),
        sa.Column('application_url', sa.String(length=2000), nullable=True),
        sa.Column('recruiter_name', sa.String(length=300), nullable=True),
        sa.Column('recruiter_email', sa.String(length=320), nullable=True),
        sa.Column('follow_up_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('history', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=200), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('applications')
    op.drop_table('documents')
    op.drop_table('jobs')
    op.drop_table('candidate_profiles')
    op.drop_table('users')
