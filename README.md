# 🗓️ Wall Calendar — Interactive React/Next.js Component

A polished, interactive wall calendar component built with **Next.js 15 (App Router)** and **Tailwind CSS v4**, inspired by a physical wall calendar aesthetic.

---

## ✨ Features

### Core Requirements
- **Wall Calendar Aesthetic** — Spiral binding, paper texture, hero image panel with seasonal illustrations
- **Day Range Selector** — Click start date → click end date; hover preview shows range; clear visual states for start, end, and in-between days
- **Integrated Notes** — Two-tab notes panel: *Month Notes* (per month) and *Range Notes* (per selected range), auto-saved to `localStorage`
- **Fully Responsive** — Side-by-side desktop layout collapses to stacked vertical on mobile

### Creative Extras
- **Month Themes** — Each month has a unique color scheme (bg, accent, text) that changes the entire UI
- **Seasonal Hero Illustrations** — Animated floating emoji scenes for Winter/Spring/Summer/Autumn
- **Page Flip Animation** — Smooth CSS animation when navigating months
- **Holiday Markers** — US holidays shown as emoji icons on calendar days with tooltip on hover
- **Hover Range Preview** — Before completing a range, hovering shows a live preview of what will be selected
- **Today Indicator** — Outlined circle + dot marker for today's date
- **Spiral Binding** — Decorative top binding that matches the month's theme color
- **Day Count Display** — Shows number of days in selected range in the hero panel

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build
npm start
```

---

## 🏗️ Architecture

```
app/
├── components/
│   ├── WallCalendar.js    # Root component — state management, theme, navigation
│   ├── MonthHero.js       # Left panel — seasonal scene + range info
│   ├── CalendarHeader.js  # Month/year title + prev/next/today buttons
│   ├── CalendarGrid.js    # 7-column day grid with range highlighting
│   └── NotesPanel.js      # Tabbed notes (month + range), localStorage persistence
├── globals.css            # Tailwind v4 + custom animations/utilities
├── layout.js              # Root layout
└── page.js                # Entry point
```

### State Management
All state lives in `WallCalendar.js` (no external state library needed):
- `currentDate` — which month/year is displayed
- `rangeStart` / `rangeEnd` — selected date range
- `hoveredDate` — for live range preview
- `notes` — `{ [key]: string }` map, persisted to `localStorage`

### Design Decisions
- **No external dependencies** beyond Next.js + Tailwind — keeps bundle minimal
- **`localStorage`** for persistence — no backend needed per requirements
- **CSS-only animations** — page flip and float effects via `@keyframes`
- **Tailwind v4** inline styles for dynamic theme colors (can't use arbitrary values for runtime-computed colors)

---

## 📱 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Mobile (`< lg`) | Stacked: Hero on top, calendar below |
| Desktop (`≥ lg`) | Side-by-side: Hero left (288px), calendar right |

---

## 🎨 Month Themes

Each month has a unique `{ bg, accent, text, season, emoji }` theme that drives:
- Header background color
- Accent color for weekends, today indicator, range highlights
- Hero scene gradient and floating elements
- Bottom decorative strip gradient
