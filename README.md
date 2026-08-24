# Ex-Servicemen App Hub — Expo

Run locally:

```bash
cd expo-esm-hub
npm install
npx expo start
```

Then press `w` for web (localhost), `a` for Android emulator, `i` for iOS simulator, or scan the QR with Expo Go.

Files:
- `App.js` — screen composition (header, hero, AI card, services grid, disclaimer, bottom nav)
- `data.js` — colors, services, card actions, nav items
- `styles.js` — all StyleSheet rules
- `Icon.js` — icon-family dispatcher for `@expo/vector-icons`

Note: Devanagari renders with the system font; add a Noto Sans Devanagari font via `expo-font` if you need consistent typography across devices.
