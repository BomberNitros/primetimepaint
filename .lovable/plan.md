

# Fix pass — Injection form corrections

## FIX 1 — Index.tsx: analyse handler wiring

**Already correct.** `handleAnalyseAndRepaint` exists at line 218 and is passed as `onAnalyseAndRepaint={handleAnalyseAndRepaint}` at line 310. No change needed.

## FIX 2 — PaintDirectivePanel.tsx: injection form + token replacement

**Current state:** Panel has only a textarea and submit button. No injection form exists. `isOpen` defaults to `false`.

**Changes:**
- Add props: `zenithalEnabled: boolean`, `primeColor: string`
- Change `isOpen` initial state to `true`
- Replace `{isOpen && ...}` with `useRef`-based `maxHeight` transition
- Add injection form inside collapsible body, below textarea:
  - Section label "Miniature details"
  - `grid grid-cols-1 md:grid-cols-2 gap-3`
  - Local state: `name`, `origin`, `role`, `customRole`, `manufacturer`
  - Fields: Name input, Origin input, Role select (with full options list including "other" → free text), Manufacturer input
  - Read-only condition badge derived from `zenithalEnabled`/`primeColor`
  - "Inject into prompt" button with full token replacement logic per the spec tables

## FIX 3 — Forward zenithalEnabled + primeColor to PaintDirectivePanel

**PrimingZenithalPanel:** Already receives `primeColor` and `zenithalEnabled` as props. Just needs to forward them to `<PaintDirectivePanel>` at line 141.

**ColorPlanPanel:** Does **not** have `zenithalEnabled` or `primeColor` in its props interface. Must:
- Add both to `ColorPlanPanelProps`
- Forward to `<PaintDirectivePanel>` at line 110

**Index.tsx:** Must pass `zenithalEnabled={state.zenithalEnabled}` and `primeColor={state.primeColor}` to `<ColorPlanPanel>` at line 348. PrimingZenithalPanel already receives both.

## Files changed

| File | Change |
|---|---|
| `src/components/PaintDirectivePanel.tsx` | New props, `isOpen=true`, max-height transition, full injection form with token replacement |
| `src/components/panels/PrimingZenithalPanel.tsx` | Forward `zenithalEnabled` + `primeColor` to PaintDirectivePanel |
| `src/components/panels/ColorPlanPanel.tsx` | Add `zenithalEnabled` + `primeColor` to props, forward to PaintDirectivePanel |
| `src/pages/Index.tsx` | Pass `zenithalEnabled` + `primeColor` to ColorPlanPanel |

