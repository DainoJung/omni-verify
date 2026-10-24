import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="b0d06a5d-a542-4937-bc55-e00df27fe70b",
    name="Verify Scribo Product Claims",
    tc_id="TC-54",
    network=os.getenv("NETWORK", "false").lower() == "true",
    variables={"claim_1": "false", "claim_5": "false", "claim_6": "false", "claim_2": "true", "claim_3": "true", "claim_4": "true", "quote_1": "Same account, same notebook.", "quote_2": "Free to download.", "quote_3": "Words you saved come back in your quiz just before you'd forget them.", "quote_4": "Words you saved come back in your quiz just before you'd forget them.", "quote_5": "On iPad, write your answers with Apple Pencil.", "quote_6": "Same account, same notebook."},
    global_variables=[{"id": 464671, "name": "threads_post_url", "value": "http://localhost:3000/post/c-2026-10-24T18-55-01Z", "session_value": "http://localhost:3000/post/c-2026-10-24T18-55-01Z", "is_persist": False, "environment_id": 0, "environment_name": "No Env"}],
    auto_heal_version="AH2",
    default_action_timeout_ms=60000,
    default_navigation_timeout_ms=60000,
    kane_run_v4=True,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Navigate to https://scribo.cc', instruction_id='7ff70039-0f64-49fe-b664-f832eab5b701'):
        await page.goto("https://scribo.cc")
    
    async with testmu.step('Whether the page says that Scribo is a vocabulary notebook where you save words by handwriting them is stored as claim_1.', instruction_id='e077f547-4677-46ff-a91f-e9cf2a0acbc6'):
        set_var('claim_1', await testmu.vision_query(page, "Whether the page says that Scribo is a vocabulary notebook where you save words by handwriting them is stored as claim_1.", ""))
    
    async with testmu.step('Whether the page says that Scribo lets you review words by writing them again by hand is stored as claim_5.', instruction_id='c441aa04-9536-4271-86df-445b0785b2f2'):
        set_var('claim_5', await testmu.vision_query(page, "Whether the page says that Scribo lets you review words by writing them again by hand is stored as claim_5.", ""))
    
    async with testmu.step('Whether the page says that Scribo is a handwritten vocabulary notebook is stored as claim_6.', instruction_id='8c41f7f4-67f9-4182-bd22-f4d70a08fc6d'):
        set_var('claim_6', await testmu.vision_query(page, "Whether the page says that Scribo is a handwritten vocabulary notebook is stored as claim_6.", ""))
    
    async with testmu.step('Whether the page says that Scribo has an iPhone version is stored as claim_2.', instruction_id='b67c27df-4399-4b9a-ab6c-b19e0ad1c40c'):
        set_var('claim_2', await testmu.vision_query(page, "Whether the page says that Scribo has an iPhone version is stored as claim_2.", ""))
    
    async with testmu.step('Reading whether Scribo has a review feature'):
        set_var('claim_3', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {51: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (/quiz/i.test(el(51).textContent));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Words you saved come back in"i'], query='whether Scribo has a review feature', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the page says that Scribo has a review feature is stored as claim_3.'))
    
    async with testmu.step('Reading whether Scribo resurfaces saved words for review'):
        set_var('claim_4', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {51: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (/Words you saved come back in your quiz just before you'd forget them\\./.test(el(51).textContent));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Words you saved come back in"i'], query='whether Scribo automatically surfaces saved words that have not been reviewed', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the page says that Scribo automatically surfaces saved words you have not reviewed is stored as claim_4.'))
    
    async with testmu.step('Extracting the sentence about Scribo as a notebook'):
        set_var('quote_1', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {181: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(181).textContent.trim().match(/Same account, same notebook\\./)?.[0] ?? null);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Select a word in any app and"i'], query='the sentence closest to Scribo being a vocabulary notebook where words are saved by handwriting', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether the page says that Scribo is a vocabulary notebook where you save words by handwriting them, copied exactly, or none, is stored as quote_1.'))
    
    async with testmu.step('Extracting the sentence about the iPhone version'):
        set_var('quote_2', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {179: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(179).textContent.trim().split(/(?<=[.!?])\\s+/)[0]);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Free to download. Sign in"i'], query='the sentence closest to Scribo having an iPhone version', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether the page says that Scribo has an iPhone version, copied exactly, or none, is stored as quote_2.'))
    
    async with testmu.step('Extracting the sentence about the review feature'):
        set_var('quote_3', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {51: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(51).textContent.trim());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Words you saved come back in"i'], query='the sentence closest to Scribo having a review feature', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether the page says that Scribo has a review feature, copied exactly, or none, is stored as quote_3.'))
    
    async with testmu.step('Extracting the sentence about resurfacing saved words'):
        set_var('quote_4', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {51: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(51).textContent.trim());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Words you saved come back in"i'], query='the sentence closest to Scribo automatically surfacing saved words that have not been reviewed', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether the page says that Scribo automatically surfaces saved words you have not reviewed, copied exactly, or none, is stored as quote_4.'))
    
    async with testmu.step('Extracting the sentence about handwriting answers'):
        set_var('quote_5', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {58: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(58).textContent.trim().match(/On iPad, write your answers with Apple Pencil\\./)?.[0] ?? null);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Step away halfway and it"i'], query='the sentence closest to reviewing words by writing them again by hand', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether the page says that Scribo lets you review words by writing them again by hand, copied exactly, or none, is stored as quote_5.'))
    
    async with testmu.step('Extracting the sentence about Scribo as a notebook'):
        set_var('quote_6', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {181: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(181).textContent.trim().match(/Same account, same notebook\\./)?.[0] ?? null);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="Select a word in any app and"i'], query='the sentence closest to Scribo being a handwritten vocabulary notebook', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether the page says that Scribo is a handwritten vocabulary notebook, copied exactly, or none, is stored as quote_6.'))


if __name__ == "__main__":
    testmu.run(test)