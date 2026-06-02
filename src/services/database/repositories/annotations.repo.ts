/** Annotations repository — highlights, notes, and drawings per page. */

import type { Annotation, AnnotationType } from '@/types/domain';
import { createId } from '@/utils/id';

import { getDatabase } from '../client';

interface AnnotationRow {
  id: string;
  pdf_id: string;
  page: number;
  type: string;
  data: string;
  created_at: number;
}

const toDomain = (r: AnnotationRow): Annotation => ({
  id: r.id,
  pdfId: r.pdf_id,
  page: r.page,
  type: r.type as AnnotationType,
  data: safeParse(r.data),
  createdAt: r.created_at,
});

function safeParse(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function listAnnotations(pdfId: string, page?: number): Promise<Annotation[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows =
    page === undefined
      ? await db.getAllAsync<AnnotationRow>(
          'SELECT * FROM annotations WHERE pdf_id = ? ORDER BY page ASC, created_at ASC',
          pdfId,
        )
      : await db.getAllAsync<AnnotationRow>(
          'SELECT * FROM annotations WHERE pdf_id = ? AND page = ? ORDER BY created_at ASC',
          pdfId,
          page,
        );
  return rows.map(toDomain);
}

export async function addAnnotation(
  input: Pick<Annotation, 'pdfId' | 'page' | 'type' | 'data'>,
  createdAt: number,
): Promise<Annotation> {
  const record: Annotation = { id: createId('ann'), createdAt, ...input };
  const db = await getDatabase();
  if (!db) return record;
  await db.runAsync(
    'INSERT INTO annotations (id, pdf_id, page, type, data, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    record.id,
    record.pdfId,
    record.page,
    record.type,
    JSON.stringify(record.data),
    record.createdAt,
  );
  return record;
}

export async function updateAnnotationData(
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('UPDATE annotations SET data = ? WHERE id = ?', JSON.stringify(data), id);
}

export async function removeAnnotation(id: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('DELETE FROM annotations WHERE id = ?', id);
}

/** Remove every annotation belonging to a document (cascade on file delete). */
export async function removeForPdf(pdfId: string): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('DELETE FROM annotations WHERE pdf_id = ?', pdfId);
}
