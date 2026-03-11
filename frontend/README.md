# AI Adventure: Master Work Through Play

A gamified learning platform that teaches **Agentic AI** through real-world business scenarios. Play through 30+ enterprise simulations across Commercial, Supply Chain, Finance, HR, and other business functions — each demonstrating how AI agents save time and reduce errors in practice.

---

## Features

- **30+ Business Scenarios** — Authentic enterprise workflows with step-by-step AI agent execution
- **Interactive Chat Interface** — Communicate with an AI agent as it works through tasks
- **Agent Plan Transparency** — Real-time visualization of AI reasoning, tools used, and confidence levels
- **Human-in-the-Loop (HITL) Gates** — Approval checkpoints for critical decisions
- **Promo Compliance Game** — A 3-phase gamified experience comparing manual vs. AI-powered auditing
- **Old vs. New Comparison** — Side-by-side view of manual processes versus AI-assisted workflows
- **Ratings & Feedback System** — Rate scenarios and suggest new ones
- **Fully Responsive** — Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Animations | Motion (Framer Motion v11) |
| Icons | Lucide React |
| Charts | Recharts |

---

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (recommended) — or npm / yarn

Install pnpm if you don't have it:
```bash
npm install -g pnpm
```

---

## Installation

```bash
# 1. Clone / navigate to the project root
cd /path/to/ai_game

# 2. Install dependencies
pnpm install

# 3. (Linux only) Install the Tailwind CSS v4 native binary if not auto-installed
pnpm add @tailwindcss/oxide-linux-x64-gnu

# macOS Apple Silicon:
# pnpm add @tailwindcss/oxide-darwin-arm64

# macOS Intel:
# pnpm add @tailwindcss/oxide-darwin-x64

# Windows:
# pnpm add @tailwindcss/oxide-win32-x64-msvc
```

> **Note:** Tailwind CSS v4 uses a Rust-compiled native binary (`@tailwindcss/oxide`).
> Some versions of pnpm do not auto-install the platform-specific optional package.
> If `pnpm run build` or `pnpm dev` fails with "Cannot find native binding", run the
> platform-specific install command above.

---

## Running the App

### Development Server
```bash
pnpm dev
```
Opens at **http://localhost:5173**

Hot module replacement is enabled — changes reflect instantly without a page reload.

### Production Build
```bash
pnpm run build
```
Output goes to `dist/`. The build includes type-checking (`tsc -b`) followed by Vite's optimized bundler.

### Preview Production Build
```bash
pnpm preview
```
Serves the `dist/` folder locally at **http://localhost:4173** for final verification.

### Running with Docker

To build and run the application in a Docker container, use the following commands:

```bash
# 1. Build the Docker image
docker build -t frontend .

# Custom API build
docker build -t frontend --build-arg VITE_API_URL=https://api.production.com .

# 2. Run the Docker container
docker run -p 8080:80 ai-games
```
The application will be available at **http://localhost:8080**.

---

## Project Structure

```
ai_game/
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite config (alias, plugins, figma:asset resolver)
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # App TypeScript config (strict, bundler mode)
├── tsconfig.node.json          # Node TypeScript config (for vite.config.ts)
├── package.json                # Dependencies & scripts
│
├── src/
│   ├── main.tsx                # React app entry point
│   └── vite-env.d.ts           # Type declarations (figma:asset, CSS)
│
├── AI Adventure/               # Figma Make export — all source code lives here
│   ├── app/
│   │   ├── App.tsx             # Root component & app state router
│   │   ├── components/
│   │   │   ├── WelcomeScreen.tsx        # Landing page hero
│   │   │   ├── ScenarioSelection.tsx    # Browse & filter 30+ scenarios
│   │   │   ├── OldVsNewComparison.tsx   # Manual vs AI side-by-side view
│   │   │   ├── ChatBasedExecution.tsx   # Chat-driven agent workflow
│   │   │   ├── AgentPlanPanel.tsx       # Agent step tracker (left sidebar)
│   │   │   ├── ReasoningArtifacts.tsx   # Data sources & confidence display
│   │   │   ├── PostActionReflection.tsx # Completion summary & metrics
│   │   │   ├── HITLGate.tsx             # Human-in-the-loop approval gate
│   │   │   ├── RatingModal.tsx          # Star rating submission
│   │   │   ├── CommentsViewModal.tsx    # View scenario feedback
│   │   │   ├── RatingDisplay.tsx        # Star rating display widget
│   │   │   ├── Footer.tsx               # Powered-by footer
│   │   │   ├── promo-game/              # Gamified promo compliance experience
│   │   │   │   ├── GameFlow.tsx         # 3-phase orchestrator
│   │   │   │   ├── Phase1Manual.tsx     # Manual audit simulation
│   │   │   │   ├── Phase2Agentic.tsx    # AI agent demo
│   │   │   │   ├── FinalSummary.tsx     # Impact metrics & completion
│   │   │   │   ├── MetricsPanel.tsx     # Manual vs AI comparison panel
│   │   │   │   └── MindsetTooltip.tsx   # Educational tooltips
│   │   │   └── ui/                      # 56 shadcn/ui component primitives
│   │   ├── data/
│   │   │   └── scenarios-30.ts          # 30+ enterprise scenario definitions
│   │   └── types/
│   │       └── scenario.ts              # TypeScript interfaces (Scenario, AgentStep)
│   └── styles/
│       ├── index.css                    # CSS entry — imports all stylesheets
│       ├── tailwind.css                 # Tailwind v4 directives & source scanning
│       ├── theme.css                    # CSS variables, color tokens, typography
│       └── fonts.css                    # Custom font definitions
│
└── public/
    ├── favicon.svg             # App icon
    └── assets/                 # Place real images here (see section below)
```

---

## App Flow

```
Welcome Screen
    ↓  "Start Playing Now"
Scenario Selection  (filter by function: Commercial / Supply Chain / Finance / HR / Other)
    ↓  select a scenario
    ├─ [has oldWaySteps] → Old vs New Comparison → choose path
    │                                               ↓
    └─────────────────────────────────────────→  Chat-Based Execution
                                                    ↓  AI agent runs steps
                                               [HITL Gate if needed]  →  Approve / Reject
                                                    ↓  all steps done
                                               Post-Action Reflection (metrics, learning)

Special: selecting "Promo Compliance Check" (commercial-4) launches a 3-phase game:
    Phase 1 (Manual) → Phase 2 (AI Demo) → Final Summary
```

---

## Replacing Figma Placeholder Images

The original design references images via a Figma-specific `figma:asset/<hash>.png` scheme.
A Vite plugin (`vite-plugin-figma-assets` in [vite.config.ts](vite.config.ts)) intercepts these
imports and currently serves a grey SVG placeholder so the app runs without errors.

**To use real images:**

1. Place your PNG files in `public/assets/`
2. Open [vite.config.ts](vite.config.ts) and uncomment the entries in the `assetMap` object,
   updating the paths to match your filenames:

```ts
const assetMap: Record<string, string> = {
  'b7c663aaaffd2123e1f119dd74e53b5eadefff3c': '/assets/coke-logo.png',
  '50df961786c08f3ce7403ef57839bc891028f51a': '/assets/hero.png',
  '0b77b80337e00e3daf4cb457032e58b6d56f04a0': '/assets/content.png',
  'ff9936f7e451a179b1ac9cb210a5bceda3311140': '/assets/desk.png',
  '1d8eef4f0b971ebad3c5ec87490f803b5217cbb0': '/assets/timer.png',
  'dcb115b258b620033204da77a8a40088d031186f': '/assets/stack.png',
  '07dfe6c7775cacff76b9e7dffe5d04e7714eeb57': '/assets/hellen-icon.png',
  '56b56d388664a39ac1bdfc334b9e0794a6db2ba8': '/assets/hellen-logo.png',
}
```

| Hash prefix | Used in | Description |
|---|---|---|
| `b7c663...` | App.tsx, WelcomeScreen | Coke logo |
| `50df96...` | WelcomeScreen | Hero banner image |
| `0b77b8...` | WelcomeScreen | Content/intro image |
| `ff9936...` | WelcomeScreen | "Real Work, Simulated" card icon |
| `1d8eef...` | WelcomeScreen | "15-Minute Power-Up" card icon |
| `dcb115...` | WelcomeScreen | "Growing Universe" card icon |
| `07dfe6...` | ScenarioSelection | Search bar icon |
| `56b56d...` | Footer | Hellen+ logo |

---

## Adding or Editing Scenarios

All scenarios live in [AI Adventure/app/data/scenarios-30.ts](AI%20Adventure/app/data/scenarios-30.ts).
Each scenario follows the `Scenario` interface defined in [AI Adventure/app/types/scenario.ts](AI%20Adventure/app/types/scenario.ts).

```ts
interface Scenario {
  id: string;
  title: string;
  function: 'Commercial' | 'Supply Chain' | 'Finance' | 'HR' | 'Legal' | 'IT & Marketing' | 'Other';
  description: string;
  problem: string;
  icon: string | React.ComponentType<{ className?: string }>;  // emoji or Lucide icon
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;           // e.g. "15 min"
  steps: AgentStep[];              // AI agent workflow steps
  benefits: { timeSaved: string; impactMetric: string };
  learningModules: string[];
  oldWaySteps?: string[];          // manual steps for comparison view
  oldWayTime?: string;             // e.g. "45-60 min"
  flagship?: boolean;              // shows "Best" badge
  startHere?: boolean;             // makes the scenario playable (others show "Coming Soon")
}
```

Set `startHere: true` to make a scenario available to play.
Set `flagship: true` to highlight it with a "Best" badge.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find native binding` on build/dev | Run `pnpm add @tailwindcss/oxide-linux-x64-gnu` (or the OS-specific variant) |
| `Ignored build scripts: esbuild` warning | Safe to ignore — the binary is pre-bundled. Run `pnpm rebuild esbuild` if vite fails to start |
| Figma image placeholders showing grey boxes | Add real images to `public/assets/` and update `assetMap` in `vite.config.ts` |
| TypeScript errors in original Figma files | Run `pnpm dev` instead — Vite skips type checking during development |

---

## Scripts Reference

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with HMR at localhost:5173 |
| `pnpm run build` | Type-check + production build → `dist/` |
| `pnpm preview` | Preview production build at localhost:4173 |
