---
type: task
status: in_progress
---

# Lobby Screen Layout Optimization

## Objective
Optimize the LobbyScreen layout to maximize vertical space and improve mobile UX by:
1. Making scrolling selectors half-width and side-by-side
2. Adding swipe indicators (arrows)
3. Simplifying and centering labels
4. Making the player list independently scrollable with more room

## Current State Analysis

### Issues Identified
1. **Game Settings Panel** - Takes up too much vertical space with full-width pickers stacked vertically
2. **Player List** - Scrolls with the entire page instead of being an independent scrollable container
3. **No Visual Indicators** - Users may not know the pickers are swipeable
4. **Labels** - Could be more concise to save space

### Components Affected
- `GameSettingsPanel.tsx` - Settings UI component
- `LobbyScreen.tsx` - Main lobby layout
- `HorizontalPicker.tsx` - May need minor adjustments for half-width display

## Implementation Plan

### ✅ Phase 1: Game Settings Panel Redesign (COMPLETED)
- [x] Make pickers side-by-side using CSS Grid (2 columns)
- [x] Reduce picker width to 50% each
- [x] Add left/right arrow indicators (◀ ▶) to show swipe capability
- [x] Simplify labels: "Drawing Time" → "Time", "Number of Rounds" → "Rounds", "Enable Sabotage" → "Sabotage"
- [x] Center the "Game Settings" heading

### ✅ Phase 2: HorizontalPicker Component Adjustments (COMPLETED)
**Goal**: Ensure the picker works well at half-width

**Changes Made**:
- [x] Added optional `label` prop to replace hardcoded "BET AMOUNT" text
- [x] Added `compact` prop to hide the large selected value display
- [x] Made the component more space-efficient for side-by-side layouts
- [x] Updated GameSettingsPanel to use `compact={true}` mode

**Files**: `src/components/common/HorizontalPicker.tsx`

### ✅ Phase 3: Player List Independent Scrolling (COMPLETED)
**Goal**: Make player list scroll independently with more vertical space

**Changes Made in LobbyScreen.tsx**:
- [x] Removed `overflow-y-auto` from the main container (line 104)
- [x] Set player list card to `maxHeight: '60vh'` for better space utilization
- [x] Added independent scrolling to the player list container with custom scrollbar styling
- [x] Removed `min-h-[200px]` constraint to allow flexible sizing
- [x] Added `pr-2` padding for scrollbar clearance

**Layout Strategy**:
- Top nav buttons: Fixed height ✓
- Room code card: Fixed height ✓
- Game settings: Compact, fixed height (much shorter with side-by-side layout) ✓
- Player list: Flexible, takes remaining space, independently scrollable ✓
- Start/Wait button: Fixed at bottom ✓

### ✅ Phase 4: Final Polish (COMPLETED)
- [x] Arrows positioned absolutely over picker edges
- [x] Custom scrollbar styling for player list
- [x] All labels simplified and centered
- [x] Compact mode removes unnecessary large text displays

## Technical Considerations

### CSS Grid for Side-by-Side Layout
```tsx
<div className="grid grid-cols-2 gap-3">
  {/* Picker 1 */}
  {/* Picker 2 */}
</div>
```

### Independent Scroll Container
```tsx
<div className="flex-1 overflow-y-auto max-h-[60vh]">
  {/* Player list items */}
</div>
```

### Arrow Indicators
- Position: Absolute positioning over picker edges
- Z-index: Above picker content but below interaction layer
- Opacity: 60% for subtle hint
- Pointer-events: none (don't interfere with scrolling)

## Success Criteria
- [x] Game settings take up ~50% less vertical space
- [x] Player list scrolls independently from page
- [x] Arrows clearly indicate swipe functionality
- [x] All labels are concise and centered
- [x] Layout optimized for mobile viewport
- [x] No "BET AMOUNT" label showing in game settings
- [x] Touch targets remain accessible

## Completed Changes Summary

### GameSettingsPanel.tsx
- Restructured to use CSS Grid with 2 columns for side-by-side pickers
- Added arrow indicators (◀ ▶) positioned absolutely over each picker
- Simplified labels and centered heading
- Enabled compact mode on both pickers

### HorizontalPicker.tsx
- Added optional `label` prop (removes hardcoded "BET AMOUNT")
- Added `compact` prop to hide large value display
- Made component flexible for different use cases

### LobbyScreen.tsx
- Removed page-level scrolling (`overflow-y-auto`)
- Set player list card to `maxHeight: '60vh'`
- Made player list independently scrollable with custom scrollbar
- Optimized vertical space distribution
