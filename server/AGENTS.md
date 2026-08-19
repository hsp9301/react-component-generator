# Server Agent Rules

## Module Context

`server/`는 Bun.serve로 API를 제공하고 Anthropic 또는 Google Gemini에 요청을 전달한다. AI 응답을 미리보기 실행 계약에 맞게 정규화하며, Google 모델 실패 시 순서대로 fallback한다.

## Tech Stack & Constraints

- Bun 런타임과 내장 `fetch`를 사용한다. 현재 공급자 호출은 SDK가 아니라 HTTP 요청으로 구현되어 있다.
- 공급자 환경변수는 `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`이며 실제 값은 서버 경계를 벗어나지 않아야 한다. 근거: `server/index.ts:59-65`.
- 생성 프롬프트가 요구하는 출력은 import 없는 JavaScript 컴포넌트이며, 응답은 `stripCodeFences`와 `ensureRenderCall`을 통과해야 한다. 근거: `server/index.ts:7-20`, `server/generator.ts:5-23`.
- Anthropic과 Google은 요청·응답 스키마가 다르므로 공통 함수로 합치지 말고 각 API 계약을 유지한다. 근거: `server/index.ts:68-132`.

## Implementation Patterns

- 새 API 분기는 `Bun.serve`의 `fetch` 핸들러에서 HTTP 메서드와 pathname을 함께 검사하고, JSON 응답에 `CORS_HEADERS`를 적용한다. 근거: `server/index.ts:138-157`, `server/index.ts:159-220`.
- 공급자 선택은 `Provider` 타입과 `callAnthropic`/`callGoogle` 분기를 통해 처리한다. 한 공급자 변경 시 다른 공급자 경로와 `/api/config`의 상태 응답을 함께 확인한다. 근거: `server/index.ts:57-66`, `server/index.ts:183-186`.
- Google 모델 목록의 순서가 fallback 우선순위다. 모든 시도가 실패하면 마지막 오류를 전달하는 현재 동작을 보존한다. 근거: `server/index.ts:5`, `server/fallback.ts:3-19`.

## Testing Strategy

- 서버 단위 테스트: `bun run test -- server`
- `stripCodeFences`, `ensureRenderCall`, `withModelFallback`의 입력 경계와 호출 횟수를 우선 검증한다. 근거: `server/generator.test.ts:4-40`, `server/fallback.test.ts:4-41`.
- API 핸들러를 변경하면 기존 단위 테스트만 통과하는 것으로 충분하다고 판단하지 말고, 키 누락·빈 prompt·공급자 오류·404 응답의 상태 코드와 응답 형식을 확인한다. 라우트의 현재 오류 분기 근거: `server/index.ts:167-217`.

## Local Golden Rules

- Do: `/api/config`에는 키의 boolean 존재 여부만 반환한다. Don't: 환경변수 원문을 반환하거나 오류 메시지에 키를 포함한다. 근거: `server/index.ts:147-156`, `server/index.ts:169-173`.
- Do: 모델 fallback의 순서와 마지막 오류 전달을 보존한다. Don't: 첫 실패에서 즉시 종료하거나 모든 오류를 무시한다. 근거: `server/fallback.ts:11-19`.
- Do: API 오류를 상태 코드에 맞춰 반환한다. 현재 `503`, `429`, 일반 `500`, `404`가 구분되어 있다. 근거: `server/index.ts:191-217`.
- Do: 응답 텍스트를 미리보기 전에 code fence를 제거하고 render 호출을 보정한다. Don't: 원시 모델 응답을 그대로 클라이언트에 전달한다. 근거: `server/index.ts:183-190`, `server/generator.ts:5-23`.
