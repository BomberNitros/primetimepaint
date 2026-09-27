# Colour repaint failure notice — `src/pages/Index.tsx` only

## Current state (verified)
- The background colour repaint effect (lines 544–591) has a silent catch:
  `catch { /* silent — colour repaint is best-effort */ }` (lines 575–577).
- `toast` from sonner is already imported in `Index.tsx` (line 24) and the
  priming effect above already follows a `toast.error(message, ...)` pattern.

## Changes (all in `src/pages/Index.tsx`; nothing else touched)

1. **Error state capture**
   - Add a local `useState<string | null>` near the other local UI state,
     e.g. `colorRepaintError`, holding the last failure message
     (not added to `PrimetimeState` — it is ephemeral UI state).

2. **Catch block replacement** (only the `catch` at lines 575–577)
   - Extract the message: `e instanceof Error ? e.message : "Colour repaint failed."`.
   - Detect rate limiting by message content (`429` / `rate limit`, case-insensitive)
     and show a friendly notice, e.g. "Colour repaint paused — Gemini rate limit reached. Try again shortly.",
     with the gateway's safe message as the toast description.
   - For Gemini rejection (any other failure) show the safe message directly,
     e.g. "Colour repaint failed: {message}".
   - `setColorRepaintError(notice)` and `toast.error(notice, { duration: 6000 })`.
   - No automatic retry, no changes to debounce, trigger logic, or dependency array.

3. **Error clearing**
   - Inside the debounced callback, before the `try`, call
     `setColorRepaintError(null)` so each new attempt starts clean.

## Result
When the background colour repaint request fails (Gemini rejection or rate
limit), the user sees a sonner toast with the actual failure reason instead of
a silent no-op; the failure is captured in component state for any later
inline display. Trigger logic, dependencies, and all other files remain
untouched.
