# Prototype Instructions

Design preference: Keep the site primarily conventional, with at most one purposeful 3D feature that helps explain the product or adds practical value. The selected element is a tablet modeled in Blender from the user's reference photo, with a separate screen that supports images and videos in Three.js. Keep the black bezel, graphite back and buttons faithful to the reference, but remove both front and rear cameras, including the rear camera module and flash. Include the tablet on the main page as well as the dedicated demo. Dimensions without measurements are approximate.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Tablet interaction: Prioritize mobile layout and touch targets. Allow continuous horizontal and vertical drag rotation with touch or mouse, retaining the chosen angle, but keep the vertical axis stable: no trackball roll or circular-gesture tumbling. Mouse wheel scrolls the page instead of rotating or zooming the tablet. Use a single reset-position control that returns to a straight frontal view. The tablet should fill almost all its available viewing area on both pages, especially desktop, with minimal empty margins.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

Provide a very small, understated rotation icon beside reset on both viewers: tiny flat center dot and arrows, no large joystick styling. Align all four arrows symmetrically inside the circle using consistent vector shapes. Keep a comfortable invisible touch target. The homepage demo CTA should be prominent, with the Portuguese wording “Veja como ficaria a sua marca”. Place it directly below the descriptive text in the left-hand brands column, outside the tablet card; keep it below the text on mobile as well.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Hosting is exclusively the existing Cloudflare Pages project `cartise`, connected to `linares222/cartise` on `main`, with public domains `cartise.pt` and `www.cartise.pt`. Build with `npm run build` and publish `dist/client`. Do not create, deploy or use ChatGPT Sites. The user explicitly requested removal of all legacy Sites files; do not restore them. The previous ChatGPT Site has had public access removed. Before publishing run the build and form/SEO tests.

SEO and commercial direction: Preserve the sober visual identity and the useful tablet demo. Explain digital advertising inside TVDE vehicles immediately; use dedicated PT/EN pages for solution, formats, coverage, fleets and contact. Keep fictional examples clearly labelled and distinguish studio settings from commercial specifications. Lisbon and Porto are currently active (confirmed by the user on 2026-09-07); other regions are enquiry-only. Metrics are available on enquiry: do not claim specific reporting capabilities or publish network results. Keep prices, targeting capabilities and fleet conditions subject to confirmation. Local form tests must simulate delivery without sending emails.

User revisions (2026-09-07): Restore the original centered slogan hero with its wide passenger photograph below, and the photographic fleet section. Give demo and proposal CTAs strong prominence. Put the fleet enquiry form in the opening section, before any photo on mobile. Brand/agency proposals ask for vehicle-count ranges. Remove the measurement/reporting page and commercial sections. Use realistic photographic imagery (AI-generated where needed) rather than code-drawn scenes. Coverage and fleet pages include photography matching existing assets. Replace six demo creatives with edited horizontal Canva advertisement templates, keeping fictional examples labelled.
Use the integrated Codex browser for Canva work and local previews, as requested by the user. The six current Canva examples are static images; preserve their complete artwork on the tablet rather than cropping text at the edges.
City photography should evoke Lisbon, Porto or Portugal through everyday streets, local architecture, azulejos and paving, without monuments or famous landmarks.

Tablet previews should adapt their proportions to the displayed artwork so the complete image is visible without cropping, stretching or black letterbox bars, on both the homepage and dedicated studio.

The homepage fleet CTA should foreground earning more from the fleet, using “Quero ganhar mais com a minha frota”, while remuneration terms remain subject to confirmation.

Commercial copy should lead with the offer and benefits, keeping confirmed conditions close to the decision. Keep the original hero and slogan. Avoid repeated demo disclaimers and sections about unavailable capabilities. Fleet messaging should continue the additional-revenue proposition, with audience-specific form actions. Studio specifications belong in the studio, not the commercial formats page.

Keep the original edited Canva advertisements; the user prefers them over the simplified AI typography revisions. Privacy completion is deferred at the user’s request until legal entity details exist.

Confirmed fleet terms: Cartise handles and pays for equipment installation, connectivity, maintenance and fault repairs; these services have no cost to the fleet. Remove the minimum-term/permanence FAQ in both languages; do not infer that no minimum term exists.

Mobile QA: keep form controls at least 16px, comfortable 44px touch targets, no horizontal overflow from 320px, studio specifications below the preview/upload flow, and the contact form before supporting copy on mobile.
