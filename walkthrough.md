# Walkthrough: Marketing Landing Page Enhancements

I have implemented the **Pricing** and **About** sections with modern motion animations as requested.

## Changes

### 1. New Components
- **`src/lib/components/marketing/Pricing.svelte`**:
    - Displays "Free" and "Premium" (Infaq) plans.
    - Features a "Recommended" highlight for the Premium plan with a gradient border.
    - Cards animate in (fly up) when scrolled into view.
- **`src/lib/components/marketing/About.svelte`**:
    - Explains the "Disconnect" problem and the "AI Coach" solution.
    - Uses a split layout (Text + Visual).
    - Elements slide in from sides when scrolled into view.

### 2. Animation Logic
- **`src/lib/actions/inview.ts`**:
    - A reusable Svelte Action that uses `IntersectionObserver`.
    - Dispatches `enter` and `leave` events when an element enters the viewport.
    - Used to trigger Svelte's built-in `fly` and `fade` transitions.

### 3. Page Integration
- Updated **`src/routes/(marketing)/+page.svelte`**:
    - Imported and added `<About />` and `<Pricing />` sections below the Hero.
    - Maintained the existing "Feature Highlights" section.

## Verification
- **Visuals**: The sections use Tailwind CSS for styling, matching the "clean" and "modern" aesthetic.
- **Motion**: Elements are hidden initially and animate in when the user scrolls down.
- **Responsiveness**: Layouts stack correctly on mobile devices.

## Next Steps
- Add actual images/illustrations to the About section (currently using CSS placeholders).
- Connect the "Get Started" buttons to the actual registration flow.
