// Rename the built index.html so Vercel can't serve it statically for "/":
// every page URL then goes through server/seo.ts, which injects the correct <head> per page.
import fs from 'node:fs';

const from = 'dist/index.html';
const to = 'dist/app-shell.html';
if (!fs.existsSync(from)) {
  console.error(`postbuild: ${from} missing`);
  process.exit(1);
}
const html = fs.readFileSync(from, 'utf8');
for (const marker of ['<!--seo:start-->', '<!--seo:end-->', '<!--ssr:noscript-->']) {
  if (!html.includes(marker)) {
    console.error(`postbuild: marker ${marker} missing from built HTML`);
    process.exit(1);
  }
}
fs.renameSync(from, to);
console.log(`postbuild: ${from} -> ${to}`);
