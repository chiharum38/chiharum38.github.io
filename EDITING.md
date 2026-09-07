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
