# Kane CLI Hack Day: 타임라인 + 현재 상태 (10/24)

## 결정 사항
- 행사: Kane CLI Hack Day (Frontier Tower, 995 Market). Agent Builders는 가지 않음
- 팀: **Omni** (솔로, 캡틴 Dain, 잠금 완료). 아이디어 저장 완료
- 제품: **Omni Verify**: AI 성장 캠페인을 내보내기 전에 Kane이 실제 퍼널을 검증하는 출시 게이트
- 트랙: Web App
- 실제 사례: scribo.cc의 App Store 버튼이 `ct=site-en-hero`로 고정돼 있어서, 게시물의 캠페인 태그가 CTA에서 사라짐 (Kane이 실제로 FAIL로 잡음)
- 쓰지 않을 이야기: "무료 체험이 안 보인다" (틀림. 가격 섹션에 7일 무료 체험이 있음)
- 빌드는 Claude Code, 행사 진행은 Codex(`$hack-os`), 제품 두뇌는 OpenAI API
- 폴더: `~/Desktop/hackathon/kane-hackday` (공개 저장소 예정, `.env`는 gitignore)

## 타임라인
| 시간 | 할 일 | 상태 |
|---|---|---|
| 11:00 | 팀 잠금 | ✅ |
| 12:00 | 아이디어 저장 | ✅ |
| ~13:00 | 2단계: Kane 실행 래퍼 + 파서 + 서버에서 실제 실행 (FAIL 확인) | ✅ |
| ~13:45 | 3단계: OpenAI 초안 + 단정문을 Kane 지시로 변환 | ⏳ OpenAI 키 넣는 중 |
| ~14:00 | 4단계: 수리 루프. 실제 FAIL → 수리 → PASS 한 번 | |
| 14:00 | 중간 평가 (피드백만) | |
| 14:00~15:00 | Assurance loop (ingest → design → testmd run → cover), explore 실행, 화면(SSE 타임라인) | |
| 15:00~15:30 | `_test.md` 재실행 버튼, README, RUNS.md 정리 | |
| **15:30** | **기능 동결**, 리허설 2~3회 | |
| **16:00~17:00** | **테이블 심사 (점수)**. 심사위원에게 직접 입력 시키기 | |
| 17:00~18:00 | GTM: 영상(7) 덱(4) 블로그(4) LinkedIn(3) X(3) HN(2) 반응(2). `$hack-gtm`으로 초안 | |
| **18:00** | **제출 마감** (`$hack-os ready to submit` → 캡틴이 Submit 탭에서 확정) | |
| 18:00~19:00 | 상위 7팀 무대 | |
| 19:30 | 시상 | |

## 제출 필수 조건 (하나라도 빠지면 입상 불가)
1. 오늘 작성한 코드 + **공개 저장소**
2. OpenAI 사용
3. **Kane CLI 증거 팩(evidence pack) 첨부**

## 리스크
| 리스크 | 대응 |
|---|---|
| kanehack 기록기가 통과한 실행을 ERRORED로 기록 (KR-5, KR-6) | 티켓 H-0007 접수. 스태프에게 직접 확인. RUNS.md + 증거 팩 + LambdaTest 링크로 직접 증명. assurance 실행(`testmd run`)은 정상 기록되는지 테스트 |
| Kane 실행 40~55초 | 기다리는 동안 할 말 준비, 직전 성공 기록 탭에 열어두기 |
| ct가 App Store에서 URL에서 사라짐 | 클릭 전 CTA href를 읽는 방식으로 해결함 |

## 파일
- `CLAUDE_BUILD_PROMPT.md`: Claude Code 빌드 지시
- `storytelling.md`: 스토리, 테이블 대본, 영상 구성, GTM 각도
- `RUNS.md`: Kane 실제 실행 기록 (Claude Code가 자동 추가)
