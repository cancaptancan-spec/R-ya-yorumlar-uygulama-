---
name: Dream artwork pipeline
description: The app's generated dream image and animated video requirements.
---

Each dream submission should generate a unique vertical artwork through Replit's OpenAI image integration. Use the returned image as the source for the on-screen Canvas animation and video export; do not substitute a procedural scene for the artwork. Use a real Ney recording through an HTML audio element; do not synthesize notes or noise. Keep visible attribution and honor the selected CC BY-NC license's noncommercial restriction. Pause/reset audio when hidden or leaving and close the capture context on unmount.

**Why:** The user changed the product requirement from local-only scenes to real AI-generated art and video, then replaced synthesized sound with a real Ney recording and selected a CC BY-NC track. The live image integration rejected `gpt-image-1` and `dall-e-3` model names but successfully generated a PNG through its newer image-model fallback.

**How to apply:** Call the `gpt-image-1` helper first, use the supported image-model fallback only when the integration reports that model unavailable, and pass the generated PNG data URL to the result view. Preserve the exact API error text if all image attempts fail. Stream the real Ney file with CORS enabled, connect its media element to both speakers and the recorder destination, show source/license attribution, stop/reset on visibility/page exit, and close the context on unmount. Do not bundle or call a CC BY-NC track public domain.
