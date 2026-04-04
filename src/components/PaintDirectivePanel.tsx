import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { randomFont } from '@/components/ControlRail';

interface PaintDirectivePanelProps {
  activePrompt: string | null;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
  currentlyRepainting: boolean;
  submitError: string | null;
}

export function PaintDirectivePanel({
  activePrompt,
  onPromptChange,
  onSubmit,
  currentlyRepainting,
  submitError,
}: PaintDirectivePanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-card/80 transition-colors"
      >
        <span
          className="text-base font-normal"
          style={{ fontFamily: `'${randomFont}', sans-serif` }}
        >
          Paint Directive
        </span>
        <span className="text-xs text-muted-foreground">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <textarea
            value={activePrompt ?? ''}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-foreground text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            placeholder="Prompt will appear after pipeline analysis..."
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={onSubmit}
              disabled={currentlyRepainting || !activePrompt}
              size="sm"
              className="gap-1.5"
            >
              {currentlyRepainting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit to Gemini
            </Button>
            <span className="text-xs text-muted-foreground">
              Repaint · €0.04
            </span>
          </div>

          {submitError && (
            <p className="text-xs text-destructive">{submitError}</p>
          )}
        </div>
      )}
    </div>
  );
}
