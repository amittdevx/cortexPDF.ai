/** Layout constants shared across screens. */

import { Platform } from 'react-native';

/** Reserved space at the bottom for the native tab bar. */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** Maximum readable content width (keeps wide/web layouts comfortable). */
export const MaxContentWidth = 800;

/** Standard horizontal screen padding. */
export const ScreenPadding = 20;
