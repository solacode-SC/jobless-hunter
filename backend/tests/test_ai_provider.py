"""Tests for AI multi-provider selection and fallback."""

from app.services.ai.provider import AIProvider, ProviderConfig


def test_provider_config_status():
    p1 = ProviderConfig("deepseek", "sk-valid-key", "https://api.deepseek.com", "deepseek-chat")
    assert p1.is_configured is True

    p2 = ProviderConfig("gemini", "", "https://generativelanguage.googleapis.com", "gemini-2.5-flash")
    assert p2.is_configured is False

    p3 = ProviderConfig("deepseek", "your-key-here", "https://api.deepseek.com", "deepseek-chat")
    assert p3.is_configured is False


def test_provider_ordering_auto():
    ai = AIProvider()
    ai.set_active_preference("auto")
    providers = ai.get_configured_providers()
    names = [p.name for p in providers]
    assert "deepseek" in names
    assert "gemini" in names


def test_provider_ordering_override():
    ai = AIProvider()
    ai.set_active_preference("gemini")
    providers = ai.get_configured_providers()
    assert providers[0].name == "gemini"

    ai.set_active_preference("deepseek")
    providers = ai.get_configured_providers()
    assert providers[0].name == "deepseek"


def test_providers_status_dict():
    ai = AIProvider()
    status = ai.get_providers_status()
    assert "providers" in status
    assert "active_preference" in status
    assert len(status["providers"]) >= 2

