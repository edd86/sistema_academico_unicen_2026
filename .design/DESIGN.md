---
name: Academic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4059aa'
  on-secondary: '#ffffff'
  secondary-container: '#8fa7fe'
  on-secondary-container: '#1d3989'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00174b'
  on-tertiary-container: '#497cff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#264191'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  data-tabular:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style

This design system establishes an institutional, developer-grade academic operating environment engineered for high-density scholarly workflows, registrar operations, and faculty portals. Blending institutional authority with the structured ergonomics of modern administrative SaaS platforms, the interface communicates rigor, clarity, and structural precision.

The visual direction rejects superficial decoration in favor of a functional, razor-sharp architectural layout. Information hierarchy is governed by strict Cartesian alignment, crisp 1px borders, compact data visualization modules, and deliberate whitespace. The emotional response evoked is one of absolute institutional trust, operational velocity, and cognitive calm amidst dense administrative records and curricular architectures.

## Colors

The color architecture is built around deep institutional slates, architectural navies, and functional neutrals designed for extended high-focus computer usage:

- **Primary (`#0f172a`)**: Deep slate acting as the primary anchor for headers, active structural tabs, dominant action states, and high-priority chrome.
- **Secondary (`#1e3a8a`)**: Traditional academic navy blue deployed for institutional branding, secondary controls, selected navigation categories, and contextual grouping.
- **Tertiary / Accent (`#2563eb`)**: High-precision royal blue reserved for active interactive targets, keyboard focus rings, active links, and data visualization highlights.
- **Neutral Palette**: 
  - Canvas & Paper: Pristine White (`#ffffff`), Warm Surface (`#f8fafc`), Sub-layer Neutral (`#f1f5f9`).
  - Borders & Dividers: Structural Border (`#e2e8f0`), High-Contrast Border (`#cbd5e1`).
  - Text Hierarchy: Primary Ink Slate (`#0f172a`), Secondary Body (`#334155`), Muted Metadata (`#64748b`).
- **Semantic Accents**:
  - Success: `#059669` (Surface tint: `#ecfdf5`, Border: `#a7f3d0`)
  - Warning: `#d97706` (Surface tint: `#fffbeb`, Border: `#fde68a`)
  - Critical / Error: `#dc2626` (Surface tint: `#fef2f2`, Border: `#fecaca`)

Background surfaces are predominantly `#f8fafc` with content panels rendered in pure `#ffffff`, separated by `#e2e8f0` gridlines to maintain crisp visual segmentation.

## Typography

The typographic system pairs the structural, geometric presence of **Hanken Grotesk** for display and section titling with the precision engineering of **Geist** for body text, data representations, form interfaces, and telemetry.

- **Headlines & Titles**: Rendered in Hanken Grotesk with negative tracking (`-0.01em` to `-0.03em`) to deliver an authoritative, architectural cadence. Weights are tightly restricted to Medium (500), SemiBold (600), and Bold (700).
- **Body & Controls**: Rendered in Geist, chosen for its monoline clarity, open apertures, and exceptional legibility when rendering dense tabular datasets, student IDs, grading rubrics, and technical transcripts.
- **Tabular Figures**: All data-centric interfaces enforce `font-variant-numeric: tabular-nums` to ensure exact column alignment across financial statements, grade point averages, and course section registers.

## Layout & Spacing

The layout philosophy follows a disciplined Cartesian grid with strict 4px/8px incremental steps, maximizing screen real estate for complex academic tasks without inducing visual fatigue.

- **Grid Architecture**: 
  - Desktop: 12-column responsive layout with `1.5rem` (`24px`) gutters and `2rem` (`32px`) exterior page margins.
  - Tablet: 8-column layout with `1rem` (`16px`) gutters and `1.5rem` (`24px`) margins.
  - Mobile: 4-column layout with `0.75rem` (`12px`) gutters and `1rem` (`16px`) canvas margins.
- **Rhythm**: Compact components make regular use of `space-xs` (4px) and `space-sm` (8px) for internal padding to maintain information density, while `space-lg` (16px) and `space-xl` (24px) establish clean section separations.
- **Dense Data Panels**: Academic tables and metric cards employ tightly bounded vertical spacing (row height fixed at 36px or 44px) to present deep catalogs of course sections and grade records within unified viewports.

## Elevation & Depth

This design system avoids decorative blurred drop shadows in favor of a **border-defined, low-elevation plane model**:

- **Borders over Shadows**: Spatial hierarchy is primarily articulated by 1px solid boundaries (`#e2e8f0` for resting cards and dividers; `#cbd5e1` for floating elements and headers).
- **Surface Layering**: The primary foundation rests on `#f8fafc`. Floating containers, tables, and functional cards elevate using pure `#ffffff`. Secondary embedded segments (such as table headers and disabled zones) step back to `#f1f5f9`.
- **Micro-Shadows**: When elevation is strictly required for temporal surfaces:
  - **Resting Cards**: `0 1px 2px 0 rgba(15, 23, 42, 0.04)` combined with a 1px `#e2e8f0` border.
  - **Dropdown Menus & Popovers**: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)` with a 1px `#cbd5e1` border.
  - **Modal Dialogs**: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)` paired with an institutional backdrop scrim of `rgba(15, 23, 42, 0.45)` featuring a subtle `backdrop-filter: blur(2px)`.

## Shapes

In strict alignment with the precision developer-grade visual identity, the shape language uses a **roundedness of 0 (Sharp)**:

- **Zero Radius Principle**: Every interactive container, card, modal, badge, button, and input field is styled with `border-radius: 0px`. 
- **Architectural Edge**: The uncompromising 90-degree corners eliminate unnecessary organic softness, reinforcing the feel of a high-reliability technical terminal and rigorous institutional record system.
- **Visual Rhythm**: Visual separation is established cleanly through intersecting 1px stroke lines, intentional background value changes, and monoline iconography rather than rounded boundary silhouettes.

## Components

### Buttons
- **Primary**: Solid `#0f172a` background, `#ffffff` text, 0px radius, 1px `#0f172a` border. Height: 36px (compact) or 40px (default). Hover: `#1e293b`. Active: `#020617`.
- **Secondary**: `#ffffff` background, `#0f172a` text, 1px `#e2e8f0` border. Hover: `#f8fafc` background with `#cbd5e1` border.
- **Institutional Blue**: `#1e3a8a` background, `#ffffff` text, hover: `#1d4ed8`.
- **Destructive**: `#ffffff` background, `#dc2626` text, 1px `#fecaca` border. Hover: `#fef2f2` background with `#dc2626` border.
- **Focus State**: `outline: 2px solid #2563eb`, `outline-offset: 2px`.

### Badges & Status Chips
- Rendered with 0px radius, uppercase or capitalized 11px label font (`label-sm`), 1px solid border, and subtle tinted fills:
  - *Regular / Neutral*: Background `#f1f5f9`, text `#334155`, border `#e2e8f0`.
  - *Active / Matriculado*: Background `#ecfdf5`, text `#065f46`, border `#a7f3d0`.
  - *Pendiente / Advertencia*: Background `#fffbeb`, text `#92400e`, border `#fde68a`.
  - *Reprobado / Inactivo*: Background `#fef2f2`, text `#991b1b`, border `#fecaca`.

### Input Fields & Selects
- 36px default height. Background: `#ffffff`. Border: 1px solid `#e2e8f0`. Text: `#0f172a` (placeholder: `#94a3b8`).
- Inner horizontal padding: `0.75rem` (`12px`).
- Focus state: Border transitions to `#2563eb` with an immediate box-shadow ring: `0 0 0 1px #2563eb`. Zero roundedness.

### Data Tables
- The core of the institutional interface:
  - **Header Row**: 36px height, background `#f8fafc`, bottom border 1px solid `#cbd5e1`. Typography: 11px uppercase `Geist`, weight 600, color `#475569`.
  - **Data Rows**: 40px height, alternating hover background `#f8fafc`, bottom border 1px solid `#e2e8f0`. Tabular figures aligned right for numeric grades/credits, left for course code and titles.
  - **Cell Padding**: `0.5rem 0.75rem`.

### Cards & Metric Displays
- Background: `#ffffff`. Border: 1px solid `#e2e8f0`.
- Metric Cards feature a subtle 2px top accent line (using `#1e3a8a` or `#0f172a`), a muted label in `label-sm` (`#64748b`), followed by a high-impact tabular KPI figure in `Hanken Grotesk` Bold 24px.

### Modals & Dialogs
- Strictly squared windows with 1px solid `#cbd5e1` borders.
- Modal header is partitioned with a bottom border 1px `#e2e8f0` and an explicit title bar.
- Footer actions are aligned to the right with an explicit 1px `#e2e8f0` top separator.