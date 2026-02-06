# 🌿 ZenFlow – AI Development Rules

## Brand Identity

**Name:** ZenFlow
**Tagline:** "Focus deeply. Work calmly."
**Tone:** Calm, mindful, friendly, wellness-focused

---

## Design Philosophy

ZenFlow embodies a **zen-inspired, nature-focused** aesthetic that promotes:
- Mental clarity and focus
- Calm digital experiences
- Wellness-first interactions
- Distraction-free workflows

**Core Principles:**
1. Simplicity over complexity
2. Breathing room (generous whitespace)
3. Natural, organic feel
4. Soft, approachable UI
5. No visual noise

---

## Color System

### Light Mode (Default)

| Token | Value | Usage |
|-------|-------|-------|
| `--zen-primary` | `#10B981` | Primary actions, active states |
| `--zen-primary-dark` | `#059669` | Hover states, emphasis |
| `--zen-primary-light` | `#34D399` | Highlights, accents |
| `--zen-primary-pale` | `#D1FAE5` | Soft backgrounds, badges |
| `--zen-bg` | `#F6FFF9` | Page background |
| `--zen-bg-card` | `#FFFFFF` | Cards, elevated surfaces |
| `--zen-bg-muted` | `#F0FDF4` | Subtle sections |
| `--zen-border` | `#E5E7EB` | Borders, dividers |
| `--zen-border-light` | `#F3F4F6` | Subtle separators |
| `--zen-text` | `#0F172A` | Primary text (Slate 900) |
| `--zen-text-secondary` | `#475569` | Secondary text (Slate 600) |
| `--zen-text-muted` | `#94A3B8` | Muted text (Slate 400) |

### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--zen-primary` | `#34D399` | Primary actions |
| `--zen-primary-dark` | `#10B981` | Hover states |
| `--zen-bg` | `#0A0F0D` | Page background (Dark green-tinted) |
| `--zen-bg-card` | `#111916` | Cards, surfaces |
| `--zen-bg-muted` | `#1A2420` | Subtle sections |
| `--zen-border` | `#2D3B35` | Borders |
| `--zen-text` | `#F0FDF4` | Primary text |
| `--zen-text-secondary` | `#A7F3D0` | Secondary text |
| `--zen-text-muted` | `#6EE7B7` | Muted text |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--zen-success` | `#10B981` | Success states |
| `--zen-warning` | `#F59E0B` | Warnings |
| `--zen-error` | `#EF4444` | Errors |
| `--zen-info` | `#3B82F6` | Information |

### Chart Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--chart-focus` | `#10B981` | Focus time |
| `--chart-break` | `#6EE7B7` | Break time |
| `--chart-streak` | `#059669` | Streaks |
| `--chart-goal` | `#34D399` | Goals |

---

## Typography

### Font Stack

```
Primary: "Plus Jakarta Sans", system-ui, sans-serif
Mono: "JetBrains Mono", monospace
```

### Scale (Mobile First)

| Class | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `.zen-h1` | 48px/3rem | 700 | 1.1 | Hero headlines |
| `.zen-h2` | 36px/2.25rem | 600 | 1.2 | Section titles |
| `.zen-h3` | 24px/1.5rem | 600 | 1.3 | Card titles |
| `.zen-h4` | 20px/1.25rem | 500 | 1.4 | Subsections |
| `.zen-body` | 16px/1rem | 400 | 1.6 | Body text |
| `.zen-body-lg` | 18px/1.125rem | 400 | 1.7 | Lead paragraphs |
| `.zen-small` | 14px/0.875rem | 400 | 1.5 | Captions, labels |
| `.zen-tiny` | 12px/0.75rem | 500 | 1.4 | Tags, badges |

### Typography Rules
- Use sentence case for headings
- Avoid ALL CAPS except for tiny labels/badges
- Keep line length under 75 characters for readability
- Use proper letter-spacing for headings (-0.02em)

---

## Spacing System

Based on 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Minimal gaps |
| `--space-2` | 8px | Tight spacing |
| `--space-3` | 12px | Small gaps |
| `--space-4` | 16px | Default padding |
| `--space-5` | 20px | Medium gaps |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Large gaps |
| `--space-10` | 40px | Extra large |
| `--space-12` | 48px | Section margins |
| `--space-16` | 64px | Major sections |
| `--space-20` | 80px | Hero sections |
| `--space-24` | 96px | Page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Small elements, badges |
| `--radius-md` | 12px | Buttons, inputs |
| `--radius-lg` | 16px | Cards, panels |
| `--radius-xl` | 20px | Large cards |
| `--radius-2xl` | 24px | Hero sections |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

**Light Mode:**
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
--shadow-glow: 0 0 20px rgba(16, 185, 129, 0.15);
```

**Dark Mode:**
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
--shadow-glow: 0 0 30px rgba(52, 211, 153, 0.2);
```

---

## Animation Guidelines

### Timing Functions

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
```

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Micro-interactions |
| `--duration-normal` | 250ms | Standard transitions |
| `--duration-slow` | 400ms | Complex animations |
| `--duration-slower` | 600ms | Page transitions |

### Animation Principles
1. **Subtle is key** – Never distract from content
2. **Purposeful motion** – Every animation should have meaning
3. **Natural easing** – Use smooth, organic curves
4. **Breathing animations** – For focus/meditation elements
5. **No jarring movements** – Maintain calm atmosphere

---

## Component Guidelines

### Cards
```css
.zen-card {
  background: var(--zen-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--zen-border-light);
}
```

### Buttons

**Primary:**
```css
.zen-btn-primary {
  background: var(--zen-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--duration-normal) var(--ease-smooth);
}
.zen-btn-primary:hover {
  background: var(--zen-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}
```

**Secondary/Ghost:**
```css
.zen-btn-ghost {
  background: transparent;
  color: var(--zen-text);
  border: 1px solid var(--zen-border);
}
.zen-btn-ghost:hover {
  background: var(--zen-bg-muted);
  border-color: var(--zen-primary-light);
}
```

### Inputs
```css
.zen-input {
  background: var(--zen-bg-card);
  border: 1px solid var(--zen-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  transition: all var(--duration-fast) var(--ease-smooth);
}
.zen-input:focus {
  border-color: var(--zen-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
```

---

## Layout Rules

### Container Widths
| Token | Value | Usage |
|-------|-------|-------|
| `--container-sm` | 640px | Narrow content |
| `--container-md` | 768px | Medium content |
| `--container-lg` | 1024px | Standard content |
| `--container-xl` | 1280px | Wide content |
| `--container-2xl` | 1440px | Full layouts |

### Section Padding
- **Mobile:** 24px horizontal, 48px vertical
- **Tablet:** 32px horizontal, 64px vertical  
- **Desktop:** 48px horizontal, 96px vertical

---

## Icon Guidelines

**Library:** Lucide React (already installed)

**Icon Sizes:**
| Size | Value | Usage |
|------|-------|-------|
| `sm` | 16px | Inline, buttons |
| `md` | 20px | Default |
| `lg` | 24px | Headers, navigation |
| `xl` | 32px | Features, empty states |

**Icon Styling:**
- Use `stroke-width: 1.5` for thinner, calmer look
- Match icon color to text hierarchy
- Add subtle transitions on hover

---

## Accessibility

1. **Color Contrast:** Minimum 4.5:1 for text
2. **Focus States:** Visible and consistent ring
3. **Motion:** Respect `prefers-reduced-motion`
4. **Semantic HTML:** Proper heading hierarchy
5. **ARIA Labels:** For all interactive elements

---

## File Structure

```
zenflow/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── focus/
│   │   ├── analytics/
│   │   └── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx (Landing Page)
├── components/
│   ├── ui/          # shadcn components
│   ├── layout/      # Header, Sidebar, Footer
│   ├── landing/     # Landing page sections
│   ├── dashboard/   # Dashboard components
│   ├── focus/       # Focus timer components
│   └── shared/      # Shared components
├── lib/
│   ├── firebase/    # Firebase config & utils
│   ├── hooks/       # Custom hooks
│   ├── stores/      # Zustand stores
│   ├── utils/       # Utility functions
│   └── constants/   # App constants
├── public/
│   ├── images/
│   └── icons/
└── types/           # TypeScript types
```

---

## Do's and Don'ts

### ✅ Do
- Use generous whitespace
- Keep interactions smooth and calm
- Use soft, rounded corners
- Apply subtle shadows
- Maintain visual hierarchy
- Use the mint green palette consistently
- Add breathing animations for focus elements

### ❌ Don't
- Use harsh colors or high contrast
- Add distracting animations
- Use sharp corners on cards
- Overcrowd the interface
- Use multiple competing accent colors
- Add unnecessary decorative elements
- Use dark shadows in light mode

---

## Performance

1. **Images:** Use Next.js Image component with WebP
2. **Fonts:** Subset and preload critical fonts
3. **Animations:** Use CSS transforms, avoid layout shifts
4. **Code Splitting:** Lazy load non-critical components
5. **Bundle Size:** Keep initial JS under 100KB

---

## SEO & Meta

```tsx
// Default metadata template
export const metadata = {
  title: 'ZenFlow – Digital Detox & Focus Tracker',
  description: 'Focus deeply. Work calmly. ZenFlow helps you reduce distractions, track productive hours, and maintain healthy focus habits.',
  keywords: ['focus timer', 'pomodoro', 'productivity', 'digital detox', 'deep work'],
  openGraph: {
    title: 'ZenFlow',
    description: 'Focus deeply. Work calmly.',
    type: 'website',
  },
}
```
