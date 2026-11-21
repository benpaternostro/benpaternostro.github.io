from html.parser import HTMLParser
from pathlib import Path
import json
import re
import struct
import subprocess
import tempfile
import tomllib
import unittest
from urllib.parse import urlsplit
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
_BUILD_DIRECTORY = None
_BUILT_SITE = None
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def month_stamp(date: str) -> int | None:
    """Months since year 0 for a date written like 'Sep 2026', else None."""
    match = re.fullmatch(r"([A-Z][a-z]{2}) (\d{4})", date)
    if not match or match.group(1) not in MONTHS:
        return None
    return int(match.group(2)) * 12 + MONTHS.index(match.group(1))


def built_site() -> Path:
    global _BUILD_DIRECTORY, _BUILT_SITE
    if _BUILT_SITE is None:
        _BUILD_DIRECTORY = tempfile.TemporaryDirectory(prefix="portfolio-site-")
        _BUILT_SITE = Path(_BUILD_DIRECTORY.name)
        result = subprocess.run(
            ["zola", "build", "--output-dir", str(_BUILT_SITE), "--force"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise AssertionError(
                f"Zola build failed:\n{result.stdout}\n{result.stderr}"
            )
    return _BUILT_SITE


class Document(HTMLParser):
    def __init__(self, html: str):
        super().__init__()
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.text_parts: list[str] = []
        self.years: list[str] = []
        self.images: list[str] = []
        self.feed(html)

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.add(values["id"])
        if tag == "a" and values.get("href"):
            self.links.append(values["href"])
        if tag == "time" and values.get("datetime"):
            self.years.append(values["datetime"])
        if tag == "img" and values.get("src"):
            self.images.append(values["src"])

    def handle_data(self, data: str) -> None:
        self.text_parts.append(data)

    @property
    def text(self) -> str:
        return " ".join(self.text_parts)


class ResumeDataContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with (ROOT / "data/resume.toml").open("rb") as source:
            cls.resume = tomllib.load(source)

    def test_introduction_is_plain_and_concise(self) -> None:
        basics = self.resume["basics"]
        self.assertIn("**Octet**", basics.get("short_bio", ""))
        self.assertIn("Sydney", basics.get("short_bio", ""))
        self.assertIn("Full-stack engineer", basics["summary"])

    def test_current_role_leads_the_experience_list(self) -> None:
        current = self.resume["experience"][0]
        self.assertEqual("Present", current["end_date"])

    def test_experience_dates_are_valid_and_newest_first(self) -> None:
        previous_start = None
        for item in self.resume["experience"]:
            start = month_stamp(item["start_date"])
            self.assertIsNotNone(start, f'{item["role"]}: start_date {item["start_date"]!r}')
            if item["end_date"] != "Present":
                end = month_stamp(item["end_date"])
                self.assertIsNotNone(end, f'{item["role"]}: end_date {item["end_date"]!r}')
                self.assertLessEqual(start, end, item["role"])
            if previous_start is not None:
                self.assertLessEqual(start, previous_start, "roles run newest first")
            previous_start = start


class BuiltSiteContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        site = built_site()
        cls.home_html = (site / "index.html").read_text()
        cls.print_html = (site / "resume/print/index.html").read_text()
        cls.not_found_html = (site / "404.html").read_text()
        cls.home = Document(cls.home_html)
        cls.print_document = Document(cls.print_html)

    def test_homepage_has_minimal_identity_and_links(self) -> None:
        self.assertIn("Ben Paternostro", self.home.text)
        self.assertIn("<strong>Octet</strong>", self.home_html)
        self.assertIn("test automation and site reliability", self.home.text)
        self.assertNotIn("**", self.home_html)
        self.assertIn("mailto:contact@benpaternostro.com", self.home.links)
        self.assertIn("https://benpaternostro.com/resume/print/", self.home.links)
        self.assertIn("https://www.linkedin.com/in/benpaternostro", self.home.links)

    def test_homepage_lists_seven_companies_newest_first(self) -> None:
        self.assertEqual(["2026", "2025", "2024", "2023", "2020", "2019", "2016"], self.home.years)
        for company in ("Octet", "Greenstone", "Simpology", "DroneShield", "Rokt", "Prospa", "Medical Director"):
            self.assertIn(company, self.home.text)

    def test_homepage_ships_zero_javascript_and_no_em_dashes(self) -> None:
        self.assertNotIn("\u2014", self.home_html)
        self.assertNotIn("&mdash;", self.home_html)
        scripts = re.findall(r"<script\b[^>]*>", self.home_html)
        self.assertEqual(['<script type="application/ld+json">'], scripts)
        self.assertFalse((built_site() / "trace.js").exists())

    def test_link_preview_metadata_is_published(self) -> None:
        self.assertIn('property="og:title"', self.home_html)
        self.assertIn(
            'property="og:image" content="https://benpaternostro.com/og.png"',
            self.home_html,
        )
        self.assertIn('name="twitter:card" content="summary_large_image"', self.home_html)
        image = (built_site() / "og.png").read_bytes()
        self.assertEqual(b"\x89PNG\r\n\x1a\n", image[:8])
        self.assertEqual((1200, 630), struct.unpack_from(">II", image, 16))
        self.assertLess(len(image), 300_000)

    def test_person_structured_data_is_valid_json(self) -> None:
        match = re.search(
            r'<script type="application/ld\+json">(.*?)</script>',
            self.home_html,
            re.DOTALL,
        )
        self.assertIsNotNone(match)
        person = json.loads(match.group(1))
        self.assertEqual("Person", person["@type"])
        self.assertEqual("Ben Paternostro", person["name"])
        self.assertEqual("https://benpaternostro.com", person["url"])
        self.assertEqual("Octet", person["worksFor"]["name"])
        self.assertIn("https://www.linkedin.com/in/benpaternostro", person["sameAs"])

    def test_every_fragment_link_resolves(self) -> None:
        for link in self.home.links:
            if link.startswith("#"):
                self.assertIn(link[1:], self.home.ids)

    def test_project_cover_is_published_as_webp(self) -> None:
        self.assertTrue(self.home.images)
        for url in self.home.images:
            self.assertNotIn("prototypes", url)
            asset = built_site() / urlsplit(url).path.lstrip("/")
            self.assertTrue(asset.is_file())
            self.assertEqual(".webp", asset.suffix)
            self.assertLess(asset.stat().st_size, 100_000)

    def test_print_resume_keeps_every_role_and_highlight(self) -> None:
        with (ROOT / "data/resume.toml").open("rb") as source:
            resume = tomllib.load(source)
        self.assertNotIn("<script", self.print_html)
        for item in resume["experience"]:
            self.assertIn(item["role"], self.print_document.text)
            self.assertIn(item["company"], self.print_document.text)

    def test_custom_404_page_is_built(self) -> None:
        self.assertIn("Page not found", self.not_found_html)
        self.assertIn("https://benpaternostro.com/", self.not_found_html)


class FontDeliveryContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.site = built_site()
        cls.home_html = (cls.site / "index.html").read_text()
        cls.print_html = (cls.site / "resume/print/index.html").read_text()
        cls.styles = (cls.site / "styles.css").read_text()

    def test_literata_font_is_shipped_and_preloaded(self) -> None:
        asset = self.site / "fonts/literata-var.woff2"
        self.assertTrue(asset.is_file())
        self.assertEqual(b"wOF2", asset.read_bytes()[:4])
        self.assertLess(asset.stat().st_size, 80_000)
        self.assertIn(
            'rel="preload" href="https://benpaternostro.com/fonts/literata-var.woff2" as="font"',
            " ".join(self.home_html.split()),
        )
        self.assertIn('url("/fonts/literata-var.woff2")', self.styles)
        self.assertTrue((self.site / "fonts/literata-LICENSE.txt").is_file())

    def test_every_shipped_font_is_used(self) -> None:
        fonts = self.site / "fonts"
        self.assertFalse(list(fonts.glob("*.ttf")))
        pages = self.home_html + self.print_html + self.styles
        shipped = sorted(font.name for font in fonts.glob("*.woff2"))
        self.assertEqual(["inter-latin-wght-normal.woff2", "literata-var.woff2"], shipped)
        for name in shipped:
            self.assertIn(f"fonts/{name}", pages)


class FaviconDeliveryContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.site = built_site()
        cls.home_html = (cls.site / "index.html").read_text()

    def test_ico_fallback_precedes_the_scalable_svg_favicon(self) -> None:
        self.assertRegex(
            self.home_html,
            r'rel="icon" href="https://benpaternostro\.com/favicon\.ico\?h=[0-9a-f]+" sizes="16x16 32x32"',
        )
        self.assertRegex(
            self.home_html,
            r'rel="icon" type="image/svg\+xml" href="https://benpaternostro\.com/favicon\.svg\?h=[0-9a-f]+" sizes="any"',
        )
        self.assertRegex(
            self.home_html,
            r'rel="apple-touch-icon" href="https://benpaternostro\.com/apple-touch-icon\.png\?h=[0-9a-f]+" sizes="180x180"',
        )
        self.assertLess(
            self.home_html.index("favicon.ico"),
            self.home_html.index("favicon.svg"),
        )

    def test_svg_favicon_is_pure_ink_black_square_with_white_b(self) -> None:
        svg = self.site / "favicon.svg"
        self.assertTrue(svg.is_file())
        root = ElementTree.parse(svg).getroot()
        ns = "{http://www.w3.org/2000/svg}"
        self.assertEqual("0 0 32 32", root.attrib.get("viewBox"))
        self.assertEqual([f"{ns}rect", f"{ns}path"], [child.tag for child in root])
        rect, path = root
        self.assertEqual({"width": "32", "height": "32", "fill": "#111111"}, rect.attrib)
        self.assertEqual("#FFFFFF", path.attrib.get("fill"))
        touch = (self.site / "apple-touch-icon.png").read_bytes()
        self.assertEqual(b"\x89PNG\r\n\x1a\n", touch[:8])
        self.assertEqual((180, 180), struct.unpack_from(">II", touch, 16))

    def test_ico_fallback_contains_16_and_32_pixel_png_frames(self) -> None:
        ico = self.site / "favicon.ico"
        self.assertTrue(ico.is_file())
        data = ico.read_bytes()
        self.assertEqual((0, 1, 2), struct.unpack_from("<HHH", data))


class LookContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.styles = (ROOT / "static/styles.css").read_text()
        cls.home_html = (built_site() / "index.html").read_text()

    def test_page_is_pure_light_monochrome(self) -> None:
        self.assertIn("color-scheme: only light", self.styles)
        self.assertNotIn("prefers-color-scheme", self.styles)
        self.assertIn("--bg: #ffffff;", self.styles)
        self.assertIn("--ink: #111111;", self.styles)
        self.assertIn('<meta name="theme-color" content="#ffffff" />', self.home_html)
        self.assertNotIn("localStorage", self.home_html)


if __name__ == "__main__":
    unittest.main()
