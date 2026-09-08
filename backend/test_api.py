"""
Automated Unit Tests for Find Me API and Indian Government Priority Matching
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.match_engine import calculate_match_score, analyze_skill_gap, EXCHANGE_RATES

client = TestClient(app)

class TestFindMePlatform(unittest.TestCase):

    def test_list_internships(self):
        """Test GET /api/internships returns valid opportunities with last_updated and verification fields."""
        response = client.get("/api/internships")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("internships", data)
        self.assertGreater(data["total"], 12)

        first = data["internships"][0]
        self.assertIn("title", first)
        self.assertIn("organization", first)
        self.assertIn("gov_type", first)
        self.assertIn("is_official_verified", first)
        self.assertIn("last_updated", first)

    def test_filter_by_gov_type(self):
        """Test filtering by Government of India and State Government."""
        # Govt of India
        res_ind = client.get("/api/internships?gov_type=Government%20of%20India")
        self.assertEqual(res_ind.status_code, 200)
        data_ind = res_ind.json()
        self.assertGreater(data_ind["total"], 5)
        for item in data_ind["internships"]:
            self.assertEqual(item["gov_type"], "Government of India")
            self.assertTrue(item["is_official_verified"])

        # State Government
        res_state = client.get("/api/internships?gov_type=State%20Government")
        self.assertEqual(res_state.status_code, 200)
        data_state = res_state.json()
        self.assertGreater(data_state["total"], 1)
        for item in data_state["internships"]:
            self.assertEqual(item["gov_type"], "State Government")

    def test_indian_government_portals_present(self):
        """Verify premier Indian portals (NITI Aayog, RBI, SEBI, ISRO, DRDO, MeitY)."""
        res = client.get("/api/internships")
        data = res.json()
        orgs = [i["organization"] for i in data["internships"]]

        self.assertTrue(any("NITI Aayog" in o for o in orgs))
        self.assertTrue(any("Reserve Bank of India" in o for o in orgs))
        self.assertTrue(any("Securities and Exchange Board of India" in o for o in orgs))
        self.assertTrue(any("ISRO" in o for o in orgs))
        self.assertTrue(any("DRDO" in o for o in orgs))

    def test_expanded_skill_up_courses(self):
        """Test GET /api/courses returns Skill India, SWAYAM, NPTEL, and global tech leaders."""
        res = client.get("/api/courses")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total"], 10)

        providers = [c["provider_category"] for c in data["courses"]]
        self.assertTrue(any("Skill India" in p for p in providers))
        self.assertTrue(any("SWAYAM" in p or "NPTEL" in p for p in providers))
        self.assertTrue(any("Google" in p for p in providers))
        self.assertTrue(any("Microsoft" in p for p in providers))
        self.assertTrue(any("AWS" in p for p in providers))
        self.assertTrue(any("IBM" in p for p in providers))
        self.assertTrue(any("Salesforce" in p for p in providers))
        self.assertTrue(any("Cisco" in p for p in providers))

    def test_indian_student_match_scoring_boost(self):
        """Test Indian Government opportunities receive priority boost for Indian students."""
        profile = {
            "name": "Aarav Sharma",
            "education_level": "Bachelor's",
            "degree": "Computer Science",
            "graduation_year": 2027,
            "skills": ["Python", "Data Analysis", "SQL", "Policy Analysis"],
            "languages": ["English", "Hindi"],
            "experience_level": "No prior experience",
            "preferred_countries": ["India"],
            "prefer_remote": False,
            "desired_industries": ["Government & Public Policy"],
            "citizenship": "India",
            "eligible_government": True
        }

        niti_aayog = {
            "title": "NITI Aayog Official Internship Scheme",
            "sector": "Government",
            "gov_type": "Government of India",
            "education_level": ["Bachelor's", "Master's", "PhD"],
            "degrees": ["Economics", "Computer Science", "Public Policy"],
            "required_skills": ["Policy Analysis", "Research", "Data Analysis"],
            "preferred_skills": ["Python"],
            "country": "India",
            "work_mode": "Onsite",
            "deadline": "2026-10-10",
            "gov_eligibility": "Indian citizens with >70% marks"
        }

        result = calculate_match_score(profile, niti_aayog)
        self.assertGreaterEqual(result["total_score"], 80)
        self.assertIn("Government of India", result["why_matched"])

    def test_match_endpoint_ranking(self):
        """Test POST /api/match returns top ranked internships."""
        payload = {
            "profile": {
                "name": "Pooja Patel",
                "education_level": "Bachelor's",
                "degree": "Computer Science",
                "graduation_year": 2027,
                "skills": ["Python", "C++", "Signal Processing"],
                "languages": ["English", "Hindi"],
                "experience_level": "No prior experience",
                "preferred_countries": ["India"],
                "prefer_remote": False,
                "desired_industries": ["Space & Aerospace"],
                "citizenship": "India",
                "eligible_government": True
            },
            "min_score": 50
        }

        res = client.post("/api/match", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("results", data)
        self.assertGreater(len(data["results"]), 0)

        # ISRO should rank high
        top_orgs = [item["organization"] for item in data["results"][:3]]
        self.assertTrue(any("ISRO" in o for o in top_orgs))

    def test_currencies_endpoint(self):
        """Test GET /api/currencies returns INR base and major world currencies."""
        res = client.get("/api/currencies")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("INR", data["rates"])
        self.assertIn("USD", data["rates"])

    def test_stats_endpoint(self):
        """Test GET /api/stats includes Indian Government and State Government counts."""
        res = client.get("/api/stats")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("gov_india_count", data)
        self.assertIn("state_gov_count", data)
        self.assertGreater(data["gov_india_count"], 5)

if __name__ == "__main__":
    unittest.main()
