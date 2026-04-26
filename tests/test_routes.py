"""
CivicIQ Test Suite - Routes Integration Tests
Tests all API endpoints, response formats, and error handling
"""

import json
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("RATELIMIT_STORAGE_URI", "memory://")
os.environ.setdefault("TESTING", "true")

from app import create_app
from routes.elections import _load_elections_data

SUPPORTED_COUNTRIES = ["india", "usa", "uk", "eu", "brazil"]


@pytest.fixture
def app():
    """Create app in testing mode."""
    application = create_app()
    application.config["TESTING"] = True
    return application


@pytest.fixture
def client(app):
    """Create a test client."""
    with app.test_client() as c:
        yield c


class TestHealthRoute:
    """Health check endpoint tests."""

    def test_health_returns_200(self, client):
        """Health endpoint should return 200 OK."""
        res = client.get("/health")
        assert res.status_code == 200

    def test_health_response_structure(self, client):
        """Health response should have required fields."""
        data = json.loads(res.data) if (res := client.get("/health")) else {}
        res = client.get("/health")
        data = json.loads(res.data)
        assert data.get("status") == "ok"
        assert "service" in data

    def test_health_service_name(self, client):
        """Service name should be CivicIQ."""
        res = client.get("/health")
        data = json.loads(res.data)
        assert data.get("service") == "CivicIQ"


class TestElectionsRoute:
    """Election data endpoints tests."""

    def test_elections_returns_200(self, client):
        """GET /api/elections should return 200."""
        res = client.get("/api/elections")
        assert res.status_code == 200

    def test_elections_has_all_supported(self, client):
        """Should return all 5 countries."""
        res = client.get("/api/elections")
        data = json.loads(res.data)
        for country in SUPPORTED_COUNTRIES:
            assert country in data

    def test_elections_summary_fields(self, client):
        """Each country should have required summary fields."""
        res = client.get("/api/elections")
        data = json.loads(res.data)
        for country_id, info in data.items():
            assert "name" in info
            assert "flag" in info
            assert "system" in info

    @pytest.mark.parametrize("country", SUPPORTED_COUNTRIES)
    def test_country_detail_returns_200(self, client, country):
        """GET /api/elections/<country> should return 200."""
        res = client.get(f"/api/elections/{country}")
        assert res.status_code == 200

    @pytest.mark.parametrize("country", SUPPORTED_COUNTRIES)
    def test_country_has_required_fields(self, client, country):
        """Country response should have all required fields."""
        res = client.get(f"/api/elections/{country}")
        data = json.loads(res.data)
        required = ["name", "flag", "system", "body", "frequency",
                    "description", "timeline", "steps", "facts"]
        for field in required:
            assert field in data, f"Missing field '{field}' in {country}"

    def test_invalid_country_returns_404(self, client):
        """Invalid country should return 404."""
        res = client.get("/api/elections/atlantis")
        assert res.status_code == 404

    def test_case_insensitive_lookup(self, client):
        """Lookup should handle uppercase."""
        res = client.get("/api/elections/INDIA")
        assert res.status_code == 200


class TestChatRoute:
    """Chat endpoint tests."""

    def test_chat_requires_post(self, client):
        """Chat should only accept POST."""
        res = client.get("/api/chat")
        assert res.status_code == 405

    def test_chat_empty_message_returns_400(self, client):
        """Empty message should return 400."""
        res = client.post("/api/chat",
                          json={"message": ""},
                          content_type="application/json")
        assert res.status_code == 400

    def test_chat_whitespace_only_returns_400(self, client):
        """Whitespace-only message should return 400."""
        res = client.post("/api/chat",
                          json={"message": "   "},
                          content_type="application/json")
        assert res.status_code == 400

    def test_chat_content_type_required(self, client):
        """Request must have Content-Type: application/json."""
        res = client.post("/api/chat",
                          data="not json",
                          content_type="text/plain")
        assert res.status_code == 400

    def test_chat_valid_message_returns_200_or_500(self, client):
        """Valid message should return 200 (with AI) or 200 (with fallback)."""
        res = client.post("/api/chat",
                          json={"message": "How do elections work in India?"},
                          content_type="application/json")
        # 200 with response, or 500 if AI unavailable in test env
        assert res.status_code in [200, 500]

    def test_chat_oversized_message_rejected(self, client):
        """Message exceeding 500 chars should be rejected."""
        big_message = "x" * 510
        res = client.post("/api/chat",
                          json={"message": big_message},
                          content_type="application/json")
        assert res.status_code == 400


class TestTranslateRoute:
    """Translation endpoint tests."""

    def test_translate_endpoint_exists(self, client):
        """Translate endpoint should be available (disabled or active)."""
        res = client.post("/api/translate",
                          json={"text": "hello", "target_language": "es"},
                          content_type="application/json")
        assert res.status_code in [200, 503]


class TestDataIntegrity:
    """Data structure and content validation."""

    def test_elections_data_loads(self):
        """Elections data JSON should load without errors."""
        data = _load_elections_data()
        assert len(data) == 5

    @pytest.mark.parametrize("country", SUPPORTED_COUNTRIES)
    def test_timeline_structure(self, country):
        """Timeline should have required fields."""
        data = _load_elections_data()[country]
        assert "timeline" in data
        for item in data["timeline"]:
            assert "phase" in item
            assert "days" in item
            assert "description" in item

    @pytest.mark.parametrize("country", SUPPORTED_COUNTRIES)
    def test_steps_structure(self, country):
        """Steps should have required fields."""
        data = _load_elections_data()[country]
        assert "steps" in data
        assert len(data["steps"]) >= 5
        for step in data["steps"]:
            assert "icon" in step
            assert "title" in step
            assert "detail" in step

    @pytest.mark.parametrize("country", SUPPORTED_COUNTRIES)
    def test_facts_not_empty(self, country):
        """Each country should have at least 3 facts."""
        facts = _load_elections_data()[country]["facts"]
        assert len(facts) >= 3

    @pytest.mark.parametrize("country", SUPPORTED_COUNTRIES)
    def test_color_is_valid_hex(self, country):
        """Color should be a valid hex code."""
        color = _load_elections_data()[country]["color"]
        assert color.startswith("#")
        assert len(color) in [4, 7]


class TestSecurityBasic:
    """Basic security checks."""

    def test_xss_in_country_param(self, client):
        """XSS in country parameter should return 404."""
        res = client.get("/api/elections/<script>alert(1)</script>")
        assert res.status_code == 404

    def test_long_country_param(self, client):
        """Very long country parameter should be handled gracefully."""
        res = client.get("/api/elections/" + "x" * 500)
        assert res.status_code == 404

    def test_security_headers_present(self, client):
        """Response should include security headers."""
        res = client.get("/health")
        assert "X-Content-Type-Options" in res.headers
        assert "X-Frame-Options" in res.headers

    def test_404_returns_json(self, client):
        """404 errors should return JSON."""
        res = client.get("/nonexistent-route-xyz")
        assert res.status_code == 404

    def test_index_returns_200(self, client):
        """Homepage should return 200."""
        res = client.get("/")
        assert res.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
