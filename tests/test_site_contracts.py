from html.parser import HTMLParser
from pathlib import Path
from collections import Counter
from html import unescape
import json
import re
import struct
import subprocess
import tempfile
import tomllib
import unittest
from xml.etree import ElementTree
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
_BUILD_DIRECTORY = None
_BUILT_SITE = None
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
KINDS = {"build", "test", "run"}


def month_stamp(date: str) -> int | None:
    """Months since year 0 for a date written like "Sep 2026", else None."""
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
        if tag == "time":
            self.years.append(values["datetime"])
        if tag == "img":
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

    def test_introduction_is_plain_and_first_person(self) -> None:
        basics = self.resume["basics"]
        self.assertEqual("I'm Ben, a software engineer", basics.get("hero_title"))
        self.assertEqual("in Sydney.", basics.get("hero_accent"))
        self.assertIn("**Octet**", basics["hero_intro"])
        self.assertTrue(basics.get("contact_note"))
        self.assertIn("Full-stack engineer", basics["summary"])


    def test_current_role_leads_the_experience_list(self) -> None:
        current = self.resume["experience"][0]
        self.assertEqual("Present", current["end_date"])
        self.assertEqual(3, len(self.resume.get("now", [])))

    def test_every_role_has_dates_the_timeline_can_draw(self) -> None:
        # trace.js reads "Sep 2026" or "Present"; anything else puts a bar in the wrong place.
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

    def test_every_role_says_what_kind_of_work_it_was(self) -> None:
        # The bar colours: software engineering, test automation, site reliability.
        for item in self.resume["experience"]:
            self.assertIn(item.get("kind"), KINDS, item["role"])

    def test_clock_has_a_real_time_zone(self) -> None:
        ZoneInfo(self.resume["basics"]["timezone"])


class BuiltSiteContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        site = built_site()
        cls.home_html = (site / "index.html").read_text()
        cls.print_html = (site / "resume/print/index.html").read_text()
        cls.home = Document(cls.home_html)
        cls.print_document = Document(cls.print_html)

    def test_homepage_contains_every_section(self) -> None:
        self.assertTrue(
            {
                "career",
                "projects",
                "toolkit",
                "background",
                "contact",
            }
            <= self.home.ids
        )

    def test_homepage_contains_identity_and_introduction(self) -> None:
        self.assertIn("Ben Paternostro", self.home.text)
        self.assertIn("I'm Ben, a software engineer", self.home.text)
        self.assertIn("<strong>Octet</strong>", self.home_html)
        self.assertIn("test automation and site reliability", self.home.text)
        self.assertNotIn("**", self.home_html)


    def test_first_screen_offers_email_resume_and_profile_links(self) -> None:
        self.assertIn("mailto:contact@benpaternostro.com", self.home.links)
        self.assertIn("https://benpaternostro.com/resume/print/", self.home.links)
        self.assertIn("https://www.linkedin.com/in/benpaternostro", self.home.links)

    def test_navigation_links_to_primary_sections(self) -> None:
        self.assertTrue(
            {"#career", "#projects", "#contact"}
            <= set(self.home.links)
        )

    def test_copy_avoids_em_dashes(self) -> None:
        self.assertNotIn("\u2014", self.home_html)
        self.assertNotIn("&mdash;", self.home_html)

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

    def test_career_summaries_are_escaped_once(self) -> None:
        self.assertIn("hardware/software integration", self.home.text)
        self.assertIn("CI/CD-based quality gates", self.home.text)
        self.assertNotIn("&#x2F;", self.home.text)

    def test_career_keeps_every_role_once_and_in_chronological_groups(self) -> None:
        with (ROOT / "data/resume.toml").open("rb") as source:
            resume = tomllib.load(source)
        expected = Counter(item["role"] for item in resume["experience"])
        labels = [unescape(label) for label in re.findall(
            r'<(?:small class="career-role"|h4)>([^<]+)</', self.home_html
        )]
        self.assertEqual(expected, Counter(label for label in labels if label in expected))
        self.assertEqual(["2026", "2025", "2024", "2023", "2020", "2019", "2016"], self.home.years)
        self.assertEqual(7, self.home_html.count("<details>"))
        for item in resume["experience"]:
            self.assertIn(item["start_date"], self.home.text)
            self.assertIn(item["end_date"], self.home.text)

    def test_career_rows_carry_what_the_timeline_draws(self) -> None:
        with (ROOT / "data/resume.toml").open("rb") as source:
            resume = tomllib.load(source)
        drawn = re.findall(
            r'<div class="role" data-start="([^"]+)" data-end="([^"]+)" data-kind="([^"]+)">',
            self.home_html,
        )
        self.assertEqual(
            [(item["start_date"], item["end_date"], item["kind"]) for item in resume["experience"]],
            drawn,
        )
        # The key above the bars names only the kinds of work that appear.
        legend = re.search(r'<ul class="legend" aria-hidden="true">(.*?)</ul>', self.home_html, re.DOTALL)
        self.assertIsNotNone(legend)
        self.assertEqual(
            {kind for _, _, kind in drawn},
            set(re.findall(r'<li data-kind="([^"]+)">', legend.group(1))),
        )

    def test_effects_script_is_shipped_and_loaded_once_without_blocking(self) -> None:
        script = built_site() / "trace.js"
        self.assertTrue(script.is_file(), "trace.js is not in the built site")
        tags = re.findall(r"<script[^>]*\bsrc=[^>]*>", self.home_html)
        self.assertEqual(1, len(tags), tags)
        self.assertRegex(tags[0], r'src="https://benpaternostro\.com/trace\.js\?h=[0-9a-f]+" defer>')
        # Nothing is fetched from another site, and the print résumé needs no script at all.
        self.assertNotIn("<script", self.print_html)
        self.assertNotRegex(script.read_text(), r"https?://")

    def test_page_is_complete_before_the_script_runs(self) -> None:
        # The script only adds to the page: the bars, the lines and the clock are not in the HTML.
        self.assertNotIn("<canvas", self.home_html)
        self.assertNotIn('class="track"', self.home_html)
        clock = re.search(r'<span class="clock"[^>]*>(.*?)</span>', self.home_html, re.DOTALL)
        self.assertIsNotNone(clock)
        self.assertEqual("", clock.group(1).strip())
        tag = unescape(clock.group(0))
        self.assertIn('data-zone="Australia/Sydney"', tag)
        self.assertIn('data-place="Sydney"', tag)
        self.assertIn('aria-hidden="true"', tag)

    def test_project_cover_is_published_without_prototype_dependencies(self) -> None:
        self.assertTrue(self.home.images)
        for url in self.home.images:
            self.assertNotIn("prototypes", url)
            asset = built_site() / urlsplit(url).path.lstrip("/")
            self.assertTrue(asset.is_file())
            self.assertEqual(".webp", asset.suffix)
            self.assertLess(asset.stat().st_size, 100_000)
        self.assertFalse((built_site() / "prototypes").exists())

    def test_print_resume_keeps_every_role(self) -> None:
        with (ROOT / "data/resume.toml").open("rb") as source:
            resume = tomllib.load(source)
        for item in resume["experience"]:
            self.assertIn(item["role"], self.print_document.text)


class FontDeliveryContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.site = built_site()
        cls.home_html = (cls.site / "index.html").read_text()
        cls.print_html = (cls.site / "resume/print/index.html").read_text()
        cls.styles = (cls.site / "styles.css").read_text()

    def assert_font_is_shipped_and_preloaded(self, name: str, limit: int) -> None:
        asset = self.site / "fonts" / name
        self.assertTrue(asset.is_file(), f"{name} is not in the built site")
        self.assertEqual(b"wOF2", asset.read_bytes()[:4])
        self.assertLess(asset.stat().st_size, limit)
        self.assertIn(
            f'rel="preload" href="https://benpaternostro.com/fonts/{name}" as="font"',
            " ".join(self.home_html.split()),
        )
        self.assertIn(f'url("/fonts/{name}")', self.styles)

    def test_heading_font_is_shipped_as_woff2_and_preloaded(self) -> None:
        # Bricolage Grotesque with its width axis: the headings are set narrow.
        self.assert_font_is_shipped_and_preloaded("bricolage-grotesque-var.woff2", 160_000)
        self.assertIn("font-stretch: 75% 100%", self.styles)

    def test_text_font_is_shipped_as_woff2_and_preloaded(self) -> None:
        self.assert_font_is_shipped_and_preloaded("libre-franklin-var.woff2", 40_000)

    def test_every_shipped_font_is_used_and_carries_its_licence(self) -> None:
        fonts = self.site / "fonts"
        self.assertFalse(list(fonts.glob("*.ttf")))
        pages = self.home_html + self.print_html + self.styles
        shipped = sorted(font.name for font in fonts.glob("*.woff2"))
        self.assertEqual([name for name in shipped if f"fonts/{name}" in pages], shipped)
        for name in re.findall(r'url\("/fonts/([^"]+)"\)', self.styles):
            self.assertTrue((fonts / name).is_file(), f"styles.css names {name}")
        self.assertTrue((fonts / "bricolage-grotesque-LICENSE.txt").is_file())
        self.assertTrue((fonts / "libre-franklin-LICENSE.txt").is_file())


class FaviconDeliveryContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.site = built_site()
        cls.home_html = (cls.site / "index.html").read_text()

    def test_ico_fallback_precedes_the_scalable_svg_favicon(self) -> None:
        ico_reference = (
            'rel="icon" href="https://benpaternostro.com/favicon.ico" '
            'sizes="16x16 32x32"'
        )
        svg_reference = (
            'rel="icon" type="image/svg+xml" '
            'href="https://benpaternostro.com/favicon.svg" sizes="any"'
        )
        self.assertIn(svg_reference, self.home_html)
        self.assertIn(ico_reference, self.home_html)
        self.assertLess(
            self.home_html.index("favicon.ico"),
            self.home_html.index("favicon.svg"),
        )

    def test_svg_favicon_is_the_blue_square_with_the_paper_b(self) -> None:
        # Chosen 14 Nov 2026: the heading font's B, drawn as a path so no font is needed.
        svg = self.site / "favicon.svg"
        self.assertTrue(svg.is_file())
        root = ElementTree.parse(svg).getroot()
        namespace = "{http://www.w3.org/2000/svg}"
        self.assertEqual("0 0 32 32", root.attrib.get("viewBox"))
        self.assertEqual([f"{namespace}rect", f"{namespace}path"], [
            child.tag for child in root
        ])

        rect, path = root
        self.assertEqual(
            {"width": "32", "height": "32", "fill": "#20307A"},
            rect.attrib,
        )
        self.assertEqual("#F2EDE1", path.attrib.get("fill"))
        self.assertTrue(path.attrib.get("d", "").startswith("M10 26V6H"))

    def test_ico_fallback_contains_16_and_32_pixel_png_frames(self) -> None:
        ico = self.site / "favicon.ico"
        self.assertTrue(ico.is_file())
        data = ico.read_bytes()
        self.assertEqual((0, 1, 2), struct.unpack_from("<HHH", data))

        frames = set()
        for index in range(2):
            entry = struct.unpack_from("<BBBBHHII", data, 6 + index * 16)
            width, height, _, _, _, bits_per_pixel, size, offset = entry
            width = width or 256
            height = height or 256
            self.assertEqual(32, bits_per_pixel)
            self.assertLessEqual(offset + size, len(data))
            self.assertEqual(b"\x89PNG\r\n\x1a\n", data[offset : offset + 8])
            png_width, png_height = struct.unpack_from(">II", data, offset + 16)
            self.assertEqual((width, height), (png_width, png_height))
            frames.add((width, height))

        self.assertEqual({(16, 16), (32, 32)}, frames)


class ResponsiveStyleContracts(unittest.TestCase):
    def test_body_does_not_force_a_viewport_wider_than_320px(self) -> None:
        styles = (ROOT / "static/styles.css").read_text()
        self.assertNotIn("min-width: 20rem", styles)


class LookContracts(unittest.TestCase):
    """Two inks on paper: one light look, with nothing to switch and nothing saved."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.styles = (ROOT / "static/styles.css").read_text()
        cls.script = (ROOT / "static/trace.js").read_text()
        cls.home_html = (built_site() / "index.html").read_text()
        without_comments = re.sub(r"/\*.*?\*/", "", cls.styles, flags=re.DOTALL)
        root = re.search(r":root \{(.*?)\n\}", without_comments, re.DOTALL)
        cls.tokens = dict(re.findall(r"(--[a-z0-9-]+): ([^;]+);", root.group(1)))

    def test_page_is_light_only(self) -> None:
        self.assertIn("color-scheme: only light", self.styles)
        self.assertNotIn("prefers-color-scheme", self.styles)
        self.assertNotIn("theme-toggle", self.home_html)
        for page in (self.home_html, self.script):
            self.assertNotIn("localStorage", page)
        self.assertIn(
            f'<meta name="theme-color" content="{self.tokens["--bg"]}" />', self.home_html
        )

    def test_colours_the_script_draws_with_are_plain_hex(self) -> None:
        # trace.js turns these into canvas colours; it reads six hex digits and nothing else.
        for name in ("--bg", "--ridge", "--hot", "--build", "--test", "--run"):
            self.assertIn(f"'{name}'", self.script)
            self.assertRegex(self.tokens.get(name, ""), r"^#[0-9a-f]{6}$", name)
        for kind in KINDS:
            self.assertIn(f'[data-kind="{kind}"]', self.styles)

    def test_reduced_motion_is_respected_by_the_sheet_and_the_script(self) -> None:
        self.assertIn("@media (prefers-reduced-motion: reduce)", self.styles)
        self.assertIn("matchMedia('(prefers-reduced-motion: reduce)')", self.script)


if __name__ == "__main__":
    unittest.main()
