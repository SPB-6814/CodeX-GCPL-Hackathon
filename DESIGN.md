---
name: SportWell Design System
colors:
  surface: '#f5fafb'
  surface-dim: '#d5dbdc'
  surface-bright: '#f5fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5f5'
  surface-container: '#e9eff0'
  surface-container-high: '#e4e9ea'
  surface-container-highest: '#dee3e4'
  on-surface: '#171d1e'
  on-surface-variant: '#3c494a'
  inverse-surface: '#2b3132'
  inverse-on-surface: '#ecf2f3'
  outline: '#6c7a7b'
  outline-variant: '#bbc9ca'
  surface-tint: '#006970'
  primary: '#006970'
  on-primary: '#ffffff'
  primary-container: '#1dc0cc'
  on-primary-container: '#00494f'
  inverse-primary: '#49d9e5'
  secondary: '#38656a'
  on-secondary: '#ffffff'
  secondary-container: '#b9e8ed'
  on-secondary-container: '#3c6a6e'
  tertiary: '#964906'
  on-tertiary: '#ffffff'
  tertiary-container: '#f89652'
  on-tertiary-container: '#6b3100'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7ef4ff'
  primary-fixed-dim: '#49d9e5'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f55'
  secondary-fixed: '#bcebf0'
  secondary-fixed-dim: '#a0cfd4'
  on-secondary-fixed: '#002023'
  on-secondary-fixed-variant: '#1e4d52'
  tertiary-fixed: '#ffdbc7'
  tertiary-fixed-dim: '#ffb688'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#733500'
  background: '#f5fafb'
  on-background: '#171d1e'
  surface-variant: '#dee3e4'
typography:
  display-score:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

The brand identity centers on "Active Serenity"—the intersection of physical performance and mental recovery. The design system prioritizes a restorative user experience that reduces cognitive load through a **Minimalist-Modern** aesthetic. It aims to evoke a sense of professional competence mixed with empathetic care. 

The visual language avoids the aggressive "hustle culture" tropes of traditional fitness apps, opting instead for an airy, breathable interface that mirrors the physiological state of deep focus. Key characteristics include high-quality whitespace, a vibrant yet organic palette, and soft, tactile interactions that make health tracking feel like a meditative practice rather than a chore.

## Colors

The palette is rooted in nature-inspired tones to facilitate focus and physiological recovery, now updated with a more crystalline and refreshing energy.

*   **Primary (Crystalline Teal):** Used for primary actions, the WellScore™ high-performance state, and key brand moments. It provides a crisp, energetic, and professional anchor.
*   **Secondary (Muted Slate):** Utilized for growth indicators, recovery recommendations, and secondary interactive elements. It has a cooler, more balanced tone than traditional greens.
*   **Neutral (Ash Gray):** Provides soft contrast for typography and iconography, using cooler undertones to maintain a calming atmosphere without the harshness of pure black.
*   **Surface & Background:** A clean, cool-tinted off-white base reduces eye strain while allowing the vibrant primary and secondary tones to define the hierarchy. The tertiary soft sunset is used sparingly for special alerts or energetic milestones.

## Typography

This design system utilizes **Manrope** for its exceptional balance of geometric modernity and humanist warmth. It remains highly legible at small sizes (crucial for assessment labels) while appearing premium and refined in large headlines.

- **Display Score:** Specifically for the WellScore™ numerical value.
- **Headlines:** Use Medium or Semi-Bold weights to establish hierarchy without overwhelming the page.
- **Body Text:** Generous line-heights are maintained to ensure an "airy" feel and improve readability during post-workout recovery sessions.
- **Letter Spacing:** Slightly tightened on large displays for a contemporary look, and slightly opened on labels for clarity.

## Layout & Spacing

The layout utilizes a **fluid grid** with an emphasis on "negative space as a feature." 

- **Mobile:** 4-column grid with 20px side margins. 
- **Desktop/Tablet:** 12-column centered grid with a maximum content width of 1140px.
- **Rhythm:** An 8px linear scale drives all padding and margin decisions. 
- **Vertical Rhythm:** Sections are separated by `lg` (40px) or `xl` (64px) spacing to prevent the UI from feeling cluttered, encouraging a focused, one-step-at-a-time user flow during assessments.

## Elevation & Depth

To maintain a calming and light aesthetic, this design system moves away from heavy shadows in favor of **Tonal Layers** and **Ambient Depth**.

- **Level 0 (Base):** The main background surface.
- **Level 1 (Cards/Containers):** Uses a very subtle, extra-diffused shadow (Y: 4px, Blur: 20px, Color: Primary with 5% opacity) to create a gentle "lift" without appearing disconnected.
- **Level 2 (Active/Floating):** Higher elevation used for active pickers or modal sheets, employing a dual-shadow approach (one sharp 2px shadow for definition and one soft 30px shadow for depth).
- **Glassmorphism:** Navigation bars use a high-saturation backdrop blur (20px) with a semi-transparent white tint to maintain context of the content scrolling beneath them.

## Shapes

The shape language is consistently **Rounded**, avoiding sharp edges to reinforce the "soft" and "approachable" brand pillars. 

- **Standard Elements (Buttons/Inputs):** 0.5rem (8px) radius.
- **Content Cards:** 1rem (16px) radius to create a distinct, nested feel.
- **WellScore™ Visualization:** Circular or continuous-curve paths.
- **Slider Thumbs:** Fully pill-shaped (rounded-full) to provide a friendly, tactile touch target.

## Components

### WellScore™ Visualization
A custom circular progress component. The "track" is a light Ash-Gray, while the "progress" uses a Crystalline Teal gradient. The score is centered in `display-score` typography. Surround the score with ample whitespace to signify its importance.

### Recommendation Cards
Cards should use the Level 1 elevation. They feature a Muted Slate accent border (2px) on the left side to categorize "Recovery" content. Images within cards must use a 12px corner radius.

### Assessment Controls
- **Sliders:** Use a thick track (8px) in Soft Sunset or Neutral Gray with a Crystalline Teal thumb. The thumb should be oversized (24x24px) for ease of use.
- **Pickers:** Segmented controls with a "sliding pill" background that transitions smoothly between states.

### Buttons
- **Primary:** Filled Crystalline Teal with white text.
- **Secondary:** Outlined in Crystalline Teal with a subtle 5% fill on hover.
- **All buttons:** Minimum height of 48px to ensure accessibility for users who may have post-exercise fatigue or reduced dexterity.

### Input Fields
Ash Gray borders (1px) that transition to Muted Slate or Crystalline Teal on focus. Labels always sit above the field in `label-sm` to maintain a structured, clean look.