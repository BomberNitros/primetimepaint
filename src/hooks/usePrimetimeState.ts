import { useState, useCallback } from 'react';
import { PrimetimeState, StepId, UploadedImage, PrimeColor, ZenithalScheme, ZenithalMethod, ZenithalDirection, ThemeId, ColorScheme } from '@/types/primetime';

const initialState: PrimetimeState = {
  uploadedImages: [],
  selectedImageIndex: 0,
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
  selectedTheme: null,
  colorSchemes: [],
  baseOverride: null,
  midtoneOverrides: [],
  highlightOverride: null,
};

export function usePrimetimeState() {
  const [state, setState] = useState<PrimetimeState>(initialState);

  const setActiveStep = useCallback((step: StepId) => {
    setState(s => ({ ...s, activeStep: step }));
  }, []);

  const addImages = useCallback((files: File[], type: UploadedImage['type']) => {
    setState(s => {
      const newImages: UploadedImage[] = files.map(file => ({
        id: crypto.randomUUID(),
        objectUrl: URL.createObjectURL(file),
        type,
        file,
      }));
      return { ...s, uploadedImages: [...s.uploadedImages, ...newImages] };
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setState(s => {
      const img = s.uploadedImages.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.objectUrl);
      const uploadedImages = s.uploadedImages.filter(i => i.id !== id);
      return {
        ...s,
        uploadedImages,
        selectedImageIndex: Math.min(s.selectedImageIndex, Math.max(0, uploadedImages.length - 1)),
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

  return {
    state,
    setActiveStep,
    addImages,
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
  };
}
