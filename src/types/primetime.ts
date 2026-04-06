export type StepId =
  | 'upload'
  | 'priming'
  | 'color-plan'
  | 'brush-guide'
  | 'paint-handling'
  | 'thinning-plan'
  | 'finish';

export type ImageType = 'main' | 'reference' | 'primed';

export interface UploadedImage {
  id: string;
  objectUrl: string;
  type: ImageType;
  file: File;
  /** For primed images, the id of the source main image */
  sourceMainId?: string;
}

export type PrimeColor = 'black' | 'grey' | 'white';
export type ZenithalScheme = 'flat' | '2tone' | '3tone';
export type ZenithalMethod = 'drybrush' | 'spray';
export type ZenithalDirection = 'top' | 'top-left' | 'top-right';
export type ThemeId = 'grimdark' | 'vibrant' | 'natural' | 'high-contrast';
export type TempSource = 'auto' | 'manual';
export type RenderStrategy = 'canvas' | 'ai';

export interface ColorScheme {
  name: string;
  type: 'speedpaint-led' | 'mix-based';
  base: SpeedpaintColor;
  midtone1: SpeedpaintColor;
  midtone2: SpeedpaintColor | null;
  highlight: SpeedpaintColor;
}

export interface SpeedpaintColor {
  name: string;
  hex: string;
  lidColor: LidColor;
}

export type LidColor = 'white' | 'green' | 'red' | 'black';

export type BrushType = 'round' | 'flat' | 'filbert' | 'liner' | 'angle' | 'spot';

export interface BrushRecommendation {
  task: string;
  brush: string;
  set: 'premium-round' | 'utility';
  tip: string;
  brushType: BrushType;
}

export interface AnatomyRegion {
  region: string;
  description: string;
  baseColor: { name: string; hex: string };
  shadowColor: { name: string; hex: string };
  highlightColor: { name: string; hex: string };
  surfaceNote: string;
}

export interface GeminiTurn {
  role: 'user' | 'model';
  textContent?: string;
  imageContent?: string;
  hasImage: boolean;
}

export interface RepaintEntry {
  section: 'initial' | 'priming' | 'colorPlan';
  timestamp: Date;
  elapsedSeconds: number;
}

export interface RepaintHistoryEntry {
  label: string;
  image: string;
}

export interface PrimetimeState {
  // Images — split by type
  mainImages: UploadedImage[];
  referenceImages: UploadedImage[];
  referenceBase64s: string[];
  selectedImageIndex: number;

  // Repaint history
  repaintHistory: RepaintHistoryEntry[];

  // Navigation
  activeStep: StepId;

  // Surface Prep (merged into Priming panel)
  currentTemp: number | null;
  tempSource: TempSource;
  sprayOverride: boolean;
  geoFailed: boolean;
  manualTempInput: number | null;

  // Priming & Zenithal
  primeColor: PrimeColor;
  zenithalEnabled: boolean;
  zenithalScheme: ZenithalScheme;
  zenithalMethod: ZenithalMethod;
  zenithalDirection: ZenithalDirection;

  // Color Plan
  extractedColors: string[];
  selectedTheme: ThemeId | null;
  colorSchemes: ColorScheme[];

  // Color-Role Overrides
  baseOverride: string | null;
  midtoneOverrides: string[];
  highlightOverride: string | null;

  // Gemini pipeline
  anatomyRegions: AnatomyRegion[];
  initialRepaintImage: string | null;
  customRepaintImage: string | null;
  primingRepaintMap: Record<number, string>;
  colorRepaintMap: Record<number, string>;
  activePrompt: string | null;
  geminiHistory: GeminiTurn[];
  repaintLog: RepaintEntry[];
  currentlyRepainting: boolean;
  backgroundRepainting: boolean;
  repaintStartTime: Date | null;
  pipelineComplete: boolean;
  pipelineError: string | null;
  sharedSliderIndex: number;
}
