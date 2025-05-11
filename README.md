# 10x-cards

## Table of Contents
1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)

---

## Project Description

10x-cards is an application that enables users to quickly create and manage educational flashcard sets. Leveraging LLM, the app automatically generates question-and-answer suggestions from user-provided text, significantly speeding up the preparation of study materials. Users can also manually create, edit, and organize flashcards, as well as review them through a spaced repetition algorithm for efficient learning.


## Tech Stack

- **Frontend**
  - Astro 5 (with minimal JavaScript)
  - React 19 (for dynamic components)
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/ui (Radix-based React component library)

- **Backend & Services**
  - Supabase (PostgreSQL, Auth)
  - Openrouter.ai (access to various LLM models)

- **CI/CD & Hosting**
  - GitHub Actions (CI/CD pipelines)
  - Docker on DigitalOcean

- **Utilities**
  - ESLint & Prettier (code quality & formatting)
  - Husky & lint-staged (pre-commit checks)

- **Testing**
  - Vitest + Testing Library (unit and integration tests)
  - Playwright (end-to-end tests)
  - Storybook (UI component testing)
  - Zod (type validation)
  - MSW (API mocking)


## Getting Started Locally

### Prerequisites

- Node.js **v22.14.0** (as specified in `.nvmrc`)
- A Supabase project (URL & API keys)
- An Openrouter.ai API key

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/a-pralat/10x-cards.git
   cd 10x-cards
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory and add the following variables:

   ```ini
   # Supabase settings
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Openrouter.ai settings
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000` by default.


## Available Scripts

In the project root, you can run:

| Script      | Description                              |
|-------------|------------------------------------------|
| `npm run dev`     | Start Astro development server           |
| `npm run build`   | Build the production site                |
| `npm run preview` | Preview the production build locally     |
| `npm run astro`   | Run Astro CLI commands                   |
| `npm run lint`    | Run ESLint on all files                  |
| `npm run lint:fix`| Fix linting errors automatically         |
| `npm run format`  | Format code with Prettier                |
| `npm run test`    | Run unit and integration tests           |
| `npm run test:e2e`| Run end-to-end tests                     |
| `npm run storybook`| Start Storybook for UI component testing |


## Project Scope

### In-Scope (MVP)

- **Automatic Flashcard Generation**
  - Paste a text snippet (1,000–10,000 characters)
  - Send to LLM via API and display generated Q&A suggestions
  - Accept, edit, or reject suggestions
- **Manual Flashcard Management**
  - Create, edit, and delete flashcards via a form
  - Organize flashcards in "My Cards" view
- **User Authentication**
  - Email/password registration & login
  - Account deletion (with all associated cards)
- **Spaced Repetition Integration**
  - Use an existing spaced repetition algorithm for study sessions
- **Data Persistence**
  - Store users and cards securely in Supabase
- **Basic Metrics**
  - Track numbers of generated and accepted cards

### Out of Scope (Future Enhancements)

- Custom spaced repetition algorithm
- Gamification & achievements
- Mobile applications (iOS/Android)
- Public API or flashcard sharing
- Advanced notifications & reminders
- Import from PDF/DOCX


## Project Status

**Version:** 0.0.1 (Early MVP)

Work in progress – core features are under active development.


## License

This project is licensed under the MIT license.

---
