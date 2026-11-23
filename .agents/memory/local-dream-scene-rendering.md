---
name: Dream artwork pipeline
description: The app's generated dream image and animated video requirements.
---

Each dream submission should generate a unique vertical artwork through Replit's OpenAI image integration. Use the returned image as the source for the on-screen Canvas animation and video export; do not substitute a procedural scene for the artwork. Surface the exact provider error when image generation fails.

**Why:** The user changed the product requirement from local-only scenes to real AI-generated art and animated short-video output. The live integration rejected `gpt-image-1` and `dall-e-3` model names but successfully generated a PNG through its newer image-model fallback.

**How to apply:** Call the `gpt-image-1` helper first, use the supported image-model fallback only when the integration reports that model unavailable, and pass the generated PNG data URL to the result view. Preserve the exact API error text if all image attempts fail.
