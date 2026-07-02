# Weather Requests App

A cross-platform mobile and web app that queries the [OpenWeather API](https://openweathermap.org/api) for current weather conditions.

Built with [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) and React Native.

## Features

- **3 lookup methods**: GPS coordinates, manual lat/lon entry, or city name search
- **Bring Your Own Key (BYOK)**: no hardcoded API keys — supply your own OpenWeather API key, stored securely via `expo-secure-store`
- **Light/dark mode**: automatic system theme detection with web hydration guard
- **Internationalization**: English, Portuguese (fallback), and Russian — switch at runtime
- **History**: persist and review past lookups to `localStorage`
- **Web static export**: output configured for static hosting

## Getting started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the dev server

   ```bash
   npx expo start
   ```

   For web-only:

   ```bash
   npx expo start --web
   ```

3. On first launch, tap the API key field to enter your [OpenWeather API key](https://home.openweathermap.org/api_keys).

## Commands

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `npx expo start` | Start dev server |
| `npx expo start --web` | Web-only dev server |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── app/               # Expo Router file-based routing
│   ├── _layout.tsx    # Root Stack layout
│   └── index.tsx      # Main weather screen
├── api/               # OpenWeather API client
├── components/        # Reusable UI components
├── constants/         # Theme & API config
├── hooks/             # Custom hooks (theme, color-scheme)
├── locales/           # i18n translations (en, pt, ru)
├── types/             # TypeScript type definitions
└── utils/             # Utilities (storage, error parsing, formatting)
```

## Tech stack

- **Expo SDK 56** — cross-platform framework
- **expo-router** — file-based routing
- **expo-secure-store** — encrypted key storage
- **expo-location** — device GPS access
- **i18next / react-i18next** — internationalization
- **react-native-svg** — SVG rendering (logo)
- **TypeScript** — strict mode

## License

MIT
