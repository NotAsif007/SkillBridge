# CareerOS — Design System & UI/UX Guidelines

## 1. Design Philosophy & Brand Identity

CareerOS is an enterprise-grade placement operating system for universities and high-performing students. 

### Core Design Pillars
- **High Trust & Institutional**: Clean, structured, and legible—built like a high-performance modern operating system (Linear, Stripe, Vercel).
- **Anti-AI Tropes**: No generic "blurple" (purple/indigo glows), no rainbow gradient borders, and no floating magic wand animations. AI insights are presented as clean analytical diagnostics.
- **Data-Dense Yet Human**: High scannability, clear typography hierarchy, and purposeful data visualization.

---

## 2. Color Palette & Token System

### 2.1 Primary & Neutral Tokens (Slate / Zinc Foundation)
- **Background (App)**: `#0B0F17` (Deep Obsidian / Dark) / `#F8FAFC` (Crisp Slate / Light)
- **Surface / Card**: `#111827` (Card Dark) / `#FFFFFF` (Card Light)
- **Border / Divider**: `#1F2937` (Dark Border) / `#E2E8F0` (Light Border)
- **Text Primary**: `#F9FAFB` (Dark Mode) / `#0F172A` (Light Mode)
- **Text Muted**: `#9CA3AF` (Dark Mode) / `#64748B` (Light Mode)

### 2.2 Functional & Accent Tokens (Purpose-Driven)
- **Placement Readiness / Growth (Emerald)**:
  - Primary: `#059669` (Emerald 600)
  - Light Badge: `#ECFDF5` | Text: `#065F46`
  - Dark Badge: `rgba(5, 150, 105, 0.15)` | Text: `#34D399`
- **Institutional Primary (Deep Cobalt / Navy)**:
  - Primary: `#1E3A8A` (Blue 900) / `#2563EB` (Blue 600 for interactive states)
  - Hover: `#1D4ED8`
- **Skill Gap / Attention (Amber)**:
  - Warning: `#D97706` (Amber 600)
  - Badge: `rgba(217, 119, 6, 0.15)` | Text: `#FBBF24`
- **Critical Gap / Missed (Crimson / Rose)**:
  - Danger: `#DC2626` (Red 600)
  - Badge: `rgba(220, 38, 38, 0.15)` | Text: `#F87171`
- **Informational / Analytics (Teal / Cyan)**:
  - Teal: `#0D9488` (Teal 600)

---

## 3. Typography & Hierarchy

### Font Family
- **Primary Body & Display**: `Inter`, `Plus Jakarta Sans`, system-ui, sans-serif
- **Code, Metrics & Technical Data**: `JetBrains Mono`, `Fira Code`, monospace

### Scale & Weight
| Element | Size | Line Height | Weight | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Title)** | 28px / 1.75rem | 36px | 700 (Bold) | -0.02em |
| **H2 (Section Header)** | 20px / 1.25rem | 28px | 600 (Semibold) | -0.01em |
| **H3 (Card Title)** | 16px / 1.0rem | 24px | 600 (Semibold) | 0 |
| **Body (Regular)** | 14px / 0.875rem | 20px | 400 (Regular) | 0 |
| **Body (Small / Meta)** | 12px / 0.75rem | 16px | 500 (Medium) | +0.01em |
| **Metric Value (Hero)** | 36px / 2.25rem | 44px | 800 (Extrabold) | -0.03em |

---

## 4. UI Component Guidelines

### 4.1 Readiness Score Gauge / Meter
- Represented as a circular stroke meter or clean progress bar.
- Color dynamically mapped:
  - `< 60%`: Amber / Orange (`#D97706`) — "Building Foundation"
  - `60% - 79%`: Teal / Blue (`#0D9488`) — "Placement Emerging"
  - `>= 80%`: Emerald Green (`#059669`) — "Placement Ready"
- Displays clear metric breakdown (Technical, Assessment, Projects, Interview, Resume).

### 4.2 Skill Gap Cards
- **Matched Skill**: Clean subtle green badge (`✓ JavaScript (L4)`).
- **Weak Skill**: Muted amber badge with gap indicator (`⚠ DSA (L2 → L4)`).
- **Missing Skill**: Outline badge (`+ Docker (Required L2)`).
- **Actionable CTA**: "Add to Roadmap" or "Take Assessment".

### 4.3 Data Tables (College Admin)
- Fixed headers, row zebra striping (subtle `5%` contrast).
- Inline readiness badge, department tag, and quick student profile drawer trigger.
- Column sorting, multi-attribute filter pills, and sticky pagination footer.

### 4.4 AI Interview Interface
- Split-screen workspace layout:
  - **Left**: Question prompt, tested skill tag, difficulty pill, question timer.
  - **Right**: Answer text area / audio recorder transcript with clean character/word counter.
  - **Bottom / Results**: Structured feedback card with rubric scores (Technical, Problem Solving, Communication) and bulleted improvement points.

---

## 5. Spacing, Elevation & Layout Grid

### Grid & Containers
- Standard 12-column responsive grid.
- Main max-width: `1440px` with responsive padding (`px-4 sm:px-6 lg:px-8`).
- Sidebar navigation width: `260px` fixed, collapsible on mobile (`< 1024px`).

### Radius & Shadows
- **Card Border Radius**: `10px` (`rounded-xl`)
- **Button / Input Radius**: `8px` (`rounded-lg`)
- **Pill / Badge Radius**: `9999px` (`rounded-full`)
- **Shadows**: Crisp, subtle ambient shadows (`shadow-sm` / `border border-slate-800` rather than heavy drop-shadows).

---

## 6. Shared Component Architecture for Person 2 & 3

Frontend engineers should build and import shared primitives from `apps/frontend/src/components/ui/`:

```text
apps/frontend/src/components/
├── ui/
│   ├── Button.jsx
│   ├── Badge.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Progress.jsx
│   ├── Table.jsx
│   ├── Tabs.jsx
│   └── Skeleton.jsx
├── charts/
│   ├── ReadinessGauge.jsx
│   ├── SkillRadarChart.jsx
│   ├── DepartmentBarChart.jsx
│   └── TrendLineChart.jsx
└── common/
    ├── Navbar.jsx
    ├── Sidebar.jsx
    └── MetricCard.jsx
```
