```markdown
# Design System Specification: The Obsidian Pulse

## 1. Overview & Creative North Star: "The Ethereal Command"
This design system moves away from the "flat social app" archetype and toward a high-end, immersive digital environment. Our Creative North Star is **"The Ethereal Command"**—a philosophy that treats the UI not as a flat surface, but as a deep, luminous void where data floats in physical layers of light and glass.

To break the "template" look, we reject the rigid, boxed-in grid. We embrace **intentional asymmetry** (e.g., placing status indicators off-center), **overlapping glass panels**, and a **radical typography scale** that pits massive, technical display type against ultra-refined, legible body copy. This is an editorial approach to communication: every message is a piece of content, and every interface element is a precision tool.

---

## 2. Colors: Depth through Obsidian & Neon
Our palette is rooted in the "Obsidian" depths (`surface`) and punctuated by "Pulse" accents (`primary`, `secondary`).

### The "No-Line" Rule
**Explicit Instruction:** Prohibit 1px solid, opaque borders for sectioning. Structural boundaries must be defined solely through background color shifts. For example, a chat sidebar (`surface-container-low`) should sit against the main message thread (`surface`) without a stroke. The eye should perceive depth through tonal change, not wireframes.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, semi-transparent sheets. 
- **Base Layer:** `surface` (#0d0e17) – The infinite background.
- **Structural Sections:** `surface-container-low` (#12131d) – For sidebars and navigation backgrounds.
- **Interactive Elements:** `surface-container-high` (#1d1f2b) – For inactive message bubbles or hovered states.
- **Floating Prompts:** `surface-container-highest` (#242532) – For context menus and modals.

### The "Glass & Gradient" Rule
To achieve a "signature" feel, primary actions and active states must utilize gradients.
- **The Signature Gradient:** Transition from `primary` (#81ecff) to `secondary` (#c47fff) at a 135° angle. Use this for main CTAs and "Sent" message bubbles.
- **Glassmorphism:** For floating overlays (e.g., the message input bar), use `surface-variant` with 40% opacity and a `20px` backdrop-blur. This allows the neon "glow" of underlying messages to bleed through, creating "visual soul."

---

## 3. Typography: Technical Precision
We utilize two distinct typefaces to balance futuristic technicality with human readability.

*   **Display & Headlines:** `Space Grotesk`. A sans-serif with idiosyncratic, technical details. Use `display-lg` (3.5rem) for onboarding and `headline-sm` (1.5rem) for chat headers to establish an authoritative, editorial voice.
*   **Body & Labels:** `Manrope`. A highly legible, modern geometric sans. Use `body-lg` (1rem) for the primary chat experience and `label-sm` (0.6875rem) for timestamps.

**The Hierarchy Rule:** Never use bold for body text. Instead, use color shifts (e.g., `on-surface` for primary text vs. `on-surface-variant` for secondary details) to create hierarchy without adding visual weight.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We use "Ambient Light" to define elevation.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a "recessed" look, making the content feel carved into the interface.
*   **Ambient Shadows:** When a panel must float (e.g., a profile popover), use a shadow color tinted with `primary` (#81ecff) at 5% opacity, with a `48px` blur. This simulates the glow of neon lights in a dark room.
*   **The "Ghost Border":** If accessibility requires a container edge, use the `outline-variant` token at 15% opacity. It should be felt, not seen.

---

## 5. Components: Precision Instruments

### Message Bubbles (The Core Component)
- **Incoming:** `surface-container-high` background, `md` corner radius. No border.
- **Outgoing:** Signature Gradient (`primary` to `secondary`), `md` corner radius.
- **The Polish:** Apply a subtle 0.5px "Ghost Border" to the top and left edges only, using `primary_fixed_dim` at 20% opacity to simulate a light catch on the "glass."

### Buttons
- **Primary:** Full `primary` (#81ecff) fill with `on-primary` (#005762) text. `sm` corner radius for a sharper, more technical look.
- **Glass Action:** `surface-variant` at 20% opacity with a heavy backdrop-blur. Used for secondary tools within the chat bar.

### Input Fields
- **The "Invisible" Input:** No background fill. Defined by a bottom "Ghost Border" that expands into a full-width `primary` gradient line upon focus. Helper text uses `label-md` in `on-surface-variant`.

### Cards & Lists
- **The Divider Rule:** Forbid divider lines. Separate list items (e.g., chat history) using 16px of vertical white space and a subtle background hover state shift to `surface-bright`.

---

## 6. Do’s and Don’ts

### Do:
- **Use "Vapor Shadows":** Use very soft, large-radius glows in the `secondary` color behind key interface elements to suggest a neon light source.
- **Embrace Negative Space:** Let the `surface` color breathe. High-end design is defined by what you leave out.
- **Use Micro-Interactions:** When a message is sent, the "Ghost Border" should briefly pulse with `primary` light.

### Don't:
- **No Pure White:** Never use #FFFFFF. Always use `on-background` (#f1effd) to maintain the deep, cinematic tone.
- **No Harsh Outlines:** Avoid 100% opaque borders. They flatten the design and break the "Glassmorphism" illusion.
- **No Standard Emojis:** If possible, use minimalist, monochromatic iconography to maintain the futuristic aesthetic. Standard yellow emojis should be softened with a 10% opacity overlay to blend into the dark mode.

---

## 7. Signature Elements
*   **The "Pulse" Indicator:** Instead of a green dot for "Online," use a 2px `primary` glow that softly breathes (opacity 40% to 100%).
*   **Blurred Background Orbs:** Place large, low-opacity (5%) spheres of `secondary_dim` (#a533ff) in the far background of the app to provide depth and movement.```