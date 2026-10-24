import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="a301dc97-8ada-4000-b0c5-d0bdfb7d7fe8",
    name="Verify Content Claims and Capture App Store Details",
    tc_id="TC-35",
    network=os.getenv("NETWORK", "false").lower() == "true",
    variables={"claim_1": "true", "claim_2": "true", "landing_url": "https://apps.apple.com/us/app/scribo-ai-language-learning/id6794793715", "app_name": "Scribo: AI Language Learning"},
    global_variables=[{"id": 464671, "name": "threads_post_url", "value": "http://localhost:3000/post/c-2026-10-24T18-55-01Z", "session_value": "http://localhost:3000/post/c-2026-10-24T18-55-01Z", "is_persist": False, "environment_id": 0, "environment_name": "No Env"}],
    auto_heal_version="AH2",
    default_action_timeout_ms=60000,
    default_navigation_timeout_ms=60000,
    kane_run_v4=True,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Navigate to https://scribo.cc', instruction_id='e712a62e-38f2-4dae-ba19-55747925bd9b'):
        await page.goto("https://scribo.cc")
    
    async with testmu.step('Checking for the videos, articles and PDFs text'):
        set_var('claim_1', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {15: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(15).textContent.includes('videos, articles and PDFs'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Learn a language from the"i'], query='whether the text "videos, articles and PDFs" appears in the hero paragraph', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the text "videos, articles and PDFs" appears anywhere on the page is stored as {{claim_1}}.'))
    
    async with testmu.step('Checking for the learner rewrite text'):
        set_var('claim_2', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {15: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(15).textContent.includes('rewrites them for the learner you are today'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Learn a language from the"i'], query='whether the text "rewrites them for the learner you are today" appears in the hero paragraph', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the text "rewrites them for the learner you are today" appears anywhere on the page is stored as {{claim_2}}.'))
    
    async with testmu.step('Navigate to https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8', instruction_id='a20b67e6-ad73-4260-a5d9-e2434d50b2e7'):
        await page.goto("https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8")
    
    async with testmu.step('Waiting for the App Store product page to finish loading', instruction_id='bf63e130-0b32-4339-8e9b-aaaa8e28d432'):
        await page.wait_for_timeout(1000)
    
    async with testmu.step('Saving the current page URL', instruction_id='dd96c9a1-c9ac-42f6-afab-a880ee7ea751'):
        set_var('landing_url', page.url)
    
    async with testmu.step('Reading the app name from the page heading'):
        set_var('app_name', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {45: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(45).textContent.trim());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:role=heading[name="Scribo: AI Language Learning"i]'], query='the app name shown in the page heading', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The app name shown on the page is saved as {{app_name}}.'))


if __name__ == "__main__":
    testmu.run(test)