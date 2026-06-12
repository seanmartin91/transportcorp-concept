# TransportCorp — Concept Site

A cinematic redesign concept for [TransportCorp](https://transportcorp.com), built with a dark industrial aesthetic inspired by [MotionSites.ai](https://motionsites.ai).

## Stack

- Pure HTML / CSS / JavaScript — no build tools, no frameworks
- AI-generated video backgrounds (Sora)
- Canvas-based rain, steam particle, and light flicker animations

## Assets

| File | Description |
|---|---|
| `assets/hero-truck.png` | AI-generated hero truck poster frame |
| `assets/hero-truck-video.mp4` | Animated hero — rain, steam, night |
| `assets/flatbed-truck.png` | AI-generated flatbed divider poster |
| `assets/flatbed-truck-video.mp4` | Animated flatbed — golden hour, Ontario highway |

## Deploy

This is a static site. No build step required.

### Netlify
Connect this repo in the Netlify dashboard:
- **Base directory:** `/` (root)
- **Publish directory:** `.` (root)
- **Build command:** *(leave blank)*

`netlify.toml` and `_redirects` are already configured.

### Local
```bash
npx serve .
```
