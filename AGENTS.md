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

## 4. Workflow & Verification
- Always prioritize design alignment and requirement gathering before code execution ("ask questions, do not code").
- Verify all changes with `npx tsc --noEmit` to maintain strict TypeScript compliance.
