# Riri's 18th birthday ♡

A responsive, interactive birthday website using the provided 20 photos and two MP3s.

## Open the website

1. Unzip the complete `Riri_18th_Birthday_Website.zip` archive.
2. Open **`index.html`** in Chrome, Edge, Safari or Firefox. Keep the `assets`, `style.css`, and `script.js` files next to it.
3. For sharing with Riri on her phone, host the **entire folder** on a static web host such as Netlify, Cloudflare Pages or GitHub Pages. Upload the folder, not just `index.html`. Because the photos and recordings are personal, consider sharing an unlisted/private link instead of publicizing the address.

## Experience

- Opens to **Happy 18th Birthday, Riri!** with an illustrated cake.
- Tapping **Make a wish & blow** extinguishes the candles and plays `After candle blow.mp3` (24.8 seconds). There is a **real audio playback progress bar**. When the song finishes, the website advances to the photo gallery. Optional microphone blowout is provided when allowed by the browser and site security settings; tap always works.
- The gallery uses **all 20 photos**, grouped into the six named chapters, with tappable flipping Polaroids, horizontal swipe/scroll on phones, and chapter navigation. `ForPhotoGallery.mp3` is then used as the background soundtrack, with play/pause, mute and volume controls. If autoplay is restricted, tap the floating music control.
- **A secret letter** opens in the final stage. The letter has been kept **exactly as the supplied text**, including spelling, punctuation, line breaks and wording.
- Responsive for narrow and large screens, keyboard accessible, and reduced-motion-aware.

## Notes

The file uses web-optimized WebP photographs and the original audio files. The font files are loaded via Google Fonts when internet access is available; browser fallback fonts work offline. The music player uses the same HTML audio element between stages to improve mobile browser playback continuity. Microphone access generally requires an HTTPS site or localhost, but is optional.
