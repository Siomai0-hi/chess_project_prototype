# Mobile Shell

Phase 2 converts the web MVP into Expo screens while reusing:

- `@mda-chess/api-client`
- `@mda-chess/shared`
- `@mda-chess/chess-engine`
- the same REST API

Recommended Phase 2 dependencies:

```bash
npm install -w apps/mobile expo react react-native nativewind zustand @tanstack/react-query
```

The first screen should mirror `apps/web/src/App.tsx`: board, evaluation, move review, Mongolian coach, and progress summary.
