---
name: Local dream scene rendering
description: App constraint for scene visuals and the text-only AI integration.
---

For this app, scene artwork must be drawn client-side with native HTML5 Canvas. The OpenAI integration supplies interpretation and scene theme data only; it is not used for image generation.

**Why:** The image-generation route failed with an unsupported-model error, and the user explicitly requires zero external image APIs.

**How to apply:** Keep dream scenes local and procedural, driven by the returned atmosphere, colors, and caption. Do not reintroduce image-generation endpoints.
