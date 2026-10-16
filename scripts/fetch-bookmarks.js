#!/usr/bin/env node
/*
 * Turns this week's daily.dev bookmarks into a queued draft note.
 *
 * Reads the public bookmarks RSS feed configured as "bookmarksFeed" in
 * content/site.json, keeps the items from the last 7 days, and writes
 * content/notes/YYYY-MM-DD-reading-week.md with status "queued".
 *
 * Nothing goes live by itself: the draft appears as a placeholder card,
 * and you publish it from /admin (or your editor) after writing the
 * takeaways and setting status to "published".
 *
 * Run by .github/workflows/weekly-draft.yml every Sunday, or by hand:
 *   node scripts/fetch-bookmarks.js
 * For testing, FEED_URL can point at a local XML file:
 *   FEED_URL=/tmp/fixture.xml node scripts/fetch-bookmarks.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const p = (...a) => path.join(ROOT, ...a);

// JSON strings are valid YAML double-quoted strings, so this is a safe way
// to put arbitrary text into the frontmatter.
const yamlStr = s => JSON.stringify(String(s == null ? '' : s));

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const longDate = d => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const isoDate = d => d.toISOString().slice(0, 10);

function decode(s) {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
    .trim();
}

function parseItems(xml) {
  const items = [];
  for (const block of xml.match(/<item[\s\S]*?<\/item>/g) || []) {
    const tag = name => {
      const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
      return m ? decode(m[1]) : '';
    };
    const title = tag('title');
    const link = tag('link');
    const pub = new Date(tag('pubDate') || tag('dc:date') || '');
    if (title && link) items.push({ title, link, pub });
  }
  return items;
}

async function getFeedXml() {
  let src = process.env.FEED_URL;
  if (!src) {
    const site = JSON.parse(fs.readFileSync(p('content', 'site.json'), 'utf8'));
    src = site.bookmarksFeed;
  }
  if (!src) {
    console.log('No "bookmarksFeed" configured in content/site.json — nothing to do.');
    process.exit(0);
  }
  if (/^https?:/i.test(src)) {
    const res = await fetch(src, { headers: { 'user-agent': 'chiharuma38.github.io weekly-draft' } });
    if (!res.ok) throw new Error(`Feed fetch failed: HTTP ${res.status}`);
    return await res.text();
  }
  return fs.readFileSync(src, 'utf8'); // local file, for testing
}

async function main() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const outFile = p('content', 'notes', `${isoDate(now)}-reading-week.md`);
  if (fs.existsSync(outFile)) {
    console.log(`Draft already exists: ${path.relative(ROOT, outFile)} — leaving it alone.`);
    return;
  }

  const xml = await getFeedXml();
  const seen = new Set();
  const items = parseItems(xml)
    .filter(i => !isNaN(i.pub) && i.pub >= weekAgo && i.pub <= now)
    .filter(i => (seen.has(i.link) ? false : seen.add(i.link)))
    .sort((a, b) => b.pub - a.pub);

  if (!items.length) {
    console.log('No bookmarks from the last 7 days — no draft created.');
    return;
  }

  const fm = [
    '---',
    `title: ${yamlStr(`What I read, week of ${longDate(now)}`)}`,
    `slug: ${yamlStr(`reading-week-${isoDate(now)}`)}`,
    `date: ${isoDate(now)}`,
    'status: "queued"',
    'category: "Weekly reading"',
    `excerpt: ${yamlStr(`A round-up of the ${items.length} article${items.length === 1 ? '' : 's'} I bookmarked this week, with the takeaway from each one.`)}`,
    '---',
  ].join('\n');

  const intro = [
    'Drafted automatically from this week\'s bookmarks. Before publishing:',
    'keep the items worth writing about, delete the rest, replace each',
    'takeaway placeholder with what the piece changed about your thinking,',
    'then set `status: "published"` and adjust the title and excerpt.',
  ].join('\n');

  const sections = items.map(i => [
    `## ${i.title}`,
    '',
    `[Read the original](${i.link}) · ${longDate(i.pub)}`,
    '',
    '> Takeaway: _two or three sentences on why this mattered._',
  ].join('\n')).join('\n\n');

  fs.writeFileSync(outFile, `${fm}\n\n${intro}\n\n${sections}\n`);
  console.log(`Wrote ${path.relative(ROOT, outFile)} with ${items.length} item(s).`);
}

main().catch(err => { console.error(err.message || err); process.exit(1); });
