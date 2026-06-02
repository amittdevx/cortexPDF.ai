/**
 * DrawingCanvas — the freehand drawing surface, backed by react-native-skia. A
 * full-bleed overlay that captures a single-finger pan (react-native-gesture-
 * handler) into a live stroke and renders committed strokes beneath it. Strokes
 * arrive/leave NORMALIZED (0..1) via props; this component converts to/from pixels
 * using its measured size, so the same data renders correctly at any device size.
 *
 * Requires a dev build (native Skia module) — does NOT run in Expo Go.
 *
 * NOTE (v1): coordinate accuracy is relative to THIS overlay, not the rendered PDF
 * page rect (rn-pdf doesn't expose it). The reader freezes the page while drawing
 * so the mapping is stable; fine-tuning to the exact page bounds is a follow-up.
 */

import { Canvas, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import { useMemo, useReducer, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import type { DrawStroke, NormPoint, PenTool } from '../services/drawing.service';

interface PxPoint {
  x: number;
  y: number;
}

export interface DrawingCanvasProps {
  strokes: DrawStroke[];
  /** Active tool (pen vs marker) — styles the live stroke. */
  tool: PenTool;
  /** Active pen color (hex). */
  color: string;
  /** Active stroke width as a fraction of surface width. */
  width: number;
  /** Called with a finished stroke, points normalized to 0..1. */
  onCommit: (stroke: Omit<DrawStroke, 'id'>) => void;
}

function pathFromPx(points: PxPoint[]): SkPath {
  const path = Skia.Path.Make();
  if (points.length > 0) {
    path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) path.lineTo(points[i].x, points[i].y);
  }
  return path;
}

/** Marker ink is translucent and multiplies so text underneath stays legible. */
const isHighlighter = (tool: PenTool) => tool === 'highlighter';

export function DrawingCanvas({ strokes, tool, color, width, onCommit }: DrawingCanvasProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const livePoints = useRef<PxPoint[]>([]);
  const [, redraw] = useReducer((n: number) => n + 1, 0);

  const begin = (x: number, y: number) => {
    livePoints.current = [{ x, y }];
    redraw();
  };
  const extend = (x: number, y: number) => {
    livePoints.current.push({ x, y });
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

  const pan = useMemo(
    () =>
      Gesture.Pan()
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
        }),
    // begin/extend/finish are stable closures over refs + current tool/color/width.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool, color, width, size.w, size.h],
  );

  // Pre-build committed stroke paths (px) — only when strokes or size change.
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

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) =>
        setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }>
      <GestureDetector gesture={pan}>
        <Canvas style={StyleSheet.absoluteFill}>
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
          {livePoints.current.length > 0 ? (
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
        </Canvas>
      </GestureDetector>
    </View>
  );
}
