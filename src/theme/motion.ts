/**
 * Motion tokens — durations, easings, and Reanimated spring presets.
 *
 * Animation philosophy: "felt, not noticed." Springs are the default; durations
 * are short. Centralizing these keeps every transition in the app coherent.
 */

import { Easing } from 'react-native-reanimated';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/** Timing durations (ms). */
export const Duration = {
  instant: 90,
  fast: 160,
  base: 240,
  slow: 360,
  lazy: 520,
} as const;

/** Reusable easing curves. */
export const Easings = {
  standard: Easing.bezier(0.2, 0.0, 0.0, 1.0),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
  emphasized: Easing.bezier(0.2, 0.0, 0.0, 1.0),
} as const;

/** Spring presets tuned for different "weights" of motion. */
export const Springs = {
  /** Snappy — small UI feedback (button press, toggles). */
  snappy: { damping: 26, stiffness: 320, mass: 0.7 } satisfies WithSpringConfig,
  /** Gentle — the default for entrances and layout shifts. */
  gentle: { damping: 22, stiffness: 180, mass: 0.9 } satisfies WithSpringConfig,
  /** Bouncy — playful accents, used sparingly. */
  bouncy: { damping: 14, stiffness: 200, mass: 0.9 } satisfies WithSpringConfig,
  /** Smooth — large surfaces like sheets gliding in. */
  smooth: { damping: 30, stiffness: 220, mass: 1 } satisfies WithSpringConfig,
} as const;

/** Timing presets pairing a duration with an easing. */
export const Timings = {
  fade: { duration: Duration.base, easing: Easings.standard } satisfies WithTimingConfig,
  fast: { duration: Duration.fast, easing: Easings.decelerate } satisfies WithTimingConfig,
  slow: { duration: Duration.slow, easing: Easings.emphasized } satisfies WithTimingConfig,
} as const;

/** Standard press-scale used by interactive surfaces. */
export const PressScale = {
  card: 0.97,
  button: 0.96,
  icon: 0.9,
} as const;

/** Entrance settle: scale grows from this to 1 (no vertical travel → no "jump"). */
export const EntranceScaleFrom = 0.96;
