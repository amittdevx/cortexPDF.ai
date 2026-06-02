/** Drawing feature — public surface. */
export { useDrawing, type UseDrawingResult } from './hooks/use-drawing';
export { DrawingCanvas, type DrawingCanvasProps } from './components/drawing-canvas';
export {
  DrawingToolbar,
  type DrawingToolbarProps,
  PEN_COLORS,
  PEN_WIDTHS,
  HL_WIDTHS,
  widthsForTool,
} from './components/drawing-toolbar';
export { type DrawStroke, type NormPoint, type PenTool } from './services/drawing.service';
export * as drawingService from './services/drawing.service';
