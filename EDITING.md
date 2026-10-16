# Editing this site

## The short version

Go to **https://<your-netlify-site>/admin**, sign in with GitHub, edit, press
Publish. The site rebuilds itself and the change is live in about a minute.

Only your GitHub account can sign in, because the editor asks GitHub whether you
have write access to this repository. There is no password stored anywhere on
the site, so there is nothing on the public page for anyone else to attack.

## What is generated and what is not

Do not hand-edit these, they are overwritten on every build:

- `notes/*.html`
- the block between `<!-- NOTES:START -->` and `<!-- NOTES:END -->` in `index.html`

Edit these instead:

- `content/notes/*.md` , one file per note
- `content/site.json` , the notes section heading and intro
- `templates/note.html` , the layout of an article page
- everything else in `index.html` , still hand-written as before

## Adding a note without the CMS

Copy any file in `content/notes/`, change the fields at the top, write the body
underneath in markdown, then run:

    npm install     # first time only
    npm run build

Set `status: published` to give it a page and make it the featured card.
`upcoming` or `queued` shows it as a placeholder card instead.

## Writing tips for the fields

- `title` , put *asterisks* around a few words to get the terracotta italic.
- `##` in the body starts a section heading.
- `>` at the start of a line becomes the green pull-quote box.
- `stats` become the four-box number grid under the opening paragraph.

## One-time setup on Netlify

1. Sign in at netlify.com with GitHub and choose **Add new site, Import an
   existing project**, then pick `chiharuma38.github.io`. Build command
   `npm run build`, publish directory `.` (both are already in `netlify.toml`).
2. On GitHub go to **Settings, Developer settings, OAuth Apps, New OAuth App**.
   Homepage URL is your Netlify address. Authorization callback URL is
   `https://api.netlify.com/auth/done`. Create it and copy the Client ID, then
   generate a Client Secret and copy that too.
3. In Netlify go to **Site configuration, Access control, OAuth, Install
   provider, GitHub** and paste the two values.
4. Visit `https://<your-netlify-site>/admin` and sign in.

Keep the Client Secret to yourself. It is the one value that must never end up
in this repository.

## Keeping the account safe

The site is only as protected as the GitHub account that can change it, so turn
on two-factor authentication at **GitHub, Settings, Password and
authentication**. That is the real lock on this door.

## Going private, in a safe order

Doing this in the wrong order takes the site offline for a while, so:

1. **Netlify first.** Set the site up while the repository is still public and
   confirm it builds and serves correctly at its netlify.app address.
2. **Custom domain second.** Buy the domain, add it under Netlify **Domain
   management**, and let the certificate issue. Confirm the site loads there.
3. **Make the repository private last.** GitHub, **Settings, General, Danger
   Zone, Change visibility**. Netlify keeps building. `chiharuma38.github.io`
   stops working at this point, so update the links on your CV and LinkedIn to
   the new domain first.

## Stop new commits leaking your email

Your history currently contains three of your addresses. Making the repository
private hides them. To keep new commits from adding more:

1. GitHub, **Settings, Emails**, tick **Keep my email addresses private** and
   copy the noreply address it shows, which looks like
   `12345678+chiharuma38@users.noreply.github.com`.
2. Then run, once:

       git config --global user.email "<that noreply address>"
       git config --global user.name "Chiharu Mamiya"

The CMS commits through GitHub directly, so anything published from `/admin`
already uses whatever address GitHub has configured.

## The weekly reading round-up (automated)

Two GitHub Actions workflows now do the mechanical work:

- `.github/workflows/build.yml` — on every push, runs `npm run build` and
  commits the generated `notes/*.html` and homepage section. This means a
  note published from `/admin` goes live on its own; no more running the
  build locally and committing the output by hand.
- `.github/workflows/weekly-draft.yml` — every Sunday morning, reads your
  public daily.dev bookmarks feed and commits a draft note
  (`content/notes/YYYY-MM-DD-reading-week.md`) with `status: queued`.
  It appears as a placeholder card, never as a live page.

Your part, once a week: open the draft in `/admin`, keep the items worth
writing about, replace each takeaway placeholder with your own thinking,
set `status: published`, and press Publish. The build workflow does the rest.

One-time setup:

1. In daily.dev: Bookmarks → enable **Public mode** and copy the RSS feed URL.
2. Paste it into `content/site.json` as the value of `"bookmarksFeed"`.

Until that URL is set, the Sunday workflow runs and does nothing. You can
also trigger it manually from the repo's Actions tab ("Run workflow"), and
`node scripts/fetch-bookmarks.js` runs the same thing locally.

## Editing the rest of the homepage from /admin

The `/admin` editor now covers most of the homepage, not just notes:

- **Bio** — the hero card's role line, short bio, the three front-of-card
  stats, and the four "hover for background" paragraphs.
- **Experience** — each role's company, title, location/dates, an accent
  colour (picked from a preset list, so the look stays consistent), and
  its bullet points. Use `**double asterisks**` to bold a phrase.
- **Earlier Projects** — a new "Projects" collection. Fill in the form,
  set status to Published, and it gets its own page (built the same way
  a note does) *and* is added to the Earlier Projects list on the
  homepage automatically. Leave status as Draft to work on it without
  publishing yet.
- **Education** — the four degree entries, as simple cards.

What's still hand-edited HTML, not yet in `/admin`:

- The five flagship "Grid engineering projects" panels (the gallery with
  the hand-picked background photos) — these were deliberately curated,
  so they're left as-is for now. Ask Claude if you'd like these made
  editable too.
- Skills and Contact sections.
- Your photo and the social links (GitHub/LinkedIn/email/CV) on the hero
  card.

Each of these lives in its own small file under `content/` (`bio.json`,
`experience.json`, `education.json`, `earlier-projects-legacy.json`, plus
`content/projects/*.md` for anything created from the new Projects
collection) if you ever want to see or edit the raw data directly instead
of going through the form.
