import { nanoid } from 'nanoid';

export function generateSlug(coupleName: string) {
  const base = coupleName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const id = nanoid(4);

  return `${base}-${id}`;
}
