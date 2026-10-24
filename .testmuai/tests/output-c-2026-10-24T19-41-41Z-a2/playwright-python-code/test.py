import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="a50bc02e-0c51-4c2e-8eb6-fbc25ce0859b",
    name="Verify Page Content and Extract App Store Details",
    tc_id="TC-37",
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
    async with testmu.step('Navigate to https://scribo.cc', instruction_id='6959ede4-bd76-4229-a83d-0d6c27f6e40a'):
        await page.goto("https://scribo.cc")
    
    async with testmu.step('Reading whether the introductory paragraph contains the specified text'):
        set_var('claim_1', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {15: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(15).textContent.includes('videos, articles and PDFs'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Learn a language from the"i'], query='whether the text "videos, articles and PDFs" appears in the introductory paragraph', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the text "videos, articles and PDFs" appears anywhere on the page is stored as {{claim_1}}.'))
    
    async with testmu.step('Reading whether the content description contains the specified text'):
        set_var('claim_2', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {23: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(23).textContent.includes('in sections you can finish'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Paste a link to an article or"i'], query='whether the text "in sections you can finish" appears in the content description paragraph', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the text "in sections you can finish" appears anywhere on the page is stored as {{claim_2}}.'))
    
    async with testmu.step('Navigate to https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8', instruction_id='f203d1b2-6ce7-4bc2-89c4-6a447fa2310b'):
        await page.goto("https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=threads-oct24&mt=8")
    
    async with testmu.step('Waiting 1000 ms for the App Store product page to finish loading', instruction_id='8b513995-f3ef-4301-86a5-87857b3c3e06'):
        await page.wait_for_timeout(1000)
    
    async with testmu.step('Saving the current page URL', instruction_id='7c397db3-5e8b-4e71-8602-5ffcbb7dea57'):
        set_var('landing_url', page.url)
    
    async with testmu.step('Reading the app name from the product heading'):
        set_var('app_name', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {45: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(45).textContent.trim());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:role=heading[name="Scribo: AI Language Learning"i]'], query='the app name in the product heading', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='the app name shown on the page is saved as {{app_name}}'))


if __name__ == "__main__":
    testmu.run(test)