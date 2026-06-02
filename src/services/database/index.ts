/**
 * Database service — centralized SQLite persistence (recents, bookmarks,
 * summaries, annotations). Repositories are the only code that touches SQL;
 * features import them through this barrel.
 */

export { getDatabase, initDatabase } from './client';

export * as recentsRepo from './repositories/recents.repo';
export * as bookmarksRepo from './repositories/bookmarks.repo';
export * as summariesRepo from './repositories/summaries.repo';
export * as annotationsRepo from './repositories/annotations.repo';
export * as pageTextRepo from './repositories/page-text.repo';
export * as aiResultsRepo from './repositories/ai-results.repo';
