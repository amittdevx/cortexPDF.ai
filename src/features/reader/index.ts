/** Reader feature — public surface. */
export { useReader, ZOOM, type UseReaderResult } from './hooks/use-reader';
export { PdfViewport, type PdfViewportProps } from './components/pdf-viewport';
export { ReaderToolbar, type ReaderToolbarProps } from './components/reader-toolbar';
export { ReaderControls, type ReaderControlsProps } from './components/reader-controls';
export * as readerService from './services/reader.service';
