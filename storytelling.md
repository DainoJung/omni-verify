> **수정 (11:4x):** 아침 Kane 결과의 "무료 체험이 안 보인다"는 첫 화면만 본 결과였다. 사이트 아래쪽 가격 섹션에 "Try Pro free for 7 days"가 있다. 체험 이야기는 쓰지 말고, 아래 **추적 태그 유실**을 메인 발견으로 쓴다.

# Omni Verify: 스토리텔링

## 한 줄
**"Agents can write the promise. Kane checks whether the funnel keeps it."**
(에이전트는 약속을 쓸 수 있다. 퍼널이 그 약속을 지키는지는 Kane이 확인한다.)

## 이야기 뼈대 (사람 → 문제 → 발견 → 해결 → 확장)

| 막 | 내용 | 근거 |
|---|---|---|
| 1. 나 | 솔로 창업자. Scribo를 만들었고 실제 유료 유저가 있다. 앱 만드는 건 쉬웠는데 배포(distribution)가 어려웠다. 그래서 성장 에이전트 Omni를 만들고 있다 | 10/13, 10/21 X 게시물 그대로 |
| 2. 문제 | 성장 에이전트는 클릭을 위해 쓴다. "Try it free" 같은 약속은 클릭은 잘 받는다. 그런데 퍼널이 그 약속을 보여주지 못하면 유저는 미끼라고 느끼고, 환불과 1점 리뷰가 온다. 사람 마케터는 링크를 직접 눌러보지만 에이전트는 안 누른다 | |
| 3. 발견 | 내 사이트의 App Store 버튼은 추적 태그가 고정(ct=site-en-hero)이라, Threads 게시물에서 온 유입 태그가 버튼에서 사라진다. 에이전트가 "Threads 게시물이 효과 있었다"를 판단할 근거가 조용히 깨져 있었다 | 사이트 HTML/JS 확인, Kane으로 재확인 예정 |
| 4. 해결 | Omni Verify: 에이전트가 쓴 문구의 모든 약속을 단정문으로 바꾸고, Kane이 실제 브라우저로 퍼널을 걷고, 실패하면 에이전트가 고치고, 통과해야만 나간다 | 라이브 데모 |
| 5. 확장 | 모든 성장 에이전트는 출시 게이트가 필요하다. 다음은 iOS 시뮬레이터에서 페이월까지, 그리고 Omni 안의 기본 단계로 | |

**주의 (정직하게)**
- "Scribo가 거짓말을 했다"가 아니다. 정확한 표현은 **"설치 전 퍼널이 증명할 수 없는 약속"**이다. 체험이 앱 안에 있어도 링크를 누른 사람은 그걸 확인할 수 없다.
- 유료 유저 숫자는 RevenueCat에서 오늘 숫자를 확인하고 말하기. 확인 안 했으면 "paying users"까지만.
- Kane PASS는 "퍼널이 약속을 지킨다"는 뜻이지 "다운로드가 늘었다"는 뜻이 아니다. 질문 오면 그렇게 답하기.

---

## A. 테이블 심사 (16:00~17:00, 약 2분 + 직접 써보기)

| 시간 | 말 | 화면 |
|---|---|---|
| 0:00 | "I'm a solo founder. Building my app was easy. Getting users wasn't, so I'm building a growth agent." | 앱 첫 화면 |
| 0:15 | "But growth agents write for clicks. A line like 'try it free' gets clicks. If the funnel can't show that promise, users feel baited." | |
| 0:30 | "This morning I pointed Kane at my own app's site. The free trial isn't visible anywhere before install. My agent would have shipped a promise my funnel can't keep." | 아침 실행 증거 |
| 0:45 | "So here's Omni Verify. Want to type in a goal?" | **심사위원이 직접 입력** |
| 0:50~1:50 | (진행 따라 짧게) "The agent turns every claim into an assertion. ... Kane is walking the real funnel. ... FAIL, the trial text isn't there. ... The agent read Kane's result and rewrote the copy. ... PASS. Verified for launch." | 타임라인 |
| 1:50 | "Every verified campaign becomes a Kane test, so it gets re-checked before every repost." | `_test.md`, Re-verify |
| 2:00 | "Agents can write the promise. Kane checks whether the funnel keeps it." | |

한국어 (연습용)
- "솔로 창업자예요. 앱 만드는 건 쉬웠는데 유저 모으는 게 어려워서 성장 에이전트를 만들고 있어요."
- "그런데 성장 에이전트는 클릭을 위해 써요. '무료로 써보세요'는 클릭을 받죠. 퍼널이 그 약속을 못 보여주면 유저는 미끼라고 느껴요."
- "오늘 아침 Kane을 제 앱 사이트에 돌렸어요. 무료 체험이 설치 전엔 어디에도 안 보여요. 제 에이전트가 퍼널이 못 지키는 약속을 내보낼 뻔한 거예요."
- "그래서 Omni Verify예요. 목표 한번 입력해보실래요?"
- "에이전트가 모든 약속을 단정문으로 바꿔요. Kane이 실제 퍼널을 걸어요. 실패, 체험 문구가 없어요. 에이전트가 Kane 결과를 읽고 문구를 고쳤어요. 통과. 출시 검증 완료."
- "검증된 캠페인은 Kane 테스트가 돼서, 다시 올릴 때마다 재검증돼요."
- "에이전트는 약속을 쓸 수 있어요. 퍼널이 그걸 지키는지는 Kane이 확인해요."

**Kane 실행이 40초 넘게 걸린다.** 기다리는 동안 할 말:
"It's a real Chrome session, not a mock. It clicks what a user would click."
(목업이 아니라 실제 크롬이에요. 유저가 누를 걸 그대로 눌러요.)
백업: 직전에 돌린 성공 실행 기록을 탭에 열어두기.

---

## B. 데모 영상 (2~4분, 보이스오버 필수, GTM 7점)
규칙: **Kane 실행 리포트로 시작**, 실제 흐름 하나, Kane이 잡은 것을 말하기.

| 시간 | 장면 | 보이스오버 |
|---|---|---|
| 0:00~0:20 | Kane 실행 리포트 (FAIL 화면) | "This is Kane catching my growth agent about to ship a promise my funnel can't keep." |
| 0:20~0:50 | 내 X 게시물, Scribo | "I'm Dain, a solo founder. Building is easy now. Distribution isn't, so I'm building Omni, a growth agent. But agents write for clicks, and nobody clicks the link to check." |
| 0:50~2:30 | 라이브 흐름 전체 | 초안 → 단정문 → Kane FAIL → 수리 diff → Kane PASS → Verified |
| 2:30~3:00 | `_test.md`, 커밋 기록 | "Every verified campaign becomes a regression test. And you can see in the commits where Kane changed what the agent did." |
| 3:00~3:20 | 마무리 | "Agents can write the promise. Kane checks whether the funnel keeps it. Next, the same gate on the iOS paywall, inside Omni." |

---

## C. 무대 (상위 7팀, 18:00~19:00)
A와 같은 구조로 하되 심사위원 입력 대신 내가 입력한다. 시작을 더 세게:
"Yesterday's growth agent writes 'try it free.' Today, Kane clicks the link."

---

## D. GTM 게시물 각도 (`$hack-gtm` 초안에 이 각도를 주기)
- X / LinkedIn: "I pointed a testing agent at my own app's funnel and it caught my growth agent about to make a promise I couldn't keep." + FAIL→PASS 스크린샷
- 블로그: "Growth agents need a launch gate" (문제, 아침의 발견, 구조, 증거 팩)
- Show HN: "Show HN: Omni Verify – a launch gate that makes AI-written marketing pass a real browser test"
- 이전 X 게시물("10+ AI projects, $0 revenue")과 연결하면 이야기가 이어진다.
