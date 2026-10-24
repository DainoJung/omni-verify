import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="7f03c266-c971-477c-98d3-212644f5ab5c",
    name="Evaluate Scribo Product Claims from Korean Page",
    tc_id="TC-53",
    network=os.getenv("NETWORK", "false").lower() == "true",
    variables={"claim_1": "false", "claim_4": "true", "claim_5": "false", "claim_6": "false", "quote_2": "\ubb34\ub8cc\ub85c \ubc1b\uc744 \uc218 \uc788\uc5b4\uc694.", "quote_3": "\uc800\uc7a5\ud55c \ub2e8\uc5b4\ub294 \uc78a\uc744 \ub54c\ucbe4 \ub2e4\uc2dc \ub098\uc640\uc694.", "quote_4": "\uc800\uc7a5\ud55c \ub2e8\uc5b4\ub294 \uc78a\uc744 \ub54c\ucbe4 \ub2e4\uc2dc \ub098\uc640\uc694.", "claim_2": "true", "claim_3": "true", "quote_1": "none", "quote_5": "none", "quote_6": "none"},
    global_variables=[{"id": 464671, "name": "threads_post_url", "value": "http://localhost:3000/post/c-2026-10-24T18-55-01Z", "session_value": "http://localhost:3000/post/c-2026-10-24T18-55-01Z", "is_persist": False, "environment_id": 0, "environment_name": "No Env"}],
    auto_heal_version="AH2",
    default_action_timeout_ms=60000,
    default_navigation_timeout_ms=60000,
    kane_run_v4=True,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Navigate to https://scribo.cc/ko/', instruction_id='7ef0b05e-5120-49eb-9694-3b1ad672a6b9'):
        await page.goto("https://scribo.cc/ko/")
    
    async with testmu.step('Reading the handwritten vocabulary-notebook claim'):
        set_var('claim_1', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {16: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(16).innerText.includes('손글씨') || el(16).innerText.includes('handwriting'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="보고 싶던 해외 영상, 기사, PDF"i'], query='whether Scribo is described as a vocabulary notebook for saving handwritten words', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the page says that Scribo is a vocabulary notebook where you save words by handwriting them is stored as {{claim_1}}.'))
    
    async with testmu.step('Reading the saved-word resurfacing claim'):
        set_var('claim_4', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {72: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(72).innerText.includes('저장한 단어는 잊을 때쯤 다시 나와요'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="저장한 단어는 잊을 때쯤 다시 나와요. 사이사이에 문장 짜기, 듣기, 내 생각을 묻는 질문이 돌아가며 섞여서 3분이면 끝나요"i'], query='whether Scribo is described as automatically resurfacing saved words that need review', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the page says that Scribo automatically surfaces saved words you have not reviewed is stored as {{claim_4}}.'))
    
    async with testmu.step('Reading the handwritten review claim'):
        set_var('claim_5', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {72: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(72).innerText.includes('손') || el(72).innerText.includes('쓰'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="저장한 단어는 잊을 때쯤 다시 나와요. 사이사이에 문장 짜기, 듣기, 내 생각을 묻는 질문이 돌아가며 섞여서 3분이면 끝나요"i'], query='whether Scribo is described as reviewing words by handwriting them again', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the page says that Scribo lets you review words by writing them again by hand is stored as {{claim_5}}.'))
    
    async with testmu.step('Reading the handwritten vocabulary-notebook description'):
        set_var('claim_6', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {199: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(199).innerText.includes('손글씨') || el(199).innerText.includes('handwritten'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="어느 앱에서든 단어를 고르고 ⌘C"i'], query='whether Scribo is described as a handwritten vocabulary notebook', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the page says that Scribo is a handwritten vocabulary notebook is stored as {{claim_6}}.'))
    
    async with testmu.step('Extracting the closest sentence for the iPhone-version claim'):
        set_var('quote_2', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {197: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(197).innerText.split(/(?<=[.!?])\\s*/)[0]);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="무료로 받을 수 있어요. Apple"i'], query='the sentence closest to Scribo having an iPhone version', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether Scribo has an iPhone version, copied exactly, or none, is stored as {{quote_2}}.'))
    
    async with testmu.step('Extracting the closest sentence for the review-feature claim'):
        set_var('quote_3', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {72: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(72).innerText.split(/(?<=[.!?])\\s*/)[0]);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="저장한 단어는 잊을 때쯤 다시 나와요. 사이사이에 문장 짜기, 듣기, 내 생각을 묻는 질문이 돌아가며 섞여서 3분이면 끝나요"i'], query='the sentence closest to Scribo having a review feature', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether Scribo has a review feature, copied exactly, or none, is stored as {{quote_3}}.'))
    
    async with testmu.step('Extracting the closest sentence for the saved-word resurfacing claim'):
        set_var('quote_4', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {72: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(72).innerText.split(/(?<=[.!?])\\s*/)[0]);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:text="저장한 단어는 잊을 때쯤 다시 나와요. 사이사이에 문장 짜기, 듣기, 내 생각을 묻는 질문이 돌아가며 섞여서 3분이면 끝나요"i'], query='the sentence closest to Scribo automatically resurfacing saved words that need review', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='The one sentence on the page closest to whether Scribo automatically surfaces saved words you have not reviewed, copied exactly, or none, is stored as {{quote_4}}.'))
    
    async with testmu.step('Whether the page says that Scribo has an iPhone version is stored as {{claim_2}}.', instruction_id='86ba1577-81dd-4ee6-b77c-4b5b615138df'):
        set_var('claim_2', await testmu.vision_query(page, "Whether the page says that Scribo has an iPhone version is stored as {{claim_2}}.", ""))
    
    async with testmu.step('Reading the review-feature claim'):
        set_var('claim_3', await testmu.textual_analyzer(page, wrapped_js="(els) => {\n  const __m = {71: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(71).innerText.includes('퀴즈'));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators=['internal:role=heading[name="하루 3분, 퀴즈"i]'], query='whether Scribo is described as having a review feature', expected_value='', needs_unit_conversion=False, operator='equals', transforms=['strip'], condition='Whether the page says that Scribo has a review feature is stored as {{claim_3}}.'))
    
    async with testmu.step('Storing the closest sentence for the handwritten vocabulary-notebook claim', instruction_id='4a3ba475-98e9-4508-9674-9be1e12ccf0e'):
        set_var('quote_1', "none")
    
    async with testmu.step('Storing the closest sentence for the handwritten review claim', instruction_id='4f3b133a-f60e-4d13-984f-becf4eb3af3c'):
        set_var('quote_5', "none")
    
    async with testmu.step('Storing the closest sentence for the handwritten vocabulary-notebook description', instruction_id='2ef8a95b-3678-470a-9388-02fb2ed89b23'):
        set_var('quote_6', "none")


if __name__ == "__main__":
    testmu.run(test)