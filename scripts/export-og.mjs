// Renders public/img/og.jpg and og-en.jpg (the 1200x630 link previews, Dutch and English) from
// scripts/og-image.html with headless Chrome. Run after changing the template, the icon or the
// background photo: npm run export:og

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const variants = [
  { lang: 'nl', out: join(root, 'public/img/og.jpg') },
  { lang: 'en', out: join(root, 'public/img/og-en.jpg') },
];

const chrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
]
  .filter(Boolean)
  .find((path) => existsSync(path));
if (!chrome) throw new Error('Chrome not found; set CHROME_PATH.');

// A throwaway profile, so your own Chrome profile is never touched.
const profile = mkdtempSync(join(tmpdir(), 'meteo-og-'));

try {
  for (const { lang, out } of variants) {
    const template = pathToFileURL(join(root, 'scripts/og-image.html'));
    template.searchParams.set('lang', lang);
    execFileSync(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-first-run',
        '--no-default-browser-check',
        // The template loads the font, photo and icon from the repo via file:// URLs.
        '--allow-file-access-from-files',
        `--user-data-dir=${profile}`,
        '--window-size=1200,630',
        '--virtual-time-budget=5000',
        `--screenshot=${out}`,
        template.href,
      ],
      { stdio: 'ignore' }
    );
    console.log(`og  ${out}`);
  }
} finally {
  rmSync(profile, { recursive: true, force: true });
}
