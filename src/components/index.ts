/**
 * Components barrel — the public UI kit. Import primitives from here:
 *   import { Screen, Text, Button, Surface } from '@/components';
 */

// common
export { Text, type AppTextProps } from './common/text';
export { Icon, type IconName, type IconProps } from './common/icon';
export { Surface, type SurfaceProps } from './common/surface';
export { Glass, type GlassProps, type GlassVariant } from './common/glass';
export { AuroraBackground, type AuroraBackgroundProps } from './common/aurora-background';
export {
  GradientView,
  type GradientViewProps,
  GradientMedallion,
  type GradientMedallionProps,
  GradientThumb,
  type GradientThumbProps,
  gradientForSeed,
} from './common/gradient';
export { Screen, type ScreenProps } from './common/screen';
export { ScreenHeader, type ScreenHeaderProps } from './common/screen-header';
export {
  useScrollHeader,
  LargeTitleHeader,
  type LargeTitleHeaderProps,
  CollapsingHeaderBar,
  type CollapsingHeaderBarProps,
} from './common/parallax-header';
export { EmptyState, type EmptyStateProps } from './common/empty-state';
export { Skeleton, type SkeletonProps } from './common/skeleton';
export { Divider } from './common/divider';
export { SearchBar, type SearchBarProps } from './common/search-bar';
export { BottomSheet, type BottomSheetProps } from './common/bottom-sheet';
export {
  SegmentedControl,
  type SegmentedControlProps,
  type Segment,
} from './common/segmented-control';
export { SettingRow, type SettingRowProps } from './common/setting-row';
export { ErrorBoundary } from './common/error-boundary';

// buttons
export { Button, type ButtonProps } from './buttons/button';
export { IconButton, type IconButtonProps } from './buttons/icon-button';

// animations
export { PressScale, type PressScaleProps } from './animations/press-scale';
export { FadeIn, type FadeInProps } from './animations/fade-in';
