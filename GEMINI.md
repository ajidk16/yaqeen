You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

# Project Configuration & Guidelines

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (Runes)
- **Styling**: Tailwind CSS v4 + daisyUI v5
- **Database**: Drizzle ORM (Neon Serverless)
- **Testing**: Vitest + Playwright

## UI Components

A set of reusable UI components is available in `src/lib/components/ui`.
Always prefer using these components over creating new ones or using raw HTML/CSS when possible.

**Import Path:**

```typescript
import { ComponentName } from '$lib/components/ui';
```

**Available Components:**

- **Form**: `Input`, `Textarea`, `Select`, `Checkbox`, `Toggle`, `RadioGroup`
- **Structure**: `Card`, `Modal`, `Drawer`, `Accordion`
- **Interaction**: `Button`, `Dropdown`, `Alert`, `Badge`, `Tooltip`, `Avatar`, `Loading`

## Coding Guidelines

1. **Svelte 5 Runes**: Always use Runes (`$state`, `$derived`, `$effect`, `$props`) for reactivity. Do not use legacy `export let` or `$:`.
2. **DaisyUI**: Use daisyUI utility classes for styling components.
3. **Icons**: Use SVG snippets or icon components to pass to `icon` props where supported.
4. **Type Safety**: Ensure all props and state are properly typed with TypeScript.
