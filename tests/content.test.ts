import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const contentDir = join(__dirname, '..', 'content', 'docs');

const pages = readdirSync(contentDir, { recursive: true, encoding: 'utf8' }).filter((file) =>
  file.endsWith('.mdx'),
);

function frontmatter(source: string) {
  const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  return Object.fromEntries(
    block.split('\n').map((line) => {
      const [key, ...rest] = line.split(':');
      return [key.trim(), rest.join(':').trim()];
    }),
  );
}

describe('content', () => {
  it('has pages', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  // llms.txt and the sidebar both rely on title and description
  it.each(pages)('%s has title and description', (file) => {
    const meta = frontmatter(readFileSync(join(contentDir, file), 'utf8'));
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });
});
