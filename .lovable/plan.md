## Mobile sidebar corrections

### `src/components/ControlRail.tsx`
- Line 64: replace `fixed inset-y-0 right-0 z-40 w-72 shadow-xl overflow-y-auto` with `fixed inset-y-0 left-0 z-40 w-72 shadow-xl overflow-y-auto`.

### `src/pages/Index.tsx`
- Line 25: change `import { SlidersHorizontal } from "lucide-react";` to `import { ChevronRight, ChevronLeft } from "lucide-react";`.
- Line 828: change className to `fixed top-4 left-4 z-50 md:hidden rounded-full shadow-lg`.
- Line 831: replace `<SlidersHorizontal />` with `{sidebarOpen ? <ChevronLeft /> : <ChevronRight />}`.

No other changes.
