/**
 * DrawingCanvas — the freehand drawing surface, backed by react-native-skia. A
 * full-bleed overlay that captures a single-finger pan into a live stroke and a
 * two-finger pinch to zoom; committed strokes render beneath. Strokes are stored
 * NORMALIZED (0..1) in the page's own (un-zoomed) space, and both the live + saved
 * strokes render inside a center-anchored zoom transform so they track the PDF as
 * it zooms (the PDF zoom is driven by the same pinch via onZoomChange).
 *
 * Requires a dev build (native Skia module) — does NOT run in Expo Go.
 *
 * NOTE (v1): zoom is center-anchored to match rn-pdf's pinch; the overlay can't read
 * the exact rendered page rect, so very high zoom may drift slightly — tune on device.
 */

import { Canvas, Group, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import { useMemo, useReducer, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import type { DrawStroke, NormPoint, PenTool } from '../services/drawing.service';

interface PxPoint {
  x: number;
  y: number;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

export interface DrawingCanvasProps {
  strokes: DrawStroke[];
  /** Active tool (pen vs marker) — styles the live stroke. */
  tool: PenTool;
  /** Active pen color (hex). */
  color: string;
  /** Active stroke width as a fraction of surface width. */
  width: number;
  /** Current zoom — strokes render at this scale to track the page. */
  zoom: number;
  /** Report a pinch zoom so the PDF underneath zooms in step. */
  onZoomChange: (zoom: number) => void;
  /** Called with a finished stroke, points normalized to 0..1. */
  onCommit: (stroke: Omit<DrawStroke, 'id'>) => void;
  /** Display committed strokes only — no gestures, lets touches pass through. */
  readOnly?: boolean;
}

function pathFromPx(points: PxPoint[]): SkPath {
  const path = Skia.Path.Make();
  if (points.length > 0) {
    path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) path.lineTo(points[i].x, points[i].y);
  }
  return path;
}

const isHighlighter = (tool: PenTool) => tool === 'highlighter';

export function DrawingCanvas({
  strokes,
  tool,
  color,
  width,
  zoom,
  onZoomChange,
  onCommit,
  readOnly = false,
}: DrawingCanvasProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const livePoints = useRef<PxPoint[]>([]); // stored in page (un-zoomed) space
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const pinchStart = useRef(zoom);

  // Screen pixel → page (un-zoomed) space, inverse of the center-anchored zoom.
  const toPage = (x: number, y: number): PxPoint => {
    const z = zoomRef.current || 1;
    const cx = size.w / 2;
    const cy = size.h / 2;
    return { x: cx + (x - cx) / z, y: cy + (y - cy) / z };
  };

  const begin = (x: number, y: number) => {
    livePoints.current = [toPage(x, y)];
    redraw();
  };
  const extend = (x: number, y: number) => {
    livePoints.current.push(toPage(x, y));
    redraw();
  };
  const finish = () => {
    const pts = livePoints.current;
    if (pts.length > 1 && size.w > 0 && size.h > 0) {
      const points: NormPoint[] = pts.map((p) => ({ x: p.x / size.w, y: p.y / size.h }));
      onCommit({ tool, color, width, points });
    }
    livePoints.current = [];
    redraw();
  };

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(0)
      .maxPointers(1)
      .onBegin((e) => {
        'worklet';
        runOnJS(begin)(e.x, e.y);
      })
      .onUpdate((e) => {
        'worklet';
        runOnJS(extend)(e.x, e.y);
      })
      .onEnd(() => {
        'worklet';
        runOnJS(finish)();
      });

    const pinch = Gesture.Pinch()
      .onBegin(() => {
        'worklet';
        runOnJS(captureZoomStart)();
      })
      .onUpdate((e) => {
        'worklet';
        runOnJS(applyPinch)(e.scale);
      });

    return Gesture.Simultaneous(pan, pinch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, color, width, size.w, size.h]);

  function captureZoomStart() {
    pinchStart.current = zoomRef.current;
  }
  function applyPinch(scale: number) {
    onZoomChange(clampZoom(pinchStart.current * scale));
  }

  const committed = useMemo(() => {
    if (size.w === 0) return [];
    return strokes.map((s) => ({
      id: s.id,
      tool: s.tool,
      color: s.color,
      strokeWidth: Math.max(1, s.width * size.w),
      path: pathFromPx(s.points.map((p) => ({ x: p.x * size.w, y: p.y * size.h }))),
    }));
  }, [strokes, size.w, size.h]);

  const liveStrokeWidth = Math.max(1, width * size.w);
  const live = isHighlighter(tool);
  const cx = size.w / 2;
  const cy = size.h / 2;
  const transform = [
    { translateX: cx },
    { translateY: cy },
    { scale: zoom },
    { translateX: -cx },
    { translateY: -cy },
  ];

  const canvas = (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group transform={transform}>
        {committed.map((s) => {
          const hl = isHighlighter(s.tool);
          return (
            <Path
              key={s.id}
              path={s.path}
              color={s.color}
              style="stroke"
              strokeWidth={s.strokeWidth}
              strokeCap={hl ? 'square' : 'round'}
              strokeJoin="round"
              opacity={hl ? 0.32 : 1}
              blendMode={hl ? 'multiply' : 'srcOver'}
            />
          );
        })}
        {!readOnly && livePoints.current.length > 0 ? (
          <Path
            path={pathFromPx(livePoints.current)}
            color={color}
            style="stroke"
            strokeWidth={liveStrokeWidth}
            strokeCap={live ? 'square' : 'round'}
            strokeJoin="round"
            opacity={live ? 0.32 : 1}
            blendMode={live ? 'multiply' : 'srcOver'}
          />
        ) : null}
      </Group>
    </Canvas>
  );

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={readOnly ? 'none' : 'auto'}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {readOnly ? canvas : <GestureDetector gesture={gesture}>{canvas}</GestureDetector>}
    </View>
  );
}
