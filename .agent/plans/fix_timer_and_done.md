---
title: Fix Timer Position and Done Button Feedback
description: Move the timer to a relative position above the canvas and fix the "Done" button feedback loop to ensure immediate visual confirmation of submission.
status: proposed
id: fix-timer-and-done-button
tasks:
  - id: move-timer
    title: Move Timer Position
    description: Update DrawingScreen.tsx to position the timer relatively above the canvas with margin, removing absolute positioning. (Already partially applied, will verify and ensure completeness).
    status: in_progress
    file_paths:
      - src/components/screens/DrawingScreen.tsx
  - id: pass-submitted-state
    title: Pass Optimistic Submitted State
    description: Modify DrawingScreen to accept `hasSubmitted` as a prop (which includes optimistic state from App.tsx via ScreenRouter) so the "Done!" overlay appears immediately upon clicking Done.
    status: proposed
    file_paths:
      - src/components/screens/DrawingScreen.tsx
      - src/components/common/ScreenRouter.tsx
  - id: fix-drawing-timer-btn
    title: Improve Done Button Interaction
    description: Enhance DrawingTimer's Done button with `pointer-events-auto` and better touch handling to ensuring it is always clickable.
    status: proposed
    file_paths:
      - src/components/game/DrawingTimer.tsx
---
