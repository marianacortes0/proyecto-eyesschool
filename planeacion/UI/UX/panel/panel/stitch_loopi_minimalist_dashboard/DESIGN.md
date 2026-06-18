---
name: Luminous Ed-Tech System
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
  on-surface-variant: '#4a4455'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#8f1e62'
  on-tertiary: '#ffffff'
  tertiary-container: '#ae397b'
  on-tertiary-container: '#ffdce9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffd8e7'
  tertiary-fixed-dim: '#ffafd3'
  on-tertiary-fixed: '#3d0026'
  on-tertiary-fixed-variant: '#85145a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  neon-purple: '#A855F7'
  electric-teal: '#2DD4BF'
  surface-bg: '#F8FAFC'
  glass-stroke: rgba(255, 255, 255, 0.4)
  chart-glow-teal: rgba(45, 212, 191, 0.2)
  chart-glow-purple: rgba(124, 58, 237, 0.2)
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style
The design system is defined by a "Digital Minimalist" aesthetic. It balances the high-energy vibrancy of neon purples and teals with the structured, calm atmosphere required for educational management. The goal is to reduce cognitive load while providing a high-fidelity, forward-thinking user experience.

The style leverages **Minimalism** as its core framework—prioritizing heavy whitespace and functional clarity—while incorporating **Glassmorphism** and subtle **Neon accents** to create a sense of depth and modern sophistication. This approach ensures that data-heavy educational dashboards feel open and approachable rather than cluttered.

## Colors
The palette uses a deep **Primary Purple** for brand identity and interactive elements, paired with a vibrant **Secondary Teal** for success states and progress indicators. 

- **Primary & Secondary:** These should be used for call-to-actions and key data points. 
- **Neon Accents:** Reserved for small-scale visual interest, such as chart glow effects, active navigation pips, or status pips.
- **Backgrounds:** The interface utilizes a very light "Surface-BG" (`#F8FAFC`) to ensure that white cards pop with subtle elevation.
- **Charts:** Use gradients transitioning from `electric-teal` to `primary-color` to create a modern, data-rich feel.

## Typography
The typography system is engineered for **high information density**. 

- **Hanken Grotesk** is used for headings to provide a sharp, contemporary "tech" feel. 
- **Inter** is utilized for all body copy and UI labels due to its exceptional legibility at small sizes.
- To maintain a "clean" look despite high data density, we utilize slightly smaller font sizes (13px/14px for body) with generous line-heights to prevent the text from feeling cramped.
- **Labels** often use uppercase with slight letter spacing to differentiate metadata from primary content.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure for desktop. 

- **Density:** Despite the "minimalist" goal, the 4px base unit allows for precision in data tables and management views.
- **Whitespace:** Cards should be separated by 24px gutters to allow the "less is more" philosophy to breathe. 
- **Alignment:** All elements should align to the 4px baseline. Dashboard widgets should use consistent padding (typically 24px or 32px) to maintain a cohesive internal rhythm.

## Elevation & Depth
This design system avoids heavy shadows. Instead, it uses **Ambient Tonal Layers** and **Low-Contrast Outlines**.

- **Cards:** White backgrounds with a 1px border of `#E2E8F0` and a very soft, diffused shadow (`0 4px 20px rgba(0,0,0,0.03)`).
- **Glassmorphism:** For overlays, modals, or side navigation, use a backdrop blur (12px to 20px) with a semi-transparent white fill and a thin "glass-stroke" border to create a premium, layered feel.
- **Active States:** Elements being interacted with may gain a subtle outer glow using the `chart-glow-purple` or `chart-glow-teal` colors to simulate light emitting from the screen.

## Shapes
The shape language is **Soft and Approachable**. 

- **Standard UI (Buttons, Inputs, Cards):** Use a 0.5rem (8px) radius. This provides a modern, friendly look without being overly "bubbly."
- **Large Components:** Hero sections or large dashboard containers use 1rem (16px).
- **Progress Bars:** Should be fully rounded (pill-shaped) to distinguish them from structural containers.

## Components
- **Buttons:** Primary buttons use a solid gradient from `primary_color_hex` to `neon-purple`. Text is white. Secondary buttons use a "Ghost" style with a thin border and primary-colored text.
- **Cards:** Essential for the educational dashboard. Every card must have a consistent 24px internal padding. Headers within cards should use `label-sm` for categorization.
- **Charts:** 
    - **Line Charts:** Use a 3px stroke width with a subtle drop-shadow (glow) of the same color. The area under the line should have a very soft gradient fade (10% opacity).
    - **Bar Charts:** Use rounded tops (2px-4px radius) rather than sharp corners.
- **Input Fields:** Minimalist design with only a bottom border or a very light 4-sided border. On focus, the border transitions to `primary_color_hex` with a subtle glow.
- **Icons:** Use thin-stroke (1.5pt) linear icons. Avoid filled icons unless indicating an "active" state in the navigation.
- **Navigation:** A slim left-hand sidebar using a glassmorphic background to keep the interface feeling light and airy.