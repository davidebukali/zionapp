# Coding Standards & Architecture Guidelines

## 1. Database Safety
- Never ever reset the database.
- Always use Laravel Boost to access the database.

## 2. Component Architecture
- Keep screens and pages lean and declarative (< 150 lines).
- Decompose complex interfaces into modular subcomponents (e.g. `components/Posts/Composer/`).
- Extract state, upload/network pipelines, and business logic into dedicated custom hooks.

## 3. Styling & Theme System (`assets/styles/theme.ts`)
- Strictly reuse `globalStyles` (`screen`, `feedContainer`, `row`, `postIconButton`, `postActionGroup`, `postBodyText`, `primaryButton`, etc.).
- Strictly reuse `theme.colors` from `useTheme()`.
- Avoid creating custom `StyleSheet.create` blocks in screen files.
- Restrict subcomponent `StyleSheet.create` to pure structural geometry only.

## 4. Workflow
- Always align on plan and questions before coding when prompted.
- Validate all changes with `npx tsc --noEmit`.
