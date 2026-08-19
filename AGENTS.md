# AGENTS.md

## Operational Commands

- 패키지 관리와 실행은 `bun`과 `bun.lock`을 사용한다. npm, yarn, pnpm으로 lockfile을 갱신하지 않는다.
- 의존성 설치: `bun install`
- 개발 서버(API와 Vite 동시 실행): `bun run dev`
- API 서버만 실행: `bun run server`
- 프로덕션 빌드: `bun run build`
- 린트: `bun run lint`
- 전체 테스트: `bun run test`
- 테스트 감시: `bun run test:watch`
- 빌드 결과 미리보기: `bun run preview`

## Golden Rules

### Immutable

- 서버 환경변수의 존재 여부만 `/api/config`로 반환한다. 실제 키 값이나 요청의 키를 로그, 응답, 클라이언트 상태에 저장하지 않는다. 근거: `server/index.ts:59-66`, `server/index.ts:147-156`.
- 생성 코드의 실행 계약을 유지한다. 생성 프롬프트는 단일 self-contained React 컴포넌트, inline style, import 금지, JavaScript 문법, `render(...)` 호출을 요구한다. 근거: `server/index.ts:7-20`.
- 생성 응답 정규화와 `render(...)` 보정은 제거하지 않는다. fenced code 제거와 렌더 호출 보정이 미리보기 실행의 경계다. 근거: `server/generator.ts:5-23`.

### Do's & Don'ts

- Do: Anthropic과 Google 경로를 함께 검토한다. 두 공급자는 요청 형식과 응답 형식이 다르며 선택 분기가 별도로 존재한다. 근거: `server/index.ts:68-132`, `server/index.ts:183-186`.
- Don't: 한 공급자에만 수정하고 다른 공급자 경로를 검증하지 않는다.
- Do: 모델 fallback 순서와 마지막 오류 전달 동작을 보존한다. 근거: `server/fallback.ts:3-19`, `server/index.ts:134-135`.
- Don't: 브라우저에 API 키를 기본값처럼 번들링하거나 `.env`를 커밋한다. 클라이언트는 키를 선택적으로 요청 본문에 전달하고 서버는 환경변수 또는 전달 키를 해석한다. 근거: `src/hooks/useComponentGenerator.ts:23-27`, `server/index.ts:59-65`.
- Do: 클라이언트와 서버의 API 키 유효성 검사를 모두 유지한다. 양쪽 검사는 서로 다른 경계의 방어다. 근거: `src/App.tsx:31-39`, `server/index.ts:167-180`.

### Test Boundary

- 생성 코드 정규화와 모델 fallback을 변경하면 `server/generator.test.ts`와 `server/fallback.test.ts`를 함께 수정하거나 실행한다.
- 프롬프트 입력의 제출·로딩 동작을 변경하면 `src/components/PromptInput.test.tsx`를 함께 수정하거나 실행한다.
- 테스트가 없는 서버 라우팅과 대부분의 UI 영역을 변경할 때는 영향 범위를 직접 확인하고 필요한 회귀 테스트를 추가한다. 현재 테스트 경계의 근거: `server/generator.test.ts`, `server/fallback.test.ts`, `src/components/PromptInput.test.tsx`.

## TDD Rule

> **이 규칙은 Rigid — 상황에 맞게 변형하지 마라.**

하위 디렉토리의 `AGENTS.md`에 TDD 규칙이 별도로 있으면 **하위 규칙을 우선**한다. 이 섹션은 별도 규칙이 없을 때 적용하는 **전역 기본값(fallback)**이다.

### 적용 기준

- **TDD 적용:** 비즈니스 로직, API, 유틸리티, 버그 수정.
- **TDD 불필요:** 타입 정의, 설정 파일, 순수 UI, SQL.

### RED-GREEN-REFACTOR

1. **RED:** **하나의 동작 = 하나의 테스트** 원칙으로 테스트를 하나 작성한다. 반드시 실행해 실패를 확인하며, 실패 이유는 **기능 미구현**이어야 한다.
2. **GREEN:** 테스트를 통과시키는 **최소한의 코드만** 작성한다. YAGNI를 지키고, 신규 테스트와 기존 테스트가 모두 통과하는지 확인한다.
3. **REFACTOR:** 중복 제거, 이름 개선, 헬퍼 추출만 수행한다. **green 상태를 유지**하고 새 동작은 추가하지 않는다.
4. **반복:** 다음 동작에 대해 다시 RED 단계로 돌아간다.

### 삭제 강제 규칙

테스트보다 먼저 프로덕션 코드를 작성했다면 **해당 코드를 삭제하고 RED부터 재시작**한다. **"참고용"으로 남기는 것도 금지**한다.

### 변명 차단표

| 변명 | 반론 |
|---|---|
| "너무 단순해서 테스트 불필요" | 단순한 동작도 회귀를 만들며, 테스트가 가장 빠른 실행 계약이다. |
| "나중에 추가하겠다" | 나중에는 구현 의도와 실패 시점이 사라진다. 지금 RED를 만든다. |
| "시간이 없다" | 테스트 없는 구현은 디버깅과 재작업으로 더 많은 시간을 쓴다. |
| "삭제하면 낭비" | 테스트 전 구현은 검증되지 않은 선입견이며, Rigid 규칙상 보존하지 않는다. |
| "프로토타입이다" | 프로토타입도 동작 경계를 만든다. 적용 대상이면 TDD를 시작한다. |

## Project Context

사용자 프롬프트와 선택한 AI 공급자를 바탕으로 React 컴포넌트를 생성하고, 결과를 즉시 미리보기와 코드 보기로 제공하는 애플리케이션이다.

Tech Stack: React 19, TypeScript, Vite, Bun, Vitest, Testing Library, react-live, Anthropic API, Google Gemini API.

## Standards & References

- 실행 방법과 제품 개요는 [README.md](./README.md)를 기준으로 한다. 이 파일에는 에이전트 전용 제약과 운영 규칙만 둔다.
- 새 커밋은 변경 목적에 맞춰 `feat|fix|refactor|chore: 한국어 요약` 형식을 사용한다.
- 커밋 전 변경사항을 분석하고, 제안한 커밋 범위와 메시지에 대해 사용자 승인을 받은 뒤 커밋한다.
- 규칙과 코드의 동작이 어긋나면 현재 코드 근거를 확인해 이 파일 또는 해당 하위 규칙의 업데이트를 제안한다.

## Context Map

- **[서버 API·AI 공급자 작업](./server/AGENTS.md)** — Bun 라우트, API 키 경계, 공급자 요청, 응답 정규화, fallback 수정 시.
- **[React UI·미리보기 작업](./src/AGENTS.md)** — 컴포넌트, 상태 훅, react-live 미리보기, 사용자 상호작용 수정 시.
