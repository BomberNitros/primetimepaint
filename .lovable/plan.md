

# Sprint 2 — Full Build

## Blocker: Lovable Cloud not enabled

`src/integrations/` is empty and `supabase/` does not exist. The Supabase client required by `gemini-pipeline.ts` (`supabase.functions.invoke()`) is not available.

**You must enable Lovable Cloud before this build can proceed.** Go to the Cloud tab in the Lovable editor sidebar and enable it. This auto-generates `src/integrations/supabase/client.ts` with the project URL and anon key.

Once enabled, confirm and resubmit this prompt. The 14-step build will then execute in order:

## Build order (once Cloud is enabled)

| Phase | Steps | Summary |
|---|---|---|
| Infrastructure | 0–5 | Global colour→color rename, edge function, config.toml, types, state hook, pipeline lib |
| Components | 6–11 | RepaintTimer, RepaintTicker, ControlRail additions, ImageUploader additions, DualSlider, PaintDirectivePanel |
| Orchestration | 12–14 | PrimingZenithalPanel additions, ColorPlanPanel additions, Index.tsx wiring |

All spec details from the prompt are understood and will be implemented exactly as written. No changes to canvas recolor engine, BottomBar, ImageSlider, Brush Guide, Handling, Thinning, Finish panels, export logic, zenithal processing, animated SVG logo, or font pool.

## Action required

Enable Lovable Cloud, then resubmit.

