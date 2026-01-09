# SpookshortsAI 👻🎬

**Short-form AI video generator for desi horror, romance, poetry, and motivational shorts** — converts story text into cinematic, vertical (9:16) short videos with generated visuals, procedural SFX, and aligned TTS captions.

---

## Features ✨
- Scene script generation using Google Gemini (`@google/genai`)
- Image generation (Pollinations / image URLs) optimized for 9:16 vertical assets
- Natural TTS with word-level alignment using ElevenLabs
- Procedural SFX generation with the Web Audio API (`services/sfxService.ts`)
- In-browser audio/video processing with `@ffmpeg/ffmpeg`
- Built with React + TypeScript (Vite)

---

## Quick Start 🔧

Prerequisites:
- Node.js (>= 18 recommended)
- Google GenAI API key (`API_KEY`)
- ElevenLabs API key (`ELEVENLABS_API_KEY`)

Install & run:

```bash
npm install
npm run dev    # start dev server (Vite)
npm run build  # production build
npm run preview
```

Notes:
- `@ffmpeg/ffmpeg` runs in-browser; no system ffmpeg required.
- Keep API keys out of version control.

---

## Environment Variables 🔐
- `API_KEY` — Google GenAI / Gemini API key
- `ELEVENLABS_API_KEY` — ElevenLabs TTS API key

Add them to `.env.local` or your preferred secret manager:

```
API_KEY=your_google_genai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

---

## Project Structure 📁
- `index.html`, `index.tsx`, `App.tsx` — app entry points
- `components/VideoPlayer.tsx` — playback UI
- `services/`
  - `geminiService.ts` — script generation, image fetch, TTS, alignment
  - `sfxService.ts` — procedural SFX generation (Web Audio API)
  - `audioUtils.ts` — audio helpers
- `types.ts` — shared TypeScript types
- `SAMPLE_*.json` — example story/script files

---

## Script / Scene JSON (example) 📄

```json
{
  "title": "Example Story",
  "scenes": [
    {
      "id": 1,
      "narration": "A lonely road at midnight...",
      "hinglish_display": "Raat ka andhera...",
      "visual_prompt": "dark narrow road, foggy, dim streetlight",
      "visual_effect": "slow_zoom_in",
      "audio_cue": "wind_howling",
      "effect_timestamp": 2
    }
  ],
  "genre": "horror"
}
```

See `types.ts` for full typings.

---

## How to add a story ✅
1. Add a `SAMPLE_<name>.json` file (or use the UI).  
2. Provide the raw story text — Gemini breaks it into scenes.  
3. Generate images/audio and preview using the app.

---

## Development Notes 💡
- Gemini prompts are genre-aware and aim to place effects and cues intelligently (`geminiService.ts`).
- ElevenLabs returns alignment data used to auto-generate captions.
- Pollinations is used for image generation (no API key required for the free endpoint used).

---

## Contributing 🤝
- Fork, add features or fixes, and open a PR.  
- Add tests where relevant.  
- Do not commit environment secrets.

---

## License & Attribution 📝
- Add a `LICENSE` file (e.g., MIT) if you want to open-source.  
- External services used: Google GenAI, ElevenLabs, Pollinations. Ensure you comply with their TOS.

---

If you'd like, I can also:
- Commit & push this change to `main` for you, or
- Add a short CI/deploy section for Vercel/Netlify.

Tell me which you'd prefer.
