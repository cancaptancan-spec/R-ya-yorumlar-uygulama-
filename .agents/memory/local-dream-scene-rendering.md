---
name: Dream artwork pipeline
description: The app's generated dream image and animated video requirements.
---

Each dream submission should generate a unique vertical artwork through Replit's OpenAI image integration. Use the returned image as the source for the on-screen Canvas animation and video export; do not substitute a procedural scene for the artwork. Synthesize the Hicaz Oud/Ney accompaniment in-browser with clean sine/triangle oscillators, no noise generators, and mix it into exported video without external audio files. Pause and stop the audio when hidden; stop oscillators and close the context on page exit or component unmount.

**Why:** The user changed the product requirement from local-only scenes to real AI-generated art and animated short-video output, then specified noise-free synthesized Hicaz Oud/Ney audio with strict lifecycle cleanup. The live integration rejected `gpt-image-1` and `dall-e-3` model names but successfully generated a PNG through its newer image-model fallback.

**How to apply:** Call the `gpt-image-1` helper first, use the supported image-model fallback only when the integration reports that model unavailable, and pass the generated PNG data URL to the result view. Preserve the exact API error text if all image attempts fail. Start the oscillator-only Web Audio score after a user gesture, include its media-stream destination alongside the canvas stream when recording, suspend and stop voices on visibility loss, and close the context on page exit or unmount.
