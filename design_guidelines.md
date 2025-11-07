# DarkTrack Design Guidelines

## Design Approach
**System-Based Approach**: Drawing from modern security/monitoring dashboards (Linear, Datadog, Grafana) adapted for cybersecurity context. The design prioritizes clarity, trust, and efficient information delivery in a dark environment.

## Core Design Principles
1. **Trust Through Clarity**: Clean layouts with obvious information hierarchy
2. **Dark by Default**: Professional dark theme reducing eye strain during security analysis
3. **Data-First**: Metrics and findings take visual priority over decorative elements
4. **Purposeful Accent**: Neon blue used strategically for actionable items and critical alerts

---

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - body text, UI elements
- Monospace: JetBrains Mono - data values, breach counts, technical details

**Hierarchy**:
- Hero/Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Captions/Meta: text-sm text-gray-400 (14px)
- Metric Values: text-3xl font-bold font-mono (30px)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16**
- Component padding: p-6, p-8
- Section spacing: gap-6, gap-8
- Page margins: mx-8, mx-12
- Vertical rhythm: space-y-8, space-y-12

**Grid Structure**:
- Login Page: Centered single-column layout, max-w-md
- Dashboard: 12-column grid with sidebar navigation
- Metric Cards: Grid of 2-4 columns (responsive)

**Container Widths**:
- Full dashboard: max-w-7xl mx-auto
- Content sections: max-w-6xl
- Forms/focused content: max-w-md

---

## Component Library

### Authentication (Login/Signup Page)

**Layout**: Centered card on dark background with subtle grid pattern

**Card Structure**:
- White/light card (contrasts with dark background)
- Padding: p-8
- Border radius: rounded-xl
- Width: max-w-md
- Shadow: Soft elevation

**Elements**:
- Logo/App name at top (DarkTrack with shield icon from Heroicons)
- Heading: "Secure Your Digital Footprint"
- Subheading: Brief description of purpose
- Social login buttons stacked vertically with provider logos
- Divider with "or" text
- Email/password fields (if applicable)
- Footer: Privacy disclaimer link

**Social Buttons**:
- Full width with provider icon (left) + text (center)
- Height: h-12
- Gap between buttons: space-y-3
- Border: Subtle outline
- Hover: Slight background change

### Dashboard Layout

**Sidebar Navigation** (Left - fixed):
- Width: w-64
- Dark background
- Logo at top with icon (p-6)
- Navigation items: p-4, rounded-lg, icon + text
- Active state: Neon blue background (bg-blue-600/20)
- User profile at bottom with logout option

**Main Content Area** (Right):
- Padding: p-8 to p-12
- Scrollable
- Background: Slightly lighter than sidebar

**Header Section**:
- User greeting: "Welcome back, [Name]"
- Last scan timestamp
- Quick action button: "Run New Scan" (neon blue, prominent)

### Metric Cards

**Grid Layout**: 
- Desktop: 4 columns (grid-cols-4)
- Tablet: 2 columns (md:grid-cols-2)
- Mobile: 1 column
- Gap: gap-6

**Card Design**:
- Dark background card (slightly lighter than page)
- Border: 1px subtle border
- Border radius: rounded-xl
- Padding: p-6
- Hover: Subtle border glow (neon blue)

**Card Content**:
- Icon at top (Heroicons - shield, globe, alert)
- Metric value: Large, bold, monospace (text-3xl)
- Label below value: text-sm, muted color
- Optional: Small trend indicator (↑ ↓ with percentage)

**Four Primary Metrics**:
1. Breaches Found (alert icon, red accent if >0)
2. Profiles Detected (globe icon)
3. Risk Score (shield icon, color-coded 0-100)
4. Secured Data % (check-shield icon, green accent)

### Data Visualization

**Risk Score Visualization**:
- Circular progress ring or horizontal progress bar
- Color coding:
  - 0-30: Green (low risk)
  - 31-60: Yellow/amber (medium)
  - 61-100: Red (high risk)
- Large percentage display in center
- Label: "Digital Safety Score"

**Charts** (using Chart.js):
- Dark theme configuration
- Neon blue primary color
- Grid lines: Subtle gray
- Tooltips: Dark with white text
- Types: Donut charts for data categories, line charts for trend over time

### Breach/Finding Cards

**List Layout**: Vertical stack with space-y-4

**Card Structure**:
- Padding: p-6
- Alert icon (left)
- Content (center): Breach name, date, affected data types
- Severity badge (right): Pill-shaped, color-coded
- Expandable: Click to show recommendations

**Severity Badges**:
- High: Red background, white text
- Medium: Amber background, dark text
- Low: Gray background, light text
- Padding: px-3 py-1, rounded-full, text-sm font-medium

### AI Recommendations Panel

**Layout**: Full-width card or sidebar panel

**Structure**:
- Heading: "AI Security Analysis"
- Icon: Sparkle/brain icon (Heroicons)
- Background: Slightly highlighted (subtle blue tint)
- Border: Neon blue accent on left edge (border-l-4)

**Content**:
- Paragraph summary of findings
- Bulleted action items
- Each action: Icon + text, hover state
- CTA button: "View Full Report" or "Apply Recommendations"

### Report Section

**Layout**: Full-width sectioned view

**Three-Column Summary**:
1. Data in Danger (red accent)
2. Potentially at Risk (amber accent)
3. Secured Data (green accent)

Each column shows:
- Icon at top
- Count/percentage
- List of items (truncated, expandable)

**Download Button**: 
- Position: Top right of report
- Icon + "Download PDF Report"
- Neon blue, prominent

### Navigation

**Top Navigation** (if not using sidebar):
- Horizontal bar with logo (left)
- Navigation links (center)
- User menu (right)
- Sticky on scroll

**Dashboard Sidebar Nav Items**:
- Dashboard (home icon)
- Scan History (clock icon)
- Settings (cog icon)
- Help (question icon)

---

## Color Strategy

**Note**: Specific color values will be defined later. Focus on semantic roles:

- **Page Background**: Darkest shade
- **Card/Panel Background**: Dark, but lighter than page
- **Sidebar**: Dark, distinct from main content
- **Text Primary**: High contrast light color
- **Text Secondary**: Muted/gray
- **Accent Primary**: Neon blue (CTAs, active states, important metrics)
- **Success/Secured**: Green tones
- **Warning/Risk**: Amber tones
- **Danger/Breach**: Red tones
- **Borders**: Subtle gray, blue on hover/focus

---

## Images

**Login Page Background**:
- Subtle animated grid pattern or cybersecurity-themed abstract background
- Dark with very low opacity geometric shapes
- No distracting imagery - background should be ambient

**Dashboard**:
- No hero images (utility-focused)
- Optional: Empty state illustrations when no data (simple line art, cybersecurity theme)
- User avatar in profile section (top-right or sidebar bottom)

**Icons**: Heroicons (outline style for navigation, solid for status indicators)

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px - Sidebar collapses to hamburger menu
- Tablet: 768px-1024px - 2-column metric grid
- Desktop: > 1024px - Full sidebar + multi-column layout

**Mobile Adaptations**:
- Sidebar becomes slide-out drawer
- Metric cards stack vertically
- Font sizes scale down slightly (text-3xl → text-2xl for metrics)
- Padding reduces (p-8 → p-4)

---

## Accessibility

- All interactive elements have focus states (neon blue ring)
- Form inputs have clear labels and error states
- Color coding supplemented with icons (never color alone)
- Minimum contrast ratio: 4.5:1 for text
- Keyboard navigation fully supported
- Screen reader labels for all icon-only buttons

---

## Special Considerations

**Loading States**:
- Skeleton loaders for metric cards (animated pulse)
- Spinner for scan in progress (neon blue)
- Progress bar for multi-step operations

**Empty States**:
- Centered message with icon
- Call to action: "Run your first scan"
- Simple illustration (optional)

**Disclaimer**:
- Small text at bottom of login page or dashboard footer
- "DarkTrack uses only public data sources and does not access private information"
- Link to privacy policy

**Error States**:
- Toast notifications (top-right)
- Inline form validation
- Error cards for failed API calls (red accent, retry button)