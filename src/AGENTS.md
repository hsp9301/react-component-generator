# Frontend Agent Rules

## Module Context

`src/`는 React UI와 생성 결과 상태를 관리하며, `/api/config`와 `/api/generate`를 호출한다. 생성된 코드는 `react-live`의 `noInline` 미리보기와 코드 보기로 소비된다.

## Tech Stack & Constraints

- React 19, TypeScript, Vite, `react-live`를 사용한다.
- 생성 결과 상태는 `useComponentGenerator`가 소유하며 생성·삭제·전체 삭제·로딩·오류 상태를 함께 관리한다. 근거: `src/hooks/useComponentGenerator.ts:13-60`.
- 미리보기는 `LiveProvider`에 `noInline`을 유지하고 `LivePreview`와 `LiveError`를 함께 렌더링한다. 근거: `src/components/LivePreview.tsx:7-19`.
- API 키는 비밀번호 입력으로 관리하며 공급자 변경 시 입력값을 지운다. 근거: `src/App.tsx:41-44`, `src/App.tsx:93-118`.

## Implementation Patterns

- API 호출은 `useComponentGenerator.generate`에서 `fetch('/api/generate')`로 수행하고, 실패 시 서버의 `data.error`를 UI 오류 상태로 전달한다. 근거: `src/hooks/useComponentGenerator.ts:18-49`.
- 생성 성공 시 새 결과를 배열 앞에 추가하고, 안정적인 표시를 위해 `id`, 원본 prompt, code, createdAt을 함께 저장한다. 근거: `src/hooks/useComponentGenerator.ts:35-42`.
- 프롬프트 제출은 공백 입력과 loading 상태를 차단하고, Ctrl/Cmd+Enter를 지원한다. 이 동작을 바꾸면 입력 컴포넌트 테스트를 갱신한다. 근거: `src/components/PromptInput.tsx:20-25`, `src/components/PromptInput.tsx:44-47`.
- 코드 복사는 브라우저 `navigator.clipboard`를 사용하고 2초 후 상태를 되돌린다. 근거: `src/components/CodeView.tsx:10-14`.

## Testing Strategy

- 프런트엔드 테스트: `bun run test -- src`
- 프롬프트 입력의 빈 값 비활성화, 제출 콜백, 로딩 중 비활성화를 회귀 기준으로 유지한다. 근거: `src/components/PromptInput.test.tsx:6-28`.
- 상태 훅이나 API 응답 처리를 변경하면 성공·실패·로딩 종료 상태를 검증하는 테스트를 추가한다. 현재 훅은 `try/catch/finally`로 오류와 로딩 종료를 처리한다. 근거: `src/hooks/useComponentGenerator.ts:22-49`.

## Local Golden Rules

- Do: `LiveProvider`의 `noInline`과 서버의 `render(...)` 보정 계약을 함께 유지한다. Don't: 둘 중 하나만 바꿔 생성 결과 미리보기 계약을 깨뜨린다. 근거: `src/components/LivePreview.tsx:14-18`, `server/generator.ts:12-23`.
- Do: API 키를 요청에 필요한 경우에만 전달하고 React 상태·로그·localStorage에 영속화하지 않는다. 근거: `src/hooks/useComponentGenerator.ts:23-27`, `src/App.tsx:14-16`.
- Do: provider 변경 시 이전 키를 초기화하고 현재 provider의 환경변수 상태를 사용한다. Don't: provider 간 키를 재사용한다. 근거: `src/App.tsx:16-20`, `src/App.tsx:31-44`.
- Do: 생성 결과를 삭제할 때 상태 배열을 불변 방식으로 갱신한다. 근거: `src/hooks/useComponentGenerator.ts:51-57`.
