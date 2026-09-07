# Prototype Instructions

Design preference: Keep the site primarily conventional, with at most one purposeful 3D feature that helps explain the product or adds practical value. The selected element is a tablet modeled in Blender from the user's reference photo, with a separate screen that supports images and videos in Three.js. Keep the black bezel, graphite back and buttons faithful to the reference, but remove both front and rear cameras, including the rear camera module and flash. Include the tablet on the main page as well as the dedicated demo. Dimensions without measurements are approximate.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Tablet interaction: Prioritize mobile layout and touch targets. Allow continuous horizontal and vertical drag rotation with touch or mouse, retaining the chosen angle, but keep the vertical axis stable: no trackball roll or circular-gesture tumbling. Mouse wheel scrolls the page instead of rotating or zooming the tablet. Use a single reset-position control that returns to a straight frontal view. The tablet should fill almost all its available viewing area on both pages, especially desktop, with minimal empty margins.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

Provide a very small, understated rotation icon beside reset on both viewers: tiny flat center dot and arrows, no large joystick styling. Align all four arrows symmetrically inside the circle using consistent vector shapes. Keep a comfortable invisible touch target. The homepage demo CTA should be prominent, with the Portuguese wording “Veja como ficaria a sua marca”.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
