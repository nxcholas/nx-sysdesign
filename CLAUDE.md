## Project Overview
This repository is a modern web application built using Next.js and deployed on vercel.
The goal is to maintain a scalable, maintainable, and production-ready codebase with strong emphasis on performance, accessibility, and developer experience.
This project will be a visualizer for system design components that showcases web traffic, read/write requests, and, most importantly, the overall flow of data between each component.

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Animation: Motion / Framer Motion
- Deployment: Vercel

## Core Principles
- Prefer simplicity over complexity
- Prefer consistency over novelty
- Prefer server-side logic when possible
- Build reusable components instead of one-off implementations
- Optimize for performance and user experience
- Write code that is easy to read and maintain

---

### App Structure
- Use the Next.js App Router (`/app` directory)
- Use server components by default
- Use client components only when necessary (interactivity, browser APIs)

### Suggested Folder Structure
/app → routes, layouts, pages
/components
/ui → reusable UI primitives
/features → feature-specific components
/lib → utilities, helpers
/hooks → custom React hooks
/styles → global styles (if needed)


---

## Component Guidelines

- Keep components small and focused
- Prefer composition over large monolithic components
- Reuse components from `/components/ui` before creating new ones
- Avoid unnecessary prop drilling (use hooks or context when appropriate)

---

## Styling Rules (Tailwind)

- Use Tailwind utility classes
- Follow consistent spacing (4px / 8px scale)
- Prefer reusable class patterns
- Avoid inline styles unless necessary
- Maintain visual consistency across components

---

## UI/UX Standards

- Design mobile-first, then scale up
- Ensure responsive layouts across breakpoints
- Always include:
  - loading states
  - empty states
  - error states
  - success states
- Ensure clear visual hierarchy
- Avoid clutter and unnecessary UI elements

---

## Accessibility Requirements

- Use semantic HTML elements
- Ensure sufficient color contrast
- Provide focus states for interactive elements
- Avoid relying only on color to convey meaning
- Ensure keyboard navigability
- Use accessible labels where needed

---

## Data Fetching & State

- Prefer server-side data fetching when possible
- Use client-side state only when necessary
- Keep data logic separate from UI when possible
- Handle loading and error states explicitly
- Avoid unnecessary re-fetching

---

## API & Backend Rules

- Use Next.js route handlers (`/app/api`)
- Validate inputs when applicable
- Handle errors gracefully
- Do not expose sensitive data to the client
- Keep API logic clean and predictable

---

## Performance Guidelines
- Avoid unnecessary re-renders
- Lazy load heavy components when appropriate
- Optimize images using Next.js features
- Keep bundle size as small as possible

---

## Dependency Rules

- Do not add new dependencies unless necessary
- Prefer built-in or existing solutions first
- Any new dependency must have a clear justification

---

## Code Quality Rules

- Use TypeScript strictly (no `any` unless justified)
- Use clear and descriptive naming
- Keep functions small and focused
- Avoid deeply nested logic
- Write self-explanatory code where possible

---

## Testing & Validation Expectations

- Ensure core functionality works as expected
- Handle edge cases
- Validate user inputs where needed
- Do not assume ideal conditions

---

## Deployment (Vercel)

- The app is deployed on Vercel
- Ensure all features are compatible with Vercel environment
- Handle environment variables correctly
- Avoid server-side features not supported by Vercel
- Ensure builds do not fail

---

## Definition of Done

A task is considered complete only if:

- Feature is fully implemented
- Code follows project conventions
- UI is responsive and accessible
- All states (loading, error, empty, success) are handled
- No obvious edge cases are ignored
- No unnecessary complexity is introduced
- The feature is production-ready

---

## Agent Collaboration Rules

- Design Agent defines structure and UX
- Build Agent implements code
- Test Agent validates behavior and edge cases
- Deploy Agent evaluates release readiness
- Architect Agent evalutes component integrity and makes sure everything will work as expected or intended.

Agents must:
- Follow this document strictly
- Not override established patterns without reason
- Not invent missing requirements without clarification
- Clearly communicate assumptions and uncertainties

---

## Forbidden Behaviors

- Do not hallucinate APIs or libraries
- Do not introduce breaking changes without explanation
- Do not ignore accessibility or responsiveness
- Do not add unnecessary complexity
- Do not overwrite unrelated code
- Do not assume requirements that were not provided

---

## When Unclear

If requirements are ambiguous:
- Ask for clarification OR
- Make minimal, reasonable assumptions and state them clearly