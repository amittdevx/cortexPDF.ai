/**
 * Ambient module declarations for non-code imports, so the type-checker resolves
 * them independently of Expo's conditionally-generated `.expo/types` output.
 */

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
