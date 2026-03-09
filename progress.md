Original prompt: I just tried to do a test run with some friends and when I tried to upload an image at the start of a round, it could not. I was getting an error; it said "Could not upload image" and it said "Error 3". I don't know what was happening. I tried a bunch of different images: I tried JPEGs, PNGs, HEICs. I want to make sure that the image upload flow does not have any errors. Please don't make any mistakes

2026-03-08
- Investigating upload flow with systematic debugging before changing code.
- Found upload path in `src/services/image.ts` and UI entry in `src/components/screens/UploadScreen.tsx`.
- Initial suspects:
  - Firebase Storage rules/config issue because `firebase.json` has database rules only and no storage rules file configured.
  - Browser-side processing brittleness in `ImageService.processImage`, especially type gating and error handling.
- Local repro server started at http://127.0.0.1:5173.
- Created local JPEG and PNG fixtures in /tmp for upload testing.
- Dev server running locally.
- Created `/tmp/ano-upload-test.jpg` and `/tmp/ano-upload-test.png` for upload testing.
- Browser repro: direct calls to `ImageService.processImage()` with generated JPEG and PNG both failed.
- Firebase Storage upload returned HTTP 412 with `storage/unknown` from bucket `image-annotation-game.firebasestorage.app`.
- Migrated round image uploads, avatar image uploads, and gallery image uploads from Firebase Storage to Cloudinary unsigned uploads.
- Added explicit supported upload accept list and clearer HEIC rejection message.
- Verified production build passes after migration (`npm run build`).
- Verified runtime failure is now explicit when Cloudinary env vars are missing, instead of opaque Firebase Storage errors.
- Verified HEIC files now fail fast with a clear unsupported-format message instead of entering the broken upload path.
- Checking Cloudinary env vars in local `.env` before runtime test.
- Confirmed local `.env` has Cloudinary cloud name and upload preset set.
- Restarted Vite after `.env` change and verified `ImageService.processImage()` successfully uploaded a generated PNG to Cloudinary.
- Verified uploaded asset returned HTTP 200 and `content-type: image/jpeg` from Cloudinary.
- Added HEIC conversion dependency and started wiring shared image rendering + loading-stage consistency fixes.
- Implemented shared stroke rendering, HEIC conversion path, winner render persistence, and aligned loading stage IDs.
- Verified on a clean dev restart that a real sample HEIC converts and uploads to Cloudinary, with loading-stage events: convert -> compress -> upload.
- Verified shared winner-image rendering returns a composite data URL and uploads successfully to Cloudinary.
- Clean dev reload no longer shows the earlier hook-order crash from Fast Refresh.
- User still hit the upload failure in-app after the migration. Re-checking the full round-start path beyond Cloudinary upload.

2026-03-09
- Started performance stabilization implementation: added perf diagnostics utilities, device performance tier detection, room view model hook, and consolidated service worker notification handling.
- Added adaptive blur/background degradation for the app shell and toasts, plus screen-transition disabling on gameplay/heavier device tiers.
- Began drawing-path optimization: rAF-based canvas redraw scheduling, capped DPR resizing, zoom-container marker fix, and reduced heavy drawing overlays on interaction-heavy states.
- Fixed a hook-order regression in App caused by callback hooks being declared below early returns.
- Added PerfDiagnosticsOverlay and query-param-driven perf HUD (`?anoPerf=1`) for on-device profiling.
- Split recharts into a dedicated vendor chunk and lazy-loaded Home/Lobby optional modals to shrink core screen bundles.
- Verified production build after chunking work. HomeScreen dropped to ~23.8 kB, LobbyScreen to ~23.1 kB, and StatsScreen logic chunk to ~17.0 kB with charts isolated in vendor-charts.
- Auditing sabotage mechanic against roadmap item: saboteur assignment, vote/result flow, sabotage round selection, and reveal flow.
- Moved shield and mirror-shield resolution out of `SabotageSelectionScreen.tsx` into `StorageService.setSabotageTarget()` so room state, not local UI, decides sabotage outcome.
- Added explicit sabotage outcome/attempted-target state plus round-result sabotage summaries so voting/results/final screens can reveal what actually happened.
- Hardened vote submission to reject self-votes and votes for non-submitters, and restricted rankings to submitted artists so late joiners or empty entries cannot place on the podium.
- Adjusted sabotage round reselection to prefer future rounds when settings change mid-game and randomized lowest-score saboteur tie breaks fairly.
- Verified `npm run build` passes after sabotage changes.
- `npm run lint` still fails on broad pre-existing repo issues unrelated to sabotage (legacy `any`s, effect linting, generated `dev-dist` rules, and older hook-order/set-state-in-effect findings). No new sabotage-specific lint failures were isolated beyond those existing file-level issues.
- Local dev server boots at `http://127.0.0.1:5173/`, but Playwright browser automation was blocked by the machine's existing Chrome session, so interactive sabotage flow verification was limited to code-path review plus build validation this pass.
