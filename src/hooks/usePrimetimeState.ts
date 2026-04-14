import { useState, useCallback } from 'react';

import {
  PrimetimeState, StepId, UploadedImage, PrimeColor,
  ZenithalScheme, ZenithalMethod, ZenithalDirection,
  ThemeId, ColorScheme, AnatomyRegion, GeminiTurn, RepaintEntry,
  RepaintHistoryEntry,
} from '@/types/primetime';

const initialState: PrimetimeState = {
  mainImages: [],
  referenceImages: [],
  referenceBase64s: [],
  selectedImageIndex: 0,
  repaintHistory: [],
  activeStep: 'upload',
  currentTemp: null,
  tempSource: 'manual',
  sprayOverride: false,
  geoFailed: false,
  manualTempInput: null,
  primeColor: 'black',
  zenithalEnabled: false,
  zenithalScheme: '2tone',
  zenithalMethod: 'drybrush',
  zenithalDirection: 'top',
  extractedColors: [],
  selectedTheme: 'grimdark',
  colorSchemes: [],
  activeSchemeIndex: 0,
  baseOverride: null,
  midtoneOverrides: [],
  highlightOverride: null,
  anatomyRegions: [],
  initialRepaintImage: null,
  customRepaintImage: null,
  primingRepaintMap: {},
  colorRepaintMap: {},
  activePrompt: null,
  geminiHistory: [],
  repaintLog: [],
  currentlyRepainting: false,
  backgroundRepainting: false,
  repaintStartTime: null,
  pipelineComplete: false,
  pipelineError: null,
  sharedSliderIndex: 0,
};

export function usePrimetimeState() {
  const [state, setState] = useState<PrimetimeState>(initialState);

  const setActiveStep = useCallback((step: StepId) => {
    setState(s => ({ ...s, activeStep: step }));
  }, []);

  const setMainImages = useCallback((imgs: UploadedImage[]) => {
    setState(s => ({ ...s, mainImages: imgs }));
  }, []);

  const setReferenceImages = useCallback((imgs: UploadedImage[]) => {
    setState(s => ({ ...s, referenceImages: imgs }));
  }, []);

  const setReferenceBase64s = useCallback((v: string[]) => {
    setState(s => ({ ...s, referenceBase64s: v }));
  }, []);

  const appendReferenceBase64s = useCallback((incoming: string[]) => {
    setState(s => ({
      ...s,
      referenceBase64s: [...(s.referenceBase64s ?? []), ...incoming]
    }));
  }, []);

  const addMainImages = useCallback((files: File[]) => {
    setState(s => {
      const newImages: UploadedImage[] = files.map(file => ({
        id: crypto.randomUUID(),
        objectUrl: URL.createObjectURL(file),
        type: 'main' as const,
        file,
      }));
      return { ...s, mainImages: [...s.mainImages, ...newImages] };
    });
  }, []);

  const addReferenceImages = useCallback((files: File[]) => {
    setState(s => {
      const newImages: UploadedImage[] = files.map(file => ({
        id: crypto.randomUUID(),
        objectUrl: URL.createObjectURL(file),
        type: 'reference' as const,
        file,
      }));
      return { ...s, referenceImages: [...s.referenceImages, ...newImages] };
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setState(s => {
      const mainImg = s.mainImages.find(i => i.id === id);
      const refImg = s.referenceImages.find(i => i.id === id);
      if (mainImg) URL.revokeObjectURL(mainImg.objectUrl);
      if (refImg) URL.revokeObjectURL(refImg.objectUrl);
      const mainImages = s.mainImages.filter(i => i.id !== id);
      const referenceImages = s.referenceImages.filter(i => i.id !== id);
      return {
        ...s,
        mainImages,
        referenceImages,
        selectedImageIndex: Math.min(s.selectedImageIndex, Math.max(0, mainImages.length + referenceImages.length - 1)),
      };
    });
  }, []);

  const setSelectedImageIndex = useCallback((index: number) => {
    setState(s => ({ ...s, selectedImageIndex: index }));
  }, []);

  const setPrimeColor = useCallback((c: PrimeColor) => {
    setState(s => ({ ...s, primeColor: c }));
  }, []);

  const setZenithalEnabled = useCallback((v: boolean) => {
    setState(s => ({ ...s, zenithalEnabled: v }));
  }, []);

  const setZenithalScheme = useCallback((v: ZenithalScheme) => {
    setState(s => ({ ...s, zenithalScheme: v }));
  }, []);

  const setZenithalMethod = useCallback((v: ZenithalMethod) => {
    setState(s => ({ ...s, zenithalMethod: v }));
  }, []);

  const setZenithalDirection = useCallback((v: ZenithalDirection) => {
    setState(s => ({ ...s, zenithalDirection: v }));
  }, []);

  const setSelectedTheme = useCallback((t: ThemeId) => {
    setState(s => ({ ...s, selectedTheme: t }));
  }, []);

  const setBaseOverride = useCallback((v: string | null) => {
    setState(s => ({ ...s, baseOverride: v }));
  }, []);

  const setMidtoneOverrides = useCallback((v: string[]) => {
    setState(s => ({ ...s, midtoneOverrides: v.slice(0, 2) }));
  }, []);

  const setHighlightOverride = useCallback((v: string | null) => {
    setState(s => ({ ...s, highlightOverride: v }));
  }, []);

  const setManualTempInput = useCallback((v: number | null) => {
    setState(s => ({ ...s, manualTempInput: v, currentTemp: v, tempSource: 'manual' }));
  }, []);

  const setSprayOverride = useCallback((v: boolean) => {
    setState(s => ({ ...s, sprayOverride: v }));
  }, []);

  const setExtractedColors = useCallback((colors: string[]) => {
    setState(s => ({ ...s, extractedColors: colors }));
  }, []);

  const setColorSchemes = useCallback((schemes: ColorScheme[]) => {
    setState(s => ({ ...s, colorSchemes: schemes }));
  }, []);

  const setAnatomyRegions = useCallback((regions: AnatomyRegion[]) => {
    setState(s => ({ ...s, anatomyRegions: regions }));
  }, []);

  const setInitialRepaintImage = useCallback((v: string | null) => {
    setState(s => ({ ...s, initialRepaintImage: v }));
  }, []);

  const setCustomRepaintImage = useCallback((v: string | null) => {
    setState(s => ({ ...s, customRepaintImage: v }));
  }, []);

  const setActivePrompt = useCallback((v: string | null | ((prev: string | null) => string | null)) => {
    setState(s => ({
      ...s,
      activePrompt: typeof v === 'function' ? v(s.activePrompt) : v,
    }));
  }, []);

  const setGeminiHistory = useCallback((v: GeminiTurn[]) => {
    setState(s => ({ ...s, geminiHistory: v }));
  }, []);

  const setRepaintLog = useCallback((v: RepaintEntry[] | ((prev: RepaintEntry[]) => RepaintEntry[])) => {
    setState(s => ({
      ...s,
      repaintLog: typeof v === 'function' ? v(s.repaintLog) : v,
    }));
  }, []);

  const setCurrentlyRepainting = useCallback((v: boolean) => {
    setState(s => ({ ...s, currentlyRepainting: v }));
  }, []);

  const setBackgroundRepainting = useCallback((v: boolean) => {
    setState(s => ({ ...s, backgroundRepainting: v }));
  }, []);

  const setRepaintStartTime = useCallback((v: Date | null) => {
    setState(s => ({ ...s, repaintStartTime: v }));
  }, []);

  const setPipelineComplete = useCallback((v: boolean) => {
    setState(s => ({ ...s, pipelineComplete: v }));
  }, []);

  const setPipelineError = useCallback((v: string | null) => {
    setState(s => ({ ...s, pipelineError: v }));
  }, []);

  const setSharedSliderIndex = useCallback((v: number) => {
    setState(s => ({ ...s, sharedSliderIndex: v }));
  }, []);

  const setPrimingRepaintEntry = useCallback((index: number, value: string) => {
    setState(s => ({ ...s, primingRepaintMap: { ...s.primingRepaintMap, [index]: value } }));
  }, []);

  const setColorRepaintEntry = useCallback((index: number, value: string) => {
    setState(s => ({ ...s, colorRepaintMap: { ...s.colorRepaintMap, [index]: value } }));
  }, []);

  const setRepaintHistory = useCallback((v: RepaintHistoryEntry[] | ((prev: RepaintHistoryEntry[]) => RepaintHistoryEntry[])) => {
    setState(s => ({
      ...s,
      repaintHistory: typeof v === 'function' ? v(s.repaintHistory) : v,
    }));
  }, []);


  return {
    state,
    setActiveStep,
    setMainImages,
    setReferenceImages,
    setReferenceBase64s,
    appendReferenceBase64s,
    addMainImages,
    addReferenceImages,
    removeImage,
    setSelectedImageIndex,
    setPrimeColor,
    setZenithalEnabled,
    setZenithalScheme,
    setZenithalMethod,
    setZenithalDirection,
    setSelectedTheme,
    setBaseOverride,
    setMidtoneOverrides,
    setHighlightOverride,
    setManualTempInput,
    setSprayOverride,
    setExtractedColors,
    setColorSchemes,
    setAnatomyRegions,
    setInitialRepaintImage,
    setCustomRepaintImage,
    setActivePrompt,
    setGeminiHistory,
    setRepaintLog,
    setCurrentlyRepainting,
    setBackgroundRepainting,
    setRepaintStartTime,
    setPipelineComplete,
    setPipelineError,
    setSharedSliderIndex,
    setPrimingRepaintEntry,
    setColorRepaintEntry,
    setRepaintHistory,
  };
}
