#!/usr/bin/env node
/*
 * Rebuilds the notes pages and the homepage notes section from the files in
 * content/. Run "npm run build" locally, or let Netlify run it on every commit.
 * Nothing here is edited by hand: change content/notes/*.md instead.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');
const p = (...a) => path.join(ROOT, ...a);
const read = f => fs.readFileSync(f, 'utf8');

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// *word* in a title becomes the terracotta italic used across the site
const titleHtml = t => esc(t).replace(/\*(.+?)\*/g, '<em>$1</em>');
const titlePlain = t => String(t || '').replace(/\*/g, '');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function longDate(d) {
  const dt = (d instanceof Date) ? d : new Date(String(d));
  if (isNaN(dt)) return String(d || '');
  return `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}
function shortDate(d) {
  const dt = (d instanceof Date) ? d : new Date(String(d));
  if (isNaN(dt)) return String(d || '');
  return `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()].slice(0,3)} ${dt.getUTCFullYear()}`;
}

const TAG_COLOURS = ['terra', 'sage', 'sky', ''];

function renderBody(md) {
  let html = marked.parse(md || '', { mangle: false, headerIds: false });
  // blockquotes become the site's pull-quote block
  html = html.replace(/<blockquote>\s*([\s\S]*?)\s*<\/blockquote>/g,
    (_, inner) => `<div class="pull">${inner.trim()}</div>`);
  return html.trim();
}

function buildNotePage(note) {
  let tpl = read(p('templates', 'note.html'));
  const f = note.data;

  const eyebrow = `Note ${String(note.index).padStart(2, '0')} · Reading log`;

  const readingTime = f.readingTime
    ? `<span class="dot">·</span><span>${esc(f.readingTime)}</span>` : '';

  const sourceBlock = f.sourceTitle ? `
  <div class="source-box">
    <div class="source-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4714A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    </div>
    <div>
      <div class="source-label">The article I read</div>
      <div class="source-title">${esc(f.sourceTitle)}</div>
      <div class="source-meta">${[f.sourceAuthor, f.sourcePublication, f.sourceDate].filter(Boolean).map(esc).join(' · ')}${f.sourceUrl ? ` · <a href="${esc(f.sourceUrl)}" target="_blank" rel="noopener">Read the original</a>` : ''}</div>
    </div>
  </div>` : '';

  const tags = (f.tags && f.tags.length) ? `
  <div class="tags">
${f.tags.map((t, i) => `    <span class="tag ${TAG_COLOURS[i % TAG_COLOURS.length]}">${esc(t)}</span>`).join('\n')}
  </div>` : '';

  const lede = f.lede ? `  <p class="lede">${esc(f.lede)}</p>` : '';

  const stats = (f.stats && f.stats.length) ? `  <div class="stat-grid">
${f.stats.map(s => `    <div class="stat"><div class="stat-num">${esc(s.num)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join('\n')}
  </div>` : '';

  const readingNext = (f.readingNext && f.readingNext.length) ? `  <div class="link-out">
    <div class="link-out-label">What I'm reading next on this</div>
    <ul>
${f.readingNext.map(r => `      <li>${esc(r)}</li>`).join('\n')}
    </ul>
  </div>` : '';

  const sourceButton = f.sourceUrl
    ? `    <a href="${esc(f.sourceUrl)}" class="btn-solid" target="_blank" rel="noopener">Read the original article</a>` : '';

  const map = {
    TITLE_PLAIN: esc(titlePlain(f.title)),
    TITLE_HTML: titleHtml(f.title),
    EXCERPT: esc(f.excerpt),
    EYEBROW: esc(eyebrow),
    DATE_LONG: esc(longDate(f.date)),
    READING_TIME: readingTime,
    SOURCE_BLOCK: sourceBlock,
    TAGS: tags,
    LEDE: lede,
    STATS: stats,
    BODY: renderBody(note.content),
    READING_NEXT: readingNext,
    SOURCE_BUTTON: sourceButton,
  };
  for (const [k, v] of Object.entries(map)) {
    tpl = tpl.split(`{{${k}}}`).join(v);
  }
  return tpl;
}

function featuredCard(note) {
  const f = note.data;
  const img = f.image
    ? `linear-gradient(160deg,rgba(31,77,74,.15),rgba(14,42,54,.35)),url('${esc(f.image)}')`
    : `linear-gradient(160deg,#1f4d4a,#0e2a36)`;
  const meta = [shortDate(f.date), f.readingTime, f.category].filter(Boolean).map(esc).join(' · ');
  const src = f.sourceTitle
    ? `        <div class="note-src">On: ${esc(f.sourceAuthor || '')}${f.sourceAuthor ? ', ' : ''}<em>${esc(f.sourceTitle)}</em>${f.sourcePublication ? ` · ${esc(f.sourcePublication)}` : ''}${f.sourceDate ? `, ${esc(f.sourceDate)}` : ''}</div>\n` : '';
  return `    <a class="note-feature" href="notes/${esc(f.slug)}.html">
      <div class="note-feature-img" style="background-image:${img}">
        <span class="note-badge">Latest</span>
        <span class="note-issue">${String(note.index).padStart(2, '0')}<span>Note</span></span>
      </div>
      <div class="note-feature-body">
        <div class="note-meta">${meta}</div>
        <h3 class="note-title">${titleHtml(f.title)}</h3>
        <p class="note-excerpt">${esc(f.excerpt)}</p>
${src}        <span class="note-cta">Read the note <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </div>
    </a>`;
}

function smallCard(note) {
  const f = note.data;
  const published = f.status === 'published';
  const label = `Note ${String(note.index).padStart(2, '0')}${f.category ? ` · ${f.category}` : ''}`;
  const inner = `        <div class="note-meta">${esc(label)}</div>
        <div class="note-card-title">${titleHtml(f.title)}</div>
        <div class="note-card-desc">${esc(f.excerpt)}</div>`;
  return published
    ? `      <a class="note-card is-live" href="notes/${esc(f.slug)}.html">\n${inner}\n      </a>`
    : `      <div class="note-card">\n${inner}\n      </div>`;
}

function main() {
  const dir = p('content', 'notes');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  let notes = files.map(f => {
    const g = matter(read(path.join(dir, f)));
    return { file: f, data: g.data, content: g.content };
  });

  // oldest first gives stable note numbers that never shift as new notes land
  notes.sort((a, b) => new Date(a.data.date) - new Date(b.data.date));
  notes.forEach((n, i) => { n.index = i + 1; });

  const published = notes.filter(n => n.data.status === 'published')
    .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  const pending = notes.filter(n => n.data.status !== 'published')
    .sort((a, b) => new Date(a.data.date) - new Date(b.data.date));

  // 1. one HTML page per published note
  fs.mkdirSync(p('notes'), { recursive: true });
  let written = 0;
  for (const n of published) {
    if (!n.data.slug) { console.warn(`  skipped ${n.file}: no slug`); continue; }
    fs.writeFileSync(p('notes', `${n.data.slug}.html`), buildNotePage(n));
    console.log(`  page   notes/${n.data.slug}.html`);
    written++;
  }

  // 2. the homepage section, between the markers in index.html
  const site = JSON.parse(read(p('content', 'site.json')));
  const featured = published[0];
  const rest = published.slice(1).concat(pending).slice(0, 2);

  const section = [
    `  <div class="section-header">`,
    `    <div class="section-eyebrow">${esc(site.notesEyebrow)}</div>`,
    `    <h2>${esc(site.notesHeading)}</h2>`,
    `    <p class="section-sub">${esc(site.notesIntro)}</p>`,
    `  </div>`,
    ``,
    `  <div class="notes-wrap">`,
    featured ? featuredCard(featured) : '',
    rest.length ? `\n    <div class="note-grid">\n${rest.map(smallCard).join('\n')}\n    </div>` : '',
    `  </div>`,
  ].filter(Boolean).join('\n');

  const idx = p('index.html');
  const html = read(idx);
  const START = '<!-- NOTES:START (generated by scripts/build.js, do not edit by hand) -->';
  const END = '<!-- NOTES:END -->';
  const a = html.indexOf(START), b = html.indexOf(END);
  if (a === -1 || b === -1) {
    console.error('\nERROR: could not find the NOTES:START / NOTES:END markers in index.html.');
    process.exit(1);
  }
  const out = html.slice(0, a + START.length) + '\n' + section + '\n  ' + html.slice(b);
  fs.writeFileSync(idx, out);
  console.log(`  page   index.html (notes section)`);
  console.log(`\nBuilt ${written} note page(s), ${pending.length} upcoming.`);
}

main();
