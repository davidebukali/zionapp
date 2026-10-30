# Project Coding Standards & Guidelines

## 1. Database Safety
- **Never ever reset the database.**
- **Always use Laravel Boost to access the database.**

---

## 2. Component Architecture & Thin Screen Rule
- **Thin Screens & Containers:** Keep screen-level components (e.g. routes in `app/`) lean, readable, and declarative (ideally under 100–150 lines).
- **Modular Component Breakdown:** Decompose complex UIs into small, single-responsibility subcomponents located under feature-specific component directories (e.g. `components/Posts/Composer/`).
- **Custom Hooks for Business Logic:** Extract state management, multi-step async pipelines (file reading, hashing, storage uploads), and API mutations into dedicated custom hooks (e.g. `hooks/useCreatePostComposer.ts`), leaving UI components focused purely on presentation and event wiring.

---

## 3. Styling & Theme System (`assets/styles/theme.ts`)
- **Strict Theme Reuse:** Always reuse existing layout, typography, and button styles defined in `globalStyles` from `assets/styles/theme.ts`:
  - Containers: `globalStyles.screen`, `globalStyles.feedContainer`
  - Flex layouts: `globalStyles.row`, `globalStyles.postActionGroup`
  - Typography: `globalStyles.postBodyText`, `globalStyles.postActionText`, `globalStyles.commentsHeaderTitle`
  - Interactive elements: `globalStyles.postIconButton`, `globalStyles.primaryButton`, `globalStyles.primaryButtonText`
  - Shapes & Curvature: `globalStyles.postCard` (`borderRadius: 18`), `borderRadius: 12` for smaller inner tiles
- **Dynamic Palette:** Always use colors from `useTheme()` (`theme.colors.background`, `theme.colors.onBackground`, `theme.colors.primary`, `theme.colors.surfaceVariant`, `theme.colors.onSurfaceVariant`). Never hardcode hex values when a theme token exists.
- **Zero Redundant Stylesheets in Screen Files:** Page/screen components must not declare custom `StyleSheet.create` blocks for standard layout patterns.
- **Subcomponents:** Confine local `StyleSheet.create` strictly to unique, non-reusable structural geometry (such as custom grid flex splits or dynamic tile dimensions).

---

## 4. Feature Module Architecture (`features/<feature>/`)
- **Strict Separation of Concerns**:
  - **`types.ts` (Pure Declarations Only):** Must strictly contain TypeScript interfaces, types, and enums. Never place runtime functions, transformations, or executable logic in `types.ts`.
  - **`utils.ts` (Pure Functions & Helpers):** Houses data normalization/mapping (e.g. `normalizePost`), list deduplication helpers (e.g. `mergeUniquePosts`), and optimistic cache update logic (e.g. `updatePostInCaches`).
  - **`api.ts` (Declarative RTK Query Slices):** Must be lean and declarative, strictly defining endpoint queries, mutations, tag invalidations, and exported hooks.
- **Circular Dependency Prevention (Dependency Injection):**
  - Cache-update utilities must accept the RTK Query `api` slice as a parameter (`updatePostInCaches(api, dispatch, id, updater)`). Never allow `utils.ts` to import `api.ts` directly.
- **Dedicated Utility Test Coverage:**
  - Every utility module (`utils.ts`) must have a corresponding unit test file (`utils.test.ts`) covering data mappings, edge cases, and cache update/rollback behavior.

---

## 5. Workflow & Verification
- Always prioritize design alignment and requirement gathering before code execution ("ask questions, do not code").
- Verify all changes with `npx tsc --noEmit` to maintain strict TypeScript compliance.
- Run the full test suite (`npm test -- --watchAll=false`) after code changes to guarantee zero regressions.
