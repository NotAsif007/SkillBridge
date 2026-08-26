# CareerOS — Design System & UI/UX Guidelines

## 1. Design Philosophy & Brand Identity

CareerOS is an enterprise-grade placement operating system for universities and high-performing students. 

### Core Design Pillars
- **Apple-Inspired Clarity**: Bright neutral surfaces, crisp graphite controls, and restrained emerald feedback. Focused on quiet confidence, precision typography, and intuitive information hierarchy.
- **Anti-AI Tropes**: Strictly no dark-blue/purple glowing gradients, rainbow border animations, or floating magic wands. AI insights are presented as clean, analytical diagnostics.
- **Data-Dense Yet Human**: High scannability, clear typographic scale, and purposeful data visualization.

---

## 2. Color Palette & Token System

### 2.1 Primary & Neutral Foundation
- **App Background**: `#F5F5F7` (Apple Light Neutral Canvas)
- **Surface / Card**: `#FFFFFF` (Pure White Card Surface)
- **Border / Divider**: `#E5E5EA` (Subtle Neutral Divider)
- **Text Primary**: `#1D1D1F` (Graphite / Deep Obsidian Text)
- **Text Muted / Secondary**: `#6E6E73` (Balanced Neutral Muted)
- **Control Inactive / Secondary Surface**: `#EBEBED`

### 2.2 Functional & Accent Tokens (Purpose-Driven)
- **Placement Readiness / Growth (Restrained Emerald)**:
  - Primary: `#059669` (Emerald 600)
  - Badge Background: `#ECFDF5`
  - Badge Text: `#065F46`
  - Stroke / Border: `rgba(5, 150, 105, 0.2)`
- **Institutional Primary (Graphite / Slate)**:
  - Primary: `#1D1D1F` (Graphite Active)
  - Hover / Focus: `#2C2C2E`
- **Skill Gap / Attention (Warm Amber)**:
  - Warning: `#D97706` (Amber 600)
  - Badge: `#FFFBEB` | Text: `#92400E`
- **Critical Gap / Missed (Crimson)**:
  - Danger: `#DC2626` (Red 600)
  - Badge: `#FEF2F2` | Text: `#991B1B`
- **Informational / Analytics (Teal)**:
  - Teal: `#0D9488` (Teal 600)

---

## 3. Typography & Hierarchy

### Font Family
- **Primary Body & Display**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, sans-serif
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

### 4.1 Unified Responsive Shell (`AppShell.jsx`)
- `apps/frontend/src/components/common/AppShell.jsx` provides the centralized layout for all authenticated views (Student & Admin):
  - Sticky top header with brand icon and role-based workspace label.
  - Role-specific desktop sidebar navigation and responsive mobile slide-over drawer.
  - Account avatar pill, organization affiliation tag, and one-click logout action.
- `StudentLayout.jsx` and `AdminLayout.jsx` act as thin wrappers around `AppShell`.

### 4.2 Readiness Score Gauge / Meter
- Represented as a circular stroke meter or clean progress bar.
- Color dynamically mapped:
  - `< 60%`: Amber / Orange (`#D97706`) — "Building Foundation"
  - `60% - 79%`: Teal / Blue (`#0D9488`) — "Placement Emerging"
  - `>= 80%`: Emerald Green (`#059669`) — "Placement Ready"
- Displays clear metric breakdown (Technical, Assessment, Projects, Interview, Resume, Roadmap).

### 4.3 Skill Gap Cards
- **Matched Skill**: Clean subtle green badge (`✓ JavaScript (L4)`).
- **Weak Skill**: Muted amber badge with gap indicator (`⚠ DSA (L2 → L4)`).
- **Missing Skill**: Outline badge (`+ Docker (Required L2)`).
- **Actionable CTA**: "Add to Roadmap" or "Take Assessment".

### 4.4 Data Tables (College Admin)
- Clean white background, `#E5E5EA` border grid, row hover effect.
- Inline readiness badge, department tag, and quick student profile drawer trigger.
- Column sorting, multi-attribute filter pills, and sticky pagination footer.

### 4.5 AI Interview Interface
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
- **Card Border Radius**: `12px` (`rounded-xl`)
- **Button / Input Radius**: `8px` (`rounded-lg`)
- **Pill / Badge Radius**: `9999px` (`rounded-full`)
- **Shadows**: Ultra-subtle ambient shadows (`shadow-sm` / `border border-[#E5E5EA]`).

---

## 6. Shared Component Architecture for Person 2 & 3

Frontend engineers should build and import shared primitives from `apps/frontend/src/components/`:

```text
apps/frontend/src/components/
├── common/
│   ├── AppShell.jsx           ← Sole responsive shell for student/admin workspaces
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── MetricCard.jsx
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
└── charts/
    ├── ReadinessGauge.jsx
    ├── SkillRadarChart.jsx
    ├── DepartmentBarChart.jsx
    └── TrendLineChart.jsx
```
