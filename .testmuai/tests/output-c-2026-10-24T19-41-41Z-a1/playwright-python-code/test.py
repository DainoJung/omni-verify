import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="4ea94758-bf47-43be-b219-3075e3cccbbf",
    name="Web || dainona0416 || TC-36",
    tc_id="TC-36",
    network=os.getenv("NETWORK", "false").lower() == "true",
    variables={"claim_1": "true", "claim_2": "true", "handoff_href": "https://apps.apple.com/app/apple-store/id6794793715?pt=126975132&ct=site-en-hero&mt=8", "landing_url": "https://apps.apple.com/us/app/scribo-ai-language-learning/id6794793715"},
    global_variables=[{"id": 464671, "name": "threads_post_url", "value": "http://localhost:3000/post/c-2026-10-24T18-55-01Z", "session_value": "http://localhost:3000/post/c-2026-10-24T18-55-01Z", "is_persist": False, "environment_id": 0, "environment_name": "No Env"}],
    auto_heal_version="AH2",
    default_action_timeout_ms=60000,
    default_navigation_timeout_ms=60000,
    kane_run_v4=True,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Navigate to https://scribo.cc?ct=threads-oct24', instruction_id='de6234e2-fbf3-4aca-958d-9cff2174f0bd'):
        await page.goto("https://scribo.cc?ct=threads-oct24")
    
    async with testmu.step('Checking for the specified text in the introductory paragraph'):
        set_var('claim_1', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {15: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(15).textContent.includes('videos, articles and PDFs'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Learn a language from the"i'], query='whether the text "videos, articles and PDFs" appears in the introductory paragraph', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='whether the text "videos, articles and PDFs" appears anywhere on the page is stored as {{claim_1}}'))
    
    async with testmu.step('Checking for the specified text in the content-description paragraph'):
        set_var('claim_2', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {23: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(23).textContent.includes('in sections you can finish'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Paste a link to an article or"i'], query='whether the text "in sections you can finish" appears in the content-description paragraph', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='whether the text "in sections you can finish" appears anywhere on the page is stored as {{claim_2}}'))
    
    async with testmu.step('Reading the main App Store call-to-action link'):
        set_var('handoff_href', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {16: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(16).getAttribute('href'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['section >> internal:has-text="Learn from anything.At your"i >> internal:label="Download Scribo on the App"i'], query='the full href attribute of the main App Store call to action', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='the full href attribute of the main call to action that sends the user to the App Store, exactly as written including its query string, is saved as {{handoff_href}}'))
    
    async with testmu.step('Clicking Download Scribo on the App Store', instruction_id='c65b54b7-b68a-48b8-bd35-63dc2b90e7d1'):
        _loc_1 = page.locator("section >> internal:has-text=\"Learn from anything.At your\"i >> internal:label=\"Download Scribo on the App\"i")
        
        await _loc_1.click()
    
    async with testmu.step('Waiting for the App Store product page to finish loading', instruction_id='84853ee5-fe0f-4b24-87ba-2e759dc17ec2'):
        await page.wait_for_timeout(1500)
    
    async with testmu.step('Saving the current page URL', instruction_id='1f8de205-c56f-480a-ab7e-aa1c442d872b'):
        set_var('landing_url', page.url)


if __name__ == "__main__":
    testmu.run(test)