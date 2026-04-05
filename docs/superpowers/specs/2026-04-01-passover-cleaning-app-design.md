# Passover Cleaning App — Design Spec

## Overview

A gamified Passover cleaning tracker built with React + Tailwind CSS, designed to be cast on a TV. Makes בדיקת חמץ fun with animations, sounds, color themes per room, and celebration moments.

## Tech Stack

- **React 18** (Vite for dev/build)
- **Tailwind CSS 3** for styling
- **Framer Motion** for animations
- **Web Audio API** for synthesized sound effects (no external audio files)
- **localStorage** for persistence
- **No backend** — fully client-side

## Views

### 1. Home Board (Room Grid)

The main screen showing all rooms as large, colorful cards in a responsive grid.

**Layout:**
- Header: "ניקיון פסח ✨" title with subtle floating animation
- Overall progress bar showing total completion across all rooms
- Room cards in a responsive grid (2-3 columns, TV-optimized with large touch targets)
- "Add Room" card at the end with a dashed border and + icon

**Room Card contents:**
- Room emoji (large, 48px+)
- Room name (Hebrew-friendly, bold serif)
- Progress: "3/7 tasks" with a colored progress bar
- Subtle gradient background in the room's theme color
- Completed rooms get a special "✨ Done!" badge

**Interactions:**
- Cards scale up on hover with a spring animation
- Click plays a soft "pop" sound
- Click navigates to that room's Task View
- Adding a room: modal with name input, emoji picker (preset list), and color picker (preset palette)

**Background:**
- Warm cream (#FFF7ED) base
- Subtle decorative matzah/wheat pattern at very low opacity
- Floating particles (sparkles) drifting slowly

### 2. Task View (Single Room)

Full-screen view themed to the room's color palette.

**Layout — Top section:**
- Back arrow button (top-left)
- Room emoji + name (large, centered)
- Timer display (big digital countdown, centered below name)
- Timer controls: time picker (preset buttons: 5, 10, 15, 20, 30 min + custom), Start/Pause/Reset buttons

**Layout — Task list (scrollable middle):**
- Each task is a card/row with:
  - Checkbox (custom animated — spring fill + checkmark draw)
  - Task text
  - Delete button (appears on hover, trash icon)
- Completed tasks: strikethrough with fade, move to bottom of list
- Empty state: encouraging message "!הכל נקי" with sparkle animation

**Layout — Bottom:**
- "Add Task" input bar pinned to bottom
- Text input + submit button
- Submitting plays a "whoosh" sound and the task slides in from below

**Timer behavior:**
- Counts down with a circular progress ring around the timer
- Last 10 seconds: timer turns red, pulses
- Timer complete → CELEBRATION MODE:
  - Full-screen confetti particle explosion (colorful, 3-4 seconds)
  - "!נצחון" text scales up with bounce animation
  - Fanfare sound (ascending synth notes)
  - After 3 seconds, confetti fades and returns to normal view

**Background:**
- Full gradient in the room's theme color (light to slightly lighter)
- Subtle animated gradient shift

### 3. Celebration Overlay

Triggered when timer completes.

- Canvas-based confetti system (200+ particles, gravity, rotation, multiple colors)
- Large bouncing "!נצחון" text
- Plays a celebratory ascending synth melody
- Auto-dismisses after 4 seconds or tap to dismiss

## Room Themes (Default Palette)

| Room | Emoji | Gradient | Text Color |
|------|-------|----------|------------|
| מטבח (Kitchen) | 🍳 | #FEF3C7 → #FDE68A | #78350F |
| סלון (Living Room) | 🛋️ | #FEE2E2 → #FECACA | #7F1D1D |
| חדר שינה (Bedroom) | 🛏️ | #EDE9FE → #DDD6FE | #4C1D95 |
| חדר אמבטיה (Bathroom) | 🚿 | #CCFBF1 → #99F6E4 | #134E4A |
| פינת אוכל (Dining Room) | 🍽️ | #FEF9C3 → #FDE047 | #713F12 |

Custom rooms pick from a preset color palette of 8 options.

## Sound Design (Web Audio API — synthesized, no files)

All sounds are generated via Web Audio API oscillators and gain envelopes:

| Action | Sound |
|--------|-------|
| Click / tap | Short sine pop (800Hz, 50ms decay) |
| Check off task | Rising ding (600→1200Hz, 150ms) |
| Add task | Whoosh (white noise, bandpass sweep, 200ms) |
| Timer complete | Ascending 4-note fanfare (C5-E5-G5-C6, 100ms each) |
| Delete task | Low thud (200Hz, 80ms decay) |

## Default Tasks (Pre-loaded)

**מטבח (Kitchen):**
- ניקוי ארונות (Clean cabinets)
- ניקוי תנור (Clean oven)
- ניקוי מקרר (Clean fridge)
- שטיפת משטחים (Wipe counters)
- ניקוי כיור (Clean sink)

**סלון (Living Room):**
- שאיבת אבק ספות (Vacuum couches)
- ניקוי מדפים (Dust shelves)
- שטיפת רצפה (Mop floor)
- בדיקת פינות (Check corners)

**חדר שינה (Bedroom):**
- בדיקת מגירות (Check drawers)
- ניקוי ארון (Clean closet)
- שאיבת אבק (Vacuum)
- ניקוי מתחת למיטה (Clean under bed)

**חדר אמבטיה (Bathroom):**
- ניקוי אריחים (Scrub tiles)
- ניקוי מראה (Clean mirror)
- ניקוי אסלה (Clean toilet)
- ניקוי כיור (Clean sink)

**פינת אוכל (Dining Room):**
- ניקוי שולחן (Clean table)
- ניקוי כיסאות (Clean chairs)
- שטיפת רצפה (Mop floor)

## Animations (Framer Motion + CSS)

- **Card hover:** scale(1.05) with spring physics (stiffness: 300, damping: 20)
- **Task appear:** slideInFromBottom + fadeIn (0.3s)
- **Task complete:** checkbox spring fill + strikethrough sweep + fade to 50% opacity
- **Progress bar:** smooth width transition (0.5s ease-out)
- **Timer pulse:** scale pulse animation in last 10 seconds (CSS keyframes)
- **Confetti:** Canvas 2D particles with gravity, rotation, air resistance, multiple shapes (circles, rectangles, triangles)
- **Page transitions:** fade + slight slide between Home and Task views
- **Floating sparkles:** Background CSS animated dots drifting upward (very subtle)
- **"Add Room" card:** dashed border animation (marching ants CSS)

## Data Model (localStorage)

```typescript
interface Room {
  id: string;          // uuid
  name: string;        // Hebrew name
  emoji: string;       // Single emoji
  colorFrom: string;   // Gradient start
  colorTo: string;     // Gradient end
  textColor: string;   // Dark text color for contrast
  tasks: Task[];
  order: number;       // Sort order
}

interface Task {
  id: string;          // uuid
  text: string;        // Task description
  completed: boolean;
  order: number;       // Sort order
}

interface AppState {
  rooms: Room[];
  activeTimer: {
    roomId: string | null;
    duration: number;      // seconds
    remaining: number;     // seconds
    running: boolean;
  };
}
```

## TV Optimization

- Minimum font size: 18px (readable from couch distance)
- Large touch/click targets: minimum 64px
- High contrast text on gradients
- No tiny UI elements — everything oversized and bold
- RTL support for Hebrew text (dir="rtl" on relevant elements)
- Responsive: works on both TV (landscape) and phone (portrait) for adding tasks

## Project Structure

```
passover/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css              # Tailwind imports + custom animations
│   ├── components/
│   │   ├── HomeBoard.tsx       # Room grid view
│   │   ├── RoomCard.tsx        # Individual room card
│   │   ├── TaskView.tsx        # Single room task view
│   │   ├── TaskItem.tsx        # Individual task row
│   │   ├── Timer.tsx           # Countdown timer with circular progress
│   │   ├── AddRoomModal.tsx    # Modal for adding new room
│   │   ├── Confetti.tsx        # Canvas confetti celebration
│   │   └── CelebrationOverlay.tsx  # Victory screen
│   ├── hooks/
│   │   ├── useSound.ts         # Web Audio API sound effects
│   │   ├── useTimer.ts         # Timer logic
│   │   └── useLocalStorage.ts  # Persistent state
│   ├── data/
│   │   └── defaultRooms.ts     # Pre-loaded rooms and tasks
│   └── lib/
│       └── confetti.ts         # Confetti particle system
```
