import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import proxy from '@/proxy';

function request(path: string, accept?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: accept ? { accept } : {},
  });
}

function rewrittenPath(res: Response) {
  const target = res.headers.get('x-middleware-rewrite');
  return target ? new URL(target).pathname : null;
}

const browserAccept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

describe('proxy', () => {
  it('serves HTML to browsers', () => {
    const res = proxy(request('/docs/rag', browserAccept));
    expect(rewrittenPath(res)).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('serves markdown for the .md suffix', () => {
    expect(rewrittenPath(proxy(request('/docs/rag.md')))).toBe('/llms.mdx/docs/rag/content.md');
  });

  it('serves markdown for the root page .md suffix', () => {
    expect(rewrittenPath(proxy(request('/docs.md')))).toBe('/llms.mdx/docs/content.md');
  });

  it('serves markdown on the same URL when Accept prefers it', () => {
    const res = proxy(request('/docs/rag', 'text/markdown'));
    expect(rewrittenPath(res)).toBe('/llms.mdx/docs/rag/content.md');
    expect(res.headers.get('vary')).toContain('Accept');
  });

  it('leaves non-docs routes alone', () => {
    const res = proxy(request('/llms.txt', 'text/markdown'));
    expect(rewrittenPath(res)).toBeNull();
  });
});
