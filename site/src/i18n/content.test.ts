import { describe, it, expect } from 'vitest';
import { content, githubUrl, type Lang } from './content';

const langs: Lang[] = ['en', 'ja'];

describe('i18n content', () => {
  it('defines exactly the en and ja locales', () => {
    expect(Object.keys(content).sort()).toEqual(['en', 'ja']);
  });

  it('exposes a GitHub URL', () => {
    expect(githubUrl).toMatch(/^https:\/\/github\.com\/.+/);
  });

  for (const lang of langs) {
    describe(`locale: ${lang}`, () => {
      const c = content[lang];

      it('uses an htmlLang matching its key', () => {
        expect(c.htmlLang).toBe(lang);
      });

      it('has a non-empty title and description', () => {
        expect(c.title.trim().length).toBeGreaterThan(0);
        expect(c.description.trim().length).toBeGreaterThan(0);
      });

      it('gives every feature a title and body', () => {
        expect(c.features.items.length).toBeGreaterThan(0);
        for (const feature of c.features.items) {
          expect(feature.title.trim()).not.toBe('');
          expect(feature.body.trim()).not.toBe('');
        }
      });

      it('gives every FAQ entry a question and answer', () => {
        expect(c.faq.items.length).toBeGreaterThan(0);
        for (const entry of c.faq.items) {
          expect(entry.q.trim()).not.toBe('');
          expect(entry.a.trim()).not.toBe('');
        }
      });

      it('keeps comparison rows aligned with the data columns', () => {
        const dataColumns = c.compare.cols.length - 1; // first column is the row label
        expect(dataColumns).toBeGreaterThan(0);
        for (const row of c.compare.rows) {
          expect(row.cells).toHaveLength(dataColumns);
        }
      });
    });
  }

  it('keeps en and ja structurally in sync', () => {
    expect(content.en.features.items).toHaveLength(content.ja.features.items.length);
    expect(content.en.faq.items).toHaveLength(content.ja.faq.items.length);
    expect(content.en.compare.rows).toHaveLength(content.ja.compare.rows.length);
    expect(content.en.examples.items).toHaveLength(content.ja.examples.items.length);
    expect(content.en.compare.cols).toHaveLength(content.ja.compare.cols.length);
  });
});
